function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.
import * as d3 from 'd3-contour';
import simplify from 'simplify-js';

// Convert the onnx model mask prediction to ImageData
// @ts-ignore
export function arrayToImageData(input, width, height) {
  // const [r, g, b, a] = [0, 114, 189, 255]; // the masks's blue color
  var r = 255,
    g = 0,
    b = 0,
    a = 255; // the masks's blue color
  var arr = new Uint8ClampedArray(4 * width * height).fill(0);
  for (var i = 0; i < input.length; i++) {
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
function getImageExtent(input, width, height) {
  var pad = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 15;
  var minx = height;
  var maxx = 0;
  var miny = width;
  var maxy = 0;
  for (var i = 0; i < input.length; i++) {
    // Threshold the onnx model mask prediction at 0.0
    // This is equivalent to thresholding the mask using predictor.model.mask_threshold
    // in python

    if (input[i] > 0.0) {
      var x = i % height;
      var y = Math.floor(i / height);
      minx = Math.min(minx, x);
      maxx = Math.max(maxx, x);
      miny = Math.min(miny, y);
      maxy = Math.max(maxy, y);
    }
  }
  return [minx - pad, maxx + pad, miny - pad, maxy + pad];
}
function getImageDataByRegion(minx, miny, maxx, maxy, imageData, width, height) {
  var data = [];
  var destIndex = 0;
  for (var y = miny; y < maxy; y++) {
    for (var x = minx; x < maxx; x++) {
      var sourceIndex = y * height + x;
      data[destIndex++] = imageData[sourceIndex] > 0 ? 1 : -1;
    }
  }
  return data;
}

// Canvas elements can be created from ImageData
function imageDataToCanvas(imageData) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx === null || ctx === void 0 ? void 0 : ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// Use a Canvas element to produce an image from ImageData
export function imageDataToImage(imageData) {
  var canvas = imageDataToCanvas(imageData);
  var image = new Image();
  image.src = canvas.toDataURL();
  return image;
}
export function drawLines(points, width, height, minX, minY) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = width * 10;
  canvas.height = height * 10;
  ctx.beginPath();
  ctx.strokeStyle = '#00f';
  ctx.lineWidth = 4;
  var simplifyData = simplify(points.map(function (p) {
    return {
      x: p[0] + minX,
      y: p[1] + minY
    };
  }), 5, true);
  return simplifyData;
}
export var getBase64 = function getBase64(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      return resolve(reader.result);
    };
    reader.onerror = function (error) {
      return reject(error);
    };
  });
};

// Convert the onnx model mask output to an HTMLImageElement
export function onnxMaskToImage(input, width, height) {
  var _getImageExtent = getImageExtent(input, width, height),
    _getImageExtent2 = _slicedToArray(_getImageExtent, 4),
    minx = _getImageExtent2[0],
    maxx = _getImageExtent2[1],
    miny = _getImageExtent2[2],
    maxy = _getImageExtent2[3];
  var bboxData = getImageDataByRegion(minx, miny, maxx, maxy, input, width, height);
  // console.log(bboxData)

  var bboxWidth = maxx - minx;
  var bboxHeight = maxy - miny;
  var contours = d3.contours().size([bboxWidth, bboxHeight]).smooth(false).thresholds(2);
  var lines = contours(bboxData);
  return drawLines(lines[1].coordinates[0][0], bboxWidth, bboxHeight, minx, miny);
  // return imageDataToImage(arrayToImageData(input, width, height));
}