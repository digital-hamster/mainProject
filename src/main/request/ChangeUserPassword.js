class ChangeUserPassword {
    password = ""
    changePw = ""
    userId = 0

    constructor(req) {
        const { password, changePw } = req.body
        const { userId } = req.params

        this.password = password
        this.changePw = changePw
        this.userId = userId
        this.validate()
    }

    validate() {
        if (!this.userId) {
            throw Error("아이디를 입력해주세요")
        }
        if (!this.password) {
            throw Error("비밀번호를 입력해주세요")
        }
        if (!this.changePw) {
            throw Error("변경할 비밀번호를 입력해주세요")
        }
        if (this.password.length < 1 || this.password.length > 100) {
            throw Error("비밀번호는 100자를 넘지 않습니다")
        }
        if (this.changePw.length < 1 || this.changePw.length > 100) {
            throw Error("변경할 비밀번호는 100자를 넘지 않습니다")
        }
    }
}
module.exports = ChangeUserPassword
