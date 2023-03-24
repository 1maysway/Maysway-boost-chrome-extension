document.addEventListener("readystatechange", async(state) => {
    let readyState = document.readyState;

    if (
        (location.pathname == "/results" || location.pathname == "/watch" || location.pathname.includes('@')) &&
        (readyState == "complete" || readyState == "interactive")
    ) {
        chrome.runtime.sendMessage({
            msg: "readyState",
            data: { path: location.pathname },
        });
    } else if (location.pathname == "/" && readyState == "complete") {
        await chrome.runtime.sendMessage({ msg: "isReady" });
    }
});

const functions = {
    load,
    locationCheck,
    channelActions
}

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    console.log(request, request.msg);
    if (!['channelActions'].some(f => f === request.msg)) {
        chrome.runtime.sendMessage({
            msg: "focusOnBoostTab"
        });
    }
    if (request.msg == "start content") {
        localStorage.setItem("canReady", true);
    } else if (request.msg == "stop content") {
        localStorage.setItem("canReady", false);
    } else if (request.msg == "can ready") {
        setTimeout(async() => {
            try {
                console.log("START");
                let avatarBtn = await getNode(() => document.querySelector(
                    "#container.style-scope.ytd-masthead #avatar-btn"
                ), 10, () => 3000 * (Math.random() * 0.05 + 0.95))

                console.log(avatarBtn);

                if (!avatarBtn) {
                    chrome.runtime.sendMessage({
                        msg: "extraStop",
                    });
                    alert("Не удалось получить ссылку на канал. \n\nЕсли ты залогинился в ютубе и при этом все равно получил эту ошибку, напиши мне в телеграмме с видео или скринами всей консоли сайта и расширения. \n\n@notMayWaveS");
                    return;
                }

                avatarBtn.click();
                // avatarBtn.dispatchEvent(new Event("click", { bubbles: true }));

                function getData(time = 1000, maxAttempts = 10, attempt = 0) {
                    setTimeout(async() => {
                        console.log("Trying to get data");
                        let recomendations = document.querySelectorAll(
                            ".style-scope.ytd-rich-grid-renderer #contents #thumbnail"
                        );

                        let recs = [];
                        recomendations.forEach((rec, i) => {
                            recs.push(rec.href);
                        });

                        recs = recs.filter((href) => !href.includes("short"));
                        recs = recs.slice(0, 10);

                        console.log(recs);

                        let channelBtn;

                        let channelBtnGettingCount = 0;

                        while (!channelBtn && channelBtnGettingCount < 5) {
                            try {
                                channelBtn = document.querySelectorAll(
                                    ".style-scope yt-multi-page-menu-section-renderer #endpoint"
                                )[0]
                            } catch (e) {
                                console.log(e);
                            }
                            if (!channelBtn) {
                                await delay(1000)
                            }
                            channelBtnGettingCount++;
                        }

                        console.log(channelBtn);

                        if (!channelBtn && attempt < maxAttempts) {
                            getData(2000, maxAttempts, attempt + 1);
                            return;
                        } else if (attempt >= maxAttempts && !channelBtn) {
                            chrome.runtime.sendMessage({
                                msg: "extraStop",
                            });
                            alert("Не удалось получить ссылку на канал. \n\nЕсли ты залогинился в ютубе и при этом все равно получил эту ошибку, напиши мне в телеграмме с видео или скринами всей консоли сайта и расширения. \n\n@notMayWaveS");
                            return;
                        }

                        let channel = channelBtn.href || null;

                        console.log(channel);

                        chrome.runtime.sendMessage({
                            msg: "fromPreStart",
                            data: {
                                recs: recs,
                                channel: channel,
                            },
                        });
                    }, time);
                }
                getData();
            } catch (error) {
                console.error(error);
                chrome.runtime.sendMessage({
                    msg: "sendErrorReport",
                    data: { error: error.stack }
                });
                chrome.runtime.sendMessage({
                    msg: "extraStop",
                });
                alert("Не удалось получить ссылку на канал. \n\nЕсли ты залогинился в ютубе и при этом все равно получил эту ошибку, напиши мне в телеграмме с видео или скринами всей консоли сайта и расширения. \n\n@notMayWaveS");
            }
        }, 2000);
    } else {
        try {
            const func = functions[request.msg];
            if (func) {
                request.data ? request.data.params ? func(...request.data.params) : func() : func()
            }
        } catch (error) {
            console.error(error);
            chrome.runtime.sendMessage({
                msg: "sendErrorReport",
                data: { error: error.stack }
            });
        }
    }
});

async function channelActions(onion) {
    try {
        const toolbar = await getNode(() => document.querySelector('tp-yt-app-toolbar'), 10, () => Math.floor(Math.random() * 150) + 300 * 0.95)
        const tabs = [...await getNode(() => toolbar.querySelectorAll('tp-yt-paper-tab'), 10, () => Math.floor(Math.random() * 150) + 300 * 0.95)].slice(0, 7);

        console.log(tabs);

        const switchCount = Math.floor(Math.random() * 3 + 1);
        const switch_tabs = [];
        while (switch_tabs.length < switchCount) {
            console.log('Push tab');
            const index = Math.floor(Math.random() * tabs.length);
            console.log(index);
            const tab = tabs[index];
            if (tab && !switch_tabs.some(t => t === tab)) {
                console.log('ok push');
                switch_tabs.push(tab);
            }
        }

        console.log(switch_tabs);

        for (const tab_i in switch_tabs) {
            console.log('Switch tab');
            const tab = switch_tabs[tab_i]
            console.log(tab);
            try {
                tab.click();
            } catch (error) {
                console.error(error);
                chrome.runtime.sendMessage({
                    msg: "sendErrorReport",
                    data: { error: error.stack }
                });
            }
            await delay(Math.floor(Math.random() * 350) + 1500 * 0.95)
        }

        if (Math.random() < onion.actions.clickVideoFromChannel.chance) {
            console.log('click video');

            tabs[1].click();
            await delay(Math.floor(Math.random() * 350) + 1500 * 0.95)

            const videos = await getNode(() => document.querySelectorAll('ytd-two-column-browse-results-renderer #dismissible'), 10, () => Math.floor(Math.random() * 150) + 300 * 0.95);

            const video = videos[Math.floor(Math.random() * (videos.length - 1))];

            const video_a = await getNode(() => video.querySelector('a[href*="/watch"]'), 10, () => Math.floor(Math.random() * 150) + 300 * 0.95)
            video_a.click()

            async function view() {
                const video = await getNode(() => document.querySelector("video"), 10, () => Math.floor(Math.random() * 150) + 550 * 0.95);
            }
            await view();
        } else if (Math.random() < onion.actions.clickLinkFromChannel.chance) {
            console.log('click links');

            tabs[4].click();
            await delay(Math.floor(Math.random() * 350) + 1500 * 0.95)

            const links = [...await getNode(() => document.querySelectorAll('#links-container a'), 10, () => Math.floor(Math.random() * 150) + 300 * 0.95)]

            console.log(links);

            if (links && links.length > 0) {
                try {
                    const link = links[Math.floor(Math.random() * links.length)];
                    console.log(link);

                    link.click();
                } catch (error) {
                    console.error(error);
                    chrome.runtime.sendMessage({
                        msg: "sendErrorReport",
                        data: { error: error.stack }
                    });
                }
            }
            await delay(Math.floor(Math.random() * 350) + 2500 * 0.95)
        }
    } catch (error) {
        console.error(error);
        chrome.runtime.sendMessage({
            msg: "sendErrorReport",
            data: { error: error.stack }
        });
    }
    await delay(Math.floor(Math.random() * 150) + 3550 * 0.95)

    const video = await getNode(() => document.querySelector("video"), 10, () => Math.floor(Math.random() * 150) + 550 * 0.95);
    if (video) {
        chrome.runtime.sendMessage({
            msg: "closeTab",
            data: {
                options: {},
                delay: Math.min(video.duration * 1000, 180000)
            }
        });
    }
    chrome.runtime.sendMessage({
        msg: "focusOnBoostTab"
    });
}

