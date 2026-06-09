(function () {
  'use strict';

  var HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var button = document.querySelector('[data-mobile-menu]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initPosterFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('.poster-frame img, .category-tile img, .hero-slide img, .detail-backdrop img'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        var frame = image.closest('.poster-frame');
        if (frame) {
          frame.classList.add('is-missing');
        }
      });
    });
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = panel.querySelector('[data-search-input]');
      var counter = panel.querySelector('[data-result-count]');
      var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var activeType = '';

      function update() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var shown = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search-text') || '').toLowerCase();
          var type = card.getAttribute('data-type') || '';
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesType = !activeType || type === activeType;
          var visible = matchesKeyword && matchesType;

          card.classList.toggle('is-hidden', !visible);

          if (visible) {
            shown += 1;
          }
        });

        if (counter) {
          counter.textContent = shown + ' 部';
        }
      }

      if (input) {
        input.addEventListener('input', update);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          activeType = chip.getAttribute('data-filter-value') || '';
          chips.forEach(function (other) {
            other.classList.toggle('is-active', other === chip);
          });
          update();
        });
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) {
        input.value = q;
      }

      update();
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');

      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        if (window.Hls) {
          resolve();
        }
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initHlsPlayer() {
    var video = document.querySelector('[data-hls-player]');

    if (!video) {
      return;
    }

    var button = document.querySelector('[data-play-button]');
    var status = document.querySelector('[data-player-status]');
    var src = video.getAttribute('data-src');
    var started = false;
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function playVideo() {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('浏览器已阻止自动播放，请再次点击视频播放按钮。');
        });
      }
    }

    function attachWithHlsJs() {
      if (!window.Hls || !window.Hls.isSupported()) {
        video.src = src;
        setStatus('当前浏览器不支持 HLS.js，已尝试使用浏览器原生播放能力。');
        playVideo();
        return;
      }

      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('HLS 清单加载完成，正在播放高清线路。');
        playVideo();
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放源加载异常，请刷新页面后重试。');
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    }

    function startPlayer() {
      if (started || !src) {
        return;
      }

      started = true;

      if (button) {
        button.classList.add('is-loading');
      }

      setStatus('正在初始化 HLS 播放器...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        setStatus('当前浏览器支持原生 HLS，正在播放。');
        playVideo();
      } else {
        loadScript(HLS_CDN).then(function () {
          attachWithHlsJs();
        }).catch(function () {
          video.src = src;
          setStatus('HLS.js 加载失败，已切换为直接播放 m3u8 地址。');
          playVideo();
        });
      }

      if (button) {
        button.classList.add('is-hidden');
      }
    }

    if (button) {
      button.addEventListener('click', startPlayer);
    }

    video.addEventListener('click', function () {
      if (!started) {
        startPlayer();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMobileNav();
    initHeroSlider();
    initPosterFallbacks();
    initFilters();
    initHlsPlayer();
  });
})();
