import { PolygonLayer, RasterLayer, Scene, Source } from '@antv/l7';
import { Button, message, Radio, Spin } from 'antd';
import React, { useEffect } from 'react';
// @ts-ignore
import { AIESEG, tiles2Image } from '@antv/sam';
// @ts-ignore
import { Map } from '@antv/l7-maps';

import { useSetState } from 'ahooks';
// import { EMBEDDING_URL } from '../../config';
import { ISamState } from '../../typing';
import {
  // googleSatellite,
  gaode_satellite,
  locations,
  Model_URL,
  selectionType,
} from '../constant';
import './index.less';
import { RightPanel } from './leftpanel';

const initState = {
  samModel: null,
  currentScene: null,
  currentSource: null,
  mapClick: null,
  loading: false,
  borderLayer: null,
  eventType: 'click',
  collapsed: true,
  satelliteData: [],
};

export default () => {
  const mapZoom: number = 17;
  const [samInfo, setSamState] = useSetState<ISamState>(initState);

  const onLocationChange = (item) => {
    const coord = locations.find((l) => l.name === item.target.value);
    if (coord)
      samInfo.currentScene?.setCenter(coord!.coord as [number, number]);
    samInfo.currentScene?.setZoom((coord!.zoom as number) || 17);
  };

  const onMapClick = (e) => {
    const isArray = Array.isArray(e);
    const coords = !isArray ? [e.lngLat.lng, e.lngLat.lat] : e;
    setSamState({
      mapClick: coords,
    });
  };

  // 生成 embedding 并初始化载入模型
  const generateEmbedding = async () => {
    setSamState({ loading: true });
    const tiles = samInfo.currentSource?.tileset?.currentTiles;
    const zoom = Math.ceil(samInfo.currentScene?.getZoom() as number);

    const mergeImage = tiles2Image(tiles, zoom);

    // downLoadCanvas(canvas);

    // 设置模型的图片
    samInfo.samModel.setGeoImage(mergeImage.imageBase64, {
      extent: mergeImage.extent,
      width: mergeImage.width,
      height: mergeImage.height,
    });

    const targetInfo = await samInfo.samModel.generateEmbedding();

    // SAM embedding
    // const embeddingUrl = targetInfo.imgProcess.process;
    // const resEmbedding = await (await fetch(embeddingUrl)).arrayBuffer();
    // await samModel.setEmbedding(resEmbedding);

    console.log(targetInfo);
    // samInfo.samModel.setEmbedding(res);
    // setSamState({ loading: false });
    message.success('embedding计算完成');
  };

  // 地图点击
  useEffect(() => {
    if (!samInfo.mapClick || !samInfo.samModel) return;
    const points: Array<any> = [];
    try {
      const coord = samInfo.mapClick;
      if (samInfo.eventType === 'click') {
        const px = samInfo.samModel.lngLat2ImagePixel(coord);
        points.push({
          x: px[0],
          y: px[1],
          clickType: 1,
        });
      } else if (samInfo.eventType === 'selectend') {
        const topLeft = samInfo.samModel.lngLat2ImagePixel([
          coord[0],
          coord[3],
        ]);
        const bottomRight = samInfo.samModel.lngLat2ImagePixel([
          coord[2],
          coord[1],
        ]);
        points.push({
          x: topLeft[0],
          y: topLeft[1],
          clickType: 2,
        });
        points.push({
          x: bottomRight[0],
          y: bottomRight[1],
          clickType: 3,
        });
      } else if (samInfo.eventType === 'all') {
        console.log(
          samInfo.samModel.image.width,
          samInfo.samModel.image.height,
        );
      }

      if (points.length === 0) return;
      samInfo.samModel.predict(points).then(async (res) => {
        const polygon = await samInfo.samModel.exportGeoPolygon(res, 1);
        const image = samInfo.samModel.exportImageClip(res);

        const newData = {
          features: polygon.features,
          imageUrl: image.src,
        };
        setSamState((pre) => {
          const hasData = pre.satelliteData.find(
            (item) => item.imageUrl === newData.imageUrl,
          );
          if (hasData) {
            return { satelliteData: [...pre.satelliteData] };
          }
          return {
            satelliteData: [...pre.satelliteData, newData],
          };
        });
      });
    } catch (error) {
      message.error('请先点击[生成 embedding] 按钮');
    }
  }, [samInfo.mapClick]);
  // 地图可视化
  useEffect(() => {
    if (samInfo.borderLayer) {
      const newFeature = samInfo.satelliteData.map((item) => item.features);
      const newPolygon = {
        type: 'FeatureCollection',
        features: newFeature.flat(),
      };
      samInfo.borderLayer.setData(newPolygon);
    }
  }, [samInfo.borderLayer, samInfo.satelliteData]);

  // 初始化地图
  useEffect(() => {
    const scene = new Scene({
      id: 'map',
      map: new Map({
        center: [120.10533489408249, 30.261061158180482],
        zoom: mapZoom,
        minZoom: 3,
        style: 'blank',
      }),
    });

    const layerSource = new Source(gaode_satellite, {
      parser: {
        type: 'rasterTile',
        tileSize: 256,
      },
    });
    const layer1 = new RasterLayer({
      zIndex: -2,
    }).source(layerSource);

    const boundsLayer = new PolygonLayer({
      zIndex: 10,
    })
      .source({
        type: 'FeatureCollection',
        features: [],
      })
      .shape('line')
      .size(2)
      .color('#f00')
      .style({
        opacity: 1,
      });

    scene.on('loaded', () => {
      scene.addLayer(layer1);
      scene.addLayer(boundsLayer);
      setSamState({
        borderLayer: boundsLayer,
        currentScene: scene,
        currentSource: layerSource,
      });
      scene.on('click', onMapClick);
      scene.on('selectend', onMapClick);
    });
  }, []);

  useEffect(() => {
    if (samInfo.eventType === 'selectend' && samInfo.currentScene) {
      samInfo.currentScene.enableBoxSelect(false);
    } else if (samInfo.currentScene) {
      samInfo.currentScene.disableBoxSelect();
    }
  }, [samInfo.eventType]);

  // 初始化模型

  useEffect(() => {
    const sam = new AIESEG({
      modelUrl: Model_URL,
    });
    sam.initModel().then(() => {
      setSamState({ samModel: sam });
      console.log('模型初始化完成');
    });
  }, []);

  return (
    <>
      <Button onClick={generateEmbedding}> 生成 embedding </Button>
      <Radio.Group
        style={{ margin: '15px' }}
        onChange={onLocationChange}
        defaultValue="A 空间"
        buttonStyle="solid"
      >
        {locations.map((item) => {
          return (
            <Radio.Button key={item.name} value={item.name}>
              {item.name}
            </Radio.Button>
          );
        })}
      </Radio.Group>
      <Spin spinning={samInfo.loading} tip={'embedding 生成中……'}>
        <div className="mapContainer">
          <div
            id="map"
            className="mapContainer__map"
            style={{ width: `calc(100vw - ${!samInfo.collapsed ? 0 : 400}px)` }}
          >
            <Radio.Group
              style={{ position: 'absolute', top: 15, left: 15, zIndex: 100 }}
              onChange={(event) => {
                setSamState({ eventType: event.target.value });
              }}
              value={samInfo.eventType}
              size="small"
              buttonStyle="solid"
            >
              {selectionType.map((item) => {
                return (
                  <Radio.Button
                    key={item.value}
                    value={item.value}
                    // disabled={item?.disable}
                  >
                    {item.label}
                  </Radio.Button>
                );
              })}
            </Radio.Group>
          </div>
          <RightPanel samInfo={samInfo} setSamState={setSamState} />
        </div>
      </Spin>
    </>
  );
};
