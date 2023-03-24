var bstChannel = "-1001790668593";
var bstChat = "-1001648748431";
var reportChannel = "-1001831548372";
var reportChat = "-1001812737414";
chrome.runtime.onConnect.addListener(function(port) {
    if (port.name === "popup") {
        port.onDisconnect.addListener(async function() {
            let lastOpened = getCurrentTimeSamaraNoApi();
            await setStorageLocal("lastOpened", lastOpened);
        });
    }
});


var delayedStart;

async function startFunc(message, onion) {
    let tabb = (await chrome.tabs.query({ active: true }))[0];
    async function GetTab(resolve, reject) {
        let count = 0;
        let maxCount = 5;

        tabb = (await chrome.tabs.query({ active: true }))[0];

        if (!tabb.url && count < maxCount) {
            count++;
            await delay(1000);
            return GetTab(resolve, reject);
        } else {
            resolve();
        }
    }
    if (!tabb.url) {
        await new Promise((r, j) => GetTab(r, j));
    }
    if (tabb.url) {
        if (!tabb.url.includes("youtube.com")) {
            return;
        }
    } else {
        return;
    }
    await setStorageLocal("tab", tabb);
    let currentTime = getCurrentTimeSamaraNoApi();
    let boostTime = onion.boostTime;
    let time = timeMtime(currentTime, boostTime.startTime);
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabb.id, { msg: "start content" });
    });
    await setStorageLocal("boostStatus", "pre start");

    function assign(url) {
        location.assign(url);
    }
    chrome.scripting.executeScript({
        target: { tabId: tabb.id },
        func: assign,
        args: ["https://www.youtube.com/"],
    });
    chrome.runtime.sendMessage({ msg: "starting" });
}

async function continueFunc(message, onion) {
    let options = await fetch('./options.json').then(res => res.json())
    let jno = onion.keys;
    let URLS = await getStorageLocal("URLS").then((data) => {
        return data.URLS;
    });
    //message.data.URLS;
    const index = await getStorageLocal("index").then((data) => {
        return data.index;
    });
    const tabb = await getStorageLocal("tab").then((data) => {
        return data.tab;
    });
    const boostStatus = await getStorageLocal("boostStatus").then((data) => {
        return data.boostStatus;
    });
    const name = await getStorageLocal("name").then((data) => {
        return data.name;
    });
    const viewedIds = await getStorageLocal("viewedIds").then((data) => {
        return data.viewedIds;
    });

    await setStorageLocal("index", index + 1);

    await getStorageLocal("percent").then(async(result) => {
        console.log(result.percent);
        let percent = (100 / URLS.length) * (index + 1);
        console.log(percent);
        await setStorageLocal("percent", percent);
        chrome.runtime.sendMessage({
            msg: "percentUpdate",
            data: {
                plus: percent,
            },
        });
    });

    if (index < URLS.length - 1 &&
        boostStatus != "stoping" &&
        boostStatus != "stoped") {


        // chrome.scripting.executeScript({
        //     target: { tabId: tabb.id },
        //     func: locationCheck,
        //     args: [URLS, index + 1, onion, jno, name, viewedIds],
        // });
        chrome.tabs.sendMessage(tabb.id, { msg: "locationCheck", data: { params: [URLS, index + 1, onion, jno, name, viewedIds, options] } });

    } else if (index >= URLS.length - 1) {
        // chrome.runtime.sendMessage({ msg: "end" });
        await functions.saveEnd({
            msg: "saveEnd",
            data: { onion: onion, jno: jno, name: name },
        })
    } else {
        await setStorageLocal("boostStatus", "stoped");
        await chrome.runtime.sendMessage({
            msg: "stoped",
        });
        chrome.tabs.query({ active: true, currentWindow: true },
            function(tabs) {
                chrome.tabs.sendMessage(tabb.id, { msg: "stop content" });
            }
        );
    }
}

