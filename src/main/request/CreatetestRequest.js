class CreateTestRequest {
    buffer = ""
    mimeType = ""
    originalname = ""

    constructor(req) {
        const { buffer, mimeType, originalname } = req.file

        this.buffer = buffer
        this.mimeType = mimeType
        this.originalname = originalname
    }

    validate() {}
}

module.exports = CreateTestRequest
