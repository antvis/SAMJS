# JS SDK for SAM

![demo](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*6rjpTIjg4cUAAAAAAAAAAAAADmJ7AQ/original)

- [Document](http://samjs.antv.vision/demos)

- [API](http://samjs.antv.vision/api)

- [Map lib](https://github.com/antvis/l7)

### Installation

#### Using npm or yarn

We recommend using npm or yarn to install, it not only makes development easier, but also allow you to take advantage of the rich ecosystem of Javascript packages and tooling.

```bash
npm install @antv/sam

# or

yarn add @antv/sam


```

### Usage

#### import SAM

```ts
import { SAM } from '@antv/sam';
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

get imageEmbedding from sam service.

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