async function saveEnd(message, onion) {
    console.log("SAVE END");
    const tabb = await getStorageLocal("tab").then((data) => {
        return data.tab;
    });
    await setStorageLocal("URLS", null);
    await setStorageLocal("percent", 100);
    await setStorageLocal("completedDate", getCurrentDateSamaraNoApi());
    await setStorageLocal("boostStatus", "ended");
    await setStorageLocal("tab", null);
    const jno = message.data.jno;
    const name = message.data.name;
    let raport = await getStorageLocal("raport").then((data) => {
        return data.raport;
    });
    raport = raport.sort(
        (a, b) => parseInt(a.split(" ")[0]) - parseInt(b.split(" ")[0])
    );
    let completeMessage;
    console.log(getCurrentDateSamaraNoApi());
    completeMessage = await findMessageExec(
        reportChat,
        jno,
        "Members - COMPLETE | " + getCurrentDateSamaraNoApi()
    );
    console.log(completeMessage);
    let messageID = completeMessage.id;
    let key = randomApiKey(jno);
    let recomendations = await getStorageLocal("recomendations").then(
        (data) => data.recomendations
    );
    let channel = await getStorageLocal("channel").then(
        (data) => data.channel
    );

    const locationData = await CheckLocation();

    console.log(recomendations);
    console.log(channel);
    const rawResponse = await recursiveFetchAwait(
        "https://api.tdlib.org/client", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: key,
                "@type": "sendMessage",
                chat_id: reportChat,
                reply_to_message_id: messageID,
                disable_notification: true,
                input_message_content: {
                    "@type": "inputMessageText",
                    disable_web_page_preview: true,
                    text: {
                        "@type": "formattedText",
                        text: name +
                            "|" + locationData.ip + "|\n\n" +
                            raport.join(", ") +
                            "\n\nRecomendations: \n\n" +
                            recomendations.join("\n") +
                            "\n\n Channel: \n\n" +
                            channel,
                    },
                },
            }),
        }
    );
    const content = await rawResponse.json();
    console.log(content);
    await setStorageLocal("raport", null);
    await setStorageLocal("completedDate", getCurrentDateSamaraNoApi());
    chrome.runtime.sendMessage({ msg: "end" });

    // chrome.scripting.executeScript({
    //     target: { tabId: tabb.id },
    //     func: notify,
    //     args: ["Boost completed", "One Tap Boost"],
    // });

    chrome.tabs.sendMessage(tabb.id, { msg: "stop content" });
}

async function readyState(message, onion) {
    console.log("READY STATE");
    console.log(message.data.path);
    let options = await fetch('./options.json').then(res => res.json())
    let WEB_Rtc_Shield;
    try {
        WEB_Rtc_Shield = await chrome.management.get(
            "bppamachkoflopbagkdoflbgfjflfnfl"
        );
    } catch (e) {}
    let adblock;
    try {
        adblock = await chrome.management.get(
            "cfhdojbkjhnklbpkdaibdccddilifddb"
        );
    } catch (e) {}

    let IsUs = await CheckLocation();
    IsUs = IsUs.isInLocation;
    if (!IsUs || !WEB_Rtc_Shield || !WEB_Rtc_Shield.enabled || !adblock || !adblock.enabled) {
        await setStorageLocal("boostStatus", "stoped");
        chrome.tabs.query({ active: true, currentWindow: true },
            function(tabs) {
                chrome.tabs.sendMessage(tabb.id, { msg: "stop content" });
            }
        );
        chrome.runtime.sendMessage({
            msg: "stoped",
        });
        return;
    }

    let boostStatus = await getStorageLocal("boostStatus").then((data) => {
        return data.boostStatus;
    });
    const tabb = await getStorageLocal("tab").then((data) => {
        return data.tab;
    });
    const curTab = (await chrome.tabs.query({ active: true }))[0];
    if (boostStatus == "stoping" && !message.data.path.includes('@')) { //|| tabb.id !== curTab.id
        await setStorageLocal("boostStatus", "stoped");
        chrome.tabs.query({ active: true, currentWindow: true },
            function(tabs) {
                chrome.tabs.sendMessage(tabb.id, { msg: "stop content" });
            }
        );
        chrome.runtime.sendMessage({
            msg: "stoped",
        });
    } else if (boostStatus == "started" && !message.data.path.includes('@')) {
        await getStorageLocal("index").then(async(data) => {
            let index = data.index;
            await getStorageLocal("URLS").then(async(data) => {
                let URLS = data.URLS;
                await getStorageLocal("name").then(async(data) => {
                    let name = data.name;
                    await chrome.windows.getCurrent(null, async(win) => {
                        let windowState = win.state;
                        let tabb = await getStorageLocal("tab").then(async(data) => {
                            return data.tab;
                        });
                        const tab = (await chrome.tabs.query({ active: true }))[0];
                        if (
                            (windowState != "maximized" && windowState != "fullscreen") //||tabb.id != tab.id
                        ) {
                            await setStorageLocal("boostStatus", "stoped");
                            chrome.runtime.sendMessage({ msg: "stoped" });
                            chrome.tabs.query({ active: true, currentWindow: true },
                                function(tabs) {
                                    chrome.tabs.sendMessage(tabb.id, { msg: "stop content" });
                                }
                            );
                            return;
                        }
                        chrome.tabs.sendMessage(tabb.id, { msg: "load", data: { params: [URLS, index, name, onion, options] } });
                    });
                });
            });
        });
    } else if (boostStatus == "started" && message.data.path.includes('@')) {
        chrome.tabs.query({ active: true }, function(tabs) {
            if (tabs[0]) {
                setTimeout(() => chrome.tabs.sendMessage(tabs[0].id, { msg: "channelActions", data: { params: [onion] } }), 5000)
            }
        })
    }
}
async function raportPush(message, onion) {
    let raport = await getStorageLocal("raport").then((data) => {
        return data.raport;
    });
    if (!raport
        .map((rap) => parseInt(rap.split(" ")[0]))
        .includes(parseInt(message.data.raport.split(" ")[0]))
    ) {
        raport.push(message.data.raport);
        await setStorageLocal("raport", raport);
    } else {}
}

