---
title: SAM-GEO
order: 3
---

地理图像分割 JSSDK、前端交互式分割

## 使用

```ts pure
import { SAMGeo, MODEL_URL } from '@antv/sam';
const samGeoModel = new SAMGeo({
  modelUrl: MODEL_URL, // antv/sam 提供的了默认的 onnx 服务
});
```

## 构造函数

同 SAM

## 属性

## 方法

### setGeoImage

设置地理图像，图像必须为 3857 坐标系

- image `HTMLImageElement | string`

- imageOption ` {
  extent: [number, number, number, number] | undefined;
  width: number;
  height: number;
}`

      - extent 经纬度范围，[minLng,minLat,maxLng,maxLat]
      - width 图像宽度
      - height 图像高度

### exportGeoPolygon

导出 GeoJSON 数据

- data `Tensor` predict 返回的 mask 结果
- simplifyThreshold `number` 数据简化阈值，数值越大简化后顶点越少 default 5,

### lngLat2ImagePixel

经纬度坐标转图片的像素坐标，用于地图交互场景
