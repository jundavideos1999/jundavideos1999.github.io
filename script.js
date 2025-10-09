// 導航欄功能
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // 防止背景滾動
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
            // 關閉導航選單（如果開啟）
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            
            // 計算偏移量（考慮固定導航欄高度）
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// 導航欄滾動效果（用 class 控制陰影，不覆蓋透明度變數）
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// 以程式常數設定導覽列透明度（0.50 ~ 1.00）
const NAVBAR_OPACITY = 0.70; // 想調整時改這裡即可
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

// 改進的篩選功能，支援觸控並防止滾動時意外觸發
filterButtons.forEach(button => {
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    let touchEndTime = 0;
    let isScrolling = false;
    let scrollTimeout;

    // 支援點擊和觸控
    const handleFilter = () => {
        // 如果是滾動狀態，不觸發篩選
        if (isScrolling) {
            return;
        }
        
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');
        if (filterValue === 'all') {
            showRandomFourAll();
            return;
        }

        const matched = Array.from(portfolioItems).filter(
            item => item.getAttribute('data-category') === filterValue
        );
        showOnlyItems(matched);
    };

    // 觸控開始
    button.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isScrolling = false;
        
        // 清除之前的滾動超時
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
    }, { passive: true });

    // 觸控移動
    button.addEventListener('touchmove', (e) => {
        touchEndY = e.touches[0].clientY;
        const touchDiff = Math.abs(touchEndY - touchStartY);
        
        // 如果垂直移動距離超過10px，認為是滾動
        if (touchDiff > 10) {
            isScrolling = true;
        }
    }, { passive: true });

    // 觸控結束
    button.addEventListener('touchend', (e) => {
        touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        const touchDiff = Math.abs(touchEndY - touchStartY);
        
        // 如果觸控時間短於300ms且移動距離小於10px，認為是點擊
        if (touchDuration < 300 && touchDiff < 10 && !isScrolling) {
            e.preventDefault();
            handleFilter();
        }
        
        // 延遲重置滾動狀態，防止快速連續觸控
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 100);
    });

    button.addEventListener('click', handleFilter);
});

// 技能條動畫
const skillBars = document.querySelectorAll('.skill-progress');

const animateSkillBars = () => {
    skillBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
};

// 當關於我區塊進入視窗時觸發技能條動畫
const aboutSection = document.querySelector('.about');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateSkillBars();
            observer.unobserve(entry.target);
        }
    });
});

if (aboutSection) {
    observer.observe(aboutSection);
}

// 聯絡表單處理
const contactForm = document.getElementById('contactForm');
const thankCard = document.getElementById('thankCard');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    // 顯示載入狀態
    submitButton.textContent = '發送中...';
    submitButton.disabled = true;

    // 準備表單資料
    const formData = new FormData(contactForm);

    // 用 fetch 傳給 Netlify
    fetch("/", {
        method: "POST",
        body: new URLSearchParams(formData).toString(),
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
    .then((res) => {
        if (res.ok) {
            // 成功 → 顯示感謝卡片
            thankCard.style.display = 'block';
            contactForm.reset();
            // 禁用表單所有欄位（不能再輸入或送出）
            Array.from(contactForm.elements).forEach(el => el.disabled = true);
            
            // 可選：清空表單內容
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
        // 恢復按鈕
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

// 頁面載入完成後觸發動畫
window.addEventListener('load', () => {
    animateImages();
});

// 滾動動畫
const scrollElements = document.querySelectorAll('.portfolio-item, .blog-card, .about-content, .contact-content');

const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
        elementTop <=
        (window.innerHeight || document.documentElement.clientHeight) / dividend
    );
};

const displayScrollElement = (element) => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
};

const hideScrollElement = (element) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
};

const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
        if (elementInView(el, 1)) {
            displayScrollElement(el);
        } else {
            hideScrollElement(el);
        }
    });
};

// 初始化滾動動畫
scrollElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
});

window.addEventListener('scroll', handleScrollAnimation);
window.addEventListener('load', handleScrollAnimation);

// 自動設定縮圖（YouTube）
const setAutoThumbnails = () => {
    const items = document.querySelectorAll('.portfolio-item[data-video-url]');
    items.forEach(item => {
        const url = item.getAttribute('data-video-url');
        if (!url) return;
        if (!/youtu\.be|youtube\.com/.test(url)) return; // 目前僅針對 YouTube 自動縮圖

        const id = extractYouTubeId(url);
        if (!id) return;
        const thumbUrl = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

        const container = item.querySelector('.portfolio-image');
        if (!container) return;
        const img = document.createElement('img');
        img.src = thumbUrl;
        const title = item.querySelector('.portfolio-overlay h3');
        img.alt = title ? title.textContent : '影片縮圖';
        img.loading = 'lazy';

        // 置換原有內容
        container.innerHTML = '';
        container.appendChild(img);
    });
};

