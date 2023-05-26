import { InboxOutlined } from '@ant-design/icons';
import { Button, Card, message, Spin, Tooltip, Upload } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import { getBase64, SAM } from '@antv/sam';
import { SketchPicker } from 'react-color';
import { EMBEDDING_URL } from '../../config';
import { downloadData, hexToRgbaArray } from '../../utils';
import { Model_URL, WasmPaths } from '../contants';
import './index.less';

const { Dragger } = Upload;
export default () => {
  const ref = useRef<HTMLImageElement>();
  const [loading, setLoading] = useState(false);
  const [samModel, setSamModel] = useState<SAM>(null);
  const [originImg, setOriginImg] = useState<HTMLImageElement | null>(null);
  const [analyzeImg, setAnalyzeImg] = useState('');
  const [color, setColor] = useState('#fff');

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
      // const offsetWidth = ref.current?.offsetWidth;
      // const offsetHeight = ref.current?.offsetHeight;
      // const imageScaleX = originImg
      //   ? originImg.width / (offsetWidth as number)
      //   : 1;
      // const imageScaleY = originImg
      //   ? originImg.height / (offsetHeight as number)
      //   : 1;
      // const position = [
      //   { x: 0, y: 0, clickType: 2 },
      //   {
      //     x: originImg.width * imageScaleX,
      //     y: originImg.height * imageScaleY,
      //     clickType: 3,
      //   },
      // ];

      // samModel.predict(position).then((output) => {
      //   const maskImg = samModel.exportWithBackgroundColor(
      //     output,
      //     hexToRgbaArray(color),
      //   );
      //   setAnalyzeImg(maskImg.src);
      // });
      console.log('color', color);
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
        const maskImg = samModel.exportWithBackgroundColor(
          output,
          hexToRgbaArray(color),
        );
        setAnalyzeImg(maskImg.src);
      });
    }
  };

  return (
    <div className="content">
      <Card className="configArea" hoverable>
        <Dragger
          showUploadList={false}
          onChange={onChange}
          maxCount={1}
          accept="image/*"
          multiple={false}
          style={{ height: 150 }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击上传</p>
        </Dragger>
        <Tooltip
          color="#fff"
          title={
            <SketchPicker color={color} onChange={({ hex }) => setColor(hex)} />
          }
        >
          <Button block style={{ backgroundColor: color, margin: '24px 0' }} />
        </Tooltip>
        <Button
          type="primary"
          block
          disabled={!analyzeImg}
          onClick={() => downloadData(analyzeImg, 'paperwork')}
        >
          下载
        </Button>
      </Card>
      <Spin spinning={loading} tip="embedding...">
        {analyzeImg ? (
          <Card style={{ width: 284, marginLeft: 24 }} hoverable>
            <img
              src={analyzeImg}
              width={'100%'}
              ref={ref as any}
              onClick={generateImg}
            />
          </Card>
        ) : null}
      </Spin>
    </div>
  );
};
