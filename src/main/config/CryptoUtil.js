const bcrypt = require("bcrypt")
const CryptoJS = require("crypto-js")
const setting = require("../security/setting")
const secretKey = setting.crypto.secretKey
const saltRound = setting.crypto.saltRound
const key = CryptoJS.enc.Utf8.parse(secretKey)
const iv = CryptoJS.enc.Utf8.parse(secretKey)

const CryptoUtil = {
    // password-hashing Alogirithm - 패스워드 해시화 사용 (단방향) >>되돌릴 수 x
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
    },//O5EN0A9J02
}

// '$2b$10$6mdwbHA15hGnPyBUgJ7ksuZbSxzbX2Jjg6tMZSmV4DLp6UyyEMPT.'
// 'O5EN0A9J02'

// $2b$10$EJuIg4wXmR17JqnElC5nD..6MwrMDvgFOgaQ9N/2TaIWv.UVd7ZAW
// '$2b$10$6mdwbHA15hGnPyBUgJ7ksuZbSxzbX2Jjg6tMZSmV4DLp6UyyEMPT.'

//비번확인 >> 모듈확인
// const text = "O5EN0A9J02"
// const hashedText = CryptoUtil.encryptByBcrypt(text)

// const case1 = CryptoUtil.comparePassword(text, hashedText)
// console.log("case1", case1)
// const result = CryptoUtil.comparePassword("root1234", "$2b$10$6mdwbHA15hGnPyBUgJ7ksuZbSxzbX2Jjg6tMZSmV4DLp6UyyEMPT.");
// console.log("result", result)

module.exports = CryptoUtil

//$2b$10$fMFiyOJWR8heQMDF2qLYmOfCs9OUYdMo6qbz6XD5aFMHmdHQiSN7q //db에서 가져온 값
//$2b$10$BlT1FvWxtwWuEmYnHoZkT.44on31ZmX6DX97iSRYd4ehQuTfxNQo6 //encryptByBcrypt(text)

// const text = "WMF70F8N60"
// const hashedText = CryptoUtil.encryptByBcrypt(text)

// const case1 = CryptoUtil.comparePassword(text, hashedText) //암호화 값 꺼내기
// console.log("case1", case1)
// const result = CryptoUtil.comparePassword("WMF70F8N60", "$2b$10$fMFiyOJWR8heQMDF2qLYmOfCs9OUYdMo6qbz6XD5aFMHmdHQiSN7q"); //postman비번, 해시화해서 바뀐 값
// console.log("result", result) //db값에 있는 값은 
// case1 true
// result false

//해시화: $2b$10$V7oaUCODGGMxglTWGYUW.OMrgW1cmuycUk/5DVIr2iiYw974kVYua

