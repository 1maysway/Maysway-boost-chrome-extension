chrome.runtime.onMessage.addListener(async(message, callback) => {
    console.log("Message Received");
    console.log(message);

    var onion = await fetch('https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/options.json')
        .then((response) => response.json());

    var jno = onion.keys;


    const tab = (await chrome.tabs.query({ active: true }))[0];

    if (message.msg === "startFunc") {
        console.log("Started From Background");

        let URLS = await getStorageLocal("boostStatus").then((data) => { return data.boostStatus }) == "not completed" ? [] : await getStorageLocal("URLS").then((data) => { return data.URLS }) || [];

        let count = 0;
        while (URLS.length == 0) {

            const getMessage = await recursiveFetchAwait('https://api.t-a-a-s.ru/client', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "api_key": randomApiKey(jno),
                    "@type": "getChatHistory",
                    "chat_id": "-1001700159175",
                    "limit": "100",
                    "offset_order": "9223372036854775807"
                })
            });

            const messageHistory = await getMessage.json();
            let messageId = messageHistory.messages[0].id;

            const rawResponse = await recursiveFetchAwait('https://api.t-a-a-s.ru/client', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "api_key": randomApiKey(jno),
                    "@type": "getMessageThreadHistory",
                    "chat_id": "-1001700159175",
                    "message_id": messageId,
                    "from_message_id": "0",
                    "limit": "200",
                    "offset_order": "9223372036854775807"
                })
            });
            const content = await rawResponse.json();

            console.log(content.messages);

            if (content.messages)
                if (content.messages.length > 0)
                    URLS = content.messages.filter(i => i.content.text.text.includes("youtube.com")).map(i => i.content.text.text);

            if (count > 5)
                throw new Error("Maximum attempts reached");

            count++;
        }


        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { msg: "start content" });
        });

        await setStorageLocal("URLS", URLS);

        chrome.runtime.sendMessage({ msg: "started" });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: notify,
            args: ["Boost started", "Maysway boost"],
        });

        await getStorageLocal("index").then((data) => {
            let index = data.index

            console.log(index, URLS);

            console.log("executing locationCheck");
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: locationCheck,
                args: [URLS, index],
            });
        });

    } else if (message.msg === "continueFunc") {
        console.log("Continue From Background");
        let URLS = message.data.URLS;

        await getStorageLocal("index").then((data) => {
            let index = data.index;

            console.log(index);

            console.log("executing locationCheck");
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: locationCheck,
                args: [URLS, index],
            });
        });

    } else if (message.msg === "save end") {

        await setStorageLocal("percent", 100);
        await setStorageLocal("completedDate", getCurrentDateSamaraNoApi());
        await setStorageLocal("boostStatus", "ended");
    } else if (message.msg === "search ready state") {
        console.log("search ready state");

        let boostStatus = await getStorageLocal("boostStatus").then((data) => { return data.boostStatus; });

        if (boostStatus == "started") {
            await getStorageLocal("index").then(async(data) => {
                let index = data.index;
                await getStorageLocal("URLS").then(async(data) => {
                    let URLS = data.URLS;
                    await getStorageLocal("name").then(async(data) => {
                        let name = data.name;
                        console.log("executing load");
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            func: load,
                            args: [URLS, index, name, onion]
                        });
                    });
                });
            });
        }
    } else if (message.msg === "window blur") {
        console.log("window blur");
        let status = await getStorageLocal("boostStatus").then((data) => { return data.boostStatus });
        let lastOpened = await getStorageLocal("lastOpened").then((data) => { return data.lastOpened });
        let nowDate = Date.now();

        if ((nowDate - lastOpened) > 1000) {
            console.log("window blur");

            if (status == "started") {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: notify,
                    args: ["Boost stopped", "Maysway boost"]

                });
                await setStorageLocal("boostStatus", "stoped");

                //chrome.runtime.reload();

            }
        }
    }
});

function locationCheck(URLS, index) {
    console.log("locationCheck");
    console.log(document.location.href);
    if (document.location.href != URLS[index]) {
        console.log("locationCheck - redirect");
        console.log(URLS);
        console.log(URLS[index]);
        location.assign(URLS[index]);
    } else
        location.reload();
}

