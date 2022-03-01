const res = require("express/lib/response")
const mysql = require("mysql2/promise")
const setting = require("../security/setting")

const pool = mysql.createPool(setting.mysql)

const Database = {
    getConnection: async (res) => {
        if (!res) {
            throw Error("res를 넣어주세요.")
        }
        
        const connection = await pool.getConnection(async (conn) => conn)

        res.dbConnection = connection

        if (process.env.NODE_ENV === "test") {
            connection.beginTransaction()
        }

        return connection
    },
}

module.exports = Database
