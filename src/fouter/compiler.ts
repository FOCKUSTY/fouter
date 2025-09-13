import { existsSync } from "fs";
import { ARGUMENT, ARGUMENT_DATA, FOUTER } from "./constants";
import FileManager from "./file.manager";

const OVERWRRITE_TEXT = `// FOUTER__OVERWRITE_THIS \\\\`;
const COMPILED_OVERWRRITE_TEXT = `// FOUTER__COMPILED__OVERWRITE_THIS \\\\`;
const COMPILED_OVERWRRITE_TEXT_FOR_REGEXP = `\\/\\/ FOUTER__COMPILED__OVERWRITE_THIS \\\\\\\\`;
const COMPILED_OVERWRITE_TEXT_REGEXP = new RegExp(`${COMPILED_OVERWRRITE_TEXT_FOR_REGEXP}\\s*([\\w\\W]*)\\s*${COMPILED_OVERWRRITE_TEXT_FOR_REGEXP}`, "gi")

type Route = Record<string, {
  file: string,
  parent: string,
  method: string,
  path: string,
  return: string,
  arguments: { [key: string]: { [key: string]: string } }
}>;

export class Compiler {
  private readonly _file_manager: FileManager;

  public constructor(
    public readonly inputDir: string,
    public readonly outputFile: string,

    /**
     * This variable uses to write into file and do not overwrite it
     * 
     * IF TRUE
     *  your file will overwrited
     * 
     * IF FALSE
     *  compiler overwrited next value: `// FOUTER__OVERWRITE_THIS \\`
     *  and paste next:
     * ```
     * 
     * // FOUTER__COMPILED__OVERWRITE_THIS \\
     * 
     * ...some compiled code...
     * 
     * // FOUTER__COMPILED__OVERWRITE_THIS \\
     * 
     * ```
     */
    public readonly replace: boolean = false
  ) {
    this._file_manager = new FileManager(inputDir);
  };

  public execute() {
    this.Write(this.ReadFiles().map(file => this.ResolveFile(...file)));
  }

  private Write(routes: Route[]) {
    const resolvedRoutes = routes.map(route => this.ResolveRoute(route)).reduce((previousRoute, currentRoute) => Object.assign(previousRoute, currentRoute));
    const parsedRoutes = JSON.stringify(resolvedRoutes, undefined, 2).replaceAll("\"", "").replaceAll("'", "\"").replaceAll("},\n", "},\n\n");
    const string = COMPILED_OVERWRRITE_TEXT + "\n\ntype Routes = " + parsedRoutes + "\n\n" + COMPILED_OVERWRRITE_TEXT;
    
    if (this.replace || (!existsSync(this.outputFile)) || FileManager.readFile(this.outputFile) === "") {
      FileManager.writeFile(string, this.outputFile);
    } else {
      FileManager
        .writeFile(
          FileManager
            .readFile(this.outputFile)
            .replaceAll(COMPILED_OVERWRITE_TEXT_REGEXP, string)
            .replaceAll(OVERWRRITE_TEXT, string),
          this.outputFile
        );
    }
  }

  private ResolveRoute(route: Route) {
    return Object.fromEntries(Object.values(route).filter(data => !!data).map(data => {
      return [`'${data.method + " " + data.file + data.path}'`, {
        method: `'${data.method}'`,
        path: `'${data.path}'`,
        parent: `'${data.parent}'`,
        return: data.return,
        arguments: data.arguments
      }];
    }));
  }

  private ResolveArgumentData(argument: string) {
    return Object.fromEntries(argument.split("\r\n").map(data => {
      const dataMatched = data.match(ARGUMENT_DATA);

      if (!dataMatched) {
        return []
      };

      const [ _main, dataName, dataType ] = dataMatched;

      return [dataName, dataType] as const;
    }).filter(v => v.length !== 0)) as { [key: string]: string };
  }

  private ResolveArguments(args: string[]) {
    return Object.fromEntries(args.map(argument => {
      if (!argument) {
        return []
      };

      const argumentMatched = argument.match(ARGUMENT);
      
      if (!argumentMatched) {
        return [];
      };
      
      const argumentType = argumentMatched[1];
      const argumentData = this.ResolveArgumentData(argument);
      
      return [argumentType, argumentData] as const
    }).filter(v => v.length !== 0)) as { [key: string]: { [key: string]: string }};
  };

  private ResolveFile(file: string, filePath: string) {
    return Object.fromEntries(file.split("\r\n\r\n").map(route => {
      const matched = route.match(FOUTER);

      if (!matched) {
        console.error(new Error(`ERROR: no matched data, please, view your file "${filePath}"\n\nROUTE:\n\n${route}`));
        return [];
      };

      const [
        _main,
        method,
        path,
        returnType,
        first,
        second,
        third
      ] = matched as string[];

      if (!(_main && method && path && returnType)) {
        console.error(new Error(`ERROR: no main or method or path or returnType, view your file "${filePath}\n\nROUTE:\n\n${route}"`));
        return [];
      };

      const file = FileManager.getFileName(filePath);

      return [`${method} ${path}`, {
        file,
        method,
        path,
        parent: file,
        return: returnType,
        arguments: this.ResolveArguments([first, second, third])
      } as Route[string]] as const
    })) as Route;
  }

  private ReadFiles() {
    return this._file_manager.files.map(file =>
      [FileManager.readFile(this._file_manager.resolvePath(file)), file] as const);
  }
};

export default Compiler;
