(function() {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let currentSlide = 0;
  let slideTimer = null;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function startSlides() {
    if (slides.length < 2) {
      return;
    }

    slideTimer = window.setInterval(function() {
      setSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      window.clearInterval(slideTimer);
      setSlide(index);
      startSlides();
    });
  });

  startSlides();

  const siteSearchForms = Array.from(document.querySelectorAll('[data-site-search]'));
  siteSearchForms.forEach(function(form) {
    form.addEventListener('submit', function(event) {
      const input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }

      const value = input.value.trim();
      if (!value) {
        event.preventDefault();
        window.location.href = './search.html';
        return;
      }

      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(value);
    });
  });

  const filterInput = document.querySelector('[data-filter-input]');
  const filterCategory = document.querySelector('[data-filter-category]');
  const filterType = document.querySelector('[data-filter-type]');
  const filterStatus = document.querySelector('[data-filter-status]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    const keyword = normalize(filterInput ? filterInput.value : '');
    const category = normalize(filterCategory ? filterCategory.value : '');
    const type = normalize(filterType ? filterType.value : '');
    let visible = 0;

    cards.forEach(function(card) {
      const search = normalize(card.getAttribute('data-search'));
      const cardCategory = normalize(card.getAttribute('data-category'));
      const cardType = normalize(card.getAttribute('data-type'));
      const keywordMatch = !keyword || search.indexOf(keyword) !== -1;
      const categoryMatch = !category || cardCategory === category;
      const typeMatch = !type || cardType.indexOf(type) !== -1 || search.indexOf(type) !== -1;
      const show = keywordMatch && categoryMatch && typeMatch;
      card.classList.toggle('is-hidden-by-filter', !show);
      if (show) {
        visible += 1;
      }
    });

    if (filterStatus) {
      filterStatus.textContent = visible > 0 ? '筛选完成' : '暂未找到匹配内容';
    }
  }

  if (filterInput || filterCategory || filterType) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q && filterInput) {
      filterInput.value = q;
    }

    [filterInput, filterCategory, filterType].forEach(function(control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
