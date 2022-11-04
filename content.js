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

window.addEventListener("blur", function() {
    console.log("BLUR BLUR BLUR");
    chrome.runtime.sendMessage({ msg: "window blur" });

});


function notify(title, message) {
    if (Notification.permission !== 'granted')
        Notification.requestPermission();
    else {
        var notification = new Notification(title, {
            icon: 'https://raw.githubusercontent.com/Potatoii/maysway-BeatBoost/main/logo.jpg',
            body: message,
            dir: 'auto'
        });
        notification.onclick = function() {
            window.open('https://vk.com/maysway');
        };
    }
}


// Проверить открыто ли какое то расширение
// chrome.management.getAll(function(info) {
//     for (var i = 0; i < info.length; i++) {
//         if (info[i].name == "MW Boost") {
//             console.log("BeatBoost is installed");
//         }
//     }
// });