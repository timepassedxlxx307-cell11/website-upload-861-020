(function () {
  function setupMoviePlayer(streamUrl, videoId) {
    var video = document.getElementById(videoId);

    if (!video || !streamUrl) {
      return;
    }

    var shell = video.closest('.player-shell');
    var button = shell ? shell.querySelector('.player-start') : null;
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      }
    }

    function start() {
      prepare();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (button) {
        button.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
