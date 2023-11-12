import React, { useEffect } from 'react';
// @ts-ignore
import { getBase64, imageToImageData } from '@antv/sam';
import * as d3 from 'd3';
import { Category } from '../assets/category';
// @ts-ignore
const bboxHeight = 888;
const bboxWidth = 888;

export default () => {
  useEffect(() => {
    const CategroyMap = {};
    Category.module.forEach((item) => {
      CategroyMap[item.color.join('_')] = item.value;
    });

    const allFeatures =
      'https://mdn.alipayobjects.com/afts/img/A*nZfvQJXR-XgAAAAAAAAAAAAADrd2AQ/all.png';
    //  使用Fetch API获取图片
    fetch(allFeatures)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then((blob) => {
        // 将Blob转换为Data URL
        return getBase64(blob);
      })
      .then((dataUrl: any) => {
        // 创建一个img元素
        const imgElement = document.createElement('img');
        // 将img元素添加到页面中
        const imageContainer = document.getElementById(
          'image-container',
        ) as HTMLElement;
        imageContainer.innerHTML = '';
        imageContainer.style.width = '500px';
        imageContainer.appendChild(imgElement);

        // imgElement.style.width = '500px';

        imgElement.onload = () => {
          const imagedata = imageToImageData(imgElement);
          const bboxData: number[] = [];
          for (let i = 0; i < imagedata.data.length; i += 4) {
            const gray =
              imagedata.data[i] * 0.299 +
              imagedata.data[i + 1] * 0.587 +
              imagedata.data[i + 2] * 0.114;

            bboxData.push(Math.round(gray / 5));
          }
          const uniqueType = Array.from(new Set(bboxData)).sort(
            (a, b) => a - b,
          );

          const contours = d3
            .contours()
            .size([bboxWidth, bboxHeight])
            .smooth(true)
            .thresholds(uniqueType);
          const lines = contours(bboxData);
          // console.log(lines)
          console.time('contours');
          console.log(lines);
          console.timeEnd('contours');

          const path = d3.geoPath().projection(d3.geoIdentity().scale(1));
          const color = d3
            .scaleSequential(d3.interpolateTurbo)
            .domain(d3.extent(uniqueType))
            .nice();

          const svg = d3
            .create('svg')
            .attr('width', bboxWidth)
            .attr('height', bboxHeight)
            .attr('viewBox', [0, 0, bboxWidth, bboxHeight])
            .attr('style', 'max-width: 100%; height: auto;');

          svg
            .append('g')
            .attr('stroke', 'black')
            .selectAll()
            .data(uniqueType)
            .join('path')
            .attr('d', (d) => path(contours.contour(bboxData, d)))
            .attr('fill', color);

          const map = document.getElementById('map') as HTMLElement;
          map.appendChild(svg.node());
        };
        imgElement.src = dataUrl;
      })
      .catch((error) => {
        console.error('Error fetching or displaying image:', error);
      });
  }, []);

  return (
    <>
      <div id="image-container"></div>
      <div id="map"></div>
    </>
  );
};
