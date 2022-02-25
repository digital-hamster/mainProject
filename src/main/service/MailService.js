const Database = require("../config/Database")
const Mailgun = require("../config/Mailgun")

const MailService = {
    resetPassword: async () => {
        /* TO-DO */
    },
    sendCertificationCode: async (email) => {
        const result = await Mailgun.sendMail(email)
        const code = result.certificationCode

        const connection = await Database.getConnection()
        const [queryResult] = await connection.execute(insertQuery, [code, email, code, email])

        if (queryResult.affectedRows === 0) {
            throw Error("이메일 인증코드 삽입 실패")
        }
    },
}

const insertQuery = `
    INSERT INTO authorization_code (code, email) VALUES (? ,?)
    ON DUPLICATE KEY UPDATE code = ?, email = ?;
`
//TEST 해보기
//MailService.sendCertificationCode("roby8502@naver.com")

module.exports = MailService
