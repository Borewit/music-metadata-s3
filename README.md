[![NPM version](https://img.shields.io/npm/v/@music-metadata/s3.svg)](https://npmjs.org/package/@music-metadata/s3)
[![npm downloads](http://img.shields.io/npm/dm/@music-metadata/s3.svg)](https://npmcharts.com/compare/@music-metadata/s3?start=300)
[![Known Vulnerabilities](https://snyk.io/test/github/Borewit/music-metadata-s3/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Borewit/music-metadata-s3?targetFile=package.json)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/Borewit/music-metadata-s3.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Borewit/music-metadata-s3/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Borewit/music-metadata-s3.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Borewit/music-metadata-s3/context:javascript)

# @music-metadata/s3

## Installation

```shell script
npm install @music-metadata/s3
```

Extension for [music-metadata](https://github.com/Borewit/music-metadata) to retrieve metadata from files stored on [Amazon S3 cloud storage](https://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html).

## Reading metadata from Amazon S3 

Example:
```js
const { MusicMetadataS3Client } = require('music-metadata-s3-client');
const S3 = require('aws-sdk/clients/s3');

(async () => {

  const s3 = new S3();
  const mmS3client = new MusicMetadataS3Client(s3); // Pass s3 client to  music-metadata-s3-client

  console.log('Parsing...');
  try {
    const data = await mmS3client.parseS3Object({
        Bucket: 'your-bucket',
        Key: 'My audio files/01 - My audio track.flac'
      }, {
        disableChunked: false // If set to true, fall back to conventional stream
      }
    );
    console.log('metadata:', data);
  } catch (e) {
    console.error(`Oops: ${e.message}`);
  }
})();
```
