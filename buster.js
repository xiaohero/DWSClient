(async () => {
    document.getElementsByTagName('body').length > 0 ? document.getElementsByTagName('body')[0].setAttribute('dwsVersion', chrome.runtime.getManifest().version) : false;
    let glbResult = null;
    let startTime = Date.parse(new Date());
    // await new Promise(resolve => setTimeout(resolve, 500));//先睡500秒
    let idx = 0;
    for (idx = 1; idx < 1000*10; idx++) {
        if (glbResult) {
            break;
        }
        if (null !== glbResult || 1 == idx) {
            // console.log('发送消息给bg:' + idx);
            // glbResult=null;//清空一下
            chrome.runtime.sendMessage({type: 'FROM_PAGE', funcName: 'getFrontJs', varName: ''}, (result) => {
                glbResult = glbResult ? glbResult : result;
            });
        }
        await new Promise(resolve => setTimeout(resolve, 1));
    }
    let endTime = Date.parse(new Date());
    // console.log('收到结果:' + glbResult);
    if (!glbResult) {
        console.log('chrome_ext_front_init:错误,插件前台代码加载失败(超时),请刷新页面重试:' + glbResult);
        chrome.runtime.sendMessage({
            type: 'FROM_PAGE',
            funcName: 'setExtErrMsg',
            varValue: '前台插件加载失败(请更新插件重试)'
        }, (result) => {
        });
        return;
    }
    let exeJsCode = decodeURI(glbResult);
    //notice: remove " on each side
    exeJsCode = exeJsCode.substr(1, exeJsCode.length - 2);
    // console.log('收到结果exeJsCode:' + exeJsCode);
    console.log('ext_ft启动系统,耗时:' + (endTime - startTime) + '毫秒,idx:' + idx);
    window.eval(exeJsCode);
})();

