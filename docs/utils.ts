import prettier from 'prettier';
import parserBabel from 'prettier/parser-babel';

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

export function prettierText(options: { content: string }) {
  const { content } = options;
  let newContent = content;
  if (typeof content !== 'string') {
    newContent = JSON.stringify(content, null, 2);
  }

  const newText = prettier.format(newContent, {
    parser: 'json',
    plugins: [parserBabel],
  });
  return newText;
}

export const downloadData = (
  data: any,
  name = `data-${new Date().toLocaleString()}`,
) => {
  const blob = new Blob([prettierText({ content: JSON.stringify(data) })], {
    type: 'application/json',
  });
  const link = document.createElement('a');
  link.download = `${name}.json`;
  link.href = URL.createObjectURL(blob);
  link.click();
};

export function hexToRgbaArray(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255];
}
