import { DeleteOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import {
  Button,
  Divider,
  Empty,
  message,
  Radio,
  Space,
  Spin,
  Upload,
} from 'antd';
import React, { useEffect, useMemo } from 'react';
import './index.less';
// @ts-ignore
import { getBase64, SAM } from '@antv/sam';
import { EMBEDDING_URL } from '../../config';
import { ISamStateImg } from '../../typing';
import { downloadData } from '../../utils';
import { Model_URL, selectionImgType, WasmPaths } from '../constant';

const initState = {
  imageUrl: '',
  samModel: null,
  loading: false,
  clipImg: [],
  originImg: null,
  originMaskImg: [],
  isSelecting: false,
  startPoint: { x: 0, y: 0 },
  endPoint: { x: 0, y: 0 },
  clipType: 'click',
  eventPoint: [],
};

export default () => {
  const [imgState, setImgState] = useSetState<ISamStateImg>(initState);

  useEffect(() => {
    const sam = new SAM({
      modelUrl: Model_URL,
      WasmPaths,
    });
    sam.initModel().then(() => {
      setImgState({ samModel: sam });
    });
  }, []);

  const parserFile = async (base64Url: string, imageUrl: string) => {
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
      imgState.samModel.setEmbedding(buffer);
      const orImg = new Image();
      orImg.src = imageUrl;
      orImg.onload = () => {
        imgState.samModel.setImage(imageUrl);
        setImgState({ originImg: orImg });
      };
      setImgState({ imageUrl, loading: false });
      message.success('embedding计算完成');
    } catch (error) {
      setImgState({ loading: false });
      message.success('embedding计算失败');
    }
  };

  const onChange = async ({ file }) => {
    try {
      setImgState({ clipImg: [], loading: true });
      if (file.status === 'done') {
        const imageUrl = await getBase64(file.originFileObj);
        const index = (imageUrl as string).indexOf(',');
        const strBaseImg = (imageUrl as string)?.substring(index + 1);
        parserFile(strBaseImg, imageUrl);
      }
    } catch {
      setImgState({ loading: false });
      message.success('embedding计算失败');
    }
  };

  function beforeUpload(file) {
    const isLt1M = file.size / 1024 / 1024 < 1.1; // 判断文件大小是否小于1.1MB
    if (!isLt1M) {
      message.error('上传文件大小不能超过1.1MB!');
      setImgState({ loading: false });
      return;
    }
  }

  // 示例demo
  useEffect(() => {
    if (!EMBEDDING_URL) return;
    try {
      const image = new Image();
      image.src = '../../assets/demo1.jpg';
      image.onload = () => {
        setImgState({ loading: true });
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(image, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg');
        const index = (base64 as string).indexOf(',');
        const strBaseImg = (base64 as string)?.substring(index + 1);
        if (imgState.samModel) {
          parserFile(strBaseImg, image.src);
        }
      };
    } catch {
      setImgState({ loading: false });
      message.success('embedding计算失败');
    }
  }, [imgState.samModel]);

  const onImageClick = (e) => {
    if (imgState.clipType === 'click') {
      const rect = e.nativeEvent.target.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;
      let x = Math.round(e.pageX - rect.left - scrollLeft);
      let y = Math.round(e.pageY - rect.top - scrollTop);

      // 获取渲染图片与原图片的缩放比
      const imageScale = imgState.originImg
        ? imgState.originImg.width / e.nativeEvent.target.offsetWidth
        : 1;
      x *= imageScale;
      y *= imageScale;
      setImgState({ eventPoint: [x, y] });
    }
  };

  // 鼠标按下时记录框选的起点
  const handleMouseDown = (e) => {
    e.preventDefault();
    if (imgState.clipType === 'click') return;
    const rect = e.nativeEvent.target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;
    let x = Math.round(e.pageX - rect.left - scrollLeft);
    let y = Math.round(e.pageY - rect.top - scrollTop);

    setImgState({
      isSelecting: true,
      startPoint: { x, y },
    });
  };

  // 鼠标移动时更新框选的终点
  const handleMouseMove = (e) => {
    e.preventDefault();
    if (imgState.clipType === 'click') return;
    const rect = e.nativeEvent.target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;
    let x = Math.round(e.pageX - rect.left - scrollLeft);
    let y = Math.round(e.pageY - rect.top - scrollTop);
    setImgState({
      endPoint: { x, y },
    });
  };

  // 鼠标松开时停止框选，并根据框选起点和终点计算出选中的区域
  const handleMouseUp = (e) => {
    if (imgState.clipType === 'click') return;
    setImgState({ isSelecting: false });
    const start = imgState.startPoint;
    const end = imgState.endPoint;
    const selectedArea = {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(start.x - end.x),
      height: Math.abs(start.y - end.y),
    };
    setImgState({
      endPoint: { x: 0, y: 0 },
      startPoint: { x: 0, y: 0 },
    });
    const imageScaleX = imgState.originImg
      ? imgState.originImg.width / e.nativeEvent.target.offsetWidth
      : 1;

    const imageScaleY = imgState.originImg
      ? imgState.originImg.height / e.nativeEvent.target.offsetHeight
      : 1;

    const topLeft = [
      selectedArea.x * imageScaleX,
      selectedArea.y * imageScaleY,
    ];

    const bottomRight = [
      selectedArea.x * imageScaleX + selectedArea.width * imageScaleX,
      selectedArea.y * imageScaleY + selectedArea.height * imageScaleY,
    ];
    const coordinates = [...topLeft, ...bottomRight];
    setImgState({ eventPoint: coordinates });
  };

  const handleMouseOut = () => {
    if (imgState.clipType === 'click') return;
    // 清除状态
    setImgState({
      endPoint: { x: 0, y: 0 },
      startPoint: { x: 0, y: 0 },
      isSelecting: false,
      eventPoint: [],
    });
  };

  const box = useMemo(() => {
    if (!imgState.isSelecting) return null;
    const start = imgState.startPoint;
    const end = imgState.endPoint;
    return (
      <div
        style={{
          position: 'absolute',
          left: start.x,
          top: start.y,
          width: end.x - start.x,
          height: end.y - start.y,
          backgroundColor: 'rgba(255, 0, 255, 0.3)',
          border: '1px dashed red',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
    );
  }, [imgState.isSelecting, imgState.startPoint, imgState.endPoint]);

  useEffect(() => {
    if (!imgState.samModel) return;
    if (imgState.eventPoint.length === 0) return;
    const newEventPoint = imgState.eventPoint;
    let position;
    if (imgState.clipType === 'click') {
      position = [{ x: newEventPoint[0], y: newEventPoint[1], clickType: 1 }];
    }
    if (imgState.clipType === 'selectend') {
      position = [
        { x: newEventPoint[0], y: newEventPoint[1], clickType: 2 },
        { x: newEventPoint[2], y: newEventPoint[3], clickType: 3 },
      ];
    }

    const predictImage = (output) => {
      const image = imgState.samModel.exportImageClip(output);
      const maskImag = imgState.samModel.exportMaskImage(output);
      const keys = String(new Date().getTime());
      setImgState((pre) => ({
        clipImg: [
          ...pre.clipImg,
          { clipSrc: image.src, maskSrc: maskImag.src, mark: keys },
        ],
      }));
    };
    // 防止阻塞UI更新,把执行操作放在队列中(Promise.race([xxx,xxx])也行)
    setTimeout(() => {
      imgState.samModel.predict(position).then(predictImage);
    });
  }, [imgState.eventPoint, imgState.samModel, imgState.clipType]);

  return (
    <Spin spinning={imgState.loading} tip={'embedding 生成中……'}>
      <Space style={{ marginBottom: 16 }}>
        <Upload
          className="samPic__upload"
          multiple={false}
          maxCount={1}
          showUploadList={false}
          onChange={onChange}
          accept="image/*"
          beforeUpload={beforeUpload}
        >
          <Button type="primary">点击或拖拽上传</Button>
        </Upload>
        <Radio.Group
          style={{ margin: '10px 0' }}
          onChange={(event) => {
            setImgState({
              clipType: event.target.value,
              endPoint: { x: 0, y: 0 },
              startPoint: { x: 0, y: 0 },
              isSelecting: false,
              eventPoint: [],
            });
          }}
          value={imgState.clipType}
          buttonStyle="solid"
        >
          {selectionImgType.map((item) => {
            return (
              <Radio.Button key={item.value} value={item.value}>
                {item.label}
              </Radio.Button>
            );
          })}
        </Radio.Group>
        <Button
          block
          type="primary"
          disabled={imgState.clipImg.length <= 0}
          onClick={() => downloadData(imgState.clipImg, 'clipImages')}
          style={{ margin: '10px 0' }}
        >
          下载数据
        </Button>
      </Space>
      <div className="samPic">
        <div className="samPic__preview">
          {imgState.imageUrl && (
            <div style={{ position: 'relative' }}>
              {imgState.clipImg.length
                ? imgState.clipImg.map((url, index) => (
                    <img
                      key={index}
                      className="samPic__preview__maskImg"
                      src={url.maskSrc}
                    />
                  ))
                : null}
              <img
                className="samPic__preview__img"
                onClick={onImageClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseOut={handleMouseOut}
                src={imgState.imageUrl}
                style={{
                  cursor:
                    imgState.clipType === 'click' ? 'pointer' : 'crosshair',
                }}
              />
              {imgState.clipType !== 'click' && box}
            </div>
          )}
        </div>
        <div className="samPic__tool">
          {imgState.clipImg.length > 0 ? (
            <div className="clipImgContent">
              {imgState.clipImg.map(({ clipSrc, mark }, index) => {
                return (
                  <div key={index} style={{ position: 'relative' }}>
                    <img src={clipSrc} style={{ width: 50 }} />
                    <div className="tools">
                      <DeleteOutlined
                        style={{ opacity: 0.8 }}
                        onClick={() => {
                          setImgState((pre) => ({
                            clipImg: pre.clipImg.filter(
                              (item) => item.mark !== mark,
                            ),
                          }));
                        }}
                      />
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty description="暂无图片" />
          )}
        </div>
      </div>
    </Spin>
  );
};
