---
title: SAM
order: 0
---

图片分割 JSSDK、前端交互式分割

## 使用

```ts pure
import { SAM } from 'sam.js';
const samModel = new SAM({
  modelUrl: '',
});
```

## 构造函数

- modelUrl Onnx 模型地址

## 方法

### initModel

### setImage

### setEmbedding

### predictByPoints

### predictByBox

### exportMaskImage

### exportMaskClip

### exportImage

### exportImageClip

### exportVector
