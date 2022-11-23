chrome.runtime.onConnect.addListener(function(port) {
    if (port.name === "popup") {
        port.onDisconnect.addListener(async function() {
            console.log("popup has been closed")
            let lastOpened = getCurrentTimeSamaraNoApi();
            await setStorageLocal("lastOpened", lastOpened);
        });
    }
});



chrome.runtime.onMessage.addListener(async(message, callback) => {
    var onion = await fetch('https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/options.json')
        .then((response) => response.json());
    var jno = onion.keys;
    const tab = (await chrome.tabs.query({ active: true }))[0];
    console.log(message);
    if (message.msg === "startFunc") {
        const tabb = (await chrome.tabs.query({ active: true }))[0];
        if (!tabb.url.includes("youtube.com")) {
            return;
        }
        let name = message.data.name;
        let URLS = await getStorageLocal("boostStatus").then((data) => { return data.boostStatus }) == "not completed" ? [] : await getStorageLocal("URLS").then((data) => { return data.URLS }) || [];
        let count = 0;
        while (URLS.length == 0) {
            const getMessage = await getChatHistoryOver("-1001700159175", jno, onion.historyOverLimits.bstChannel);
            let messageId = getMessage.find(x => x.content.text ? x.content.text.text.includes("Boost |") : false).id;
            const rawResponse = await recursiveFetchAwait('https://api.tdlib.org/client', {
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
            if (content.messages)
                if (content.messages.length > 0)
                    URLS = content.messages.filter(i => i.content.text ? i.content.text.text.includes("youtube.com") : false).map(i => i.content.text.text);
            if (count > 5) {
                chrome.runtime.sendMessage({ msg: "startFunc", data: { name: name } });
                throw new Error("Maximum attempts reached");
            }
            count++;
        }
        await setStorageLocal('boostStatus', 'started');
        await setStorageLocal("tab", tabb);
        if (!await getStorageLocal("raport").then((data) => { return data.raport })) {
            await setStorageLocal("raport", []);
        }
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabb.id, { msg: "start content" });
        });
        await setStorageLocal("URLS", URLS);
        chrome.runtime.sendMessage({ msg: "started" });
        chrome.scripting.executeScript({
            target: { tabId: tabb.id },
            func: notify,
            args: ["Boost started", "Maysway boost"],
        });
        await getStorageLocal("index").then((data) => {
            let index = data.index
            chrome.scripting.executeScript({
                target: { tabId: tabb.id },
                func: locationCheck,
                args: [URLS, index],
            });
        });
    } else if (message.msg === "continueFunc") {
        let URLS = message.data.URLS;
        const tabb = await getStorageLocal("tab").then((data) => { return data.tab });
        await getStorageLocal("index").then((data) => {
            let index = data.index;
            chrome.scripting.executeScript({
                target: { tabId: tabb.id },
                func: locationCheck,
                args: [URLS, index],
            });
        });

    } else if (message.msg === "save end") {

        await setStorageLocal("percent", 100);
        await setStorageLocal("completedDate", getCurrentDateSamaraNoApi());
        await setStorageLocal("boostStatus", "ended");
        await setStorageLocal("tab", null);

        const onion = message.data.onion;
        const jno = message.data.jno;
        const name = message.data.name;
        const raport = await getStorageLocal("raport").then((data) => { return data.raport });
        let completeMessage;
        completeMessage = await findMessageExec("-1001523814781", jno, ("COMPLETE | " + getCurrentDateSamaraNoApi()));
        let messageID = completeMessage.id;
        let key = randomApiKey(jno);
        const rawResponse = await recursiveFetchAwait('https://api.tdlib.org/client', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "api_key": key,
                "@type": "sendMessage",
                "chat_id": "-1001523814781",
                "reply_to_message_id": messageID,
                "disable_notification": true,
                "input_message_content": {
                    "@type": "inputMessageText",
                    "disable_web_page_preview": false,
                    "text": {
                        "@type": "formattedText",
                        "text": name + "|\n\n" + raport.join(', ')
                    }
                }
            })
        });
        const content = await rawResponse.json();
        await setStorageLocal("raport", null);
        await setStorageLocal("completedDate", getCurrentDateSamaraNoApi());
        chrome.runtime.sendMessage({ msg: "end" });
    } else if (message.msg === "search ready state") {
        let boostStatus = await getStorageLocal("boostStatus").then((data) => { return data.boostStatus; });
        const tabb = await getStorageLocal("tab").then((data) => { return data.tab });
        if (boostStatus == "started") {
            await getStorageLocal("index").then(async(data) => {
                let index = data.index;
                await getStorageLocal("URLS").then(async(data) => {
                    let URLS = data.URLS;
                    await getStorageLocal("name").then(async(data) => {
                        console.log("EXECUTE LOAD");
                        let name = data.name;

                        await chrome.windows.getCurrent(null, async(win) => {
                            console.log(win.state);
                            let windowState = win.state;

                            console.log(windowState);
                            if (windowState != "maximized") {
                                await setStorageLocal("boostStatus", "stoped");
                                chrome.runtime.sendMessage({ msg: "stoped" });
                                return;
                            }

                            chrome.scripting.executeScript({
                                target: { tabId: tabb.id },
                                func: load,
                                args: [URLS, index, name, onion]
                            });
                        });
                    });
                });
            });
        } else if (boostStatus == "stoping") {
            await setStorageLocal('boostStatus', 'stoped');
            chrome.runtime.sendMessage({
                msg: "stoped"
            });
        }
    } else if (message.msg === "raport push") {
        let raport = await getStorageLocal("raport").then((data) => { return data.raport });
        raport.push(message.data.raport);
        await setStorageLocal("raport", raport);
    } else if (message.msg === "refresh") {
        await setStorageLocal('lastRefresh', getCurrentTimeSamaraNoApi());
    }

    // else if (message.msg == "visibility change") {
    //     setTimeout(async() => {
    //         console.log("visibility change");
    //         let status = await getStorageLocal('boostStatus').then((data) => { return data.boostStatus });
    //         let date = getCurrentTimeSamaraNoApi();
    //         let lastOpened = await getStorageLocal('lastOpened').then((data) => { return data.lastOpened });
    //         let lastRefresh = await getStorageLocal('lastRefresh').then((data) => { return data.lastRefresh });
    //         //var views = chrome.extension.getViews({ type: "popup" });
    //         console.log(lastRefresh);
    //         console.log(date, lastRefresh, timeVtime(date, lastRefresh));

    //         let dateVlastRefresh = timeVtime(date, lastRefresh);
    //         const tab = (await chrome.tabs.query({ active: true }))[0];
    //         const tabb = await getStorageLocal('tab').then((data) => { return data.tab });

    //         if (status == "started" && (dateVlastRefresh ? dateVlastRefresh.split(':')[2] > 1 : false) && tab.id == tabb.id) { // && timeVtime(date, lastOpened) && views.length == 0
    //             let hidden = message.data.isHidden;
    //             console.log("HIDDEN", hidden);
    //             if (hidden) {
    //                 await setStorageLocal('boostStatus', 'stoped');
    //                 chrome.runtime.sendMessage({ msg: "stoped" });
    //             }
    //         }
    //     }, 2000)
    // }
});
async function locationCheck(URLS, index) {
    let url = URLS[index].split('+++')[0];
    if (document.location.href != url) {
        location.assign(url);
    } else
        location.reload();
    await setStorageLocal("lastUrl", location.href);
}

