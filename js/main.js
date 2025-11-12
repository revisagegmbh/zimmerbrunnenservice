'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('site-header');
    const contactBar = document.getElementById('contact-bar');
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const body = document.body;

    const adjustHeaderOffset = () => {
        if (!header || !contactBar) return;
        const height = contactBar.getBoundingClientRect().height;
        header.style.top = `${height}px`;
    };

    adjustHeaderOffset();
    window.addEventListener('resize', debounce(adjustHeaderOffset, 150));

    // Navigation scroll behavior
    if (header) {
        // No scroll behavior needed for fixed header
    }

    // Mobile Navigation
    if (mobileToggle && mobileNav) {
        let navOpen = false;

        const toggleNav = () => {
            navOpen = !navOpen;
            const maxHeight = navOpen ? `${mobileNav.scrollHeight}px` : '0px';
            mobileNav.style.maxHeight = maxHeight;
        };

        mobileToggle.addEventListener('click', toggleNav);
        
        // Close menu when a link is clicked
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navOpen = false;
                mobileNav.style.maxHeight = '0px';
            });
        });
    }

    // Intersection Observer Animations
    const animateElements = Array.from(document.querySelectorAll('[data-animate], [data-animate-stagger]'));
    const pendingAnimations = new Set(animateElements);
    const supportsIntersectionObserver = 'IntersectionObserver' in window;

    const revealAnimatedElement = (element, delay = 0) => {
        if (pendingAnimations.has(element)) {
            pendingAnimations.delete(element);
        }
        if (delay > 0) {
            window.setTimeout(() => element.classList.add('is-visible'), delay);
        } else {
            element.classList.add('is-visible');
        }
    };

    const startManualAnimationFallback = (() => {
        let activated = false;
        const events = ['scroll', 'resize', 'orientationchange'];
        let rafId = null;

        const detach = () => {
            if (!activated) return;
            activated = false;
            events.forEach((event) => window.removeEventListener(event, scheduleCheck));
            document.removeEventListener('visibilitychange', scheduleCheck);
            if (rafId !== null) {
                window.cancelAnimationFrame(rafId);
                rafId = null;
            }
        };

        const evaluate = () => {
            rafId = null;
            if (!pendingAnimations.size) {
                detach();
                return;
            }

            const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
            const activationThreshold = viewportHeight ? viewportHeight * 0.95 : 0;

            pendingAnimations.forEach((element) => {
                const rect = element.getBoundingClientRect();
                if (rect.bottom >= 0 && rect.top <= activationThreshold) {
                    revealAnimatedElement(element);
                }
            });

            if (!pendingAnimations.size) {
                detach();
            }
        };

        const scheduleCheck = () => {
            if (rafId !== null) return;
            rafId = window.requestAnimationFrame(evaluate);
        };

        return () => {
            if (activated || !pendingAnimations.size) return;
            activated = true;
            events.forEach((event) => window.addEventListener(event, scheduleCheck, { passive: true }));
            document.addEventListener('visibilitychange', scheduleCheck);
            scheduleCheck();
            window.setTimeout(scheduleCheck, 400);
            window.setTimeout(scheduleCheck, 1500);
        };
    })();

    if (supportsIntersectionObserver) {
        const groupMap = new Map();

        Array.from(document.querySelectorAll('[data-animate-stagger]')).forEach((el) => {
            const parent = el.parentElement;
            if (!groupMap.has(parent)) {
                groupMap.set(parent, []);
            }
            groupMap.get(parent).push(el);
        });

        groupMap.forEach((items) => {
            items.forEach((item, index) => {
                item.dataset.staggerIndex = String(index);
            });
        });

        const ioOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -10% 0px'
        };

        const animateObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const delay = Number(entry.target.dataset.staggerIndex || 0) * 140;
                revealAnimatedElement(entry.target, delay);
                observer.unobserve(entry.target);
            });
        }, ioOptions);

        animateElements.forEach((el) => animateObserver.observe(el));

        window.setTimeout(startManualAnimationFallback, 1800);
        window.addEventListener('load', startManualAnimationFallback, { once: true });
    } else {
        animateElements.forEach((el) => revealAnimatedElement(el));
        startManualAnimationFallback();
    }

    // KPI Count-Up
    const counters = document.querySelectorAll('.kpi-number');
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animateCounter = (el) => {
        const target = Number(el.dataset.target) || 0;
        const duration = 2200;
        let start = null;

        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const value = Math.floor(easeOutCubic(progress) * target);
            el.textContent = value.toLocaleString('de-DE');
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toLocaleString('de-DE');
            }
        };

        requestAnimationFrame(step);
    };

    if (supportsIntersectionObserver) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.6 });

        counters.forEach((counter) => counterObserver.observe(counter));
    } else {
        counters.forEach((counter) => animateCounter(counter));
    }

    // Services Slider
    const slider = document.getElementById('service-slider');
    if (slider) {
        const cards = Array.from(slider.querySelectorAll('.service-card'));
        const nextBtn = document.getElementById('service-next');
        const prevBtn = document.getElementById('service-prev');
        let currentIndex = 0;
        let autoSlideId = null;

        const getGap = () => {
            return parseInt(window.getComputedStyle(slider).getPropertyValue('gap')) || 0;
        };

        const goTo = (index, instant = false) => {
            if (!cards.length) return;
            currentIndex = (index + cards.length) % cards.length;

            const gap = getGap();
            const cardWidth = cards[0].offsetWidth;
            const viewportWidth = slider.clientWidth;
            const contentWidth = (cardWidth * cards.length) + (gap * Math.max(cards.length - 1, 0));
            const desired = currentIndex * (cardWidth + gap) - (viewportWidth - cardWidth) / 2;
            const maxOffset = Math.max(0, contentWidth - viewportWidth);
            const offset = Math.max(0, Math.min(desired, maxOffset));

            slider.style.transition = instant ? 'none' : ''; // Use CSS transition
            slider.style.transform = `translateX(-${offset}px)`;
            cards.forEach((card, idx) => {
                card.classList.toggle('is-active', idx === currentIndex);
            });
            if (instant) {
                requestAnimationFrame(() => {
                    slider.style.transition = 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1)';
                });
            }
        };

        const next = () => goTo(currentIndex + 1);
        const prev = () => goTo(currentIndex - 1);

        const startAuto = () => {
            stopAuto();
            autoSlideId = window.setInterval(next, 6000);
        };

        const stopAuto = () => {
            if (autoSlideId) {
                window.clearInterval(autoSlideId);
                autoSlideId = null;
            }
        };

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                next();
                startAuto();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prev();
                startAuto();
            });
        }

        slider.addEventListener('mouseenter', stopAuto);
        slider.addEventListener('mouseleave', startAuto);

        let startX = null;
        slider.addEventListener('touchstart', (event) => {
            startX = event.touches[0].clientX;
            stopAuto();
        }, { passive: true });

        slider.addEventListener('touchend', (event) => {
            if (startX === null) return;
            const diff = event.changedTouches[0].clientX - startX;
            if (Math.abs(diff) > 40) {
                if (diff < 0) {
                    next();
                } else {
                    prev();
                }
            }
            startX = null;
            startAuto();
        });

        let pointerStart = null;
        slider.addEventListener('pointerdown', (event) => {
            if (event.pointerType !== 'mouse') return;
            pointerStart = event.clientX;
            stopAuto();
        });

        const resetPointer = () => {
            pointerStart = null;
            startAuto();
        };

        slider.addEventListener('pointerup', (event) => {
            if (event.pointerType !== 'mouse' || pointerStart === null) return;
            const diff = event.clientX - pointerStart;
            if (Math.abs(diff) > 60) {
                if (diff < 0) {
                    next();
                } else {
                    prev();
                }
            }
            resetPointer();
        });

        slider.addEventListener('pointerleave', () => {
            if (pointerStart !== null) {
                resetPointer();
            }
        });

        slider.addEventListener('pointercancel', () => {
            if (pointerStart !== null) {
                resetPointer();
            }
        });

        cards.forEach((card, idx) => {
            card.addEventListener('mouseenter', () => {
                currentIndex = idx;
                goTo(currentIndex);
            });
        });

        window.addEventListener('resize', debounce(() => goTo(currentIndex, true), 200));

        goTo(0, true);
        startAuto();
    }

    // Before/After sliders
    document.querySelectorAll('.before-after').forEach((wrapper) => {
        const range = wrapper.querySelector('input[type="range"]');
        if (!range) return;
        const initial = Number(wrapper.dataset.initial || 0.5);
        const initialPercent = Math.min(Math.max(initial, 0), 1) * 100;
        wrapper.style.setProperty('--position', `${initialPercent}%`);
        range.value = String(initialPercent);

        const update = (value) => {
            const percent = Math.min(Math.max(Number(value), 0), 100);
            wrapper.style.setProperty('--position', `${percent}%`);
        };

        range.addEventListener('input', (event) => update(event.target.value));
        range.addEventListener('change', (event) => update(event.target.value));
    });

    // Clients collapsible
    const clientsToggle = document.getElementById('clients-toggle');
    const clientsPanel = document.getElementById('clients-panel');
    if (clientsToggle && clientsPanel) {
        let open = false;

        const setPanel = (state) => {
            open = state;
            clientsPanel.classList.toggle('is-open', open);
            clientsPanel.style.maxHeight = open ? `${clientsPanel.scrollHeight}px` : '0px';
        };

        clientsToggle.addEventListener('click', () => setPanel(!open));
        setPanel(false);
    }

    // FAQ Accordion
    document.querySelectorAll('.faq-item').forEach((item) => {
        const trigger = item.querySelector('.faq-trigger');
        const content = item.querySelector('.faq-content');
        if (!trigger || !content) return;

        trigger.addEventListener('click', () => {
            const isOpen = item.classList.toggle('is-open');
            trigger.setAttribute('aria-expanded', String(isOpen));
            content.style.maxHeight = isOpen ? `${content.scrollHeight}px` : '0px';
        });
    });

    // Ripple effect for interactive buttons
    const rippleTargets = document.querySelectorAll('.btn-primary, .btn-secondary, .slider-control');
    rippleTargets.forEach((target) => {
        target.addEventListener('pointerdown', (event) => {
            const rect = target.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            target.style.setProperty('--ripple-x', `${x}px`);
            target.style.setProperty('--ripple-y', `${y}px`);
            target.classList.remove('ripple');
            void target.offsetWidth; // force reflow
            target.classList.add('ripple');
            window.setTimeout(() => target.classList.remove('ripple'), 500);
        });
    });

    // Contact form submission (frontend only)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const feedback = document.getElementById('form-feedback');
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }
            contactForm.reset();
            if (feedback) {
                feedback.classList.remove('hidden');
                window.setTimeout(() => feedback.classList.add('hidden'), 6000);
            }
        });
    }

    // Newsletter form submission (mock)
    const newsletterForm = document.querySelector('footer form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = newsletterForm.querySelector('input[type="email"]');
            if (input && input.value) {
                input.value = '';
                input.placeholder = 'Danke für Ihre Anmeldung!';
                window.setTimeout(() => {
                    input.placeholder = 'Ihre E-Mail';
                }, 4000);
            }
        });
    }

    // Current year in footer
    const yearTarget = document.getElementById('current-year');
    if (yearTarget) {
        yearTarget.textContent = String(new Date().getFullYear());
    }

    // Hero water canvas animation
    const waterCanvas = document.getElementById('water-canvas');
    if (waterCanvas && waterCanvas.getContext) {
        const ctx = waterCanvas.getContext('2d');
        const waves = [
            { amplitude: 18, wavelength: 140, speed: 0.018, phase: 0, color: 'rgba(110, 197, 214, 0.35)' },
            { amplitude: 10, wavelength: 90, speed: 0.026, phase: 0.6, color: 'rgba(155, 215, 193, 0.25)' },
            { amplitude: 6, wavelength: 70, speed: 0.032, phase: 1.2, color: 'rgba(47, 138, 164, 0.2)' }
        ];

        const resizeCanvas = () => {
            waterCanvas.width = waterCanvas.clientWidth;
            waterCanvas.height = waterCanvas.clientHeight;
        };

        const drawWave = (wave) => {
            ctx.beginPath();
            ctx.moveTo(0, waterCanvas.height);
            for (let x = 0; x <= waterCanvas.width; x += 2) {
                const y = Math.sin((x / wave.wavelength) + wave.phase) * wave.amplitude + waterCanvas.height * 0.55;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(waterCanvas.width, waterCanvas.height);
            ctx.closePath();
            const gradient = ctx.createLinearGradient(0, waterCanvas.height * 0.2, 0, waterCanvas.height);
            gradient.addColorStop(0, wave.color);
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = gradient;
            ctx.fill();
        };

        const render = () => {
            ctx.clearRect(0, 0, waterCanvas.width, waterCanvas.height);
            waves.forEach((wave) => {
                wave.phase += wave.speed;
                drawWave(wave);
            });
            requestAnimationFrame(render);
        };

        resizeCanvas();
        window.addEventListener('resize', debounce(resizeCanvas, 200));
        render();
    }

    // GSAP Enhancements (if available)
    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        gsap.to('.hero-wave', {
            y: -30,
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        gsap.utils.toArray('.project-card').forEach((card) => {
            gsap.fromTo(card, { y: 40 }, {
                y: -10,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });
    }

    // Enhanced team slider for the Ansprechpartner page
    const teamSliders = document.querySelectorAll('.team-slider-container');
    teamSliders.forEach(sliderContainer => {
        const track = sliderContainer.querySelector('.team-slider-track');
        const slides = Array.from(track.children);
        const nextButton = sliderContainer.querySelector('.team-next');
        const prevButton = sliderContainer.querySelector('.team-prev');
        let currentIndex = 0;
        let autoSlideInterval = null;

        const updateSliderPosition = () => {
            const slideWidth = slides[0].getBoundingClientRect().width;
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
            updateDotStates();
        };

        const updateDotStates = () => {
            // Update active state for navigation dots
            if (currentIndex === 0) {
                prevButton.classList.remove('active');
                nextButton.classList.add('active');
            } else {
                prevButton.classList.add('active');
                nextButton.classList.remove('active');
            }
        };

        const goToNext = () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSliderPosition();
        };

        const goToPrev = () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSliderPosition();
        };

        const startAutoSlide = () => {
            stopAutoSlide();
            autoSlideInterval = setInterval(goToNext, 3000);
        };

        const stopAutoSlide = () => {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
            }
        };

        // Button navigation
        nextButton.addEventListener('click', () => {
            goToNext();
            startAutoSlide(); // Restart auto-slide after manual interaction
        });

        prevButton.addEventListener('click', () => {
            goToPrev();
            startAutoSlide(); // Restart auto-slide after manual interaction
        });

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoSlide();
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoSlide();
        }, { passive: true });

        const handleSwipe = () => {
            const swipeThreshold = 50;
            if (touchStartX - touchEndX > swipeThreshold) {
                goToNext(); // Swipe left
            } else if (touchEndX - touchStartX > swipeThreshold) {
                goToPrev(); // Swipe right
            }
        };

        // Pause auto-slide on hover (desktop)
        sliderContainer.addEventListener('mouseenter', stopAutoSlide);
        sliderContainer.addEventListener('mouseleave', startAutoSlide);

        // Recalculate on resize
        window.addEventListener('resize', updateSliderPosition);

        // Initialize
        updateSliderPosition();
        startAutoSlide();
    });

    // Handle anchor links on page load
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            // Instantly make all animated sections visible to ensure correct layout for scrolling
            document.querySelectorAll('[data-animate]').forEach(el => {
                el.classList.add('is-visible');
            });

            // Use a small timeout to allow the browser to render the layout
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
        }
    }

    // Initialize Process Slider
    initProcessSlider();
    normalizeProcessVideos();
});

