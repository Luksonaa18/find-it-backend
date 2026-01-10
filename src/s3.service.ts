// src/s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3 = new S3Client({ region: process.env.AWS_REGION });

  // New method to upload buffer
  async uploadFileBuffer(
    buffer: Buffer,
    filename: string,
    contentType: string,
  ): Promise<string> {
    const bucket = process.env.AWS_BUCKET;
    if (!bucket) throw new Error('AWS_BUCKET env variable is not set');

    const params = {
      Bucket: bucket,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    };

    await this.s3.send(new PutObjectCommand(params));

    // Return the public URL (adjust depending on your bucket permissions)
    return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
  }
}
