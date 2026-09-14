/* ==========================================================================
   KhataCopilot — Adaptive Cinematic Motion & Responsive Engine (app.js)
   - Dynamic Chapter HUD Auto-Hide (Fades out when leaving Film Chapters)
   - Clean Navbar Navigation (Pure Text, Zero Number Clutter)
   - Responsive Canvas Engine with Adaptive DPR (Mobile, Tablet, Desktop, 4K)
   - 100% Star Watermark Elimination across All Aspect Ratios
   - Orientation Change Auto-Recalculation
   - Verified WhatsApp Contact (+91 78419 38644)
   - Trust Flow, Editorial FAQ Accordion, and Footer Signature Line
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 768px)").matches;

  // ------------------------------------------------------------------------
  // 1. DOM REFERENCES
  // ------------------------------------------------------------------------
  var loadingScreen = document.getElementById("loadingScreen"),
      loadingBeam = document.getElementById("loadingBeam"),
      loadingLogoLockup = document.getElementById("loadingLogoLockup"),
      loadingPillars = document.getElementById("loadingPillars"),
      skipLoadingBtn = document.getElementById("skipLoadingBtn"),
      timelineBar = document.getElementById("scrollTimeline"),
      navHud = document.getElementById("navHud"),
      navBurger = document.getElementById("navBurger"),
      mobileNav = document.getElementById("mobileNavPanel"),
      chapterHud = document.getElementById("chapterHud"),
      hudCounter = document.getElementById("hudCounter"),
      hudTitle = document.getElementById("hudTitle"),
      hudBarFill = document.getElementById("hudBarFill"),
      trustSequence = document.getElementById("trustSequence"),
      footerSigLine = document.getElementById("footerSigLine"),
      filmContainer = document.getElementById("filmContainer");

  var chapterTracks = Array.prototype.slice.call(document.querySelectorAll(".chapter-track"));
  var currentActiveChapter = 1;
  var isLoaded = false;

  // ------------------------------------------------------------------------
  // 2. BRANDED LOADING & LOGO REVEAL SEQUENCE
  // ------------------------------------------------------------------------
  function dismissLoadingScreen() {
    if (!loadingScreen || loadingScreen.classList.contains("dismissed")) return;
    loadingScreen.classList.add("dismissed");
    document.body.classList.remove("is-loading");
    isLoaded = true;

    setTimeout(function () {
      updateTrackCache();
      handleScroll();
    }, 300);
  }

  function initLoadingSequence() {
    if (!loadingScreen) {
      isLoaded = true;
      return;
    }

    document.body.classList.add("is-loading");

    if (reduceMotion) {
      setTimeout(dismissLoadingScreen, 200);
      return;
    }

    // Step 1: Purple light beam sweeps across screen
    setTimeout(function () {
      if (loadingBeam) loadingBeam.classList.add("active");
    }, 150);

    // Step 2: Authentic KhataCopilot K Logo reveals with radiant glow
    setTimeout(function () {
      if (loadingLogoLockup) loadingLogoLockup.classList.add("reveal");
    }, 600);

    // Step 3: Subtle BILL · TRACK · MANAGE · GROW reveal
    setTimeout(function () {
      if (loadingPillars) loadingPillars.classList.add("reveal");
    }, 1200);

    // Step 4: Graceful expansion into main cinematic frame
    setTimeout(function () {
      dismissLoadingScreen();
    }, 2400);

    // Click anywhere to enter instantly
    if (skipLoadingBtn) {
      skipLoadingBtn.addEventListener("click", dismissLoadingScreen);
    }
    loadingScreen.addEventListener("click", dismissLoadingScreen);
  }

  // ------------------------------------------------------------------------
  // 3. ADAPTIVE CANVAS FRAME SCRUBBER ENGINE (MOBILE & DESKTOP)
  // ------------------------------------------------------------------------
  var CanvasScrubber = function (canvasEl, folderId) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext("2d", { alpha: false });
    this.folder = String(folderId);
    this.totalFrames = 50;
    this.images = [];
    this.loaded = [];
    this.currentProgress = 0;
    this.targetProgress = 0;
    this.lastDrawn = -1;
    this.isVisible = true;

    this.init();
  };

  CanvasScrubber.prototype.getFrameUrl = function (index) {
    var num = String(index + 1).padStart(3, "0");
    return "assets/frames/" + this.folder + "/ezgif-frame-" + num + ".png";
  };

  CanvasScrubber.prototype.init = function () {
    var self = this;
    // Priority preloading: Key frames loaded first for instantaneous visual paint
    var priority = [0, 12, 24, 36, 49];
    priority.forEach(function (idx) {
      self.preloadSingle(idx);
    });

    // Progressive secondary preload of all other frames in idle slices
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(function () {
        self.preloadRemaining(priority);
      });
    } else {
      setTimeout(function () {
        self.preloadRemaining(priority);
      }, 400);
    }

    this.resize();
  };

  CanvasScrubber.prototype.preloadRemaining = function (priorityList) {
    var self = this;
    for (var i = 0; i < this.totalFrames; i++) {
      if (priorityList.indexOf(i) === -1) {
        (function (idx) {
          setTimeout(function () {
            self.preloadSingle(idx);
          }, idx * 12);
        })(i);
      }
    }
  };

  CanvasScrubber.prototype.preloadSingle = function (idx) {
    if (this.images[idx]) return;
    var self = this;
    var img = new Image();
    img.src = this.getFrameUrl(idx);
    img.onload = function () {
      self.loaded[idx] = true;
      if (idx === 0 && self.lastDrawn === -1) {
        self.draw(0);
      } else if (Math.round(self.currentProgress * (self.totalFrames - 1)) === idx) {
        self.draw(idx);
      }
    };
    this.images[idx] = img;
  };

  CanvasScrubber.prototype.resize = function () {
    var rect = this.canvas.getBoundingClientRect();
    // Intelligent DPR capping: 1.5 on mobile to conserve GPU memory, 2 on desktop
    var maxDpr = window.innerWidth < 768 ? 1.5 : 2;
    var dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    this.canvas.width = Math.max(Math.round(rect.width * dpr), 280);
    this.canvas.height = Math.max(Math.round(rect.height * dpr), 160);
    if (this.lastDrawn >= 0) {
      this.draw(this.lastDrawn);
    }
  };

  CanvasScrubber.prototype.setProgress = function (progress) {
    this.targetProgress = Math.max(0, Math.min(1, progress));
  };

  CanvasScrubber.prototype.updateAndDraw = function () {
    if (!this.isVisible) return;
    // Silky smooth inertia interpolation (0.09 lerp factor)
    var diff = this.targetProgress - this.currentProgress;
    if (Math.abs(diff) > 0.0005) {
      this.currentProgress += diff * 0.09;
    } else {
      this.currentProgress = this.targetProgress;
    }

    var frameIndex = Math.min(Math.floor(this.currentProgress * this.totalFrames), this.totalFrames - 1);
    frameIndex = Math.max(0, frameIndex);

    if (frameIndex !== this.lastDrawn) {
      this.draw(frameIndex);
    }
  };

  CanvasScrubber.prototype.draw = function (frameIndex) {
    var img = this.images[frameIndex];
    if (!img || !this.loaded[frameIndex]) {
      // Nearest loaded fallback frame
      for (var d = 1; d < this.totalFrames; d++) {
        if (frameIndex - d >= 0 && this.loaded[frameIndex - d]) {
          img = this.images[frameIndex - d];
          break;
        }
        if (frameIndex + d < this.totalFrames && this.loaded[frameIndex + d]) {
          img = this.images[frameIndex + d];
          break;
        }
      }
    }
    if (!img) return;

    this.lastDrawn = frameIndex;
    var cw = this.canvas.width;
    var ch = this.canvas.height;
    var iw = img.naturalWidth || 1920;
    var ih = img.naturalHeight || 1080;

    // ====================================================================
    // CRITICAL: 100% STAR WATERMARK ELIMINATION
    // The faint 4-pointed star watermark sits at (x ≈ 1680-1800, y ≈ 870-980).
    // By taking source height sh = 908 (cropping the bottom 172px),
    // the watermark at y >= 870 is NEVER rendered onto the canvas!
    // ====================================================================
    var srcX = 0;
    var srcY = 0;
    var srcW = iw;
    var srcH = ih - 172; // 908px height - 100% watermark-free

    var scale = Math.max(cw / srcW, ch / srcH);
    if (ch > cw * 1.05) {
      scale = (ch / srcH) * 1.04;
    }

    var dw = srcW * scale;
    var dh = srcH * scale;
    var dx = (cw - dw) / 2;
    var dy = (ch - dh) / 2;

    this.ctx.drawImage(img, srcX, srcY, srcW, srcH, dx, dy, dw, dh);
  };

  // Initialize all CanvasScrubbers
  var scrubbers = [];
  document.querySelectorAll(".scrub-canvas").forEach(function (canvas) {
    var folder = canvas.getAttribute("data-folder");
    if (folder) {
      var sc = new CanvasScrubber(canvas, folder);
      scrubbers.push(sc);
    }
  });

  // ------------------------------------------------------------------------
  // 4. ZERO-LAYOUT-THRASHING HIGH-PERFORMANCE SCROLL CONTROLLER
  // ------------------------------------------------------------------------
  var cachedTracks = [];
  var filmBottomOffset = 0;

  function updateTrackCache() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    cachedTracks = chapterTracks.map(function (track, idx) {
      var rect = track.getBoundingClientRect();
      var top = scrollY + rect.top;
      var height = track.offsetHeight;
      var scrollable = Math.max(height - window.innerHeight, 1);
      var canvas = track.querySelector(".scrub-canvas");
      var kineticWords = track.querySelectorAll(".kinetic-word");
      var scrubber = null;
      if (canvas) {
        for (var k = 0; k < scrubbers.length; k++) {
          if (scrubbers[k].canvas === canvas) {
            scrubber = scrubbers[k];
            break;
          }
        }
      }
      return {
        el: track,
        top: top,
        height: height,
        scrollable: scrollable,
        scrubber: scrubber,
        kineticWords: kineticWords,
        chapterNum: parseInt(track.getAttribute("data-chapter") || (idx + 1), 10),
        chapterName: track.getAttribute("data-name") || "CHAPTER " + (idx + 1)
      };
    });

    if (filmContainer) {
      var filmRect = filmContainer.getBoundingClientRect();
      filmBottomOffset = scrollY + filmRect.bottom;
    } else if (cachedTracks.length > 0) {
      var lastTrack = cachedTracks[cachedTracks.length - 1];
      filmBottomOffset = lastTrack.top + lastTrack.height;
    }
  }

  function handleScroll() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var globalProgress = docHeight > 0 ? scrollY / docHeight : 0;

    // 1. Update Global Progress Timeline Bar
    if (timelineBar) {
      timelineBar.style.width = (globalProgress * 100).toFixed(2) + "%";
    }

    // 2. Navbar elevation on scroll
    if (navHud) {
      if (scrollY > 40) {
        navHud.classList.add("scrolled");
      } else {
        navHud.classList.remove("scrolled");
      }
    }

    // 3. Process each chapter's progress from CACHED metrics (Zero reflows!)
    var activeChapterNum = 1;
    var activeChapterName = "THE AWAKENING";

    for (var i = 0; i < cachedTracks.length; i++) {
      var t = cachedTracks[i];
      var localProgress = (scrollY - t.top) / t.scrollable;
      localProgress = Math.max(0, Math.min(1, localProgress));

      var relTop = t.top - scrollY;
      var relBottom = relTop + t.height;

      // Active chapter determination
      if (relTop <= window.innerHeight * 0.45 && relBottom >= window.innerHeight * 0.45) {
        activeChapterNum = t.chapterNum;
        activeChapterName = t.chapterName;
      }

      // Update Scrubber visibility & target progress
      if (t.scrubber) {
        var isNearViewport = relBottom >= -window.innerHeight * 0.5 && relTop <= window.innerHeight * 1.5;
        t.scrubber.isVisible = isNearViewport;
        if (isNearViewport) {
          t.scrubber.setProgress(localProgress);
        }
      }

      // Kinetic typography scroll parallax
      if (t.kineticWords && t.kineticWords.length > 0) {
        var ty = (0.5 - localProgress) * 60;
        var scale = 0.97 + localProgress * 0.06;
        for (var w = 0; w < t.kineticWords.length; w++) {
          t.kineticWords[w].style.transform = "translate3d(0, " + ty.toFixed(1) + "px, 0) scale(" + scale.toFixed(3) + ")";
        }
      }
    }

    // 4. Update Floating Chapter HUD & AUTO-HIDE PAST FILM
    // CRITICAL: Hide HUD when scrolling into Trust, FAQ, Downloads, or Footer!
    var isInFilm = scrollY < (filmBottomOffset - window.innerHeight * 0.35);
    if (chapterHud) {
      if (isInFilm) {
        chapterHud.classList.remove("hud-hidden");
      } else {
        chapterHud.classList.add("hud-hidden");
      }
    }

    if (activeChapterNum !== currentActiveChapter) {
      currentActiveChapter = activeChapterNum;
      var totalChapters = cachedTracks.length;
      if (hudCounter) {
        hudCounter.textContent = (activeChapterNum < 10 ? "0" + activeChapterNum : activeChapterNum) + " / " + (totalChapters < 10 ? "0" + totalChapters : totalChapters);
      }
      if (hudTitle) {
        hudTitle.textContent = activeChapterName;
      }
      if (hudBarFill) {
        hudBarFill.style.width = ((activeChapterNum / totalChapters) * 100).toFixed(1) + "%";
      }

      // Sync active navbar links (text-only without numbers)
      document.querySelectorAll(".n-link").forEach(function (link) {
        var targetCh = parseInt(link.getAttribute("data-target"), 10);
        if (targetCh === activeChapterNum) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
    }

    // 5. Trust Horizontal Sequence Animation
    if (trustSequence) {
      var trustRect = trustSequence.getBoundingClientRect();
      if (trustRect.top <= window.innerHeight * 0.8 && trustRect.bottom >= 0) {
        var trustProg = 1 - (trustRect.bottom / (window.innerHeight * 0.8 + trustRect.height));
        trustProg = Math.max(0, Math.min(1, trustProg));
        var steps = trustSequence.querySelectorAll(".seq-step");
        var activeStep = Math.min(Math.floor(trustProg * steps.length), steps.length - 1);
        steps.forEach(function (step, sIdx) {
          if (sIdx <= activeStep) {
            step.classList.add("active");
          } else {
            step.classList.remove("active");
          }
        });
        var fillLine = trustSequence.querySelector(".seq-line-fill");
        if (fillLine) {
          fillLine.style.width = (trustProg * 100).toFixed(1) + "%";
        }
      }
    }
  }

  // ------------------------------------------------------------------------
  // 5. RAF CONTINUOUS RENDER LOOP
  // ------------------------------------------------------------------------
  function loop() {
    for (var i = 0; i < scrubbers.length; i++) {
      scrubbers[i].updateAndDraw();
    }
    requestAnimationFrame(loop);
  }

  // ------------------------------------------------------------------------
  // 6. EDITORIAL INTERACTIVE FAQ ACCORDION
  // ------------------------------------------------------------------------
  function initFAQ() {
    var items = document.querySelectorAll(".faq-item");
    items.forEach(function (item) {
      var btn = item.querySelector(".faq-question");
      if (btn) {
        btn.addEventListener("click", function () {
          var wasActive = item.classList.contains("active");
          items.forEach(function (other) {
            other.classList.remove("active");
            var otherBtn = other.querySelector(".faq-question");
            if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
          });
          if (!wasActive) {
            item.classList.add("active");
            btn.setAttribute("aria-expanded", "true");
          }
        });
      }
    });
  }

  // ------------------------------------------------------------------------
  // 7. OS AUTO-DETECTION & DOWNLOAD HUB
  // ------------------------------------------------------------------------
  function detectOS() {
    var ua = navigator.userAgent || navigator.vendor || window.opera || "";
    var detected = "windows";
    if (/android/i.test(ua)) detected = "android";
    else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) detected = "ios";
    else if (/Macintosh|Mac OS X/.test(ua)) detected = "macos";
    else if (/Windows/i.test(ua)) detected = "windows";

    var cards = document.querySelectorAll(".dl-card");
    cards.forEach(function (card) {
      if (card.getAttribute("data-os") === detected) {
        card.classList.add("dl-featured");
      } else {
        card.classList.remove("dl-featured");
      }
    });
  }

  // ------------------------------------------------------------------------
  // 8. MOBILE MENU & NAVIGATION DRAWER
  // ------------------------------------------------------------------------
  function initNav() {
    if (navBurger && mobileNav) {
      navBurger.addEventListener("click", function () {
        var isOpen = mobileNav.classList.toggle("open");
        navBurger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      mobileNav.querySelectorAll(".m-link").forEach(function (link) {
        link.addEventListener("click", function () {
          mobileNav.classList.remove("open");
          navBurger.setAttribute("aria-expanded", "false");
        });
      });
    }

    // Smooth scroll for in-page links
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var href = this.getAttribute("href");
        if (href === "#") return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  // ------------------------------------------------------------------------
  // 9. FOOTER SIGNATURE LINE INTERSECTION OBSERVER
  // ------------------------------------------------------------------------
  function initFooterSignature() {
    if (!footerSigLine || !("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          footerSigLine.classList.add("draw");
        }
      });
    }, { threshold: 0.3 });
    observer.observe(footerSigLine);
  }

  // ------------------------------------------------------------------------
  // 10. SUBTLE MOUSE PARALLAX (DESKTOP ONLY, 1-2% MAXIMUM)
  // ------------------------------------------------------------------------
  function initMouseParallax() {
    if (window.matchMedia("(pointer: coarse)").matches || reduceMotion) return;
    var stages = document.querySelectorAll(".hero-stage-frame, .stage-media-box, .finale-visual-box");
    window.addEventListener("mousemove", function (e) {
      var xNorm = (e.clientX / window.innerWidth - 0.5) * 2;
      var yNorm = (e.clientY / window.innerHeight - 0.5) * 2;
      var rotY = xNorm * 1.5;
      var rotX = -yNorm * 1.5;
      stages.forEach(function (st) {
        st.style.transform = "perspective(1200px) rotateX(" + rotX.toFixed(2) + "deg) rotateY(" + rotY.toFixed(2) + "deg)";
      });
    }, { passive: true });
  }

  // ------------------------------------------------------------------------
  // 10B. PREMIUM STUDIO CUSTOM CURSOR & MAGNETIC CTA (DESKTOP ONLY)
  // ------------------------------------------------------------------------
  function initCursor() {
    if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 900) return;
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    if (!dot || !ring) return;

    var mouseX = -100, mouseY = -100;
    var ringX = -100, ringY = -100;
    var isVisible = false;

    window.addEventListener("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        ringX = mouseX;
        ringY = mouseY;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      dot.style.transform = "translate3d(" + mouseX + "px, " + mouseY + "px, 0) translate(-50%, -50%)";
    }, { passive: true });

    window.addEventListener("mouseleave", function () {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
      isVisible = false;
    });

    function renderCursor() {
      if (isVisible) {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.transform = "translate3d(" + ringX.toFixed(2) + "px, " + ringY.toFixed(2) + "px, 0) translate(-50%, -50%)";
      }
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Interactive Hover States
    document.querySelectorAll("a, button, .btn, .nav-item, .faq-question").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        if (el.classList.contains("btn") || el.tagName === "BUTTON") {
          document.body.classList.add("cursor-hover-btn");
        } else {
          document.body.classList.add("cursor-hover-link");
        }
      });
      el.addEventListener("mouseleave", function () {
        document.body.classList.remove("cursor-hover-btn", "cursor-hover-link");
      });
    });

    document.querySelectorAll(".stage-media-box, .hero-stage-frame").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        document.body.classList.add("cursor-hover-media");
      });
      el.addEventListener("mouseleave", function () {
        document.body.classList.remove("cursor-hover-media");
      });
    });

    // Magnetic CTA Button Movement (3-6px toward cursor)
    var magneticBtns = document.querySelectorAll(".btn.solid.glow, .nav-cta");
    magneticBtns.forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var relX = e.clientX - (rect.left + rect.width / 2);
        var relY = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = "translate3d(" + (relX * 0.16).toFixed(1) + "px, " + (relY * 0.16).toFixed(1) + "px, 0)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "translate3d(0, 0, 0)";
      });
    });
  }

  // ------------------------------------------------------------------------
  // 11. ORIENTATION & RESIZE HANDLING
  // ------------------------------------------------------------------------
  function onResizeOrOrientation() {
    isMobile = window.matchMedia("(max-width: 768px)").matches;
    scrubbers.forEach(function (sc) { sc.resize(); });
    updateTrackCache();
    handleScroll();
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", onResizeOrOrientation, { passive: true });
  window.addEventListener("orientationchange", function () {
    setTimeout(onResizeOrOrientation, 200);
  });

  // Boot sequence
  initLoadingSequence();
  initNav();
  initFAQ();
  detectOS();
  initFooterSignature();
  initMouseParallax();
  initCursor();

  // Initial layout cache and frame render
  updateTrackCache();
  handleScroll();
  requestAnimationFrame(loop);

})();
