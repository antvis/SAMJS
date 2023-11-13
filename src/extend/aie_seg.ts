import OSS from 'ali-oss';
import uniqueId from 'uniqid';
import { AIE_SEG_OPTIONS } from '../api/contanst';
import { SAMGeo } from '../core/sam-geo';
import { image2Base64 } from '../utils/mask';

export type STSModule = {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  expiration: string;
  fileKey: string;
  fileName: string;
  initTs: number;
  region: string;
  securityToken: string;
};
export type ImgDownloadModule = {
  img: string;
  thumbnail: string;
};

export type ImgProcessModule = {
  process: string;
};
export type SaveImgInfo = {
  imgUploadToken: STSModule;
  imgDownload: ImgDownloadModule;
  imgProcess: ImgProcessModule;
  point: [number, number];
  imageExtent: number[];
  tileDataURL: string;
  canvasInfo: {
    width: number;
    height: number;
  };
};

/**
 * 创建oss-client
 */
type OSSProps = {
  ossInfo: STSModule;
  imgUrl: string;
};

export function createFileFromBase64Url(url: string, filename: string) {
  return new Promise<File>((resolve) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const file = new File([blob], filename, { type: blob.type });
        resolve(file);
      });
  });
}

export async function uploadAliOss(props: OSSProps) {
  const { ossInfo, imgUrl } = props;
  // 创建ali-oss
  const aliOssClient = new OSS({
    secure: true,
    refreshSTSTokenInterval: 60 * 1000,
    timeout: 60 * 1000,
    accessKeyId: ossInfo.accessKeyId,
    accessKeySecret: ossInfo.accessKeySecret,
    stsToken: ossInfo.securityToken,
    bucket: ossInfo.bucket,
  });
  try {
    const files = await createFileFromBase64Url(imgUrl, 'tile.png');
    await aliOssClient.multipartUpload(ossInfo.fileKey, files, {});
  } catch (error) {}
}

// aie Seg

// 1. 上传图片到oss
// 2. 调用aie-seg接口
// 3. 下载图片

export class AIESEG extends SAMGeo {
  private imageInfo: SaveImgInfo;

  // 生成图像embedding
  public async generateEmbedding() {
    const keyValue = uniqueId('ai-earth');
    const uploadSTS = await fetch(
      `${AIE_SEG_OPTIONS.host}${AIE_SEG_OPTIONS.imgUploadToken}?oriFileName=${keyValue}.png`,
    );
    const stsResult = await uploadSTS.json();
    if (stsResult.module) {
      const base64 = image2Base64(this.image);
      // 创建file & 上传 ali-oss
      await uploadAliOss({ ossInfo: stsResult.module, imgUrl: base64 });
      // 获取图像下载链接
      const fileName = stsResult.module.fileName;
      const getImgUrl = await fetch(
        `${AIE_SEG_OPTIONS.host}${AIE_SEG_OPTIONS.imgDownloadUrl}?fileName=${fileName}`,
      );
      const downImgUrl = await getImgUrl.json();

      // 图像embedding
      const bodyParams = { type: 'ref', fileName };
      const getImgProcess = await fetch(
        `${AIE_SEG_OPTIONS.host}${AIE_SEG_OPTIONS.imgProcess}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyParams),
        },
      );
      const imgProcessUrl = await getImgProcess.json();
      const {
        extent = [-180, -84, 180, 84],
        width,
        height,
      } = this.imageOption!;
      const saveImgInfo: SaveImgInfo = {
        imgDownload: downImgUrl.module,
        imgProcess: imgProcessUrl.module,
        imgUploadToken: stsResult.module,
        point: [(extent[2] - extent[0]) / 2, (extent[3] - extent[1]) / 2], // TODO mapcenter
        imageExtent: extent!,
        tileDataURL: base64,
        canvasInfo: {
          width,
          height,
        },
      };
      this.imageInfo = saveImgInfo;
      return saveImgInfo;
    }
  }
  // https://code.alipay.com/LocationInsight/li-aiearth-assets/blob/master/src/widgets/EarthToolControl/Component.tsx#L261
  ImgPredict() {}

  // new
  imgPanopticPredict() {}
}
