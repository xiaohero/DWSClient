# DWSClient (a generic Google Chrome plugin framework)

#### introduce
* DWSClient is a generic framework for Google Chrome extensions.
 * Note that this framework is only an empty shell, it needs to be used together with the server-side framework [DWSFramework](https://github.com/xiaohero/DWSFramework) (based on python django), the core js code is pulled from the server (to protect code security) ), the front-end browser executes it through the eval function.
 * Support websocket real-time communication, convert https to http, disable server-side iframe protection.
 * Support front-end and back-end message forwarding, back-end global variable access.
 * Supports interception of http request, http response head, body, etc., and also integrates common third-party js libraries: such as jquery, babel, react, vue, etc.
 * Support js code protection (high-strength encryption obfuscation).
 * If you want to get the offline version without relying on the [DWSFramework server side](https://github.com/xiaohero/DWSFramework), please contact the author (QQ: 2130622841)
 * For commercial use, please consult the developer (QQ: 2130622841)


#### Software Architecture and Principles
* The operating principle of DWSClient is to obtain the core js (the code is encrypted and obfuscated with high strength to protect the security of the plug-in code) from the server [DWSFramework](https://github.com/xiaohero/DWSFramework) to execute.
* After the DWSClient is started, you can select the server address in the menu, and then pull the latest js core code from the server, and the front-end browser executes the pulled js code through the eval function.
* DWSClient maintains websocket real-time communication with the server, and the server can push js to the front-end browser for execution in real time. At the same time, it supports exposing api to third-party websites to call background js.
* Support to support https to http, support iframe protection to the server, support http request, http response head, body and other interception.


#### Installation and usage tutorial
1. git pull to pull the latest code
2. Drag the downloaded extension directory into the extension center of Google Chrome
3. Click the DWSClient extension in the upper right corner, select the server line address, and then start using
