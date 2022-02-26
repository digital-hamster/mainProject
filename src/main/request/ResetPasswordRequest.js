class ResetPasswordRequest {
    email = ""

    constructor(req) {
        const { email } = req.body

        this.email = email
        this.validate()
    }

    validate() {
        if (!this.email) {
            throw Error("이메일을 입력해주세요")
        }
    }
}

module.exports = ResetPasswordRequest
