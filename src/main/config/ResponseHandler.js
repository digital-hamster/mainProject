const ResponseHandler = {
    handle: (req, res, next) => {
        if (!res.output) {
            throw Error("잘못된 API입니다.")
        }

        if (res.dbConnection) {
            res.dbConnection.release()
        }

        res.status(200)
        res.json(res.output)
    },
}

module.exports = ResponseHandler
