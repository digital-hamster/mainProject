const express = require("express")
const cors = require("cors")
const md5 = require("md5")

const ResponseHandler = require("./config/ResponseHandler")
const ErrorHandler = require("./config/ErrorHandler")
const AsyncWrapper = require("./config/AsyncWrapper")
const Database = require("./config/Database")
const multer = require("multer")()
const CryptoUtil = require("./config/CryptoUtil")
const Auth = require("./config/Auth")
const Mailgun = require("./config/Mailgun")
const aws = require("./config/AWS")

const CreateUserRequest = require("./request/CreateUserRequest")
const LoginUserRequest = require("./request/LoginUserRequest")
const ResetPasswordRequest = require("./request/ResetPasswordRequest")
const ChangeUserPassword = require("./request/ChangeUserPassword")
const DeleteUserRequest = require("./request/DeleteUserRequest")
const UserChangeRequest = require("./request/UserChangeRequest")
const CreateDocumentRequest = require("./request/CreateDocumentRequest")
const UpdateDocumentRequest = require("./request/UpdateDocumentRequest")
const SelectAllDocumentRequest = require("./request/SelectAllDocumentRequest")
const DelectDocumentRequest = require("./request/DelectDocumentRequest")

const app = express()
const port = process.env.NODE_ENV === "test" ? 18080 : 8080

app.use(express.json()) // json으로 들어온 요청을 parsing 해준다.
app.use(cors()) // cors 설정

app.post("/test-upload", multer.single("img"), AsyncWrapper.wrap(uploadImage))

async function uploadImage(req, res, next) {
    //const result = awaitAWSS
    const { buffer, mimetype } = req.file

    if (!mimetype.startsWith("image/")) {
        throw Error("이미지 파일만 등록이 가능합니다.")
    }

    const result = await aws.S3.upload(buffer, mimetype)
    res.output = { imageUrl: result }
    next()
}

app.get("/example", AsyncWrapper.wrap(exampleFunc))
async function exampleFunc(req, res, next) {
    const { error } = req.query

    if (error === "true") {
        throw Error("잘못된 요청입니다.")
    }

    res.output = "example API"
    next()
}

app.get("/db-test", AsyncWrapper.wrap(dbTestFunc))
async function dbTestFunc(req, res, next) {
    const connection = await Database.getConnection() // setting.js 필요!!
    const [rows] = await connection.execute("SELECT 1", [])

    if (rows[0]["1"] !== 1) {
        throw Error("연결 실패")
    }

    res.output = "연결 성공"
    next()
}

app.get("/health-check", AsyncWrapper.wrap(checkHealth))
async function checkHealth(req, res, next) {
    res.output = "OK"
    next()
}

//
// 회원가입
app.post("/users", AsyncWrapper.wrap(createUser))
async function createUser(req, res, next) {
    const createRequest = new CreateUserRequest(req)
    const { email, nickname, password } = createRequest

    //authCode발급
    const dateAuth = new Date()
    const authCode = md5(dateAuth + email)

    const connection = await Database.getConnection(res)

    //DB - user table insert
    const [userTableResult] = await connection.execute(
        `INSERT INTO
           user (email ,password, nickname)
         VALUES (?, ?, ?);`,
        [CryptoUtil.encrypt(email), CryptoUtil.encryptByBcrypt(password), nickname]
    )
    if (userTableResult.affectedRows == 0) {
        throw Error("사용자 정보 입력 실패")
    }
    // DB - user_auth table insert
    const [userAuthResult] = await connection.execute(
        `INSERT INTO
      user_auth (auth_code, user_email)
         VALUES (?, ?);`,
        [authCode, CryptoUtil.encrypt(email)]
    )
    if (userAuthResult.affectedRows == 0) {
        throw Error("사용자 인증코드 생성 실패")
    }
    //send authCode email
    await Mailgun.sendAuthCode(email, authCode)

    res.output = { result: true }
    next()
}

// 정식회원 변경하기 auth_code
app.post("/auths/:authcode", AsyncWrapper.wrap(changeUser))
async function changeUser(req, res, next) {
    const changeRequest = new UserChangeRequest(req)
    const { authcode } = changeRequest

    const connection = await Database.getConnection(res)

    //DB - select email
    const [selectEmail] = await connection.execute(
        `SELECT user_email
           FROM user_auth
          WHERE auth_code = ?;`,
        [authcode]
    )
    if (!selectEmail[0] || selectEmail.length === 0) {
        throw Error("존재하지 않는 사용자입니다.")
    }

    //DB - permission check
    const [isExitstPermission] = await connection.execute(
        `SELECT permission
           FROM user
          WHERE email = ?;`,
        [selectEmail[0].user_email]
    )
    if (isExitstPermission[0].permission === 1) {
        throw Error("이미 정식회원인 사용자입니다")
    }

    // DB - update user permission
    const [queryResult] = await connection.execute(
        `UPDATE user
            SET permission = 1
          WHERE email = ?;`,
        [selectEmail[0].user_email]
    )
    if (queryResult.affectedRows == 0) {
        throw Error("변경 실패")
    }

    res.output = { result: true }
    next()
}

