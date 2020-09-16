var us = require("../underscore/underscore");
import Config from "../config";

class Upload {
    /**
     * @param pic_list_field
     * @param limit 限制上传多少张图片
     * @param page_content page 上下文对象
     */
    constructor(pic_list_field, post_list_field, page_content, limit = 9) {
        this.pic_list_field = pic_list_field;
        this.page_content = page_content;
        this.post_list_field = post_list_field;
        this.limit = limit;
    }

    uploadFile(url, filepath, callback) {
        wx.uploadFile({
            url: url,
            filePath: filepath,
            name: 'file',
            complete: function (res) {
                callback(res);
            }
        });
    }

    multiple_upload(i, tempFilePaths) {
        var self = this;
        var temp_length = tempFilePaths.length;
        if (i < temp_length) {
            var tmp_file = tempFilePaths.slice(i, i + 1);
            self.uploadFile(Config.uploadUrl, tmp_file[0], function (_res) {
                console.log(_res);
                if (_res.statusCode == 200 && _res.data) { //这里进行回调
                    var _data = JSON.parse(_res.data);
                    self.page_content.data[self.pic_list_field].push(tmp_file[0]);
                    self.page_content.data[self.post_list_field].push(_data.images);
                }
                i = i + 1;
                self.multiple_upload(i, tempFilePaths);
            });
        } else {
            self.page_content.setData({
                [self.pic_list_field]: self.page_content.data[self.pic_list_field],
            });
            wx.hideLoading();
        }
    }

    choose_img() { //点击上传按钮 触发
        var self = this;
        var diff = this.limit - this.page_content.data[this.pic_list_field].length;
        if (diff > 0) {
            wx.chooseImage({
                count: diff,
                sizeType: ['original', 'compressed'],
                sourceType: ['album', 'camera'],
                success(res) {
                    const tempFilePaths = res.tempFilePaths;
                    wx.showLoading({
                        title: '图片上传中',
                    });
                    self.multiple_upload(0, tempFilePaths);
                }
            })
        }
    }

    del_img(e) {//删除图片
        var src;
        if (us.isObject(e)) {
            src = e.currentTarget.dataset.src;
        } else {
            src = e;
        }
        var index = us.wxfindIndex(this.page_content.data[this.pic_list_field],src);
        if(index!=-1){
            this.page_content.data[this.pic_list_field].splice(index,1);
            this.page_content.data[this.post_list_field].splice(index,1);
            this.page_content.setData({
                [this.pic_list_field]: this.page_content.data[this.pic_list_field],
            });
        }
    }


    replace_img(e) {//点击图片触发
        var src;
        if (us.isObject(e)) {
            src = e.currentTarget.dataset.src;
        } else {
            src = e;
        }
        var index = us.wxfindIndex(this.page_content.data[this.pic_list_field], src);
        if (index == -1) {
            return false;
        }
        var index_value = this.pic_list_field + "[" + index + "]";
        var self = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success(res) {
                var tempFilePaths = res.tempFilePaths;
                self.uploadFile(Config.uploadUrl, tempFilePaths[0], function (_res) {
                    if (_res.statusCode == 200 && _res.data) { //这里进行回调
                        var _data = JSON.parse(_res.data);
                        self.page_content.data[self.post_list_field][index] = _data.images;
                        self.page_content.setData({
                            [index_value]: tempFilePaths[0]
                        });
                    }
                });
            }
        })
    }
}

export default Upload