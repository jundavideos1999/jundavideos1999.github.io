// 導航欄功能
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const pagePreloader = document.getElementById('page-preloader');

const lockScroll = () => {
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
};

const unlockScroll = () => {
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
};

const hidePreloader = () => new Promise((resolve) => {
    if (!pagePreloader) {
        resolve();
        return;
    }
    if (pagePreloader.classList.contains('is-hidden')) {
        resolve();
        return;
    }
    pagePreloader.setAttribute('aria-hidden', 'true');
    pagePreloader.classList.add('is-hidden');

    let resolved = false;
    const finalize = () => {
        if (resolved) return;
        resolved = true;
        pagePreloader.style.display = 'none';
        resolve();
    };

    const handleTransitionEnd = (event) => {
        if (event.target !== pagePreloader) return;
        pagePreloader.removeEventListener('transitionend', handleTransitionEnd);
        finalize();
    };

    pagePreloader.addEventListener('transitionend', handleTransitionEnd);
    setTimeout(finalize, 700);
});

// 移除初始锁定，让页面立即可用
// 不再在页面加载时锁定滚动，让用户可以直接操作页面

// 瀏覽器原生 lazy 屬性已足夠，移除額外 Lazy Load 觀察器

//手機介面漢堡導覽列功能
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
        item.style.display = itemsToShow.includes(item) ? 'block' : 'none';
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

    button.addEventListener('click', handleFilter);
});

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
    const handleItemClick = () => {
        const url = item.getAttribute('data-video-url');
        if (url) openLightboxWithUrl(url);
    };
    item.addEventListener('click', handleItemClick);
});

if (videoCloseBtn) { videoCloseBtn.addEventListener('click', closeLightbox); }

if (lightbox) {
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox(); });
}

// 社交媒體連結處理（簡化）
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(link.href, '_blank');
    });
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
    backToTop.addEventListener('mouseenter', () => {
        backToTop.style.background = '#2980b9';
        backToTop.style.transform = 'translateY(-3px)';
    });
    backToTop.addEventListener('mouseleave', () => {
        backToTop.style.background = '#3498db';
        backToTop.style.transform = 'translateY(0)';
    });

    window.addEventListener('scroll', showHideBackToTop, { passive: true });
    showHideBackToTop();
};

createBackToTopButton();

// 首頁背景影片自動播放與淡入顯示
// 在 DOM 加载完成后立即解锁，不等待视频加载
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        unlockScroll();
        hidePreloader().catch(() => {});
        startHeroVideo();
    }, { once: true });
} else {
    unlockScroll();
    hidePreloader().catch(() => {});
    startHeroVideo();
}

function startHeroVideo() {
    const hero = document.getElementById('hero-bg-video');
    const markPlaying = (v) => { try { v.classList.add('is-playing'); } catch (_) {} };
    
    if (hero) {
        try {
            hero.muted = true;
            hero.setAttribute('muted', '');
            hero.setAttribute('playsinline', '');
            hero.setAttribute('webkit-playsinline', '');
            hero.setAttribute('x5-playsinline', '');
            hero.setAttribute('autoplay', '');
            hero.setAttribute('preload', 'auto');
            const playPromise = hero.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.catch(() => {});
            }
            hero.addEventListener('playing', () => markPlaying(hero), { once: true });
        } catch (_) {}
    }
}

// 頁面載入時的淡入效果（已移除以避免桌面黑屏）
// document.body.style.opacity = '0';
// document.body.style.transition = 'opacity 0.5s ease';

// 移除雙擊縮放抑制邏輯，保持簡潔

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

    if (imageCloseBtn) { imageCloseBtn.addEventListener('click', closeImageLightbox); }
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
    });
};

window.addEventListener('scroll', applyNavbarShadow, { passive: true });
applyNavbarShadow();

window.addEventListener('load', () => {
    setAutoThumbnails();
    showRandomFourAll();
    initFolderCards();
});