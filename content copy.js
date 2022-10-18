// window.setTimeout(function() {
//     console.log("ASDASDASDASDASDASD")
// }, 2000);

window.addEventListener("load", function() {
    console.log("Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded Loaded");

    console.log(document.location.href);

    let URLS = ["https://www.youtube.com/results?search_query=%5BFREE%5D+Future+Type+Beat+-+%22Ghost%22&sp=CAI%253D",
        "https://www.youtube.com/results?search_query=%28FREE%29+Drake+Type+Beat+-+%22Intertwine%22&sp=CAI%253D"
    ];

    if (localStorage.getItem("nextI") == null) {
        localStorage.setItem("nextI", 0);
    } else if (parseInt(localStorage.getItem("nextI")) == URLS.length) {
        localStorage.setItem("nextI", 0);
    }

    let index = parseInt(localStorage.getItem("nextI"));

    if (document.location.href != URLS[index]) {
        location.assign(URLS[index]);
    } else {
        console.log(document.location.href);
        console.log(URLS[index]);
        console.log(URLS[index] == document.location.href);
        console.log(index);
        console.log(URLS.length);

        if (index < URLS.length) {
            setTimeout(function() {
                start(URLS, index)
            }), 2000;
        }

        if (index < URLS.length) {
            localStorage.setItem("nextI", +index + +1);
        }
    }
});

//document.getElementsByClassName("yt-simple-endpoint style-scope ytd-toggle-button-renderer")[0].click();



function start(URLS, index) {

    console.log("Started");
    console.log(URLS[index]);
    console.log(index);
    console.log(URLS.length);

    setTimeout(function() {
        let objects = document.querySelectorAll('yt-formatted-string.style-scope.ytd-video-renderer');
        console.log(objects.length);
        console.log(objects);

        for (let i = 0; i < objects.length; i++) {
            console.log("FORFORFROFORFOROFOROFROFORFOO");
            let url = decodeURIComponent(URLS[index]);
            url = url.split("query=")[1].split("+").join(" ");
            url = url.split("&")[0];
            console.log("URL = " + url);

            if (objects[i].innerText == url) {
                objects[i].parentElement.click();
                setTimeout(function() {
                    document.getElementsByClassName('watch-active-metadata style-scope ytd-watch-flexy')[0].children[0].children[1].children[0].children[0].children[5].children[3].children[0].children[0].children[0].children[0].children[0].click();
                    document.getElementsByClassName("video-stream html5-main-video")[0].playbackRate = 16.0;

                    let timeDuration = document.querySelector(".ytp-time-duration").innerText.split(":");
                    let time = (parseInt(timeDuration[0]) * 60 + parseInt(timeDuration[1])) * 1000;
                    console.log(timeDuration);
                    console.log(time);

                    setTimeout(function() {
                        console.log("TIMEOUT");
                        window.location.assign(URLS[(index < (URLS.length - 1) ? index + 1 : 0)]);
                    }, time / 13);

                    let seconds = 0;
                    var stopWatch = setInterval(function() {
                        console.log("TIme: " + seconds);
                        seconds++;
                        if (seconds == (time / 1000 + 1) / 13) {
                            clearInterval(stopWatch);
                        }
                    }, 1000);
                }, 2000);

                break;
            }
        }
    }, 2000);
}

console.log("Started from content.js");