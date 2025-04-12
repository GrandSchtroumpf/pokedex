import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { cwd } from "node:process";

export function writeData(name: string, data: any) {
  const content = JSON.stringify(data);
  const path = join(cwd(), 'public', 'data', `${name}.json`);
  return async () => {
    if (!existsSync(path)) await mkdir(join(path, '..'), { recursive: true });
    return writeFile(path, content);
  }
}