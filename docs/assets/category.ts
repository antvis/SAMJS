export const Category = {
  code: 0,
  message: 'success',
  module: [
    {
      color: [128, 0, 0],
      category: '种植土地',
      colorHex: '#800000',
      value: 0,
    },
    {
      color: [0, 128, 0],
      category: '林地',
      colorHex: '#008000',
      value: 1,
    },
    {
      color: [128, 128, 0],
      category: '草地',
      colorHex: '#808000',
      value: 2,
    },
    {
      color: [0, 0, 255],
      category: '房屋建筑',
      colorHex: '#0000FF',
      value: 3,
    },
    {
      color: [128, 0, 128],
      category: '道路',
      colorHex: '#800080',
      value: 4,
    },
    {
      color: [0, 128, 128],
      category: '人工裸地',
      colorHex: '#008080',
      value: 5,
    },
    {
      color: [128, 128, 128],
      category: '自然裸地',
      colorHex: '#808080',
      value: 6,
    },
    {
      color: [96, 0, 0],
      category: '水域',
      colorHex: '#600000',
      value: 7,
    },
    {
      color: [192, 0, 0],
      category: '硬化地表',
      colorHex: '#C00000',
      value: 8,
    },
    {
      color: [64, 128, 0],
      category: '船',
      colorHex: '#408000',
      value: 9,
    },
    {
      color: [192, 128, 0],
      category: '油罐',
      colorHex: '#C08000',
      value: 10,
    },
    {
      color: [64, 0, 128],
      category: '棒球场',
      colorHex: '#400080',
      value: 11,
    },
    {
      color: [192, 0, 128],
      category: '网球场',
      colorHex: '#C00080',
      value: 12,
    },
    {
      color: [64, 128, 128],
      category: '篮球场',
      colorHex: '#408080',
      value: 13,
    },
    {
      color: [192, 128, 128],
      category: '田径场',
      colorHex: '#C08080',
      value: 14,
    },
    {
      color: [0, 64, 0],
      category: '桥梁',
      colorHex: '#004000',
      value: 15,
    },
    {
      color: [128, 64, 0],
      category: '车辆',
      colorHex: '#804000',
      value: 16,
    },
    {
      color: [0, 192, 0],
      category: '直升机',
      colorHex: '#00C000',
      value: 17,
    },
    {
      color: [128, 192, 0],
      category: '游泳池',
      colorHex: '#80C000',
      value: 18,
    },
    {
      color: [0, 64, 128],
      category: '环岛',
      colorHex: '#004080',
      value: 19,
    },
    {
      color: [224, 5, 255],
      category: '足球场',
      colorHex: '#E005FF',
      value: 20,
    },
    {
      color: [235, 255, 7],
      category: '飞机',
      colorHex: '#EBFF07',
      value: 21,
    },
    {
      color: [150, 5, 61],
      category: '码头',
      colorHex: '#96053D',
      value: 22,
    },
    {
      color: [61, 230, 250],
      category: '温室大棚',
      colorHex: '#3DE6FA',
      value: 23,
    },
    {
      color: [255, 8, 41],
      category: '光伏板',
      colorHex: '#FF0829',
      value: 24,
    },
    {
      color: [0, 0, 0],
      category: '植被',
      colorHex: '#000000',
      value: -1,
    },
    {
      color: [0, 0, 0],
      category: '构筑物',
      colorHex: '#000000',
      value: -2,
    },
    {
      color: [0, 0, 0],
      category: '体育用地',
      colorHex: '#000000',
      value: -3,
    },
    {
      color: [0, 0, 0],
      category: 'grassland',
      colorHex: '#000000',
      value: -4,
    },
    {
      color: [0, 0, 0],
      category: 'building',
      colorHex: '#000000',
      value: -5,
    },
    {
      color: [0, 0, 0],
      category: 'road',
      colorHex: '#000000',
      value: -6,
    },
    {
      color: [0, 0, 0],
      category: 'bare land',
      colorHex: '#000000',
      value: -7,
    },
    {
      color: [0, 0, 0],
      category: 'water',
      colorHex: '#000000',
      value: -8,
    },
    {
      color: [0, 0, 0],
      category: 'swimming pool',
      colorHex: '#000000',
      value: -9,
    },
    {
      color: [0, 0, 0],
      category: 'vehicle',
      colorHex: '#000000',
      value: -10,
    },
    {
      color: [0, 0, 0],
      category: 'woodland',
      colorHex: '#000000',
      value: -11,
    },
  ],
  success: true,
};

export function rgbToHsl(red: number, green: number, blue: number) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return { h, s, l };
}
