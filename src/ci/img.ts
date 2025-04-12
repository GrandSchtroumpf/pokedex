import { existsSync } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";
import sharp from "sharp";


const imgBuffer: Record<string, Promise<ArrayBuffer>> = {};
const retries: Record<string, number> = {}
export async function getImgBuffer(url: string) {
  if (!(url in imgBuffer)) {
    const tryDownload = (): Promise<ArrayBuffer> => {
      retries[url] ||= 0;
      retries[url]++;
      if (retries[url] > 4) throw new Error(`Cannot get Image after 4 retries: ${url}`)
      return fetch(url)
        .then(res => res.arrayBuffer())
        .catch(() => tryDownload());
    }
    imgBuffer[url] = tryDownload();
  }
  return imgBuffer[url];
}

interface OptimizeImgConfig {
  folder: string;
  url: string;
  sizes: number[];
}
export async function optimizeImg({ folder, url, sizes }: OptimizeImgConfig) {
  const path = join(cwd(), 'public', 'imgs', folder);
  if (!existsSync(path)) await mkdir(path, { recursive: true });
  const files = await readdir(path);
  const operations = [];
  if (!files.includes('original.webp')) {
    operations.push((buffer: ArrayBuffer) => sharp(buffer).toFormat('webp').toFile(join(path, `original.webp`)));
  }
  for (const width of sizes) {
    if (files.includes(`${width}w.webp`)) continue;
    operations.push((buffer: ArrayBuffer) => sharp(buffer).toFormat('webp').resize({ width }).toFile(join(path, `${width}w.webp`)));
  }
  if (!operations.length) return;
  
  // Get img only if you need it
  const buffer = await getImgBuffer(url);
  await Promise.allSettled(operations.map(fn => fn(buffer)));
}