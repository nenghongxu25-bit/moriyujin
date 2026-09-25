const fs = require("node:fs");
const sharp = require("sharp");

async function main() {
  const sourcePath = "assets/animation/weather/snow-particle-sheet.png";
  const outputPath = ".tmp/snow-particle-sheet-752.png";
  const source = sharp(sourcePath);
  const metadata = await source.metadata();
  const cellSize = 188;
  const composite = [];
  for (let row = 0; row < 4; row++) {
    for (let column = 0; column < 4; column++) {
      const left = Math.floor(column * metadata.width / 4);
      const top = Math.floor(row * metadata.height / 4);
      const right = Math.floor((column + 1) * metadata.width / 4);
      const bottom = Math.floor((row + 1) * metadata.height / 4);
      const input = await sharp(sourcePath)
        .extract({ left, top, width: right - left, height: bottom - top })
        .resize(cellSize, cellSize, { fit: "fill", kernel: "lanczos3" })
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer();
      composite.push({ input, left: column * cellSize, top: row * cellSize });
    }
  }
  await sharp({ create: { width: 752, height: 752, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(composite)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);
  console.log(JSON.stringify({
    inputBytes: fs.statSync(sourcePath).size,
    outputBytes: fs.statSync(outputPath).size,
    outputPath,
    cellSize
  }));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
