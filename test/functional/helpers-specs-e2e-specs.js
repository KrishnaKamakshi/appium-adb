import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { getAndroidPlatformAndPath, assertZipArchive, rootDir, unzipFile } from '../../lib/helpers.js';
import { fs, tempDir, system } from 'appium-support';
import sinon from 'sinon';
import path from 'path';

function getFixture (file) {
  return path.resolve(__dirname, '..', '..', '..', 'test',
                      'fixtures', file);
}


const apkPath = path.resolve(rootDir, 'test', 'fixtures', 'ContactManager.apk');
chai.use(chaiAsPromised);

describe('Helpers', function () {
  it('getAndroidPlatformAndPath should return empty object when no ANDROID_HOME is set', async function () {
    let android_home = process.env.ANDROID_HOME;
    // temp setting android_home to null.
    delete process.env.ANDROID_HOME;

    try {
      await getAndroidPlatformAndPath().should.eventually.be.rejectedWith(/ANDROID_HOME environment variable was not exported/);
    } finally {
      // resetting ANDROID_HOME
      process.env.ANDROID_HOME = android_home;
    }
  });

  it('getAndroidPlatformAndPath should return platform and path for android', async function () {
    let {platform, platformPath} = await getAndroidPlatformAndPath();
    platform.should.exist;
    platformPath.should.exist;
  });
  it('assertZipArchive should assert valid ZIP archives', async function () {
    await assertZipArchive(apkPath).should.be.fulfilled;
  });

  describe('unzipFile', function () {
    it('should unzip a .zip file', async function () {
      const temp = await tempDir.openDir();
      await fs.copyFile(getFixture('TestZip.zip'), path.resolve(temp, 'TestZip.zip'));
      await unzipFile(path.resolve(temp, 'TestZip.zip'));
      await fs.readFile(path.resolve(temp, 'TestZip', 'a.txt'), 'utf8').should.eventually.equal('Hello World');
      await fs.readFile(path.resolve(temp, 'TestZip', 'b.txt'), 'utf8').should.eventually.equal('Foobar');
    });

    it('should unzip a .zip file (force isWindows to be true so we can test the internal zip library)', async function () {
      const forceWindows = sinon.stub(system, 'isWindows', () => true);
      const temp = await tempDir.openDir();
      await fs.copyFile(getFixture('TestZip.zip'), path.resolve(temp, 'TestZip.zip'));
      await unzipFile(path.resolve(temp, 'TestZip.zip'));
      await fs.readFile(path.resolve(temp, 'TestZip', 'a.txt'), 'utf8').should.eventually.equal('Hello World');
      await fs.readFile(path.resolve(temp, 'TestZip', 'b.txt'), 'utf8').should.eventually.equal('Foobar');
      forceWindows.restore();
    });
  });

});
