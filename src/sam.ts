// @ts-ignore
import npyjs from 'npyjs';
import { env, InferenceSession, Tensor } from 'onnxruntime-web';
import { MODEL_URL } from './api/contanst';
import { modelData, modelInputProps } from './api/onnxModel';
import {
  arrayToImageData,
  getImageByMask,
  getImageByMaskClip,
  imageToImageData,
  onnxMaskClip,
  onnxMaskToPolygon,
} from './utils/mask';
import { handleScale, IHandleScale } from './utils/scale';
export interface ISAMOptions {
  modelUrl?: string;
  wasmPaths?: string;
}
export class SAM {
  // 模型地址 ONNX model
  private modelUrl: string = MODEL_URL;

  public model!: InferenceSession;

  public image!: HTMLImageElement;

  public imageData: ImageData | undefined;

  public modelScale!: IHandleScale;

  public tensor!: Tensor;

  constructor(options: ISAMOptions) {
    if (options?.modelUrl) this.modelUrl = options.modelUrl;
    if (options?.wasmPaths) this.setWasmUrl(options.wasmPaths);
  }

  public async initModel() {
    try {
      const model = await InferenceSession.create(this.modelUrl);
      this.model = model;
    } catch (e) {
      throw new Error('模型加载失败');
    }
  }
  // 更新识别图片
  public async setImage(image: HTMLImageElement | string) {
    if (typeof image === 'string') {
      this.image = new Image();
      this.image.src = image;
      this.image.onload = () => {
        this.getImageScale(this.image);
        this.imageData = imageToImageData(this.image);
      };
    } else {
      this.image = image;
      this.getImageScale(this.image);
      this.imageData = imageToImageData(this.image);
    }
  }

  // 加载Npy格式的Tensor
  public async setEmbedding(
    tensorFile: ArrayBuffer | string,
    dType: string = 'float32',
  ) {
    const npLoader = new npyjs();
    const npArray =
      typeof tensorFile === 'string'
        ? npLoader.load(tensorFile)
        : await npLoader.parse(tensorFile);
    const tensor = new Tensor(dType, npArray.data, npArray.shape);
    this.tensor = tensor;
  }
  /**
     *  document https://github.com/facebookresearch/segment-anything/blob/main/notebooks/onnx_model_example.ipynb
     *
     *  the ONNX model has a different input signature than SamPredictor.predict. The following inputs must all be supplied. Note the special cases for both point and mask inputs. All inputs are np.float32.
        image_embeddings: The image embedding from predictor.get_image_embedding(). Has a batch index of length 1.
        point_coords: Coordinates of sparse input prompts, corresponding to both point inputs and box inputs. Boxes are encoded using two points, one for the top-left corner and one for the bottom-right corner. Coordinates must already be transformed to long-side 1024. Has a batch index of length 1.
        point_labels: Labels for the sparse input prompts. 0 is a negative input point, 1 is a positive input point, 2 is a top-left box corner, 3 is a bottom-right box corner, and -1 is a padding point. If there is no box input, a single padding point with label -1 and coordinates (0.0, 0.0) should be concatenated.
        mask_input: A mask input to the model with shape 1x1x256x256. This must be supplied even if there is no mask input. In this case, it can just be zeros.
        has_mask_input: An indicator for the mask input. 1 indicates a mask input, 0 indicates no mask input.
        orig_im_size: The size of the input image in (H,W) format, before any transformation.
        Additionally, the ONNX model does not threshold the output mask logits. To obtain a binary mask, threshold at sam.mask_threshold (equal to 0.0).

     */

  // 执行模型/ 返回执行结果
  // 平面坐标
  public async predict(
    points: Array<modelInputProps>,
  ): Promise<Tensor | undefined> {
    try {
      if (
        this.model === null ||
        points === null ||
        this.tensor === null ||
        this.modelScale === null
      ) {
        console.log('model not loaded');
        return;
      } else {
        // Preapre the model input in the correct format for SAM.
        // The modelData function is from onnxModelAPI.tsx.
        const feeds = modelData({
          clicks: points,
          tensor: this.tensor,
          modelScale: this.modelScale,
        });
        if (feeds === undefined) return;
        // Run the SAM ONNX model with the feeds returned from modelData()
        const results = await this.model.run(feeds);
        const output = results[this.model.outputNames[0]];
        return output;
      }
    } catch (e) {
      console.log(e);
      return;
    }
  }

  public async predictByBox(box: Array<number>) {
    return box; // TODO
  }
  // 导出Mask原始数据
  public exportMaskImage(output: any) {
    if (this.imageData === undefined) return;

    return arrayToImageData(
      // @ts-ignore
      this.imageData.data,
      output.data,
      output.dims[3],
      output.dims[2],
    );
  }

  // 导出Mask裁剪数据,最小外接矩形
  public exportMaskClip(output: any): HTMLImageElement {
    return onnxMaskClip(output.data, output.dims[3], output.dims[2]);
  }
  /**
   *
   * @param output
   * @param flag 是否反转mask
   * @returns
   */
  public exportImage(output: any, flag: boolean = false) {
    if (this.imageData === undefined) return;
    return getImageByMask(this.imageData, output.data, flag);
  }

  // 导出裁剪数据图像
  public exportImageClip(output: any) {
    if (this.imageData === undefined) return;
    return getImageByMaskClip(
      this.imageData,
      output.data,
      output.dims[3],
      output.dims[2],
    );
  }
  /**
   *
   * @param output
   * @param simplifyThreshold 抽稀系数
   * @returns
   */

  public exportVector(output: any, simplifyThreshold: number = 5) {
    return onnxMaskToPolygon(
      output.data,
      output.dims[3],
      output.dims[2],
      simplifyThreshold,
    );
  }

  public setWasmUrl(url: string) {
    env.wasm.wasmPaths = url;
  }

  private getImageScale(image: HTMLImageElement) {
    const { width, height } = image;
    this.modelScale = handleScale(width, height);
  }
}
