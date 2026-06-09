(function () {
    const toggle = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            const open = mobileNav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(open));
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilter(form) {
        const listId = form.getAttribute("data-list-id");
        const list = document.querySelector('[data-list="' + listId + '"]');
        const empty = document.querySelector("[data-empty-state]");
        if (!list) {
            return;
        }

        const input = form.querySelector("[data-search-input]");
        const region = form.querySelector("[data-region-filter]");
        const type = form.querySelector("[data-type-filter]");
        const category = form.querySelector("[data-category-filter]");
        const cards = Array.from(list.querySelectorAll(".movie-card"));

        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q");
        if (initialQuery && input) {
            input.value = initialQuery;
        }

        function apply() {
            const query = normalize(input && input.value);
            const regionValue = normalize(region && region.value);
            const typeValue = normalize(type && type.value);
            const categoryValue = normalize(category && category.value);
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-category")
                ].join(" "));
                const okQuery = !query || haystack.includes(query);
                const okRegion = !regionValue || normalize(card.getAttribute("data-region")).includes(regionValue) || haystack.includes(regionValue);
                const okType = !typeValue || normalize(card.getAttribute("data-type")).includes(typeValue) || haystack.includes(typeValue);
                const okCategory = !categoryValue || normalize(card.getAttribute("data-category")).includes(categoryValue) || haystack.includes(categoryValue);
                const show = okQuery && okRegion && okType && okCategory;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, region, type, category].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });

        form.addEventListener("submit", function (event) {
            if (window.location.pathname.split("/").pop() !== "search.html") {
                return;
            }
            event.preventDefault();
            apply();
        });

        apply();
    }

    document.querySelectorAll("[data-filter-form]").forEach(setupFilter);
})();