window.addEventListener('load', () => {
    setAutoThumbnails();
    showRandomFourAll(); // 預設：全部（all）顯示隨機四張
});

// 作品集項目點擊播放影片（燈箱）
const lightbox = document.getElementById('video-lightbox');
const videoWrapper = document.getElementById('video-wrapper');
const videoCloseBtn = document.querySelector('.video-close');

const extractYouTubeId = (url) => {
    // 支援 youtu.be, watch?v=, shorts, embed 形式
    const patterns = [
        /(?:v=)([\w-]{6,})/i,                 // watch?v=
        /youtu\.be\/([\w-]{6,})/i,           // youtu.be/
        /youtube\.com\/shorts\/([\w-]{6,})/i,// shorts/
        /youtube\.com\/embed\/([\w-]{6,})/i  // embed/
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

// 改進的作品集項目點擊處理，支援觸控並防止滾動時意外觸發
portfolioItems.forEach(item => {
    // 平面攝影的資料夾卡片不套用影片燈箱邏輯
    if (item.classList.contains('folder')) {
        return;
    }
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    let touchEndTime = 0;
    let isScrolling = false;
    let scrollTimeout;

    const handleItemClick = () => {
        // 如果是滾動狀態，不觸發影片播放
        if (isScrolling) {
            return;
        }
        
        const url = item.getAttribute('data-video-url');
        if (url) {
            openLightboxWithUrl(url);
        }
    };

    // 觸控開始
    item.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isScrolling = false;
        
        // 清除之前的滾動超時
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
    }, { passive: true });

    // 觸控移動
    item.addEventListener('touchmove', (e) => {
        touchEndY = e.touches[0].clientY;
        const touchDiff = Math.abs(touchEndY - touchStartY);
        
        // 如果垂直移動距離超過10px，認為是滾動
        if (touchDiff > 10) {
            isScrolling = true;
        }
    }, { passive: true });

    // 觸控結束
    item.addEventListener('touchend', (e) => {
        touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        const touchDiff = Math.abs(touchEndY - touchStartY);
        
        // 如果觸控時間短於300ms且移動距離小於10px，認為是點擊
        if (touchDuration < 300 && touchDiff < 10 && !isScrolling) {
            e.preventDefault();
            handleItemClick();
        }
        
        // 延遲重置滾動狀態，防止快速連續觸控
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 100);
    });

    // 保留滑鼠點擊事件
    item.addEventListener('click', handleItemClick);
});

if (videoCloseBtn) {
    videoCloseBtn.addEventListener('click', closeLightbox);
    videoCloseBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        closeLightbox();
    });
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    
    // 支援 ESC 鍵關閉燈箱
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

// 社交媒體連結處理
const socialLinks = document.querySelectorAll('.social-link');

socialLinks.forEach(link => {
    const handleSocialClick = (e) => {
        e.preventDefault(); // 防止原本跳轉
        const url = link.href; // 直接使用 HTML href
        window.open(url, '_blank'); // 新視窗打開
    };

    link.addEventListener('click', handleSocialClick);
    link.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleSocialClick(e);
    });
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
        // 如果是滾動狀態，不觸發點擊事件
        if (isScrolling) {
            return;
        }
        
        const title = card.querySelector('h3').textContent;
        console.log(`點擊了部落格文章: ${title}`);
        // 這裡可以導向詳細的部落格頁面
    };

    // 觸控開始
    card.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isScrolling = false;
        
        // 清除之前的滾動超時
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
    }, { passive: true });

    // 觸控移動
    card.addEventListener('touchmove', (e) => {
        touchEndY = e.touches[0].clientY;
        const touchDiff = Math.abs(touchEndY - touchStartY);
        
        // 如果垂直移動距離超過10px，認為是滾動
        if (touchDiff > 10) {
            isScrolling = true;
        }
    }, { passive: true });

    // 觸控結束
    card.addEventListener('touchend', (e) => {
        touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        const touchDiff = Math.abs(touchEndY - touchStartY);
        
        // 如果觸控時間短於300ms且移動距離小於10px，認為是點擊
        if (touchDuration < 300 && touchDiff < 10 && !isScrolling) {
            e.preventDefault();
            handleBlogClick();
        }
        
        // 延遲重置滾動狀態，防止快速連續觸控
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 100);
    });

    // 保留滑鼠點擊事件
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
    
    // 顯示/隱藏按鈕
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    
    // 點擊返回頂部
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    backToTop.addEventListener('click', scrollToTop);
    backToTop.addEventListener('touchend', (e) => {
        e.preventDefault();
        scrollToTop();
    });
    
    // 懸停效果
    backToTop.addEventListener('mouseenter', () => {
        backToTop.style.background = '#2980b9';
        backToTop.style.transform = 'translateY(-3px)';
    });
    
    backToTop.addEventListener('mouseleave', () => {
        backToTop.style.background = '#3498db';
        backToTop.style.transform = 'translateY(0)';
    });
};

