import WxModel from "./wxModel/WxModel";

class Config {
  constructor() {

  }
}

Config.baseUrl = 'https://wxappsys.pbinfo.cn/wxapp_other/yns_nhzhonglian/';
Config.uploadUrl = "https://wxappsys.pbinfo.cn/wxapp_other/yns_nhzhonglian/upload.server.php"; //图片上传的地址
Config.imgHost = 'http://yns.nhzhonglian.com';  //文章详情内容里面路径
Config.debug = true; //默认不开启调试

/*Config.baseUrl = 'http://wxappsys.pbinfo.com.cn/wxapp_other/yns_nhzhonglian/';
Config.uploadUrl = "http://wxappsys.pbinfo.com.cn/wxapp_other/yns_nhzhonglian/upload.server.php"; //图片上传的地址
Config.imgHost = 'http://yns.nhzhonglian.com';  //文章详情内容里面路径
Config.debug = true; //默认不开启调试*/

//Config.baseUrl = '';//虚拟机地址
export default Config




