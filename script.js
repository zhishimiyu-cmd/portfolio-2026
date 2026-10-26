(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Home background pointer parallax
  const home = document.querySelector(".home");
  if (home && !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let frame = 0;
    let nextX = 0;
    let nextY = 0;
    home.addEventListener("pointermove", (event) => {
      const rect = home.getBoundingClientRect();
      nextX = ((event.clientX - rect.left) / rect.width - 0.5) * 28;
      nextY = ((event.clientY - rect.top) / rect.height - 0.5) * 20;
      const spotX = event.clientX - rect.left;
      const spotY = event.clientY - rect.top;
      home.classList.add("is-pointer-active");
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        home.style.setProperty("--glow-x", `${nextX.toFixed(2)}px`);
        home.style.setProperty("--glow-y", `${nextY.toFixed(2)}px`);
        home.style.setProperty("--spot-x", `${spotX.toFixed(2)}px`);
        home.style.setProperty("--spot-y", `${spotY.toFixed(2)}px`);
      });
    });
    home.addEventListener("pointerleave", () => {
      home.classList.remove("is-pointer-active");
      home.style.setProperty("--glow-x", "0px");
      home.style.setProperty("--glow-y", "0px");
    });
  }

  // Magnetic CTA
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!reduceMotion && finePointer) {
    document.querySelectorAll("[data-magnetic]").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
        element.style.setProperty("--magnet-x", `${Math.max(-4, Math.min(4, x)).toFixed(2)}px`);
        element.style.setProperty("--magnet-y", `${Math.max(-4, Math.min(4, y)).toFixed(2)}px`);
      });
      element.addEventListener("pointerleave", () => {
        element.style.setProperty("--magnet-x", "0px");
        element.style.setProperty("--magnet-y", "0px");
      });
    });
  }

  // Portrait card depth tilt
  const tiltCard = document.querySelector("[data-tilt-card]");
  if (tiltCard && !reduceMotion && finePointer) {
    tiltCard.addEventListener("pointermove", (event) => {
      const rect = tiltCard.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      tiltCard.style.setProperty("--tilt-x", `${(-y * 3).toFixed(2)}deg`);
      tiltCard.style.setProperty("--tilt-y", `${(x * 3).toFixed(2)}deg`);
      tiltCard.classList.add("is-tilting");
    });
    tiltCard.addEventListener("pointerleave", () => {
      tiltCard.style.setProperty("--tilt-x", "0deg");
      tiltCard.style.setProperty("--tilt-y", "0deg");
      tiltCard.classList.remove("is-tilting");
    });
  }

  // Accessible mobile navigation
  document.querySelectorAll(".menu-toggle").forEach((button) => {
    const nav = document.getElementById(button.getAttribute("aria-controls"));
    if (!nav) return;

    const close = () => {
      nav.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
    };

    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      if (open) {
        close();
      } else {
        nav.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
        document.body.classList.add("no-scroll");
      }
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        close();
        button.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1100) close();
    });
  });

  // Scroll-in motion
  const revealItems = document.querySelectorAll(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // Fade project images in as they finish loading
  document.querySelectorAll(".project-slide img, .project-mobile-story img").forEach((image) => {
    const revealImage = () => image.classList.add("is-loaded");
    if (image.complete) revealImage();
    else {
      image.addEventListener("load", revealImage, { once: true });
      image.addEventListener("error", revealImage, { once: true });
    }
  });

  // Pointer-reactive product cards
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".product-card__media").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--ry", `${x * 4}deg`);
        card.style.setProperty("--rx", `${y * -3}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--rx", "0deg");
      });
    });
  }

  // Hover/tap IP animations on 拾光雀 slide 8
  const ipEntries = [...document.querySelectorAll("[data-ip-video]")].map((button) => ({
    button,
    video: button.querySelector("video")
  })).filter((entry) => entry.video);

  if (ipEntries.length) {
    const hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion;

    const reset = (entry) => {
      entry.video.pause();
      try { entry.video.currentTime = 0; } catch {}
      entry.video.muted = true;
      entry.button.setAttribute("aria-pressed", "false");
      entry.button.classList.remove("is-playing");
    };

    const play = async (entry, withSound = true) => {
      ipEntries.forEach((other) => {
        if (other !== entry) reset(other);
      });

      entry.video.volume = 0.8;
      entry.video.muted = !withSound;
      entry.button.setAttribute("aria-pressed", "true");
      entry.button.classList.add("is-playing");

      try {
        await entry.video.play();
      } catch {
        // Hover is not treated as a user gesture in every browser.
        // Fall back to muted autoplay; a click will retry with sound.
        entry.video.muted = true;
        try { await entry.video.play(); } catch {}
      }
    };

    ipEntries.forEach((entry) => {
      if (hoverCapable) {
        entry.button.addEventListener("pointerenter", () => play(entry, true));
        entry.button.addEventListener("pointerleave", () => reset(entry));
        entry.button.addEventListener("focus", () => play(entry, true));
        entry.button.addEventListener("blur", () => reset(entry));
        entry.button.addEventListener("click", () => {
          if (entry.video.paused || entry.video.muted) play(entry, true);
        });
      } else {
        entry.button.addEventListener("click", () => {
          if (entry.video.paused) play(entry, true);
          else reset(entry);
        });
      }
    });
  }

  // Case-study chapter navigation and reading progress
  const detailSlides = [...document.querySelectorAll(".project-detail__slides > .project-slide")];
  if (detailSlides.length > 1) {
    const pad = (value) => String(value).padStart(2, "0");
    detailSlides.forEach((slide, index) => {
      if (!slide.id) slide.id = `case-slide-${pad(index + 1)}`;
      slide.dataset.slideIndex = String(index + 1);
    });
    const mobileStory = document.querySelector("[data-mobile-story]");
    const mobileSections = mobileStory ? [...mobileStory.querySelectorAll("[data-mobile-section]")] : [];
    const useMobileSections = mobileStory && mobileSections.length && window.matchMedia("(max-width: 900px)").matches;
    const progressItems = useMobileSections ? mobileSections : detailSlides;
    const chapterDefs = useMobileSections
      ? [...new Set(progressItems.map((item) => item.dataset.chapterLabel).filter(Boolean))].map((label) => ({ label, start: progressItems.findIndex((item) => item.dataset.chapterLabel === label) }))
      : [
          { label: "概览", start: 0 },
          { label: "背景", start: Math.min(1, detailSlides.length - 1) },
          { label: "方案", start: Math.min(3, detailSlides.length - 1) },
          { label: "复盘", start: detailSlides.length - 1 }
        ];

    const nav = document.createElement("nav");
    nav.className = "case-index";
    nav.setAttribute("aria-label", "项目章节导航");
    nav.innerHTML = `<div class="case-index__count"><strong data-case-current>01</strong><span>/ ${pad(progressItems.length)}</span></div><div class="case-index__track" aria-hidden="true"><span></span></div><div class="case-index__chapters"></div>`;
    const chapters = nav.querySelector(".case-index__chapters");
    chapterDefs.forEach((chapter) => {
      const link = document.createElement("a");
      link.href = `#${progressItems[chapter.start].id}`;
      link.textContent = chapter.label;
      link.dataset.chapterStart = String(chapter.start);
      link.setAttribute("aria-label", `跳转到${chapter.label}部分`);
      chapters.append(link);
    });
    document.body.append(nav);

    const currentLabel = nav.querySelector("[data-case-current]");
    const chapterLinks = [...chapters.querySelectorAll("a")];
    const footer = document.querySelector(".footer-cta");
    let ticking = false;
    let lastScrollPosition = window.scrollY;

    const updateCaseProgress = () => {
      ticking = false;
      const markerY = window.scrollY + window.innerHeight * 0.42;
      let activeIndex = 0;
      progressItems.forEach((item, index) => {
        const top = item.getBoundingClientRect().top + window.scrollY;
        if (top <= markerY) activeIndex = index;
      });

      let activeChapter = 0;
      for (let i = 0; i < chapterDefs.length; i += 1) {
        if (activeIndex >= chapterDefs[i].start) activeChapter = i;
      }

      const nextLabel = pad(activeIndex + 1);
      if (currentLabel.textContent !== nextLabel) {
        currentLabel.textContent = nextLabel;
        if (!reduceMotion) {
          currentLabel.classList.remove("is-changing");
          void currentLabel.offsetWidth;
          currentLabel.classList.add("is-changing");
        }
      }
      nav.style.setProperty("--case-progress", String((activeIndex + 1) / progressItems.length));
      chapterLinks.forEach((link, index) => {
        if (index === activeChapter) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });

      const atFooter = footer && footer.getBoundingClientRect().top < window.innerHeight * 0.8;
      const scrollingDown = window.scrollY > lastScrollPosition + 4;
      const scrollingUp = window.scrollY < lastScrollPosition - 4;
      const hideForDirection = scrollingDown && window.scrollY > window.innerHeight * 0.5;
      if (atFooter || hideForDirection) nav.classList.add("is-hidden");
      else if (scrollingUp || window.scrollY < 80) nav.classList.remove("is-hidden");
      lastScrollPosition = window.scrollY;
    };

    const requestCaseUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateCaseProgress);
    };

    window.addEventListener("scroll", requestCaseUpdate, { passive: true });
    window.addEventListener("resize", requestCaseUpdate);
    updateCaseProgress();
  }

  // Mobile story carousels
  document.querySelectorAll("[data-story-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".story-carousel__track");
    const cards = [...track.querySelectorAll(".story-card")];
    const current = carousel.querySelector("[data-carousel-current]");
    const previous = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    if (!cards.length) return;
    let ticking = false;

    const activeIndex = () => {
      const trackLeft = track.getBoundingClientRect().left;
      let bestIndex = 0;
      let bestDistance = Infinity;
      cards.forEach((card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().left - trackLeft);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });
      return bestIndex;
    };

    const update = () => {
      ticking = false;
      const index = activeIndex();
      current.textContent = String(index + 1).padStart(2, "0");
      previous.disabled = index === 0;
      next.disabled = index === cards.length - 1;
    };

    const scrollToCard = (index) => {
      const target = cards[Math.max(0, Math.min(cards.length - 1, index))];
      track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
    };

    previous.addEventListener("click", () => scrollToCard(activeIndex() - 1));
    next.addEventListener("click", () => scrollToCard(activeIndex() + 1));
    track.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  });

  // Mobile design-slide reader
  if (detailSlides.length) {
    const viewer = document.createElement("dialog");
    viewer.className = "slide-viewer";
    viewer.setAttribute("aria-label", "项目设计稿查看器");
    viewer.innerHTML = `
      <div class="slide-viewer__layout">
        <div class="slide-viewer__bar">
          <button class="viewer-btn viewer-btn--close" type="button" data-viewer-close aria-label="关闭查看器">×</button>
          <p class="slide-viewer__meta"><strong data-viewer-index>01</strong> / <span data-viewer-total></span></p>
          <div class="slide-viewer__controls">
            <button class="viewer-btn" type="button" data-viewer-out aria-label="缩小">−</button>
            <button class="viewer-btn" type="button" data-viewer-fit aria-label="适配屏幕">适配</button>
            <button class="viewer-btn" type="button" data-viewer-in aria-label="放大">＋</button>
          </div>
        </div>
        <div class="slide-viewer__stage" data-viewer-stage>
          <img class="slide-viewer__image" data-viewer-image alt="">
        </div>
        <div>
          <p class="slide-viewer__hint">使用 ＋ / − 放大，拖动画面查看设计细节</p>
          <div class="slide-viewer__nav">
            <button class="viewer-btn" type="button" data-viewer-prev aria-label="上一屏">← 上一屏</button>
            <button class="viewer-btn" type="button" data-viewer-next aria-label="下一屏">下一屏 →</button>
          </div>
        </div>
      </div>`;
    document.body.append(viewer);

    const image = viewer.querySelector("[data-viewer-image]");
    const stage = viewer.querySelector("[data-viewer-stage]");
    const currentIndex = viewer.querySelector("[data-viewer-index]");
    const totalLabel = viewer.querySelector("[data-viewer-total]");
    const fitButton = viewer.querySelector("[data-viewer-fit]");
    const previousButton = viewer.querySelector("[data-viewer-prev]");
    const nextButton = viewer.querySelector("[data-viewer-next]");
    const zoomOutButton = viewer.querySelector("[data-viewer-out]");
    const zoomInButton = viewer.querySelector("[data-viewer-in]");
    const slideImages = detailSlides.map((slide) => slide.querySelector(".project-slide__bg, img"));
    let viewerIndex = 0;
    let viewerScale = 2;

    totalLabel.textContent = String(detailSlides.length).padStart(2, "0");

    const centerViewer = () => {
      window.requestAnimationFrame(() => {
        stage.scrollLeft = Math.max(0, (stage.scrollWidth - stage.clientWidth) / 2);
        stage.scrollTop = 0;
      });
    };

    const setScale = (nextScale, preserveCenter = true) => {
      const previousWidth = stage.scrollWidth || 1;
      const centerX = (stage.scrollLeft + stage.clientWidth / 2) / previousWidth;
      viewerScale = Math.max(1, Math.min(5, nextScale));
      image.style.width = `${viewerScale * 100}%`;
      fitButton.textContent = viewerScale === 1 ? "适配" : `${Math.round(viewerScale * 100)}%`;
      zoomOutButton.disabled = viewerScale === 1;
      zoomInButton.disabled = viewerScale === 5;
      window.requestAnimationFrame(() => {
        if (preserveCenter) {
          stage.scrollLeft = Math.max(0, centerX * stage.scrollWidth - stage.clientWidth / 2);
        } else {
          centerViewer();
        }
      });
    };

    const showSlide = (index) => {
      viewerIndex = Math.max(0, Math.min(detailSlides.length - 1, index));
      const source = slideImages[viewerIndex];
      image.src = source.currentSrc || source.src;
      image.alt = source.alt || `项目详情第 ${viewerIndex + 1} 屏`;
      currentIndex.textContent = String(viewerIndex + 1).padStart(2, "0");
      previousButton.disabled = viewerIndex === 0;
      nextButton.disabled = viewerIndex === detailSlides.length - 1;
      setScale(viewerScale, false);
    };

    const openViewer = (index) => {
      showSlide(index);
      document.body.classList.add("no-scroll");
      if (typeof viewer.showModal === "function") viewer.showModal();
      else viewer.setAttribute("open", "");
      viewer.querySelector("[data-viewer-close]").focus();
    };

    detailSlides.forEach((slide, index) => {
      if (slide.querySelector(".slide-zoom-trigger")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "slide-zoom-trigger";
      button.textContent = "查看细节";
      button.setAttribute("aria-label", `放大查看第 ${index + 1} 屏设计稿`);
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openViewer(index);
      });
      slide.append(button);
    });

    viewer.querySelector("[data-viewer-close]").addEventListener("click", () => viewer.close());
    zoomOutButton.addEventListener("click", () => setScale(viewerScale - 0.5));
    zoomInButton.addEventListener("click", () => setScale(viewerScale + 0.5));
    fitButton.addEventListener("click", () => setScale(1, false));
    previousButton.addEventListener("click", () => showSlide(viewerIndex - 1));
    nextButton.addEventListener("click", () => showSlide(viewerIndex + 1));
    let touchStart = null;
    let lastTapAt = 0;

    stage.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      touchStart = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    }, { passive: true });

    stage.addEventListener("touchend", (event) => {
      if (!touchStart || event.changedTouches.length !== 1) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      const elapsed = Date.now() - touchStart.time;
      const now = Date.now();

      if (viewerScale <= 1.05 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        showSlide(viewerIndex + (dx < 0 ? 1 : -1));
      } else if (Math.abs(dx) < 16 && Math.abs(dy) < 16 && elapsed < 260) {
        if (now - lastTapAt < 320) {
          setScale(viewerScale > 1.05 ? 1 : 2, viewerScale <= 1.05);
          lastTapAt = 0;
        } else {
          lastTapAt = now;
        }
      }
      touchStart = null;
    }, { passive: true });

    viewer.addEventListener("close", () => {
      document.body.classList.remove("no-scroll");
    });
    viewer.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") showSlide(viewerIndex - 1);
      if (event.key === "ArrowRight") showSlide(viewerIndex + 1);
      if (event.key === "+" || event.key === "=") setScale(viewerScale + 0.5);
      if (event.key === "-") setScale(viewerScale - 0.5);
    });
  }

  // Product shortcuts keep the filter bar state in sync
  const filterBar = document.querySelector(".filter-bar");
  const activeFilter = filterBar?.querySelector(".filter-link.is-active");
  if (filterBar && activeFilter && filterBar.scrollWidth > filterBar.clientWidth) {
    window.requestAnimationFrame(() => {
      const barRect = filterBar.getBoundingClientRect();
      const itemRect = activeFilter.getBoundingClientRect();
      filterBar.scrollLeft += itemRect.left - barRect.left - (filterBar.clientWidth - itemRect.width) / 2;
    });
  }

  document.querySelectorAll(".filter-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".filter-link").forEach((item) => item.classList.remove("is-active"));
      link.classList.add("is-active");
    });
  });
})();
