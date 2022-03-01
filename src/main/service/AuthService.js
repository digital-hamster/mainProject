const Auth = require("../config/Auth");
const UserDao = require("../dao/UserDao");

module.exports = {
    checkUser: async (jwtPayload, connection) => {
        const { id, permission } = jwtPayload

        //next()
        if (isNaN(id)) {
            throw Error("id 형식이 잘못되었습니다")
        }

        //유저 검증
        const user = await UserDao.findUserById(id, connection);
        //여기에 findUser를 통해 프론트토큰 id와 서버 id 비교함
        if (id !== user.id) {
            throw Error("검증할 수 없는 사용자입니다.")
        }
        //현재 유저의 permission이 최신 정보인지
        const userPermission = await UserDao.findPermissionbyUserㄴ(id, connection);
        //여기에 findUser를 통해 프론트토큰 id와 서버 id 비교함
        if (userPermission !== permission) {
            throw Error("사용자 정보가 변경되었습니다 재로그인 해주세요")
        }
    }

}
