import { MapHelper } from './geo';

export interface ITileImage {
  x: number;
  y: number;
  z: number;
  data: Uint8Array;
}
// 多个瓦片合成一张图片
export function tiles2Image(tiles: ITileImage[], zoom: number) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const mapHelper = new MapHelper(256, 'google');
  tiles?.forEach((tile: { x: number; y: number; z: number }) => {
    minX = Math.min(minX, tile.x);
    minY = Math.min(minY, tile.y);
    maxX = Math.max(maxX, tile.x);
    maxY = Math.max(maxY, tile.y);
  });

  const canvas = document.createElement('canvas');
  canvas.width = (maxX - minX + 1) * 256;
  canvas.height = (maxY - minY + 1) * 256;
  const ctx = canvas.getContext('2d')!;
  const imageExtent = [
    ...mapHelper.tileToLngLat(minX, maxY + 1, zoom),
    ...mapHelper.tileToLngLat(maxX + 1, minY, zoom),
  ];

  // Draw each tile on the canvas

  tiles?.forEach((tile: any) => {
    if (tile) {
      ctx?.drawImage(
        tile.data,
        (tile.x - minX) * 256,
        (tile.y - minY) * 256,
        256,
        256,
      );
    }
  });

  return {
    extent: imageExtent,
    width: canvas.width,
    height: canvas.height,
    imageBase64: canvas.toDataURL('image/jpeg'),
  };
}
