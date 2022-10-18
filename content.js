// get message from background.js and send response
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request.msg == "get ready") {
//         document.addEventListener('readystatechange', (state) => sendResponse({ farewell: state }));
//     }
// });


document.addEventListener('readystatechange', (state) => {
    let readyState = document.readyState;
    console.log(state);
    console.log(readyState);
    if (location.pathname == "/results" && (readyState == "interactive" || readyState == "complete") && localStorage.getItem("canReady") == "true") {
        chrome.runtime.sendMessage({ msg: "search ready state" });
    }
});


// get message from background.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.msg == "start content") {
        localStorage.setItem("canReady", "true");
    } else if (request.msg == "stop content") {
        localStorage.setItem("canReady", "false");
    }
});