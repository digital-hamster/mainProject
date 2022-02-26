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
    }
}

module.exports = DeleteUserRequest
