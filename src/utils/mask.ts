// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.
import * as d3 from 'd3-contour';
import { offsetPolygon, simplifyPolygon } from './vector';

// Canvas elements can be created from ImageData
function imageDataToCanvas(imageData: ImageData) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  ctx?.putImageData(imageData, 0, 0);

  return canvas;
}

export function image2Base64(
  image: HTMLImageElement,
  type: string = 'image/png',
) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0, image.width, image.height);

  return canvas.toDataURL(type);
}

// Use a Canvas element to produce an image from ImageData
export function imageDataToImage(imageData: ImageData) {
  const canvas = imageDataToCanvas(imageData);
  const image = new Image();
  image.src = canvas.toDataURL();

  return image;
}

// Convert the onnx model mask prediction to ImageData
// @ts-ignore
export function arrayToImageData(
  imageDataArray: number[],
  input: any,
  width: number,
  height: number,
) {
  const uintImageData = new Uint8ClampedArray(imageDataArray); // 转换为 Uint8ClampedArray 类型
  const arr = new Uint8ClampedArray(4 * width * height);

  for (let i = 0; i < input.length; i++) {
    if (input[i] > 0.0) {
      const index = 4 * i;
      arr[index + 0] = uintImageData[index + 0]; // R
      arr[index + 1] = uintImageData[index + 1]; // G
      // TODO 暂时设置不同颜色，期待加描边或者发光
      arr[index + 2] = Math.max(uintImageData[index + 2], 200); // B
      arr[index + 3] = uintImageData[index + 3]; // A
    }
  }
  return imageDataToImage(new ImageData(arr, width, height));
}

function getImageExtent(
  input: any,
  width: number,
  height: number,
  pad: number = 15,
) {
  let minx = width;
  let maxx = 0;
  let miny = height;
  let maxy = 0;
  for (let i = 0; i < input.length; i++) {
    // Threshold the onnx model mask prediction at 0.0
    // This is equivalent to thresholding the mask using predictor.model.mask_threshold
    // in python

    if (input[i] > 0.0) {
      let x = i % width;
      let y = Math.floor(i / width);
      minx = Math.min(minx, x);
      maxx = Math.max(maxx, x);
      miny = Math.min(miny, y);
      maxy = Math.max(maxy, y);
    }
  }
  return [minx - pad, maxx + pad, miny - pad, maxy + pad];
}

function getImageDataByRegion(
  minx: number,
  miny: number,
  maxx: number,
  maxy: number,
  imageData: number[],
  width: number,
) {
  const data: number[] = [];
  let destIndex = 0;
  for (let y = miny; y < maxy; y++) {
    for (let x = minx; x < maxx; x++) {
      const sourceIndex = y * width + x;
      data[destIndex++] = imageData[sourceIndex] > 0 ? 1 : -1;
    }
  }
  return data;
}

export const getBase64 = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

// Convert the onnx model mask output to an HTMLImageElement
// export function onnxMaskToImage(
//   input: any,
//   width: number,
//   height: number,
// ): any {
//   return imageDataToImage(arrayToImageData(input, width, height));
// }

// 裁剪后的Mask 图片
export function onnxMaskClip(input: any, width: number, height: number) {
  const [minx, maxx, miny, maxy] = getImageExtent(input, width, height);
  const bboxData = getImageDataByRegion(minx, miny, maxx, maxy, input, width);
  const image = arrayToImageData(bboxData, input, maxx - minx, maxy - miny);
  return image;
}
// Mask 转为 矢量多边形
export function onnxMaskToPolygon(
  input: any,
  width: number,
  height: number,
  simplifyThreshold: number = 5,
) {
  const [minx, maxx, miny, maxy] = getImageExtent(input, width, height);
  const bboxData = getImageDataByRegion(minx, miny, maxx, maxy, input, width);

  const bboxWidth = maxx - minx;
  const bboxHeight = maxy - miny;
  const contours = d3
    .contours()
    .size([bboxWidth, bboxHeight])
    .smooth(false)
    .thresholds(2);
  const lines = contours(bboxData);
  const newPolgon = offsetPolygon(lines[1], [minx, miny]);
  return simplifyPolygon(newPolgon, simplifyThreshold);
}

// 获取 Mask 后的数据
export function getImageByMask(
  imageData: ImageData,
  input: any,
  flag: boolean = true,
) {
  for (let i = 0; i < input.length; i++) {
    // Threshold the onnx model mask prediction at 0.0
    // This is equivalent to thresholding the mask using predictor.model.mask_threshold
    // in python

    if (flag ? input[i] <= 0.0 : input[i] > 0.0) {
      imageData.data[4 * i + 0] = 0;
      imageData.data[4 * i + 1] = 0;
      imageData.data[4 * i + 2] = 0;
      imageData.data[4 * i + 3] = 0;
    }
  }

  return imageDataToImage(imageData);
}

export function getImageByMaskClip(
  imageData: ImageData,
  maskData: any,
  width: number,
  height: number,
) {
  const [minx, maxx, miny, maxy] = getImageExtent(maskData, width, height);
  const data = new Uint8ClampedArray(4 * (maxx - minx) * (maxy - miny)).fill(0);
  let destIndex = 0;
  for (let y = miny; y < maxy; y++) {
    for (let x = minx; x < maxx; x++) {
      const sourceIndex = y * width + x;
      if (maskData[sourceIndex] > 0) {
        data[destIndex * 4] = imageData.data[sourceIndex * 4];
        data[destIndex * 4 + 1] = imageData.data[sourceIndex * 4 + 1];
        data[destIndex * 4 + 2] = imageData.data[sourceIndex * 4 + 2];
        data[destIndex * 4 + 3] = imageData.data[sourceIndex * 4 + 3];
      }
      destIndex++;
    }
  }
  const res = new ImageData(data, maxx - minx, maxy - miny);

  return imageDataToImage(res);
}

export function downLoadImage(image: any) {
  const a = document.createElement('a');
  a.href = image.src;
  a.download = 'image';
  a.click();
}
export function downLoadCanvas(canvas: any) {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'image';
  a.click();
}

// Image 转 imageData
export function imageToImageData(
  image: HTMLImageElement,
): ImageData | undefined {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;
  ctx?.drawImage(image, 0, 0);
  return ctx?.getImageData(0, 0, image.width, image.height);
}
