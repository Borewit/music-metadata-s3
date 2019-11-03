//
// Example streaming audio track from S3 buckets into music-metadata parser
//

const { MusicMetadataS3Client } = require('../lib');
const S3 = require('aws-sdk/clients/s3');

(async () => {

  const s3 = new S3();
  const mmS3client = new MusicMetadataS3Client(s3); // Pass s3 client to  music-metadata-s3-client

  console.log('Parsing...');
  try {
    const data = await mmS3client.parseS3Object({
        Bucket: 'music-metadata',
        Key: 'Various Artists - 2008 - netBloc Vol 13 (color in a world of monochrome) {BSCOMP0013} [MP3-V0]/01 - Nils Hoffmann - Sweet Man Like Me.mp3'
      }, {
        disableChunked: false // If set to true, fall back to conventional stream
      }
    );
    console.log('metadata:', data);
  } catch (e) {
    console.error(`Oops: ${e.message}`);
  }
})();
