// 導航欄功能
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Lazy Load 圖片功能
document.addEventListener("DOMContentLoaded", () => {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          obs.unobserve(img);
        }
      });
    });
  
    lazyImages.forEach(img => {
      if ('loading' in HTMLImageElement.prototype) return;
      observer.observe(img);
    });
  });

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// 關閉導航選單當點擊連結
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
}));

// 點擊導航選單外部關閉選單
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// 平滑滾動到錨點
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});

const applyNavbarShadow = () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 100) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
};

const NAVBAR_OPACITY = 0.70;
document.documentElement.style.setProperty('--navbar-opacity', String(NAVBAR_OPACITY));

// 作品集篩選功能 + 隨機顯示四張
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const showOnlyItems = (itemsToShow) => {
    portfolioItems.forEach(item => {
        if (itemsToShow.includes(item)) {
            item.style.display = 'block';
            item.style.animation = 'fadeInUp 0.6s ease';
        } else {
            item.style.display = 'none';
        }
    });
};

const showRandomFourAll = () => {
    const shuffled = shuffleArray(Array.from(portfolioItems));
    const pick = shuffled.slice(0, 4);
    showOnlyItems(pick);
};

filterButtons.forEach(button => {
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    let touchEndTime = 0;
    let isScrolling = false;
    let scrollTimeout;

    const handleFilter = () => {
        if (isScrolling) return;
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const filterValue = button.getAttribute('data-filter');
        if (filterValue === 'all') { showRandomFourAll(); return; }
        const matched = Array.from(portfolioItems).filter(item => item.getAttribute('data-category') === filterValue);
        showOnlyItems(matched);
    };

    button.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isScrolling = false;
        if (scrollTimeout) clearTimeout(scrollTimeout);
    }, { passive: true });

    button.addEventListener('touchmove', (e) => {
        touchEndY = e.touches[0].clientY;
        if (Math.abs(touchEndY - touchStartY) > 10) isScrolling = true;
    }, { passive: true });

    button.addEventListener('touchend', (e) => {
        touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        if (touchDuration < 300 && Math.abs(touchEndY - touchStartY) < 10 && !isScrolling) {
            e.preventDefault();
            handleFilter();
        }
        scrollTimeout = setTimeout(() => { isScrolling = false; }, 100);
    });

    button.addEventListener('click', handleFilter);
});

// 技能條動畫
const skillBars = document.querySelectorAll('.skill-progress');
const animateSkillBars = () => {
    skillBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = width; }, 500);
    });
};

const aboutSection = document.querySelector('.about');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateSkillBars();
            observer.unobserve(entry.target);
        }
    });
});
if (aboutSection) observer.observe(aboutSection);

// 聯絡表單處理
const contactForm = document.getElementById('contactForm');
const thankCard = document.getElementById('thankCard');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = '發送中...';
    submitButton.disabled = true;
    const formData = new FormData(contactForm);
    fetch("/", {
        method: "POST",
        body: new URLSearchParams(formData).toString(),
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
    .then((res) => {
        if (res.ok) {
            thankCard.style.display = 'block';
            contactForm.reset();
            Array.from(contactForm.elements).forEach(el => el.disabled = true);
            contactForm.reset();
        } else {
            alert("發送失敗，請稍後再試。");
        }
    })
    .catch((err) => {
        console.error(err);
        alert("發送失敗，請檢查網路連線。");
    })
    .finally(() => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    });
});

// 圖片載入動畫
const imagePlaceholders = document.querySelectorAll('.image-placeholder');
const animateImages = () => {
    imagePlaceholders.forEach((placeholder, index) => {
        setTimeout(() => {
            placeholder.style.opacity = '0.8';
            placeholder.style.transform = 'scale(1.02)';
        }, index * 200);
    });
};

// 滾動動畫
const scrollElements = document.querySelectorAll('.portfolio-item, .blog-card, .about-content, .contact-content');
const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend;
};
const displayScrollElement = (element) => { element.style.opacity = '1'; element.style.transform = 'translateY(0)'; };
const hideScrollElement = (element) => { element.style.opacity = '0'; element.style.transform = 'translateY(20px)'; };
const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
        if (elementInView(el, 1)) displayScrollElement(el);
        else hideScrollElement(el);
    });
};
scrollElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
});

