module.exports = {
    findUserById : async (id, connection) => {
        const sql = `
            SELECT id
            FROM user
            WHERE id = ?;
        `

        const [rows] = await connection.execute(sql, [id])

        if (rows.length === 0 || rows === undefined) {
            throw Error("토큰의 정보가 온전하지 못해 정보를 불러올 수 없습니다") //id 有, 토큰 정보가 잘못되어 db에서 id를 읽지 못함 >> postman:249 / token:248 이런경우임 토큰의 정보가 다름
        }

        return rows[0]
    },
    findPermissionbyUser : async (id, connection) => {
        const sql = `
            SELECT permission
            FROM user
            WHERE id = ?;
        `

        const [rows] = await connection.execute(sql, [id])

        if (rows === undefined) {
            throw Error("존재하지 않는 사용자입니다.")
        }

        return rows[0].permission
    }
}