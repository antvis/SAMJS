// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// Helper function for handling image scaling needed for SAM
var handleImageScale = function handleImageScale(image) {
  // Input images to SAM must be resized so the longest side is 1024
  var LONG_SIDE_LENGTH = 1024;
  var w = image.naturalWidth;
  var h = image.naturalHeight;
  var samScale = LONG_SIDE_LENGTH / Math.max(h, w);
  return {
    height: h,
    width: w,
    samScale: samScale
  };
};
var handleScale = function handleScale(w, h) {
  // Input images to SAM must be resized so the longest side is 1024
  var LONG_SIDE_LENGTH = 1024;
  var samScale = LONG_SIDE_LENGTH / Math.max(h, w);
  return {
    height: h,
    width: w,
    samScale: samScale
  };
};
export { handleImageScale, handleScale };