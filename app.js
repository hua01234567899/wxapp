import WxRequest from "utils/wxRequest/WxRequest";

App({
    onLaunch: function () {
        var app = getApp();
        this.getUserInfo();
    },

    globalData: {},

    getUserInfo: function () {
        return new Promise(((resolve, reject) => {
            if (typeof this.globalData.userInfo == "undefined" || wx.getStorageSync("userinfo_reload")) {
                wx.removeStorageSync('userinfo_reload');
                var Wxrequest = new WxRequest();
                Wxrequest.request({url: "store.server.php?m=getUserInfo"}).then((res) => {
                    var data = res.data;
                    this.globalData.userInfo = data;
                    resolve(data);
                }).catch(error => console.log(error));
            } else {
                resolve(this.globalData.userInfo);
            }
        }));
    },

    getCartNum: function () {
        return new Promise(((resolve, reject) => {
            if (typeof this.globalData.cartNum == "undefined" || wx.getStorageSync("cartnum_reload")) {
                wx.removeStorageSync('cartnum_reload');
                var Wxrequest = new WxRequest();
                Wxrequest.request({url: "store.server.php?m=get_user_cart_num"}).then((res) => {
                    this.globalData.cartNum = res.data.cartNum;
                    resolve(this.globalData.cartNum);
                }, (_res) => {
                    resolve(0);
                });
            } else {
                resolve(this.globalData.cartNum);
            }
        }));
    }
})
