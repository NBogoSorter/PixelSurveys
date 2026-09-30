// Regenerates every favicon in public/ from one master image.
//
//   node scripts/make-favicons.mjs media/favicon-master.png
//
// Run it when the icon changes. The outputs are committed, so a normal build
// does not need this - it exists so nobody has to guess what sizes exist or
// how favicon.ico was assembled.
//
// sharp comes in with Astro rather than as a direct dependency, which is why
// this script lives in the project root rather than anywhere else: Node has to
// resolve sharp from the project's node_modules.
import { Buffer } from "node:buffer";
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/make-favicons.mjs <master image>");
  process.exit(1);
}

/** Sizes written straight to public/ and referenced from Base.astro. */
const PNG_OUTPUTS = [
  [180, "public/apple-touch-icon.png"], // iOS home screen
  [192, "public/icon-192.png"], // Android / high-DPI tabs
  [512, "public/icon-512.png"], // largest, for anything that wants a big one
];

/** Sizes packed into favicon.ico. 48 is what Google's search results use. */
const ICO_SIZES = [16, 32, 48];

const render = (size) =>
  sharp(src)
    .resize(size, size, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toBuffer();

for (const [size, dest] of PNG_OUTPUTS) {
  writeFileSync(dest, await render(size));
  console.log(`  ${String(size).padStart(3)}px  ${dest}`);
}

// ICO container. Each entry holds a whole PNG rather than a raw bitmap, which
// every browser since Vista reads and which keeps the file small.
const images = await Promise.all(ICO_SIZES.map(render));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // 1 = icon
header.writeUInt16LE(images.length, 4);

let offset = 6 + images.length * 16;
const entries = images.map((png, i) => {
  const size = ICO_SIZES[i];
  const e = Buffer.alloc(16);
  e.writeUInt8(size === 256 ? 0 : size, 0); // 0 means 256
  e.writeUInt8(size === 256 ? 0 : size, 1);
  e.writeUInt8(0, 2); // palette size, 0 for PNG
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});

writeFileSync(
  "public/favicon.ico",
  Buffer.concat([header, ...entries, ...images]),
);
console.log(`  ${ICO_SIZES.join("/")}px  public/favicon.ico`);
