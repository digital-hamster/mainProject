const AWS = require("aws-sdk")
const setting = require("../security/setting")
const { v4: uuidv4 } = require("uuid")
const S3_INSTANCE = new AWS.S3(setting.AWS)

const aws = {
    S3: {
        upload: async (file, mimetype) => {
            const param = {
                Bucket: "ws-image-upload-test",
                Key: "image/" + uuidv4(),
                ACL: "public-read",
                Body: file,
                ContentType: mimetype,
            }
            const result = await S3_INSTANCE.upload(param).promise()

            if (!result || !result.Location) throw Error("S3 업로드 실패")

            return result.Location
        },
    },
}

module.exports = aws
