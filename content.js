document.addEventListener('readystatechange', (state) => {
    let readyState = document.readyState;
    if (location.pathname == "/results" && (readyState == "complete") && localStorage.getItem("canReady") == "true") {
        chrome.runtime.sendMessage({ msg: "search ready state" });
        let hidden = document.hidden;
        //chrome.runtime.sendMessage({ msg: "visibility change", data: { isHidden: hidden } });
    }
});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.msg == "start content") {
        localStorage.setItem("canReady", "true");
    } else if (request.msg == "stop content") {
        localStorage.setItem("canReady", "false");
    }
});

// document.addEventListener("visibilitychange", async() => {
//     console.log("VISIBILITY CHANGE");
//     let hidden = document.hidden;
//     chrome.runtime.sendMessage({ msg: "visibility chang e", data: { isHidden: hidden } });
// });

// window.onbeforeunload = function() {
//     chrome.runtime.sendMessage({ msg: "refresh" });
// }