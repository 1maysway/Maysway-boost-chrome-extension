let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ color });
    console.log('Default background color set to %cgreen', `color: ${color}`);

});


var func = function() {
    console.log("Success!");
};


chrome.runtime.onMessage.addListener(async(message, callback) => {
    console.log("Message Received");
    console.log(message);
    if (message.msg === "startFunc") {
        console.log("Started From Background");

        const tab = (await chrome.tabs.query({ active: true }))[0];

        //let api = await (await fetch("https://api.telegram.org/bot5545577999:AAEsspDSyNjn7kl_O3wLvtj3f081i1bmZWU/getUpdates?chat_id=-748178856")).json();
        //let apiLength = api.result.length;
        //let URLS = api.result[apiLength - 1].message.text.split(" ");
        var URLS = [];

        const getMessage = await fetch('https://api.t-a-a-s.ru/client', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "api_key": "79021593540:RL_BeyWuK9Yqx9uzT87xAeAg9FPes719Es1NZM9r",
                "@type": "getChatHistory",
                "chat_id": "-1001700159175",
                "limit": "100",
                "offset_order": "9223372036854775807"
            })
        });

        const message = await getMessage.json();
        console.log(message);

        let messageId = message.messages[0].id;
        console.log(messageId);

        //(async() => {
        const rawResponse = await fetch('https://api.t-a-a-s.ru/client', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "api_key": "79021593540:RL_BeyWuK9Yqx9uzT87xAeAg9FPes719Es1NZM9r",
                "@type": "getMessageThreadHistory",
                "chat_id": "-1001700159175",
                "message_id": messageId,
                "from_message_id": "0",
                "limit": "200",
                "offset_order": "9223372036854775807"
            })
        });
        const content = await rawResponse.json();

        console.log(content);

        content.messages.forEach(element => {
            URLS.push(element.content.text.text);
            console.log(element.content.text.text);

        });
        console.log(URLS[0]);
        //})();

        console.log(URLS);
        console.log(URLS[0]);
        let arr = ["111", "222", "333", "444", "555", "666", "777", "888", "999", "000"];
        console.log(arr);
        console.log(arr[0]);

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: locationCheck,
            args: [URLS, 0],
        });

        setTimeout(function() {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: load,
                args: [URLS, 0],
            })
        }, 2000);

        let index = 1;

        chrome.runtime.onMessage.addListener(async(message, callback) => {
            if (message.msg === "continueFunc" && index < URLS.length) {

                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: locationCheck,
                    args: [URLS, index],
                });

                setTimeout(function() {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: load,
                        args: [URLS, index],
                    })
                    index++;
                }, 2000);
            }
        });

        console.log("index = " + index);
        console.log("URLS.length = " + URLS.length);

        // if (index >= URLS.length) {
        //     clearInterval(timer);
        //     console.log("Cleared Interval");
        // }
    }
});


// chrome.runtime.onMessage.addListener(
//     async function(request, sender, sendResponse) {
//         if (request.msg == "startFunc") {

//             let api = await (await fetch("https://api.telegram.org/bot5545577999:AAEsspDSyNjn7kl_O3wLvtj3f081i1bmZWU/getUpdates?chat_id=-748178856")).json();
//             let apiLength = api.result.length;
//             let URLS = api.result[apiLength - 1].message.text.split(" ");

//             let index = 0;

//             let timer = setInterval(function() {
//                 chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//                     chrome.tabs.executeScript(tabs[0].id, {
//                         code: "window.location.href = '" + URLS[index] + "';"
//                     });
//                     console.log("index = " + index);
//                     index++;
//                     if (index == URLS.length) {
//                         clearInterval(timer);
//                     }
//                 });
//             }, 20000);
//         }
//     }
// );

// chrome.browserAction.onClicked.addListener(function(activeTab) {
//     //chrome.tabs.executeScript(null, { file: "content.js" });
//     let count = 0;
//     setInterval(function() {
//         console.log(count += 1);
//     }, 1000);
// });


function locationCheck(URLS, index) {
    console.log("locationCheck");
    console.log(document.location.href);
    if (document.location.href != URLS[index]) {
        console.log("locationCheck - redirect");
        console.log(URLS[index]);
        location.assign(URLS[index]);
    }
}