// 初始化返回頂部按鈕
createBackToTopButton();

// 載入動畫與 LOGO 片頭一次播放邏輯
window.addEventListener('load', () => {
    document.body.style.opacity = '1';

    const loader = document.getElementById('page-loader');
    const intro = document.getElementById('intro-video');
    const hero = document.getElementById('hero-bg-video');

    // 先暫停背景影片，確保 LOGO 播完再開始
    if (hero && !hero.paused) {
        try { hero.pause(); } catch (_) {}
    }

    const hideLoaderAndStartHero = () => {
        if (loader) {
            loader.classList.add('hide');
            setTimeout(() => {
                loader.parentNode && loader.parentNode.removeChild(loader);
            }, 450);
        }
        if (hero) {
            const p = hero.play();
            if (p && typeof p.then === 'function') {
                p.catch(() => {});
            }
        }
    };

    // 安全機制：4.8 秒後強制結束（影片 4.5s，稍留緩衝）
    const safetyTimeoutId = setTimeout(hideLoaderAndStartHero, 2500);

    if (intro) {
        // 監聽播放結束
        intro.addEventListener('ended', () => {
            clearTimeout(safetyTimeoutId);
            hideLoaderAndStartHero();
        }, { once: true });

        // 嘗試播放 LOGO 影片（靜音 + autoplay 應可在多數瀏覽器啟動）
        const tryPlayIntro = () => {
            const playPromise = intro.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.catch(() => {
                    // 自動播放被阻擋時，改用保險計時結束
                });
            }
        };
        if (intro.readyState >= 3) {
            tryPlayIntro();
        } else {
            intro.addEventListener('canplaythrough', tryPlayIntro, { once: true });
        }
    } else {
        // 沒有 LOGO 影片元素時，直接開始背景影片
        hideLoaderAndStartHero();
    }
});

// 頁面載入時的淡入效果
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';

// 防止雙擊縮放（iOS）
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// 平面攝影：資料夾卡片展開/收合
const initFolderCards = () => {
    const folderItems = document.querySelectorAll('.portfolio-item.folder');
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
        imageLightbox.addEventListener('click', (e) => {
            if (e.target === imageLightbox) closeImageLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && imageLightbox.classList.contains('active')) {
                closeImageLightbox();
            }
        });
    }

    folderItems.forEach(item => {
        const cta = item.querySelector('.folder-cta');
        const galleryImgs = Array.from(item.querySelectorAll('.folder-gallery img')).map(img => img.src);
        const title = item.querySelector('.folder-title')?.textContent || '平面攝影';
        if (!cta) return;
        const handleOpen = (e) => {
            e.preventDefault();
            e.stopPropagation();
            openImageLightbox(galleryImgs, title);
        };
        cta.addEventListener('click', handleOpen);
        cta.addEventListener('touchend', handleOpen);
    });
};

// 以事件委派確保動態內容也能開啟燈箱
window.addEventListener('load', () => {
    initFolderCards();
    document.addEventListener('click', (e) => {
        const cta = e.target.closest('.folder-cta');
        if (!cta) return;
        e.preventDefault();
        const card = cta.closest('.portfolio-item.folder');
        if (!card) return;
        const images = Array.from(card.querySelectorAll('.folder-gallery img')).map(img => img.src);
        const imageLightbox = document.getElementById('image-lightbox');
        const imageGallery = document.getElementById('image-gallery');
        if (!imageLightbox || !imageGallery) return;
        imageGallery.innerHTML = '';
        images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = '參考照片';
            img.loading = 'lazy';
            imageGallery.appendChild(img);
        });
        imageLightbox.classList.add('active');
        imageLightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    });
});