function debounce(fn, delay = 200) {
    let timeout;
    return (...args) => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => fn.apply(null, args), delay);
    };
}

const initProcessSlider = () => {
    const sliderContainer = document.querySelector('.process-slider-container');
    if (!sliderContainer) return;

    const slides = Array.from(document.querySelectorAll('.process-slide'));
    const prevBtn = document.getElementById('process-prev');
    const nextBtn = document.getElementById('process-next');
    const dotsContainer = document.getElementById('process-dots');

    if (slides.length === 0) {
        return;
    }

    let currentSlide = 0;
    let autoSlideInterval = null;

    const goToSlide = (slideIndex) => {
        // Deactivate current
        if (slides[currentSlide]) {
            slides[currentSlide].classList.remove('active');
            const currentVideo = slides[currentSlide].querySelector('video');
            if (currentVideo) currentVideo.pause();
            const currentDot = document.querySelector(`.process-dot[data-slide="${currentSlide}"]`);
            if (currentDot) currentDot.classList.remove('active');
        }

        currentSlide = (slideIndex + slides.length) % slides.length;

        // Activate new
        if (slides[currentSlide]) {
            slides[currentSlide].classList.add('active');
            const newVideo = slides[currentSlide].querySelector('video');
            if (newVideo) {
                 newVideo.currentTime = 0;
                 newVideo.play().catch(error => {
                    console.info("Autoplay was prevented for slide " + currentSlide, error);
                 });
            }
            const newDot = document.querySelector(`.process-dot[data-slide="${currentSlide}"]`);
            if (newDot) newDot.classList.add('active');
        }
    };

    const stopAutoSlide = () => clearInterval(autoSlideInterval);

    const startAutoSlide = () => {
        stopAutoSlide();
        autoSlideInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 7000); // 7 seconds per slide
    };

    // Create dots
    if (dotsContainer) {
        dotsContainer.innerHTML = ''; // Clear existing dots
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.classList.add('process-dot');
            dot.dataset.slide = i;
            dot.setAttribute('aria-label', `Gehe zu Schritt ${i + 1}`);
            dot.addEventListener('click', () => {
                goToSlide(i);
                startAutoSlide(); // Restart timer on manual interaction
            });
            dotsContainer.appendChild(dot);
        });
    }

    // Event Listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
            startAutoSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
            startAutoSlide();
        });
    }

    // Initial state
    goToSlide(0);
    startAutoSlide();
};

