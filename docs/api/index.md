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

- modelUrl Onnx 模型地址

## 方法

### initModel

### setImage

### setEmbedding

### predict

### predictByBox

### exportMaskImage

### exportMaskClip

### exportImage

### exportImageClip

### exportVector
