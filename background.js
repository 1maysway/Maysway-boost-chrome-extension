chrome.runtime.onMessage.addListener(async(message, callback) => {
    console.log("Message Received");
    console.log(message);

    var jno = await fetch('https://raw.githubusercontent.com/Potatoii/maysway-BeatBoost/main/keys.json')
        .then((response) => response.json())

    // console.log(jno);
    // console.log(jno.lans);

    // let URLS = message.data.URLS;
    // let name = message.data.name;

    const tab = (await chrome.tabs.query({ active: true }))[0];

    if (message.msg === "startFunc") {
        console.log("Started From Background");

        let URLS = [];
        //let name = message.data.name; //"@undefined"

        // send message to content.js
        //await chrome.tabs.sendMessage(tab.id, { msg: "start content" });

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { msg: "start content" });
        });

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

        URLS = content.messages.filter(i => i.content.text.text.includes("youtube.com")).map(i => i.content.text.text);
        await setStorageLocal("URLS", URLS);

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: notify,
            args: ["Boost started", "maysway boost"],
        });

        await getStorageLocal("index").then((data) => {
            let index = data.index

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



            //     console.log("executing load");

            //     chrome.scripting.executeScript({
            //         target: { tabId: tab.id },
            //         func: load,
            //         args: [URLS, index, name, jno],
            //     });
            // }, 2000);
        });

    } else if (message.msg === "save end") {

        await setStorageLocal("percent", 100);
        await setStorageLocal("completedDate", await getCurrentDateSamara());
        await setStorageLocal("boostStatus", "ended");
    } else if (message.msg === "search ready state") {
        console.log("search ready state");

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
                        args: [URLS, index, name, jno]
                    });
                });
            });
        });
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
    }
}

