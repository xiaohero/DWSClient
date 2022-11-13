//Note: The variables at the let level here cannot be obtained through chrome.extension.getBackgroundPage() and other pages
var servUrlList = {
    servOnline1: ['http://47.116.26.253:8000', chrome.i18n.getMessage("switchServer")+'1', 'servOnline1'],
    servCLOSE: ['0', chrome.i18n.getMessage("stopRun"), ''],
    servLOCAL: ['http://127.0.0.1:8000', chrome.i18n.getMessage("switchLocal"), ''],
};
var dwsClientStatusInfo = {errTxt: chrome.i18n.getMessage("dwsStatusNotRun")};
//////////////////////////////some config params/////
var dwsServPrjName = 'DJSPZ';
var dwsServWsPath = '/' + dwsServPrjName + '/DwsRes/getDwsChromeExtJs?version=latest';
var dwsServerHomePath = '/' + dwsServPrjName + '/Home/index';

//////////////////////////////////////////

/**AjaxUtil(no need jquery)**/
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

    send(url, callback, method, data, async=true) {
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

    get(url, data, callback, async=true) {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        // query.push('_='+new Date().getTime());//防止缓存
        this.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async);
    };

    post(url, data, callback, async=true) {
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
    //fixme:All pages need to be refreshed after switching
    return true;
}

function getCurServInfo() {
    return servUrlList[getGlbServUrlDomId()];
}

function createToolContextMenus() {
    if('undefined'==typeof chrome.contextMenus){
        return false;
    }
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        id: 'flushAllTabs',
        type: 'normal',
        title: chrome.i18n.getMessage("flushAllTabs"),
        contexts: ['browser_action', 'page', 'frame'],
        onclick: (itemInfo) => {
            // alert(JSON.stringify(itemInfo));
            glbFlushAllTabs({alertDebug: false, gapMs: 5000});
        }
    });
    chrome.contextMenus.create({
        id: 'flushOthersTabs',
        type: 'normal',
        title: chrome.i18n.getMessage("flushOtherTabs"),
        contexts: ['browser_action', 'page', 'frame'],
        onclick: (itemInfo) => {
            chrome.tabs.query({active: true}, (tabs) => {
                if (tabs.length < 1) {
                    alert('error,cur tab not found');
                    return;
                }
                glbFlushAllTabs({alertDebug: false, gapMs: 5000, notTabId: tabs[0].id});
            });
        }
    });
}

function glbFlushAllTabs(request) {
    //chrome.tabs.getAllInWindow obsolete
    chrome.tabs.query({}, async (tabs) => {
        for (let i in tabs) {
            if ('undefined' != typeof request && request.notTabId && request.notTabId == tabs[i].id) {
                // alert('Skip current tab page refresh:'+tabs[i].title);
                continue;
            }
            'undefined' != typeof request && request.alertDebug ? alert('flush tab:' + tabs[i].url + ',infos:' + JSON.stringify(tabs[i])) : false;
            //flush tab
            chrome.tabs.update(tabs[i].id, {url: tabs[i].url, selected: tabs[i].selected});
            'undefined' != typeof request && request.gapMs ? await new Promise(resolve => setTimeout(resolve, request.gapMs)) : false;
        }
    });
    return true;
}


///////////////////////////////////////////////////////////////
window.onload=() => {
    //Create the initial menu
    createToolContextMenus();
    //Zone 1 by default
    if (null == getGlbServUrlDomId()) {
        //for prod
        // setGlbServUrlDomId('servOnline1');
        //for debug
        setGlbServUrlDomId('servLOCAL');
    }
    let servUrl = getCurServInfo()[0];
    if('0'===servUrl){
        dwsClientStatusInfo['errTxt'] = chrome.i18n.getMessage("dwsStatusStopped");
        return;
    }
    if(!servUrl){
        dwsClientStatusInfo['errTxt'] = chrome.i18n.getMessage("dwsStatusServerNotOpen");
        return;
    }
    servUrl += dwsServWsPath;
    //alert('server_addr:' + servUrl + ',num:' + getCurServInfo()[2]);
    ajaxUtil.get(servUrl, {}, function (data) {
        if (!data) {
            dwsClientStatusInfo['errTxt'] = 'The request failed, the server may be down';
            // alert(dwsClientStatusInfo['errTxt']+servUrl);
            return;
        }
        if (data.indexOf('removeIframeJsLimit') === -1) {
            dwsClientStatusInfo['errTxt'] = 'The request failed, the server may have an error';
            alert(dwsClientStatusInfo['errTxt']+':'+data);
            return;
        }
        dwsClientStatusInfo['errTxt'] = chrome.i18n.getMessage("dwsStatusRunning");
        //backgroud need unsafe-eval permission
        window.eval(data);
    });


};
