var rules = {
    name: {
        required: true,
    },
    tel: {
        required: true,
        tel: true
    },
    vcode: {
        required: true,
        minlength: 4
    },
    content: {
        required: true,
    },

};
//在配置文件里面有对应的均需要验证
const messages = {
    name: {
        required: '请输入姓名',
    },
    tel: {
        required: "请输入手机号",
        tel: "请输入正确手机号"
    },
    vcode: {
        required: '请输入验证码',
        minlength: "请输入正确验证码"
    },
    content: {
        required: '请输入详细内容',
    },

};
const scene = {"login": ["name"], "sale": ["content"]};//验证的场景
module.exports = {
    rules: rules,
    messages: messages,
    scene: scene
}