const normalizeProcessVideos = () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /Android/i.test(ua);

    if (!isAndroid) {
        return;
    }

    const videos = Array.from(document.querySelectorAll('.process-video-container video[data-orientation="portrait"]'));

    if (!videos.length) {
        return;
    }

    const updateVideo = (video) => {
        const intrinsicWidth = video.videoWidth || video.clientWidth || 1;
        const intrinsicHeight = video.videoHeight || video.clientHeight || 1;

        if (intrinsicWidth > intrinsicHeight) {
            const scale = intrinsicHeight === 0 ? 1 : intrinsicWidth / intrinsicHeight;
            video.style.setProperty('--video-rotate', '90deg');
            video.style.setProperty('--video-scale', scale.toString());
            video.classList.add('orientation-corrected');
        } else {
            video.style.setProperty('--video-rotate', '0deg');
            video.style.setProperty('--video-scale', '1');
            video.classList.remove('orientation-corrected');
        }
    };

    const handleResize = debounce(() => {
        videos.forEach(updateVideo);
    }, 150);

    videos.forEach((video) => {
        const applyUpdate = () => updateVideo(video);

        if (video.readyState >= 1) {
            window.requestAnimationFrame(applyUpdate);
        }

        video.addEventListener('loadedmetadata', applyUpdate, { once: false });
        video.addEventListener('loadeddata', applyUpdate, { once: false });
    });

    window.addEventListener('resize', handleResize);
};
