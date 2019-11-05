//
// Example chunked streaming audio track from S3 buckets into music-metadata parser
//

import * as S3 from 'aws-sdk/clients/s3';
import { parseFromTokenizer, parseStream } from 'music-metadata/lib/core';
import * as Type from 'music-metadata/lib/type';
import { StreamingHttpTokenReader, IHttpClient, IHttpResponse } from 'streaming-http-token-reader';
import { parseContentRange } from 'streaming-http-token-reader/lib/http-client';
import { AWSError, Request } from 'aws-sdk';

export type IAudioMetadata = Type.IAudioMetadata;
export type IOptions = Type.IOptions;
export type ITag = Type.ITag;
export type INativeTagDict = Type.INativeTagDict;

interface IS3Options extends IOptions {
  /**
   * Disable chunked transfer, use conventional stream
   */
  disableChunked: boolean;
}

/**
 * Use S3-client to execute actual HTTP-requests
 */
class S3Request implements IHttpClient {

  constructor(private s3client: MMS3Client, private objRequest: S3.Types.GetObjectRequest) {
  }

  async getResponse(method, range: number[]): Promise<IHttpResponse> {

    return this.s3client.getRangedRequest(this.objRequest, range).promise().then(data => {
      return {
        contentLength: data.ContentLength,
        contentType: data.ContentType,
        contentRange: parseContentRange(data.ContentRange),
        arrayBuffer: async () => {
          return data.Body as Buffer;
        }
      };
    });
  }
}

export class MMS3Client {

  constructor(private s3: S3) {
  }

  /**
   * Do a ranged request, this method will be called by streaming-http-token-reader
   * @param objRequest
   * @param range
   */
  getRangedRequest(objRequest: S3.Types.GetObjectRequest, range: number[]): Request<S3.Types.GetObjectOutput, AWSError> {
    const rangedRequest = {...objRequest}; // Copy request
    rangedRequest.Range = `bytes=${range[0]}-${range[1]}`;
    return this.s3.getObject(rangedRequest);
  }

  /**
   * Retrieve metadata from Amazon S3 object
   * @param objRequest S3 object request
   * @param options music-metadata options
   */
  public async parseS3Object(objRequest: S3.Types.GetObjectRequest, options?: IS3Options): Promise<IAudioMetadata> {
    if (options && options.disableChunked) {

      const info = await this.getRangedRequest(objRequest, [0, 0]).promise();

      const stream = this.s3
        .getObject(objRequest)
        .createReadStream();
      return parseStream(stream, info.ContentType, options);
    } else {
      const s3Request = new S3Request(this, objRequest);
      const streamingHttpTokenReader = new StreamingHttpTokenReader(s3Request, {
        avoidHeadRequests: true
      });
      await streamingHttpTokenReader.init();
      return parseFromTokenizer(streamingHttpTokenReader, streamingHttpTokenReader.contentType, options);
    }
  }

}

