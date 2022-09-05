import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';

const uploadImagesToCloudinary = (image: Buffer, filename?: boolean) => {
    return new Promise<UploadApiResponse>((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            {
                use_filename: filename ? true : false,
            },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(image).pipe(stream);
    });
}

const uploadRawToCloudinary = (image: Buffer, originalName: string, filename?: boolean) => {
    return new Promise<UploadApiResponse>((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            {
                use_filename: filename ? true : false,
                resource_type: "raw",
                public_id: originalName
            },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(image).pipe(stream);
    });
}

export { uploadImagesToCloudinary, uploadRawToCloudinary }