import Compiler from "../fouter/compiler";

import { join } from "path";

const output = new Compiler(__dirname, join(__dirname, "routes.ts")).execute();
const groupedOutput = Object.groupBy(output, (route) => {
  return `${route.parent}`;
});

console.dir(groupedOutput, { depth: Infinity });