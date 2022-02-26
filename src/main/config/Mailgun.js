const mailgun = require("mailgun-js")
const setting = require("../security/setting")
const { apiKey, domain } = setting.mailgun
const mg = mailgun({ apiKey: apiKey, domain: domain })

//const app = require("../app")
//const { authCodeSend } = app

const Mailgun = {
    resetPassword: async (email) => {
        const tempPassword = Math.random().toString(36).substring(2, 12).toUpperCase()
        const userName = "digital-hamster.net" // 메일 발신자 이름 (아무거나 짓기)

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

    sendAuthCode: async (email, authCode) => {
        const userName = "digital-hamster.net"
        const data = {
            from: `${userName} <help@${domain.replace("www.", "")}>`,
            to: email,
            subject: `인증 링크 전달해드립니다`,
            text: `인증 이후에 재로그인 해주세요: http://localhost:3000/auth?authcode=${authCode}`,
            //https://www.api.digital-hamster.net/auth?authcode=${authCode}
        }

        await mg.messages().send(data)

        const result = {
            email: email,
        }

        return result
    },
}

module.exports = Mailgun