async function load(URLS, index) {

    console.log("Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded");

    console.log("URLS = " + URLS);

    // if (document.location.href != URLS[index]) {
    //     location.assign(URLS[index]);
    // } else {
    //     if (index < URLS.length) {
    //         setTimeout(function() {
    //             start(URLS, index)
    //         }), 2000;
    //     }
    // }

    //stopwatch(20);

    console.log("PATH PATH PATH PATH = " + document.location.pathname);
    if (document.location.pathname == '/results') {
        console.log("Results Results Results");
        search(URLS, index);
    } else {
        console.log("View View View ");
        view(URLS);
    }


    function search(URLS, index) {
        console.log("SEARCH SEARCH SEARCH ");

        let isFound = false;
        console.log(isFound);
        setTimeout(function() {
            let objects = document.querySelectorAll('yt-formatted-string.style-scope.ytd-video-renderer');
            console.log(index);
            console.log(objects);

            for (let i = 0; i < objects.length; i++) {
                let url = decodeURIComponent(URLS[index]);
                console.log(url);
                url = url.split("query=")[1].split("+").join(" ");
                url = url.split("&")[0];
                console.log("URL = " + url);

                if (objects[i].innerText == url) {

                    isFound = true;
                    console.log("Found Found Found Found Found Found Found Found Found Found Found Found Found Found Found Found Found Found Found");
                    objects[i].parentElement.click();

                    view(URLS);

                    break;
                }
            }

            if (isFound == false)
                console.log("BEAT NOT FOUND");
        }, 2000);

    }

    function view(URLS) {
        let time = 0;
        setTimeout(function() {
            if (!document.getElementsByClassName('watch-active-metadata style-scope ytd-watch-flexy')[0].children[0].children[1].children[0].children[0].children[5].children[3].children[0].children[0].children[0].children[0].classList.contains('style-default-active'))
                document.getElementsByClassName('watch-active-metadata style-scope ytd-watch-flexy')[0].children[0].children[1].children[0].children[0].children[5].children[3].children[0].children[0].children[0].children[0].children[0].click();

            document.getElementsByClassName("video-stream html5-main-video")[0].playbackRate = 16.0;

            let timeDuration = document.querySelector(".ytp-time-duration").innerText.split(":");
            time = (parseInt(timeDuration[0]) * 60 + parseInt(timeDuration[1])) * 1000;

            stopwatch((time / 1000 + 1) / 13);
        }, 2000);

        setTimeout(function() {
            let rand = (Math.random() * (1 - 0.5) + 0.5);
            console.log("rand rand rand rand rand rand rand rand rand rand rand rand rand rand rand rand rand === " + rand);
            console.log("TIME TIME TIME TIME TIME TIME === " + time);
            //alert(time);

            setTimeout(function() {
                console.log("TIMEOUT");

                //window.location.href = URLS[(index < (URLS.length - 1) ? index + 1 : 0)]; //.split("youtube.com")[1]

                //document.querySelector('#contents #thumbnail').href = URLS[index].split("youtube.com")[1];
                // document.querySelector('#contents #thumbnail').click();

                // if (history.pushState) {
                //     var baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                //     var newUrl = baseUrl + "?url=" + URLS[(index < (URLS.length - 1) ? index + 1 : 0)].split("youtube.com")[1];
                //     history.pushState(null, null, newUrl);
                // } else {
                //     console.warn('History API не поддерживает ваш браузер');
                // }



                // var getRequest = {
                //     send: function(url, idHtml, data) {
                //         if (!url)
                //             return false;
                //         jQuery.ajax({
                //             url: url,
                //             data: data, //Это Массив с элементами для передачи 
                //             type: "POST",
                //             success: function(callback) {
                //                 jQuery("#" + idHtml).html(callback);
                //             },
                //             error: function() {
                //                 alert("Error ger response from server");
                //             }

                //         });
                //     }

                // }

                // jQuery("#contents #thumbnail").click(function(event) {
                //     getRequest.send(URLS[(index < (URLS.length - 1) ? index + 1 : 0)], "#contents", NULL);
                //     return false;
                // });


                // window.history.replaceState(null, null, '/results?search_query=%5BFREE%5D+Future+Type+Beat+-+%22Ghost%22&sp=CAI%253D');
                // window.history.back();

                // window.history.forward();


                // var a = document.querySelector('#contents #thumbnail');
                // (function() {
                //     a.attr("attr-href", a.attr('href'))
                //         .attr("href", "javascript:;")
                //         .on("click.ajax", function(event) {
                //             var link = a.attr("attr-href");
                //             $.ajax(link, URLS[(index < (URLS.length - 1) ? index + 1 : 0)].split("youtube.com")[1]);
                //             return false;
                //         });
                // }());
                // document.querySelector('#contents #thumbnail').click();

                chrome.runtime.sendMessage({
                    msg: "percentUpdate",
                    plus: {
                        subject: 100 / URLS.length
                    }
                });

                if (index < (URLS.length - 1)) chrome.runtime.sendMessage({ msg: "continueFunc" });
                else {
                    console.log("END END END END END END");
                    //chrome.runtime.sendMessage({ msg: "rounding" });
                }

            }, ((time > 300000 ? 300000 : time) / 13) * rand);
        }, 2100);
    }

}

// stopwatch
function stopwatch(seconds) {
    let count = 0;
    let Interval = setInterval(function() {
        count++;
        console.log(count);
        if (count == seconds) {
            clearInterval(Interval);
            console.log("Cleared Interval");
        }
    }, 1000);
}