import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Tabs } from 'antd';
import React, { useMemo } from 'react';
import { ISamState } from '../../../typing';
import { downloadData, emptyPolygon } from '../../../utils';
import { Editor } from './editor';
import './index.less';
import { ShowTable } from './table';

interface RightPanelProps {
  samInfo: ISamState;
  setSamState: (samInfo: ISamState) => void;
}

export const RightPanel = (props: RightPanelProps) => {
  const { samInfo, setSamState } = props;

  const newValue = useMemo(() => {
    const newFeature = samInfo.satelliteData.map((item) => item.features);
    return {
      type: 'FeatureCollection',
      features: newFeature.flat(),
    };
  }, [samInfo.satelliteData]);

  const items = [
    {
      key: 'text',
      label: `编辑器展示`,
      children: (
        <Editor value={JSON.stringify(newValue ?? emptyPolygon(), null, 2)} />
      ),
    },
    {
      key: 'table',
      label: `表格展示`,
      children: <ShowTable samInfo={samInfo} setSamState={setSamState} />,
    },
  ];

  return (
    <div
      className="rightContainer"
      style={{ width: samInfo.collapsed ? 400 : 0 }}
    >
      <div
        className="rightContainer__collapsed"
        onClick={() =>
          // @ts-ignore
          setSamState((pre: ISamState) => ({ collapsed: !pre.collapsed }))
        }
      >
        {samInfo.collapsed ? (
          <LeftOutlined className="rightContainer__collapsed__icon" />
        ) : (
          <RightOutlined className="rightContainer__collapsed__icon" />
        )}
      </div>
      {samInfo.collapsed && (
        <Tabs
          style={{ width: samInfo.collapsed ? 400 : 0 }}
          items={items}
          tabBarExtraContent={
            <Button
              size="small"
              type="primary"
              disabled={samInfo.satelliteData.length <= 0}
              onClick={() => downloadData(samInfo.satelliteData)}
            >
              下载数据
            </Button>
          }
        />
      )}
    </div>
  );
};
