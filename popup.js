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
        let tabb = result.tab;
        document.forms['start-form'].name.value = name || "";
        let currentTime = getCurrentTimeSamaraNoApi();
        let currentDate = getCurrentDateSamaraNoApi();
        var onion = await fetch('https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/options.json')
            .then((response) => response.json());
        let boostTime = onion.boostTime;
        document.querySelector('.date').innerHTML = getCurrentDate();
        //>= boostTime.startTime && currentTime <= boostTime.endTime
        if (currentTime) {
            if (startedDate != currentDate && (boostStatus != "not completed" && boostStatus != "undefined" && boostStatus != undefined)) {
                boostStatus = "not completed";
                await setStorageLocal("boostStatus", "not completed");
            }
            document.forms['start-form'].style.display = 'none';
            switch (boostStatus) {
                case "started":
                    {
                        document.getElementById('stop-btn').style.display = 'block';
                        document.getElementById('complete').style.display = 'none';
                        document.querySelector("#percent").innerText = Math.floor(percent || 0) + "%";
                        document.documentElement.style.setProperty("--porcent-js", percent || 0);
                        break;
                    }
                case "ended":
                    {
                        document.getElementById('stop-btn').style.display = 'none';
                        document.getElementById('complete').style.display = 'block';
                        document.querySelector("#percent").innerText = "100%";
                        document.documentElement.style.setProperty("--porcent-js", 100);
                        break;
                    }
                case "stoped":
                    {
                        document.getElementById('stop-btn').innerHTML = "";
                        document.getElementById('stop-btn').innerText = "Continue";
                        document.getElementById('stop-btn').name = "continue";
                        document.getElementById('stop-btn').style.display = 'block';
                        document.querySelector("#percent").innerText = Math.floor(percent || 0) + "%";
                        document.documentElement.style.setProperty("--porcent-js", percent || 0);
                        break;
                    }
                case "stoping":
                    {
                        let loader = '<div class="preloader preloader-btn"><svg class="preloader__image" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor"d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"></path></svg></div>';
                        document.getElementById('stop-btn').innerHTML = loader;
                        document.getElementById('stop-btn').name = "stoping";
                        document.getElementById('stop-btn').style.display = 'block';
                        document.querySelector("#percent").innerText = Math.floor(percent || 0) + "%";
                        document.documentElement.style.setProperty("--porcent-js", percent || 0);
                        document.body.classList.add('stoping');
                        break;
                    }
                case "pre start":
                    {
                        console.log("PRE START");
                        //document.body.classList.add("stoping");
                        document.body.classList.remove('loaded');

                        break;
                    }
                case "delayed":
                    {
                        // document.forms['start-form'].style.display = 'block';
                        // document.querySelector("#name-input").style.display = "none"
                        // document.querySelector("#start-btn").value = "Cancel launch";
                        // break;
                    }
                default:
                    {
                        document.querySelector("#start-btn").value = "Start";
                        document.forms['start-form'].style.display = 'block';
                        document.querySelector("#name-input").style.display = "block";
                        document.getElementById('stop-btn').style.display = 'none';
                        document.getElementById('complete').style.display = 'none';
                        document.querySelector("#percent").innerText = "0%";
                        document.documentElement.style.setProperty("--porcent-js", 0);
                        break;
                    }
            }
        } else {
            // if (boostStatus == "delayed") {
            //     document.querySelector("#name-input").style.display = "none"
            //     document.querySelector("#start-btn").value = "Cancel launch";
            // } else {
            //     document.querySelector("#start-btn").value = "Delayed start";
            //     document.querySelector("#name-input").style.display = "block"
            // }
            //document.getElementById('complete').innerText = "Boost hasn't started yet";
            //document.forms['start-form'].style.display = 'block';
            document.getElementById('stop-btn').style.display = 'none';
            document.getElementById('complete').style.display = 'block';
            document.querySelector("#percent").style.display = 'none';
        }
        if (boostStatus != "pre start") {
            document.body.classList.add('loaded');
        }
    });
}