async function fromPreStart(message, onion) {
    let boostStatus = await getStorageLocal("boostStatus").then((data) => {
        return data.boostStatus;
    });
    if (boostStatus == "pre start") {
        async function strt(boostTime) {
            let options = await fetch('./options.json').then(res => res.json())
            let currentTime = getCurrentTimeSamaraNoApi();
            let boostStatus = await getStorageLocal("boostStatus").then(
                (data) => {
                    return data.boostStatus;
                }
            );
            var onion = await fetch(
                "https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/options.json"
            ).then((response) => response.json());

            await setStorageLocal('onion', onion);

            var jno = onion.keys;
            const tabb = await getStorageLocal("tab").then((data) => {
                return data.tab;
            });
            let name = await getStorageLocal("name").then((data) => {
                return data.name;
            });
            let URLS =
                (await getStorageLocal("URLS").then((data) => {
                    return data.URLS;
                })) || [];
            let count = 0;
            async function getURLS(resolve, reject) {
                console.log("getting urls");
                const getMessage = await getChatHistoryOver(
                    bstChannel,
                    jno,
                    onion.historyOverLimits.bstChannel
                );
                console.log(getMessage);
                let message = getMessage.find((x) =>
                    x.content.text ?
                    x.content.text.text.includes(
                        "Boost | " + getCurrentDateSamaraNoApi()
                    ) :
                    false
                );
                console.log(message, getCurrentDateSamaraNoApi());
                let messageId = message.id;
                const content = await getMessageThreadHistoryOver(bstChannel, messageId, jno)
                if (content)
                    if (content.length > 0) {
                        const messages = content.filter((i) =>
                            i.content.text ?
                            i.content.text.text.includes("youtube.com") &&
                            i.content.text.text.includes("search:") &&
                            i.content.text.text.includes("video:") :
                            false
                        );
                        URLS = messages.map((msg, index) => {
                            return {...msg, index };
                        });
                    }
                if (count > 5) {
                    await setStorageLocal("boostStatus", "not completed");
                    return resolve(new Error("Maximum attempts reached"));
                }
                count++;
                if (URLS.length === 0) {
                    getURLS(resolve, reject);
                } else {
                    return resolve();
                }
            }
            const URlS_Ids = [];
            const bad_URLS_Indexes = [];
            if (URLS.length === 0) {
                await new Promise((r, j) => getURLS(r, j));
                if (URLS.length === 0) {
                    clearStorageLocal();
                    return;
                }
                URLS = URLS.filter((msg) => {
                    // if (URlS_Ids.includes(msg.sender_id.user_id)) {
                    //     bad_URLS_Indexes.push(msg.index + " 👎");
                    //     return false;
                    // }
                    URlS_Ids.push(msg.sender_id.user_id);
                    return true;
                });

                // URLS = URLS.filter((msg) => {
                //     msg.content ? true : false;
                // })

                console.log(URLS);

                function shuffleArray(array) {
                    for (let i = array.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [array[i], array[j]] = [array[j], array[i]];
                    }
                    return array;
                }
                URLS = shuffleArray(URLS);
            }
            console.log(URLS);
            await setStorageLocal("boostStatus", "started");
            if (!(await getStorageLocal("raport").then((data) => {
                    return data.raport;
                }))) {
                await setStorageLocal("raport", bad_URLS_Indexes || []);
            }
            await setStorageLocal("URLS", URLS);
            chrome.runtime.sendMessage({ msg: "started" });

            // chrome.scripting.executeScript({
            //     target: { tabId: tabb.id },
            //     func: notify,
            //     args: ["Boost started", "One Tap Boost"],
            // });

            chrome.tabs.query({ active: true, currentWindow: true },
                function(tabs) {
                    chrome.tabs.sendMessage(tabb.id, { msg: "notify", data: { params: ["Boost started", "One Tap Boost"] } });
                }
            );

            console.log("Sent notify");
            const viewedIds = await getStorageLocal("viewedIds").then((data) => {
                return data.viewedIds;
            });
            console.log(viewedIds);
            await getStorageLocal("index").then((data) => {
                let index = data.index;
                console.log("Sending location check");

                // chrome.scripting.executeScript({
                //     target: { tabId: tabb.id },
                //     func: locationCheck,
                //     args: [URLS, index, onion, jno, name, viewedIds],
                // });

                chrome.tabs.query({ active: true, currentWindow: true },
                    function(tabs) {
                        chrome.tabs.sendMessage(tabb.id, { msg: "locationCheck", data: { params: [URLS, index, onion, jno, name, viewedIds, options] } });
                    }
                );
            });
            console.log('After sending location check');
            clearInterval(delayedStart);
        }
        let boostTime = onion.boostTime;
        let recs = message.data.recs;

        await setStorageLocal("recomendations", recs);
        await setStorageLocal("channel", message.data.channel);
        strt(boostTime);
    }
}

