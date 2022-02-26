class SelectAllDocumentRequest {
    category = ""
    limit = 0
    offset = 0

    constructor(req) {
        const { category, limit, offset } = req.query

        this.category = category
        this.limit = limit
        this.offset = offset
        this.validate()
    }

    validate() {
        if (!this.category) {
            throw Error("카테고리 정보를 불러올 수 없습니다")
        }

        if (!this.limit) {
            throw Error("최대 게시글 개수의 정보를 불러올 수 없습니다")
        }

        if (!this.offset) {
            throw Error("시작할 게시글의 정보를 불러올 수 없습니다")
        }
    }
}

module.exports = SelectAllDocumentRequest
