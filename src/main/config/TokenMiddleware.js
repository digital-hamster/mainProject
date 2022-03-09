const { validate } = require("uuid")
const Auth = require("./Auth")
const Database = require("./Database")
const AuthService = require("../service/AuthService")
const HttpMethod = require("../types/HttpMethod")
const AsyncWrapper = require("./AsyncWrapper")

const TokenMiddleware = {
    handle: AsyncWrapper.wrap(async (req, res, next) => {
        // 넘기는 마술쇼
        // req.magic = "마술쇼"
        //토큰검사 안하는 경로는 패스
        const path = req.path //path만 받아오기
        const method = req.method //and문 사용해서 조건 추가해주기 >> method만 안 겹치는 경우는 !

        const isPass = passList.some(el => new RegExp(el.path).test(path) && el.method.name === method)
        //find 조건에 일치하는 배열에 원소를 찾아서 리턴
        //some 조건에 일치하는게 있으면 true 없으면 false
        //every 조건에 모두 일치하면 true 아니면 false

        if (isPass) {
            next()
            return;
        }

        //토큰검사
        const { authorization } = req.headers


        if (!authorization) {
            throw Error("인증 토큰이 없습니다.")
        }

        //const {jwtPayload} =Auth
        
        const token = authorization.replace(/Bearer[+\s]/g, "")
        const jwtPayload = Auth.verifyToken(token)

        req.userDetail = jwtPayload //미들웨어 밖으로 값을 넘겨주고 계속 쓸 거임
        
        // 권한 검사 >> 토큰을 사용하지 않는  api를 제외하고 모든 checkList에 있어야 함
        const apiInfo = checkList.find(el => new RegExp(el.path).test(path) && el.method.name === method)
        
        
        if (!apiInfo) {
            throw Error("토큰 정보를 불러올 수 없습니다")//"존재하지 않는 apiInfo입니다."
        }
        //apiInfo 패턴 조건에 맞는 path가 아니면 apiInfo가 들어오지 않음
        //!!!>> 데이터형을 해당 api에서 걸러내는 게 아니라,
        //미들웨어에서 걸러내는 작업이 필요할 듯함 >> 어디서 에러를 내야하니
        //api 내에서 형검사 하는게 의미가 없어진다 ... ㄹㅇ 미들웨어에서 막혓어 ..

        if (apiInfo.permission > jwtPayload.permission) {
            throw Error("권한이 부족합니다.")
        }
        // 권한 검사 끝
        
        // 실제 존재하는 유저인지 검증
        const connection = await Database.getConnection(res)
        await AuthService.checkUser(jwtPayload, connection)


        res.dbConnection = null;
        connection.release();
        next()
    }),
}

const numberPattern = "/\\d+"
const allPattern = "/\\w+"

const passList = [ //pass, check 정적임, 설정값을 모듈로 분리해서, 보기좋은 형태로 모듈화, 파일에 따로 두기 >> 모듈로 분리해서 불러오기!
    {
        path: "/example",
        method: HttpMethod.GET,
    },
    {
        path: "/db-test",
        method: HttpMethod.GET,
    },
    {
        path: "/health-check",
        method: HttpMethod.GET,
    },
    {   //회원가입
        path: "/users",
        method: HttpMethod.POST
    },
    {   //정식회원
        path: "/auths" + allPattern,
        method: HttpMethod.POST

    },
    {   //로그인
        path: "/login",
        method: HttpMethod.POST
    },
    {   //비밀번호 초기화
        path: "/reset-password",
        method: HttpMethod.POST
    },
    {   //게시글 조회
        path: "/documents",
        method: HttpMethod.GET
    },
    {   //카테고리 항목 조회
        path: "/categories",
        method: HttpMethod.GET
    },
]

const checkList = [ //api만들 때마다 여기서 추가해줘야함 >> 최소 권한 검사 + 어쩌꾸.
    //회원가입중에 임시회원도 토큰은 있기 때문에, 0부터 가능하다고 해서 무시하면 X
    {   //비밀번호 변경
        path: "/users" + numberPattern,
        method: HttpMethod.PUT,
        permission: 0
    },
    {   //회원탈퇴
        path: "/users" + numberPattern,
        method: HttpMethod.DELETE,
        permission: 0
    },
    {   //게시글 생성
        path: "/documents",
        method: HttpMethod.POST,
        permission: 1
    },
    {   //게시글 수정
        path: "/documents" + numberPattern,
        method: HttpMethod.PUT,
        permission: 2
    },
    {   //게시글 삭제
        path: "/documents" + numberPattern,
        method: HttpMethod.DELETE,
        permission: 2
    },
]


//미들웨어는 중간 장치라서 next만 하면 됌
//토큰 api를 호출해서 저기서 사용해야함

//어떤 api를 호출하든, 미들웨어는 항상 넘겨진다 !!

//미들웨어를 실행할 시에, 내가 요청한 api의 정보를 미들웨어에서 미리 볼 수 있고,
//이를 통해서 토큰검사를 안 하고 싶은것들을 예외처리 할 수 있음
module.exports = TokenMiddleware
