//注意:这里要let级别的变量其它页面无法通过chrome.extension.getBackgroundPage()获取到
var servUrlList = {
    servOnline1: ['http://116.196.76.53:8000', '切换服务器1', 'servOnline1'],
    // servOnline2: ['', '切换服务器2', 'servOnline2'],
    // servOnline3: ['', '切换U服务器2', 'servOnline3'],
    servCLOSE: ['0', '停止运行', ''],
    servLOCAL: ['http://127.0.0.1:8000', '切换本地服务器', ''],

};
var dwsClientStatusInfo = {errTxt:'未启动'};
//////////////////////////////配置参数/////
var dwsServPrjName='DJSPZ';
var dwsServWsPath= '/'+dwsServPrjName+'/Res/getDwsChromeExtJs?version=latest';
var dwsServerHomePath= '/'+dwsServPrjName+'/Home/index';
//////////////////////////////////////////

/**Ajax辅助类(不依赖jquery)**/
class AjaxUtil {
    constructor() {
    }

    x() {
        if (typeof XMLHttpRequest !== 'undefined') {
            return new XMLHttpRequest();
        }
        var versions = [
            "MSXML2.XmlHttp.6.0",
            "MSXML2.XmlHttp.5.0",
            "MSXML2.XmlHttp.4.0",
            "MSXML2.XmlHttp.3.0",
            "MSXML2.XmlHttp.2.0",
            "Microsoft.XmlHttp"
        ];

        var xhr;
        for (var i = 0; i < versions.length; i++) {
            try {
                xhr = new ActiveXObject(versions[i]);
                break;
            } catch (e) {
            }
        }
        return xhr;
    }

    send(url, callback, method, data, async) {
        if (async === undefined) {
            async = true;
        }
        var x = this.x();
        x.open(method, url, async);
        // x.withCredentials = true;
        x.onreadystatechange = function () {
            if (x.readyState == 4) {
                callback(x.responseText)
            }
        };
        if (method == 'POST') {
            x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        x.send(data);
    };

    get(url, data, callback, async) {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        // query.push('_='+new Date().getTime());//防止缓存
        this.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async);
    };

    post(url, data, callback, async) {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        this.send(url, callback, 'POST', query.join('&'), async)
    };
};
ajaxUtil = new AjaxUtil();

function getGlbServUrlDomId() {
    return localStorage.getItem('glbServUrlDomId');
}

function setGlbServUrlDomId(val) {
    let preServUrlDomId = getGlbServUrlDomId();
    if (val == preServUrlDomId) {
        return false;
    }
    localStorage.setItem('glbServUrlDomId', val);
    //fixme:切换之后需要刷新所有页面
    return true;
}

function getCurServInfo() {
    return servUrlList[getGlbServUrlDomId()];
}

function createToolContextMenus() {
    chrome.contextMenus.create({
        id: 'flushAllTabs',
        type: 'normal',
        title: '刷新所有页面',
        contexts: ['browser_action', 'page', 'frame'],
        onclick: (itemInfo) => {
            // alert(JSON.stringify(itemInfo));
            glbFlushAllTabs({alertDebug: false, gapMs: 5000});
        }
    });
    chrome.contextMenus.create({
        id: 'flushOthersTabs',
        type: 'normal',
        title: '刷新其他页面',
        contexts: ['browser_action', 'page', 'frame'],
        onclick: (itemInfo) => {
            chrome.tabs.query({active: true}, (tabs) => {
                if (tabs.length < 1) {
                    alert('错误，未找到当前tab');
                    return;
                }
                glbFlushAllTabs({alertDebug: false, gapMs: 5000, notTabId: tabs[0].id});
            });
        }
    });
}

function glbFlushAllTabs(request) {
    //chrome.tabs.getAllInWindow函数已过时
    chrome.tabs.query({}, async (tabs) => {
        for (let i in tabs) {
            if ('undefined'!=typeof request&&request.notTabId && request.notTabId == tabs[i].id) {
                // alert('跳过当前tab页刷新:'+tabs[i].title);
                continue;
            }
            'undefined'!=typeof request&&request.alertDebug ? alert('刷新页面:' + tabs[i].url + ',infos:' + JSON.stringify(tabs[i])) : false;//fixme:tabs[i]这里面也许可以找到死机页面
            //刷新页面
            chrome.tabs.update(tabs[i].id, {url: tabs[i].url, selected: tabs[i].selected});
            'undefined'!=typeof request&&request.gapMs ? await new Promise(resolve => setTimeout(resolve, request.gapMs)) : false;
        }
    });
    return true;
}


///////////////////////////////////////////////////////////////
(() => {
    //创建初始菜单
    createToolContextMenus();
    //默认设置1区
    if (null == getGlbServUrlDomId()) {
        // setGlbServUrlDomId('servOnline1');
        setGlbServUrlDomId('servLOCAL');
    }
    let servUrl = getCurServInfo()[0];
    if('0'===servUrl){
        dwsClientStatusInfo['errTxt'] = '已停止';
        return;
    }
    if(!servUrl){
        dwsClientStatusInfo['errTxt'] = '该服务器尚未开放';
        return;
    }
    servUrl += dwsServWsPath;
    // alert('服务器地址:' + servUrl + ',代号:' + getCurServInfo()[2]);
    ajaxUtil.get(servUrl, {}, function (data) {
        if (!data) {
            dwsClientStatusInfo['errTxt'] = '请求失败,服务器可能已关闭';
            // alert(dwsClientStatusInfo['errTxt']+servUrl);
            return;
        }
        if (data.indexOf('removeIframeJsLimit') === -1) {
            dwsClientStatusInfo['errTxt'] = '请求失败,服务器可能出错了';
            alert(dwsClientStatusInfo['errTxt']+':'+data);
            return;
        }
        // alert('收到js指令，开始执行:'+data);
        // eval(data);//backgroud需开启unsafe-eval权限后才能执行eval函数
        dwsClientStatusInfo['errTxt'] = '正常';
        window.eval(data);//backgroud需开启unsafe-eval权限后才能执行eval函数
    });


})();
