var us = require("../underscore/underscore");
import WxRequest from "../wxRequest/WxRequest";


class WxModel {
    constructor() {
    }

    noclass_getlist(url, list_field, extra_callBack) {
        if (this.data.page == undefined || this.data.no_more == undefined || this.data.reload || this.data[list_field].length == 0) {
            this.data.page = 1;
            this.data.no_more = false;
            this.data.reload = false;
            this.data[list_field] = [];
        }
        if (this.data.no_more) {
            return false;
        }
        wx.showLoading({
            title: '数据加载中...',
        });
        var res = {};  //返回的结果
        var data = res.data;
        if (data.request_length > data.response_length) {
            this.data.no_more = true;
        }
        this.data.page = data.page + 1;
        Array.prototype.push.apply(this.data[list_field], data.item_list);
        this.setData({
            [list_field]: this.data[list_field],
        });
        typeof extra_callBack == "function" && extra_callBack(res);
        wx.stopPullDownRefresh();
        wx.hideLoading();
    }

    getClassList(url, method, cid, class_list_field, list_field, extra_callBack) { //具有分类 分类下列表性质的
        var wxRequest = new WxRequest();
        if (this.data.is_first_load == undefined || this.data.cid == undefined || this.data.page == undefined || this.data.no_more == undefined) {
            this.data.is_first_load = 1;
            this.data.cid = 0;
            this.data.page = 1;
            this.data.no_more = false;
            this.data[list_field] = [];
            this.data.reload = false;
        }
        if (this.data.reload) {
            this.data.reload = false;
            this.data.page = 1;
            this.data[list_field] = [];
            this.data.no_more = false;
        }
        if (this.data[class_list_field] == undefined || this.data[class_list_field].length == 0) {
            this.data.is_first_load = 1;
            this.data[list_field] = [];
        }
        if (this.data.cid != cid) { //cid值发生改变
            this.data[list_field] = [];
            this.data.page = 1;
            this.data.no_more = false;
            this.data.cid = cid;
        }
        if (this.data.no_more) {
            return false; //已经到底了
        }
        wx.showLoading({
            title: '数据加载中...',
        });
        wxRequest.request({
            url: url,
            method: method,
            data: [this.data.is_first_load, this.data.cid, this.data.page]
        }).then((res) => {
            var data = res.data;
            if (data.request_length > data.response_length) {
                this.data.no_more = true;
            }
            this.data.page = data.page + 1;
            this.data.cid = data.class_id;
            Array.prototype.push.apply(this.data[list_field], data.item_list);
            if (data.class_list != undefined && data.class_list.length > 0) {
                this.data[class_list_field] = data.class_list;
                this.data.is_first_load = 0;
                this.setData({
                    [class_list_field]: this.data[class_list_field],
                });
            }
            this.setData({
                [list_field]: this.data[list_field]
            });
            typeof extra_callBack == "function" && extra_callBack(res);
            wx.stopPullDownRefresh();
            wx.hideLoading();
        }).catch(error => console.log(error));

    }


    tabList(url, to_show_basic, show_list_field, extra_callBack) { //具有切换性质 数据量不大的列表 全部 未付款 已付款
        if (this.data.all_list == undefined) {
            this.data.all_list = [];
        }
        if (this.data.all_list.length == 0) {
            //发起网络请求
            var res = {};
            var data = res.data;
            this.data.all_list = data.item_list;
            if (us.isEmpty(to_show_basic)) {
                this.setData({
                    [show_list_field]: this.data.all_list
                });
                typeof extra_callBack == "function" && extra_callBack(res);
            } else {
                this.data[show_list_field] = us.wxfindList(this.data.all_list, to_show_basic);
                this.setData({
                    [show_list_field]: this.data[show_list_field]
                });
                typeof extra_callBack == "function" && extra_callBack(res);
            }
        } else {
            if (us.isEmpty(to_show_basic)) {
                this.setData({
                    [show_list_field]: this.data.all_list
                });
                typeof extra_callBack == "function" && extra_callBack(res);
            } else {
                this.data[show_list_field] = us.wxfindList(this.data.all_list, to_show_basic);
                this.setData({
                    [show_list_field]: this.data[show_list_field]
                });
                typeof extra_callBack == "function" && extra_callBack(res);
            }
        }
    }

    layer_build(data, ceng) {     //分层显示 例如4条列表为一个 swiper-item
        var arr = [];
        for (var i = 0; i < data.length; i = i + ceng) {
            var tmp = data.slice(i, i + ceng);
            arr.push({list: tmp});
        }
        return arr;
    }
}

export default WxModel