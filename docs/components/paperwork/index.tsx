import { Button, Card, ColorPicker, message, Space, Spin, Upload } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import { getBase64, SAM } from '@antv/sam';
import { useSize } from 'ahooks';
import { EMBEDDING_URL } from '../../config';
import {
  exportImg,
  getAbsoluteXy,
  getImageByColor,
  hexToRgbaArray,
} from '../../utils';
import { Model_URL, WasmPaths } from '../constant';
import './index.less';

interface ClickPoints {
  x: number;
  y: number;
  clickType: number;
}

export default () => {
  const canvasRef = useRef();
  const ref = useRef<HTMLImageElement>();
  const size = useSize(ref);
  const [loading, setLoading] = useState(false);
  const [samModel, setSamModel] = useState<SAM>(null);
  const [originImg, setOriginImg] = useState<HTMLImageElement | null>(null);
  const [analyzeImg, setAnalyzeImg] = useState('');
  const [color, setColor] = useState<string>('#ad0404');
  const [clickPoints, setClickPoints] = useState<ClickPoints[]>([]);

  useEffect(() => {
    const sam = new SAM({
      modelUrl: Model_URL,
      WasmPaths,
    });
    sam.initModel().then(() => setSamModel(sam));
  }, []);

  const embedding = async (base64Url: string, imageUrl: string) => {
    setLoading(true);
    const orImg = new Image();
    orImg.src = imageUrl;
    orImg.onload = () => {
      samModel.setImage(imageUrl);
      setOriginImg(orImg);
    };
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

      // setAnalyzeImg(imageUrl);
      setLoading(false);
      message.success('embedding计算完成');
    } catch (error) {
      setLoading(false);
      message.success('embedding计算失败');
    }
  };

  useEffect(() => {
    if (!EMBEDDING_URL) return;
    try {
      const image = new Image();
      image.src = '../../assets/2.png';
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(image, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg');
        const index = (base64 as string).indexOf(',');
        const strBaseImg = (base64 as string)?.substring(index + 1);
        if (samModel) {
          embedding(strBaseImg, image.src);
        }
      };
    } catch {
      setLoading(false);
      message.success('embedding计算失败');
    }
  }, [samModel]);

  const onChange = async ({ file }) => {
    if (file.status === 'done') {
      const base64Url = await getBase64(file.originFileObj);
      const index = (base64Url as string).indexOf(',');
      const strBaseImg = (base64Url as string)?.substring(index + 1);
      embedding(strBaseImg, base64Url);
    }
  };

  const generateImg = (e) => {
    const { x, y } = getAbsoluteXy(e, originImg);

    const position = { x, y, clickType: 1 };
    setClickPoints((pre) => {
      return [...pre, position];
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current as any;
    if (clickPoints.length !== 0 && originImg) {
      canvas.width = size?.width;
      canvas.height = size?.height;
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      // @ts-ignore
      const scaleX = size?.width / originImg?.width;
      // @ts-ignore
      const scaleY = size?.height / originImg?.height;
      clickPoints.forEach(({ x, y }) => {
        // 绘制圆形
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(x * scaleX, y * scaleY, 6, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }, [clickPoints, canvasRef.current, originImg]);

  const produceImg = () => {
    samModel.predict(clickPoints).then((output) => {
      const maskImg = samModel.exportImageClip(output);
      setAnalyzeImg(maskImg.src);
      // document.body.appendChild(maskImg);
      maskImg.onload = function () {
        const newImg = getImageByColor(
          samModel.imageData,
          output.data,
          hexToRgbaArray(color),
        );
        setAnalyzeImg(newImg);
      };
    });
    setClickPoints([]);
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
              <Space>
                <ColorPicker
                  value={color}
                  format="hex"
                  onChange={(color, hex) => setColor(hex)}
                />
                <Button
                  type="primary"
                  style={{ marginLeft: 8 }}
                  onClick={() => produceImg()}
                >
                  更改背景色
                </Button>
              </Space>
            }
          >
            <canvas
              id="maskCircle"
              ref={canvasRef as any}
              style={{
                zIndex: 10,
                position: 'absolute',
                pointerEvents: 'none',
              }}
            />
            {originImg ? (
              <img
                src={originImg.src}
                width={'100%'}
                style={{ position: 'relative' }}
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
