async function loadExt() {
    let options = await fetch('./options.json').then(res => res.json())
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
        let tabb = result.tab || {};
        document.forms["start-form"].name.value = name || "";
        let currentTime = getCurrentTimeSamaraNoApi();
        let currentDate = getCurrentDateSamaraNoApi();
        var onion = await fetch(
            "https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/options.json"
        ).then((response) => response.json());
        let boostTime = onion.boostTime;
        document.querySelector(".date").innerHTML = getCurrentDate();
        if (
            options.develop ? true : currentTime >= boostTime.startTime && currentTime <= boostTime.endTime
        ) {
            if (
                startedDate != currentDate &&
                boostStatus != "not completed" &&
                boostStatus != "undefined" &&
                boostStatus != undefined
            ) {
                boostStatus = "not completed";
                await setStorageLocal("boostStatus", "not completed");
            }
            document.forms["start-form"].style.display = "none";
            switch (boostStatus) {
                case "started":
                    {
                        document.getElementById("stop-btn").style.display = "block";
                        document.getElementById("complete").style.display = "none";
                        document.querySelector("#percent").innerText =
                        Math.floor(percent || 0) + "%";
                        document.documentElement.style.setProperty(
                            "--porcent-js",
                            percent || 0
                        );
                        break;
                    }
                case "ended":
                    {
                        document.getElementById("stop-btn").style.display = "none";
                        document.getElementById("complete").style.display = "block";
                        document.querySelector("#percent").innerText = "100%";
                        document.documentElement.style.setProperty("--porcent-js", 100);
                        break;
                    }
                case "stoped":
                    {
                        document.getElementById("stop-btn").innerHTML = "";
                        document.getElementById("stop-btn").innerText = "Continue";
                        document.getElementById("stop-btn").name = "continue";
                        document.getElementById("stop-btn").style.display = "block";
                        document.querySelector("#percent").innerText =
                        Math.floor(percent || 0) + "%";
                        document.documentElement.style.setProperty(
                            "--porcent-js",
                            percent || 0
                        );
                        break;
                    }
                case "stoping":
                    {
                        let loader =
                            '<div class="preloader preloader-btn"><svg class="preloader__image" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor"d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"></path></svg></div>';
                        document.getElementById("stop-btn").innerHTML = loader;
                        document.getElementById("stop-btn").name = "stoping";
                        document.getElementById("stop-btn").style.display = "block";
                        document.querySelector("#percent").innerText =
                        Math.floor(percent || 0) + "%";
                        document.documentElement.style.setProperty(
                            "--porcent-js",
                            percent || 0
                        );
                        document.body.classList.add("stoping");
                        break;
                    }
                case "pre start":
                    {
                        document.body.classList.remove("loaded");
                        break;
                    }
                default:
                    {
                        document.querySelector("#start-btn").value = "Start";
                        document.forms["start-form"].style.display = "block";
                        document.querySelector("#name-input").style.display = "block";
                        document.getElementById("stop-btn").style.display = "none";
                        document.getElementById("complete").style.display = "none";
                        document.querySelector("#percent").innerText = "0%";
                        document.documentElement.style.setProperty("--porcent-js", 0);
                        break;
                    }
            }
        } else {
            document.getElementById("stop-btn").style.display = "none";
            document.getElementById("complete").style.display = "block";
            document.querySelector("#percent").style.display = "none";
        }
        if (boostStatus != "pre start") {
            document.body.classList.add("loaded");
        }
    });
}

async function CheckLocation(loc = "US") {
    let options = await fetch('./options.json').then(res => res.json())
    let ipData;
    let country_code = "";
    let ip;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, 10000);

        ipData = await fetch("https://ipapi.co/json/", {
            signal: controller.signal,
        }).then((response) => {
            clearTimeout(timeout);
            return response.json();
        });
        country_code = ipData.country_code;
        ip = ipData.ip;

        if (!ip || !country_code) {
            throw new Error('Ip or Country code is empty')
        }
    } catch (e) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => {
                controller.abort();
            }, 10000);

            ipData = await fetch("http://ip-api.com/json/").then((response) => {
                clearTimeout(timeout);
                return response.json();
            });
            country_code = ipData.countryCode;
            ip = ipData.query;

            if (!ip || !country_code) {
                throw new Error('Ip or Country code is empty')
            }
        } catch (e) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => {
                    controller.abort();
                }, 10000);

                ipData = await fetch("http://ipwho.is/").then((response) => {
                    clearTimeout(timeout);
                    return response.json();
                });
                country_code = ipData.country_code;
                ip = ipData.ip;

                if (!ip || !country_code) {
                    throw new Error('Ip or Country code is empty')
                }
            } catch (e) {
                return await CheckLocation();
            }
        }
    }

    // country_code = ipData.countryCode || ipData.country_code;
    // ip = ipData.ip || ipData.query;
    return {
        isInLocation: options.develop ? true : country_code === loc,
        ip: ip
    }
}