// 自動設定縮圖（YouTube）
const setAutoThumbnails = () => {
    const items = document.querySelectorAll('.portfolio-item[data-video-url]');
    items.forEach(item => {
        const url = item.getAttribute('data-video-url');
        if (!url) return;
        if (!/youtu\.be|youtube\.com/.test(url)) return;
        const id = extractYouTubeId(url);
        if (!id) return;
        const category = item.getAttribute('data-category');
        const thumbUrl = category === 'short' 
            ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
            : `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        const container = item.querySelector('.portfolio-image');
        if (!container) return;
        const existingImg = container.querySelector('img');
        if (existingImg && existingImg.getAttribute('src')) return;
        const img = document.createElement('img');
        img.src = thumbUrl;
        const title = item.querySelector('.portfolio-overlay h3');
        img.alt = title ? title.textContent : '影片縮圖';
        img.loading = 'lazy';
        container.innerHTML = '';
        container.appendChild(img);
    });
};

// 影片燈箱
const lightbox = document.getElementById('video-lightbox');
const videoWrapper = document.getElementById('video-wrapper');
const videoCloseBtn = document.querySelector('.video-close');

const extractYouTubeId = (url) => {
    const patterns = [
        /(?:v=)([\w-]{6,})/i,
        /youtu\.be\/([\w-]{6,})/i,
        /youtube\.com\/shorts\/([\w-]{6,})/i,
        /youtube\.com\/embed\/([\w-]{6,})/i
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m && m[1]) return m[1];
    }
    return '';
};

const openLightboxWithUrl = (url) => {
    if (!url) return;
    let embed;
    if (/youtu\.be|youtube\.com/.test(url)) {
        const videoId = extractYouTubeId(url);
        embed = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else if (/vimeo\.com/.test(url)) {
        const idMatch = url.match(/vimeo\.com\/(\d+)/);
        const id = idMatch ? idMatch[1] : '';
        embed = `<iframe src="https://player.vimeo.com/video/${id}?autoplay=1" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    } else {
        embed = `<video src="${url}" controls autoplay playsinline></video>`;
    }
    videoWrapper.innerHTML = embed;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    videoWrapper.innerHTML = '';
    document.body.style.overflow = '';
};

portfolioItems.forEach(item => {
    if (item.classList.contains('folder')) return;
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    let touchEndTime = 0;
    let isScrolling = false;
    let scrollTimeout;

    const handleItemClick = () => {
        if (isScrolling) return;
        const url = item.getAttribute('data-video-url');
        if (url) openLightboxWithUrl(url);
    };

    item.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isScrolling = false;
        if (scrollTimeout) clearTimeout(scrollTimeout);
    }, { passive: true });

    item.addEventListener('touchmove', (e) => {
        touchEndY = e.touches[0].clientY;
        if (Math.abs(touchEndY - touchStartY) > 10) isScrolling = true;
    }, { passive: true });

    item.addEventListener('touchend', (e) => {
        touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        if (touchDuration < 300 && Math.abs(touchEndY - touchStartY) < 10 && !isScrolling) {
            e.preventDefault();
            handleItemClick();
        }
        scrollTimeout = setTimeout(() => { isScrolling = false; }, 100);
    });

    item.addEventListener('click', handleItemClick);
});

if (videoCloseBtn) {
    videoCloseBtn.addEventListener('click', closeLightbox);
    videoCloseBtn.addEventListener('touchend', (e) => { e.preventDefault(); closeLightbox(); });
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox(); });
}

// 社交媒體連結處理
const socialLinks = document.querySelectorAll('.social-link');
socialLinks.forEach(link => {
    const handleSocialClick = (e) => {
        e.preventDefault();
        const url = link.href;
        window.open(url, '_blank');
    };
    link.addEventListener('click', handleSocialClick);
    link.addEventListener('touchend', (e) => { e.preventDefault(); handleSocialClick(e); });
});

