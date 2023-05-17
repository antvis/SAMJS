import { ILayer, ISource, Scene } from '@antv/l7';
// @ts-ignore
import { SAMGeo } from 'sam.js';

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
