class DelectDocumentRequest {
    docuementId = ""
    userId = 0

    constructor(req) {
        const { documentId } = req.params
        const userId = req.userDetail.id

        this.userId = userId
        this.documentId = documentId
        this.validate()
    }

    validate() {
        if (!this.documentId) {
            throw Error("게시글의 정보를 불러올 수 없습니다")
        }
        if (!this.userId) {
            throw Error("작성자의 정보를 불러올 수 없습니다")
        }
    }
}

module.exports = DelectDocumentRequest
