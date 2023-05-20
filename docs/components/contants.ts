// 'https://www.google.com/maps/vt?lyrs=s@820&gl=cn&x={x}&y={y}&z={z}';

//
const url1 =
  'https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';
export const googleSatellite = url1;
export const annotion =
  'https://t{0-7}.tianditu.gov.cn/DataServer?T=cia_w&X={x}&Y={y}&L={z}&tk=b72aa81ac2b3cae941d1eb213499e15e';

export const locations = [
  {
    name: 'A 空间',
    coord: [120.10533489408249, 30.261061158180482],
    zoom: 18,
  },
  {
    name: '油罐',
    coord: [-96.74674229210954, 35.935326263559816],
    zoom: 15.5,
  },
  {
    name: '农田',
    coord: [5.000138834496795, 52.83911856295691],
    zoom: 13.5,
  },
  {
    name: '农田2',
    coord: [-111.91603037093357, 32.91837220530866],
    zoom: 13,
  },
  {
    name: '灌溉农田',
    coord: [38.274419546979345, 30.107721922396593],
    zoom: 12.5,
  },
  {
    name: '建筑',
    coord: [-75.68709358840009, 45.40821167856009],
    zoom: 18,
  },
  {
    name: '建筑2',
    coord: [-117.9375255130447, 33.809435077864805],
    zoom: 18.2,
  },
  {
    name: '机场',
    coord: [-117.377, 34.596],
    zoom: 15.5,
  },
  {
    name: '草场',
    coord: [28.725760156128445, 22.24767189005027],
    zoom: 12,
  },
];

export const selectionType = [
  {
    label: '点选',
    value: 'click',
  },
  // {
  //   label: '框选',
  //   value: 'selectend',
  // },
  // {
  //   label: '全选',
  //   // disable: true,
  //   value: 'all',
  // },
];

export const selectionImgType = [
  {
    label: '点选',
    value: 'click',
  },
  {
    label: '框选',
    value: 'selectend',
  },
  // {
  //   label: '全选',
  //   // disable: true,
  //   value: 'all',
  // },
];
