(function () {
    const toggle = document.querySelector('.mobile-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            const open = mobileNav.hasAttribute('hidden');
            if (open) {
                mobileNav.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
                toggle.textContent = '×';
            } else {
                mobileNav.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.textContent = '☰';
            }
        });
    }

    document.querySelectorAll('.hero-slider').forEach(function (slider) {
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        const prev = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            slides[index].classList.remove('is-active');
            index = (nextIndex + slides.length) % slides.length;
            slides[index].classList.add('is-active');
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        const keyword = scope.querySelector('[data-filter-keyword]');
        const region = scope.querySelector('[data-filter-region]');
        const year = scope.querySelector('[data-filter-year]');
        const genre = scope.querySelector('[data-filter-genre]');
        const cards = Array.from(scope.querySelectorAll('.movie-card'));
        const rows = Array.from(scope.querySelectorAll('.rank-row'));
        const empty = scope.querySelector('.empty-filter');
        const targets = cards.length ? cards : rows;

        function valueOf(input) {
            return input ? input.value.trim().toLowerCase() : '';
        }

        function apply() {
            const key = valueOf(keyword);
            const reg = valueOf(region);
            const yr = valueOf(year);
            const gen = valueOf(genre);
            let visible = 0;

            targets.forEach(function (item) {
                const text = [
                    item.dataset.title || '',
                    item.dataset.region || '',
                    item.dataset.year || '',
                    item.dataset.genre || '',
                    item.dataset.tags || ''
                ].join(' ').toLowerCase();
                const matched = (!key || text.includes(key)) &&
                    (!reg || (item.dataset.region || '').toLowerCase().includes(reg)) &&
                    (!yr || (item.dataset.year || '').toLowerCase() === yr) &&
                    (!gen || text.includes(gen));

                item.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [keyword, region, year, genre].forEach(function (input) {
            if (input) {
                input.addEventListener('input', apply);
                input.addEventListener('change', apply);
            }
        });
    });
})();
