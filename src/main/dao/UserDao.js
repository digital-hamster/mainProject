module.exports = {
    findUserById : async (id, connection) => {
        const sql = `
            SELECT id
            FROM user
            WHERE id = ?;
        `

        const [rows] = await connection.execute(sql, [id])

        if (rows.length < 0) {
            throw Error("존재하지 않는 사용자입니다.")
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