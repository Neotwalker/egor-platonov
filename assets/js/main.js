
(function(){
  const body = document.body;
  const header = document.querySelector('.site-header');
  const burger = document.querySelector('.burger');
  const mobileNav = document.querySelector('.mobile-nav');
  if(burger && header && mobileNav){
    burger.addEventListener('click', ()=>{
      const open = header.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileNav.classList.toggle('is-open', open);
    });
    mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{header.classList.remove('is-open'); mobileNav.classList.remove('is-open');}));
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

  // Modal
  const modal = document.getElementById('leadModal');
  const modalTitle = document.getElementById('modalTitle');
  const closeModal = ()=> modal && modal.classList.remove('is-open');
  document.querySelectorAll('[data-modal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(modalTitle) modalTitle.textContent = btn.getAttribute('data-modal') || 'Оставить заявку';
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden','false');
      body.style.overflow='hidden';
    });
  });
  if(modal){
    modal.addEventListener('click', (e)=>{ if(e.target === modal) { closeModal(); body.style.overflow=''; } });
    modal.querySelector('.modal__close').addEventListener('click', ()=>{ closeModal(); body.style.overflow=''; });
    window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape'){ closeModal(); body.style.overflow=''; } });
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
      showToast('Спасибо! В статической версии это демо-форма. На интеграции сюда подключаются формы WordPress, отправка в CRM, Telegram/WhatsApp и цели Метрики.');
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
      prevBtn.disabled = current===0;
      nextBtn.hidden = current===steps.length-1;
      submitBtn.hidden = current!==steps.length-1;
      const pct = ((current+1)/steps.length)*100;
      if(progress) progress.style.setProperty('--progress', pct + '%');
      if(currentStepText) currentStepText.textContent = String(current+1);
    };
    nextBtn && nextBtn.addEventListener('click', ()=>{ if(current < steps.length-1){ current++; updateQuiz(); }});
    prevBtn && prevBtn.addEventListener('click', ()=>{ if(current > 0){ current--; updateQuiz(); }});
    quiz.addEventListener('submit', (e)=>{
      e.preventDefault();
      showToast('Спасибо! Квиз собрал вводные. В боевой версии данные отправляются в CRM / мессенджеры, а пользователь видит страницу успеха.');
      quiz.reset(); current = 0; updateQuiz();
    });
    updateQuiz();
  }

  // Cases filter
  const filterButtons = document.querySelectorAll('.case-filter__btn');
  const cases = document.querySelectorAll('.case-card[data-case-type]');
  filterButtons.forEach(btn=>btn.addEventListener('click', ()=>{
    filterButtons.forEach(b=>b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const filter = btn.getAttribute('data-filter');
    cases.forEach(card=>{
      const show = filter === 'all' || card.getAttribute('data-case-type') === filter;
      card.classList.toggle('is-hidden', !show);
    });
  }));

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

  // Map
  const mapNode = document.getElementById('objectMap');
  if(mapNode && typeof L !== 'undefined'){
    const map = L.map(mapNode, {scrollWheelZoom:false}).setView([55.1603, 61.4026], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    const points = [
      {coords:[55.1644,61.4368], text:'Квартира в новостройке · 92 м²'},
      {coords:[55.1469,61.3694], text:'Коммерческое помещение · 310 м²'},
      {coords:[55.2194,61.3215], text:'Производственный объект · 1250 м²'},
      {coords:[55.1808,61.2730], text:'Загородный дом · 146 м²'}
    ];
    points.forEach(p=>L.marker(p.coords).addTo(map).bindPopup(p.text));
    setTimeout(()=>map.invalidateSize(), 600);
  }
})();
