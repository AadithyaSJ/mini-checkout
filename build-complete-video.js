const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const slidesDir = path.join(baseDir, 'slides');
const audioDir = path.join(baseDir, 'audio');
const videoDir = path.join(baseDir, 'videos');

if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

console.log('=== COMPILING COMPLETE PRESENTATION VIDEO WITH VOICEOVER ===');

const segments = [
  { slide: 'slide1.png', audio: 'track1_intro.wav', out: 'seg1.mp4' },
  { slide: 'slide2.png', audio: 'track2_testplan.wav', out: 'seg2.mp4' },
  { slide: 'slide3.png', audio: 'track3_testmatrix.wav', out: 'seg3.mp4' },
  { slide: 'slide4.png', audio: 'track4_demo.wav', out: 'seg4.mp4' },
  { slide: 'slide5.png', audio: 'track5_evaluation.wav', out: 'seg5.mp4' }
];

const segFiles = [];

segments.forEach((seg, idx) => {
  const slidePath = path.join(slidesDir, seg.slide);
  const audioPath = path.join(audioDir, seg.audio);
  const outPath = path.join(videoDir, seg.out);

  console.log(`[SEGMENT ${idx + 1}/5] Encoding ${seg.slide} + ${seg.audio} -> ${seg.out}...`);

  const cmd = `ffmpeg -y -loop 1 -i "${slidePath}" -i "${audioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -r 30 "${outPath}"`;
  execSync(cmd, { stdio: 'inherit' });
  segFiles.push(outPath);
});

// Create concat list file
const concatListPath = path.join(videoDir, 'concat_list.txt');
const listContent = segFiles.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n');
fs.writeFileSync(concatListPath, listContent);

// Concatenate all segments into master MP4
const finalMp4 = path.join(videoDir, 'mini-checkout-complete-walkthrough.mp4');
console.log(`\n[FINAL] Merging all segments into: ${finalMp4}...`);

const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c copy "${finalMp4}"`;
execSync(concatCmd, { stdio: 'inherit' });

// Clean up temporary segment files
segFiles.forEach((f) => {
  if (fs.existsSync(f)) fs.unlinkSync(f);
});
if (fs.existsSync(concatListPath)) fs.unlinkSync(concatListPath);

const stats = fs.statSync(finalMp4);
console.log(`\n=== SUCCESS: MASTER VIDEO GENERATED ===`);
console.log(`Location: ${finalMp4}`);
console.log(`Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
