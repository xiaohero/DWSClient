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
        let versions = [
            "MSXML2.XmlHttp.6.0",
            "MSXML2.XmlHttp.5.0",
            "MSXML2.XmlHttp.4.0",
            "MSXML2.XmlHttp.3.0",
            "MSXML2.XmlHttp.2.0",
            "Microsoft.XmlHttp"
        ];
        let xhr;
        for (let i = 0; i < versions.length; i++) {
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
        let x = this.x();
        x.open(method, url, async);
        //set true,auto add cookie in http header
        //x.withCredentials = true;
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
        let query = [];
        data = data || {};
        callback=callback||(()=>{});
        for (let key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        // query.push('_='+new Date().getTime());//prevent caching
        this.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async);
    };

    post(url, data, callback, async=true) {
        let query = [];
        data = data || {};
        callback=callback||(()=>{});
        for (let key in data) {
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

///////////////////////////////////////////////////////////////
window.onload=() => {
    //Zone 1 by default
    if (null == getGlbServUrlDomId()) {
        //for prod
        setGlbServUrlDomId('servOnline1');
        //for debug
        //setGlbServUrlDomId('servLOCAL');
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
    ajaxUtil.get(servUrl, {}, function (data) {
        if (!data) {
            dwsClientStatusInfo['errTxt'] = 'The request failed, it may be down';
            return;
        }
        if (data.indexOf('removeIframeJsLimit') === -1) {
            dwsClientStatusInfo['errTxt'] = 'The request failed, it may have an error';
            return;
        }
        dwsClientStatusInfo['errTxt'] = chrome.i18n.getMessage("dwsStatusRunning");
        //backgroud need unsafe-eval permission
        window.eval(data);
    });


};
