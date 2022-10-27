async function loadExt() {
    let percent;
    let completedDate;
    let boostStatus;
    let name;
    let index;
    let startedDate;


    await getStorageLocalAll().then(async function(result) {
        percent = result.percent || 0;
        completedDate = result.completedDate || "";
        boostStatus = result.boostStatus || "";
        name = result.name || "";
        index = result.index || 0;
        startedDate = result.startedDate || "";

        document.forms['start-form'].name.value = name || "";

        let currentTime = getCurrentTimeSamaraNoApi();
        let currentDate = getCurrentDateSamaraNoApi();

        //currentTime >= "20:15:00" && 
        if (currentTime <= "23:59:59") {
            if (startedDate != currentDate && (boostStatus != "not completed" && boostStatus != "undefined" && boostStatus != undefined)) {
                boostStatus = "not completed";
                setStorageLocal("boostStatus", "not completed");
            }

            console.log("status: " + boostStatus);

            document.querySelector('.date').innerHTML = getCurrentDate();
            document.forms['start-form'].style.display = 'none';

            switch (boostStatus) {
                case "started":
                    {
                        //document.forms['start-form'].style.display = 'none';
                        document.getElementById('stop-btn').style.display = 'block';
                        document.getElementById('complete').style.display = 'none';
                        document.querySelector("#percent").innerText = Math.floor(percent || 0) + "%";
                        document.documentElement.style.setProperty("--porcent-js", percent || 0);
                        console.log("started");
                        break;
                    }
                case "ended":
                    {
                        //document.forms['start-form'].style.display = 'none';
                        document.getElementById('stop-btn').style.display = 'none';
                        document.getElementById('complete').style.display = 'block';
                        document.querySelector("#percent").innerText = "100%";
                        document.documentElement.style.setProperty("--porcent-js", 100);
                        console.log("ended");
                        break;
                    }
                case "stoped":
                    {
                        document.getElementById('stop-btn').innerHTML = "";
                        document.getElementById('stop-btn').innerText = "Continue";
                        document.getElementById('stop-btn').name = "continue";
                        //document.forms['start-form'].style.display = 'none';
                        document.getElementById('stop-btn').style.display = 'block';
                        document.querySelector("#percent").innerText = Math.floor(percent || 0) + "%";
                        document.documentElement.style.setProperty("--porcent-js", percent || 0);
                        console.log("stoped");
                        break;
                    }
                case "stoping":
                    {
                        let loader = '<div class="preloader preloader-btn"><svg class="preloader__image" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor"d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"></path></svg></div>';
                        document.getElementById('stop-btn').innerHTML = loader;
                        document.getElementById('stop-btn').name = "stoping";
                        //document.forms['start-form'].style.display = 'none';
                        document.getElementById('stop-btn').style.display = 'block';
                        document.querySelector("#percent").innerText = Math.floor(percent || 0) + "%";
                        document.documentElement.style.setProperty("--porcent-js", percent || 0);
                        document.body.classList.add('stoping');
                        console.log("stoping");
                        break;
                    }
                default:
                    {
                        document.forms['start-form'].style.display = 'block';
                        document.getElementById('stop-btn').style.display = 'none';
                        document.getElementById('complete').style.display = 'none';
                        document.querySelector("#percent").innerText = "0%";
                        document.documentElement.style.setProperty("--porcent-js", 0);
                        console.log("default");
                        break;
                    }
            }
        } else {
            if (boostStatus != "ended") {
                document.getElementById('complete').innerText = "Boost not completed";
                await setStorageLocal("boostStatus", "not completed");
            }
            document.forms['start-form'].style.display = 'none';
            document.getElementById('stop-btn').style.display = 'none';
            document.getElementById('complete').style.display = 'block';
            document.querySelector("#percent").innerText = percent + "%";
            document.documentElement.style.setProperty("--porcent-js", percent);
            document.querySelector('.date').innerHTML = completedDate;
            console.log("ended");
        }

        document.body.classList.add('loaded');
        //}, 500);
    });



}

//loadExt();

async function preLoad() {
    let version = await fetch('https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/Version.json')
        .then((response) => response.json())

    if (chrome.runtime.getManifest().version == version.version) {
        loadExt();
    } else {
        document.body.innerHTML = `<div class="container"><h1 style="text-align:center;">Outdated version of the extension.</h1></div>`;
    }
}

preLoad();



//////////////////////////////////////


var startForm = document.forms['start-form'];
console.log(startForm);

