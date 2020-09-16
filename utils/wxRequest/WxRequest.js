import Config from "../config";

var us = require("../underscore/underscore");
var interceptor_rules = require("interceptor_rule");
interceptor_rules = interceptor_rules.rules;

var hprose = require("../hprose/hprose");

class WxRequest { //网络请求类
    constructor(defaults = {}) {
        Object.assign(this, {
            defaults,
        });
        this.__init()
    }

    __init() {
        this.__initInterceptor(); //实例化一个管理器
        this.__initDefaults();
        this.__initMethods();
        this.SUCCESS_CODE = 200;
        this.NO_LOGIN_CODE = -999;
        this.NO_AUTH_CODE = -1001; //没有token 或token过期
        this.NO_PERMISSION_CODE = -2001; //没有权限访问  被列入黑名单
    }

    __initInterceptor() {
        // this.interceptors = new InterceptorManager;
    }

    __initDefaults() {
        const defaults = {
            // 方法名后缀字符串，默认值 Request
            suffix: 'Request',
            // 基础请求路径
            baseURL: Config.baseUrl,
            data: [], //默认数据
            method: "index",
            intercept: []
        };
        // 默认参数配置
        this.defaults = Object.assign({}, defaults, this.defaults)
    }

    __initMethods() {
    }

    request(config) {
        return this.__defaultRequest(config);
    }

    //会不会有死循环的出现
    __defaultRequest(config) {
        // 合并参数
        const defaults = Object.assign({}, this.defaults, config);
        const {baseURL} = defaults;
        // 配置请求参数
        const $$config = {
            url: defaults.url,
            data: defaults.data,
            method: defaults.method,
            intercept: defaults.intercept
        };
        if (baseURL && !us.isAbsoluteURL($$config.url)) { // 配置请求路径 baseURL
            $$config.url = us.combineURLs(baseURL, $$config.url)
        }
        const serverRequest = config => {
            return this.__http(config).then((res) => {
                var code = res.code;
                if (code == this.SUCCESS_CODE) {
                    console.log(res);
                    return res;
                } else if (code == this.NO_PERMISSION_CODE) {
                    us.tips("对不起,你没有访问权限");
                    return Promise.reject("没有访问权限");
                } else if (code == this.NO_AUTH_CODE) { //授权过期或没有授权
                    wx.setStorageSync("token", null);
                    var that = this;
                    var promise = new Promise((resolve, reject) => {
                        var token_url = us.combineURLs(this.defaults.baseURL, "auth.server.php");
                        wx.login({
                            success(_res) {
                                that.__http({
                                    url: token_url,
                                    method: "getAuth",
                                    data: [_res.code]
                                }).then((__res) => {
                                    if (__res.code == that.SUCCESS_CODE) {
                                        wx.setStorageSync('token', __res.data.token);
                                        resolve(config);
                                    } else {
                                        reject(__res);
                                    }
                                }, (__res) => {
                                    resolve(__res);
                                });
                            },
                            fail(_res) {
                                reject(_res)
                            }
                        });
                    });
                    //上面获取到token 后 可能有新的请求 无效了token 再次发起请求
                    promise = promise.then(serverRequest, (requestError) => {
                        return Promise.reject(requestError);
                    });
                    return promise; //最终将结果返回上去
                } else if (code == this.NO_LOGIN_CODE) {
                    us.tips("请先登录");
                    setTimeout(function () {
                        us.wxroute("/pages/login_page/login_page");
                    }, 1500);
                    return Promise.reject("请先登录");
                } else {
                    if (typeof res.msg != 'undefined') {
                        var txt = res.msg;
                    } else {
                        var txt = '操作失败';
                    }
                    us.tips(txt);
                    return Promise.reject(txt);
                }
            }, (requestError) => {
                return Promise.reject(requestError);
            });
        };
        let requestInterceptors = [];
        let responseInterceptors = [];
        let promise = Promise.resolve($$config); //返回一个 给定一个定值的 Promise 对象
        $$config.intercept.forEach(n => {
            if (!us.has(interceptor_rules, n)) {
                throw new Error(n + "拦截器没定义");
            }
            var rule = interceptor_rules[n];
            if (rule.request) {
                requestInterceptors.push(rule.request)
            }
            if (rule.response) { //头部添加
                responseInterceptors.unshift(rule.response)
            }
        });
        // 注入拦截器
        const chainInterceptors = (promise, interceptors) => {
            for (let i = 0, ii = interceptors.length; i < ii;) {
                let thenFn = interceptors[i++];  //0 请求前判断成功拦截器
                promise = promise.then(thenFn, (requestError) => {
                    return Promise.reject(requestError);
                });
            }
            return promise
        };
        // 注入请求拦截器
        promise = chainInterceptors(promise, requestInterceptors);
        // 发起hprose请求
        promise = promise.then(serverRequest, (requestError) => {
            return Promise.reject(requestError);
        });
        //console.log(promise);
        // 注入响应拦截器
        promise = chainInterceptors(promise, responseInterceptors);
        return promise;
    }

    __http(obj) {
        return new Promise((resolve, reject) => {
            this.pbclient = hprose.Client.create(obj.url);
            var token = wx.getStorageSync('token');
            if (token && token.length > 0) {
                this.pbclient.setHeader('token', wx.getStorageSync('token'));  //这里的token必须是要本地获取的
            }
            this.pbclient.invoke(obj.method, obj.data, function (res) {
                resolve(res);
            }, function (res) {
                reject(res)
            });
        })
    }


}

export default WxRequest