async function locationCheck(
    URLS,
    index,
    onion,
    jno,
    name,
    viewedIds,
    options,
    url = null
) {
    function getParamFromUrl(url, param) {
        const queryStringIndex = url.indexOf('?');
        if (queryStringIndex === -1) {
            return null; // URL не содержит параметров
        }
        const queryString = url.substring(queryStringIndex + 1);
        const params = queryString.split('&');
        for (let i = 0; i < params.length; i++) {
            const pair = params[i].split('=');
            if (pair[0] === param) {
                return pair[1];
            }
        }
        return null; // параметр не найден
    }

    function getParamFromLink(link, param) {
        console.log(link, param);
        let url;
        try {
            url = new URL(link);
        } catch (e) {
            console.error(e);
        }
        if (url) {
            const searchParams = url.searchParams;
            return searchParams.get(param);
        } else {
            console.log("Trying to get params by second method");
            return getParamFromUrl(link, param)
        }
    }

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function setIntervalPromise(callback, interval, maxCount = -1) {
        return await new Promise((resolve) => {
            let count = 0;
            const intervalId = setInterval(() => {
                let result = null;
                console.log(count);
                try {
                    result = callback();
                } catch (error) {
                    console.error(error);
                }
                if (result || (maxCount >= 0 && count >= maxCount)) {
                    clearInterval(intervalId);
                    resolve(result);
                }
                count++;
            }, interval);
        });
    }

    async function simulateTyping(input, text) {
        console.log(text);
        if (!text) {
            return;
        }
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // вспомогательная функция для задержки
        const inputValue = input.value; // текущее значение инпута
        const textLength = text.length;
        if (!textLength) {
            return;
        }
        const inputLength = inputValue.length;

        const keyMap = {
            1: ["`", "2", "q"],
            2: ["1", "q", "w", "3"],
            3: ["2", "w", "e", "4"],
            4: ["3", "e", "r", "5"],
            5: ["4", "r", "t", "6"],
            6: ["5", "t", "y", "7"],
            7: ["6", "y", "u", "8"],
            8: ["7", "u", "i", "9"],
            9: ["8", "i", "o", "0"],
            0: ["9", "o", "p", "-", "="],
            "-": ["0", "p", "["],
            "=": ["-", "[", "]"],
            q: ["1", "2", "w", "a"],
            w: ["q", "a", "s", "e", "3", "2"],
            e: ["w", "s", "d", "r", "4", "3"],
            r: ["e", "d", "f", "t", "5", "4"],
            t: ["r", "f", "g", "y", "6", "5"],
            y: ["t", "g", "h", "u", "7", "6"],
            u: ["y", "h", "j", "i", "8", "7"],
            i: ["u", "j", "k", "o", "9", "8"],
            o: ["i", "k", "l", "p", "0", "9"],
            p: ["o", "l", "[", "-", "=", "0"],
            "[": ["p", "]", "\\", "-", "="],
            "]": ["[", "\\", "-", "="],
            a: ["q", "w", "s", "z"],
            s: ["a", "w", "e", "d", "x", "z"],
            d: ["s", "e", "r", "f", "c", "x"],
            f: ["d", "r", "t", "g", "v", "c"],
            g: ["f", "t", "y", "h", "b", "v"],
            h: ["g", "y", "u", "j", "n", "b"],
            j: ["h", "u", "i", "k", "m", "n"],
            k: ["j", "i", "o", "l", ",", "m"],
            l: ["k", "o", "p", ";", ".", ",", "m"],
            ";": ["l", "p", "[", "'", ".", ",", "-", "=", "]"],
            "'": [";", "[", "]", ".", ",", "-", "=", "\\"],
            z: ["a", "s", "x", " "],
            x: ["z", "s", "d", "c", " "],
            c: ["x", "d", "f", "v", " "],
            v: ["c", " ", "f", "g", "b"],
            b: ["v", "g", "h", "n", " "],
            n: ["b", "h", "j", "m", " "],
            m: ["n", "j", "k", ",", " "],
            ",": ["m", "k", "l", ".", "-", " "],
            ".": [",", "l", ";", "'", "/", "-", "="],
            "/": [".", ";", "'", "-", "="],
            " ": ["v", "b", "n"],
        };

        for (let i = inputLength; i < textLength; i++) {
            console.log("Char");

            const typo = Math.random() < 0.05;
            let newChars = [];
            if (typo) {
                const random = Math.random();
                console.log("length");

                let numberOfTypo =
                    random < 0.2 && textLength - i >= 3 ?
                    3 :
                    random < 0.5 && textLength - i >= 2 ?
                    2 :
                    1;

                for (let j = 0; j < numberOfTypo; j++) {
                    // newChar += String.fromCharCode(Math.floor(Math.random() * 93) + 33);
                    console.log("Generate new typo for '" + text.charAt(i + j) + "'");

                    const nearChars = keyMap[text.charAt(i + j).toLowerCase()];
                    if (nearChars) {
                        console.log("length");

                        newChars.push(nearChars[Math.floor(Math.random() * nearChars.length)]);
                        console.log("New typo == " + newChars.reverse()[0]);
                    } else {
                        newChars.push(' ');
                    }
                }
            } else {
                newChars.push(text.charAt(i));
            }

            console.log("length");

            for (let j = 0; j < newChars.length; j++) {
                console.log("Typing char " + j);

                input.value += newChars[j];

                input.dispatchEvent(new Event("input", { bubbles: true }));

                await delay(Math.floor(Math.random() * 150) + 100 * 0.95);
            }

            if (typo && Math.random() <= 1) {
                console.log("length");

                for (let j = 0; j < newChars.length; j++) {
                    console.log("Deliting typo " + j);

                    input.value = input.value.slice(0, -1);

                    input.dispatchEvent(new Event("input", { bubbles: true }));

                    console.log("length");

                    if (j < newChars.length - 1) {
                        await delay(Math.floor(Math.random() * 50) + 100 * 0.95);
                    }
                }

                await delay(Math.floor(Math.random() * 200) + 200 * 0.95);

                input.value += text.charAt(i);

                input.dispatchEvent(new Event("input", { bubbles: true }));
            }
        }
        console.log("END !!!");
    }

    async function simulateEraser(input) {
        let status = true;
        while (status) {
            if (input.value.length === 0) {
                status = false;
            }
            input.value = input.value.slice(0, -1);
            input.dispatchEvent(new Event("input", { bubbles: true }));

            await delay(Math.floor(Math.random() * 50) + 50 * 0.95);
        }
    }



    let message = URLS[index];

    if (!message || !message.content) {
        chrome.runtime.sendMessage({
            msg: "raportPush",
            data: {
                raport: URLS[index].index + " ✖",
            },
        });
        chrome.runtime.sendMessage({
            msg: "continueFunc"
        });
        return;
    }

    let searchLink = message.content.text.text.split("search:")[1].split('\n')[0].split(' ').find(str => str.includes('http'))
    let videoLink = message.content.text.text.split("video:")[1].split('\n')[0].split(' ').find(str => str.includes('http'))

    if (!searchLink || searchLink === '' || !videoLink || videoLink === '') {
        chrome.runtime.sendMessage({
            msg: "raportPush",
            data: {
                raport: URLS[index].index + " ✖",
            },
        });
        chrome.runtime.sendMessage({
            msg: "continueFunc"
        });
        return;
    }

    try {
        const time = Math.floor(Math.random() * 150) + 400 * 0.95;
        console.log(time);
        // await delay(time);
        console.log("Location Check");
        console.table(message);
        console.log(message.content.text.text);
        console.log(searchLink);
        // if (document.location.href != searchLink) {
        //     location.assign(searchLink);
        // } else location.reload();

        const input = await getNode(() => document.querySelector('input#search'), 10, Math.floor(Math.random() * 150) + 300 * 0.95)
        const query = getParamFromLink(searchLink, 'search_query');
        console.log(query);
        const searchBox = await getNode(() => document.querySelector('ytd-searchbox#search'), 10, Math.floor(Math.random() * 150) + 300 * 0.95);
        const searchButton = await getNode(() => document.querySelector('#search-icon-legacy'), 10, Math.floor(Math.random() * 150) + 300 * 0.95);
        const searchForm = await getNode(() => document.querySelector('#search-form'), 10, Math.floor(Math.random() * 150) + 300 * 0.95);

        searchBox.dispatchEvent(new Event('focus', { bubbles: true }));
        searchBox.dispatchEvent(new Event('click', { bubbles: true }));

        searchButton.dispatchEvent(new Event('focus', { bubbles: true }));

        input.dispatchEvent(new Event('focus', { bubbles: true }));
        input.dispatchEvent(new MouseEvent('mouseover', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        }));
        input.dispatchEvent(new Event('click', { bubbles: true }));

        searchBox.setAttribute('has-focus', '');
        await simulateEraser(input);

        await delay(Math.floor(Math.random() * 150) + 100 * 0.95);

        await simulateTyping(input, query);

        await delay(Math.floor(Math.random() * 150) + 100 * 0.95);

        const mouseenterEvent = new MouseEvent('mouseenter');
        searchButton.dispatchEvent(mouseenterEvent);

        input.dispatchEvent(new Event('mouseover', { bubbles: true }))
        searchButton.click();

        await delay(Math.floor(Math.random() * 150) + 400 * 0.95);

        const nodes = await getNode(() => document.querySelectorAll('ytd-section-list-renderer'), 10, () => Math.floor(Math.random() * 150) + 400 * 0.95);
        console.log(nodes);
        const node = nodes[nodes.length - 1];
        console.log(node);
        const contentsSection = await getNode(() => node.querySelector('#contents.ytd-section-list-renderer'), 10, () => Math.floor(Math.random() * 150) + 300 * 0.95)
        const content = await getNode(() => contentsSection.querySelector('ytd-item-section-renderer'), 10, () => Math.floor(Math.random() * 150) + 300 * 0.95)

        const canShowMore = await setIntervalPromise(() => {
            console.log(content.getAttribute('can-show-more'));

            return content.getAttribute('can-show-more') == null;
        }, 500, 20)

        console.log(canShowMore);

        if (!canShowMore) {
            chrome.runtime.sendMessage({
                msg: "raportPush",
                data: {
                    raport: URLS[index].index + " 🚑",
                },
            });
            location.assign(videoLink);
            console.log("COULD NOT FIND VIDEO");
            return;
        }

        console.log("TRIGGER LOAD");
        load(URLS, index, name, onion, options);

    } catch (error) {
        console.error(error);
        chrome.runtime.sendMessage({
            msg: "sendErrorReport",
            data: { error: error.stack }
        });
        chrome.runtime.sendMessage({
            msg: "raportPush",
            data: {
                raport: URLS[index].index + " 🚑",
            },
        });
        location.assign(videoLink);
        console.log("COULD NOT FIND VIDEO");
        return;
    }
}

