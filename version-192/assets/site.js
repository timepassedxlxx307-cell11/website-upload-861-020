(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function textOf(card) {
    return [
      card.dataset.title,
      card.dataset.region,
      card.dataset.year,
      card.dataset.genre,
      card.dataset.tags,
      card.textContent
    ].join(" ").toLowerCase();
  }

  function applyFilter(value) {
    var keyword = (value || "").trim().toLowerCase();
    document.querySelectorAll("[data-filter-grid]").forEach(function (grid) {
      var cards = grid.querySelectorAll(".movie-card, .ranking-item, .search-result-card");
      var visible = 0;
      cards.forEach(function (card) {
        var ok = !keyword || textOf(card).indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden-card", !ok);
        if (ok) {
          visible += 1;
        }
      });
      var empty = grid.parentElement.querySelector("[data-empty-state]");
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    });
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
      input.addEventListener("input", function () {
        applyFilter(input.value);
      });
    });

    document.querySelectorAll("[data-filter-chips]").forEach(function (wrap) {
      wrap.addEventListener("click", function (event) {
        var button = event.target.closest("button");
        if (!button) {
          return;
        }
        wrap.querySelectorAll("button").forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        var input = wrap.parentElement.querySelector("[data-filter-input]");
        var value = button.getAttribute("data-filter-value") || "";
        if (input) {
          input.value = value;
        }
        applyFilter(value);
      });
    });
  }

  function initSearchPage() {
    var input = document.getElementById("global-search-input");
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    input.value = q;
    applyFilter(q);
    input.addEventListener("input", function () {
      applyFilter(input.value);
    });
    var clear = document.getElementById("global-search-clear");
    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        applyFilter("");
        input.focus();
      });
    }
  }

  function initPlayers() {
    document.querySelectorAll(".watch-player").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".watch-overlay");
      var message = player.querySelector("[data-watch-message]");
      var stream = player.getAttribute("data-stream");
      var hlsInstance = null;

      function showMessage(text) {
        if (!message || !text) {
          return;
        }
        message.textContent = text;
        message.classList.add("is-visible");
      }

      function prepare() {
        if (!video || !stream || video.dataset.ready === "true") {
          return;
        }
        video.dataset.ready = "true";
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage("播放加载异常，请稍后重试");
              if (hlsInstance) {
                hlsInstance.destroy();
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          showMessage("当前环境暂不支持在线播放");
        }
      }

      function play() {
        prepare();
        if (!video) {
          return;
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            showMessage("请再次点击播放按钮");
          });
        }
      }

      prepare();

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          } else {
            video.pause();
          }
        });
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
        video.addEventListener("pause", function () {
          if (overlay && !video.ended) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
