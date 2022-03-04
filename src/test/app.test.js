const request = require("supertest")
const app = require("../main/app")
const Database = require("../main/config/Database")
const res = require("../main/config/ResponseHandler")

describe("/example", () => { //니들은 또 왜 >> 토큰 패스에 안넣어서 그냐 ?? 아닌데 뭐가 문제니
    describe("정상 요청을 하면", () => {
        it("정상 응답이 온다.", async () => {
            const response = await request(app)
                .get("/example")
                .set("Accept", "application/json")
                .type("application/json")
                .send()

            expect(response.status).toBe(200)
            expect(response.body).toEqual("example API")
        })
    })

    describe("잘못된 요청을 하면", () => {
        it("에러 응답이 온다.", async () => {
            // given
            const queryParams = { error: true };
            const expectedValue = "잘못된 요청입니다."
            // when (실행)
            const response = await request(app)
                .get("/example")
                .set("Accept", "application/json")
                .type("application/json")
                .query(queryParams)
                .send()
            
            // then
            expect(response.body.message).toBe("")
        })
    })
})

describe("/db-test", () => {
    describe("db 연결 테스트", () => {
        it("성공", async () => {
            const response = await request(app)

                .get("/db-test")
                .set("Accept", "application/json")
                .type("application/json")
                .send()


            expect(response.body).toBe("연결 성공")
            expect(response.status).toBe(200)
        })
    })
})

describe("/health-check", () => { //>> 1. passList에 해당 api가 없어서 그랫음 .
    describe("서버 상태 확인", () => {
        it("성공", async () => {
            const response = await request(app)
                .get("/health-check")
                .set("Accept", "application/json")
                .type("application/json")
                .send()

            expect(response.status).toBe(200)
            expect(response.body).toBe("OK")
        })
    })
})

// describe("create user test", () => {
//     describe("success", () => {
//         it("result: true", async () => {
//             const response = await request(app)
//                 .post("/users")
//                 .set("Accept", "application/json")
//                 .type("application/json")
//                 .send({
//                     email: "waterlove121@naver.com",
//                     nickname: "생계형햄스터",
//                     password: "root1234",
//                 })

//             const expectedResult = { result: true }
//             expect(response.body).toEqual(expectedResult)
//             expect(response.status).toBe(200)

//         })
//     })

//     describe("fail", () => {
//         it("error", async () => {
//             const response = await request(app)
//                 .get("/users")
//                 .set("Accept", "application/json")
//                 .type("application/json")
//                 .query({ error: true })
//                 .send()

//             expect(response.status).toBe(400)
//         })
//     })
// })

describe("change permission", () => {
    describe("success", () => {
        it("result: true", async () => {
            const response = await request(app)
                .post("/auths/8ecf1b62d32a7619b2cccc833a5975b9")
                .set("Accept", "application/json")
                .type("application/json") //디비를 연결하는 set이 없는건가 ??, db에는 값이 있는데 ???
                .send(//req.body
                )

            const expectedResult = { result: true }
            expect(response.body).toEqual(expectedResult)
            expect(response.status).toBe(200)

        })
    })

    describe("fail", () => {
        it("error", async () => {
            const response = await request(app)
                .get("/users")
                .set("Accept", "application/json")
                .type("application/json")
                .query({ error: true })
                .send()

            expect(response.status).toBe(400)
        })
    })
})

