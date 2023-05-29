import { useSize } from 'ahooks';
import { Card } from 'antd';
import React, { useMemo, useRef, useState } from 'react';
import { ISamState, SatelliteData } from '../../../typing';
import { emptyPolygon } from '../../../utils';
import { Editor } from './editor';
import './index.less';
import { ShowTable } from './table';

interface RightPanelProps {
  satelliteData: ISamState['satelliteData'];
  setSatelliteData: (
    value: (SatelliteData & { maskImg: string; key: string })[],
  ) => void;
  height: number;
}

export const RightPanel = (props: RightPanelProps) => {
  const cardRef = useRef();
  const size = useSize(cardRef);
  const { satelliteData, setSatelliteData, height } = props;
  const [activeTabKey, setActiveTabKey] = useState<string>('text');
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
      tab: `编辑器展示`,
    },
    {
      key: 'table',
      tab: `表格展示`,
    },
  ];

  const contentList: Record<string, React.ReactNode> = {
    text: (
      <Editor
        width={size?.width as number}
        height={height}
        value={JSON.stringify(newValue ?? emptyPolygon(), null, 2)}
      />
    ),
    table: (
      <ShowTable
        satelliteData={satelliteData}
        setSatelliteData={setSatelliteData}
      />
    ),
  };

  return (
    <Card
      ref={cardRef as any}
      hoverable
      style={{ width: '32%' }}
      tabList={items}
      activeTabKey={activeTabKey}
      onTabChange={setActiveTabKey}
    >
      {contentList[activeTabKey]}
    </Card>
  );
};
