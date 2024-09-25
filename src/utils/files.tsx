import fs from "fs";
import path from "path";

export const readFile = (pathToFile: string) => {
  const filePath = path.join(process.cwd(), pathToFile);
  return fs.readFileSync(filePath, "utf8");
};
