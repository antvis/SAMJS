---
title: 简介
order: 0
---

### Installation

#### Using npm or yarn

We recommend using npm or yarn to install, it not only makes development easier, but also allow you to take advantage of the rich ecosystem of Javascript packages and tooling.

```bash
npm install sam.js

# or

yarn add sam.js


```

If you are in a bad network environment, you can try other registries and tools like cnpm.
Usage

#### Import in Browser

### Usage

#### import SAM

```ts
import { SAM } from 'sam.js';
```

#### 1.new a SAM instance

```ts
const sam = new SAM({
  modelUrl: MODEL_DIR, // the ONNX model
});
```

#### 2. 初始化 Model，

```ts
await sam.initModel(); // async method
// or
sam.initModel().then(() => {
  // do something
});
```

#### 3. setEmbedding

```ts
sam.setEmbedding(imageEmbedding);
```

#### 4. set image

```ts
sam.setImage(imageUrl | HTMLImageElement); // use to clip image
```

#### 5. predict by promopts points or box

```ts
sam.predict(position); //  async method
```
