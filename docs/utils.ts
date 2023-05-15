export const getEemedding = async (options: { action: string; file: File }) => {
  const { action, file } = options;
  const formData = new FormData();
  formData.append('file', file);
  const res = (
    await fetch(action, {
      body: formData,
      method: 'POST',
    })
  ).arrayBuffer();
  return res;
};

export const extent2Polygon = (extent: number[]) => {
  const [minLng, minLat, maxLng, maxLat] = extent;
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [minLng, minLat],
              [minLng, maxLat],
              [maxLng, maxLat],
              [maxLng, minLat],
              [minLng, minLat],
            ],
          ],
        },
      },
    ],
  };
};

export const coord2Polygon = (coord: Array<[number, number]>) => {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [coord],
        },
      },
    ],
  };
};

export const emptyPolygon = () => {
  return {
    type: 'FeatureCollection',
    features: [],
  };
};
