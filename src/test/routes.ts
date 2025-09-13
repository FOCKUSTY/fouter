// FOUTER__COMPILED__OVERWRITE_THIS \\

type Routes = {
  "GET some-path/": {
    method: "GET",
    path: "/",
    parent: "some-path",
    return: someType,
    arguments: {
      query: {
        length: number,
        offset: number
      },

      body: {},

      headers: {
        token: string
      }
    }
  }
}

// FOUTER__COMPILED__OVERWRITE_THIS \\