async function preLoad() {
    const onion = await fetch('https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/options.json')
        .then((response) => response.json());
    let version = onion.version;
    if (chrome.runtime.getManifest().version == version.version) {
        loadExt();
    } else {
        document.body.innerHTML = `<div class="container"><h1 style="text-align:center;">Outdated version of the extension.</h1></div>`;
    }
    let lastOpened = getCurrentTimeSamaraNoApi();
    await setStorageLocal("lastOpened", lastOpened);
    chrome.runtime.connect({ name: "popup" });
}
preLoad();
var startForm = document.forms['start-form'];
document.getElementById('stop-btn').addEventListener('click', async(event) => {
    if (await getStorageLocal('boostStatus').then((data) => { return data.boostStatus }) != "stoping") {
        if (event.target.name == 'stop') {
            await setStorageLocal('boostStatus', 'stoping');
            let loader = '<div class="preloader preloader-btn"><svg class="preloader__image" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor"d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"></path></svg></div>';
            event.target.innerHTML = loader;
            document.body.classList.add('stoping');
            event.target.name = 'stoping';
        } else if (event.target.name == 'continue') {
            await setStorageLocal('boostStatus', 'started');
            event.target.name = 'stop';
            document.getElementById('stop-btn').innerHTML = "";
            event.target.innerText = 'Stop';
            await getStorageLocal('name').then((result) => {
                let name = result.name;
                chrome.runtime.sendMessage({ msg: "startFunc", data: { name: name } });
            });
        }
    }
});

startForm.addEventListener('submit', async(event) => {
    event.preventDefault();
    let status = await getStorageLocal('boostStatus').then((data) => { return data.boostStatus });
    if (status == "delayed") {
        await setStorageLocal('boostStatus', 'not completed');
        chrome.runtime.sendMessage({ msg: "delayedStop" });
        loadExt();
        return;
    }
    let percent;
    await getStorageLocal('percent', (data) => { percent = data.percent; });
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let currentTime = getCurrentTimeSamaraNoApi();
    var onion = await fetch('https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/options.json')
        .then((response) => response.json());
    let boostTime = onion.boostTime;
    const formData = new FormData(startForm);
    let delayed = false; //(currentTime >= boostTime.startTime && currentTime <= boostTime.endTime ? false : true);
    if (delayed) {
        await setStorageLocal("boostStatus", 'delayed');
        document.querySelector("#start-btn").value = "Cancel launch";
        document.querySelector("#name-input").style.display = "none"
    } else {
        document.querySelector("#percent").innerText = (percent || 0) + "%";
        document.documentElement.style.setProperty("--porcent-js", percent || 0);
        startForm.style.display = 'none';
        document.querySelector('#stop-btn').style.display = 'block';
    }
    await setStorageLocal("index", 0);
    await setStorageLocal("percent", 0);
    await setStorageLocal("startedDate", getCurrentDateSamaraNoApi());
    await setStorageLocal("raport", null);
    await setStorageLocal('name', formData.get('name'));
    await setStorageLocal('percent', 0);
    await setStorageLocal("URLS", null);
    chrome.runtime.sendMessage({ msg: "startFunc", data: { name: formData.get('name'), delayed: delayed } });
});
chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
        if (request.msg === "percentUpdate") {
            document.querySelector("#percent").innerText = Math.floor(parseFloat(request.data.plus)) + "%";
            document.documentElement.style.setProperty("--porcent-js", request.data.plus);
        } else if (request.msg === "end") {
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
        } else if (request.msg === "stoped") {
            document.getElementById('stop-btn').innerHTML = "";
            document.getElementById('stop-btn').innerText = "Continue";
            document.getElementById('stop-btn').name = "continue";
            document.body.classList.remove("stoping");
        } else if (request.msg === "started") {
            let percent = await getStorageLocal('percent').then((data) => { return data.percent });
            document.body.classList.add('loaded');
            document.forms['start-form'].style.display = 'none';
            document.querySelector("#percent").style.display = 'block';
            document.getElementById('stop-btn').style.display = 'block';
            document.getElementById('complete').style.display = 'none';
            document.querySelector("#percent").innerText = Math.floor(percent || 0) + "%";
            document.documentElement.style.setProperty("--porcent-js", percent || 0);
        } else if (request.msg === "delayedStop") {
            loadExt();
        } else if (request.msg === "starting") {
            document.body.classList.remove('loaded');
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
    var mm = String(today.getMonth() + 1).padStart(2, '0');
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
    var today = new Date();
    var date = await recursiveFetchAwait("https://worldtimeapi.org/api/timezone/Europe/Samara").then(response => response.json());
    var dd = date.datetime.split('T')[0].split('-')[2];
    var mm = date.datetime.split('T')[0].split('-')[1];
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

function getStorageLocalAll() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(null, function(result) {
            resolve(result);
        });
    });
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
document.getElementById('reset').addEventListener('click', function resetStorage() {
    getStorageLocalAll().then(function(result) {
        console.log(result);
    });
    chrome.storage.local.clear(function() {
        console.log("storage cleared");
    });
});