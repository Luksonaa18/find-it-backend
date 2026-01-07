import { Injectable } from '@nestjs/common';
import { S3 } from "aws-sdk"

@Injectable()
export class S3Service {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      region: process.env.AWS_BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadFileBuffer(buffer: Buffer, filename: string, mimetype: string) {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: filename,
      Body: buffer,
      ContentType: mimetype,
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }
}
