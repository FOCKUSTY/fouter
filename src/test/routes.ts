// FOUTER__COMPILED__OVERWRITE_THIS \\

type Routes = {
  "GET some-path/": {
    method: "GET",
    path: "/",
    parent: "some-path",
    return?: someType,
    arguments: {
      query: {
        length?: number,
        offset: number
      },

      body?: null,
      headers?: {[key: string]: string}|undefined|null
    }
  },

  "GET users/": {
    method: "GET",
    path: "/",
    parent: "users",
    return: Response,
    arguments: {
      query: boolean,
      body?: {[key: sring]: string}|undefined|null,
      headers?: {[key: string]: string}|undefined|null
    }
  },

  "GET users/:slug": {
    method: "GET",
    path: "/:slug",
    parent: "users",
    return: Response,
    arguments: {
      query: boolean,
      body?: {[key: sring]: string}|undefined|null,
      headers?: {[key: string]: string}|undefined|null
    }
  },

  "PUT users/:slug": {
    method: "PUT",
    path: "/:slug",
    parent: "users",
    return: Response,
    arguments: {
      body: {},

      headers: string,
      query: boolean
    }
  },

  "DELETE users/:slug": {
    method: "DELETE",
    path: "/:slug",
    parent: "users",
    return: Response,
    arguments: {
      headers: string,
      query?: {[key: string]: string}|undefined|null,
      body?: {[key: sring]: string}|undefined|null
    }
  }
}

// FOUTER__COMPILED__OVERWRITE_THIS \\