async function load(URLS, index, name, onion) {

    /////////////////////////////////////////


    function getStorageLocal(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(key, function(result) {
                resolve(result);
            });
        });
    }

    function setStorageLocal(key, value) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({
                [key]: value
            }, function() {
                resolve();
            });
        });
    }

    async function getCurrentDateSamara() {
        var today = new Date();
        //var date = await recursiveFetchAwait("https://timeapi.io/api/Time/current/zone?timeZone=Europe/Samara").then(response => response.json());

        var date = await recursiveFetchAwait("https://worldtimeapi.org/api/timezone/Europe/Samara").then(response => response.json());

        var dd = date.datetime.split('T')[0].split('-')[2];
        var mm = date.datetime.split('T')[0].split('-')[1]; //January is 0!
        var yyyy = date.datetime.split('T')[0].split('-')[0];

        today = dd + '.' + mm + '.' + yyyy;
        return today;
    }

    async function recursiveFetchAwait(url, options, maxAttempts = 5) {
        if (maxAttempts > 0) {
            try {
                let response = await fetch(url, options);
                return response;
            } catch (e) {
                console.log(e);
                return await recursiveFetchAwait(url, options, maxAttempts - 1);
            }
        } else {
            throw new Error("Maximum attempts reached");
        }
    }

    function randomApiKey(jno) {
        console.log(jno);
        let keys = jno.lans;
        console.log(keys);
        let randomKey = keys[Math.floor(Math.random() * keys.length)];
        return randomKey;
    }

    async function getChatHistoryOver(chat_id, jno, limit = 100) {


        let messages = [];
        let fromId = 0;
        while (messages.length < limit) {
            const chatHistoryResponse = await recursiveFetchAwait('https://api.t-a-a-s.ru/client', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "api_key": randomApiKey(jno),
                    "@type": "getChatHistory",
                    "chat_id": chat_id,
                    "limit": "100",
                    "offset": "0",
                    "from_message_id": fromId
                })
            });

            let chatHistory = await chatHistoryResponse.json();
            console.log(chatHistory);

            if (chatHistory.messages.length > 1) {
                fromId = chatHistory.messages[chatHistory.messages.length - 1].id;
                messages = messages.concat(chatHistory.messages);
            }
        }
        return messages;
    }

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

    // get current time in samara
    function getCurrentTimeSamaraNoApi() {
        let date = new Date();
        let utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        let samara = new Date(utc + (3600000 * 3));
        let hours = samara.getHours();
        let minutes = samara.getMinutes();
        let seconds = samara.getSeconds();
        if (hours < 10) hours = "0" + hours;
        if (minutes < 10) minutes = "0" + minutes;
        if (seconds < 10) seconds = "0" + seconds;
        return hours + ":" + minutes + ":" + seconds;
    }
    // get current date in samara
    function getCurrentDateSamaraNoApi() {
        let date = new Date();
        let utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        let samara = new Date(utc + (3600000 * 3));
        let day = samara.getDate();
        let month = samara.getMonth() + 1;
        let year = samara.getFullYear();
        if (day < 10) day = "0" + day;
        if (month < 10) month = "0" + month;
        return day + "." + month + "." + year;
    }
    // json to array function
    function jsonToArray(json) {
        if (json == null)
            return [];

        var result = [];
        var keys = Object.keys(json);
        keys.forEach(function(key) {
            result.push(json[key]);
        });
        return result;
    }


    ////////////////////////////////////

    var jno = onion.keys;

    console.log("Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded");

    console.log("URLS = " + URLS);

    console.log("PATH PATH PATH PATH = " + document.location.pathname);
    if (document.location.pathname == '/results') {
        console.log("Results Results Results");
        search(URLS, index, onion, name);
    } else {
        console.log("View View View ");
        view(URLS, index, onion, name);
    }


    async function search(URLS, index, onion, name) {
        console.log("SEARCH SEARCH SEARCH ");
        const jno = onion.keys;

        let isFound = false;
        console.log(isFound);
        setTimeout(async function() {
            let objects = document.querySelectorAll('yt-formatted-string.style-scope.ytd-video-renderer');
            console.log(index);

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

                    view(URLS, index, onion, name);

                    return;
                }
            }

            await getStorageLocal("boostStatus").then(async(result) => {
                let boostStatus = result.boostStatus;

                if (index < (URLS.length - 1) && boostStatus != "stoping" && boostStatus != "stoped") chrome.runtime.sendMessage({
                    msg: "continueFunc",
                    data: {
                        URLS: URLS,
                        name: name
                    }
                });
                else if (index >= (URLS.length - 1)) {
                    console.log("END END END END END END");
                    console.log(onion);

                    chrome.runtime.sendMessage({ msg: "save end" });

                    let messages = await getChatHistoryOver("-1001523814781", jno, parseInt(onion.historyOverLimits.raportChat));

                    let completeMessages = messages.filter(i => /^Members - COMPLETE/.exec(i.content.text.text));

                    let dateCount = 0;
                    completeMessages.forEach(
                        function(item, i, arr) {
                            if (item.date > dateCount) {
                                dateCount = item.date;
                            }
                        }
                    )

                    // find message where date = dateCount
                    let completeMessage = completeMessages.find(i => i.date == dateCount);

                    let messageID = completeMessage.id;

                    if (completeMessage.content.text.text == "Members - COMPLETE") {
                        const rawResponse = await recursiveFetchAwait('https://api.t-a-a-s.ru/client', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                "api_key": randomApiKey(jno),
                                "@type": "sendMessage",
                                "chat_id": "-1001523814781",
                                "reply_to_message_id": messageID,
                                "disable_notification": true,
                                "input_message_content": {
                                    "@type": "inputMessageText",
                                    "disable_web_page_preview": false,
                                    "text": {
                                        "@type": "formattedText",
                                        "text": name
                                    }
                                }
                            })
                        });
                        const content = await rawResponse.json();
                        console.log(content);
                    }

                    await setStorageLocal("boostStatus", "ended");
                    await setStorageLocal("completedDate", getCurrentDateSamaraNoApi());

                    chrome.runtime.sendMessage({ msg: "end" });

                    notify("Boost completed", "maysway boost");

                } else {
                    await chrome.tabs.sendMessage(tab.id, { msg: "stop content" });
                    console.log("Boost stopped");

                    await setStorageLocal('boostStatus', 'stoped');
                    chrome.runtime.sendMessage({
                        msg: "stoped"
                    });
                }
            });
        }, 2000);

    }

    async function view(URLS, index, onion, name) {
        let time = 0;
        const jno = onion.keys;

        setTimeout(async function() {
            setTimeout(async() => {

                let nodes = [];
                let words = [];

                let wordsResponse = await fetch("https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/aria-labels%20for%20like.json");
                wordsResponseContent = await wordsResponse.json();
                words = wordsResponseContent.labels;

                words.forEach(
                    word => {
                        let node = document.querySelectorAll(`[aria-label*="${word}"][aria-pressed="false"]`);
                        if (node) {
                            nodes.push(node);
                        }
                    }
                );

                let buttons = [];

                for (let i = 0; i < nodes.length; i++) {
                    if (nodes[i].length > 0) {
                        for (let j = 0; j < nodes[i].length; j++) {
                            buttons.push(nodes[i][j]);
                        }
                    }
                }

                buttons = buttons.filter((item, i) => {
                    return buttons.indexOf(item) === i;
                });

                for (let i = 0; i < buttons.length; i++) {
                    buttons[i].click();
                }
            }, 2000);

            document.getElementsByClassName("video-stream html5-main-video")[0].playbackRate = 16.0;

            let timeDuration = document.querySelector(".ytp-time-duration").innerText.split(":");
            time = (parseInt(timeDuration[0]) * 60 + parseInt(timeDuration[1])) * 1000;

            let rand = (Math.random() * (1 - 0.5) + 0.5);

            setTimeout(async function() {
                console.log("TIMEOUT");

                await setStorageLocal("index", index + 1);

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


                //percent += 100 / URLS.length;

                await getStorageLocal("percent").then(async(result) => {
                    let percent = result.percent + (100 / URLS.length);
                    await setStorageLocal("percent", percent);
                    chrome.runtime.sendMessage({
                        msg: "percentUpdate",
                        data: {
                            plus: percent
                        }
                    });
                });

                await getStorageLocal("boostStatus").then(async(result) => {
                    let boostStatus = result.boostStatus;
                    console.log("boostStatus = " + boostStatus);

                    if (index < (URLS.length - 1) && boostStatus != "stoping" && boostStatus != "stoped") chrome.runtime.sendMessage({
                        msg: "continueFunc",
                        data: {
                            URLS: URLS,
                            name: name
                        }
                    });
                    else if (index >= (URLS.length - 1)) {
                        console.log("END END END END END END");
                        console.log(onion);

                        chrome.runtime.sendMessage({ msg: "save end" });

                        let messages = await getChatHistoryOver("-1001523814781", jno, parseInt(onion.historyOverLimits.raportChat));

                        let completeMessages = messages.filter(i => /^Members - COMPLETE/.exec(i.content.text.text));

                        let dateCount = 0;
                        completeMessages.forEach(
                            function(item, i, arr) {
                                if (item.date > dateCount) {
                                    dateCount = item.date;
                                }
                            }
                        )

                        // find message where date = dateCount
                        let completeMessage = completeMessages.find(i => i.date == dateCount);


                        let messageID = completeMessage.id;

                        if (completeMessage.content.text.text == "Members - COMPLETE") {
                            const rawResponse = await recursiveFetchAwait('https://api.t-a-a-s.ru/client', {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    "api_key": randomApiKey(jno),
                                    "@type": "sendMessage",
                                    "chat_id": "-1001523814781",
                                    "reply_to_message_id": messageID,
                                    "disable_notification": true,
                                    "input_message_content": {
                                        "@type": "inputMessageText",
                                        "disable_web_page_preview": false,
                                        "text": {
                                            "@type": "formattedText",
                                            "text": name
                                        }
                                    }
                                })
                            });
                            const content = await rawResponse.json();
                        }
                        //})();

                        await setStorageLocal("boostStatus", "ended");
                        await setStorageLocal("completedDate", getCurrentDateSamaraNoApi());

                        chrome.runtime.sendMessage({ msg: "end" });

                        notify("Boost completed", "Maysway boost");

                    } else {
                        // chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                        //     chrome.tabs.sendMessage(tabs[0].id, { msg: "stop content" });
                        // });
                        //await chrome.tabs.sendMessage(tab.id, { msg: "stop content" });

                        await setStorageLocal('boostStatus', 'stoped');
                        chrome.runtime.sendMessage({
                            msg: "stoped"
                        });

                        console.log("Boost stopped");
                    }
                });

                console.log(URLS);

            }, ((time > 300000 ? 300000 : time) / 13) * rand);

        }, 2000);
    }

}