async function load(URLS, index, name, jno) {

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

    async function getChatHistoryOver(chat_id, jno) {


        let messages = [];
        let fromId = 0;
        while (messages.length < 200) {
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
                    "limit": "200",
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


    ////////////////////////////////////


    console.log("Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded");

    console.log("URLS = " + URLS);

    console.log("PATH PATH PATH PATH = " + document.location.pathname);
    if (document.location.pathname == '/results') {
        console.log("Results Results Results");
        search(URLS, index, jno, name);
    } else {
        console.log("View View View ");
        view(URLS, index, jno, name);
    }


    async function search(URLS, index, jno, name) {
        console.log("SEARCH SEARCH SEARCH ");

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

                    view(URLS, index, jno, name);

                    return;
                }
            }

            await getStorageLocal("boostStatus").then(async(result) => {
                let boostStatus = result.boostStatus;

                if (index < (URLS.length - 1) && boostStatus != "stoping") chrome.runtime.sendMessage({
                    msg: "continueFunc",
                    data: {
                        URLS: URLS,
                        name: name
                    }
                });
                else if (index >= (URLS.length - 1)) {
                    console.log("END END END END END END");
                    // const tab = (await chrome.tabs.query({ active: true }))[0];

                    // await chrome.tabs.sendMessage(tab.id, { msg: "stop content" });

                    chrome.runtime.sendMessage({ msg: "save end" });

                    let messages = await getChatHistoryOver("-1001523814781", jno);

                    let completeMessage = messages.filter(i => /^Members - COMPLETE/.exec(i.content.text.text))[0];
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
                    await setStorageLocal("completedDate", await getCurrentDateSamara());

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

    async function view(URLS, index, jno, name) {
        let time = 0;

        await setStorageLocal("index", index + 1);
        setTimeout(async function() {
            setTimeout(() => {
                try {
                    //document.querySelector('yt-icon-button.style-scope.ytd-toggle-button-renderer.style-text').click();
                    document.getElementsByClassName('yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m yt-spec-button-shape-next--icon-leading yt-spec-button-shape-next--segmented-start ')[0].click()
                } catch {
                    console.log("Like button not found");
                }
            }, 2000);

            document.getElementsByClassName("video-stream html5-main-video")[0].playbackRate = 16.0;

            let timeDuration = document.querySelector(".ytp-time-duration").innerText.split(":");
            time = (parseInt(timeDuration[0]) * 60 + parseInt(timeDuration[1])) * 1000;

            let rand = (Math.random() * (1 - 0.5) + 0.5);

            setTimeout(async function() {
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

                    if (index < (URLS.length - 1) && boostStatus != "stoping") chrome.runtime.sendMessage({
                        msg: "continueFunc",
                        data: {
                            URLS: URLS,
                            name: name
                        }
                    });
                    else if (index >= (URLS.length - 1)) {
                        console.log("END END END END END END");

                        //const tab = (await chrome.tabs.query({ active: true }))[0];

                        //await chrome.tabs.sendMessage(tab.id, { msg: "stop content" });

                        // const toPromise = (callback) => {
                        //     const promise = new Promise((resolve, reject) => {
                        //         try {
                        //             callback(resolve, reject);
                        //         } catch (err) {
                        //             reject(err);
                        //         }
                        //     });
                        //     return promise;
                        // }

                        // // Usage example: 
                        // const saveData = (Key, Value) => {
                        //     const key = Key;
                        //     const value = {
                        //         [key]: Value
                        //     };

                        //     const promise = toPromise((resolve, reject) => {
                        //         chrome.storage.local.set({
                        //             [key]: value
                        //         }, () => {
                        //             if (chrome.runtime.lastError)
                        //                 reject(chrome.runtime.lastError);

                        //             resolve(value);
                        //         });
                        //     });
                        // }

                        // // Now we can await it:
                        // saveData("percent", 100);
                        // saveData("boostStatus", "ended");
                        // saveData("completeDate", getCurrentDate());


                        // function setLocalStorage(key, value) {
                        //     chrome.storage.local.set({
                        //         [key]: value
                        //     }, function() {
                        //         console.log('Value is set to ' + value);
                        //     });
                        // }
                        // // get local storage
                        // function getLocalStorage(key) {
                        //     chrome.storage.local.get([key], function(data) {
                        //         return data.key;
                        //     });
                        // }

                        // function getLocalStorageResolve(key) {
                        //     return new Promise(resolve => {
                        //         chrome.storage.local.get([key], function(data) {
                        //             resolve(data.key);
                        //         });
                        //     });
                        // }

                        // // setLocalStorage("percent", { percent: 100 });
                        // // setLocalStorage("boostStatus", { boostStatus: "ended" });
                        // // setLocalStorage("completedDate", { completedDate: getCurrentDate() });

                        // let percentt = await getLocalStorageResolve("percent");
                        // let completedDatee = await getLocalStorageResolve("completedDate");
                        // let boostStatuss = await getLocalStorageResolve("boostStatus");

                        // function getLocalStorageR(key) {
                        //     getLocalStorageResolve(key).then(result => {
                        //         console.log(result);
                        //         percentt = result;
                        //     })
                        // }
                        // getLocalStorageR("percent");


                        // let percentt = await percenttPromise.json();
                        // let completedDatee = await completedDateePromise.json();
                        // let boostStatuss = await boostStatussPromise.json();

                        // console.log(boostStatuss);
                        // console.log(percentt);
                        // console.log(completedDatee);

                        chrome.runtime.sendMessage({ msg: "save end" });

                        //(async() => {

                        let messages = await getChatHistoryOver("-1001523814781", jno);

                        //let messages = chatHistory.messages;
                        console.log(messages);

                        let completeMessage = messages.filter(i => /^Members - COMPLETE/.exec(i.content.text.text))[0];
                        console.log(completeMessage);
                        let messageID = completeMessage.id;
                        console.log(messageID);
                        console.log(completeMessage.content.text.text);

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
                            console.log('CONTENT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                            console.log(content);
                        }
                        //})();

                        await setStorageLocal("boostStatus", "ended");
                        await setStorageLocal("completedDate", await getCurrentDateSamara());

                        chrome.runtime.sendMessage({ msg: "end" });


                        notify("Boost completed", "maysway boost");

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
    console.log(keys);
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