// stop button
document.getElementById('stop-btn').addEventListener('click', async(event) => {

    console.log(event.target);
    if (event.target.name == 'stop') {
        await setStorageLocal('boostStatus', 'stoping');
        console.log('stop');

        let loader = '<div class="preloader preloader-btn"><svg class="preloader__image" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor"d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"></path></svg></div>';

        event.target.innerHTML = loader;
        document.body.classList.add('stoping');

        event.target.name = 'stoping';
        // event.target.innerText = 'Continue';

    } else if (event.target.name == 'continue') {
        await setStorageLocal('boostStatus', 'started');
        console.log('continue');
        event.target.name = 'stop';
        document.getElementById('stop-btn').innerHTML = "";
        event.target.innerText = 'Stop';

        await getStorageLocal('name').then((result) => {
            let name = result.name;
            chrome.runtime.sendMessage({ msg: "startFunc", data: { name: name } });
        });
    }
});


// form submit
startForm.addEventListener('submit', async(event) => {
    event.preventDefault();



    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await setStorageLocal("index", 0);
    await setStorageLocal("percent", 0);
    await setStorageLocal("startedDate", getCurrentDateSamaraNoApi());

    const formData = new FormData(startForm);

    await setStorageLocal('name', formData.get('name'));
    await setStorageLocal('boostStatus', 'started');

    document.querySelector('#stop-btn').style.display = 'block';

    startForm.style.display = 'none';

    // let fet = fetch("https://api.t-a-a-s.ru/client", {
    //     method: "POST",
    //     body: JSON.stringify({
    //         api_key: "79021593540:RL_BeyWuK9Yqx9uzT87xAeAg9FPes719Es1NZM9r",
    //         type: "getMessageThreadHistory",
    //         chat_id: "-1001700159175",
    //         message_id: "4194304",
    //         from_message_id: "0",
    //         limit: "200",
    //         offset_order: "9223372036854775807"
    //     }),
    //     headers: new Headers()
    // });


    // (async() => {
    //     const rawResponse = await fetch('https://api.t-a-a-s.ru/client', {
    //         method: 'POST',
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //             "api_key": "79021593540:RL_BeyWuK9Yqx9uzT87xAeAg9FPes719Es1NZM9r",
    //             "@type": "getMessageThreadHistory",
    //             "chat_id": "-1001700159175",
    //             "message_id": "4194304",
    //             "from_message_id": "0",
    //             "limit": "200",
    //             "offset_order": "9223372036854775807"
    //         })
    //     });
    //     const content = await rawResponse.json();

    //     console.log(content);
    // })();



    //console.log(fet);

    let percent;

    await getStorageLocal('percent', (data) => { percent = data.percent; });

    await setStorageLocal('percent', 0);
    document.querySelector("#percent").innerText = (percent || 0) + "%";
    document.documentElement.style.setProperty("--porcent-js", percent || 0);

    chrome.runtime.sendMessage({ msg: "startFunc", data: { name: formData.get('name') } });

    // let api = await (await fetch("https://api.telegram.org/bot5545577999:AAEsspDSyNjn7kl_O3wLvtj3f081i1bmZWU/getUpdates?chat_id=-748178856")).json();
    // let apiLength = api.result.length;
    // let URLS = api.result[apiLength - 1].message.text.split(" ");

    // console.log(api);
    // console.log(api.result[apiLength - 1].message.text);
    // console.log("URLS = " + URLS);

    //console.log(localStorage.getItem("URLS"));

    //setInterval(function() {
    // document.addEventListener("DOMContentLoaded", function() {
    //     console.log("DOMContentLoaded");
    //     chrome.scripting.executeScript({
    //         target: { tabId: tab.id },
    //         files: ["content.js"]
    //     });
    // });


    // chrome.scripting.executeScript({
    //     target: { tabId: tab.id },
    //     files: ["content.js"]
    // });


    //}, 20000);
});

