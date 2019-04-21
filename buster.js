(async() => {
    isOk=document.getElementsByTagName('body').length > 0 ? document.getElementsByTagName('body')[0].setAttribute('dwsVersion', chrome.runtime.getManifest().version) : false;
    let startTime = Date.parse(new Date());
    // await new Promise(resolve => setTimeout(resolve, 500));//先睡500秒
    chrome.runtime.sendMessage({type: 'FROM_PAGE', funcName: 'getFrontJs', varName: ''}, async (result) => {
        if (!result) {
            console.log('chrome_ext_front_init:错误,插件前台代码加载失败,请刷新页面重试:' + result);
            chrome.runtime.sendMessage({
                type: 'FROM_PAGE',
                funcName: 'setExtErrMsg',
                varValue: '前台插件加载失败(请更新插件重试)'
            }, (result) => {
            });
            return;
        }
        let endTime = Date.parse(new Date());
        let exeJsCode = decodeURI(result);
        //notice: remove " on each side
        exeJsCode = exeJsCode.substr(1, exeJsCode.length - 2);
        //console.log('收到结果exeJsCode:' + exeJsCode);
        console.log('ext_ft启动系统,耗时:' + (endTime - startTime) + '毫秒');
        window.eval(exeJsCode);
        if (!isOk) {
            await new Promise(resolve => setTimeout(resolve, 500));//先睡500秒
            isOk=document.getElementsByTagName('body').length > 0 ? document.getElementsByTagName('body')[0].setAttribute('dwsVersion', chrome.runtime.getManifest().version) : false;
        }
    });
})();

