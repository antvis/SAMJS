import { Tensor } from 'onnxruntime-web';
export interface modelInputProps {
    x: number;
    y: number;
    clickType: number;
}
export interface modeDataProps {
    clicks?: Array<modelInputProps>;
    tensor: Tensor;
    modelScale: modelScaleProps;
}
export interface modelScaleProps {
    samScale: number;
    height: number;
    width: number;
}
declare const modelData: ({ clicks, tensor, modelScale }: modeDataProps) => {
    image_embeddings: Tensor;
    point_coords: import("onnxruntime-web").TypedTensor<"float32">;
    point_labels: import("onnxruntime-web").TypedTensor<"float32">;
    orig_im_size: import("onnxruntime-web").TypedTensor<"float32">;
    mask_input: import("onnxruntime-web").TypedTensor<"float32">;
    has_mask_input: import("onnxruntime-web").TypedTensor<"float32">;
} | undefined;
export { modelData };
