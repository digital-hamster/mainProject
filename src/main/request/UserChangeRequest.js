class UserChangeRequest {
    authcode = 0

    constructor(req) {
        const { authcode } = req.params

        this.authcode = authcode
        this.validate()
    }

    validate() {
        if (!this.authcode) {
            throw Error("인증코드를 불러올 수 없습니다")
        }
    }
}
module.exports = UserChangeRequest
