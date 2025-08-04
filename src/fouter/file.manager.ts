import { readdirSync, existsSync, lstatSync, readFileSync, writeFileSync, copyFileSync } from "fs";
import { join, parse } from "path";

export class FileManager {
  public static readFile(path: string) {
    return readFileSync(path, "utf-8");
  }

  public static getFileName(file: string) {
    return parse(file).name === ".fouter" ? "" : parse(file).name;
  }

  public static writeFile(text: string, file: string) {
    return writeFileSync(file, text, "utf-8");
  }

  private readonly _files: string[];

  public constructor(public readonly directory: string) {
    this.Validate(directory);

    // Вынести в константу
    this._files = readdirSync(directory).filter(file => file.endsWith(".fouter"));
  };

  public get files() {
    return this._files;
  }
  

  public resolvePath(path: string) {
    return join(this.directory, path);
  }

  private Validate(directory: string) {
    if (!existsSync(directory)) throw new Error(`directory "${directory}" is not exists`);
    if (!lstatSync(directory).isDirectory()) throw new Error(`path "${directory} is not a directory"`);

    return true;
  }
};

export default FileManager;
