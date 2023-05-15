export declare class TileHelper {
    private tileSize;
    private type;
    private initialResolution;
    private originShift;
    constructor(tileSize?: number, type?: string);
    lngLatToMeters(lon: number, lat: number): number[];
    metersToLatLon(mx: number, my: number): number[];
    pixelsToMeters(px: number, py: number, zoom: number): number[];
    metersToPixels(mx: number, my: number, zoom: number): number[];
    metersToTile(mx: number, my: number, zoom: number): number[];
    tileToMeters(tx: number, ty: number, zoom: number): number[];
    pixelsToTile(px: number, py: number): number[];
    pixelsToRaster(px: number, py: number, zoom: number): number[];
    tileBounds(tx: number, ty: number, zoom: number): number[];
    tileLatLonBounds(tx: number, ty: number, zoom: number): number[];
    resolution(zoom: number): number;
    lngLatToPixels(lon: number, lat: number, zoom: number): number[];
    pixelsTolngLat(px: number, py: number, zoom: number): number[];
    lngLatToTile(lon: number, lat: number, zoom: number): number[];
    googleTile(tx: number, ty: number, zoom: number): number[];
    boundsToTileExtent(minLon: number, minLat: number, maxLon: number, maxLat: number, zoom: number): number[][];
    metersboundsToTileExtent(minX: number, minY: number, maxX: number, maxY: number, zoom: number): number[][];
}
