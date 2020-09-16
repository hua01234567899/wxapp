var us = require("../../utils/underscore/underscore");

const rules = { //拦截器规则 不用重复写代码
    login: { //用户用户登录后才能进行访问
        request(request) {
            var app = getApp();
            if (!app.globalData.userInfo || !app.globalData.userInfo.mobile) {
                us.tips("请先登录");
                setTimeout(function () {
                    us.wxroute("/pages/login_page/login_page");
                }, 1500);
                return Promise.reject("请先登录");
            } else {
                return request;
            }
        }
    },
    is_login: { //用户用户登录后才能进行访问
        request(request) {
            var app = getApp();
            if (!app.globalData.userInfo || !app.globalData.userInfo.mobile) {
                us.showModal((res)=>{
                    setTimeout(function () {
                        us.wxroute("/pages/login_page/login_page");
                    }, 1500);
                },"没有注册不能使用该功能，是否现在注册？","提示");
                return Promise.reject("请先登录");
            } else {
                return request;
            }
        }
    },
};

module.exports = {
    rules: rules
}