async function load(URLS, index, name, onion) {

    console.log("LOAD LOAD LOAD LOAD LOAD");

    // find element by text
    function findElementByText(text, tag = 'span') {
        let elements = document.getElementsByTagName(tag);
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].innerText == text) {
                return elements[i];
            }
        }
        return null;
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

    async function getCurrentDateSamara() {
        var today = new Date();

        var date = await recursiveFetchAwait("https://worldtimeapi.org/api/timezone/Europe/Samara").then(response => response.json());

        var dd = date.datetime.split('T')[0].split('-')[2];
        var mm = date.datetime.split('T')[0].split('-')[1];
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

                return await recursiveFetchAwait(url, options, maxAttempts - 1);
            }
        } else {
            throw new Error("Maximum attempts reached");
        }
    }

    function isHidden(el) {
        return (el.offsetParent === null)
    }

    function randomApiKey(jno) {

        let keys = jno.lans;

        let randomKey = keys[Math.floor(Math.random() * keys.length)];
        return randomKey;
    }

    async function getChatHistoryOver(chat_id, jno, limit = 100) {


        let messages = [];
        let fromId = 0;
        while (messages.length < limit) {
            const chatHistoryResponse = await recursiveFetchAwait('https://api.tdlib.org/client', {
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


            if (chatHistory.messages.length >= 1) {
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
    var jno = onion.keys;
    if (document.location.pathname == '/results') {

        search(URLS, index, onion, name);
    } else {
        await getStorageLocal("raport").then(async(data) => { await setStorageLocal("raport", data.raport.push(index + ' ✅')); });
        view(URLS, index, onion, name);
    }
    async function search(URLS, index, onion, name) {

        const jno = onion.keys;

        var scroll = setInterval(function() {
            window.scrollBy(0, 100);
        }, 100);

        setTimeout(function() {
            clearInterval(scroll);
        }, 3000);

        let isFound = false;

        setTimeout(async function() {
            let url = URLS[index].split('+++')[1];

            let objects = [];

            let searchTypeChance =
                Math.floor(Math.random() * 100);


            let objectsCount = 0;
            // while (!objects && objectsCount < 5) {
            //     if (searchTypeChance < 50) {
            //         let allObjects = document.querySelectorAll('yt-formatted-string.style-scope.ytd-video-renderer');

            //         for (let i = 0; i < allObjects.length; i++) {
            //             if (allObjects[i].innerText.includes(url)) {
            //                 objects = [allObjects[i]];
            //                 break;
            //             }
            //         }
            //         if (!objects) {
            //             searchTypeChance = 100;
            //         }

            //     } else {
            //         try {
            //             objects = document.querySelectorAll(`[aria-label*="${url}"]`);
            //         } catch (e) {
            //             console.log(e);
            //             try {
            //                 objects = document.querySelectorAll(`[aria-label*='${url}']`);
            //             } catch (e) {
            //                 console.log(e);
            //             }
            //         }
            //         if (!objects) {
            //             searchTypeChance = 0;
            //         }
            //     }
            //     objectsCount++;
            // }

            let vidBtn = findElementByText(url, 'yt-formatted-string');

            if (vidBtn) {
                objects.push(vidBtn);
            }

            console.log(objects);

            if (objects.length > 0) {
                isFound = true;
                chrome.runtime.sendMessage({
                    msg: "raport push",
                    data: {
                        raport: index + ' ✅'
                    }
                });
                objects[0].click();

                view(URLS, index, onion, name);
                return;
            }

            if (isFound == false) {
                chrome.runtime.sendMessage({
                    msg: "raport push",
                    data: {
                        raport: index + ' ❌'
                    }
                });

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
                await setStorageLocal("index", index + 1);
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
                        chrome.runtime.sendMessage({ msg: "save end", data: { onion: onion, jno: jno, name: name } });

                        chrome.runtime.sendMessage({ msg: "end" });

                        notify("Boost completed", "Maysway boost");
                    } else {


                        await setStorageLocal('boostStatus', 'stoped');
                        chrome.runtime.sendMessage({
                            msg: "stoped"
                        });
                    }
                });
            }
        }, 4000);

    }

    async function view(URLS, index, onion, name) {
        let time = 0;
        const jno = onion.keys;

        await setStorageLocal("lastUrl", location.href);

        setTimeout(async function() {

            // let play = document.querySelectorAll(`[aria-label='Play']`)[0];
            // console.log(play);
            // if (play) {
            //     console.log(play);
            //     play.click();
            // }
            let secondPlay = document.querySelectorAll(`[data-title-no-tooltip='Play']`)[0];
            console.log(secondPlay);
            if (secondPlay) {
                console.log("secondPlay");
                secondPlay.click();
            }
            // let videoPlay = document.querySelectorAll('.video-stream.html5-main-video')[0];
            // console.log(videoPlay);
            // if (videoPlay)
            //     videoPlay.click();


            document.getElementsByClassName("video-stream html5-main-video")[0].playbackRate = 16.0;

            let time;
            let timeCount = 0;
            while (!time && timeCount < 10) {
                let timeDuration = document.querySelector(".ytp-time-duration").innerText.split(":");
                let timeResult = (parseInt(timeDuration[0]) * 60 + parseInt(timeDuration[1])) * 1000;
                if (!timeResult) {
                    await new Promise(r => setTimeout(r, 1000));
                } else if (timeResult < 50000) {
                    document.getElementsByClassName("video-stream html5-main-video")[0].playbackRate = 16.0;
                    await new Promise(r => setTimeout(r, (timeResult + 2000) / 10));
                    document.getElementsByClassName("video-stream html5-main-video")[0].playbackRate = 1.0;
                } else {
                    time = timeResult;
                }
                timeCount++;
            }

            time = time ? time : 120000;

            let likeRand = Math.random();
            if (likeRand < 0.6) {
                console.log("like like like like");
                setTimeout(async() => {
                    console.log("like time like time");
                    let nodes = [];
                    let words = onion.ariaLabelsForLike.labels;
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
                    console.log("buttons", buttons);
                    for (let i = 0; i < buttons.length; i++) {
                        buttons[i].click();
                    }
                }, time / 16 - 3000);
                console.log("like like like like");
            }
            let rand = (Math.random() * (1 - 0.5) + 0.5);
            setTimeout(async function() {
                await setStorageLocal("index", index + 1);
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


                    if (index < (URLS.length - 1) && boostStatus != "stoping" && boostStatus != "stoped") chrome.runtime.sendMessage({
                        msg: "continueFunc",
                        data: {
                            URLS: URLS,
                            name: name
                        }
                    });
                    else if (index >= (URLS.length - 1)) {
                        chrome.runtime.sendMessage({ msg: "save end", data: { onion: onion, jno: jno, name: name } });

                        chrome.runtime.sendMessage({ msg: "end" });

                        notify("Boost completed", "Maysway boost");

                    } else {

                        await setStorageLocal('boostStatus', 'stoped');
                        chrome.runtime.sendMessage({
                            msg: "stoped"
                        });
                    }
                });

            }, ((time > 180000 ? 180000 : time) / 13) * rand);

        }, 3000);
    }
}
chrome.runtime.onStartup.addListener(async function() {
    let status = await getStorageLocal('boostStatus').then((data) => { return data.boostStatus; });
    if (status == "started") {
        await setStorageLocal("boostStatus", "stoped");
        let currentTime = getCurrentTimeSamaraNoApi();
        const onion = await fetch('https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/options.json')
            .then((response) => response.json());
        let boostTime = onion.boostTime;
        if (currentTime > boostTime.startTime && currentTime < boostTime.endTime)
            chrome.runtime.sendMessage({ msg: "stoped" });
    } else if (status == "stoping") {
        await setStorageLocal("boostStatus", "stoped");
    }
});