//로그인 //비회원 0 /정식회원 1 /관리자 2 주는 거 어찌할지 생각하기
app.post("/login", AsyncWrapper.wrap(userLogin))
async function userLogin(req, res, next) {
    const loginRequest = new LoginUserRequest(req)
    const { email, password } = loginRequest
    const connection = await Database.getConnection(res)
    // DB - select user information
    const [rows] = await connection.execute(
        `SELECT id, password, permission
           FROM user
          WHERE email = ?;`,
        [CryptoUtil.encrypt(email)]
    )
    const userInform = rows[0]

    if (!userInform || rows.length === 0) {
        throw Error("존재하지 않는 사용자입니다.")
    }
    if (CryptoUtil.comparePassword(password, userInform.password) === false) {
        throw Error("로그인 실패")
    }

    res.output = { result: { Token: Auth.signToken(userInform.id, userInform.permission) } }
    next()
}

// 비밀번호 초기화 (임시 비밀번호)
app.post("/reset-password", AsyncWrapper.wrap(resetPassword))
async function resetPassword(req, res, next) {
    const pwresetRequest = new ResetPasswordRequest(req)
    const { email } = pwresetRequest
    const result = await Mailgun.resetPassword(email)

    const connection = await Database.getConnection(res)

    //DB - Exist check, permission check
    const [permissionCheck] = await connection.execute(
        `SELECT permission
           FROM user
          WHERE email = ?;`,
        [CryptoUtil.encrypt(email)]
    )

    if (!permissionCheck || permissionCheck.length === 0) {
        throw Error("존재하지 않는 사용자입니다")
    }
    if (permissionCheck[0].permission !== 1) {
        throw Error("정식회원이 아닙니다")
    }
    // DB - update user password (temp password)
    const [queryResult] = await connection.execute(
        `UPDATE user
            SET password = ?
          WHERE email = ?;`,
        [CryptoUtil.encryptByBcrypt(result.tempPassword), CryptoUtil.encrypt(email)]
    )

    if (queryResult.changedRows == 0) {
        throw Error("생성실패")
    }

    res.output = { result: true }
    next()
}

// 비밀번호 변경
app.put("/users/:userId", AsyncWrapper.wrap(changePw))
async function changePw(req, res, next) {
    const changePassword = new ChangeUserPassword(req)
    const { password, changePw, userId } = changePassword

    const connection = await Database.getConnection(res)
    //DB - permission check
    const [permissionCheck] = await connection.execute(
        `SELECT permission
           FROM user
          WHERE id = ?;`,
        [userId]
    )

    if (!permissionCheck || permissionCheck.length === 0) {
        throw Error("존재하지 않는 사용자입니다")
    }

    if (permissionCheck[0].permission !== 1) {
        throw Error("정식회원이 아닙니다")
    }

    const [queryPw] = await connection.execute(
        `SELECT password
           FROM user
          WHERE id = ?`,
        [userId]
    )

    if (CryptoUtil.comparePassword(password, queryPw[0].password) === false) {
        throw Error("비밀번호가 틀립니다 다시 입력해주세요")
    }
    // DB - update user password
    const [queryResult] = await connection.execute(
        `UPDATE user
            SET password = ?
          WHERE id = ?;`,
        [CryptoUtil.encryptByBcrypt(changePw), userId]
    )

    if (queryResult.changedRows == 0) {
        throw Error("비밀번호는 맞지만, 서버오류상 변경되지 못했습니다 나중에 다시 시도해주세요")
    }

    res.output = { result: true }
    next()
}

// 회원탈퇴
app.delete("/users/:userId", AsyncWrapper.wrap(deleteUser))
async function deleteUser(req, res, next) {
    const deleteUser = new DeleteUserRequest(req)
    const { userId } = deleteUser

    const connection = await Database.getConnection(res)
    // DB - select user information
    const [userSelect] = await connection.execute(
        `SELECT *
           FROM user
          WHERE id = ?`,
        [userId]
    )
    const user = userSelect[0]

    if (!user || user.length === 0) {
        throw Error("존재하지 않는 사용자입니다.")
    }

    // DB - delete F.K information : document
    await connection.execute(
        `DELETE
           FROM document
          WHERE user_id = ?`,
        [userId]
    )
    // DB - delete user_auth F.K information : auth history
    const [userAuthEamil] = await connection.execute(
        `SELECT email
           FROM user
          WHERE id = ?`,
        [userId]
    )
    await connection.execute(
        `DELETE a FROM user_auth AS a
     INNER JOIN user AS u
             ON a.user_email = u.email
          WHERE a.user_email = ?`,
        [userAuthEamil[0].email]
    )
    // DB - delete user
    const [userDelete] = await connection.execute(
        `DELETE
           FROM user
          WHERE id= ?`,
        [userId]
    )
    if (userDelete.affectedRows == 0) {
        throw Error("사용자 탈퇴를 실패했습니다")
    }

    res.output = { result: true }
    next()
}

