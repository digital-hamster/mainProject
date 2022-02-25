const mailgun = require("mailgun-js")
const setting = require("../security/setting")
const { apiKey, domain } = setting.mailgun
const mg = mailgun({ apiKey: apiKey, domain: domain })

const Mailgun = {
    resetPassword: async (email) => {
        const tempPassword = Math.random().toString(36).substring(2, 12).toUpperCase()
        const userName = "MoonJang Jin" // 메일 발신자 이름 (아무거나 짓기)

        const data = {
            from: `${userName} <help@${domain.replace("www.", "")}>`,
            to: email,
            subject: `비밀번호 초기화에 따른 임시 비밀번호 재발급`,
            text: `임시 비밀번호: ${tempPassword}`,
        }

        await mg.messages().send(data)

        const result = {
            email: email,
            tempPassword: tempPassword,
        }

        return result
    },

    sendAuthorizationCode: async (email) => {
        const authorizationCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        const userName = "MoonJang Jin" // 메일 발신자 이름 (아무거나 짓기)

        const data = {
            from: `${userName} <help@${domain.replace("www.", "")}>`,
            to: email,
            subject: `이메일 인증번호입니다.`,
            text: `인증번호: ${authorizationCode}`,
        }

        await mg.messages().send(data)

        const result = {
            email: email,
            authorizationCode: authorizationCode,
        }

        return result
    },
}

module.exports = Mailgun
