import { ILayer, ISource, Scene } from '@antv/l7';
// @ts-ignore
import { SAM, SAMGeo } from '@antv/sam';

export interface SatelliteData {
  features: any;
  imageUrl: string;
}

export interface ISamState {
  samModel: SAMGeo;
  currentScene: Scene | null;
  currentSource: ISource | null;
  mapClick: any;
  loading: boolean;
  borderLayer: ILayer | null;
  eventType: string;
  collapsed: boolean;
  satelliteData: SatelliteData[];
}

// 像素坐标
export type CoordsPS = {
  x: number;
  y: number;
};

export interface ISamStateImg {
  imageUrl: string;
  samModel: SAM | null;
  loading: boolean;
  clipImg: string[];
  originImg: HTMLImageElement | null;
  originMaskImg: string[];
  isSelecting: boolean;
  startPoint: CoordsPS;
  endPoint: CoordsPS;
  clipType: string;
  eventPoint: number[] | number[][];
}