// 게시글 업로드
app.post("/documents", multer.single("img"), AsyncWrapper.wrap(createDocument))
async function createDocument(req, res, next) {
    const createRequest = new CreateDocumentRequest(req)
    const { title, category, userId, buffer, mimeType, originalname, content, mapLink } = createRequest

    const connection = await Database.getConnection(res)

    const extension = originalname.split(".")[1]
    const imgUrl = await aws.S3.upload(buffer, mimeType, extension)

    // DB - insert document information
    const [queryResult] = await connection.execute(
        `INSERT INTO
            document (title, img_link, user_id, category, content, map_link)
              VALUES (?, ?, ?, ?, ?, ?);`,
        [title, imgUrl, userId, category, content, mapLink]
    )

    if (queryResult.changedRows == 0) {
        throw Error("업로드를 실패했습니다")
    }

    res.output = { result: true }
    next()
}

// 게시글 전체 조회
app.get("/documents", AsyncWrapper.wrap(selectAllDocument))
async function selectAllDocument(req, res, next) {
    const request = new SelectAllDocumentRequest(req)
    const { category, limit, offset } = request
    const connection = await Database.getConnection(res)
    //DB - document * (category)
    const [queryResults] = await connection.execute(
        `SELECT id, title, img_link, content, map_link
           FROM document
          WHERE category = ?
          ORDER BY id DESC
          LIMIT ?
         OFFSET ?;`,
        [category, limit, offset]
    )
    if (!queryResults || queryResults.length === 0) {
        throw Error("없는 카테고리이거나, 관련한 글을 더이상 불러올 수 없습니다")
    }

    res.output = { result: queryResults }
    next()
}

// 게시글 수정
app.put("/documents/:documentId", multer.single("img"), AsyncWrapper.wrap(updateDocument))
async function updateDocument(req, res, next) {
    const documentUpdate = new UpdateDocumentRequest(req)
    const { documentId, title, buffer, mimeType, originalname, userId, content, mapLink } = documentUpdate

    const connection = await Database.getConnection(res)
    //DB - Exist document
    const [isExistDocument] = await connection.execute(
        `SELECT id
           FROM document
          WHERE id = ?;`,
        [documentId]
    )
    if (!isExistDocument || isExistDocument.length === 0) {
        throw Error("존재하지 않는 게시글입니다")
    }

    //DB - permission check
    const [permissionCheck] = await connection.execute(
        `SELECT user_id
           FROM document
          WHERE id = ?;`,
        [documentId]
    )
    if (!permissionCheck[0] || permissionCheck[0].length === 0) {
        throw Error("존재하지 않는 사용자입니다")
    }

    const extension = originalname.split(".")[1]
    const imgUrl = await aws.S3.upload(buffer, mimeType, extension)

    const [queryResult] = await connection.execute(
        `UPDATE document
            SET title = ?, img_link = ?, content = ?, map_link = ?
          WHERE id = ?;`,
        [title, imgUrl, content, mapLink, documentId]
    )
    if (!queryResult || queryResult.length === 0) {
        throw Error("수정할 데이터가 들어오지 못했습니다")
    }
    res.output = { result: true }
    next()
}

// 게시글 삭제
app.delete("/documents/:documentId", AsyncWrapper.wrap(deleteDocument))
async function deleteDocument(req, res, next) {
    const deleteDocument = new DelectDocumentRequest(req)
    const { documentId, userId } = deleteDocument

    const connection = await Database.getConnection(res)
    //DB - permission check
    const [permissionCheck] = await connection.execute(
        `SELECT user_id
           FROM document
          WHERE id = ?;`,
        [documentId]
    )
    if (!permissionCheck || permissionCheck.length === 0) {
        throw Error("존재하지 않는 게시글입니다")
    }
    if (permissionCheck[0].user_id !== +userId) {
        throw Error("작성자가 아닙니다")
    }

    //DB - delete F.K participant
    await connection.execute(
        `DELETE p
           FROM participant AS p
           JOIN document AS d
             ON p.document_id = d.id
          WHERE d.id = ?;`,
        [documentId]
    )
    //DB - delete document
    const [documentResult] = await connection.execute(
        `DELETE
           FROM document
          WHERE id= ?`,
        [documentId]
    )
    if (documentResult.affectedRows == 0) {
        throw Error("게시글 삭제에 실패했습니다")
    }

    res.output = { result: true }
    next()
}

app.use(ErrorHandler.handle) // 에러 핸들러
app.use(ResponseHandler.handle) // 응답 핸들러

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

module.exports = app
