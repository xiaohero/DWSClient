# DWSClient 通用谷歌浏览器插件框架

#### 介绍
* DWSClient是一个Chrome Extension谷歌浏览器插件的通用框架.
 * 注意此框架仅是一个空壳,需搭配服务器端框架[DWSFramework](https://github.com/xiaohero/DWSFramework)(基于python django)一起使用,核心Chrome Extension代码由服务器下发(保护代码安全),前端eval执行.
 * 支持websocket实时通信，支持https转http，支持去服务器端iframe保护.
 * 支持前端后台消息转发,支持后台全局变量存取,支持获取插件唯一id.
 * 支持http request,http response head,body等截取,还自动集成了常用第三方前端js库:如jquery,babel,react,vue等.
 * 支持前端js代码保护(高强度加密混淆).
 * 如需获取离线版版,不依赖[DWSFramework服务器端](https://github.com/xiaohero/DWSFramework),请联系作者(QQ:2130622841)
 * 如需商业用途请咨询开发作者(QQ:2130622841)


#### 软件架构及原理
* DWSClient是一个通用的Chrome Extension谷歌浏览器插件框架,此项目只是一个空壳，其核心代码通过插件启动时候，从服务器[DWSFramework](https://github.com/xiaohero/DWSFramework)获取js(代码经过高强度加密与混淆)，保护插件代码的安全性.
* DWSClient启动后,可在菜单里选择服务器地址,然后从服务器拉取最新的js核心代码，前端通过eval执行拉取的js代码。
* DWSClient与服务器保持websocket实时通信，服务器可以实时下发js让前端执行.同时支持前端暴露api给第三方网站调用background js.
* 支持支持https转http，支持去服务端iframe保护，支持http request,http response head,body等截取。


#### 安装及使用教程

1. git pull 拉取最新代码
2. 讲下载的插件目录拖入到谷歌浏览器的扩展中心
3. 点击右上角DWSClient插件，选择服务器线路地址，然后开始使用

