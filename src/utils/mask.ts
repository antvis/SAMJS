// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.
import * as d3 from 'd3-contour';
import simplify from 'simplify-js';

// Convert the onnx model mask prediction to ImageData
// @ts-ignore
export function arrayToImageData(input: any, width: number, height: number) {
  // const [r, g, b, a] = [0, 114, 189, 255]; // the masks's blue color
  const [r, g, b, a] = [255, 0, 0, 255]; // the masks's blue color
  const arr = new Uint8ClampedArray(4 * width * height).fill(0);

  for (let i = 0; i < input.length; i++) {
    // Threshold the onnx model mask prediction at 0.0
    // This is equivalent to thresholding the mask using predictor.model.mask_threshold
    // in python

    if (input[i] > 0.0) {
      arr[4 * i + 0] = r;
      arr[4 * i + 1] = g;
      arr[4 * i + 2] = b;
      arr[4 * i + 3] = a;
    }
  }
  // const res = getImageDataByRegion(minx, miny, maxx, maxy, input);

  return new ImageData(arr, height, width);
}

function getImageExtent(
  input: any,
  width: number,
  height: number,
  pad: number = 15,
) {
  let minx = height;
  let maxx = 0;
  let miny = width;
  let maxy = 0;
  for (let i = 0; i < input.length; i++) {
    // Threshold the onnx model mask prediction at 0.0
    // This is equivalent to thresholding the mask using predictor.model.mask_threshold
    // in python

    if (input[i] > 0.0) {
      let x = i % height;
      let y = Math.floor(i / height);
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
  height: number,
) {
  const data = [];
  let destIndex = 0;
  for (let y = miny; y < maxy; y++) {
    for (let x = minx; x < maxx; x++) {
      const sourceIndex = y * height + x;
      data[destIndex++] = imageData[sourceIndex] > 0 ? 1 : -1;
    }
  }
  return data;
}

// Canvas elements can be created from ImageData
function imageDataToCanvas(imageData: ImageData) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx?.putImageData(imageData, 0, 0);

  return canvas;
}

// Use a Canvas element to produce an image from ImageData
export function imageDataToImage(imageData: ImageData) {
  const canvas = imageDataToCanvas(imageData);
  const image = new Image();
  image.src = canvas.toDataURL();

  return image;
}

export function drawLines(
  points: number[][],
  width: number,
  height: number,
  minX: number,
  minY: number,
): any {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = width * 10;
  canvas.height = height * 10;
  ctx.beginPath();
  ctx.strokeStyle = '#00f';
  ctx.lineWidth = 4;
  const simplifyData = simplify(
    points.map((p) => {
      return { x: p[0] + minX, y: p[1] + minY };
    }),
    5,
    true,
  );

  return simplifyData;
}

export const getBase64 = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

// Convert the onnx model mask output to an HTMLImageElement
export function onnxMaskToImage(
  input: any,
  width: number,
  height: number,
): any {
  const [minx, maxx, miny, maxy] = getImageExtent(input, width, height);
  const bboxData = getImageDataByRegion(
    minx,
    miny,
    maxx,
    maxy,
    input,
    width,
    height,
  );
  // console.log(bboxData)

  const bboxWidth = maxx - minx;
  const bboxHeight = maxy - miny;
  const contours = d3
    .contours()
    .size([bboxWidth, bboxHeight])
    .smooth(false)
    .thresholds(2);
  const lines = contours(bboxData);
  return drawLines(
    lines[1].coordinates[0][0],
    bboxWidth,
    bboxHeight,
    minx,
    miny,
  );
  // return imageDataToImage(arrayToImageData(input, width, height));
}
