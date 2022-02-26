const jwt = require("jsonwebtoken")
const setting = require("../security/setting")
const TOKEN_EXPIRED_TIME = 24 * 60 * 60 * 1000
// const TOKEN_EXPIRED_TIME = 1

const DOMAIN = "localhost:3000/"
const secretKey = setting.jwt.secretKey

const Auth = {
    signToken: (id, permission) => {
        //id === userId
        const currentTimeStamp = new Date().getTime()
        const payload = {
            iss: DOMAIN, // 발행인
            iat: currentTimeStamp, // 발행 시간
            exp: currentTimeStamp + TOKEN_EXPIRED_TIME, // 만료 시간
            id: id, // 사용자 아이디
            roles: null, // 읽기만 가능
            permission: permission,
            //permission추가
            //토큰으로  email, auth_code 받아서 발급
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

    //permissioncheck
    checkToken: (token) => {
        try {
            const currentTimeStamp = new Date().getTime()
            const jwtPayload = jwt.verify(token, secretKey)

            if (jwtPayload.permission === undefined || jwtPayload.permission === null) {
                //이건 이렇게 하는게 아닐껄 ??
                throw Error("검증되지 않은 사용자 입니다")
            }
            if (!jwtPayload.id) {
                throw Error("존재하지 않는 사용자입니다")
            }
            if (jwtPayload.permission === 0) {
                throw Error("정식회원이 아닙니다")
            } //0은 사용할 수 있는 예외를 다시 작성하기
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
