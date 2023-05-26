import { message, Spin, Upload } from 'antd';
import React, { useEffect, useState } from 'react';

import { InboxOutlined } from '@ant-design/icons';
// @ts-ignore
import { getBase64, image2Base64, SAMGeo } from '@antv/sam';
import { EMBEDDING_URL } from '../../config';
import { Model_URL, WasmPaths } from '../constant';
import { locations } from './constant';
import './index.less';
import { RightPanel } from './leftpanel';

const { Dragger } = Upload;

export default () => {
  const [loading, setLoading] = useState(false);
  const [samModel, setSamModel] = useState<SAMGeo>(null);
  const [originImg, setOriginImg] = useState<HTMLImageElement | null>(null);
  const [analyzeImg, setAnalyzeImg] = useState(locations[0].url);
  const [imageExtent, setImageExtent] = useState(locations[0].extent);

  // 生成 embedding 并初始化载入模型
  const embedding = async (base64Url: string) => {
    setLoading(true);
    try {
      const action = EMBEDDING_URL;
      const formData = new FormData();
      formData.append('image_path', base64Url);
      const buffer = await (
        await fetch(action, {
          body: formData,
          method: 'post',
        })
      ).arrayBuffer();

      samModel.setEmbedding(buffer);
      setLoading(false);
      message.success('embedding计算完成');
    } catch (error) {
      setLoading(false);
      message.success('embedding计算失败');
    }
  };

  // 初始化模型

  useEffect(() => {
    const sam = new SAMGeo({
      modelUrl: Model_URL,
      wasmPaths: WasmPaths,
    });
    sam.initModel().then(() => {
      setSamModel(sam);
    });
  }, []);

  useEffect(() => {
    if (samModel && analyzeImg) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const base64Url = image2Base64(img, 'image/jpeg');
        const index = (base64Url as string).indexOf(',');
        const strBaseImg = (base64Url as string)?.substring(index + 1);
        embedding(strBaseImg, base64Url);
        // 初始化图片
        samModel.setGeoImage(img, {
          width: img.width,
          height: img.height,
          extent: imageExtent,
        });
        setOriginImg(img);
      };
      img.src = locations[0].url;
    }
  }, [samModel, analyzeImg]);

  const onChange = async ({ file }) => {
    const base64Url = await getBase64(file.originFileObj);
    setAnalyzeImg(base64Url);
    setImageExtent(locations[1].extent);
  };

  const onMapClick = (e) => {
    const rect = e.nativeEvent.target.getBoundingClientRect();
    let x = Math.round(e.pageX - rect.left);
    let y = Math.round(e.pageY - rect.top);
    // 获取渲染图片与原图片的缩放比
    const imageScaleX = originImg
      ? originImg.width / e.nativeEvent.target.offsetWidth
      : 1;
    const imageScaleY = originImg
      ? originImg.height / e.nativeEvent.target.offsetHeight
      : 1;
    x *= imageScaleX;
    y *= imageScaleY;
    const position = [{ x, y, clickType: 1 }];
    samModel.predict(position).then((output) => {
      const image = samModel.exportImageClip(output);
      console.log(image.src);
      // 导出 polygon
    });
  };

  return (
    <>
      <Dragger
        className="upload"
        multiple={false}
        maxCount={1}
        showUploadList={false}
        onChange={onChange}
        accept="image/*"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-hint">点击或拖拽上传。</p>
      </Dragger>
      <Spin spinning={loading} tip={'embedding 生成中……'}>
        <div className="mapContainer">
          <div
            className="mapContainer__map"
            style={{ width: `calc(100vw - 400px)` }}
          >
            <img
              src={analyzeImg}
              style={{ width: ' 100%' }}
              onClick={onMapClick}
            />
          </div>
          <RightPanel satelliteData={[]} setSatelliteData={() => {}} />
        </div>
      </Spin>
    </>
  );
};
