[![Build Status](https://travis-ci.org/Borewit/music-metadata-s3.svg?branch=master)](https://travis-ci.org/Borewit/music-metadata-s3)
[![NPM version](https://img.shields.io/npm/v/@music-metadata/s3.svg)](https://npmjs.org/package/@music-metadata/s3)
[![npm downloads](https://img.shields.io/npm/dm/@music-metadata/s3.svg)](https://npmcharts.com/compare/streaming-http-token-reader,@music-metadata/s3?start=300)
[![Known Vulnerabilities](https://snyk.io/test/github/Borewit/music-metadata-s3/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Borewit/music-metadata-s3?targetFile=package.json)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/Borewit/music-metadata-s3.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Borewit/music-metadata-s3/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Borewit/music-metadata-s3.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Borewit/music-metadata-s3/context:javascript)

# @music-metadata/s3
Extension for [music-metadata](https://github.com/Borewit/music-metadata) to retrieve metadata from files stored on [Amazon Web Services (AWS) S3 cloud storage](https://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html).

The magic of this module is, it is able to extract the metadata from your audio files, without downloading and parsing the entire file.
Using [@tokenizer/range](https://github.com/Borewit/tokenizer-range), it partial downloads the files, just accessing the chunks holding the metadata.

## Installation
```shell script
npm install @music-metadata/s3
```

## Reading audio metadata from Amazon S3 

Read metadata from 'My audio files/01 - My audio track.flac' stored in the S3 cloud:
```js
const { MMS3Client } = require('@music-metadata/s3');
const S3 = require('aws-sdk/clients/s3');

(async () => {

  const s3 = new S3();
  const mmS3client = new MMS3Client(s3); // Pass S3 client to music-metadata-S3-client

  console.log('Parsing...');
  try {
    const data = await mmS3client.parseS3Object({
        Bucket: 'your-bucket',
        Key: 'My audio files/01 - My audio track.flac'
      }
    );
    console.log('metadata:', data);
  } catch (e) {
    console.error(`Oops: ${e.message}`);
  }
})();
```

Using conventional streaming using the `disableChunked` flag:
```js
const { MMS3Client } = require('@music-metadata/s3');
const S3 = require('aws-sdk/clients/s3');

(async () => {

  const s3 = new S3();
  const mmS3client = new MMS3Client(s3); // Pass S3 client to music-metadata-S3-client

  console.log('Parsing...');
  try {
    const data = await mmS3client.parseS3Object({
        Bucket: 'your-bucket',
        Key: 'My audio files/01 - My audio track.flac'
      }, {
        disableChunked: true // Disable chunked transfer
      }
    );
    console.log('metadata:', data);
  } catch (e) {
    console.error(`Oops: ${e.message}`);
  }
})();
```

## Options

| option           |type       |description                                                    |
|------------------|-----------|---------------------------------------------------------------|
| `disableChunked` | `boolean` | set to `true` to switch to conventional sequential streaming. |

Other options are inherited from [music-metadata](https://github.com/Borewit/music-metadata#options)
