import { Button, Tabs } from 'antd';
import React, { useMemo } from 'react';
import { ISamState } from '../../../typing';
import { downloadData, emptyPolygon } from '../../../utils';
import { Editor } from './editor';
import './index.less';
import { ShowTable } from './table';

interface RightPanelProps {
  satelliteData: ISamState['satelliteData'];
  setSatelliteData: (value: ISamState['satelliteData']) => void;
}

export const RightPanel = (props: RightPanelProps) => {
  const { satelliteData, setSatelliteData } = props;

  const newValue = useMemo(() => {
    const newFeature = satelliteData.map((item) => item.features);
    return {
      type: 'FeatureCollection',
      features: newFeature.flat(),
    };
  }, [satelliteData]);

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
      children: (
        <ShowTable
          satelliteData={satelliteData}
          setSatelliteData={setSatelliteData}
        />
      ),
    },
  ];

  return (
    <div className="rightContainer" style={{ width: 400 }}>
      <Tabs
        style={{ width: 400 }}
        items={items}
        tabBarExtraContent={
          <Button
            size="small"
            type="primary"
            disabled={satelliteData.length <= 0}
            onClick={() => downloadData(satelliteData)}
          >
            下载数据
          </Button>
        }
      />
    </div>
  );
};
