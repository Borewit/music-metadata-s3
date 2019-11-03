# music-metadata-s3-client

Extension for [music-metadata](https://github.com/Borewit/music-metadata) to retrieve metadata from files stored on [Amazon S3 cloud storage](https://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html).

## Reading metadata from Amazon S3 

Example:
````js
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
