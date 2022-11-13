(async() => {
    isOk=document.getElementsByTagName('html').length > 0 ? document.getElementsByTagName('html')[0].setAttribute('dwsVersion', chrome.runtime.getManifest().version) : false;
    let startTime = Date.parse(new Date());
    // await new Promise(resolve => setTimeout(resolve, 500));
    chrome.runtime.sendMessage({type: 'FROM_PAGE', funcName: 'getFrontJs', varName: ''}, async (result) => {
        if (!result) {
            console.log('chrome_ext_front_init:Error,the front-end code failed to load, please refresh the page and try again:' + result);
            chrome.runtime.sendMessage({
                type: 'FROM_PAGE',
                funcName: 'setExtErrMsg',
                varValue: 'The front-end code failed to load (please update the extensiion and try again)'
            }, (result) => {
            });
            return;
        }
        let endTime = Date.parse(new Date());
        let exeJsCode = decodeURI(result);
        //notice: remove " on each side
        exeJsCode = exeJsCode.substr(1, exeJsCode.length - 2);
        //console.log('收到结果exeJsCode:' + exeJsCode);
        console.log('ext_ft started,times:' + (endTime - startTime) + ' ms');
        window.eval(exeJsCode);
        if (!isOk) {
            await new Promise(resolve => setTimeout(resolve, 10));//先睡500秒
            isOk=document.getElementsByTagName('html').length > 0 ? document.getElementsByTagName('html')[0].setAttribute('dwsVersion', chrome.runtime.getManifest().version) : false;
        }
    });
})();