async function preLoad() {
    document.body.classList.remove("loaded");
    const onion = await fetch(
        "https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/options.json"
    ).then((response) => response.json());
    let version = onion.version;
    let WEB_Rtc_Shield;
    let adblock;
    try {
        WEB_Rtc_Shield = await chrome.management.get(
            "bppamachkoflopbagkdoflbgfjflfnfl"
        );
    } catch (e) {}
    try {
        adblock = await chrome.management.get(
            "cfhdojbkjhnklbpkdaibdccddilifddb"
        );
    } catch (e) {}
    let IsUs = await CheckLocation();
    console.log(IsUs);
    IsUs = IsUs.isInLocation;
    console.log(chrome.runtime.getManifest().version, version.version);
    if (
        chrome.runtime.getManifest().version == version.version &&
        IsUs &&
        WEB_Rtc_Shield &&
        WEB_Rtc_Shield.enabled &&
        adblock &&
        adblock.enabled
    ) {
        console.log('load ext');
        loadExt();
    } else if (!IsUs) {
        document.body.innerHTML = `<div class="container"><h1 style="text-align:center;">You must be in US to use this extension.</h1></div>`;
    } else if (chrome.runtime.getManifest().version !== version.version) {
        document.body.innerHTML = `<div class="container"><h1 style="text-align:center;">Outdated version of the extension.</h1></div>`;
    } else if (!WEB_Rtc_Shield) {
        document.body.innerHTML = `<div class="container"><h1 style="text-align:center;">You need to install and turn on the <i>"WebRTC Leak Shield"</i> extension.
        <br></br>
        You can get it from this link:
        <br></br>
        <a id="open_leakShield_page" href="" onClick=openLeakShieldPage()>Install</a>
        </h1></div>`;
        document
            .getElementById("open_leakShield_page")
            .addEventListener("click", openLeakShieldPage);
    } else if (!WEB_Rtc_Shield.enabled) {
        document.body.innerHTML = `<div class="container"><h1 style="text-align:center;">You need to turn on the <i>"WebRTC Leak Shield"</i> extension.</div>`;
    } else if (!adblock) {
        document.body.innerHTML = `<div class="container"><h1 style="text-align:center;">You need to install and turn on the <i>"Adblock Plus"</i> extension.
        <br></br>
        You can get it from this link:
        <br></br>
        <a id="open_adblock_page" href="" onClick=openAdblockPage()>Install</a>
        </h1></div>`;
        document
            .getElementById("open_adblock_page")
            .addEventListener("click", openAdblockPage);
    } else if (!adblock.enabled) {
        document.body.innerHTML = `<div class="container"><h1 style="text-align:center;">You need to turn on the <i>"Adblock Plus"</i> extension.</div>`;
    }

    let lastOpened = getCurrentTimeSamaraNoApi();
    await setStorageLocal("lastOpened", lastOpened);
    chrome.runtime.connect({ name: "popup" });
    document.body.classList.add("loaded");
}
preLoad();

function openLeakShieldPage(e) {
    e.preventDefault();
    chrome.runtime.sendMessage({ msg: "openLeakShieldPage" });
}

function openAdblockPage(e) {
    e.preventDefault();
    chrome.runtime.sendMessage({ msg: "openAdblockPage" });
}

var startForm = document.forms["start-form"];
document.getElementById("stop-btn").addEventListener("click", async(event) => {
    if (
        (await getStorageLocal("boostStatus").then((data) => {
            return data.boostStatus;
        })) != "stoping"
    ) {
        if (event.target.name == "stop") {
            await setStorageLocal("boostStatus", "stoping");
            let loader =
                '<div class="preloader preloader-btn"><svg class="preloader__image" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor"d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"></path></svg></div>';
            event.target.innerHTML = loader;
            document.body.classList.add("stoping");
            event.target.name = "stoping";
        } else if (event.target.name == "continue") {
            await setStorageLocal("boostStatus", "started");
            event.target.name = "stop";
            document.getElementById("stop-btn").innerHTML = "";
            event.target.innerText = "Stop";
            await getStorageLocal("name").then((result) => {
                let name = result.name;
                chrome.runtime.sendMessage({ msg: "startFunc", data: { name: name } });
            });
        }
    }
});

