import { Button, message, Table, Tooltip } from 'antd';
import React from 'react';
import { ISamState, SatelliteData } from '../../../typing';

interface ITable {
  satelliteData: ISamState['satelliteData'];
  setSatelliteData: (
    samInfo: (SatelliteData & { maskImg: string; key: string })[],
  ) => void;
}

export const ShowTable = (props: ITable) => {
  const { satelliteData, setSatelliteData } = props;

  const deleteData = (record: Record<string, any>) => {
    // @ts-ignore
    setSatelliteData((pre) => {
      return [...pre.filter((item) => item.imageUrl !== record.image)];
    });
    message.success('删除成功');
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'key',
      width: 60,
    },
    {
      title: '形状',
      dataIndex: 'geometry',
      ellipsis: true,
      render: (geometry) => (
        <Tooltip placement="topLeft" title={geometry}>
          {geometry}
        </Tooltip>
      ),
    },
    {
      title: '图片',
      dataIndex: 'image',
      width: 80,
      render: (src) => (
        <Tooltip
          color="#fff"
          placement="topLeft"
          title={<img src={src} style={{ width: 200, height: 200 }} />}
        >
          <img src={src} style={{ width: 30, height: 30 }} />
        </Tooltip>
      ),
    },
    {
      title: '删除',
      width: 80,
      render: (_: any, record: any) => {
        return (
          <Button
            type="primary"
            danger
            size="small"
            onClick={() => deleteData(record)}
          >
            删除
          </Button>
        );
      },
    },
  ];
  const dataSource = satelliteData.map((item, index) => {
    const geometry = item.features[0]?.geometry;
    return {
      key: index,
      geometry: JSON.stringify(geometry),
      image: item.imageUrl,
    };
  });
  return (
    <Table
      size="small"
      columns={columns}
      dataSource={[...dataSource].reverse()}
      scroll={{ y: 400 }}
      pagination={false}
    />
  );
};
