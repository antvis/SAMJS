export class MapHelper {
  private tileSize: number;
  private type: string;
  private initialResolution: number;
  private originShift: number;
  constructor(tileSize = 256, type = 'tms') {
    // "Initialize the TMS Global Mercator pyramid"
    this.tileSize = tileSize;
    this.type = type;
    this.initialResolution = (2 * Math.PI * 6378137) / this.tileSize;
    this.originShift = (2 * Math.PI * 6378137) / 2.0;
  }
  lngLatToMeters(lon: number, lat: number): [number, number] {
    // "Converts given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:3857"
    let mx = (lon * this.originShift) / 180.0;
    let my =
      Math.log(Math.tan(((90 + lat) * Math.PI) / 360.0)) / (Math.PI / 180.0);
    my = (my * this.originShift) / 180.0;
    return [mx, my];
  }

  // "Converts XY point from Spherical Mercator EPSG:3857 to lat/lon in WGS84 Datum"
  metersToLngLat(mx: number, my: number) {
    let lon = (mx / this.originShift) * 180.0;
    let lat = (my / this.originShift) * 180.0;

    lat =
      (180 / Math.PI) *
      (2 * Math.atan(Math.exp((lat * Math.PI) / 180.0)) - Math.PI / 2.0);
    return [lon, lat];
  }

  //  "Converts pixel coordinates in given zoom level of pyramid to EPSG:3857"
  pixelsToMeters(px: number, py: number, zoom: number) {
    const res = this.resolution(zoom);
    const mx = px * res - this.originShift;
    const my =
      (this.type === 'tms' ? py : Math.pow(2, zoom) * 256 - py) * res -
      this.originShift;
    return [mx, my];
  }

  //  "Converts EPSG:3857 to pyramid pixel coordinates in given zoom level"
  metersToPixels(mx: number, my: number, zoom: number) {
    const res = this.resolution(zoom);
    let px = (mx + this.originShift) / res;
    let py = (my + this.originShift) / res;
    py = this.type === 'tms' ? py : Math.pow(2, zoom) * 256 - py;
    return [px, py];
  }
  // "Returns tile for given mercator coordinates"
  metersToTile(mx: number, my: number, zoom: number) {
    const [px, py] = this.metersToPixels(mx, my, zoom);
    return this.pixelsToTile(px, py);
  }

  tileToMeters(tx: number, ty: number, zoom: number) {
    return this.pixelsToMeters(tx * this.tileSize, ty * this.tileSize, zoom);
  }

  tileToLngLat(tx: number, ty: number, zoom: number) {
    const [minx, miny] = this.tileToMeters(tx, ty, zoom);
    return this.metersToLngLat(minx, miny);
  }

  // "Returns a tile covering region in given pixel coordinates"

  pixelsToTile(px: number, py: number) {
    const tx = Math.floor(Math.ceil(px / this.tileSize) - 1);
    const ty = Math.floor(Math.ceil(py / this.tileSize) - 1);
    return [tx, ty];
  }

  //  "Move the origin of pixel coordinates to top-left corner"
  pixelsToRaster(px: number, py: number, zoom: number) {
    const mapSize = this.tileSize << zoom;
    return [px, mapSize - py];
  }

  //"Returns bounds of the given tile in EPSG:3857 coordinates"
  tileBounds(tx: number, ty: number, zoom: number) {
    const [minx, miny] = this.pixelsToMeters(
      tx * this.tileSize,
      ty * this.tileSize,
      zoom,
    );
    const [maxx, maxy] = this.pixelsToMeters(
      (tx + 1) * this.tileSize,
      (ty + 1) * this.tileSize,
      zoom,
    );
    return [minx, miny, maxx, maxy];
  }

  // "Returns bounds of the given tile in latitude/longitude using WGS84 datum"
  tileLatLonBounds(tx: number, ty: number, zoom: number) {
    const bounds = this.tileBounds(tx, ty, zoom);
    const [minLat, minLon] = this.metersToLngLat(bounds[0], bounds[1]);
    const [maxLat, maxLon] = this.metersToLngLat(bounds[2], bounds[3]);

    return [minLat, minLon, maxLat, maxLon];
  }

  // "Resolution (meters/pixel) for given zoom level (measured at Equator)"
  resolution(zoom: number) {
    return this.initialResolution / Math.pow(2, zoom);
  }

  lngLatToPixels(lon: number, lat: number, zoom: number) {
    const [mx, my] = this.lngLatToMeters(lon, lat);
    return this.metersToPixels(mx, my, zoom);
  }
  pixelsTolngLat(px: number, py: number, zoom: number) {
    const meters = this.pixelsToMeters(px, py, zoom);
    return this.metersToLngLat(meters[0], meters[1]);
  }

  lngLatToTile(lon: number, lat: number, zoom: number) {
    const [px, py] = this.lngLatToPixels(lon, lat, zoom);
    return this.pixelsToTile(px, py);
  }

  //"Converts TMS tile coordinates to Google Tile coordinates"
  googleTile(tx: number, ty: number, zoom: number) {
    return [tx, 2 ** zoom - 1 - ty];
  }

  boundsToTileExtent(
    minLon: number,
    minLat: number,
    maxLon: number,
    maxLat: number,
    zoom: number,
  ) {
    const [minTx, minTy] = this.lngLatToTile(minLon, maxLat, zoom);
    const [maxTx, maxTy] = this.lngLatToTile(maxLon, minLat, zoom);
    return [
      [minTx, minTy],
      [maxTx, maxTy],
    ];
  }

  metersboundsToTileExtent(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    zoom: number,
  ) {
    const [minTx, minTy] = this.metersToTile(minX, maxY, zoom);
    const [maxTx, maxTy] = this.metersToTile(maxX, minY, zoom);
    return [
      [minTx, minTy],
      [maxTx, maxTy],
    ];
  }
}
