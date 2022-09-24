# DWSClient（[English introduction](https://github.com/xiaohero/DWSClient/blob/master/README.en.md)） (一个通用谷歌浏览器插件框架)

#### 介绍
* DWSClient是一个谷歌浏览器扩展的通用框架.
 * 注意此框架仅是一个空壳,需搭配服务器端框架[DWSFramework](https://github.com/xiaohero/DWSFramework)(基于python django)一起使用,核心js代码从服务器拉取(保护代码安全),前端浏览器通过eval函数执行.
 * 支持websocket实时通信，https转换为http，禁用服务器端iframe保护.
 * 支持前端后台消息转发,后台全局变量存取.
 * 支持http request,http response head,body等截取,还集成了常用第三方js库:如jquery,babel,react,vue等.
 * 支持js代码保护(高强度加密混淆).
 * 如需获取离线版版,不依赖[DWSFramework服务器端](https://github.com/xiaohero/DWSFramework),请联系作者(QQ:2130622841)
 * 如需商业用途请咨询开发作者(QQ:2130622841)


#### 软件架构及原理
* DWSClient运行原理是在启动时候，从服务器[DWSFramework](https://github.com/xiaohero/DWSFramework)获取核心js(代码经过高强度加密与混淆,保护插件代码的安全性)来执行.
* DWSClient启动后,可在菜单里选择服务器地址,然后从服务器拉取最新的js核心代码，前端浏览器通过eval函数执行拉取的js代码。
* DWSClient与服务器保持websocket实时通信，服务器可以实时推送js让前端浏览器执行.同时支持暴露api给第三方网站调用background js.
* 支持支持https转http，支持去服务端iframe保护，支持http request,http response head,body等截取。


#### 安装及使用教程
1. git pull 拉取最新代码
2. 讲下载的扩展目录拖入到谷歌浏览器的扩展中心
3. 点击右上角DWSClient扩展，选择服务器线路地址，然后开始使用
