(function() {
  window.initializePlayer = function(source) {
    const video = document.querySelector('[data-player-video]');
    const cover = document.querySelector('[data-player-cover]');
    const button = document.querySelector('[data-player-button]');
    let loaded = false;
    let hls = null;

    if (!video || !source) {
      return;
    }

    function loadSource() {
      if (loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function startPlayback() {
      loadSource();
      video.setAttribute('controls', 'controls');
      if (cover) {
        cover.classList.add('is-hidden');
      }

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function() {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', function(event) {
        event.stopPropagation();
        startPlayback();
      });
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function() {
      if (!loaded || video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('ended', function() {
      if (cover) {
        cover.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function() {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
