document.addEventListener('readystatechange', async(state) => {
    let readyState = document.readyState;
    console.log(readyState, location.pathname, location.pathname == '/', localStorage.getItem("canReady"));
    if (location.pathname == "/results" && (readyState == "complete")) { // && localStorage.getItem("canReady") == "true"
        console.log('results');
        chrome.runtime.sendMessage({ msg: "search ready state" });
    } else if (location.pathname == '/' && (readyState == "complete")) { // && localStorage.getItem("canReady") == "true"
        await chrome.runtime.sendMessage({ msg: "is ready" });
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("MSG -> " + request.msg);
    if (request.msg == "start content") {
        localStorage.setItem("canReady", true);
    } else if (request.msg == "stop content") {
        localStorage.setItem("canReady", false);
    } else if (request.msg == "can ready") {
        setTimeout(() => {
            console.log('main page');
            let avatarBtn = document.querySelectorAll('#container.style-scope.ytd-masthead #avatar-btn')[0];
            console.log(avatarBtn);
            avatarBtn.click();
            setTimeout(() => {
                let recomendations = document.querySelectorAll('.style-scope.ytd-rich-grid-renderer #contents #thumbnail');
                console.log(recomendations);
                let recs = [];
                recomendations.forEach((rec, i) => {
                    if (i < 10)
                        recs.push(rec.href);
                    else
                        return;
                });

                console.log(recs);

                let channelBtn = document.querySelectorAll('.style-scope yt-multi-page-menu-section-renderer #endpoint')[0] || null;
                console.log(channelBtn);

                let channel = channelBtn.href || null;

                chrome.runtime.sendMessage({
                    msg: "from pre start",
                    data: {
                        recs: recs,
                        channel: channel
                    }
                });
            }, 1000)
        }, 2000)
    }
});

// function hoverAll(elm) {
//     console.log('hover');

//     var event = new MouseEvent('mouseover', {
//         'view': window,
//         'bubbles': true,
//         'cancelable': true
//     });
//     elm.dispatchEvent(event);
//     let childrens = elm.children;
//     for (let i = 0; i < childrens.length; i++) {
//         hoverAll(childrens[i]);
//     }
// }