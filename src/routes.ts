type someType = "123";

// FOUTER__COMPILED__OVERWRITE_THIS \\

type Routes = {
  "GET some-data/": {
    method: "GET",
    path: "/",
    parent: "some-data",
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
  },

  "GET some-data/data": {
    method: "GET",
    path: "/data",
    parent: "some-data",
    return: aaaaa,
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
  },

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
  },

  "GET some-path/data": {
    method: "GET",
    path: "/data",
    parent: "some-path",
    return: aaaaa,
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