chrome.runtime.onStartup.addListener(async function() {
    console.log("onStartup");
    let status = await getStorageLocal('boostStatus').then((data) => { return data.boostStatus; });
    console.log(status);

    if (status == "started") {
        await setStorageLocal("boostStatus", "stoped");

        let currentTime = getCurrentTimeSamaraNoApi();

        let boostTime = await fetch("https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/boost%20time.json").then(response => response.json());

        if (currentTime > boostTime.startTime && currentTime < boostTime.endTime)
            chrome.runtime.sendMessage({ msg: "stoped" });
    }

});


/////////////////////////////


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

function randomApiKey(jno) {
    let keys = jno.lans;
    let randomKey = keys[Math.floor(Math.random() * keys.length)];
    return randomKey;
}

function getCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = dd + '.' + mm + '.' + yyyy;
    return today;
}

function getStorageLocal(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, function(result) {
            resolve(result);
        });
    });
}

function setStorageLocal(key, value) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({
            [key]: value
        }, function() {
            resolve();
        });
    });
}

function clearStorageLocal() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.clear(function() {
            resolve();
        });
    });
}

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

async function recursiveFetchAwait(url, options, maxAttempts = 5) {
    if (maxAttempts > 0) {
        try {
            let response = await fetch(url, options);
            return response;
        } catch (e) {
            console.log(e);
            return await recursiveFetchAwait(url, options, maxAttempts - 1);
        }
    } else {
        throw new Error("Maximum attempts reached");
    }
}

