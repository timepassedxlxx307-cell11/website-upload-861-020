(function () {
  const selectAll = function (selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  };

  const normalize = function (value) {
    return String(value || "").toLowerCase().trim();
  };

  const toggleButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (toggleButton && mobileMenu) {
    toggleButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = selectAll("[data-hero-slide]", hero);
    const dots = selectAll("[data-hero-dot]", hero);
    let current = 0;
    let timer = null;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    };

    const start = function () {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    hero.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
      timer = null;
    });

    hero.addEventListener("mouseleave", start);
    start();
  }

  selectAll(".site-search").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      const input = form.querySelector("input[name='q']");
      if (!input || !normalize(input.value)) {
        event.preventDefault();
        window.location.href = form.getAttribute("action") || "./search.html";
      }
    });
  });

  selectAll("[data-filter-scope]").forEach(function (scope) {
    const input = scope.querySelector("[data-filter-input]");
    const category = scope.querySelector("[data-filter-category]");
    const year = scope.querySelector("[data-filter-year]");
    const type = scope.querySelector("[data-filter-type]");
    const count = scope.querySelector("[data-result-count]");
    const container = document.querySelector("[data-card-container]") || document;
    const cards = selectAll("[data-card]", container);

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    const apply = function () {
      const q = normalize(input && input.value);
      const cat = normalize(category && category.value);
      const y = normalize(year && year.value);
      const t = normalize(type && type.value);
      let visible = 0;

      cards.forEach(function (card) {
        const text = normalize(card.getAttribute("data-search"));
        const cardCategory = normalize(card.getAttribute("data-category"));
        const cardYear = normalize(card.getAttribute("data-year"));
        const cardType = normalize(card.getAttribute("data-type"));
        const matched = (!q || text.indexOf(q) !== -1) &&
          (!cat || cardCategory === cat) &&
          (!y || cardYear === y) &&
          (!t || cardType === t);

        card.classList.toggle("hidden-card", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + " 部可浏览";
      }
    };

    [input, category, year, type].forEach(function (item) {
      if (item) {
        item.addEventListener("input", apply);
        item.addEventListener("change", apply);
      }
    });

    apply();
  });
})();
