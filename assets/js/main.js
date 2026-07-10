
(function(){
  const body = document.body;
  const header = document.querySelector('.site-header');
  const burger = document.querySelector('.burger');
  const mobileNav = document.querySelector('.mobile-nav');
  if(burger && header && mobileNav){
    const setMobileMenu = (open) => {
      header.classList.toggle('is-open', open);
      mobileNav.classList.toggle('is-open', open);
      body.classList.toggle('is-mobile-menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      mobileNav.setAttribute('aria-hidden', open ? 'false' : 'true');
    };
    setMobileMenu(false);
    burger.addEventListener('click', ()=>setMobileMenu(!header.classList.contains('is-open')));
    mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>setMobileMenu(false)));
    window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') setMobileMenu(false); });
    window.addEventListener('resize', ()=>{ if(window.innerWidth > 860) setMobileMenu(false); });
  }


  // Reliable hash navigation with a fixed header, including iOS Safari.
  const scrollToCurrentHash = (behavior = 'auto') => {
    const rawHash = window.location.hash;
    if(!rawHash || rawHash.length < 2) return;
    let target = null;
    try{
      target = document.getElementById(decodeURIComponent(rawHash.slice(1)));
    }catch(error){
      target = document.querySelector(rawHash);
    }
    if(!target) return;

    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const top = Math.max(
      0,
      target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 14
    );
    window.scrollTo({top, behavior});
  };

  document.addEventListener('click', event=>{
    const link = event.target.closest('a[href*="#"]');
    if(!link) return;

    let url;
    try{
      url = new URL(link.href, window.location.href);
    }catch(error){
      return;
    }

    const sameDocument =
      url.origin === window.location.origin &&
      url.pathname.replace(/\/+$/, '') === window.location.pathname.replace(/\/+$/, '');

    if(!sameDocument || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if(!target) return;

    event.preventDefault();
    history.pushState(null, '', url.hash);
    if(header?.classList.contains('is-open')){
      header.classList.remove('is-open');
      mobileNav?.classList.remove('is-open');
      body.classList.remove('is-mobile-menu-open');
      burger?.setAttribute('aria-expanded', 'false');
      burger?.setAttribute('aria-label', 'Открыть меню');
      mobileNav?.setAttribute('aria-hidden', 'true');
    }
    window.requestAnimationFrame(()=>scrollToCurrentHash('smooth'));
  });

  if(window.location.hash){
    window.requestAnimationFrame(()=>scrollToCurrentHash('auto'));
    window.addEventListener('load', ()=>{
      window.setTimeout(()=>scrollToCurrentHash('auto'), 80);
      window.setTimeout(()=>scrollToCurrentHash('auto'), 420);
    }, {once:true});
  }

  // Mega menu accessibility on click for touch devices
  document.querySelectorAll('.nav-trigger').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      if(window.innerWidth > 1180){
        const parent = btn.closest('.nav-item--mega');
        parent.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', parent.classList.contains('is-open') ? 'true' : 'false');
      }
    });
  });
  document.addEventListener('click', (e)=>{
    document.querySelectorAll('.nav-item--mega.is-open').forEach(item=>{ if(!item.contains(e.target)) { item.classList.remove('is-open'); const b=item.querySelector('.nav-trigger'); if(b) b.setAttribute('aria-expanded','false'); } });
  });

  // Reveal on scroll
  const observer = new IntersectionObserver((entries)=>{entries.forEach(entry=>{ if(entry.isIntersecting) entry.target.classList.add('is-visible'); });}, {threshold:.14});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));


  // Critical first content on archive pages must never remain hidden on mobile Safari.
  document.querySelectorAll('.page-hero--videos + .section > .container, .page-hero--reviews + .section > .container, .page-hero--faq + .section > .container').forEach(el=>{
    el.classList.add('is-visible');
  });

  // Tilt cards
  const tilts = document.querySelectorAll('.tilt-card, [data-tilt]');
  const isFinePointer = window.matchMedia('(pointer:fine)').matches;
  if(isFinePointer){
    tilts.forEach(card=>{
      card.addEventListener('mousemove', e=>{
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const rotateX = ((y / r.height) - 0.5) * -8;
        const rotateY = ((x / r.width) - 0.5) * 8;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
        if(card.classList.contains('hero__visual')){
          card.style.setProperty('--mx', `${(x/r.width)*100}%`);
          card.style.setProperty('--my', `${(y/r.height)*100}%`);
        }
      });
      card.addEventListener('mouseleave', ()=>{card.style.transform='';});
    });
  }

  // Contextual lead modal prepared for future WordPress + Contact Form 7 integration
  const modal = document.getElementById('leadModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalEyebrow = document.getElementById('modalEyebrow');
  const modalSubmit = document.getElementById('modalSubmit');
  let lastFocusedElement = null;

  const setFieldValue = (form, name, value) => {
    const field = form ? form.querySelector(`[name="${name}"]`) : null;
    if(field) field.value = value || '';
  };

  const closeModal = () => {
    if(!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    body.style.overflow='';
    body.classList.remove('is-modal-open');
    if(lastFocusedElement && typeof lastFocusedElement.focus === 'function'){
      lastFocusedElement.focus({preventScroll:true});
    }
  };

  const openModal = (trigger) => {
    if(!modal) return;
    lastFocusedElement = trigger;
    const action = trigger.getAttribute('data-lead-action') || 'estimate';
    const fallbackTitle = action === 'discuss' ? 'Обсудить объект и задачу' : 'Получить предварительную смету';
    const fallbackDesc = action === 'discuss'
      ? 'Расскажите, что нужно сделать. Подскажем этапы, материалы, ориентиры по стоимости и следующий шаг.'
      : 'Уточним площадь, состояние объекта и состав работ — подготовим ориентир по стоимости.';
    const titleText = trigger.getAttribute('data-lead-title') || trigger.getAttribute('data-modal') || fallbackTitle;
    const descText = trigger.getAttribute('data-lead-desc') || fallbackDesc;
    const submitText = trigger.getAttribute('data-lead-submit') || (action === 'discuss' ? 'Обсудить объект' : 'Получить смету');
    const sourceText = trigger.getAttribute('data-lead-source')
      || trigger.getAttribute('data-b2b')
      || trigger.querySelector?.('h3')?.textContent?.trim()
      || trigger.getAttribute('aria-label')
      || titleText;
    const serviceText = trigger.getAttribute('data-lead-service') || trigger.getAttribute('data-b2b') || '';
    const pageTitle = document.body.getAttribute('data-page-title') || document.title;
    const form = modal.querySelector('form');

    if(modalTitle) modalTitle.textContent = titleText;
    if(modalDesc) modalDesc.textContent = descText;
    if(modalEyebrow) modalEyebrow.textContent = action === 'discuss' ? 'Консультация' : 'Заявка на смету';
    if(modalSubmit) modalSubmit.textContent = submitText;

    setFieldValue(form, 'lead_action', action);
    setFieldValue(form, 'lead_source', sourceText);
    setFieldValue(form, 'lead_service', serviceText);
    setFieldValue(form, 'lead_page_title', pageTitle);
    setFieldValue(form, 'lead_page_url', window.location.href);
    setFieldValue(form, 'lead_button_text', trigger.getAttribute('data-lead-button-text') || trigger.querySelector?.('.text-link')?.textContent?.trim() || trigger.getAttribute('aria-label') || trigger.textContent?.trim() || titleText);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    body.style.overflow='hidden';
    body.classList.add('is-modal-open');
    const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea, button');
    if(firstInput) setTimeout(()=>firstInput.focus({preventScroll:true}), 50);
    syncConsentButtons();
  };

  document.querySelectorAll('[data-modal]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      openModal(btn);
    });
    if(btn.getAttribute('role') === 'button'){
      btn.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          openModal(btn);
        }
      });
    }
  });
  if(modal){
    modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });
    const closeButton = modal.querySelector('.modal__close');
    if(closeButton) closeButton.addEventListener('click', closeModal);
    window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeModal(); });
  }


  // Toast & demo forms
  const toast = document.getElementById('toast');
  const showToast = (text)=>{
    if(!toast) return;
    toast.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(()=>toast.classList.remove('is-visible'), 4200);
  }
  document.querySelectorAll('.js-demo-form').forEach(form=>{
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      showToast('Спасибо! Мы получили заявку и свяжемся с вами для уточнения деталей.');
      form.reset();
      if(modal && modal.classList.contains('is-open')){ closeModal(); body.style.overflow=''; }
    });
  });

  // Quiz
  const quiz = document.querySelector('.js-quiz-form');
  if(quiz){
    const steps = [...quiz.querySelectorAll('.quiz-step')];
    const prevBtn = quiz.querySelector('.quiz-prev');
    const nextBtn = quiz.querySelector('.quiz-next');
    const submitBtn = quiz.querySelector('.quiz-submit');
    const progress = document.querySelector('.quiz-progress__bar');
    const currentStepText = document.querySelector('.quiz-step-current');
    let current = 0;
    const updateQuiz = ()=>{
      steps.forEach((step, idx)=>step.classList.toggle('is-active', idx===current));
      if(prevBtn){
        prevBtn.classList.toggle('is-control-hidden', current === 0);
        prevBtn.disabled = current === 0;
      }
      if(nextBtn) nextBtn.classList.toggle('is-control-hidden', current === steps.length - 1);
      if(submitBtn) submitBtn.classList.toggle('is-control-hidden', current !== steps.length - 1);
      const pct = ((current+1)/steps.length)*100;
      if(progress) progress.style.setProperty('--progress', pct + '%');
      if(currentStepText) currentStepText.textContent = String(current+1);
      syncConsentButtons();
    };
    nextBtn && nextBtn.addEventListener('click', ()=>{ if(current < steps.length-1){ current++; updateQuiz(); }});
    prevBtn && prevBtn.addEventListener('click', ()=>{ if(current > 0){ current--; updateQuiz(); }});
    quiz.addEventListener('submit', (e)=>{
      e.preventDefault();
      showToast('Спасибо! Мы получили ответы и свяжемся с вами для предварительного расчёта.');
      quiz.reset(); current = 0; updateQuiz();
    });
    updateQuiz();
  }

  // Cases filter + equal-height cards
  document.querySelectorAll('#cases').forEach(section=>{
    const filterBar = section.querySelector('.case-filter');
    const buttons = [...section.querySelectorAll('.case-filter__btn')];
    const cards = [...section.querySelectorAll('.case-card[data-case-type]')];
    if(!filterBar || !buttons.length || !cards.length) return;

    let equalizeFrame = 0;
    const equalizeCaseCards = () => {
      window.cancelAnimationFrame(equalizeFrame);
      equalizeFrame = window.requestAnimationFrame(()=>{
        const visibleCards = cards.filter(card=>!card.hidden && !card.classList.contains('is-hidden'));
        cards.forEach(card=>card.style.minHeight = '');
        if(visibleCards.length < 2) return;

        const maxHeight = Math.ceil(
          Math.max(...visibleCards.map(card=>card.getBoundingClientRect().height))
        );
        visibleCards.forEach(card=>{
          card.style.minHeight = `${maxHeight}px`;
        });
      });
    };

    const applyCaseFilter = (filter) => {
      buttons.forEach(button=>{
        const active = button.dataset.filter === filter;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      cards.forEach(card=>{
        const visible = filter === 'all' || card.dataset.caseType === filter;
        card.hidden = !visible;
        card.classList.toggle('is-hidden', !visible);
        card.setAttribute('aria-hidden', visible ? 'false' : 'true');
      });

      const grid = section.querySelector('.case-grid');
      if(grid && grid.scrollLeft){
        grid.scrollTo({left:0, behavior:'auto'});
      }
      equalizeCaseCards();
    };

    filterBar.addEventListener('click', event=>{
      const button = event.target.closest('.case-filter__btn');
      if(!button || !filterBar.contains(button)) return;
      event.preventDefault();
      applyCaseFilter(button.dataset.filter || 'all');
    });

    let resizeTimer = 0;
    window.addEventListener('resize', ()=>{
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(equalizeCaseCards, 100);
    }, {passive:true});
    window.addEventListener('load', equalizeCaseCards, {once:true});
    document.fonts?.ready?.then(equalizeCaseCards);

    applyCaseFilter(
      buttons.find(button=>button.classList.contains('is-active'))?.dataset.filter || 'all'
    );
  });


  // Reviews slider
  const reviewsSwiperEl = document.querySelector('[data-reviews-swiper]');
  if (reviewsSwiperEl && typeof Swiper !== 'undefined') {
    new Swiper(reviewsSwiperEl, {
      loop: false,
      rewind: true,
      speed: 650,
      grabCursor: true,
      watchOverflow: true,
      roundLengths: true,
      centeredSlides: false,
      observer: true,
      observeParents: true,
      resizeObserver: true,
      spaceBetween: 18,
      slidesPerView: 1,
      slidesPerGroup: 1,
      autoplay: false,
      navigation: {
        nextEl: '.review-next',
        prevEl: '.review-prev'
      },
      pagination: {
        el: '.reviews-pagination',
        clickable: true
      },
      slidesOffsetBefore: 0,
      slidesOffsetAfter: 0,
      breakpoints: {
        1024: { slidesPerView: 2, slidesPerGroup: 1, spaceBetween: 18, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
        1181: { slidesPerView: 3, slidesPerGroup: 1, spaceBetween: 18, slidesOffsetBefore: 0, slidesOffsetAfter: 0 }
      }
    });
  }

  // Back to top button
  const backToTop = document.querySelector('.back-to-top');
  if(backToTop){
    const toggleBackToTop = () => {
      const isMobile = window.matchMedia('(max-width: 860px)').matches;
      const threshold = isMobile ? Math.max(900, window.innerHeight * 1.15) : 520;
      const show = window.scrollY > threshold && !document.body.classList.contains('is-modal-open');
      backToTop.classList.toggle('is-visible', show);
    };
    window.addEventListener('scroll', toggleBackToTop, {passive:true});
    window.addEventListener('resize', toggleBackToTop);
    backToTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
    toggleBackToTop();
  }

  // Comparison slider
  document.querySelectorAll('[data-comparison]').forEach(wrapper=>{
    const range = wrapper.querySelector('.comparison__range');
    const overlay = wrapper.querySelector('.comparison__overlay');
    const handle = wrapper.querySelector('.comparison__handle');
    const update = ()=>{
      const val = range.value;
      overlay.style.width = val + '%';
      handle.style.left = val + '%';
    };
    range.addEventListener('input', update);
    update();
  });

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item=>{
    const btn = item.querySelector('.faq-question');
    btn.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('is-open');
      const list = item.parentElement;
      if(list){ list.querySelectorAll('.faq-item').forEach(i=>{ i.classList.remove('is-open'); const b=i.querySelector('.faq-question'); if(b) b.setAttribute('aria-expanded','false'); }); }
      if(!isOpen){ item.classList.add('is-open'); btn.setAttribute('aria-expanded','true'); }
    });
  });

  // Make service cards fully clickable
  document.querySelectorAll('.service-card').forEach(card=>{
    const link = card.querySelector('.service-card__footer a');
    if(!link) return;
    card.setAttribute('role','link');
    card.setAttribute('tabindex','0');
    card.addEventListener('click', (e)=>{
      if(e.target.closest('a,button,input,select,textarea,label')) return;
      window.location.href = link.href;
    });
    card.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); window.location.href = link.href; }
    });
  });

  // Consent checkbox: disable submit until accepted
  function syncConsentButtons(){
    document.querySelectorAll('form').forEach(form=>{
      const consent = form.querySelector('.check--policy input[type="checkbox"]');
      const submit = form.querySelector('button[type="submit"], .quiz-submit');
      if(!consent || !submit) return;
      submit.disabled = !consent.checked;
    });
  }
  document.querySelectorAll('.check--policy input[type="checkbox"]').forEach(ch=>{
    ch.addEventListener('change', syncConsentButtons);
  });
  syncConsentButtons();