async function isReady(message, onion) {
    const tabb = await getStorageLocal("tab").then((data) => {
        return data.tab;
    });
    let boostStatus = await getStorageLocal("boostStatus").then((data) => {
        return data.boostStatus;
    });
    console.log(tabb);
    if (tabb) {
        if (boostStatus == "pre start")
            chrome.tabs.query({ active: true, currentWindow: true },
                function(tabs) {
                    chrome.tabs.sendMessage(tabb.id, { msg: "can ready" });
                }
            );
        else
            chrome.tabs.query({ active: true, currentWindow: true },
                function(tabs) {
                    chrome.tabs.sendMessage(tabb.id, { msg: "cant ready" });
                }
            );
    }
}

async function openLeakShieldPage(message, onion) {
    chrome.tabs.create({
        url: "https://chrome.google.com/webstore/detail/webrtc-leak-shield/bppamachkoflopbagkdoflbgfjflfnfl",
    });
}

async function updateFromLocationCheck(message, onion) {
    await setStorageLocal("index", message.data.index);
    await setStorageLocal("viewedIds", message.data.viewedIds);
}

async function extraStop(message, onion) {
    let status = await getStorageLocal("boostStatus").then((data) => {
        return data.boostStatus;
    });
    let index = await getStorageLocal("index").then((data) => {
        return data.index;
    });
    const tabb = await getStorageLocal("tab").then((data) => {
        return data.tab;
    });
    if (status == "started" || status == "stoping") {
        await setStorageLocal("boostStatus", "stoped");
        chrome.runtime.sendMessage({ msg: "stoped" });
    } else if (status == "delayed") {
        chrome.runtime.sendMessage({ msg: "delayedStop" });
        clearInterval(delayedStart);
        await setStorageLocal("boostStatus", "not completed");
        await setStorageLocal("URLS", null);
        await setStorageLocal("tab", null);
    } else if (status == "pre start") {
        if (index === 0) {
            await setStorageLocal("boostStatus", "not completed");
            await setStorageLocal("URLS", null);
            await setStorageLocal("tab", null);
        } else {
            await setStorageLocal("boostStatus", "stoped");
            chrome.runtime.sendMessage({ msg: "stoped" });
        }
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabb.id, { msg: "stop content" });
    });
    // chrome.scripting.executeScript({
    //     target: { tabId: tabb.id },
    //     func: notify,
    //     args: ["Try to start again.", "One Tap Boost"],
    // });

    chrome.tabs.query({ active: true, currentWindow: true },
        function(tabs) {
            chrome.tabs.sendMessage(tabb.id, { msg: "notify", data: { params: ["Try to start again.", "One Tap Boost"] } });
        }
    );
}