// messages handler
chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
        console.log(request.msg);
        if (request.msg === "percentUpdate") {

            document.querySelector("#percent").innerText = Math.floor(parseFloat(request.data.plus)) + "%";
            document.documentElement.style.setProperty("--porcent-js", request.data.plus);

        } else if (request.msg === "end") {
            // (async() => {

            //     const chatHistoryResponse = await fetch('https://api.t-a-a-s.ru/client', {
            //         method: 'POST',
            //         headers: {
            //             'Accept': 'application/json',
            //             'Content-Type': 'application/json'
            //         },
            //         body: JSON.stringify({
            //             "api_key": randomApiKey(),
            //             "@type": "getChatHistory",
            //             "chat_id": "-1001523814781",
            //             "limit": "10",
            //             "offset": "0",
            //             "from_message_id": "0"
            //         })
            //     });
            //     console.log(chatHistoryResponse);

            //     let chatHistory = await chatHistoryResponse.json();
            //     console.log(chatHistory);

            //     let messages = chatHistory.messages;
            //     console.log(messages);

            //     let messageID = messages[0].id;

            //     console.log(messageID);
            //     console.log(messages[0].content.text.text);




            //     if (messages[0].content.text.text == "Members - COMPLETE") {
            //         console.log(name);
            //         const rawResponse = await fetch('https://api.t-a-a-s.ru/client', {
            //             method: 'POST',
            //             headers: {
            //                 'Accept': 'application/json',
            //                 'Content-Type': 'application/json'
            //             },
            //             body: JSON.stringify({
            //                 "api_key": randomApiKey(),
            //                 "@type": "sendMessage",
            //                 "chat_id": "-1001523814781",
            //                 "reply_to_message_id": messageID,
            //                 "disable_notification": true,
            //                 "input_message_content": {
            //                     "@type": "inputMessageText",
            //                     "disable_web_page_preview": false,
            //                     "text": {
            //                         "@type": "formattedText",
            //                         "text": localStorage.getItem("name") || name
            //                     }
            //                 }
            //             })
            //         });
            //         const content = await rawResponse.json();
            //         console.log(content);
            //     }
            // })();

            // document.forms['start-form'].style.display = 'none';
            // document.getElementById('stop-btn').style.display = 'none';
            // document.getElementById('complete').style.display = 'block';


            if (document.body.classList.contains('stoping')) {
                document.body.classList.remove('stoping');
                document.getElementById('stop-btn').innerHTML = "";
                document.getElementById('stop-btn').innerText = "Stop";
                document.getElementById('stop-btn').name = "stop";
            }

            document.forms['start-form'].style.display = 'none';
            document.getElementById('stop-btn').style.display = 'none';
            document.getElementById('complete').style.display = 'block';
            document.querySelector("#percent").innerText = "100%";
            document.documentElement.style.setProperty("--porcent-js", 100);
            console.log("end");
        } else if (request.msg === "stoped") {
            console.log("message stoped");
            document.getElementById('stop-btn').innerHTML = "";
            document.getElementById('stop-btn').innerText = "Continue";
            document.getElementById('stop-btn').name = "continue";
            document.body.classList.remove("stoping");
        }
    }
);


function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function getCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = dd + '.' + mm + '.' + yyyy;
    return today;
}

async function getCurrentTimeSamara() {
    let date = await recursiveFetchAwait("http://worldtimeapi.org/api/timezone/Europe/Samara").then(response => response.json());
    let time = date.datetime.split('T')[1].split('.')[0];
    return time || "00:00:00";
}

async function getCurrentDateSamara() {
    //"https://timeapi.io/api/Time/current/zone?timeZone=Europe/Samara"
    var today = new Date();
    var date = await recursiveFetchAwait("https://worldtimeapi.org/api/timezone/Europe/Samara").then(response => response.json());

    var dd = date.datetime.split('T')[0].split('-')[2];
    var mm = date.datetime.split('T')[0].split('-')[1]; //January is 0!
    var yyyy = date.datetime.split('T')[0].split('-')[0];

    today = dd + '.' + mm + '.' + yyyy;
    return today;
}

function randomApiKey() {
    let keys = ["79021593540:RL_BeyWuK9Yqx9uzT87xAeAg9FPes719Es1NZM9r", "89021593540:yKC7y3BqKszTSP7hn1Xc8ze6sCmsiK-RFtx6sNzD", "89021593540:yb46up2p7zLZxm_HKTTtZ6xGeLxwfg5A1i4yXJRU"];
    let randomKey = keys[Math.floor(Math.random() * keys.length)];
    return randomKey;
}

function getStorageLocal(key) {
    return promiseToValue(new Promise((resolve, reject) => {
        chrome.storage.local.get(key, function(result) {
            resolve(result);
        });
    }));
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
async function promiseToValue(promise) {
    return promise.then(function(result) {
        return result;
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

document.getElementById('reset').addEventListener('click', function resetStorage() {
    getStorageLocalAll().then(function(result) {
        console.log(result);
    });
    chrome.storage.local.clear(function() {
        console.log("storage cleared");
    });
});

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

function getStorageLocalAll() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(null, function(result) {
            resolve(result);
        });
    });
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