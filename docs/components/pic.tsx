import { InboxOutlined } from '@ant-design/icons';
import { Button, message, Spin, Upload } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import './index.less';
// @ts-ignore
import { getBase64, SAM } from 'sam.js';
import { EMBEDDING_URL } from '../config';
import { downloadData } from '../utils';

const { Dragger } = Upload;
const MODEL_DIR = '../model/sam_onnx_example.onnx';

export default () => {
  const [imageUrl, setImageUrl] = useState('');
  const [samModel, setSamState] = useState<SAM>(null);
  const [loading, setLoading] = useState(false);
  // 裁切图片
  const [clipImg, setClipImg] = useState<string[]>([]);
  // 原始图片
  const [originImg, setOriginImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const sam = new SAM({
      modelUrl: MODEL_DIR,
    });
    sam.initModel().then(() => {
      setSamState(sam);
    });
  }, []);

  const parserFile = async (file: any, imageUrl: string) => {
    const action = EMBEDDING_URL;
    const formData = new FormData();
    formData.append('file', file);
    const buffer = await (
      await fetch(action, {
        body: formData,
        method: 'POST',
      })
    ).arrayBuffer();
    samModel.setEmbedding(buffer);
    const orImg = new Image();
    orImg.src = imageUrl;
    orImg.onload = () => {
      samModel.setImage(imageUrl);
      setOriginImg(orImg);
    };
    setImageUrl(imageUrl);
  };

  const onChange = async ({ file }) => {
    try {
      setClipImg([]);
      setLoading(true);
      if (file.status === 'done') {
        const imageUrl = await getBase64(file.originFileObj);
        parserFile(file.originFileObj, imageUrl);
        setLoading(false);
        message.success('embedding计算完成');
      }
    } catch {
      setLoading(false);
      message.success('embedding计算失败');
    }
  };

  // 示例demo
  useEffect(() => {
    if (!EMBEDDING_URL) {
      return;
    }
    try {
      const image = new Image();
      image.src = '../assets/demo.jpg';
      image.onload = () => {
        setLoading(true);
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d') as any;
        ctx.drawImage(image, 0, 0);
        canvas.toBlob(async (newBlob) => {
          if (samModel) {
            parserFile(newBlob, image.src);
            setLoading(false);
            message.success('embedding计算完成');
          }
        }, 'image/jpeg');
      };
    } catch {
      setLoading(false);
      message.success('embedding计算失败');
    }
  }, [samModel]);

  const onImageClick = useCallback(
    (e) => {
      const rect = e.nativeEvent.target.getBoundingClientRect();
      let x = Math.round(e.pageX - rect.left);
      let y = Math.round(e.pageY - rect.top);
      // 获取渲染图片与原图片的缩放比
      const imageScale = originImg
        ? originImg.width / e.nativeEvent.target.offsetWidth
        : 1;
      x *= imageScale;
      y *= imageScale;
      const position = [{ x, y, clickType: 1 }];
      samModel.predictByPoints(position).then((res) => {
        const image = samModel.exportImageClip(res);
        setClipImg((pre) => [...pre, image.src]);
      });
    },
    [originImg],
  );

  return (
    <Spin spinning={loading} tip={'embedding 生成中……'}>
      <div className="samPic">
        <div className="samPic__tool">
          <Dragger
            className="samPic__upload"
            name="file"
            multiple={false}
            maxCount={1}
            showUploadList={false}
            onChange={onChange}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-hint">点击或拖拽上传。</p>
          </Dragger>
          <Button
            block
            size="small"
            type="primary"
            disabled={clipImg.length <= 0}
            onClick={() => downloadData(clipImg, 'clipImages')}
            style={{ margin: '10px 0' }}
          >
            下载数据
          </Button>
          {clipImg.length > 0 && (
            <div className="clipImgContent">
              {clipImg.map((src) => {
                return (
                  <img src={src} key={src} style={{ width: 80, height: 80 }} />
                );
              })}
            </div>
          )}
        </div>
        <div className="samPic__preview">
          {imageUrl && (
            <img
              className="samPic__preview__img"
              onClick={onImageClick}
              src={imageUrl}
              style={{ width: '100%' }}
            />
          )}
        </div>
      </div>
    </Spin>
  );
};