// Services archive category filter
  document.querySelectorAll('[data-service-filter]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const filter = btn.getAttribute('data-service-filter');
      document.querySelectorAll('[data-service-filter]').forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      document.querySelectorAll('[data-service-card]').forEach(card=>{
        const cat = card.getAttribute('data-category');
        const show = filter === 'Все услуги' || cat === filter;
        card.classList.toggle('is-hidden', !show);
      });
    });
  });

    // Clickable case cards open contextual lead modal
  document.querySelectorAll('.js-case-modal').forEach(card=>{
    card.addEventListener('click', (e)=>{
      if(e.target.closest('a,button,input,select,textarea,label')) return;
      openModal(card);
    });
    card.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        openModal(card);
      }
    });
  });
// Mobile bottom CTA: show when scrolling down, hide when scrolling up and at the top
  const mobileBottomCta = document.querySelector('.mobile-bottom-cta');
  if(mobileBottomCta){
    let lastScrollY = window.scrollY;
    const setMobileCtaVisible = (visible) => {
      mobileBottomCta.classList.toggle('is-visible', visible);
      mobileBottomCta.classList.toggle('is-hidden-by-scroll', !visible);
      body.classList.toggle('has-mobile-cta', visible);
    };
    const updateMobileCta = () => {
      const currentY = window.scrollY;
      const isMobile = window.matchMedia('(max-width: 860px)').matches;
      if(!isMobile || currentY < 180 || body.classList.contains('is-mobile-menu-open')){
        setMobileCtaVisible(false);
        lastScrollY = currentY;
        return;
      }
      if(currentY > lastScrollY + 3){
        setMobileCtaVisible(true);
      } else if(currentY < lastScrollY - 3){
        setMobileCtaVisible(false);
      }
      lastScrollY = currentY;
    };
    window.addEventListener('scroll', updateMobileCta, {passive:true});
    window.addEventListener('resize', updateMobileCta);
    updateMobileCta();
  }
