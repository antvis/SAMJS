import { InferenceSession, Tensor } from 'onnxruntime-web';
import React, { useEffect, useState } from 'react';
const ort = require('onnxruntime-web');
/* @ts-ignore */
import npyjs from 'npyjs';
// @ts-ignore
import {
  ILayer,
  ISource,
  PolygonLayer,
  RasterLayer,
  Scene,
  Source,
} from '@antv/l7';
import { Button, message, Radio, Spin } from 'antd';
import { coord2Polygon, emptyPolygon, extent2Polygon } from '../utils';
// @ts-ignore
import { Map } from '@antv/l7-maps';
import {
  handleScale,
  modelData,
  modelInputProps,
  modelScaleProps,
  onnxMaskToPolygon,
  TileHelper,
} from 'sam.js';
import { EMBEDDING_URL } from '../config';
const MODEL_DIR = '../model/sam_onnx_example.onnx';

const tileHelper = new TileHelper(256, 'google');

export default () => {
  const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);
  const [model, setModel] = useState<InferenceSession | null>(null); // ONNX model
  const [tensor, setTensor] = useState<Tensor | null>(null); // Image embedding tensor
  const [currentScene, setScene] = useState<Scene>();
  const [currentSource, setSource] = useState<ISource>();
  const [imageExtent, setImageExtent] = useState<number[] | null>(null); // Image extent [minX, minY, maxX, maxY
  const [clicks, setClicks] = useState<Array<modelInputProps> | null>(null); // Array of clicks
  const [mapClick, setMapClick] = useState<any>(null); // Array of clicks
  const [extentLayer, setExtentLayer] = useState<ILayer>();
  const [loading, setLoading] = useState<boolean>(false);
  const [, setRawImageData] = useState<ImageData>();
  const mapZoom: number = 17;

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

  // Decode a Numpy file into a tensor.
  const loadNpyTensor = async (
    tensorFile: ArrayBuffer,
    dType: string = 'float32',
  ): Promise<any> => {
    let npLoader = new npyjs();
    const npArray = await npLoader.parse(tensorFile);
    const tensor = new ort.Tensor(dType, npArray.data, npArray.shape);
    return tensor;
  };
  const exportCurrentImage = async () => {
    setLoading(true);
    // @ts-ignore
    const tiles = currentSource?.tileset.currentTiles;
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

    const canvas = document.createElement('canvas');
    canvas.width = (maxX - minX + 1) * 256;
    canvas.height = (maxY - minY + 1) * 256;
    const ctx = canvas.getContext('2d')!;
    setImageExtent([minX, minY, maxX + 1, maxY + 1].map((v) => v * 256));

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
    const { height, width, samScale } = handleScale(
      canvas.width,
      canvas.height,
    );
    setModelScale({
      height: height, // original image height
      width: width, // original image width
      samScale: samScale, // scaling factor for image which has been resized to longest side 1024
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setRawImageData(imageData);

    canvas.toBlob(async (blob) => {
      // Convert the canvas to blob
      // if (EMBEDDING_URL === '') {
      //   message.error('请先配置embedding计算服务地址');
      //   return;
      // }
      const action = EMBEDDING_URL;
      const formData = new FormData();
      formData.append('file', blob as Blob);
      const res = await (
        await fetch(action, {
          body: formData,
          method: 'POST',
        })
      ).arrayBuffer();
      const tensor = await loadNpyTensor(res, 'float32');
      setTensor(tensor);
      setLoading(false);
      message.success('embedding计算完成');
    });

    // // 创建一个a标签元素
    // let downloadLink = document.createElement("a");

    // // 设置a标签的href属性为DataURL格式的字符串
    // downloadLink.href = canvas.toDataURL('image/png');

    // // 设置a标签的download属性为要下载的文件名
    // downloadLink.download = "myCanvas.png";

    // // 创建并触发一个点击事件，以便触发文件下载
    // document.body.appendChild(downloadLink);
    // downloadLink.click();
    // document.body.removeChild(downloadLink);
  };

  const onLocationChange = (item) => {
    const coord = locations.find((l) => l.name === item.target.value);
    if (coord) currentScene?.setCenter(coord!.coord as [number, number]);
    currentScene?.setZoom((coord!.zoom as number) || 17);
  };
  const initModel = async () => {
    try {
      if (MODEL_DIR === undefined) return;
      const URL: string = MODEL_DIR;
      const model = await InferenceSession.create(URL);
      setModel(model);
    } catch (e) {
      console.log(e);
    }
  };

  const runONNX = async () => {
    try {
      if (
        model === null ||
        clicks === null ||
        tensor === null ||
        modelScale === null
      ) {
        console.log('model not loaded');
        return;
      } else {
        // Preapre the model input in the correct format for SAM.
        // The modelData function is from onnxModelAPI.tsx.
        const feeds = modelData({
          clicks,
          tensor,
          modelScale,
        });
        if (feeds === undefined) return;
        // Run the SAM ONNX model with the feeds returned from modelData()
        const results = await model.run(feeds);
        const output = results[model.outputNames[0]];
        // The predicted mask returned from the ONNX model is an array which is
        // rendered as an HTML image using onnxMaskToImage() from maskUtils.tsx.
        // 裁剪后的图片
        // const image = onnxMaskClip( output.data,
        //   output.dims[2],
        //   output.dims[3])

        // const image = onnxMaskToImage(output.data,
        //   output.dims[3],
        //   output.dims[2])

        //  const image =  getImageByMask(rawImageData!, output.data,true)

        // const image = getImageByMaskClip(rawImageData!, output.data, output.dims[3],
        // output.dims[2]);
        // downLoadImage(image)

        const imageData = onnxMaskToPolygon(
          output.data,
          output.dims[3],
          output.dims[2],
        );
        const coord = imageData.map((point) => {
          const px = [point.x + imageExtent![0], point.y + imageExtent![1]];
          const lnglat = tileHelper.pixelsTolngLat(
            px[0],
            px[1],
            Math.ceil(currentScene?.getZoom() as number),
          );
          return lnglat;
        });
        const polygon = coord2Polygon(coord);
        extentLayer?.setData(polygon);
      }
    } catch (e) {
      console.log(e);
    }
  };
  // 初始化模型
  useEffect(() => {
    initModel();
  }, []);

  useEffect(() => {
    if (tensor !== null && modelScale !== null && imageExtent !== null) {
      const point = [
        mapClick[0] - imageExtent[0],
        mapClick[1] - imageExtent[1],
      ];
      setClicks([
        {
          x: point[0],
          y: point[1],
          clickType: 1,
        },
      ]);
    } else if (mapClick !== null) {
      exportCurrentImage();
      message.warning('请先生成embedding');
    }
  }, [mapClick]);

  useEffect(() => {
    runONNX();
    console.log('run onnx');
  }, [clicks]);

  useEffect(() => {
    if (imageExtent && extentLayer) {
      const [minX, minY, maxX, maxY] = imageExtent;
      const [minLng, maxLat] = tileHelper.pixelsTolngLat(
        minX,
        minY,
        Math.ceil(currentScene?.getZoom() as number),
      );
      const [maxLng, minLat] = tileHelper.pixelsTolngLat(
        maxX,
        maxY,
        Math.ceil(currentScene?.getZoom() as number),
      );
      const polygon = extent2Polygon([minLng, minLat, maxLng, maxLat]);
      extentLayer.setData(polygon);
    }
  }, [imageExtent]);

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

    // const url1 =
    //   'https://tiles{1-3}.geovisearth.com/base/v1/img/{z}/{x}/{y}?format=webp&tmsIds=w&token=b2a0cfc132cd60b61391b9dd63c15711eadb9b38a9943e3f98160d5710aef788';
    // const googleUrl =
    //   'https://www.google.com/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}';
    const url2 =
      'https://www.google.com/maps/vt?lyrs=s@820&gl=cn&x={x}&y={y}&z={z}';
    const annotion =
      'https://t{0-7}.tianditu.gov.cn/DataServer?T=cia_w&X={x}&Y={y}&L={z}&tk=b72aa81ac2b3cae941d1eb213499e15e';
    const layerSource = new Source(url2, {
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
      .source(emptyPolygon)
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
      setExtentLayer(boundsLayer);

      // const drawControl = new DrawControl(scene, {
      //   defaultActiveType: 'point',
      //   commonDrawOptions: {
      //     style: {
      //       ...getSingleColorStyle('#ff0000'),

      //     }

      //   },
      // });

      // // 将 Control 添加至地图中
      // scene.addControl(drawControl);

      scene.on('click', (e) => {
        const lngLat = e.lngLat;
        const point = tileHelper.lngLatToPixels(
          lngLat.lng,
          lngLat.lat,
          Math.ceil(scene.getZoom()),
        );
        setMapClick(point);
      });
    });
  }, []);
  // 120.10,30.26
  return (
    <>
      <Button onClick={exportCurrentImage}> 生成 embedding </Button>
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
