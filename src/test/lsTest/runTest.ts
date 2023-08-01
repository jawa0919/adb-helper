import * as fs from "node:fs";
import * as path from "node:path";
import { lsParse } from "../../core/utils/parseString";

function main() {
  console.log("🚀 ~ file: runTest.ts:11 ~ main:", __dirname);
  ["24.txt", "25.txt", "26.txt", "31.txt", "34.txt"].forEach((r) => {
    const url = path.join(__dirname, r);
    const stdout = fs.readFileSync(url).toString();
    console.log("🚀 ~ file: runTest.ts:11 ~ main ~ out:", stdout);
    let res: [string, any][] = [];
    stdout.split(/\n|\r\n/).forEach((line) => {
      let t = lsParse(line.trim());
      if (t) res.push(t);
    });
    console.log("🚀 ~ file: runTest.ts:17 ~ main ~ res:", res);
  });
}

main();
