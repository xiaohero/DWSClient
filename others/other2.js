let winBackgroundPage = chrome.extension.getBackgroundPage();
(() => {
    //append ext-js
    'undefined' == typeof winBackgroundPage.dwsChmExtBg || 'function' != typeof winBackgroundPage.dwsChmExtBg.getJsToOther2 || window.eval(winBackgroundPage.dwsChmExtBg.getJsToOther2());
})();