const bcrypt = require("bcrypt")
const CryptoJS = require("crypto-js")
const setting = require("../security/setting")
const secretKey = setting.crypto.secretKey
const saltRound = setting.crypto.saltRound
const key = CryptoJS.enc.Utf8.parse(secretKey)
const iv = CryptoJS.enc.Utf8.parse(secretKey)

const CryptoUtil = {
    // password-hashing Alogirithm - 패스워드 해싱 암호화 사용 (단방향)
    encryptByBcrypt: (text) => {
        return bcrypt.hashSync(text, saltRound)
    },
    //AES Encryption - 대칭키 암호화 사용 (양방향)
    encrypt: (text) => {
        return CryptoJS.AES.encrypt(text, key, { iv }).toString()
    },
    // 복호화
    decrypt: (ciphertext) => {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key, { iv })
        return bytes.toString(CryptoJS.enc.Utf8)
    },
    // 패스워드 비교
    comparePassword: (text, hashText) => {
        return bcrypt.compareSync(text, hashText)
    },
}

// CryptoJS AES 128 암호화

module.exports = CryptoUtil
