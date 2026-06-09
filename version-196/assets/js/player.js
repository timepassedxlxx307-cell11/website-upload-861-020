(function () {
    const streamUrl = window.__BK_STREAM__;
    const shell = document.querySelector("[data-player]");
    const button = document.querySelector("[data-player-button]");
    const layer = document.querySelector("[data-player-layer]");
    const video = document.querySelector(".movie-video");
    let loaded = false;
    let hlsPlayer = null;

    function loadStream() {
        if (!video || !streamUrl) {
            return Promise.resolve();
        }
        if (loaded) {
            return Promise.resolve();
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsPlayer = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsPlayer.loadSource(streamUrl);
            hlsPlayer.attachMedia(video);
            return new Promise(function (resolve) {
                hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                window.setTimeout(resolve, 900);
            });
        }
        video.src = streamUrl;
        return Promise.resolve();
    }

    function start() {
        if (!video || !shell) {
            return;
        }
        shell.classList.add("is-playing");
        loadStream().then(function () {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        });
    }

    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            start();
        });
    }

    if (layer) {
        layer.addEventListener("click", function () {
            start();
        });
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (shell) {
                shell.classList.add("is-playing");
            }
        });
    }
})();
