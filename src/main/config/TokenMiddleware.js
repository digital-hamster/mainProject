const { validate } = require("uuid")
const Auth = require("./Auth")
const Database = require("./Database")
const AuthService = require("../service/AuthService")
const HttpMethod = require("../types/HttpMethod")
const AsyncWrapper = require("./AsyncWrapper")

const numberPattern = "/\\d+"
const allPattern = "/\\w+"

const passList = [
    {
        path: "/example",
        method: HttpMethod.GET.name
    },
    {
        path: "/users" + numberPattern,
        method: HttpMethod.PUT.name
    },
    {
        path: "/auths" + allPattern,
        method: HttpMethod.GET.name
    },
]

const TokenMiddleware = {
    handle: AsyncWrapper.wrap(async (req, res, next) => {
        //토큰검사 안하는 경로는 패스
        const path = req.path //path만 받아오기
        const method = req.method //and문 사용해서 조건 추가해주기 >> method만 안 겹치는 경우는 !

        const isPass = passList.find(el => new RegExp(el.path).test(path) && el.method === method)
        
        if (isPass) {
            next()
            return;
        }

        //토큰검사
        //프론트에서 불러오는 토큰 값
        //req로 토큰 받아오기
        const { authorization } = req.headers

        if (!authorization) {
            throw Error("인증 토큰이 없습니다.")
        }

        const token = authorization.replace(/Bearer[+\s]/g, "")
        const jwtPayload = Auth.verifyToken(token)
        const connection = await Database.getConnection(res)
        
        await AuthService.checkUser(jwtPayload, connection)

        res.dbConnection = null;
        connection.release();
        next()
    }),
}


//미들웨어는 중간 장치라서 next만 하면 됌
//토큰 api를 호출해서 저기서 사용해야함

//어떤 api를 호출하든, 미들웨어는 항상 넘겨진다 !!

//미들웨어를 실행할 시에, 내가 요청한 api의 정보를 미들웨어에서 미리 볼 수 있고,
//이를 통해서 토큰검사를 안 하고 싶은것들을 예외처리 할 수 있음
module.exports = TokenMiddleware
