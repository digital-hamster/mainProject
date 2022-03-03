class CreateDocumentRequest {
    title = ""
    userId = 0
    cost = ""
    category = ""
    start_time = ""
    end_time = ""
    term = ""
    buffer = null
    mimeType = ""
    originalname = ""
    participant = 0
    content = ""
    mapLink = ""

    constructor(req) {
        const { buffer, mimeType, originalname } = req.file
        const { title, category, content, mapLink } = req.body
        const  userId  = req.userDetail.id

        this.title = title
        this.category = category
        this.userId = userId
        this.buffer = buffer
        this.mimeType = mimeType
        this.originalname = originalname
        this.content = content
        this.mapLink = mapLink
        this.validate()
    }

    validate() {
        if (!this.title) {
            throw Error("제목을 입력해주세요")
        }
        if (!this.category) {
            throw Error("항목을 입력해주세요")
        }
        if (!this.userId) {
            throw Error("사용자의 정보를 불러올 수 없습니다")
        }
        if (!this.buffer) {
            throw Error("이미지를 업로드 하는 과정에서 문제가 생겼습니다 (buffer)")
        }
        if (!this.originalname) {
            throw Error("이미지를 업로드 하는 과정에서 문제가 생겼습니다 (originalname)")
        }
        if (!this.content) {
            throw Error("사용자의 리뷰를 불러올 수 없습니다")
        }
        if (!this.mapLink) {
            throw Error("음식점 관련 정보를 불러올 수 없습니다")
        }
    }
}

module.exports = CreateDocumentRequest
