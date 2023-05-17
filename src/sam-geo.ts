import { SAM } from './sam';
import { MapHelper } from './utils/geo';
import { coord2Polygon } from './utils/utils';

export interface IGeoImageOption {
  extent: [number, number, number, number] | undefined;
  width: number;
  height: number;
}

export class SAMGeo extends SAM {
  private imageOption: IGeoImageOption | undefined;

  // 墨卡托范围
  private imageBounds: [number, number, number, number] | undefined;

  private metersPerpixelsX: number = 0;

  private metersPerpixelsY: number = 0;

  public mapHelper = new MapHelper(256, 'google');

  public async setGeoImage(
    image: HTMLImageElement | string,
    imageOption: IGeoImageOption,
  ) {
    super.setImage(image);
    this.imageOption = imageOption;
    const { extent, width, height } = imageOption;
    if (extent) {
      // 经纬度范围墨卡托范围
      this.imageBounds = [
        ...this.mapHelper.lngLatToMeters(extent![0], extent![1]),
        ...this.mapHelper.lngLatToMeters(extent![2], extent![3]),
      ];
      this.metersPerpixelsX =
        (this.imageBounds[2] - this.imageBounds[0]) / width;
      this.metersPerpixelsY =
        (this.imageBounds[3] - this.imageBounds[1]) / height;
    }
  }

  public async exportGeoPolygon(output: any, simplifyThreshold: number = 5) {
    const vector = await this.exportVector(output, simplifyThreshold);
    const bounds = this.imageBounds;

    // 图片像素坐标转经纬度坐标;
    // 图表像素坐标->墨卡托->经纬度

    const coord = vector.map((point: { x: number; y: number }) => {
      // 像素坐标转墨卡托坐标
      const px = [
        point.x * this.metersPerpixelsX + bounds![0],
        (this.imageOption!.height - point.y) * this.metersPerpixelsY +
          bounds![1],
      ];

      // 墨卡托转经纬度
      const lnglat = this.mapHelper.metersToLngLat(px[0], px[1]);
      return lnglat;
    });
    const polygon = coord2Polygon(coord);
    return polygon;
  }
  // 瓦片场景
  public lngLat2ImagePixel(lnglat: [number, number]) {
    if (!this.imageBounds) return;
    const [x, y] = this.mapHelper.lngLatToMeters(lnglat[0], lnglat[1]);
    const dx = (x - this.imageBounds![0]) / this.metersPerpixelsX;
    let dy = (y - this.imageBounds![1]) / this.metersPerpixelsY;
    dy = this.imageOption!.height - dy;
    // Todo: 超出范围处理
    return [dx, dy];
  }
}
