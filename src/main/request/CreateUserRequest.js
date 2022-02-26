class CreateUserRequest {
    nickname = ""
    email = ""
    password = ""

    constructor(req) {
        const { nickname, email, password } = req.body
        this.nickname = nickname
        this.email = email
        this.password = password
        this.validate()
    }

    validate() {
        if (!this.email) {
            throw Error("이메일을 입력해주세요")
        }
        if (!this.nickname) {
            throw Error("이름을 입력해주세요")
        }
        if (!this.password) {
            throw Error("비밀번호를 입력해주세요")
        }

        if (this.email.length < 1 || this.email.length > 100) {
            throw Error("이메일은 100자를 넘지 않습니다")
        }

        if (this.nickname.length === 0 || this.nickname.length > 50) {
            throw Error("이름은 10자를 넘지 않습니다")
        }

        if (this.password.length === 0 || this.password.length > 100) {
            throw Error("비밀번호는 100자를 넘지 않습니다")
        }
    }
}

module.exports = CreateUserRequest
