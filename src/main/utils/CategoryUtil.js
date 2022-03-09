const CategoryUtil = {
    enumToArray: (Enum) => {
        return Object.keys(Enum).map((key) => ({ description: Enum[key].description, value: key }))
    },
}

module.exports = CategoryUtil

//categoryType의 key들을 map으로 돌려서, 배열의 형태로 만들어 줌
