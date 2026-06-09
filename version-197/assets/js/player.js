(function () {
  window.initMoviePlayer = function (streamUrl) {
    const video = document.getElementById("movieVideo");
    const trigger = document.getElementById("playTrigger");

    if (!video || !trigger || !streamUrl) {
      return;
    }

    let loaded = false;
    let hls = null;

    const loadStream = function () {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    };

    const play = function () {
      loadStream();
      trigger.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      const started = video.play();
      if (started && typeof started.catch === "function") {
        started.catch(function () {
          trigger.classList.remove("is-hidden");
        });
      }
    };

    trigger.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
