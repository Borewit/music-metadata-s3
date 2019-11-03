//
// Example chunked streaming audio track from S3 buckets into music-metadata parser
//

import * as S3 from 'aws-sdk/clients/s3';
import * as mm from 'music-metadata';
import {StreamingHttpTokenReader, IHttpClient, IHttpResponse} from 'streaming-http-token-reader';
import {parseContentRange} from 'streaming-http-token-reader/lib/http-client';
import { AWSError, Request } from 'aws-sdk';

interface IS3Options extends mm.IOptions {
  /**
   * Disable chunked transfer, use conventional stream
   */
  disableChunked: boolean;
}

/**
 * Use S3-client to execute actual HTTP-requests
 */
class S3Request implements IHttpClient {

  constructor(private s3client: MusicMetadataS3Client, private objRequest: S3.Types.GetObjectRequest) {
  }

  async getResponse(method, range: number[]): Promise<IHttpResponse> {

    return this.s3client.getRangedRequest(this.objRequest, range).promise().then(data => {
      return {
        contentLength: data.ContentLength,
        contentType: data.ContentType,
        contentRange: parseContentRange(data.ContentRange),
        arrayBuffer: async() => {
          return data.Body as Buffer
        }
      }
    });
  }
}

export class MusicMetadataS3Client {

  constructor(private s3: S3) {
  }

  /**
   * Do a ranged request, this method will be called by streaming-http-token-reader
   * @param objRequest
   * @param range
   */
  getRangedRequest(objRequest: S3.Types.GetObjectRequest, range: number[]): Request<S3.Types.GetObjectOutput, AWSError> {
    const rangedRequest = Object.assign({}, objRequest); // Copy request
    rangedRequest.Range = `bytes=${range[0]}-${range[1]}`;
    return this.s3.getObject(rangedRequest);
  }

  /**
   * Retrieve metadata from Amazon S3 object
   * @param objRequest S3 object request
   * @param options music-metadata options
   */
  public async parseS3Object(objRequest: S3.Types.GetObjectRequest, options?: IS3Options): Promise<mm.IAudioMetadata> {
    if (options && options.disableChunked) {

      const info = await this.getRangedRequest(objRequest, [0, 0]).promise();

      const stream = this.s3
        .getObject(objRequest)
        .createReadStream();
      return mm.parseStream(stream, info.ContentType, options);
    } else {
      const s3Request = new S3Request(this, objRequest);
      const streamingHttpTokenReader = new StreamingHttpTokenReader(s3Request,  {
        avoidHeadRequests: true
      });
      await streamingHttpTokenReader.init();
      return mm.parseFromTokenizer(streamingHttpTokenReader, streamingHttpTokenReader.contentType, options);
    }
  }

}

