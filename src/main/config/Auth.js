const jwt = require("jsonwebtoken")
const setting = require("../security/setting")
const TOKEN_EXPIRED_TIME = 3 * 60 * 60 * 1000
// const TOKEN_EXPIRED_TIME = 1
const DOMAIN = "www.moonjang.net"
const secretKey = setting.jwt.secretKey

const Auth = {
    signToken: (email) => {
        const currentTimeStamp = new Date().getTime()
        const payload = {
            iss: DOMAIN, // 발행인
            iat: currentTimeStamp, // 발행 시간
            exp: currentTimeStamp + TOKEN_EXPIRED_TIME, // 만료 시간
            email: email, // 사용자 이메일
            roles: null, // 읽기만 가능
        }

        return jwt.sign(payload, secretKey)
    },
    verifyToken: (token) => {
        try {
            const currentTimeStamp = new Date().getTime()
            const jwtPayload = jwt.verify(token, secretKey)

            if (jwtPayload.iss !== DOMAIN) {
                throw Error("Unauthoriezed: 적합하지 않은 토큰입니다.")
            }

            if (jwtPayload.exp < currentTimeStamp) {
                throw Error("Unauthoriezed: 로그인 유지 시간이 만료되었습니다.")
            }

            return jwtPayload
        } catch (e) {
            if (e.message.startsWith("Unauthoriezed:")) {
                throw e
            }

            if (e.message === "invalid signature") {
                throw Error("Unauthoriezed: 토큰 인증에 실패하셨습니다.")
            }

            throw e
        }
    },
}

module.exports = Auth