// Hide fixed mobile actions when the footer is visible
  const siteFooter = document.querySelector('.site-footer');
  if(siteFooter && 'IntersectionObserver' in window){
    const footerObserver = new IntersectionObserver((entries)=>{
      document.body.classList.toggle('is-footer-in-view', entries[0].isIntersecting);
    }, {threshold: 0.05});
    footerObserver.observe(siteFooter);
  }
// File upload status and selected-file counter
  const updateFileUploadState = (input) => {
    const label = input.closest('.file-upload');
    if(!label) return;
    const status = label.querySelector('[data-file-status]');
    const icon = label.querySelector('.file-upload__icon');
    const files = Array.from(input.files || []);
    const count = files.length;

    label.classList.toggle('has-files', count > 0);
    if(icon) icon.textContent = count > 0 ? String(count) : '+';
    if(!status) return;

    if(count === 0){
      status.textContent = 'Файлы не выбраны';
    } else if(count === 1){
      status.textContent = `Прикреплён 1 файл: ${files[0].name}`;
    } else {
      status.textContent = `Прикреплено файлов: ${count}`;
    }
  };

  document.querySelectorAll('.file-upload input[type="file"]').forEach(input => {
    input.addEventListener('change', () => updateFileUploadState(input));
    updateFileUploadState(input);
  });

  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('reset', () => {
      window.setTimeout(() => {
        form.querySelectorAll('.file-upload input[type="file"]').forEach(updateFileUploadState);
      }, 0);
    });
  });

  // Catalogue search: all services stay visible until a query is entered.
  const catalogGrid = document.querySelector('.archive-catalog .archive-service-grid');
  const catalogSearch = document.getElementById('serviceCatalogSearch');
  if(catalogGrid && catalogSearch){
    const cards = [...catalogGrid.querySelectorAll('[data-service-card]')];
    const updateCatalog = () => {
      const query = catalogSearch.value.trim().toLocaleLowerCase('ru-RU');
      cards.forEach(card => {
        const text = card.textContent.toLocaleLowerCase('ru-RU');
        card.classList.toggle('is-catalog-hidden', Boolean(query) && !text.includes(query));
      });
    };
    catalogSearch.addEventListener('input', updateCatalog);
    catalogSearch.addEventListener('search', updateCatalog);
    updateCatalog();
  }


  // Fancybox video gallery initialization
  if (window.Fancybox) {
    Fancybox.bind('[data-fancybox="site-videos"]', {
      animated: true,
      dragToClose: true,
      Toolbar: {
        display: {
          left: [],
          middle: [],
          right: ['close'],
        },
      },
      iframe: {
        preload: false,
      },
    });
  }


  // Video slider: exact full-card navigation on phones/tablets.
  document.querySelectorAll('[data-video-slider]').forEach(slider=>{
    const track = slider.querySelector('.video-showcase__track');
    const prev = slider.querySelector('.video-slider__btn--prev');
    const next = slider.querySelector('.video-slider__btn--next');
    if(!track) return;

    let scrollTimer = 0;
    let programmaticScroll = false;

    const getStep = () => {
      const card = track.querySelector('.video-card');
      if(!card) return track.clientWidth;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      return card.getBoundingClientRect().width + gap;
    };

    const getMaxIndex = () => {
      const step = getStep();
      return step > 0 ? Math.max(0, Math.round((track.scrollWidth - track.clientWidth) / step)) : 0;
    };

    const scrollToIndex = (index, behavior = 'smooth') => {
      if(window.matchMedia('(min-width:1181px)').matches){
        track.scrollLeft = 0;
        return;
      }
      const step = getStep();
      const boundedIndex = Math.max(0, Math.min(index, getMaxIndex()));
      programmaticScroll = true;
      track.scrollTo({left: boundedIndex * step, behavior});
      window.setTimeout(()=>{ programmaticScroll = false; }, behavior === 'smooth' ? 450 : 0);
    };

    const snapToNearestCard = (behavior = 'smooth') => {
      if(window.matchMedia('(min-width:1181px)').matches) return;
      const step = getStep();
      if(!step) return;
      scrollToIndex(Math.round(track.scrollLeft / step), behavior);
    };

    const move = (direction) => {
      const step = getStep();
      const currentIndex = step ? Math.round(track.scrollLeft / step) : 0;
      scrollToIndex(currentIndex + direction);
    };

    prev?.addEventListener('click', ()=>move(-1));
    next?.addEventListener('click', ()=>move(1));

    track.addEventListener('scroll', ()=>{
      if(programmaticScroll) return;
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(()=>snapToNearestCard('smooth'), 140);
    }, {passive:true});

    track.addEventListener('touchend', ()=>{
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(()=>snapToNearestCard('smooth'), 40);
    }, {passive:true});

    track.addEventListener('pointerup', ()=>{
      if(window.matchMedia('(pointer:fine)').matches){
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(()=>snapToNearestCard('smooth'), 40);
      }
    });

    let resizeTimer = 0;
    window.addEventListener('resize', ()=>{
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(()=>scrollToIndex(0, 'auto'), 80);
    }, {passive:true});

    scrollToIndex(0, 'auto');
  });

})();
