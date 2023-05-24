---
title: SAM
order: 2
---

SAM 图像分割 JSSDK、前端交互式分割

## 使用

```ts pure
import { SAM } from '@antv/sam';
import { SAMGeo, MODEL_URL } from '@antv/sam';
const samGeoModel = new SAMGeo({
  modelUrl: MODEL_URL, // antv/sam 提供的了默认的 onnx 服务
});
```

## 构造函数

- modelUrl Onnx 模型地址 可选，SAM 内置 Model service

- wasmPaths 设置 Wasm 服务地址： 'https://npm.elemecdn.com/onnxruntime-web/dist/';

或者通过 Webpack 来配置。

```ts
plugins: [
  new CopyPlugin({
    patterns: [
      {
        from: 'node_modules/onnxruntime-web/dist/*.wasm',
        to: '[name][ext]',
      },
      {
        from: 'model',
        to: 'model',
      },
      {
        from: 'src/assets',
        to: 'assets',
      },
    ],
  }),
];
```

```ts
const sam = new SAM({
  wasmPaths:'https://npm.elemecdn.com/onnxruntime-web/dist/';
})
```

## 方法

### initModel

初始化 Model

```ts
await sam.intModel();

// or
sam.intModel().then(() => {
  // todo something
});
```

### setEmbedding

设置 embedding 数据。

#### 参数

- tensorFile `ArrayBuffer | url string `,
- dType default 'float32',

### setImage

设置 embedding 的原始图像

#### 参数

- image `HTMLImageElement | string` image 对象或者图片 url/base64

### predict

#### 参数

- points ` Array<{
  x: number;
  y: number;
  clickType: number;
}>`

click type 0 、1、2、3 四种类型

- 0 负选择点
- 1 正选择点
- 2 box 做上角坐标
- 3 box 右下角坐标

### exportMaskImage

导出分割结果图像

- data `Tensor` predict 返回的 mask 结果

### exportMaskClip

导出裁剪后的结果图像，根据 mask 坐标最小范围导出

- data `Tensor` predict 返回的 mask 结果

### exportImage

- data `Tensor` predict 返回的 mask 结果
- flag `boolean` false

导出识别后的图像，只保留 Mask 区域的信息

### exportImageClip

- data `Tensor` predict 返回的 mask 结果

导出识别后的图像，只保留 Mask 区域的信息，并根据 mask 坐标最小范围裁剪图像

### exportVector

- data `Tensor` predict 返回的 mask 结果
- simplifyThreshold `number` 数据简化阈值，数值越大简化后顶点越少 default 5,

导出矢量化的，mask 数据边缘矢量化