async function getCurrentDateSamara() {
    var today = new Date();
    var date = await recursiveFetchAwait("http://worldtimeapi.org/api/timezone/Europe/Samara").then(response => response.json());

    var dd = date.datetime.split('T')[0].split('-')[2];
    var mm = date.datetime.split('T')[0].split('-')[1]; //January is 0!
    var yyyy = date.datetime.split('T')[0].split('-')[0];

    today = dd + '.' + mm + '.' + yyyy;
    return today;
}

// get current time in samara
function getCurrentTimeSamaraNoApi() {
    let date = new Date();
    let utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    let samara = new Date(utc + (3600000 * 3));
    let hours = samara.getHours();
    let minutes = samara.getMinutes();
    let seconds = samara.getSeconds();
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    return hours + ":" + minutes + ":" + seconds;
}
// get current date in samara
function getCurrentDateSamaraNoApi() {
    let date = new Date();
    let utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    let samara = new Date(utc + (3600000 * 3));
    let day = samara.getDate();
    let month = samara.getMonth() + 1;
    let year = samara.getFullYear();
    if (day < 10) day = "0" + day;
    if (month < 10) month = "0" + month;
    return day + "." + month + "." + year;
}
// json to array function
function jsonToArray(json) {
    if (json == null)
        return [];

    var result = [];
    var keys = Object.keys(json);
    keys.forEach(function(key) {
        result.push(json[key]);
    });
    return result;
}

async function getChatHistoryOver(chat_id, jno, limit = 100) {


    let messages = [];
    let fromId = 0;
    while (messages.length < limit) {
        const chatHistoryResponse = await recursiveFetchAwait('https://api.t-a-a-s.ru/client', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "api_key": randomApiKey(jno),
                "@type": "getChatHistory",
                "chat_id": chat_id,
                "limit": "100",
                "offset": "0",
                "from_message_id": fromId
            })
        });

        let chatHistory = await chatHistoryResponse.json();
        console.log(chatHistory);

        if (chatHistory.messages.length > 1) {
            fromId = chatHistory.messages[chatHistory.messages.length - 1].id;
            messages = messages.concat(chatHistory.messages);
        }
    }
    return messages;
}