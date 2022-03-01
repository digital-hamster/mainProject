const ErrorHandler = {
    handle: (err, req, res, next) => {
        //console.error(err.stack)
        /*
        const error = JSON.parse(err.toString().replace("Error: ", ""))
        const { errorCode, missingParams } = error
        generateFailResponse(res, errorCode, missingParams)
        */

        if (res.dbConnection) {
            res.dbConnection.release()
        }

        const { message } = err
        res.status(400)
        res.json({ error: true, message: message })
    },
}

module.exports = ErrorHandler
