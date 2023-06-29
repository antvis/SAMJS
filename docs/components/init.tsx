import React, { useEffect } from 'react';
// @ts-ignore
import { SAMGeo } from '@antv/sam';
// @ts-ignore

export default () => {
  useEffect(() => {
    const samGeoModel = new SAMGeo({
      modelUrl:
        'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/file/A*UtUITbWUN6AAAAAAAAAAAAAADmJ7AQ/fe_process.glb',
    });
    samGeoModel.initModel().then(() => {
      alert('模型初始化完成');
    });
  }, []);

  return <>初始化</>;
};
