const HttpMethod = {
    GET: {
        name: "GET"
    },
    POST: {
        name: "POST"
    },
    PUT: {
        name: "PUT"
    },
    DELETE: {
        name: "DELETE"
    },

    has: (method) => {
        return Object.keys(HttpMethod).some((el) => HttpMethod[el].name === method)
    },
}

module.exports = HttpMethod