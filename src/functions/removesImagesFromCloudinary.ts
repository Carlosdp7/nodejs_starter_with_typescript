import { v2 as cloudinary } from 'cloudinary';

const removeImagesFromCloudinary = (imageId: string) => {
  return new Promise<any>((resolve, reject) => {
    cloudinary.uploader.destroy(imageId,
      (error: any, result: any) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
  });
}

export { removeImagesFromCloudinary }