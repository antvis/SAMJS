import simplify from '@turf/simplify';
export type coord = [number, number];
export type ring = coord[];
export type callback = (px: coord) => coord;
export type offset = coord | callback;

// callback(px:coord => coord)  用于处理不同的offset
export function offsetPoint(coord: coord, offset: offset) {
  if (typeof offset === 'function') {
    return offset(coord);
  } else {
    return [coord[0] + offset[0], coord[1] + offset[1]];
  }
}

export function offsetRing(ring: ring, offsets: offset) {
  const newRing = ring.map((coord: any) => {
    return offsetPoint(coord, offsets);
  });
  return newRing;
}

export function offsetRings(rings: ring[], offsets: offset) {
  const newRings = rings.map((ring: any) => {
    return offsetRing(ring, offsets);
  });
  return newRings;
}

export function offsetPolygon(geometry: any, offsets: offset) {
  const type = geometry.type;
  let newCoords: any = [];
  if (type.toLowerCase() !== 'polygon') {
    newCoords = geometry.coordinates.map((rings: any) => {
      return offsetRings(rings, offsets);
    });
  } else {
    newCoords = geometry.coordinates.map((polgons: any[]) => {
      return polgons.map((rings: any) => {
        return offsetRings(rings, offsets);
      });
    });
  }

  console.log(newCoords);

  return {
    type: 'Feature',
    properties: {
      value: geometry.value,
    },
    geometry: {
      type: geometry.type,
      coordinates: newCoords,
    },
  };
}

export function simplifyPolygon(polygon: any, tolerance: number = 5): any {
  // 局部坐标转全局坐标
  if (tolerance === 0) return polygon;
  const simplifyData = simplify(polygon, {
    tolerance: tolerance,
    highQuality: false,
  });

  return simplifyData;
}
