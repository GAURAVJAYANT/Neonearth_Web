const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

delete process.env.JAVA_HOME;

const RESULTS_DIR = path.resolve('allure-results');
const TEMP_ROOT = path.resolve('allure-report-temp');
const REPORT_DIR = path.join(TEMP_ROOT, `download-${Date.now()}`);
let zipFile = path.resolve('allure-report.zip');

function crc32(buffer) {
  let crc = ~0;

  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return ~crc >>> 0;
}

function dosDateTime(date) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);
  const dosDate =
    ((year - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();

  return { dosTime, dosDate };
}

function collectFiles(dir, root = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath, root));
    } else if (entry.isFile()) {
      files.push({
        fullPath,
        relativePath: path.relative(root, fullPath).replace(/\\/g, '/'),
      });
    }
  }

  return files;
}

function uint16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value);
  return buffer;
}

function createZip(sourceDir, zipPath) {
  const files = collectFiles(sourceDir);
  const chunks = [];
  const centralDirectory = [];
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.relativePath);
    const content = fs.readFileSync(file.fullPath);
    const compressed = zlib.deflateRawSync(content);
    const checksum = crc32(content);
    const stat = fs.statSync(file.fullPath);
    const { dosTime, dosDate } = dosDateTime(stat.mtime);

    const localHeader = Buffer.concat([
      uint32(0x04034b50),
      uint16(20),
      uint16(0),
      uint16(8),
      uint16(dosTime),
      uint16(dosDate),
      uint32(checksum),
      uint32(compressed.length),
      uint32(content.length),
      uint16(name.length),
      uint16(0),
      name,
    ]);

    chunks.push(localHeader, compressed);

    centralDirectory.push(Buffer.concat([
      uint32(0x02014b50),
      uint16(20),
      uint16(20),
      uint16(0),
      uint16(8),
      uint16(dosTime),
      uint16(dosDate),
      uint32(checksum),
      uint32(compressed.length),
      uint32(content.length),
      uint16(name.length),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(offset),
      name,
    ]));

    offset += localHeader.length + compressed.length;
  }

  const centralDirectoryStart = offset;
  const centralDirectoryBuffer = Buffer.concat(centralDirectory);
  const endRecord = Buffer.concat([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(files.length),
    uint16(files.length),
    uint32(centralDirectoryBuffer.length),
    uint32(centralDirectoryStart),
    uint16(0),
  ]);

  fs.writeFileSync(zipPath, Buffer.concat([...chunks, centralDirectoryBuffer, endRecord]));
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function removeDirectoryWithRetry(dir, attempts = 5) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt === attempts) {
        console.warn(`Could not remove temp report folder: ${error.message}`);
        return;
      }
      sleep(500);
    }
  }
}

function removeFileWithRetry(file, attempts = 5) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      fs.rmSync(file, { force: true });
      return true;
    } catch (error) {
      if (attempt === attempts) {
        console.warn(`Could not replace ${file}: ${error.message}`);
        return false;
      }
      sleep(500);
    }
  }
}

function main() {
  if (!fs.existsSync(RESULTS_DIR)) {
    throw new Error(`Allure results not found: ${RESULTS_DIR}. Run "npm test" first.`);
  }

  if (fs.existsSync(zipFile) && !removeFileWithRetry(zipFile)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    zipFile = path.resolve(`allure-report-${stamp}.zip`);
    console.log(`Using alternate archive name: ${zipFile}`);
  }

  fs.mkdirSync(TEMP_ROOT, { recursive: true });

  console.log('Generating Allure HTML report...');
  if (process.platform === 'win32') {
    const reportDirArg = REPORT_DIR.replace(/\//g, '\\');
    execFileSync('cmd.exe', ['/d', '/c', `node_modules\\.bin\\allure.cmd generate allure-results --clean -o ${reportDirArg}`], {
      stdio: 'inherit',
    });
  } else {
    const allureBin = path.resolve('node_modules/.bin/allure');
    execFileSync(allureBin, ['generate', 'allure-results', '--clean', '-o', REPORT_DIR], {
      stdio: 'inherit',
    });
  }

  console.log('Creating downloadable archive...');
  createZip(REPORT_DIR, zipFile);
  console.log(`Allure report download created: ${zipFile}`);

  removeDirectoryWithRetry(REPORT_DIR);
}

main();