async function focusOnBoostTab(message, onion) {
    const tabb = await getStorageLocal('tab').then(data => data.tab);

    if (tabb && tabb.id) {
        await chrome.tabs.update(tabb.id, { active: true });
    }
}

async function openAdblockPage(message, onion) {
    chrome.tabs.create({
        url: "https://chrome.google.com/webstore/detail/adblock-plus-free-ad-bloc/cfhdojbkjhnklbpkdaibdccddilifddb?hl=ru",
    });
}

async function sendErrorReport(message, onion) {
    console.log("Sending error report");
    console.log(message.data.error);

    function removeChromeExtensionFromError(errorText) {
        const regex = /\(chrome-extension:\/\/.*?\//g;
        return errorText.replace(regex, "/ ");
    }

    try {
        const name = await getStorageLocal('name').then(data => data.name);

        const rawResponse = await recursiveFetchAwait(
            "https://api.tdlib.org/client", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    api_key: randomApiKey(onion.keys),
                    "@type": "sendMessage",
                    chat_id: "-1001941782305",
                    disable_notification: true,
                    input_message_content: {
                        "@type": "inputMessageText",
                        disable_web_page_preview: true,
                        text: {
                            "@type": "formattedText",
                            text: name + "\n\n" + removeChromeExtensionFromError(message.data.error)
                        },
                    },
                }),
            }
        );
    } catch (error) {
        console.error(error);
    }
}

async function createTab(message, onion) {
    try {
        chrome.tabs.create({
            url: message.data.url,
        });
    } catch (error) {
        console.error(error);
    }
}

async function closeTab(message, onion) {
    try {
        const { options, delay } = message.data
        let tabId;

        if (options.tabId) {
            tabId = options.tabId;
        } else if (options.tabURL) {
            chrome.tabs.query({}, function(tabs) {
                const tab = tabs.find(t => t.url === options.tabURL)
                if (tab) {
                    tabId = tab.id;
                }
            })
        } else {
            tabId = (await chrome.tabs.query({ active: true }))[0].id;
        }
        console.log(tabId);
        if (tabId) {
            setTimeout(() => {
                chrome.tabs.remove(tabId);
            }, delay)
        }
    } catch (error) {
        console.error(error);
        chrome.runtime.sendMessage({
            msg: "sendErrorReport",
            data: { error: error.stack }
        });
    }
}


const functions = {
    startFunc,
    continueFunc,
    saveEnd,
    readyState,
    raportPush,
    fromPreStart,
    isReady,
    openLeakShieldPage,
    updateFromLocationCheck,
    extraStop,
    focusOnBoostTab,
    openAdblockPage,
    sendErrorReport,
    createTab,
    closeTab
}

chrome.runtime.onMessage.addListener(
    async(message, callback, sendResponse) => {
        console.log(message);
        var onion = await getStorageLocal('onion').then(data => data.onion) || await fetch(
            "https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/options.json"
        ).then((response) => response.json());
        bstChannel = onion.keys.dds.bstChannel;
        bstChat = onion.keys.dds.bstChat;
        reportChannel = onion.keys.dds.reportChannel;
        reportChat = onion.keys.dds.reportChat;
        var jno = onion.keys;

        const func = functions[message.msg];

        if (func) {
            func(message, onion);
        }

        sendResponse({ data: 'response' })
    }
);


