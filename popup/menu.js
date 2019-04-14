//popup页面里面无法直接嵌入js代码，只能间接的通过js引入方式实现(注意该脚本在body体最后引入)
let winBackgroundPage = chrome.extension.getBackgroundPage();
(() => {
    //初始化
    let innerHtml = '<li class="bt-nav-item" id="dwsClientExtStatus"> <a href="#" role="button">运行状态:<span class="bt-profile-name" id="dwsClientExtRunStatus"></span> </a> </li>';
    let lastServUrlDomId = winBackgroundPage.getGlbServUrlDomId();
    for (let idx in winBackgroundPage.servUrlList) {
        if (lastServUrlDomId == idx) {
            console.log('载入上次的服务器:' + lastServUrlDomId);
            innerHtml += '<li class="bt-nav-item bt-active" id="' + idx + '"> <a href="#" role="button"> <span class="bt-profile-name">' + winBackgroundPage.servUrlList[idx][1] + '</span> </a> </li>';
        } else {
            innerHtml += '<li class="bt-nav-item" id="' + idx + '"> <a href="#" role="button"> <span class="bt-profile-name">' + winBackgroundPage.servUrlList[idx][1] + '</span> </a> </li>';
        }
    }
    innerHtml += '<li class="bt-nav-item" id="dwsClientXnbCoins"> <a href="#" role="button"> <span class="bt-profile-name">进入主页</span> </a> </li>';
    innerHtml += '<li class="bt-nav-item" id="reloadBtExt"> <a href="#" role="button"> <span class="bt-profile-name">更新(修复)插件</span> </a> </li>';
    document.getElementById('dynServList').innerHTML = innerHtml;
    //页面写入之后再加入click事件(注意：popup页面无法直接在html页面里加入onclick标签监听事件)
    for (let idx in winBackgroundPage.servUrlList) {
        document.getElementById(idx).addEventListener('click', switchServUrl);
    }
    document.getElementById('dwsClientXnbCoins').addEventListener('click', dwsClientXnbCoins);
    document.getElementById('reloadBtExt').addEventListener('click', reloadByExt);
    // document.getElementById('dwsClientExtStatus').addEventListener('click', dwsClientExtRunStatus);
    document.addEventListener('DOMContentLoaded', function () {
        //间接实现popup的click监听事件
        document.getElementById('dwsClientExtRunStatus').textContent = '[' + winBackgroundPage.dwsClientStatusInfo['errTxt'] + ']';
    });
})();

function clearAllClass() {
    let items = document.getElementsByClassName('bt-nav-item');
    for (let idx = 0; idx < items.length; idx++) {
        items[idx].setAttribute('class', 'bt-nav-item');
    }
}

function switchServUrl() {
    clearAllClass();
    let servUrlDomId = this.getAttribute('id');
    console.log('当前切换到服务器地址:' + winBackgroundPage.servUrlList[servUrlDomId][0] + ',id:' + servUrlDomId);
    if (servUrlDomId == winBackgroundPage.getGlbServUrlDomId()) {
        return;
    }
    this.setAttribute('class', 'bt-nav-item bt-active');
    winBackgroundPage.setGlbServUrlDomId(servUrlDomId);
    if ('' == winBackgroundPage.servUrlList[servUrlDomId][0]) {
        winBackgroundPage.alert('当前服务器尚未开放，敬请期待!');
    }
    //重新加载一下
    reloadByExt('switch');
}

function reloadByExt(channel) {
    // if('switch'==channel){
    //     return;
    // }
    let dwsClientExtLastReloadTimes = localStorage.getItem('dwsClientExtLastReloadTimes');
    let dwsClientExtReloadTimes = localStorage.getItem('dwsClientExtReloadTimes');
    dwsClientExtLastReloadTimes=dwsClientExtLastReloadTimes?dwsClientExtLastReloadTimes:0;
    dwsClientExtReloadTimes=dwsClientExtReloadTimes?parseInt(dwsClientExtReloadTimes)+1:1;
    // winBackgroundPage.dwsClientStatusInfo['errTxt']='调试:'+(Date.parse(new Date()) / 1000 - dwsClientExtLastReloadTimes)+':'+dwsClientExtReloadTimes;
    if(dwsClientExtReloadTimes<4){
        chrome.runtime.reload();
        localStorage.setItem('dwsClientExtReloadTimes', dwsClientExtReloadTimes);
        return;
    }
    if (Date.parse(new Date()) / 1000 - dwsClientExtLastReloadTimes < 21) {
        winBackgroundPage.alert('操作过于频繁，请等待20秒再点击:'+(Date.parse(new Date()) / 1000 - dwsClientExtLastReloadTimes)+':'+dwsClientExtReloadTimes);
        // console.log('操作过于频繁，请等待20秒再点击:'+(Date.parse(new Date()) / 1000 - dwsClientExtLastReloadTimes)+':'+dwsClientExtReloadTimes);
        return;
    }
    chrome.runtime.reload();
    localStorage.setItem('dwsClientExtReloadTimes', 1);//超过10秒次数清零
    localStorage.setItem('dwsClientExtLastReloadTimes', Date.parse(new Date()) / 1000);//重新记录最新时间
}

function dwsClientXnbCoins() {
    let servUrl = winBackgroundPage.getCurServInfo()[0];
    if('0'==servUrl){
        winBackgroundPage.alert('已停止服务');
        return;
    }
    if(!servUrl){
        winBackgroundPage.alert('该服务器尚未尚未开放');
        return;
    }
    servUrl += winBackgroundPage.dwsServerHomePath;
    winBackgroundPage.open(servUrl);
}