async function load(URLS, index, name, onion, options) {
    console.log("LOAD LOAD LOAD");
    console.log(options);

    function findElementByText(text, tag = "span") {
        let elements = document.querySelectorAll(tag);
        console.log(elements);
        console.log(text);
        for (let i = 0; i < elements.length; i++) {
            let elm = elements[i].href;
            try {
                elm = elm.split("/")[3];
            } catch (e) {}
            try {
                elm = elm.split("v=")[1];
            } catch (e) {}
            try {
                elm = elm.split("&")[0];
            } catch (e) {}
            if (text.includes(elm) && elements[i].href !== "") {
                return elements[i];
            }
        }
        return null;
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

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function goAndWriteComment(text) {
        try {
            const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

            const commentBlock = document.querySelector(
                "ytd-comments-header-renderer.style-scope.ytd-item-section-renderer"
            );

            if (!commentBlock) {
                return false;
            }

            smoothScrollTo(commentBlock, 1);

            await delay(Math.floor(Math.random() * 150) + 300 * 0.95);

            const elmContainer = document.querySelector("#placeholder-area");

            elmContainer.dispatchEvent(new Event("click", { bubbles: true }));

            await delay(Math.floor(Math.random() * 150) + 300 * 0.95);

            const elm = document.querySelector("#contenteditable-root");

            await simulateTypingInnerText(elm, text);

            const submitCommentButton = document.querySelector(
                ".style-scope.ytd-commentbox#submit-button"
            );

            submitCommentButton.dispatchEvent(new Event("click", { bubbles: true }));

            await delay(Math.floor(Math.random() * 150) + 350 * 0.95);

            makeScroll(-1000);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async function randomSeek() {
        try {
            const videoPlayer = await getNode(() => document.querySelector("video"), 10, () => Math.floor(Math.random() * 150) + 350 * 0.95)
            const playerProgress = await getNode(() => document.querySelector(".ytp-progress-bar"), 10, () => Math.floor(Math.random() * 150) + 350 * 0.95)

            if (!videoPlayer || !playerProgress) {
                return false;
            }

            const currentTime = videoPlayer.currentTime;
            const rect = playerProgress.getBoundingClientRect();

            const direction = Math.random() < 0.5 ? 1 : -1;
            const maxTime = videoPlayer.duration;
            const minSeek = currentTime + 5 * direction;
            const maxSeek = currentTime + 15 * direction;

            console.log(currentTime, minSeek, maxSeek);

            // генерируем рандомное число в диапазоне от minSeek до maxSeek
            // const randomSeekTime = Math.floor(Math.random() * (maxSeek - minSeek + 1) + minSeek);
            const randomSeekTime = Math.random() * (maxSeek - minSeek) + minSeek;
            console.log(randomSeekTime);

            // ограничиваем рандомное число границами видео
            const finalSeekTime =
                randomSeekTime > maxTime ?
                0 :
                randomSeekTime < 0 ?
                0 :
                randomSeekTime;

            if (finalSeekTime === 0) {
                return false;
            }

            const clientX = rect.x + rect.width * (finalSeekTime / (maxTime / 100) / 100);
            const clientY = rect.y + rect.height / 2;

            console.log(clientX);

            // имитируем нажатие мыши и перемещение ползунка
            playerProgress.dispatchEvent(
                new MouseEvent("mousedown", {
                    bubbles: true,
                    cancelable: true,
                    clientY,
                    clientX, //playerProgress.offsetWidth - (finalSeekTime / maxTime * playerProgress.offsetWidth)
                })
            );
            playerProgress.dispatchEvent(
                new MouseEvent("mouseup", {
                    bubbles: true,
                    cancelable: true,
                    clientY,
                    clientX, //playerProgress.offsetWidth - (finalSeekTime / maxTime * playerProgress.offsetWidth)
                })
            );
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    function smoothScrollTo(element, speed = 1) {
        console.log(element);
        if (element) {
            const elementRect = element.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const middleOfElement = absoluteElementTop - window.innerHeight / 2;
            const distanceToScroll = Math.abs(window.pageYOffset - middleOfElement);
            const speedFactor = 10; // Задайте скорость прокрутки
            const duration = distanceToScroll / (speed * speedFactor);

            window.scrollTo({
                top: middleOfElement,
                behavior: "smooth",
                duration: duration,
            });
            return true;
        }
        return false;
    }

    function toggleSubtitles() {
        try {
            const captionsButton = document.querySelector(".ytp-subtitles-button");
            if (captionsButton) {
                captionsButton.dispatchEvent(new Event("click", { bubbles: true }));
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async function simulateVolumeSliderHoverAndChange(volumeLevel) {
        try {

            const slider = document.querySelector(".ytp-volume-slider");
            const hover_panel = document.querySelector(".ytp-chrome-controls");
            const volume_panel = document.querySelector('.ytp-volume-panel');

            if (!slider || !hover_panel) {
                return false;
            }

            const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

            document.querySelector('.ytp-chrome-bottom').classList.add('ytp-volume-slider-active');

            const volume_panel_event = new MouseEvent("mouseover", {
                view: window,
                bubbles: true,
                cancelable: true,
            });

            volume_panel.dispatchEvent(volume_panel_event);

            document.querySelector('.ytp-mute-button').dispatchEvent(new MouseEvent("mouseover", {
                view: window,
                bubbles: true,
                cancelable: true,
            }))

            document.querySelector('.ytp-chrome-bottom').dispatchEvent(new MouseEvent("mouseover", {
                view: window,
                bubbles: true,
                cancelable: true,
            }))

            await delay(Math.floor(Math.random() * 50) + 250 * 0.95);

            const hover_panel_event = new MouseEvent("mouseover", {
                view: window,
                bubbles: true,
                cancelable: true,
            });
            hover_panel.dispatchEvent(hover_panel_event);

            await delay(Math.floor(Math.random() * 50) + 250 * 0.95);

            // Имитируем наведение на слайдер
            const event1 = new MouseEvent("mouseover", {
                view: window,
                bubbles: true,
                cancelable: true,
            });
            slider.dispatchEvent(event1);

            await delay(Math.floor(Math.random() * 150) + 300 * 0.95);

            // Имитируем клик на слайдере для изменения громкости
            const rect = slider.getBoundingClientRect();
            const clientX = rect.x + rect.width * volumeLevel;
            const clientY = rect.y + rect.height / 2;
            console.log(rect.x, rect.width, volumeLevel);

            const event2 = new MouseEvent("mousedown", {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: clientX,
                clientY: clientY,
            });
            slider.dispatchEvent(event2);
            const event3 = new MouseEvent("mouseup", {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: clientX,
                clientY: clientY,
            });
            slider.dispatchEvent(event3);
            return true;

        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async function simulateTypingInnerText(element, text) {
        console.log(text);
        if (!text) {
            return;
        }
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // вспомогательная функция для задержки
        const elementValue = element.innerText; // текущее значение инпута
        const textLength = text.length && text.length;
        if (!textLength) {
            return;
        }
        const elementLength = elementValue.length;

        const keyMap = {
            1: ["`", "2", "q"],
            2: ["1", "q", "w", "3"],
            3: ["2", "w", "e", "4"],
            4: ["3", "e", "r", "5"],
            5: ["4", "r", "t", "6"],
            6: ["5", "t", "y", "7"],
            7: ["6", "y", "u", "8"],
            8: ["7", "u", "i", "9"],
            9: ["8", "i", "o", "0"],
            0: ["9", "o", "p", "-", "="],
            "-": ["0", "p", "["],
            "=": ["-", "[", "]"],
            q: ["1", "2", "w", "a"],
            w: ["q", "a", "s", "e", "3", "2"],
            e: ["w", "s", "d", "r", "4", "3"],
            r: ["e", "d", "f", "t", "5", "4"],
            t: ["r", "f", "g", "y", "6", "5"],
            y: ["t", "g", "h", "u", "7", "6"],
            u: ["y", "h", "j", "i", "8", "7"],
            i: ["u", "j", "k", "o", "9", "8"],
            o: ["i", "k", "l", "p", "0", "9"],
            p: ["o", "l", "[", "-", "=", "0"],
            "[": ["p", "]", "\\", "-", "="],
            "]": ["[", "\\", "-", "="],
            a: ["q", "w", "s", "z"],
            s: ["a", "w", "e", "d", "x", "z"],
            d: ["s", "e", "r", "f", "c", "x"],
            f: ["d", "r", "t", "g", "v", "c"],
            g: ["f", "t", "y", "h", "b", "v"],
            h: ["g", "y", "u", "j", "n", "b"],
            j: ["h", "u", "i", "k", "m", "n"],
            k: ["j", "i", "o", "l", ",", "m"],
            l: ["k", "o", "p", ";", ".", ",", "m"],
            ";": ["l", "p", "[", "'", ".", ",", "-", "=", "]"],
            "'": [";", "[", "]", ".", ",", "-", "=", "\\"],
            z: ["a", "s", "x", " "],
            x: ["z", "s", "d", "c", " "],
            c: ["x", "d", "f", "v", " "],
            v: ["c", " ", "f", "g", "b"],
            b: ["v", "g", "h", "n", " "],
            n: ["b", "h", "j", "m", " "],
            m: ["n", "j", "k", ",", " "],
            ",": ["m", "k", "l", ".", "-", " "],
            ".": [",", "l", ";", "'", "/", "-", "="],
            "/": [".", ";", "'", "-", "="],
            " ": ["v", "b", "n"],
        };

        for (let i = elementLength; i < textLength; i++) {
            console.log("Char");

            const typo = Math.random() < 0.05;
            let newChars = [];
            if (typo) {
                const random = Math.random();
                console.log("length");

                let numberOfTypo =
                    random < 0.2 && textLength - i >= 3 ?
                    3 :
                    random < 0.5 && textLength - i >= 2 ?
                    2 :
                    1;

                for (let j = 0; j < numberOfTypo; j++) {
                    // newChar += String.fromCharCode(Math.floor(Math.random() * 93) + 33);
                    console.log("Generate new typo for '" + text.charAt(i + j) + "'");

                    const nearChars = keyMap[text.charAt(i + j).toLowerCase()];

                    console.log("length");

                    newChars.push(nearChars[Math.floor(Math.random() * nearChars.length)]);
                    console.log("New typo == " + newChars.reverse()[0]);
                }
            } else {
                newChars.push(text.charAt(i));
            }

            console.log("length");

            for (let j = 0; j < newChars.length; j++) {
                console.log("Typing char " + j);

                element.innerText += newChars[j];

                element.dispatchEvent(new InputEvent("input", { bubbles: true }));

                await delay(Math.floor(Math.random() * 150) + 100 * 0.95);
            }

            if (typo && Math.random() <= 1) {
                console.log("length");

                for (let j = 0; j < newChars.length; j++) {
                    console.log("Deliting typo " + j);

                    element.innerText = element.innerText.slice(0, -1);

                    element.dispatchEvent(new InputEvent("input", { bubbles: true }));

                    console.log("length");

                    if (j < newChars.length - 1) {
                        await delay(Math.floor(Math.random() * 50) + 100 * 0.95);
                    }
                }

                await delay(Math.floor(Math.random() * 200) + 200 * 0.95);

                element.innerText += text.charAt(i);

                element.dispatchEvent(new Event("input", { bubbles: true }));
            }
        }
        console.log("END !!!");
    }

    async function simulateTyping(input, text) {
        console.log(text);
        if (!text) {
            return;
        }
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // вспомогательная функция для задержки
        const inputValue = input.value; // текущее значение инпута
        const textLength = text.length;
        if (!textLength) {
            return;
        }
        const inputLength = inputValue.length;

        const keyMap = {
            1: ["`", "2", "q"],
            2: ["1", "q", "w", "3"],
            3: ["2", "w", "e", "4"],
            4: ["3", "e", "r", "5"],
            5: ["4", "r", "t", "6"],
            6: ["5", "t", "y", "7"],
            7: ["6", "y", "u", "8"],
            8: ["7", "u", "i", "9"],
            9: ["8", "i", "o", "0"],
            0: ["9", "o", "p", "-", "="],
            "-": ["0", "p", "["],
            "=": ["-", "[", "]"],
            q: ["1", "2", "w", "a"],
            w: ["q", "a", "s", "e", "3", "2"],
            e: ["w", "s", "d", "r", "4", "3"],
            r: ["e", "d", "f", "t", "5", "4"],
            t: ["r", "f", "g", "y", "6", "5"],
            y: ["t", "g", "h", "u", "7", "6"],
            u: ["y", "h", "j", "i", "8", "7"],
            i: ["u", "j", "k", "o", "9", "8"],
            o: ["i", "k", "l", "p", "0", "9"],
            p: ["o", "l", "[", "-", "=", "0"],
            "[": ["p", "]", "\\", "-", "="],
            "]": ["[", "\\", "-", "="],
            a: ["q", "w", "s", "z"],
            s: ["a", "w", "e", "d", "x", "z"],
            d: ["s", "e", "r", "f", "c", "x"],
            f: ["d", "r", "t", "g", "v", "c"],
            g: ["f", "t", "y", "h", "b", "v"],
            h: ["g", "y", "u", "j", "n", "b"],
            j: ["h", "u", "i", "k", "m", "n"],
            k: ["j", "i", "o", "l", ",", "m"],
            l: ["k", "o", "p", ";", ".", ",", "m"],
            ";": ["l", "p", "[", "'", ".", ",", "-", "=", "]"],
            "'": [";", "[", "]", ".", ",", "-", "=", "\\"],
            z: ["a", "s", "x", " "],
            x: ["z", "s", "d", "c", " "],
            c: ["x", "d", "f", "v", " "],
            v: ["c", " ", "f", "g", "b"],
            b: ["v", "g", "h", "n", " "],
            n: ["b", "h", "j", "m", " "],
            m: ["n", "j", "k", ",", " "],
            ",": ["m", "k", "l", ".", "-", " "],
            ".": [",", "l", ";", "'", "/", "-", "="],
            "/": [".", ";", "'", "-", "="],
            " ": ["v", "b", "n"],
        };

        for (let i = inputLength; i < textLength; i++) {
            console.log("Char");

            const typo = Math.random() < 0.05;
            let newChars = [];
            if (typo) {
                const random = Math.random();
                console.log("length");

                let numberOfTypo =
                    random < 0.2 && textLength - i >= 3 ?
                    3 :
                    random < 0.5 && textLength - i >= 2 ?
                    2 :
                    1;

                for (let j = 0; j < numberOfTypo; j++) {
                    // newChar += String.fromCharCode(Math.floor(Math.random() * 93) + 33);
                    console.log("Generate new typo for '" + text.charAt(i + j) + "'");

                    const nearChars = keyMap[text.charAt(i + j).toLowerCase()];

                    console.log("length");

                    newChars.push(nearChars[Math.floor(Math.random() * nearChars.length)]);
                    console.log("New typo == " + newChars.reverse()[0]);
                }
            } else {
                newChars.push(text.charAt(i));
            }

            console.log("length");

            for (let j = 0; j < newChars.length; j++) {
                console.log("Typing char " + j);

                input.value += newChars[j];

                input.dispatchEvent(new Event("input", { bubbles: true }));

                await delay(Math.floor(Math.random() * 150) + 100 * 0.95);
            }

            if (typo && Math.random() <= 1) {
                console.log("length");

                for (let j = 0; j < newChars.length; j++) {
                    console.log("Deliting typo " + j);

                    input.value = input.value.slice(0, -1);

                    input.dispatchEvent(new Event("input", { bubbles: true }));

                    console.log("length");

                    if (j < newChars.length - 1) {
                        await delay(Math.floor(Math.random() * 50) + 100 * 0.95);
                    }
                }

                await delay(Math.floor(Math.random() * 200) + 200 * 0.95);

                input.value += text.charAt(i);

                input.dispatchEvent(new Event("input", { bubbles: true }));
            }
        }
        console.log("END !!!");
    }

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

    function makeScroll(pixels) {
        window.scrollBy({
            top: pixels,
            left: 0,
            behavior: 'smooth'
        });
    }

    function getParamFromUrl(url, param) {
        const queryStringIndex = url.indexOf('?');
        if (queryStringIndex === -1) {
            return null; // URL не содержит параметров
        }
        const queryString = url.substring(queryStringIndex + 1);
        const params = queryString.split('&');
        for (let i = 0; i < params.length; i++) {
            const pair = params[i].split('=');
            if (pair[0] === param) {
                return pair[1];
            }
        }
        return null; // параметр не найден
    }


    function getParamFromLink(link, param) {
        let url;
        try {
            url = new URL(link);
        } catch (e) {
            console.error(e);
        }
        if (url) {
            const searchParams = url.searchParams;
            return searchParams.get(param);
        } else {
            return getParamFromUrl(link, param)
        }
    }


    //////////////////////////////////

    var jno = onion.keys;
    if (document.location.pathname == "/results") {
        await search(URLS, index, onion, name);
    } else if (document.location.pathname == "/watch") {
        console.log("LOCATION -- WATCH");
        chrome.runtime.sendMessage({
            msg: "raportPush",
            data: {
                raport: URLS[index].index + " ✅",
            },
        });
        view(URLS, index, onion, name);
    }
    async function search(URLS, index, onion, name) {
        const jno = onion.keys;
        let isFound = false;
        let objects = [];
        let url = URLS[index].content.text.text.split("video:")[1].split('\n')[0].split(' ')[0];
        let time = 3000;
        let vidBtn;
        let searchTypeChance = Math.floor(Math.random() * 100);
        let objectsCount = 0;

        if (!url || url === '') {
            chrome.runtime.sendMessage({
                msg: "raportPush",
                data: {
                    raport: URLS[index].index + " ✖",
                },
            });
            chrome.runtime.sendMessage({
                msg: "continueFunc"
            });
            return;
        }

        await delay(Math.floor(Math.random() * 150) + 500 * 0.95);

        console.log(URLS);
        console.log(index);
        console.log(onion);
        console.log(url);

        async function addFilters() {
            try {
                console.log("Add filters")
                let filterMenu = await getNode(() => document.querySelector('#filter-menu'), 10, () => Math.floor(Math.random() * 150) + 500 * 0.95);

                console.log(filterMenu);

                if (!filterMenu) {
                    return;
                }

                let filtersButton = await getNode(() => filterMenu.querySelector('button'), 10, () => Math.floor(Math.random() * 150) + 500 * 0.95);

                if (!filtersButton) {
                    return;
                }

                console.log(filtersButton);

                let count = 0;

                while (true) {
                    if (count < 10) {
                        try {
                            console.log("Trying to open filters");
                            if (filtersButton) {
                                filtersButton.dispatchEvent(new Event("click", { bubbles: true }));

                                await delay(Math.floor(Math.random() * 150) + 500 * 0.95);

                                filtersButton = document.querySelector('#filter-menu').querySelector('button');

                                console.log(filtersButton);
                                console.log(filtersButton.getAttribute('aria-pressed'));

                                if (filtersButton.getAttribute('aria-pressed') === "true") {
                                    console.log('pressed');
                                    break;
                                } else {
                                    console.log('not pressed');
                                    await delay(Math.floor(Math.random() * 150) + 200 * 0.95);
                                }
                            } else {
                                await delay(Math.floor(Math.random() * 150) + 200 * 0.95);
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    } else {
                        break;
                    }
                    count++;
                }

                await delay(Math.floor(Math.random() * 150) + 200 * 0.95);
                console.log("After delay 1367");

                const preFilters = URLS[index].content.text.text.split('filters:')[1].split(' ')[0].slice(1, -1).split(',');

                console.log(preFilters);
                if (!preFilters) {
                    return;
                }

                function findFilter(filtersArray, letter) {
                    const filter = filtersArray.find(f => f.toLowerCase().includes(letter));
                    return filter ? parseInt(filter.substring(1)) : null;
                }

                const filters = {
                    A: findFilter(preFilters, 'a'),
                    B: findFilter(preFilters, 'b'),
                    C: findFilter(preFilters, 'c'),
                    D: preFilters.filter(f => f.toLowerCase().includes('d')).map(f => parseInt(f.substring(1))) || null,
                    E: findFilter(preFilters, 'e')
                }

                console.log(filters);
                let filtersNodes = await getNode(() => document.querySelectorAll('ytd-search-filter-group-renderer'), 10, () => Math.floor(Math.random() * 150) + 400 * 0.95)

                console.log(filtersNodes);
                if (!filters || !filtersNodes) {
                    return;
                }


                for (const key in filters) {
                    const filter = filters[key];
                    console.log(filter)

                    if (!filter) {
                        continue;
                    }

                    let filterColumn = 0;

                    switch (key) {
                        case 'A':
                            filterColumn = 0;
                            break;
                        case 'B':
                            filterColumn = 1;
                            break;
                        case 'C':
                            filterColumn = 2;
                            break;
                        case 'D':
                            filterColumn = 3;
                            break;
                        case 'E':
                            filterColumn = 4;
                            break;
                    }

                    if (Array.isArray(filter)) {
                        console.log("filter is array");
                        for (let i = 0; i < filter.length; i++) {
                            const filterValue = filter[i];
                            console.log(filterValue);
                            if (filtersNodes[filterColumn]) {
                                const prenode = filtersNodes[filterColumn].querySelectorAll('ytd-search-filter-renderer')[filterValue - 1]
                                console.log(prenode);
                                if (prenode) {
                                    const node = prenode.querySelector('a#endpoint');
                                    console.log(node);
                                    if (node && node.getAttribute('aria-selected') !== "true") {
                                        // node.dispatchEvent(new Event("click", { bubbles: true }));
                                        node.click();
                                        console.log("Node is OK")
                                        let count = 0;
                                        await setIntervalPromise(() => {
                                            console.log('checking aria-selected => ' + node.ariaSelected);
                                            count++;
                                            return node.ariaSelected === "true" || count >= 10;
                                        }, 1000)
                                    }
                                }
                            }
                        }
                    } else {
                        console.log("filter is not array");
                        if (filtersNodes[filterColumn]) {
                            const prenode = filtersNodes[filterColumn].querySelectorAll('ytd-search-filter-renderer')[filter - 1]
                            console.log(prenode);
                            if (prenode) {
                                const node = prenode.querySelector('a#endpoint');
                                console.log(node);
                                if (node && node.getAttribute('aria-selected') !== "true") {
                                    // node.dispatchEvent(new Event("click", { bubbles: true }));
                                    node.click();
                                    console.log("Node is OK")
                                    let count = 0;
                                    await setIntervalPromise(() => {
                                        console.log('checking aria-selected => ' + node.ariaSelected)
                                        count++;
                                        return node.ariaSelected === "true" || count >= 10;
                                    }, 1000)
                                }
                            }
                        }
                    }
                }
                await delay(Math.floor(Math.random() * 150) + 350 * 0.95);
                console.log("After delay 1450");
            } catch (error) {
                console.error(error);
                chrome.runtime.sendMessage({
                    msg: "sendErrorReport",
                    data: { error: error.stack }
                });
            }
        }

        async function srch(objectsCount = 0) {

            const videoId = url.includes('youtu.be') ? url.split('/').reverse()[0] : getParamFromLink(url, 'v');

            console.log(videoId);

            if (!videoId) {
                chrome.runtime.sendMessage({
                    msg: "raportPush",
                    data: {
                        raport: URLS[index].index + " 🚑",
                    },
                });
                location.assign(url);
                console.log("COULD NOT FIND VIDEO");
                return;
            }

            let videosContainer = await getNode(() => document.querySelector('ytd-two-column-search-results-renderer'), 10, () => Math.floor(Math.random() * 150) + 500 * 0.95)

            if (!videosContainer) {
                chrome.runtime.sendMessage({
                    msg: "raportPush",
                    data: {
                        raport: URLS[index].index + " 🚑",
                    },
                });
                location.assign(url);
                console.log("COULD NOT FIND VIDEO");
                return;
            }

            const videoElement = await getNode(() => videosContainer.querySelector(`#dismissible:has(a[href*="/watch"][href*="${videoId}"])`), 3, () => Math.floor(Math.random() * 150) + 300 * 0.95)

            vidBtn = videoElement ? videoElement.querySelector('a[href*="/watch"]') : null;

            // vidBtn = findElementByText(url, "a#video-title");
            if (vidBtn) {
                isFound = true;
                chrome.runtime.sendMessage({
                    msg: "raportPush",
                    data: {
                        raport: URLS[index].index + " ✅",
                    },
                });
                // vidBtn.dispatchEvent(new Event("click", { bubbles: true }));
                vidBtn.click();
                view(URLS, index, onion, name);
            } else {
                if (objectsCount >= 5) {
                    chrome.runtime.sendMessage({
                        msg: "raportPush",
                        data: {
                            raport: URLS[index].index + " 🚑",
                        },
                    });
                    location.assign(url);
                    console.log("COULD NOT FIND VIDEO");
                } else {
                    let scroll = setInterval(function() {
                        window.scrollBy(0, 200);
                    }, 100);
                    window.focus();
                    // document.querySelectorAll("a")[0].scrollLeft += 20;
                    setTimeout(async function() {
                        clearInterval(scroll);
                        await srch(objectsCount + 1);
                    }, 5000);
                }
            }
        }

        if (URLS[index].content.text.text.includes('filters:')) {
            await addFilters();
        }

        let count = 0;

        async function trySrch() {
            count++;
            try {
                await srch();
            } catch (error) {
                console.error(error);
                console.log(error.stack)
                if (count < 6) {
                    await delay(Math.floor(Math.random() * 150) + 500 * 0.95);
                    trySrch();
                } else {
                    chrome.runtime.sendMessage({
                        msg: "sendErrorReport",
                        data: { error: error.stack }
                    });
                    chrome.runtime.sendMessage({
                        msg: "raportPush",
                        data: {
                            raport: URLS[index].index + " 🚑",
                        },
                    });
                    location.assign(url);
                    console.log("COULD NOT FIND VIDEO");
                }
            }
        }
        trySrch()
    }

    async function view(URLS, index, onion, name) {
        try {
            // const options = {
            //     develop: true
            // }
            let time = 0;
            const jno = onion.keys;

            let video = await getNode(() => document.querySelector("video"), 10, () => Math.floor(Math.random() * 150) + 550 * 0.95)

            console.log(video);

            if (!video) {
                chrome.runtime.sendMessage({
                    msg: "continueFunc"
                });
                return;
            }

            let videoDuration = video.duration;
            let videoDurationCount = 0;

            while (!videoDuration && videoDurationCount < 10) {
                try {
                    console.log("Trying to get duration");
                    videoDuration = video.duration;
                } catch (error) {
                    console.error(error);
                }
                if (!videoDuration) {
                    await delay(Math.floor(Math.random() * 150) + 650 * 0.95);
                }
                videoDurationCount++;
            }
            console.log(videoDuration);

            if (!videoDuration || videoDuration === NaN) {
                chrome.runtime.sendMessage({
                    msg: "continueFunc"
                });
                return;
            }

            setTimeout(() => {
                let video = document.querySelectorAll("video")[0];
                if (video && video.paused) {
                    video.muted = "muted";
                    video.play();
                }
            }, 2000);

            const isAd =
                document.querySelector(".ytp-ad-player-overlay-instream-info") !== null;

            if (isAd) {
                video.playbackRate = 16.0;

                let newDuration = videoDuration;
                await setIntervalPromise(() => {
                    video = document.querySelector("video");
                    newDuration = video.duration;
                    return newDuration !== videoDuration;
                }, 500);

                video.playbackRate = 1.0;
                videoDuration = newDuration;
            }

            let spent_time = 0;
            const spentTimeUpdateInterval = setInterval(() => {
                spent_time++;
            }, 1000)

            const watchUpTo = videoDuration * (Math.random() * 0.4 + 0.55);

            if (!watchUpTo || watchUpTo === NaN) {
                chrome.runtime.sendMessage({
                    msg: "continueFunc"
                });
                return;
            }

            console.log(watchUpTo);

            const random = Math.random();
            const actionsJson = onion.actions;

            console.log(actionsJson);

            let actions = {
                clickLike: {
                    chance: Math.random() < actionsJson.clickLike.chance,
                    time: Math.random() * watchUpTo,
                    finished: false,
                    doingRN: false
                },
                clickSubtitles: {
                    chance: Math.random() < actionsJson.clickSubtitles.chance,
                    time: Math.random() * watchUpTo,
                    finished: false,
                    doingRN: false
                },
                changeVolume: {
                    chance: Math.random() < actionsJson.changeVolume.chance,
                    time: Math.random() * watchUpTo,
                    finished: false,
                    doingRN: false
                },
                rewindVideo: {
                    chance: Math.random() < actionsJson.rewindVideo.chance,
                    time: Math.random() * watchUpTo,
                    finished: false,
                    doingRN: false
                },
                comment: {
                    chance: Math.random() < actionsJson.comment.chance,
                    time: Math.random() * watchUpTo,
                    finished: false,
                    doingRN: false
                },
                clickDescriptionLink: {
                    chance: Math.random() < actionsJson.clickDescriptionLink.chance,
                    time: Math.random() * watchUpTo,
                    finished: false,
                    doingRN: false
                },
                pauseVideo: {
                    chance: Math.random() < actionsJson.pauseVideo.chance,
                    time: Math.random() * watchUpTo,
                    finished: false,
                    doingRN: false
                },
                clickChannel: {
                    chance: Math.random() < 1, //ctionsJson.pauseVideo.chance,
                    time: Math.random() * (watchUpTo / 2),
                    finished: false,
                    doingRN: false
                }
            }

            console.table(actions)

            // console.log('clickLike => ', actions.clickLike);
            // console.log('clickSubtitles => ', actions.clickSubtitles);
            // console.log('changeVolume => ', actions.changeVolume);
            // console.log('rewindVideo => ', actions.rewindVideo);
            // console.log('comment => ', actions.comment);
            // console.log('clickDescriptionLink => ', actions.clickDescriptionLink);
            // console.log('pauseVideo => ', actions.pauseVideo);
            console.log('Watch up to => ', watchUpTo);

            function canIDo(actions, currentActionKey, time) {
                const currAction = actions[currentActionKey];

                //console.log('CAN I DO "' + currentActionKey + '"? At ' + currAction.time)
                for (const key in actions) {

                    //console.log(currAction !== null, currAction.chance, !actions[key].doingRN, !(time < currAction.time), !currAction.finished);
                    if (!currAction.chance || actions[key].doingRN === true || !currAction || time < currAction.time || currAction.finished) {
                        return false;
                    }
                }
                return true;
            }

            function isSomethingDoingRN(actions) {
                for (const key in actions) {
                    if (actions[key].doingRN === true) {
                        return true;
                    }
                }
                return false;
            }

            const autoPlayButton = document.querySelector('.ytp-right-controls > .ytp-button');
            let toggleButton = autoPlayButton.querySelector('.ytp-autonav-toggle-button');

            async function doActions() {
                try {
                    const currentTime = video.currentTime;

                    try {
                        let video = document.querySelectorAll("video")[0];
                        if (video && video.paused && !actions.pauseVideo.doingRN) {
                            video.muted = "muted";
                            video.play();
                        }
                    } catch (error) {
                        console.error(error);
                    }

                    if (document.querySelector('.ytp-volume-slider-handle').style.left === "0px") {
                        try {
                            document.querySelector('.ytp-mute-button').click()
                        } catch (error) {
                            console.error(error);
                        }
                    }

                    if (toggleButton.getAttribute('aria-checked') === 'true') {
                        autoPlayButton.dispatchEvent(new Event("click", { bubbles: true }));
                    }
                    console.log(actions);

                    console.log(currentTime, watchUpTo);
                    if (((!options.develop ? spent_time >= watchUpTo && currentTime >= watchUpTo : currentTime >= watchUpTo) && !isSomethingDoingRN(actions)) || spent_time > 180) {
                        clearInterval(spentTimeUpdateInterval);

                        chrome.runtime.sendMessage({
                            msg: "continueFunc"
                        });
                        return;
                    } else if (canIDo(actions, 'clickChannel', currentTime)) {
                        actions.clickChannel.doingRN = true;
                        try {
                            const channelNameButton = await getNode(() => document.querySelector('ytd-watch-metadata ytd-channel-name a'), 10, () => Math.floor(Math.random() * 150) + 200 * 0.95);

                            chrome.runtime.sendMessage({
                                msg: "createTab",
                                data: { url: channelNameButton.href }
                            });
                            await delay(Math.floor(Math.random() * 150) + 15000 * 0.95)
                        } catch (error) {
                            console.error(error);
                            chrome.runtime.sendMessage({
                                msg: "sendErrorReport",
                                data: { error: error.stack }
                            });
                        }
                        actions.clickChannel.finished = true;
                        actions.clickChannel.doingRN = false;
                    } else if (canIDo(actions, 'rewindVideo', currentTime)) {
                        actions.rewindVideo.doingRN = true;

                        console.log('rewindVideo');
                        console.log(currentTime);

                        const seek = await randomSeek();
                        console.log("SEEK => ", seek);

                        if (seek) {
                            actions.rewindVideo.finished = true;
                        }

                        actions.rewindVideo.doingRN = false;
                    } else if (canIDo(actions, 'clickLike', currentTime)) {
                        actions.clickLike.doingRN = true;

                        try {
                            console.log("like");
                            console.log(currentTime);

                            let metadata = document.querySelector('ytd-watch-metadata');
                            let segmentLikeBtn = metadata.querySelector('#segmented-like-button');

                            let likeBtn = segmentLikeBtn.querySelector('button');
                            if (likeBtn && likeBtn.getAttribute('aria-pressed') === 'false') {
                                likeBtn.click();
                            }
                        } catch (error) {
                            console.error(error);
                            chrome.runtime.sendMessage({
                                msg: "sendErrorReport",
                                data: { error: error.stack }
                            });
                        }

                        actions.clickLike.finished = true;
                        actions.clickLike.doingRN = false;
                    } else if (canIDo(actions, 'clickSubtitles', currentTime)) {
                        actions.clickSubtitles.doingRN = true;

                        console.log('subtitles');
                        console.log(currentTime);

                        const toggle = toggleSubtitles();
                        if (toggle) {
                            actions.clickSubtitles.finished = true;
                        }

                        actions.clickSubtitles.doingRN = false;
                    } else if (canIDo(actions, 'changeVolume', currentTime)) {
                        actions.changeVolume.doingRN = true;
                        console.log('change volume');
                        console.log(currentTime);

                        console.log(actionsJson);
                        const randomVolume = Math.random() * (1 - actionsJson.changeVolume.from) + actionsJson.changeVolume.from;
                        console.log(randomVolume);
                        const simualte = await simulateVolumeSliderHoverAndChange(randomVolume);

                        if (simualte) {
                            actions.changeVolume.finished = true;
                        }

                        actions.changeVolume.doingRN = false;
                    } else if (canIDo(actions, 'comment', currentTime)) {
                        actions.comment.doingRN = true;

                        console.log('comment');
                        console.log(currentTime);

                        const commentText = onion.comments[Math.floor(Math.random() * onion.comments.length - 1)]
                        if (commentText) {
                            const comment = await goAndWriteComment(commentText);
                            if (comment) {
                                actions.comment.finished = true;
                            }
                        }

                        actions.comment.doingRN = false;
                    } else if (canIDo(actions, 'clickDescriptionLink', currentTime)) {
                        actions.clickDescriptionLink.doingRN = true;
                        console.log('clickDescriptionLink');
                        console.log('ROW--2');

                        const descriptionNode = document.querySelector('#description-inner');

                        if (descriptionNode) {
                            descriptionNode.dispatchEvent(new Event("click", { bubbles: true }));

                            await delay(Math.floor(Math.random() * 150) + 200 * 0.95);

                            const links = descriptionNode.querySelectorAll('a[target="_blank"]');
                            console.log(links);
                            if (links.length > 0) {
                                const link = links[Math.floor(Math.random() * links.length - 1)]

                                console.log(link);
                                if (link) {
                                    link.dispatchEvent(new Event("click", { bubbles: true }));

                                    // await delay(Math.floor(Math.random() * 150) + 200 * 0.95);

                                    chrome.runtime.sendMessage({
                                        msg: "focusOnBoostTab"
                                    });
                                }
                            }
                        }

                        actions.clickDescriptionLink.finished = true;
                        actions.clickDescriptionLink.doingRN = false;
                    } else if (canIDo(actions, 'pauseVideo', currentTime)) {
                        actions.pauseVideo.doingRN = true;

                        if (video) {

                            const pauseTime = (Math.random() * 5 + 5) * 1000;

                            if (!video.paused) {
                                video.pause();

                                setTimeout(() => {
                                    console.log(video);
                                    if (video.paused) {
                                        video.play();
                                    }
                                    actions.pauseVideo.finished = true;
                                    actions.pauseVideo.doingRN = false;
                                }, pauseTime)
                            }
                        } else {
                            actions.pauseVideo.finished = true;
                            actions.pauseVideo.doingRN = false;
                        }
                    }
                    await delay(Math.floor(Math.random() * 150) + 750 * 0.95);
                    await doActions(actions);
                } catch (error) {
                    console.error(error);
                    chrome.runtime.sendMessage({
                        msg: "sendErrorReport",
                        data: { error: error.stack }
                    });
                    await delay(Math.floor(Math.random() * 150) + 450 * 0.95);
                    await doActions();
                }
            }

            makeScroll(500);

            await delay(Math.floor(Math.random() * 200) + 2000 * 0.95);

            makeScroll(-500);

            await delay(Math.floor(Math.random() * 150) + 150 * 0.95);

            doActions(actions);

        } catch (error) {
            console.error(error);
            chrome.runtime.sendMessage({
                msg: "sendErrorReport",
                data: { error: error.stack }
            });
            chrome.runtime.sendMessage({
                msg: "continueFunc"
            });
        }
    }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

async function getNode(selector, maxAttempts, randomDelay) {
    let count = 0;
    let node = null;
    console.log(selector);
    while (count < maxAttempts) {
        try {
            node = selector()
            console.log(node);
        } catch (error) {
            console.error(error);
        }
        if (node ? node.length ? node.length === 0 : false : true) {
            await delay(randomDelay());
        } else {
            break;
        }
        count++;
    }
    return node || null;
}