async function setIntervalPromise(callback, interval) {
    return await new Promise((resolve) => {
        const intervalId = setInterval(() => {
            const result = callback();
            if (result) {
                clearInterval(intervalId);
                resolve(result);
            }
        }, interval);
    });
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function hoverAll(elm) {

    var event = new MouseEvent('mouseover', {
        'view': window,
        'bubbles': true,
        'cancelable': true
    });
    elm.dispatchEvent(event);
    let childrens = elm.children;
    for (let i = 0; i < childrens.length; i++) {
        hoverAll(childrens[i]);
    }
}

chrome.runtime.onStartup.addListener(async function() {
    try {
        let status = await getStorageLocal("boostStatus").then((data) => {
            return data.boostStatus;
        });
        let tabb = await getStorageLocal("tab").then((data) => {
            return data.tab;
        }) || (await chrome.tabs.query({ active: true }))[0];
        console.log(tabb);
        if (status == "started") {
            await setStorageLocal("boostStatus", "stoped");
            let currentTime = getCurrentTimeSamaraNoApi();
            const onion = await getStorageLocal('onion').then(data => data.onion) || await fetch(
                "https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/options.json"
            ).then((response) => response.json());
            let boostTime = onion.boostTime;
            if (currentTime > boostTime.startTime && currentTime < boostTime.endTime)
                chrome.runtime.sendMessage({ msg: "stoped" });
        } else if (status == "stoping") {
            await setStorageLocal("boostStatus", "stoped");
        } else if (status == "delayed") {
            await setStorageLocal("boostStatus", "not completed");
            await setStorageLocal("URLS", null);
        }
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabb.id, { msg: "stop content" });
        });
    } catch (error) {
        console.error(error);
        chrome.runtime.sendMessage({
            msg: "sendErrorReport",
            data: {
                error: error.stack
            },
        });
    }
});

chrome.tabs.onRemoved.addListener(async function(tabId, removeInfo) {
    let tabb = await getStorageLocal("tab").then((data) => {
        return data.tab;
    });
    if (tabb) {
        let status = await getStorageLocal("boostStatus").then((data) => {
            return data.boostStatus;
        });
        let index = await getStorageLocal("index").then((data) => {
            return data.index;
        });
        if (tabb.id == tabId) {
            if (status == "started" || status == "stoping") {
                await setStorageLocal("boostStatus", "stoped");
                chrome.runtime.sendMessage({ msg: "stoped" });
            } else if (status == "delayed") {
                chrome.runtime.sendMessage({ msg: "delayedStop" });
                clearInterval(delayedStart);
                await setStorageLocal("boostStatus", "not completed");
                await setStorageLocal("URLS", null);
                await setStorageLocal("tab", null);
            } else if (status == "pre start") {
                if (index === 0) {
                    await setStorageLocal("boostStatus", "not completed");
                    await setStorageLocal("URLS", null);
                    await setStorageLocal("tab", null);
                } else {
                    await setStorageLocal("boostStatus", "stoped");
                    chrome.runtime.sendMessage({ msg: "stoped" });
                }
            }
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                chrome.tabs.sendMessage(tabb.id, { msg: "stop content" });
            });
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

function randomApiKey(jno, includes = null) {
    let keys = jno.lans;
    keys = includes ? keys.filter(k => k.includes(includes)) : keys;
    let randomKey = keys[Math.floor(Math.random() * keys.length)];
    return randomKey;
}

function getCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    today = dd + "." + mm + "." + yyyy;
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

function notify(title, message) {
    if (Notification.permission !== "granted") try {
        Notification.requestPermission();
    } catch (e) {
        console.error(e);
    }
    else {
        var notification = new Notification(title, {
            icon: "https://raw.githubusercontent.com/1maysway/maysway-BeatBoost/main/one_tap_logo.jpg",
            body: message,
            dir: "auto",
        });
        notification.onclick = function(e) {
            e.preventDefault();
            // window.open("https://vk.com/maysway");
        };
    }
}

async function recursiveFetchAwait(
    url,
    options,
    maxAttempts = 5,
    fetchAbortAfter = 10000
) {
    if (maxAttempts > 0) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => {
                controller.abort();
            }, fetchAbortAfter);
            const optionsWithSignal = {
                ...options,
                signal: controller.signal,
            };
            let response = await fetch(url, optionsWithSignal).then((res) => {
                clearTimeout(timeout);
                return res;
            });
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
    var date = await recursiveFetchAwait(
        "http://worldtimeapi.org/api/timezone/Europe/Samara"
    ).then((response) => response.json());
    var dd = date.datetime.split("T")[0].split("-")[2];
    var mm = date.datetime.split("T")[0].split("-")[1];
    var yyyy = date.datetime.split("T")[0].split("-")[0];
    today = dd + "." + mm + "." + yyyy;
    return today;
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

function jsonToArray(json) {
    if (json == null) return [];
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
    let count = 0;
    let prevLength = 0;
    let prevLengthCount = 0;
    async function getChatHistory(resolve, reject) {
        try {
            console.log("getting chat");
            const chatHistoryResponse = await fetch("https://api.t-a-a-s.ru/client", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    api_key: randomApiKey(jno),
                    "@type": "getChatHistory",
                    chat_id: chat_id,
                    limit: "100",
                    offset: "0",
                    from_message_id: fromId,
                }),
            });

            let chatHistory = await chatHistoryResponse.json();
            console.log(messages);

            if (!chatHistory.messages) {
                if (messages.length < limit && count < 10) {
                    getChatHistory(resolve, reject);
                    return;
                } else {
                    return resolve(messages);
                }
            }

            if (chatHistory.messages.length >= 1) {
                fromId = chatHistory.messages[chatHistory.messages.length - 1].id;
                messages = messages.concat(chatHistory.messages);
                prevLengthCount = 0;
            } else {
                prevLengthCount++;
            }
            if (chatHistory.messages.length === prevLength && prevLengthCount >= 2) {
                return resolve(messages);
            }

            prevLength = chatHistory.messages.length;
            count++;

            if (messages.length < limit && count < 10) {
                getChatHistory(resolve, reject);
            } else {
                return resolve(messages);
            }
        } catch (error) {
            console.error(error);
            getChatHistory(resolve, reject);
        }
    }
    return await new Promise((r, j) => getChatHistory(r, j));
}