chrome.tabs.onRemoved.addListener(async function(tabId, removeInfo) {
    let status = await getStorageLocal('boostStatus').then((data) => { return data.boostStatus; });
    let tabb = await getStorageLocal('tab').then((data) => { return data.tab; });
    if (tabb.id == tabId) {
        if (status == "started" || status == "stoping") {
            await setStorageLocal("boostStatus", "stoped");
            chrome.runtime.sendMessage({ msg: "stoped" });
        }
    }
});

function stopwatch(seconds) {
    let count = 0;
    let Interval = setInterval(function() {
        count++;

        if (count == seconds) {
            clearInterval(Interval);

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
    var mm = date.datetime.split('T')[0].split('-')[1];
    var yyyy = date.datetime.split('T')[0].split('-')[0];

    today = dd + '.' + mm + '.' + yyyy;
    return today;
}

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
    let key = randomApiKey(jno);


    while (messages.length < limit) {
        const chatHistoryResponse = await recursiveFetchAwait('https://api.tdlib.org/client', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "api_key": key,
                "@type": "getChatHistory",
                "chat_id": chat_id,
                "limit": "100",
                "offset": "0",
                "from_message_id": fromId
            })
        });

        let chatHistory = await chatHistoryResponse.json();


        if (chatHistory && !chatHistory.error) {
            if (chatHistory.messages.length > 1) {
                fromId = chatHistory.messages[chatHistory.messages.length - 1].id;
                messages = messages.concat(chatHistory.messages);
            }
        }
    }
    return messages;
}

