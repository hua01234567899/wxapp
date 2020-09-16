import WxRequest from "../../utils/wxRequest/WxRequest";
import WxModel from "../../utils/wxModel/WxModel";

var us = require("../../utils/underscore/underscore");
const app = getApp();

Page({
    data: {
        banner_img: [],
        honor_list: [],
        focus: false,
        honor_current: '0',
        dur: 1000,
        fill: 'aspectFill',
        fit: 'aspectFit',
        w_fit: 'widthFix',
        $true: true,
        img_arr: [],
        hotline: "",
        salesman: '',
        salesman_img: "",
        about_desc: "",
        cartNum: 0
    },

    search: function (e) {
        app.search_click(e, this);
    },

    honor_swiper: function (e) {
        this.setData({
            honor_current: e.detail.current,
        });
    },

    viewimg: function (e) {
        us.viewimg(e, this.data.img_arr);
    },

    onLoad: function (options) {
        this.WxRequest = new WxRequest();
        this.WxModel = new WxModel();
    },

    onShow: function () {
        var response_data = {banner_img: [], img_arr: [], honor_list: []};
        if (this.data.banner_img.length == 0) {
            this.WxRequest.request({url: "query.server.php?m=getIndexData"}).then((res) => {
                var data = res.data;
                response_data.banner_img = data.banner;
                response_data.img_arr = us.wxpluck(data.honor, "images");
                response_data.honor_list = this.WxModel.layer_build(data.honor, 2);
                response_data = Object.assign({}, response_data, {
                    hotline: data.hotline,
                    about_desc: data.about_desc,
                    salesman: data.salesman,
                    salesman_img: data.salesman_img
                });
                this.setData(response_data);
            }).catch(error => console.log(error));
        }
        app.getCartNum().then((cartNum) => {
            this.setData({
                cartNum: cartNum
            });
        });
    },
})
