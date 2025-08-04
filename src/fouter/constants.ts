export const FOUTER_METHODS = "(GET|POST|PUT|PATCH|DELETE|POST)";
export const FOUTER_PATH = "(\\/[\\w\\W]*)";
export const FOUTER_TYPE = "\\[(.+)\\]";
export const FOUTER_ROUTE = `${FOUTER_METHODS} ${FOUTER_PATH} -> ${FOUTER_TYPE}`; 
export const FOUTER_ARGUMENT = "((?:query|headers|body):(?:\\s*\\w+=\\[.+\\])+)*";
export const FOUTER_ARGUMENTS_LENGTH = 3;

export const FOUTER = new RegExp(FOUTER_ROUTE + "\\s+" + new Array(FOUTER_ARGUMENTS_LENGTH).fill(FOUTER_ARGUMENT).join("\\s*"));

export const ARGUMENT = /(query|headers|body)/;
export const ARGUMENT_DATA = /(\w+)=\[(.+)\]/;