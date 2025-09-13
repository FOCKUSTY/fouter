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
  arguments: { [key: string]: { [key: string]: string }|string }
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

  public execute(write: boolean = true) {
    const output = this.ReadFiles().map(file => this.ResolveFile(...file));
    
    if (write) {
      this.Write(output);
    }

    return output;
  }

  private Write(routes: Route[]) {
    const parsedRoutes = JSON.stringify(this.ResolveRoutes(routes), undefined, 2).replaceAll("\"", "").replaceAll("'", "\"").replaceAll("},\n", "},\n\n");
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

  private ResolveRoutes(routes: Route[]) {
    return routes.map(route => this.ResolveRoute(route)).reduce((previous, current) => Object.assign(previous, current));
  }

  private ResolveRoute(route: Route) {
    return Object.fromEntries(Object.values(route).filter(data => !!data).map(data => {
      const returnData = this.ResolvePartial("return", data.return);

      return [`'${data.method + " " + data.file + data.path}'`, {
        method: `'${data.method}'`,
        path: `'${data.path}'`,
        parent: `'${data.parent}'`,
        [returnData[0]]: returnData[1],
        arguments: data.arguments
      }];
    }));
  }

  private ResolveArgumentData(argument: string) {
    const data = argument.split(/\s+/g);
   
    const matched = data[1].match(ARGUMENT_DATA)
    const isShort = data.length === 2 && matched;

    if (isShort) {
      return matched[2]
    }

    return Object.fromEntries(data.map(data => {
      const dataMatched = data.match(ARGUMENT_DATA);

      if (!dataMatched) {
        return []
      };

      const [ _main, dataName, dataType ] = dataMatched;

      return this.ResolvePartial(dataName, dataType);
    }).filter(v => v.length !== 0)) as { [key: string]: string };
  }

  private ResolveArguments(args: string[]) {
    const additionObject: Route[string]["arguments"] = {
      "query?": "{[key: string]: string}|undefined|null",
      "body?": "{[key: sring]: string}|undefined|null",
      "headers?": "{[key: string]: string}|undefined|null",
    };

    return {
      ...Object.fromEntries(args.map(argument => {
        if (!argument) {
          return []
        };

        const argumentMatched = argument.match(ARGUMENT);
        
        if (!argumentMatched) {
          return [];
        };
        
        const argumentType = argumentMatched[1];
        const argumentData = this.ResolveArgumentData(argument);

        delete additionObject[argumentType + "?"];

        return typeof argumentData === "string"
          ? this.ResolvePartial(argumentType, argumentData)
          : [argumentType, argumentData] as const
      }).filter(v => v.length !== 0)) as Route[string]["arguments"],
      ...additionObject
    };
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

  private ResolvePartial(name: string, maybePartial: string) {
    return maybePartial.endsWith("?")
      ? [name + "?", maybePartial.slice(0, maybePartial.length-1)] as const
      : [name, maybePartial] as const;
  }
};

export default Compiler;