// 部落格文章點擊事件
const blogCards = document.querySelectorAll('.blog-card');
blogCards.forEach(card => {
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    let touchEndTime = 0;
    let isScrolling = false;
    let scrollTimeout;

    const handleBlogClick = () => {
        if (isScrolling) return;
        const title = card.querySelector('h3').textContent;
        console.log(`點擊了部落格文章: ${title}`);
    };

    card.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isScrolling = false;
        if (scrollTimeout) clearTimeout(scrollTimeout);
    }, { passive: true });

    card.addEventListener('touchmove', (e) => {
        touchEndY = e.touches[0].clientY;
        if (Math.abs(touchEndY - touchStartY) > 10) isScrolling = true;
    }, { passive: true });

    card.addEventListener('touchend', (e) => {
        touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        if (touchDuration < 300 && Math.abs(touchEndY - touchStartY) < 10 && !isScrolling) {
            e.preventDefault();
            handleBlogClick();
        }
        scrollTimeout = setTimeout(() => { isScrolling = false; }, 100);
    });

    card.addEventListener('click', handleBlogClick);
});

// 返回頂部按鈕
const createBackToTopButton = () => {
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', '返回頂部');
    backToTop.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        font-size: 1.2rem;
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
    `;
    document.body.appendChild(backToTop);

    const showHideBackToTop = () => {
        if (window.scrollY > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    };

    const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };

    backToTop.addEventListener('click', scrollToTop);
    backToTop.addEventListener('touchend', (e) => { e.preventDefault(); scrollToTop(); });
    backToTop.addEventListener('mouseenter', () => {
        backToTop.style.background = '#2980b9';
        backToTop.style.transform = 'translateY(-3px)';
    });
    backToTop.addEventListener('mouseleave', () => {
        backToTop.style.background = '#3498db';
        backToTop.style.transform = 'translateY(0)';
    });

    window.addEventListener('scroll', () => requestScrollJob(showHideBackToTop), { passive: true });
    showHideBackToTop();
};

createBackToTopButton();

// 載入動畫與 LOGO 片頭一次播放邏輯
window.addEventListener('load', () => {
    document.body.style.opacity = '1';

    const loader = document.getElementById('page-loader');
    const intro = document.getElementById('intro-video');
    const introFallback = document.getElementById('intro-fallback');
    const hero = document.getElementById('hero-bg-video');

    const ensureInlineMutedAutoplay = (videoEl) => {
        if (!videoEl) return;
        try {
            videoEl.muted = true;
            videoEl.volume = 0; // 某些瀏覽器需要同時設置為0
            videoEl.autoplay = true;
            videoEl.playsInline = true;
            videoEl.setAttribute('muted', '');
            videoEl.setAttribute('playsinline', '');
            videoEl.setAttribute('webkit-playsinline', '');
            videoEl.setAttribute('x5-playsinline', '');
            videoEl.setAttribute('autoplay', '');
        } catch (_) {}
    };
    ensureInlineMutedAutoplay(hero);

    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
    const preventScroll = (e) => { e.preventDefault(); };
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    if (hero) {
        try {
            hero.autoplay = false;
            hero.removeAttribute('autoplay');
            hero.preload = 'auto';
            hero.pause();
            hero.currentTime = 0;
        } catch (_) {}
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    let heroStarted = false;
    let canStartHero = false;
    let introStarted = false;
    let loaderHidden = false;

    const removeIntroFallback = () => {
        if (introFallback && introFallback.parentNode) {
            introFallback.parentNode.removeChild(introFallback);
        }
    };

    const markPlaying = (v) => { try { v.classList.add('is-playing'); } catch (_) {} };

    const attachPlayingHandlers = (v) => {
        if (!v) return;
        const onPlaying = () => { markPlaying(v); };
        v.addEventListener('playing', onPlaying, { once: true });
        v.addEventListener('canplay', onPlaying, { once: true });
        v.addEventListener('loadeddata', () => { try { v.play().catch(() => {}); } catch (_) {} }, { once: true });
    };

    attachPlayingHandlers(intro);
    attachPlayingHandlers(hero);

    const autoplayRetry = async (v, opts = {}) => {
        const { max = 8, delayMs = 250 } = opts;
        for (let i = 0; i < max; i += 1) {
            try {
                ensureInlineMutedAutoplay(v);
                const p = v.play();
                if (p && typeof p.then === 'function') await p;
                return true;
            } catch (_) {}
            await new Promise(r => setTimeout(r, delayMs));
        }
        return false;
    };

    const tryStartHero = () => {
        if (!hero || heroStarted || !canStartHero) return;
        ensureInlineMutedAutoplay(hero);
        const start = async () => {
            try {
                const p = hero.play();
                if (p && typeof p.then === 'function') await p;
                heroStarted = true; markPlaying(hero);
            } catch (_) {
                const ok = await autoplayRetry(hero, { max: 12, delayMs: 250 });
                if (ok) { heroStarted = true; markPlaying(hero); }
            }
        };
        if (hero.readyState >= 3) { start(); } // HAVE_FUTURE_DATA：可順暢播放
        else {
            const onCanPlayThrough = () => { hero.removeEventListener('canplaythrough', onCanPlayThrough); start(); };
            hero.addEventListener('canplaythrough', onCanPlayThrough, { once: true });
            // 保險：7 秒後仍未就緒也強行啟動
            setTimeout(() => { start(); }, 7000);
        }
    };

    const hideLoaderAndStartHero = () => {
        if (loaderHidden) return;
        loaderHidden = true;
        removeIntroFallback();
        if (loader) {
            loader.classList.add('hide');
            setTimeout(() => { loader.parentNode && loader.parentNode.removeChild(loader); }, 450);
        }
        if (hero) { try { hero.autoplay = true; hero.setAttribute('autoplay', ''); } catch (_) {} }
        canStartHero = true;
        tryStartHero();
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
        window.removeEventListener('wheel', preventScroll, { passive: false });
        window.removeEventListener('touchmove', preventScroll, { passive: false });
        if (isMobile) {
            document.removeEventListener('click', preventClicksDuringLoader, true);
        }
    };

    // 行動裝置：阻擋載入期間的點擊互動
    const preventClicksDuringLoader = (e) => { e.preventDefault(); e.stopPropagation(); };
    if (isMobile) {
        document.addEventListener('click', preventClicksDuringLoader, true);
    }

    // 加入超時保險：桌面 3.5s；手機 3.5s
    let introTimeout;
    if (isMobile) {
        const INTRO_MAX_WAIT_MS_MOBILE = 3500;
        introTimeout = setTimeout(() => { hideLoaderAndStartHero(); }, INTRO_MAX_WAIT_MS_MOBILE);
    } else {
        const INTRO_MAX_WAIT_MS_DESKTOP = 3500;
        introTimeout = setTimeout(() => { hideLoaderAndStartHero(); }, INTRO_MAX_WAIT_MS_DESKTOP);
    }

    if (intro) {
        const clearFallback = () => { removeIntroFallback(); };
        intro.addEventListener('loadeddata', clearFallback, { once: true });
        intro.addEventListener('play', () => {
            clearFallback();
            // 固定 3.5 秒後關閉載入層並啟動 hero（不需使用者互動）
            try { if (introTimeout) clearTimeout(introTimeout); } catch (_) {}
            const FORCE_HIDE_MS = 3500;
            setTimeout(() => { hideLoaderAndStartHero(); }, FORCE_HIDE_MS);
        }, { once: true });

        intro.addEventListener('ended', () => {
            if (introTimeout) clearTimeout(introTimeout);
            hideLoaderAndStartHero();
        }, { once: true });

        const showIntroPlayOverlay = () => { /* 取消點擊啟動覆蓋層 */ };

        const tryPlayIntro = () => {
            const playPromise = intro.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(() => { introStarted = true; markPlaying(intro); removeIntroFallback(); })
                    .catch(async () => {
                        const ok = await autoplayRetry(intro, { max: 10, delayMs: 200 });
                        if (ok) { introStarted = true; markPlaying(intro); removeIntroFallback(); }
                    });
            } else { introStarted = true; markPlaying(intro); removeIntroFallback(); }
        };

        intro.addEventListener('canplay', () => {
            try { intro.play().catch(() => {}); } catch (_) {}
        }, { once: false });
        intro.addEventListener('loadeddata', () => {
            try { intro.play().catch(() => {}); } catch (_) {}
        }, { once: true });
        // 若載入後遲遲未觸發 play，額外等 canplay 再嘗試一次
        intro.addEventListener('canplay', () => {
            try { intro.play().catch(() => {}); } catch (_) {}
        }, { once: true });

        if (intro.readyState >= 2) { tryPlayIntro(); }
        else { intro.addEventListener('canplay', tryPlayIntro, { once: true }); }
    } else {
        hideLoaderAndStartHero();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            if (!introStarted && intro) {
                try {
                    intro.play().then(() => { introStarted = true; markPlaying(intro); removeIntroFallback(); })
                        .catch(async () => { const ok = await autoplayRetry(intro); if (ok) { introStarted = true; markPlaying(intro); removeIntroFallback(); } });
                } catch (_) {}
            }
            tryStartHero();
        }
    });

    // 取消桌面端首次互動保險（完全不靠點擊觸發播放）

    // 取消行動端首次觸控保險（完全不靠點擊觸發播放）
});

// 頁面載入時的淡入效果（已移除以避免桌面黑屏）
// document.body.style.opacity = '0';
// document.body.style.transition = 'opacity 0.5s ease';

let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) { event.preventDefault(); }
    lastTouchEnd = now;
}, false);

const initFolderCards = () => {
    const folderCardItems = document.querySelectorAll('.portfolio-item.folder');
    const imageLightbox = document.getElementById('image-lightbox');
    const imageGallery = document.getElementById('image-gallery');
    const imageCloseBtn = document.querySelector('.image-close');

    const openImageLightbox = (images, titleText) => {
        if (!imageLightbox || !imageGallery) return;
        imageGallery.innerHTML = '';
        images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = '參考照片';
            img.loading = 'lazy';
            imageGallery.appendChild(img);
        });
        const titleEl = document.getElementById('image-title');
        if (titleEl && titleText) titleEl.textContent = titleText;
        imageLightbox.classList.add('active');
        imageLightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeImageLightbox = () => {
        if (!imageLightbox || !imageGallery) return;
        imageLightbox.classList.remove('active');
        imageLightbox.setAttribute('aria-hidden', 'true');
        imageGallery.innerHTML = '';
        document.body.style.overflow = '';
    };

    if (imageCloseBtn) {
        imageCloseBtn.addEventListener('click', closeImageLightbox);
        imageCloseBtn.addEventListener('touchend', (e) => { e.preventDefault(); closeImageLightbox(); });
    }
    if (imageLightbox) {
        imageLightbox.addEventListener('click', (e) => { if (e.target === imageLightbox) closeImageLightbox(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && imageLightbox.classList.contains('active')) closeImageLightbox(); });
    }

    folderCardItems.forEach(item => {
        const cta = item.querySelector('.folder-cta');
        const galleryImgs = Array.from(item.querySelectorAll('.folder-gallery img')).map(img => img.src);
        const title = item.querySelector('.folder-title')?.textContent || '平面攝影';
        if (!cta) return;
        const handleOpen = (e) => { e.preventDefault(); e.stopPropagation(); openImageLightbox(galleryImgs, title); };
        cta.addEventListener('click', handleOpen);
        cta.addEventListener('touchend', handleOpen);
    });
};

let scrollRafPending = false;
const scrollJobs = new Set();
const requestScrollJob = (job) => {
    if (typeof job === 'function') scrollJobs.add(job);
    if (!scrollRafPending) {
        scrollRafPending = true;
        requestAnimationFrame(() => {
            scrollRafPending = false;
            applyNavbarShadow();
            handleScrollAnimation();
            scrollJobs.forEach(fn => { try { fn(); } catch (_) {} });
            scrollJobs.clear();
        });
    }
};

window.addEventListener('scroll', () => requestScrollJob(), { passive: true });
requestScrollJob();

window.addEventListener('load', () => {
    animateImages();
    setAutoThumbnails();
    showRandomFourAll();
    initFolderCards();
});