/* KhataCopilot site interactions — no deps. Respects prefers-reduced-motion. */
(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* scroll progress bar + timeline fill */
  var bar = document.getElementById("progress"),
      nav = document.getElementById("nav"),
      tline = document.getElementById("timeline"),
      tfill = document.getElementById("tfill");
  function onScroll(){
    var h = document.documentElement,
        p = h.scrollTop / Math.max(h.scrollHeight - h.clientHeight, 1);
    if(bar) bar.style.width = (p*100).toFixed(2) + "%";
    if(tline && tfill){
      var r = tline.getBoundingClientRect(),
          seen = Math.min(Math.max((innerHeight*0.65 - r.top) / r.height, 0), 1);
      tfill.style.height = (seen*100).toFixed(1) + "%";
    }
    if(nav) nav.style.boxShadow = scrollY > 8 ? "0 8px 24px -16px rgba(25,20,16,.4)" : "none";
  }
  addEventListener("scroll", onScroll, {passive:true}); onScroll();

  /* hero-stage parallax (fine pointers only) */
  var stage = document.querySelector(".hero-stage");
  if(stage && !reduce && matchMedia("(fine: pointer)").matches){
    var hero = document.querySelector(".hero");
    hero.addEventListener("mousemove", function(e){
      var r = hero.getBoundingClientRect(),
          x = (e.clientX - r.left) / r.width - .5,
          y = (e.clientY - r.top) / r.height - .5;
      stage.style.transform = "translate("+(x*14).toFixed(1)+"px,"+(y*10).toFixed(1)+"px)";
    });
    hero.addEventListener("mouseleave", function(){ stage.style.transform = ""; });
    /* magnetic primary buttons */
    document.querySelectorAll(".hero-actions .btn.solid, .oscard .btn.solid").forEach(function(b){
      b.addEventListener("mousemove", function(e){
        var r = b.getBoundingClientRect();
        b.style.transform = "translate("+((e.clientX-r.left-r.width/2)*.12).toFixed(1)+"px,"+((e.clientY-r.top-r.height/2)*.18).toFixed(1)+"px)";
      });
      b.addEventListener("mouseleave", function(){ b.style.transform = ""; });
    });
  }

  /* mobile menu */
  var burger = document.getElementById("burger"), mm = document.getElementById("mobilemenu");
  if(burger && mm){
    burger.addEventListener("click", function(){
      var open = mm.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mm.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", function(){
      mm.classList.remove("open"); burger.setAttribute("aria-expanded", "false");
    }); });
    /* rotating to landscape / resizing to desktop must not trap the menu */
    addEventListener("resize", function(){
      if(innerWidth > 900){ mm.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
    });
  }

  /* scroll reveal (with fallback: text must never stay invisible) */
  var revealEls = document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){
    revealEls.forEach(function(el){ el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
    }, {threshold:.08});
    revealEls.forEach(function(el){ io.observe(el); });
    /* safety net: reveal anything still hidden after 4s (e.g. odd embeds) */
    setTimeout(function(){
      revealEls.forEach(function(el){
        var r = el.getBoundingClientRect();
        if(r.top < innerHeight && r.bottom > 0) el.classList.add("in");
      });
    }, 4000);
  }

  /* animated counters */
  var cio = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return; cio.unobserve(e.target);
      var el = e.target, target = +el.dataset.count, t0 = null;
      if(reduce){ el.textContent = target; return; }
      function step(t){ if(!t0) t0 = t; var p = Math.min((t-t0)/1400, 1);
        el.textContent = Math.round(target * (1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  }, {threshold:.6});
  document.querySelectorAll("[data-count]").forEach(function(el){ cio.observe(el); });

  /* OS detection -> highlight card + hero label */
  var ua = navigator.userAgent || "", plat = (navigator.platform || "").toLowerCase();
  var os = "unknown", label = "your device";
  if(/android/i.test(ua)){ os="android"; label="Android"; }
  else if(/iPad|iPhone|iPod/.test(ua) || (plat==="macintel" && navigator.maxTouchPoints>1)){ os="ios"; label="iOS"; }
  else if(/Win/.test(plat) || /Windows/.test(ua)){ os="windows"; label="Windows"; }
  else if(/Mac/.test(plat)){ os="macos"; label="macOS"; }
  else if(/Linux/.test(plat)){ os="linux"; label="Linux"; }
  var note = document.getElementById("osNote"), heroOs = document.getElementById("heroOs"), heroBtn = document.getElementById("heroDownload");
  var card = document.querySelector('.oscard[data-os="'+os+'"]');
  if(card){
    card.classList.add("you");
    var b = card.querySelector(".badge"); if(b) b.textContent += " · yours";
    if(note) note.innerHTML = "Looks like you're on <strong>"+label+"</strong> — we've highlighted your card below. Test builds are <strong>v1.0.0</strong>; signed store releases follow after the audit fixes land.";
    if(heroBtn && (os==="android" || os==="windows")){
      heroBtn.target = "_blank";
      heroBtn.rel = "noopener noreferrer";
    }
    if(heroBtn && os==="android") heroBtn.href = "https://github.com/Quantum-Ark/khatacopilot-releases/releases/download/v1.0.0/KhataCopilot-1.0.0-android.apk";
    if(heroBtn && os==="windows") heroBtn.href = "https://github.com/Quantum-Ark/khatacopilot-releases/releases/download/v1.0.0/KhataCopilot-Setup-1.0.0.exe";
  }

  /* install-steps toggles */
  document.querySelectorAll(".steps-toggle").forEach(function(btn){
    btn.addEventListener("click", function(){
      var steps = btn.closest(".oscard").querySelector(".steps");
      var open = steps.classList.toggle("open");
      btn.textContent = open ? "Hide steps" : "Install steps";
    });
  });

  /* FAQ accordion */
  document.querySelectorAll(".qa").forEach(function(q){
    q.querySelector("button").addEventListener("click", function(){
      var was = q.classList.contains("open");
      document.querySelectorAll(".qa.open").forEach(function(o){ o.classList.remove("open"); });
      if(!was) q.classList.add("open");
    });
  });

  /* phone demo: type ledger lines, confirm, loop */
  var lines = [
    {t:"06:12", d:"Do chai, 2 biscuit — counter sale", a:"+ ₹40", say:"40 rupaye bikri mein jod diya"},
    {t:"06:40", d:"Sharma ji — 5 kg atta, udhaar", a:"₹650 due", say:"650 rupaye udhaar likh diya"},
    {t:"07:02", d:"Ramesh paid 1200 cash — settled", a:"+ ₹1,200", say:"1200 cash jama, hisaab barabar"},
    {t:"07:20", d:"GPay UPI received — verified ✓", a:"+ ₹200", say:"200 rupaye UPI se prapt hue"}
  ];
  var typeEl = document.getElementById("typeText"), ledger = document.getElementById("ledger"),
      confirm = document.getElementById("psConfirm"), micLabel = document.getElementById("micLabel");
  if(typeEl && ledger && !reduce){
    var li = 0;
    function playLine(){
      var L = lines[li % lines.length];
      if(micLabel) micLabel.textContent = "Sun raha hai… “" + L.d + "”";
      var full = L.d + "  →  " + L.a, ci = 0;
      typeEl.textContent = "";
      var typer = setInterval(function(){
        typeEl.textContent = full.slice(0, ++ci);
        if(ci >= full.length){
          clearInterval(typer);
          var row = document.createElement("div");
          row.className = "lrow new";
          row.innerHTML = '<span class="lt"></span><span class="ld"></span><span class="la"></span>';
          row.children[0].textContent = L.t; row.children[1].textContent = L.d; row.children[2].textContent = L.a;
          ledger.appendChild(row);
          while(ledger.children.length > 3) ledger.removeChild(ledger.firstChild);
          if(confirm){ confirm.textContent = "✓ " + L.say; confirm.classList.add("show");
            setTimeout(function(){ confirm.classList.remove("show"); }, 1800); }
          li++; setTimeout(playLine, 2600);
        }
      }, 28);
    }
    setTimeout(playLine, 1200);
  }

  /* timeline progress dots */
  var dots = document.querySelectorAll(".tdot");
  var dio = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.style.background = "#E9B44C"; } });
  }, {threshold:.8});
  dots.forEach(function(d){ dio.observe(d); });

  /* ==========================================================================
     CINEMATIC SCROLL-LINKED HERO SEQUENCE ANIMATION (Apple-level smooth)
     - 50 progressive image frames (ezgif-frame-001.png / frame-001.png)
     - Continuous requestAnimationFrame loop with smooth lerp interpolation
     - High-DPI / Retina canvas scaling + cover containment
     - Seamless background blending
     - Respects prefers-reduced-motion
     ========================================================================== */
  var heroCanvas = document.getElementById("heroSequenceCanvas");
  var heroTrack = document.getElementById("heroScrollTrack");

  if(heroCanvas && heroTrack){
    var ctx = heroCanvas.getContext("2d");
    var totalFrames = 50;
    var images = new Array(totalFrames);
    var loaded = new Array(totalFrames);
    var targetFrame = 0;
    var currentFrame = 0;
    var lastDrawnFrame = -1;
    var isRenderLoopActive = false;

    // Build frame URL helper (checks primary and fallback naming)
    function getFrameUrl(idx){
      var num = String(idx + 1).padStart(3, "0");
      return "khatapng/ezgif-frame-" + num + ".png";
    }

    // High DPI Canvas resize handler
    function resizeCanvas(){
      if(!heroCanvas) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = heroCanvas.clientWidth || window.innerWidth;
      var h = heroCanvas.clientHeight || window.innerHeight;
      if(heroCanvas.width !== Math.round(w * dpr) || heroCanvas.height !== Math.round(h * dpr)){
        heroCanvas.width = Math.round(w * dpr);
        heroCanvas.height = Math.round(h * dpr);
        lastDrawnFrame = -1; // Force repaint
      }
      drawFrame(Math.round(currentFrame));
    }

    // Render single frame with seamless cover scaling
    function drawFrame(idx){
      if(!ctx || !heroCanvas) return;
      var img = images[idx];
      // If the target frame hasn't finished loading yet, find the nearest loaded frame
      if(!img || !img.complete || img.naturalWidth === 0){
        for(var offset = 1; offset < totalFrames; offset++){
          if(idx - offset >= 0 && images[idx - offset] && images[idx - offset].complete){
            img = images[idx - offset];
            break;
          }
          if(idx + offset < totalFrames && images[idx + offset] && images[idx + offset].complete){
            img = images[idx + offset];
            break;
          }
        }
      }

      if(!img || !img.complete || img.naturalWidth === 0) return;

      var cw = heroCanvas.width;
      var ch = heroCanvas.height;
      var iw = img.naturalWidth;
      var ih = img.naturalHeight;

      // Calculate object-fit: cover scaling
      var scale = Math.max(cw / iw, ch / ih);
      var dw = iw * scale;
      var dh = ih * scale;
      var dx = (cw - dw) * 0.5;
      var dy = (ch - dh) * 0.5;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
      lastDrawnFrame = idx;
    }

    // Calculate exact scroll progress inside the hero track
    function updateScrollProgress(){
      if(reduce){
        targetFrame = 0;
        currentFrame = 0;
        drawFrame(0);
        return;
      }
      var rect = heroTrack.getBoundingClientRect();
      var maxScroll = rect.height - window.innerHeight;
      if(maxScroll <= 0){
        targetFrame = 0;
        return;
      }
      // Distance scrolled past the top of the track
      var scrolled = -rect.top;
      var progress = scrolled / maxScroll;
      if(progress < 0) progress = 0;
      if(progress > 1) progress = 1;

      targetFrame = progress * (totalFrames - 1);
    }

    // Continuous smooth animation loop using lerp interpolation
    function animationLoop(){
      if(!reduce){
        var delta = targetFrame - currentFrame;
        // Apple-style smooth ease: 0.12 factor provides snappy yet silky motion
        if(Math.abs(delta) > 0.001){
          currentFrame += delta * 0.12;
        } else {
          currentFrame = targetFrame;
        }

        var frameToDraw = Math.round(currentFrame);
        if(frameToDraw < 0) frameToDraw = 0;
        if(frameToDraw >= totalFrames) frameToDraw = totalFrames - 1;

        if(frameToDraw !== lastDrawnFrame){
          drawFrame(frameToDraw);
        }
      }

      requestAnimationFrame(animationLoop);
    }

    // Preload frames progressively (key frames first for instant response)
    function preloadFrames(){
      // Priority 1: First and last frames for instant initial render
      var priorityIndexes = [0, 10, 24, 35, 49];
      priorityIndexes.forEach(function(i){
        loadSingleFrame(i);
      });

      // Priority 2: Preload remaining frames
      for(var i = 0; i < totalFrames; i++){
        if(priorityIndexes.indexOf(i) === -1){
          loadSingleFrame(i);
        }
      }
    }

    function loadSingleFrame(i){
      if(images[i]) return;
      var img = new Image();
      img.src = getFrameUrl(i);
      img.onload = function(){
        loaded[i] = true;
        // If this is the first frame or the current active target, render immediately
        if(i === 0 && lastDrawnFrame === -1){
          resizeCanvas();
          drawFrame(0);
        } else if(Math.round(currentFrame) === i){
          drawFrame(i);
        }
      };
      // Fallback to alternate naming if needed
      img.onerror = function(){
        var fallbackNum = String(i + 1).padStart(3, "0");
        var fallbackImg = new Image();
        fallbackImg.src = "khatapng/frame-" + fallbackNum + ".png";
        fallbackImg.onload = function(){
          images[i] = fallbackImg;
          loaded[i] = true;
          if(Math.round(currentFrame) === i) drawFrame(i);
        };
      };
      images[i] = img;
    }

    // Initialize
    preloadFrames();
    resizeCanvas();
    updateScrollProgress();

    window.addEventListener("scroll", updateScrollProgress, {passive: true});
    window.addEventListener("resize", function(){
      resizeCanvas();
      updateScrollProgress();
    }, {passive: true});

    // Start persistent render loop
    requestAnimationFrame(animationLoop);
  }
})();