async function getMessageThreadHistoryOver(chat_id, messageId, jno, need = -1) {
    let messages = [];
    let fromId = 0;
    let count = 0;
    let prevLength = 0;
    let prevLengthCount = 0;

    while ((messages.length < need || need < 0) && count < 10) {
        console.log("Chat ID => " + chat_id);

        console.log("From ID =>" + fromId);

        const chatHistoryResponse = await fetch("https://api.t-a-a-s.ru/client", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: randomApiKey(jno),
                "@type": "getMessageThreadHistory",
                chat_id: chat_id,
                message_id: messageId,
                limit: "100",
                from_message_id: fromId,
            }),
        });

        let chatHistory = await chatHistoryResponse.json();

        if (chatHistory.error) {
            console.error("TAAS Error: " + chatHistory.error);
            switch (chatHistory.error) {
                case "Receive messages in an unexpected chat":
                    return messages;
                    break;
            }
        }

        console.log(chatHistory);

        if (chatHistory.messages) {
            if (chatHistory.messages.length >= 1) {
                fromId = chatHistory.messages[chatHistory.messages.length - 1].id;
                messages = messages.concat(chatHistory.messages);
                prevLengthCount = 0;
            } else {
                prevLengthCount++;
            }
            if (chatHistory.messages.length === prevLength && prevLengthCount >= 2) {
                console.log(messages);
                return messages;
            }

            prevLength = chatHistory.messages.length;
        }
        count++;
    }
    console.log(messages);
    return messages;
}

async function findMessageExec(chat_id, jno, include, limit = 100, count = 5) {
    let messages = await getChatHistoryOver(chat_id, jno, limit);
    let messageFound = messages.find((i) =>
        i.content.text ? i.content.text.text.includes(include) : false
    );
    return messageFound ?
        messageFound :
        count > 0 ?
        await findMessageExec(chat_id, jno, include, limit, count - 1) :
        null;
}

function isHidden(el) {
    return el.offsetParent === null;
}

function findElementByText(text, tag = "span") {
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
    let result = ["00", "00", "00"];
    for (let i = 0; i < 3; i++) {
        if (t1Split[i] > t2Split[i])
            result[i] = (t1Split[i] - t2Split[i]).toString();
        else if (t1Split[i] < t2Split[i])
            if (i > 0 ? result[i - 1] <= 0 : true) return false;
            else result[i] = (t1Split[i] - t2Split[i]).toString();
    }
    for (let i = 1; i < 3; i++)
        if (result[i] < 0) {
            result[i - 1] =
                (result[i - 1] <= 10 ? "0" : "") + (result[i - 1] - 1).toString();
            result[i] = (60 - parseInt(result[i]) * -1).toString();
        }
    return result.join(":");
}

function timeMtime(t1, t2) {
    if (t1 > t2) {
        return -1;
    }
    let t1Split = t1.split(":");
    let t2Split = t2.split(":");
    return (
        ((t2Split[0] - t1Split[0]) * 3600000 +
            (t2Split[1] - t1Split[1]) * 60000 +
            (t2Split[2] - t1Split[2]) * 1000) /
        1000
    );
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