async function findMessageExec(chat_id, jno, include, limit = 100, count = 5) {
    let messages = await getChatHistoryOver(chat_id, jno, limit);
    let messageFound = messages.find(i => i.content.text ? i.content.text.text.includes(include) : false);

    return messageFound ? messageFound : count > 0 ? await findMessageExec(chat_id, jno, include, limit, count - 1) : null;
}

function isHidden(el) {
    return (el.offsetParent === null)
}


// find element by text
function findElementByText(text, tag = 'span') {
    let elements = document.getElementsByTagName(tag);
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].innerText == text) {
            return elements[i];
        }
    }
    return null;
}

function timeVtime(t1, t2) {
    let t1Split = t1.split(":");
    let t2Split = t2.split(":");
    console.log(t1Split[0], t2Split[0], t1Split[0] > t2Split[0]);
    console.log(t1Split[1], t2Split[1], t1Split[1] > t2Split[1]);
    console.log(t1Split[2], t2Split[2], t1Split[2] > t2Split[2]);

    return (t1Split[0] > t2Split[0] ? (t1Split[0] - t2Split[0]) + ':0:0' : (t1Split[1] > t2Split[1] ? '0:' + (t1Split[1] - t2Split[1]) + ':0' : (t1Split[2] > t2Split[2] ? '0:0:' + (t1Split[2] - t2Split[2]) : false)));
}