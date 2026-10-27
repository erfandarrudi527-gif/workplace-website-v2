/* ============================================
   GLOBAL ANIMATION CONTROLLER
   - Scroll reveal
   - Ripple clicks
   - Cursor follower
   - Tilt 3D cards
   ============================================ */

(function () {
    "use strict";

    // ===== Page loader (always runs) =====
    const siteLoader = document.getElementById("siteLoader");
    if (siteLoader) {
        let loaderHidden = false;
        const MIN_LOADER_MS = 2200;
        const loaderStart = performance.now();
        const hideLoader = () => {
            if (loaderHidden) return;
            loaderHidden = true;
            siteLoader.classList.add("done");
            document.body.classList.add("app-loaded");
            document.dispatchEvent(new CustomEvent("app:loaded"));
            setTimeout(() => siteLoader.remove(), 600);
        };
        const releaseLoader = () => {
            const wait = Math.max(0, MIN_LOADER_MS - (performance.now() - loaderStart));
            setTimeout(hideLoader, wait);
        };
        if (document.readyState === "complete") {
            releaseLoader();
        } else {
            window.addEventListener("load", releaseLoader);
        }
        setTimeout(hideLoader, 5000);
    }

    /* اگر کاربر در سیستمش «کاهش حرکت» را روشن کرده باشد، انیمیشن‌ها را
       اجرا نمی‌کنیم — ولی عناصر باید همین حالا دیده شوند، وگرنه چون
       reveal با opacity:0 شروع می‌شود کل صفحه خالی می‌ماند. */
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
        document
            .querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale, .section-anim, .stagger-grid, .reveal-center")
            .forEach((el) => el.classList.add("is-visible"));
        return;
    }

    // ===== Scroll Reveal (each element plays once and stays visible) =====
    const allRevealSelectors = ".reveal, .reveal-left, .reveal-right, .reveal-scale, .section-anim, .stagger-grid";
    const revealTargets = document.querySelectorAll(allRevealSelectors);

    if ("IntersectionObserver" in window) {
        const revealIo = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        revealIo.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0, rootMargin: "0px 0px -40px 0px" }
        );
        revealTargets.forEach((el) => revealIo.observe(el));
    } else {
        revealTargets.forEach((el) => el.classList.add("is-visible"));
    }

    // ===== Ripple Click Effect =====
    document.addEventListener("click", (e) => {
        const target = e.target.closest(".ripple");
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement("span");
        ripple.className = "ripple-effect";
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = e.clientX - rect.left - size / 2 + "px";
        ripple.style.top = e.clientY - rect.top - size / 2 + "px";
        target.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });

    // ===== Cursor Follower =====
    const dot = document.querySelector(".cursor-dot");
    if (dot && window.matchMedia("(pointer: fine)").matches) {
        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let cx = mx;
        let cy = my;

        window.addEventListener("mousemove", (e) => {
            mx = e.clientX;
            my = e.clientY;
            dot.classList.add("is-active");
        });

        window.addEventListener("mouseleave", () => dot.classList.remove("is-active"));

        document.addEventListener("mouseover", (e) => {
            const hoverable = e.target.closest("a, button, .hover-lift, .tilt-card");
            if (hoverable) dot.classList.add("is-hover");
        });
        document.addEventListener("mouseout", (e) => {
            const hoverable = e.target.closest("a, button, .hover-lift, .tilt-card");
            if (hoverable) dot.classList.remove("is-hover");
        });

        (function loop() {
            cx += (mx - cx) * 0.18;
            cy += (my - cy) * 0.18;
            dot.style.left = cx + "px";
            dot.style.top = cy + "px";
            requestAnimationFrame(loop);
        })();
    }

    // ===== Tilt 3D on cards =====
    document.querySelectorAll(".tilt-card").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform =
                "perspective(800px) rotateX(" + -y * 6 + "deg) rotateY(" + x * 6 + "deg) translateZ(0)";
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });

    // ===== Parallax on orbs =====
    const orbs = document.querySelectorAll(".bg-orbs .orb");
    if (orbs.length) {
        let ticking = false;
        window.addEventListener("mousemove", (e) => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const x = (e.clientX / window.innerWidth - 0.5) * 20;
                const y = (e.clientY / window.innerHeight - 0.5) * 20;
                orbs.forEach((orb, i) => {
                    const depth = (i + 1) * 0.6;
                    orb.style.translate = (x * depth) + "px " + (y * depth) + "px";
                });
                ticking = false;
            });
        });
    }

    // ===== Hero rotator (typewriter) — starts after the loader =====
    const afterLoad = (fn) => {
        document.addEventListener("app:loaded", fn, { once: true });
    };

    const typewriterEl = document.getElementById("typewriterWord");
    if (typewriterEl) {
        const words = ["هدفون بی‌سیم", "پاوربانک سریع", "ساعت هوشمند", "کیس و گلس محافظ", "شارژر و کابل"];
        let wi = 0;
        let ci = 0;
        let deleting = false;
        const tick = () => {
            const word = words[wi];
            typewriterEl.textContent = word.slice(0, ci);
            if (!deleting) {
                ci++;
                if (ci > word.length) {
                    deleting = true;
                    ci = word.length;
                }
            } else {
                ci--;
                if (ci < 0) {
                    deleting = false;
                    ci = 0;
                    wi = (wi + 1) % words.length;
                }
            }
            setTimeout(tick, deleting ? 45 : ci === 0 ? 450 : 110);
        };
        afterLoad(() => setTimeout(tick, 1200));
    }

    // ===== Floating particles =====
    const particlesHost = document.getElementById("bgParticles");
    if (particlesHost) {
        for (let i = 0; i < 18; i++) {
            const p = document.createElement("span");
            const size = 3 + Math.random() * 6;
            p.style.width = p.style.height = size + "px";
            p.style.left = Math.random() * 100 + "%";
            p.style.animationDuration = 8 + Math.random() * 14 + "s";
            p.style.animationDelay = -Math.random() * 20 + "s";
            particlesHost.appendChild(p);
        }
    }

    // ===== Scroll parallax on banner art =====
    const parallaxTargets = document.querySelectorAll("[data-parallax]");
    if (parallaxTargets.length) {
        let pTicking = false;
        const onParallax = () => {
            const y = window.scrollY;
            parallaxTargets.forEach((el) => {
                const speed = parseFloat(el.dataset.parallax) || 0.2;
                el.style.translate = "0 " + (-(y * speed)).toFixed(1) + "px";
            });
            pTicking = false;
        };
        window.addEventListener("scroll", () => {
            if (!pTicking) {
                pTicking = true;
                requestAnimationFrame(onParallax);
            }
        }, { passive: true });
        onParallax();
    }

    // ===== Animated stat counters =====
    const statNums = document.querySelectorAll(".stat-num[data-target]");
    if (statNums.length && "IntersectionObserver" in window) {
        const animateCount = (el) => {
            const target = parseInt(el.dataset.target, 10);
            const suffix = el.dataset.suffix || "";
            const dur = 1600;
            const t0 = performance.now();
            const fa = (n) => n.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
            const tick = (t) => {
                const p = Math.min((t - t0) / dur, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = fa(Math.round(target * eased)) + suffix;
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };
        const statIo = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    animateCount(en.target);
                    statIo.unobserve(en.target);
                }
            });
        }, { threshold: 0.4 });
        statNums.forEach((el) => statIo.observe(el));
    }

    // ===== Testimonials slider =====
    const tQuote = document.getElementById("tQuote");
    const tAuthor = document.getElementById("tAuthor");
    const tDots = document.getElementById("tDots");
    if (tQuote && tAuthor && tDots) {
        const testimonials = [
            { q: "«پاوربانک و کابل شارژ سریع رو هم‌زمان سفارش دادم؛ بسته‌بندی تمیز بود و همان روز تهران رسید. واقعاً اورجینال.»", a: "— سارا محمدی، مشتری آریا استور" },
            { q: "«هدفون بی‌سیم و کیس موبایلم را از آریا استور گرفتم؛ کیفیت و قیمتش از همه‌جا بهتر بود. پشتیبانی هم عالی جواب داد.»", a: "— امیر رضایی، خریدار لوازم جانبی" },
            { q: "«ساعت هوشمند و گلس محافظ را با ضمانت بازگشت خریدم؛ اگه نمی‌خورد پس می‌دادی — همین خیال راحت باعث شد دوباره بخرم.»", a: "— نگار کریمی، مشتری دائمی" },
        ];
        let ti = 0;
        let timer;
        tDots.innerHTML = testimonials.map((_, i) => `<span data-i="${i}" class="${i === 0 ? "active" : ""}"></span>`).join("");
        const dots = tDots.querySelectorAll("span");
        const show = (i) => {
            ti = i;
            tQuote.classList.remove("tick");
            void tQuote.offsetWidth;
            tQuote.textContent = testimonials[i].q;
            tAuthor.textContent = testimonials[i].a;
            tQuote.classList.add("tick");
            dots.forEach((d, di) => d.classList.toggle("active", di === i));
        };
        const restart = () => {
            clearInterval(timer);
            timer = setInterval(() => show((ti + 1) % testimonials.length), 5000);
        };
        dots.forEach((d) => d.addEventListener("click", () => { show(+d.dataset.i); restart(); }));
        restart();
    }

    // ===== Magnetic hover on primary buttons =====
    document.querySelectorAll(".hero-btn.primary, .cat-chip").forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
            const r = btn.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            btn.style.transform = `translate(${dx * 0.15}px, ${dy * 0.25}px)`;
        });
        btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });

    // ===== Scroll progress bar =====
    if (!document.getElementById("scrollProgressBar")) {
        const bar = document.createElement("div");
        bar.id = "scrollProgressBar";
        document.body.appendChild(bar);
        window.addEventListener("scroll", () => {
            const h = document.documentElement;
            const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
            bar.style.width = (p * 100).toFixed(2) + "%";
        }, { passive: true });
    }

    // ===== Hero banner slider =====
    const bannerSlider = document.getElementById("bannerSlider");
    if (bannerSlider) {
        const slides = bannerSlider.querySelectorAll(".banner-slide");
        const dotsWrap = bannerSlider.querySelector(".banner-dots");
        const prevBtn = bannerSlider.querySelector(".banner-prev");
        const nextBtn = bannerSlider.querySelector(".banner-next");
        if (slides.length > 1) {
            let current = 0;
            let autoTimer = null;
            const dots = [];

            const goTo = (i) => {
                current = (i + slides.length) % slides.length;
                slides.forEach((s, idx) => s.classList.toggle("active", idx === current));
                dots.forEach((d, idx) => d.classList.toggle("active", idx === current));
            };

            const startAuto = () => {
                if (autoTimer) clearInterval(autoTimer);
                autoTimer = setInterval(() => goTo(current + 1), 5500);
            };

            slides.forEach((_, idx) => {
                const dot = document.createElement("span");
                dot.addEventListener("click", () => { goTo(idx); startAuto(); });
                dotsWrap.appendChild(dot);
                dots.push(dot);
            });

            prevBtn.addEventListener("click", () => { goTo(current - 1); startAuto(); });
            nextBtn.addEventListener("click", () => { goTo(current + 1); startAuto(); });

            slides.forEach((s) => s.addEventListener("mouseenter", () => {
                if (autoTimer) clearInterval(autoTimer);
            }));
            bannerSlider.addEventListener("mouseleave", startAuto);

            bannerSlider.addEventListener("touchstart", () => {
                if (autoTimer) clearInterval(autoTimer);
            }, { passive: true });
            bannerSlider.addEventListener("touchend", startAuto, { passive: true });

            goTo(0);
            afterLoad(() => setTimeout(startAuto, 1300));
        } else if (dotsWrap) {
            dotsWrap.style.display = "none";
        }
    }

    // ===== Shelf sliders (بست‌سلرز و جدیدترین‌ها) =====
    document.querySelectorAll(".shelf-slider").forEach((sliderEl) => {
        const track = sliderEl.querySelector(".shelf-grid");
        const viewport = sliderEl.querySelector(".shelf-viewport");
        const prevBtn = sliderEl.querySelector(".shelf-prev");
        const nextBtn = sliderEl.querySelector(".shelf-next");
        if (!track || !viewport) return;

        const getStep = () => {
            const first = track.querySelector(".mini-product");
            if (!first) return 0;
            const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            return first.getBoundingClientRect().width + gap;
        };
        const getLimit = () => Math.floor((track.scrollWidth - viewport.clientWidth) / (getStep() || 1));
        let page = 0;
        const update = () => {
            const max = Math.max(0, getLimit());
            page = Math.min(Math.max(0, page), max);
            track.style.transform = "translateX(" + page * getStep() + "px)";
            if (prevBtn) prevBtn.classList.toggle("disabled", page <= 0);
            if (nextBtn) nextBtn.classList.toggle("disabled", page >= max);
        };
        if (nextBtn) nextBtn.addEventListener("click", () => { page++; update(); });
        if (prevBtn) prevBtn.addEventListener("click", () => { page--; update(); });
        window.addEventListener("resize", update);
        update();
    });

    // ===== Back to top button =====
    const backToTop = document.getElementById("backToTop");
    if (backToTop) {
        const onScroll = () => {
            backToTop.classList.toggle("show", window.scrollY > 500);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // ===== Navbar hide on scroll down, show on scroll up =====
    const navbarEl = document.querySelector(".navbar");
    if (navbarEl) {
        let lastScrollY = window.scrollY;
        let ticking = false;
        const onScrollNav = () => {
            const y = window.scrollY;
            if (y > lastScrollY && y > 220) {
                navbarEl.classList.add("navbar-hidden");
            } else {
                navbarEl.classList.remove("navbar-hidden");
            }
            navbarEl.classList.toggle("navbar-shrunk", y > 40);
            lastScrollY = y;
            ticking = false;
        };
        window.addEventListener("scroll", () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(onScrollNav);
            }
        }, { passive: true });
    }
})();