const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, 'audio');
const tracks = [
  'track1_intro.wav',
  'track2_testplan.wav',
  'track3_testmatrix.wav',
  'track4_demo.wav',
  'track5_evaluation.wav'
];

let totalDataLength = 0;
const pcmChunks = [];
let sampleRate = 22050;
let channels = 1;
let bitsPerSample = 16;

// 1 second silence = sampleRate * channels * (bitsPerSample / 8) bytes
const silenceBuffer = Buffer.alloc(sampleRate * 2);

tracks.forEach((trackName, idx) => {
  const filePath = path.join(audioDir, trackName);
  const buf = fs.readFileSync(filePath);

  channels = buf.readUInt16LE(22);
  sampleRate = buf.readUInt32LE(24);
  bitsPerSample = buf.readUInt16LE(34);

  // find 'data' chunk
  let pos = 12;
  while (pos < buf.length - 8) {
    const chunkId = buf.toString('ascii', pos, pos + 4);
    const chunkSize = buf.readUInt32LE(pos + 4);
    if (chunkId === 'data') {
      const data = buf.subarray(pos + 8, pos + 8 + chunkSize);
      pcmChunks.push(data);
      totalDataLength += data.length;
      break;
    }
    pos += 8 + chunkSize;
  }

  // add silence between tracks
  if (idx < tracks.length - 1) {
    pcmChunks.push(silenceBuffer);
    totalDataLength += silenceBuffer.length;
  }
});

// Build output WAV header (44 bytes)
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + totalDataLength, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16); // subchunk1 size
header.writeUInt16LE(1, 20); // PCM format
header.writeUInt16LE(channels, 22);
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28); // byte rate
header.writeUInt16LE(channels * (bitsPerSample / 8), 32); // block align
header.writeUInt16LE(bitsPerSample, 34);
header.write('data', 36);
header.writeUInt32LE(totalDataLength, 40);

const fullWav = Buffer.concat([header, ...pcmChunks]);
const outPath = path.join(audioDir, 'full_walkthrough_voiceover.wav');
fs.writeFileSync(outPath, fullWav);

console.log(`Full concatenated voiceover generated: ${outPath} (${(fullWav.length / (1024 * 1024)).toFixed(2)} MB)`);
