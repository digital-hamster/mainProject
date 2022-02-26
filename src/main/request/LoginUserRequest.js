class LoginUserRequest {
    email = ""
    password = ""

    constructor(req) {
        const { email, password } = req.body //, userId

        this.email = email
        this.password = password

        this.validate()
    }

    validate() {
        if (!this.email) {
            throw Error("이메일을 입력해주세요")
        }
        if (!this.password) {
            throw Error("패스워드를 입력해주세요")
        }

        if (this.email.length < 1 || this.email.length > 100) {
            throw Error("이메일은 100자를 넘지 않습니다")
        }

        if (this.password.length < 1 || this.password.length > 100) {
            throw Error("비밀번호는 100자를 넘지 않습니다")
        }
    }
}

module.exports = LoginUserRequest
