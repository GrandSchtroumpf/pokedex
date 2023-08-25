import type { Endpoints } from "./api";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { cwd } from "node:process";

export async function writeList<K extends Endpoints>(name: K, data: any[]) {
  console.log(data);
  const content = JSON.stringify(data);
  const path = join(cwd(), 'public', 'list', `${name}.json`);
  if (!existsSync(path)) await mkdir(join(path, '..'), { recursive: true });
  return writeFile(path, content);
}