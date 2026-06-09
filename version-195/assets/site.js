(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function setupNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var mobile = document.querySelector('.mobile-nav');
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = mobile.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        stop();
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSearch() {
    var input = document.querySelector('[data-search-input]');
    var cards = selectAll('[data-search-card]');
    var empty = document.querySelector('[data-empty-tip]');
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(location.search);
    var query = params.get('q') || '';
    if (query) {
      input.value = query;
    }
    function filter() {
      var key = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var matched = !key || haystack.indexOf(key) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    input.addEventListener('input', filter);
    filter();
  }

  function setupSearchForms() {
    selectAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var field = form.querySelector('input[name="q"]');
        if (field && !field.value.trim()) {
          event.preventDefault();
          field.focus();
        }
      });
    });
  }

  function startPlayer(sourceUrl) {
    var video = document.getElementById('movie-player');
    var cover = document.querySelector('.player-cover');
    if (!video || !sourceUrl) {
      return;
    }
    var attached = false;
    function attach() {
      if (attached) {
        return Promise.resolve();
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        return Promise.resolve();
      }
      if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(Hls.Events.MANIFEST_PARSED, resolve);
        });
      }
      video.src = sourceUrl;
      return Promise.resolve();
    }
    function play() {
      attach().then(function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      });
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupSearch();
    setupSearchForms();
  });

  globalThis.initPlayer = startPlayer;
})();
