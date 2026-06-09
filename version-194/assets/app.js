(function () {
  var body = document.body;
  var toggle = document.querySelector('.mobile-toggle');

  if (toggle) {
    toggle.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }

  document.querySelectorAll('.mobile-nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      body.classList.remove('nav-open');
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function restartTimer() {
    if (!slides.length) {
      return;
    }

    if (timer) {
      clearInterval(timer);
    }

    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      restartTimer();
    });
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      restartTimer();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      restartTimer();
    });
  });

  showSlide(0);
  restartTimer();

  document.querySelectorAll('.searchable-grid').forEach(function (grid) {
    var section = grid.closest('section') || document;
    var input = section.querySelector('.movie-search') || document.querySelector('.movie-search');
    var select = section.querySelector('.filter-select') || document.querySelector('.filter-select');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function applyFilter() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var kind = select ? select.value.trim() : '';

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var cardKind = card.getAttribute('data-kind') || '';
        var matchText = !q || haystack.indexOf(q) !== -1;
        var matchKind = !kind || cardKind.indexOf(kind) !== -1;
        card.classList.toggle('is-filter-hidden', !(matchText && matchKind));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (select) {
      select.addEventListener('change', applyFilter);
    }
  });
})();
