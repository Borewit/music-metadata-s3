import * as S3 from 'aws-sdk/clients/s3';
import { IOptions, IAudioMetadata } from 'music-metadata/lib/type';
import { makeTokenizer, IS3Options} from '@tokenizer/s3';
import * as mm from 'music-metadata/lib/core';

export { IPicture, IAudioMetadata, IOptions, ITag, INativeTagDict } from 'music-metadata/lib/type';

interface IMMS3Options extends IOptions, IS3Options {
}

/**
 * Retrieve metadata from Amazon S3 object
 * @param objRequest S3 object request
 * @param options music-metadata options
 * @return Metadata
 */
export async function parseS3Object(s3: S3, objRequest: S3.Types.GetObjectRequest, options?: IMMS3Options): Promise<IAudioMetadata> {
  const s3Tokenizer = await makeTokenizer(s3, objRequest, options);
  return mm.parseFromTokenizer(s3Tokenizer, options);
}
