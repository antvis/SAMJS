import { Button, Card, ColorPicker, message, Spin, Upload } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import { getBase64, SAM } from '@antv/sam';
import { EMBEDDING_URL } from '../../config';
import { exportImg, getImageByColor, hexToRgbaArray } from '../../utils';
import { Model_URL, WasmPaths } from '../constant';
import './index.less';

export default () => {
  const ref = useRef<HTMLImageElement>();
  const [loading, setLoading] = useState(false);
  const [samModel, setSamModel] = useState<SAM>(null);
  const [originImg, setOriginImg] = useState<HTMLImageElement | null>(null);
  const [analyzeImg, setAnalyzeImg] = useState('');
  const [color, setColor] = useState<string>('#ad0404');

  useEffect(() => {
    const sam = new SAM({
      modelUrl: Model_URL,
      WasmPaths,
    });
    sam.initModel().then(() => setSamModel(sam));
  }, []);

  const embedding = async (base64Url: string, imageUrl: string) => {
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
      const orImg = new Image();
      orImg.src = imageUrl;
      orImg.onload = async () => {
        samModel.setImage(imageUrl);
        setOriginImg(orImg);
        setAnalyzeImg(imageUrl);
      };
      setLoading(false);
      message.success('embedding计算完成');
    } catch (error) {
      setLoading(false);
      message.success('embedding计算失败');
    }
  };

  const onChange = async ({ file }) => {
    if (file.status === 'done') {
      const base64Url = await getBase64(file.originFileObj);
      const index = (base64Url as string).indexOf(',');
      const strBaseImg = (base64Url as string)?.substring(index + 1);
      embedding(strBaseImg, base64Url);
    }
  };

  const generateImg = (e) => {
    if (samModel && originImg) {
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
      samModel.predict(position).then((output) => {
        const maskImg = samModel.exportImageClip(output);
        maskImg.onload = function () {
          const newImg = getImageByColor(
            samModel.imageData,
            output.data,
            hexToRgbaArray(color),
          );
          setAnalyzeImg(newImg);
        };
      });
    }
  };

  return (
    <div className="content">
      <Spin spinning={loading} tip="embedding...">
        <div className="configArea">
          <Card
            style={{ width: '50%', maxWidth: '500px' }}
            title="处理前"
            hoverable
            extra={
              <ColorPicker
                value={color}
                format="hex"
                onChange={(color, hex) => setColor(hex)}
              />
            }
          >
            {originImg ? (
              <img
                src={originImg.src}
                width={'100%'}
                ref={ref as any}
                onClick={generateImg}
              />
            ) : (
              <Upload
                showUploadList={false}
                onChange={onChange}
                maxCount={1}
                accept="image/*"
                multiple={false}
                style={{ height: 150 }}
              >
                <img
                  src="https://mdn.alipayobjects.com/huamei_juqv6t/afts/img/A*2QADT69gLtwAAAAAAAAAAAAADiaPAQ/original"
                  style={{ width: 400, height: 210, filter: 'opacity(0.25)' }}
                />
                <p className="ant-upload-text" style={{ textAlign: 'center' }}>
                  点击上传
                </p>
              </Upload>
            )}
          </Card>
          <Card
            style={{ width: '50%', maxWidth: '500px', marginLeft: '20px' }}
            title="处理后"
            hoverable
            extra={
              <Button
                type="primary"
                disabled={!analyzeImg}
                onClick={() => exportImg(analyzeImg)}
              >
                下载
              </Button>
            }
          >
            {analyzeImg ? (
              <img
                src={analyzeImg}
                width={'100%'}
                ref={ref as any}
                onClick={generateImg}
              />
            ) : (
              <div>
                <img
                  src="https://mdn.alipayobjects.com/huamei_juqv6t/afts/img/A*2QADT69gLtwAAAAAAAAAAAAADiaPAQ/original"
                  style={{ width: 400, height: 210, filter: 'opacity(0.25)' }}
                />
                <p className="ant-upload-text" style={{ textAlign: 'center' }}>
                  暂无图片生成
                </p>
              </div>
            )}
          </Card>
        </div>
      </Spin>
    </div>
  );
};
