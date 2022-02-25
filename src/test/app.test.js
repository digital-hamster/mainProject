const request = require("supertest")
const app = require("../main/app")

describe("/example", () => {
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
            const response = await request(app)
                .get("/example")
                .set("Accept", "application/json")
                .type("application/json")
                .query({ error: true })
                .send()

            expect(response.status).toBe(400)
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

            expect(response.status).toBe(200)
            expect(response.body).toBe("연결 성공")
        })
    })
})

describe("/health-check", () => {
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
