(function () {
    window.initMoviePlayer = function (source) {
        const video = document.getElementById('movie-player');
        const layer = document.querySelector('.play-layer');
        let attached = false;
        let hls = null;

        function attach() {
            if (!video || attached) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            attached = true;
        }

        function start() {
            attach();
            if (layer) {
                layer.classList.add('hidden');
            }
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (layer) {
            layer.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
