module.exports = {
    findUserById : async (id, connection) => {
        const sql = `
            SELECT id
            FROM user
            WHERE id = ?; 
        `

        const [rows] = connection.excute(sql, [id])

        if (rows.length < 0) {
            throw Error("존재하지 않는 사용자입니다.")
        }

        return rows[0]
    }
}