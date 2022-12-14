//The js code cannot be directly embedded in the popup page, it can only be implemented indirectly through js introduction (note that the script is introduced at the end of the body)
let winBackgroundPage = chrome.extension.getBackgroundPage();
(async () => {
    //init
    let innerHtml = '<li class="bt-nav-item" id="dwsClientExtStatus"> <a href="#" role="button">' + chrome.i18n.getMessage("runningStatus") + ':<span class="bt-profile-name" id="dwsClientExtRunStatus">[' + winBackgroundPage.dwsClientStatusInfo['errTxt'] + ']</span> </a> </li>';
    let lastServUrlDomId = await winBackgroundPage.getGlbServUrlDomId();
    for (let idx in winBackgroundPage.servUrlList) {
        if (lastServUrlDomId == idx) {
            console.log('load last server:' + lastServUrlDomId);
            innerHtml += '<li style="display: none" class="bt-nav-item bt-active" id="' + idx + '"> <a href="#" role="button"> <span class="bt-profile-name">' + winBackgroundPage.servUrlList[idx][1] + '</span> </a> </li>';
        } else {
            innerHtml += '<li style="display: none" class="bt-nav-item" id="' + idx + '"> <a href="#" role="button"> <span class="bt-profile-name">' + winBackgroundPage.servUrlList[idx][1] + '</span> </a> </li>';
        }
    }
    //innerHtml += '<li class="bt-nav-item" id="dwsClientHome"> <a href="#" role="button"> <span class="bt-profile-name">'+chrome.i18n.getMessage("goToHome")+'</span> </a> </li>';
    innerHtml += '<li class="bt-nav-item" id="reloadBtExt"> <a href="#" role="button"> <span class="bt-profile-name">' + chrome.i18n.getMessage("updateOrRepairExt") + '</span> </a> </li>';
    document.getElementById('dynServList').innerHTML = innerHtml;
    //Add the click event after the page is written (note: the popup page cannot directly add the onclick listener event to the html page)
    for (let idx in winBackgroundPage.servUrlList) {
        document.getElementById(idx).addEventListener('click', switchServUrl);
    }
    //document.getElementById('dwsClientHome').addEventListener('click', dwsClientHome);
    //'function' == typeof winBackgroundPage.dwsChmExtBg.openClientHome && document.getElementById('dwsClientHome').addEventListener('click', winBackgroundPage.dwsChmExtBg.openClientHome);
    document.getElementById('reloadBtExt').addEventListener('click', reloadByExt);
    //document.getElementById('dwsClientExtStatus').addEventListener('click', dwsClientExtRunStatus);
    //append ext-js
    'undefined' == typeof winBackgroundPage.dwsChmExtBg || 'function' != typeof winBackgroundPage.dwsChmExtBg.getJsToPopUp || window.eval(winBackgroundPage.dwsChmExtBg.getJsToPopUp());
})();

function clearAllClass() {
    let items = document.getElementsByClassName('bt-nav-item');
    for (let idx = 0; idx < items.length; idx++) {
        items[idx].setAttribute('class', 'bt-nav-item');
    }
}

async function switchServUrl() {
    clearAllClass();
    let servUrlDomId = this.getAttribute('id');
    console.log('Currently switched to the server address:' + winBackgroundPage.servUrlList[servUrlDomId][0] + ',id:' + servUrlDomId);
    let servIdx = await winBackgroundPage.getGlbServUrlDomId();
    if (servUrlDomId == servIdx) {
        return;
    }
    this.setAttribute('class', 'bt-nav-item bt-active');
    winBackgroundPage.setGlbServUrlDomId(servUrlDomId);
    if ('' == winBackgroundPage.servUrlList[servUrlDomId][0]) {
        winBackgroundPage.alert('The current server is not open yet, please wait!');
    }
    reloadByExt('switch');
}

function reloadByExt() {
    let dwsClientExtLastReloadTimes = localStorage.getItem('dwsClientExtLastReloadTimes');
    let dwsClientExtReloadTimes = localStorage.getItem('dwsClientExtReloadTimes');
    dwsClientExtLastReloadTimes = dwsClientExtLastReloadTimes ? dwsClientExtLastReloadTimes : 0;
    dwsClientExtReloadTimes = dwsClientExtReloadTimes ? parseInt(dwsClientExtReloadTimes) + 1 : 1;
    // winBackgroundPage.dwsClientStatusInfo['errTxt']='debug:'+(Date.parse(new Date()) / 1000 - dwsClientExtLastReloadTimes)+':'+dwsClientExtReloadTimes;
    if (dwsClientExtReloadTimes < 4) {
        chrome.runtime.reload();
        localStorage.setItem('dwsClientExtReloadTimes', dwsClientExtReloadTimes);
        return;
    }
    if (Date.parse(new Date()) / 1000 - dwsClientExtLastReloadTimes < 21) {
        winBackgroundPage.alert('The operation is too frequent, please wait 20 seconds before clicking:' + (Date.parse(new Date()) / 1000 - dwsClientExtLastReloadTimes) + ':' + dwsClientExtReloadTimes);
        // console.log('The operation is too frequent, please wait 20 seconds before clicking:'+(Date.parse(new Date()) / 1000 - dwsClientExtLastReloadTimes)+':'+dwsClientExtReloadTimes);
        return;
    }
    chrome.runtime.reload();
    localStorage.setItem('dwsClientExtReloadTimes', 1);//The number of times over 10 seconds is cleared
    localStorage.setItem('dwsClientExtLastReloadTimes', Date.parse(new Date()) / 1000);//Re-record the latest time
}

function dwsClientHome() {
    let servUrl = winBackgroundPage.getCurServInfo()[0];
    if ('0' == servUrl) {
        winBackgroundPage.alert('out of service');
        return;
    }
    if (!servUrl) {
        winBackgroundPage.alert('the server is not yet open');
        return;
    }
    servUrl += winBackgroundPage.dwsServerHomePath;
    winBackgroundPage.open(servUrl);
}

