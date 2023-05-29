import {
  Button,
  Form,
  Input,
  message,
  Radio,
  Slider,
  Spin,
  Upload,
} from 'antd';
import React, { useEffect, useState } from 'react';

import { UploadOutlined } from '@ant-design/icons';
// @ts-ignore
import { getBase64, image2Base64, SAMGeo } from '@antv/sam';
import { EMBEDDING_URL } from '../../config';
import { SatelliteData } from '../../typing';
import { Model_URL, WasmPaths } from '../constant';
import { locations } from './constant';
import './index.less';
import { RightPanel } from './leftpanel';

export default () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [samModel, setSamModel] = useState<SAMGeo>(null);
  const [originImg, setOriginImg] = useState<HTMLImageElement | null>(null);
  const [analyzeImg, setAnalyzeImg] = useState(locations[0].url);
  const [imageExtent, setImageExtent] = useState(locations[0].extent);
  const [satelliteData, setSatelliteData] = useState<
    (SatelliteData & { maskImg: string; key: string })[]
  >([]);
  const [place, setPlace] = useState(locations[0].name);
  const [simplifyThreshold, setSimplifyThreshold] = useState(1);

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
    if (samModel && analyzeImg && imageExtent) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const base64Url = image2Base64(img, 'image/jpeg');
        const index = (base64Url as string).indexOf(',');
        const strBaseImg = (base64Url as string)?.substring(index + 1);
        embedding(strBaseImg);
        // 初始化图片
        samModel.setGeoImage(img, {
          width: img.width,
          height: img.height,
          extent: imageExtent,
        });
        setOriginImg(img);
      };
      img.src = analyzeImg;
    }
  }, [samModel, analyzeImg]);

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
    samModel.predict(position).then(async (output) => {
      const image = samModel.exportImageClip(output);
      const maskImg = samModel.exportMaskImage(output);
      // 导出 polygon
      const polygon = await samModel.exportGeoPolygon(
        output,
        simplifyThreshold,
      );
      const newData = {
        features: polygon.features,
        imageUrl: image.src,
        maskImg: maskImg.src,
        key: String(new Date().getTime()),
      };
      setSatelliteData((pre) => {
        const hasData = pre.find((item) => item.imageUrl === newData.imageUrl);
        if (hasData) return [...pre];
        return [...pre, newData];
      });
    });
  };

  const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList);

  const onFinish = async (value: Record<string, any>) => {
    try {
      setSimplifyThreshold(value?.simplifyThreshold ?? 1);
      if (value?.upload) {
        const { upload, coordinate } = value;
        const file = upload[0];
        if (file.status === 'done') {
          const base64Url = await getBase64(file.originFileObj);
          setAnalyzeImg(base64Url);
        }
        const extent = coordinate
          .split(';')
          .map((item) => item.split(','))
          .flat();
        setImageExtent(extent);
      } else {
        const target = locations.find((item) => item.name === value.choose);
        setAnalyzeImg(target?.url as string);
        setImageExtent(target?.extent as number[]);
      }
    } catch (error) {
      message.error(`错误:${error}`);
    }
  };

  useEffect(() => {
    if (form) {
      const choose = locations.find((item) => item.name === place)?.name;
      const coordinate = JSON.stringify(
        locations.find((item) => item.name === place)?.extent,
      );
      form.setFieldsValue({
        choose,
        coordinate,
      });
    }
  }, [form, place]);

  const onFieldsChange = (change: any) => {
    if (change[0].name[0] === 'choose') {
      setPlace(change[0].value);
    }
    if (change[0].name[0] === 'upload') {
      form.setFieldsValue({ coordinate: '' });
    }
  };

  const coordinateValidator = (_: any, value: string) => {
    if (!value) {
      return Promise.reject('请输入');
    }
    const newCoordinate = value.split(';');
    if (newCoordinate.length === 0) {
      return Promise.reject('请正确输入');
    }
  };

  return (
    <>
      <Form
        form={form}
        onFinish={onFinish}
        labelCol={{ span: 3 }}
        labelAlign="left"
        onFieldsChange={onFieldsChange}
      >
        <Form.Item name="choose" label="示例">
          <Radio.Group
            buttonStyle="solid"
            onChange={() => {
              form.setFieldsValue({ upload: undefined });
            }}
          >
            {locations.map((item) => {
              return (
                <Radio.Button key={item.name} value={item.name}>
                  {item.name}
                </Radio.Button>
              );
            })}
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="上传"
          name="upload"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload multiple={false} maxCount={1} accept="image/*">
            <Button type="primary" icon={<UploadOutlined />}>
              点击上传
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item
          name="coordinate"
          label="地理坐标"
          rules={[
            {
              required: true,
              validator: coordinateValidator,
            },
          ]}
        >
          <Input
            placeholder="[120.09979248046875,30.256694798480346;120.11352539062499,30.26381184075493]"
            style={{ width: 300 }}
          />
        </Form.Item>
        <Form.Item label="polygon抽稀系数:" name="simplifyThreshold">
          <Slider step={0.1} min={0} max={100} style={{ width: 300 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>

      <Spin spinning={loading} tip={'embedding 生成中……'}>
        <div className="normalMapContainer">
          <img src={analyzeImg} style={{ width: '68%' }} onClick={onMapClick} />
          {satelliteData.length
            ? satelliteData.map((item, index) => (
                <img key={index} className="normalMaskImg" src={item.maskImg} />
              ))
            : null}
          <RightPanel
            satelliteData={satelliteData}
            setSatelliteData={setSatelliteData}
          />
        </div>
      </Spin>
    </>
  );
};
//'120.129644638902,30.270126210814027;120.13863248466771,30.26570057971226'
