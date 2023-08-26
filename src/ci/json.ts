import type { Endpoints } from "./api";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { cwd } from "node:process";

export async function writeData<K extends Endpoints>(name: K, data: any) {
  const content = JSON.stringify(data);
  const path = join(cwd(), 'src', 'data', `${name}.json`);
  if (!existsSync(path)) await mkdir(join(path, '..'), { recursive: true });
  return writeFile(path, content);
}