startForm.addEventListener("submit", async(event) => {
    event.preventDefault();
    let status = await getStorageLocal("boostStatus").then((data) => {
        return data.boostStatus;
    });
    if (status == "delayed") {
        await setStorageLocal("boostStatus", "not completed");
        chrome.runtime.sendMessage({ msg: "delayedStop" });
        loadExt();
        return;
    }
    let percent;
    await getStorageLocal("percent", (data) => {
        percent = data.percent;
    });
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let currentTime = getCurrentTimeSamaraNoApi();
    var onion = await fetch(
        "https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/options.json"
    ).then((response) => response.json());
    let boostTime = onion.boostTime;
    const formData = new FormData(startForm);
    let delayed = false;
    await setStorageLocal("index", 0);
    await setStorageLocal("percent", 0);
    await setStorageLocal("startedDate", getCurrentDateSamaraNoApi());
    await setStorageLocal("raport", null);
    await setStorageLocal("name", formData.get("name"));
    await setStorageLocal("percent", 0);
    await setStorageLocal("URLS", null);
    await setStorageLocal("viewedIds", []);
    console.log("START");
    chrome.runtime.sendMessage({
        msg: "startFunc",
        data: { name: formData.get("name"), delayed: delayed },
    });
    console.log("AFTER START");
});
chrome.runtime.onMessage.addListener(async function(
    request,
    sender,
    sendResponse
) {
    console.log(request);
    if (request.msg === "percentUpdate") {
        document.querySelector("#percent").innerText =
            Math.floor(parseFloat(request.data.plus)) + "%";
        document.documentElement.style.setProperty(
            "--porcent-js",
            request.data.plus
        );
    } else if (request.msg === "end") {
        if (document.body.classList.contains("stoping")) {
            document.body.classList.remove("stoping");
            document.getElementById("stop-btn").innerHTML = "";
            document.getElementById("stop-btn").innerText = "Stop";
            document.getElementById("stop-btn").name = "stop";
        }
        document.forms["start-form"].style.display = "none";
        document.getElementById("stop-btn").style.display = "none";
        document.getElementById("complete").style.display = "block";
        document.querySelector("#percent").innerText = "100%";
        document.documentElement.style.setProperty("--porcent-js", 100);
    } else if (request.msg === "stoped") {
        document.getElementById("stop-btn").innerHTML = "";
        document.getElementById("stop-btn").innerText = "Continue";
        document.getElementById("stop-btn").name = "continue";
        document.body.classList.remove("stoping");
    } else if (request.msg === "started") {
        let percent = await getStorageLocal("percent").then((data) => {
            return data.percent;
        });
        document.body.classList.add("loaded");
        document.forms["start-form"].style.display = "none";
        document.querySelector("#percent").style.display = "block";
        document.getElementById("stop-btn").style.display = "block";
        document.getElementById("complete").style.display = "none";
        document.querySelector("#percent").innerText =
            Math.floor(percent || 0) + "%";
        document.documentElement.style.setProperty("--porcent-js", percent || 0);
    } else if (request.msg === "delayedStop") {
        loadExt();
    } else if (request.msg === "starting") {
        document.body.classList.remove("loaded");
    }
});

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
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
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    today = dd + "." + mm + "." + yyyy;
    return today;
}

async function getCurrentTimeSamara() {
    let date = await recursiveFetchAwait(
        "http://worldtimeapi.org/api/timezone/Europe/Samara"
    ).then((response) => response.json());
    let time = date.datetime.split("T")[1].split(".")[0];
    return time || "00:00:00";
}

async function getCurrentDateSamara() {
    var today = new Date();
    var date = await recursiveFetchAwait(
        "https://worldtimeapi.org/api/timezone/Europe/Samara"
    ).then((response) => response.json());
    var dd = date.datetime.split("T")[0].split("-")[2];
    var mm = date.datetime.split("T")[0].split("-")[1];
    var yyyy = date.datetime.split("T")[0].split("-")[0];
    today = dd + "." + mm + "." + yyyy;
    return today;
}

function getStorageLocal(key) {
    return promiseToValue(
        new Promise((resolve, reject) => {
            chrome.storage.local.get(key, function(result) {
                resolve(result);
            });
        })
    );
}

function setStorageLocal(key, value) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({
                [key]: value,
            },
            function() {
                resolve();
            }
        );
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
    if (Notification.permission !== "granted") Notification.requestPermission();
    else {
        var notification = new Notification(title, {
            icon: "https://github.com/1maysway/maysway-BeatBoost/blob/main/logo.jpg",
            body: message,
            dir: "auto",
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
    let utc = date.getTime() + date.getTimezoneOffset() * 60000;
    let samara = new Date(utc + 3600000 * 3);
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
    let utc = date.getTime() + date.getTimezoneOffset() * 60000;
    let samara = new Date(utc + 3600000 * 3);
    let day = samara.getDate();
    let month = samara.getMonth() + 1;
    let year = samara.getFullYear();
    if (day < 10) day = "0" + day;
    if (month < 10) month = "0" + month;
    return day + "." + month + "." + year;
}

document
    .getElementById("reset")
    .addEventListener("click", function resetStorage() {
        getStorageLocalAll().then(function(result) {});
        chrome.storage.local.clear(function() {});
    });