class DeleteUserRequest {
    userId = 0

    constructor(req) {
        const { userId } = req.params

        this.userId = userId
        this.validate()
    }

    validate() {
        if (!this.userId) {
            throw Error("아이디를 입력해주세요")
        }
        if (isNaN(this.userId)){
            throw Error("아이디 형식이 올바르지 않습니다")
        }
    }
}

module.exports = DeleteUserRequest
