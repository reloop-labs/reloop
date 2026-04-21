import { S3Client } from "@aws-sdk/client-s3";
import { uploadConfig } from "@be/upload/upload.config";

export const s3Client = new S3Client({
  region: uploadConfig.S3.REGION,
  endpoint: uploadConfig.S3.ENDPOINT,
  credentials: {
    accessKeyId: uploadConfig.S3.ACCESS_KEY || "",
    secretAccessKey: uploadConfig.S3.SECRET_KEY || "",
  },
  forcePathStyle: uploadConfig.S3.FORCE_PATH_STYLE === "true",
});
