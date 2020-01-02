const {parseS3Object} = require('../lib');
const S3 = require('aws-sdk/clients/s3');
const {assert} = require('chai');

describe('Parse audio files from AWS S3 cloud', function () {

  this.timeout(20000);
  const s3 = new S3();

  describe('Transfer mode: chunked', () => {

    it('explicitly set', async () => {

      const metadata = await parseS3Object(s3, {
          Bucket: 'music-metadata',
          Key: 'Various Artists - 2008 - netBloc Vol 13 (color in a world of monochrome) {BSCOMP0013} [MP3-V0]/01 - Nils Hoffmann - Sweet Man Like Me.mp3'
        }, {
          disableChunked: false
        }
      );
      const {format} = metadata;
      assert.equal(format.container, 'MPEG', 'format.container');
      assert.equal(format.sampleRate, 44100, 'format.sampleRate');
      assert.deepEqual(format.tagTypes, ['ID3v2.4'], 'format.tagTypes');
    });

    it('default options', async () => {

      const metadata = await parseS3Object(s3, {
          Bucket: 'music-metadata',
          Key: 'Various Artists - 2008 - netBloc Vol 13 (color in a world of monochrome) {BSCOMP0013} [MP3-V0]/01 - Nils Hoffmann - Sweet Man Like Me.mp3'
        }
      );
      const {format} = metadata;
      assert.equal(format.container, 'MPEG', 'format.container');
      assert.equal(format.sampleRate, 44100, 'format.sampleRate');
      assert.deepEqual(format.tagTypes, ['ID3v2.4'], 'format.tagTypes');
    });

  });

  it('Transfer mode: conventional', async () => {

    const metadata = await parseS3Object(s3, {
        Bucket: 'music-metadata',
        Key: 'Various Artists - 2008 - netBloc Vol 13 (color in a world of monochrome) {BSCOMP0013} [MP3-V0]/01 - Nils Hoffmann - Sweet Man Like Me.mp3'
      }, {
        disableChunked: true
      }
    );
    const {format} = metadata;
    assert.equal(format.container, 'MPEG', 'format.container');
    assert.equal(format.sampleRate, 44100, 'format.sampleRate');
    assert.deepEqual(format.tagTypes, ['ID3v2.4'], 'format.tagTypes');
  });

})
;
