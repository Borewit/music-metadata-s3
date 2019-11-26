import * as S3 from 'aws-sdk/clients/s3';
import { parseFromTokenizer, parseStream } from 'music-metadata/lib/core';
import { RangeRequestTokenizer, IRangeRequestClient, IRangeRequestResponse, parseContentRange } from '@tokenizer/range';
import { AWSError, Request } from 'aws-sdk';
import { IOptions, IAudioMetadata } from 'music-metadata/lib/type';

export { IPicture, IAudioMetadata, IOptions, ITag, INativeTagDict } from 'music-metadata/lib/type';

interface IS3Options extends IOptions {
  /**
   * Flag to disable chunked transfer, use conventional HTTPS stream instead
   */
  disableChunked?: boolean;
}

/**
 * Use S3-client to execute actual HTTP-requests.
 */
class S3Request implements IRangeRequestClient {

  constructor(private s3client: MMS3Client, private objRequest: S3.Types.GetObjectRequest) {
  }

  public async getResponse(method, range: number[]): Promise<IRangeRequestResponse> {

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
  public getRangedRequest(objRequest: S3.Types.GetObjectRequest, range: number[]): Request<S3.Types.GetObjectOutput, AWSError> {
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
      const rangeRequestTokenizer = new RangeRequestTokenizer(s3Request, {
        avoidHeadRequests: true
      });
      await rangeRequestTokenizer.init();
      return parseFromTokenizer(rangeRequestTokenizer, rangeRequestTokenizer.contentType, options);
    }
  }
}
