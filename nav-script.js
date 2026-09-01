// Shared nav lightbox + carousel script
(function() {

  // Lightbox
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';

  const content = document.createElement('div');
  content.className = 'lightbox-content';

  const lbImg = document.createElement('img');

  const captionEl = document.createElement('p');
  captionEl.className = 'lightbox-caption';

  const dotsWrapLb = document.createElement('div');
  dotsWrapLb.className = 'lightbox-dots';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'lightbox-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close');

  const lbPrevBtn = document.createElement('button');
  lbPrevBtn.type = 'button';
  lbPrevBtn.className = 'lightbox-arrow lightbox-prev';
  lbPrevBtn.innerHTML = '&#10094;';
  lbPrevBtn.setAttribute('aria-label', 'Previous image');

  const lbNextBtn = document.createElement('button');
  lbNextBtn.type = 'button';
  lbNextBtn.className = 'lightbox-arrow lightbox-next';
  lbNextBtn.innerHTML = '&#10095;';
  lbNextBtn.setAttribute('aria-label', 'Next image');

  content.appendChild(lbImg);
  content.appendChild(captionEl);
  content.appendChild(dotsWrapLb);
  overlay.appendChild(closeBtn);
  overlay.appendChild(lbPrevBtn);
  overlay.appendChild(lbNextBtn);
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  let lbGroup = [];
  let lbIndex = 0;

  function renderLightboxSlide() {
    const item = lbGroup[lbIndex];
    if (!item) return;
    lbImg.src = item.src;
    lbImg.alt = item.alt || '';
    captionEl.textContent = item.caption || '';
    captionEl.style.display = item.caption ? 'block' : 'none';

    const multi = lbGroup.length > 1;
    lbPrevBtn.style.display = multi ? 'flex' : 'none';
    lbNextBtn.style.display = multi ? 'flex' : 'none';
    dotsWrapLb.style.display = multi ? 'flex' : 'none';

    dotsWrapLb.querySelectorAll('.carousel-dot').forEach(function(d, i) {
      d.classList.toggle('active', i === lbIndex);
    });
  }

  function buildLightboxDots() {
    dotsWrapLb.innerHTML = '';
    lbGroup.forEach(function(_, i) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot' + (i === lbIndex ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to image ' + (i + 1));
      dot.addEventListener('click', function(e) {
        e.stopPropagation();
        lbIndex = i;
        renderLightboxSlide();
      });
      dotsWrapLb.appendChild(dot);
    });
  }

  function lbNext(e) {
    if (e) e.stopPropagation();
    lbIndex = (lbIndex + 1) % lbGroup.length;
    renderLightboxSlide();
  }

  function lbPrev(e) {
    if (e) e.stopPropagation();
    lbIndex = (lbIndex - 1 + lbGroup.length) % lbGroup.length;
    renderLightboxSlide();
  }

  function openLightboxGroup(group, index) {
    lbGroup = group;
    lbIndex = index;
    buildLightboxDots();
    renderLightboxSlide();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function getCaptionFor(img) {
    const sib = img.nextElementSibling;
    return (sib && sib.classList.contains('image-caption')) ? sib.textContent.trim() : '';
  }

  document.querySelectorAll('.content-image').forEach(function(img) {
    img.addEventListener('click', function() {
      const parentCarousel = this.closest('[data-carousel]');
      let group, idx;

      if (parentCarousel) {
        const slides = Array.from(parentCarousel.querySelectorAll('.carousel-slide'));
        group = slides.map(function(slide) {
          const im = slide.querySelector('.content-image');
          return { src: im.src, alt: im.alt, caption: getCaptionFor(im) };
        });
        idx = slides.findIndex(function(slide) { return slide.contains(img); });
      } else {
        group = [{ src: img.src, alt: img.alt, caption: getCaptionFor(img) }];
        idx = 0;
      }

      openLightboxGroup(group, idx < 0 ? 0 : idx);
    });
  });

  lbNextBtn.addEventListener('click', lbNext);
  lbPrevBtn.addEventListener('click', lbPrev);

  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeLightbox();
  });
  document.addEventListener('keydown', function(e) {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') lbNext();
    if (e.key === 'ArrowLeft') lbPrev();
  });

  // Image Carousels
  document.querySelectorAll('[data-carousel]').forEach(function(carousel) {
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const dotsWrap = carousel.querySelector('.carousel-dots');
    const intervalMs = parseInt(carousel.dataset.interval, 10) || 5000;
    let index = 0;
    let timer = null;

    if (!track || slides.length === 0) return;

    // Build dots
    const dots = slides.map(function(_, i) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to image ' + (i + 1));
      dot.addEventListener('click', function() {
        goTo(i);
        resetTimer();
      });
      if (dotsWrap) dotsWrap.appendChild(dot);
      return dot;
    });

    function update() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function(d, i) { d.classList.toggle('active', i === index); });
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      update();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function startTimer() {
      if (slides.length > 1) {
        timer = setInterval(next, intervalMs);
      }
    }

    function stopTimer() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    function resetTimer() {
      stopTimer();
      startTimer();
    }

    if (nextBtn) nextBtn.addEventListener('click', function() { next(); resetTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', function() { prev(); resetTimer(); });

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    carousel.addEventListener('focusin', stopTimer);
    carousel.addEventListener('focusout', startTimer);

    update();
    startTimer();
  });
})();
