import {
  ILayer,
  ISource,
  PolygonLayer,
  RasterLayer,
  Scene,
  Source,
} from '@antv/l7';
import { Button, message, Radio, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { SAMGeo } from 'sam.js';

// @ts-ignore
import { Map } from '@antv/l7-maps';

import { EMBEDDING_URL } from '../config';
const MODEL_DIR = '../model/sam_onnx_example.onnx';

export default () => {
  const mapZoom: number = 17;
  const [samModel, setSamModel] = useState<SAMGeo>(null);
  const [currentScene, setScene] = useState<Scene>();
  const [currentSource, setSource] = useState<ISource>();
  const [mapClick, setMapClick] = useState<any>(null); // Array of clicks
  const [loading, setLoading] = useState<boolean>(false);
  const [borderLayer, setBorderLayer] = useState<ILayer>();

  const locations = [
    {
      name: 'A 空间',
      coord: [120.10533489408249, 30.261061158180482],
      zoom: 18,
    },
    {
      name: '油罐',
      coord: [-96.74674229210954, 35.935326263559816],
      zoom: 15.5,
    },
    {
      name: '农田',
      coord: [5.000138834496795, 52.83911856295691],
      zoom: 13.5,
    },
    {
      name: '农田2',
      coord: [-111.91603037093357, 32.91837220530866],
      zoom: 13,
    },
    {
      name: '灌溉农田',
      coord: [38.274419546979345, 30.107721922396593],
      zoom: 12.5,
    },
    {
      name: '建筑',
      coord: [-75.68709358840009, 45.40821167856009],
      zoom: 18,
    },
    {
      name: '建筑2',
      coord: [-117.9375255130447, 33.809435077864805],
      zoom: 18.2,
    },
    {
      name: '机场',
      coord: [-117.377, 34.596],
      zoom: 15.5,
    },
    {
      name: '草场',
      coord: [28.725760156128445, 22.24767189005027],
      zoom: 12,
    },
  ];
  const onLocationChange = (item) => {
    const coord = locations.find((l) => l.name === item.target.value);
    if (coord) currentScene?.setCenter(coord!.coord as [number, number]);
    currentScene?.setZoom((coord!.zoom as number) || 17);
  };
  // 生成 embedding 并初始化载入模型
  const generateEmbedding = async () => {
    setLoading(true);
    const tiles = currentSource?.tileset?.currentTiles;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    tiles?.forEach((tile: { x: number; y: number; z: number }) => {
      minX = Math.min(minX, tile.x);
      minY = Math.min(minY, tile.y);
      maxX = Math.max(maxX, tile.x);
      maxY = Math.max(maxY, tile.y);
    });
    const zoom = Math.ceil(currentScene?.getZoom() as number);

    const canvas = document.createElement('canvas');
    canvas.width = (maxX - minX + 1) * 256;
    canvas.height = (maxY - minY + 1) * 256;
    const ctx = canvas.getContext('2d')!;
    const tileHelper = samModel.tileHelper;
    const imageExtent = [
      ...tileHelper.tileToLngLat(minX, maxY + 1, zoom),
      ...tileHelper.tileToLngLat(maxX + 1, minY, zoom),
    ];

    // Draw each tile on the canvas

    tiles?.forEach((tile: any) => {
      if (tile) {
        ctx?.drawImage(
          tile.data,
          (tile.x - minX) * 256,
          (tile.y - minY) * 256,
          256,
          256,
        );
      }
    });

    // 设置模型的图片
    samModel.setGeoImage(canvas.toDataURL(), {
      extent: imageExtent,
      width: canvas.width,
      height: canvas.height,
    });

    // 生成 embedding
    canvas.toBlob(async (blob) => {
      const action = EMBEDDING_URL;
      const formData = new FormData();
      formData.append('file', blob as Blob);
      const res = await (
        await fetch(action, {
          body: formData,
          method: 'POST',
        })
      ).arrayBuffer();
      samModel.setEmbedding(res);
      setLoading(false);
      message.success('embedding计算完成');
    });
  };

  // 地图点击

  useEffect(() => {
    if (!mapClick) return;
    const px = samModel.lngLat2ImagePixel(mapClick);
    const points = [
      {
        x: px[0],
        y: px[1],
        clickType: 1,
      },
    ];
    samModel.predictByPoints(points).then(async (res) => {
      const polygon = await samModel.exportGeoPolygon(res, 1);
      borderLayer?.setData(polygon);
    });
  }, [mapClick]);

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

    const googleSatellite =
      'https://www.google.com/maps/vt?lyrs=s@820&gl=cn&x={x}&y={y}&z={z}';
    const annotion =
      'https://t{0-7}.tianditu.gov.cn/DataServer?T=cia_w&X={x}&Y={y}&L={z}&tk=b72aa81ac2b3cae941d1eb213499e15e';
    const layerSource = new Source(googleSatellite, {
      parser: {
        type: 'rasterTile',
        tileSize: 256,
      },
    });
    const layer1 = new RasterLayer({
      zIndex: -2,
    }).source(layerSource);

    const layer2 = new RasterLayer({
      zIndex: -1,
    }).source(annotion, {
      parser: {
        type: 'rasterTile',
        tileSize: 256,
        zoomOffset: 0,
      },
    });

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
      setScene(scene);
      setSource(layerSource);
      scene.addLayer(layer1);
      scene.addLayer(layer2);
      scene.addLayer(boundsLayer);
      setBorderLayer(boundsLayer);
      scene.on('click', (e) => {
        const lngLat = e.lngLat;
        setMapClick([lngLat.lng, lngLat.lat]);
      });
    });
  }, []);

  // 初始化模型

  useEffect(() => {
    const sam = new SAMGeo({
      modelUrl: MODEL_DIR,
    });
    sam.initModel().then(() => {
      setSamModel(sam);
    });
  }, []);

  return (
    <>
      <Button onClick={generateEmbedding}> 生成 embedding </Button>
      <Spin spinning={loading} tip={'embedding 生成中……'}>
        <Radio.Group
          style={{ margin: '15px' }}
          onChange={onLocationChange}
          defaultValue="A 空间"
          buttonStyle="solid"
        >
          {' '}
          {locations.map((item) => {
            return (
              <Radio.Button key={item.name} value={item.name}>
                {item.name}
              </Radio.Button>
            );
          })}
        </Radio.Group>

        <div
          id="map"
          style={{
            height: '70vh',
            position: 'relative',
          }}
        />
      </Spin>
    </>
  );
};
