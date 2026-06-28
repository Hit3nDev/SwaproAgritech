/* =========================================================
   SWAPRO — Subpage Interactivity Suite
   1. Mobile menu
   2. Scroll progress bar
   3. Scroll reveal (IntersectionObserver)
   4. Magnetic cursor dot + magnetic buttons
   5. Gallery tilt + lightbox
   6. Jaltaru product gallery thumbnail swap
   7. Ripple click effect (water rings)
   8. Active nav + back-to-top + navbar scroll state
========================================================= */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ══════════════════════════════════════════════════════════
   1. MOBILE MENU
══════════════════════════════════════════════════════════ */
(function(){
  const toggle=document.getElementById('menu-toggle');
  const menu=document.getElementById('mobile-menu');
  if(!toggle||!menu) return;
  const iMenu=toggle.querySelector('.icon-menu');
  const iX=toggle.querySelector('.icon-x');
  const backdrop=menu.querySelector('.mobile-menu-backdrop');
  let open=false;
  function setOpen(v){
    open=v; menu.classList.toggle('open',open);
    iMenu.style.display=open?'none':'block';
    iX.style.display=open?'block':'none';
    document.body.style.overflow=open?'hidden':'';
  }
  toggle.addEventListener('click',()=>setOpen(!open));
  backdrop.addEventListener('click',()=>setOpen(false));
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
})();

/* ══════════════════════════════════════════════════════════
   2. SCROLL PROGRESS BAR
══════════════════════════════════════════════════════════ */
(function(){
  const bar=document.getElementById('scroll-progress-bar');
  if(!bar) return;
  function upd(){
    const h=document.documentElement;
    bar.style.width=((h.scrollTop/(h.scrollHeight-h.clientHeight))*100)+'%';
  }
  window.addEventListener('scroll',upd,{passive:true}); upd();
})();

/* ══════════════════════════════════════════════════════════
   3. SCROLL REVEAL
══════════════════════════════════════════════════════════ */
(function(){
  const items=document.querySelectorAll('.reveal-up');
  if(!items.length) return;
  if(prefersReducedMotion){ items.forEach(el=>el.classList.add('in-view')); return; }
  // Content already in the viewport at load time can be unreliable with
  // IntersectionObserver on first paint — reveal it immediately instead of
  // waiting on the observer, which only fires reliably for things scrolled into view later.
  const vh=window.innerHeight;
  items.forEach(el=>{
    const r=el.getBoundingClientRect();
    if(r.top<vh*0.95) el.classList.add('in-view');
  });
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in-view'); obs.unobserve(e.target); }});
  },{threshold:0, rootMargin:'0px 0px 400px 0px'});
  items.forEach((el,i)=>{
    obs.observe(el);
  });
})();

/* ══════════════════════════════════════════════════════════
   5. GALLERY TILT + LIGHTBOX
══════════════════════════════════════════════════════════ */
(function(){
  if(!window.matchMedia('(max-width:1023px)').matches){
    document.querySelectorAll('[data-tilt]').forEach(el=>{
      el.addEventListener('mousemove',e=>{
        const r=el.getBoundingClientRect();
        const px=(e.clientX-r.left)/r.width-.5;
        const py=(e.clientY-r.top)/r.height-.5;
        el.style.transform=`perspective(800px) rotateX(${(-py*9).toFixed(2)}deg) rotateY(${(px*9).toFixed(2)}deg) scale(1.02)`;
      });
      el.addEventListener('mouseleave',()=>el.style.transform='');
    });
  }

  const lb=document.getElementById('lightbox');
  const lbContent=document.getElementById('lb-content');
  const lbClose=document.getElementById('lb-close');
  const lbTitle=document.getElementById('lb-title');
  const lbDesc=document.getElementById('lb-desc');
  if(!lb) return;

  document.querySelectorAll('[data-lightbox]').forEach(card=>{
    card.addEventListener('click',e=>{
      if(e.target.closest('.hover-pill')) return;
      const title=card.dataset.lbTitle||'';
      const desc=card.dataset.lbDesc||'';
      const svgEl=card.querySelector('.illus-svg');
      const imgEl=card.querySelector('img');
      if(lbTitle) lbTitle.textContent=title;
      if(lbDesc) lbDesc.textContent=desc;
      if(lbContent&&svgEl){
        lbContent.innerHTML='';
        lbContent.appendChild(svgEl.cloneNode(true));
      }else if(lbContent&&imgEl){
        lbContent.innerHTML='';
        const cloned=imgEl.cloneNode(true);
        cloned.style.width='100%';
        cloned.style.height='100%';
        cloned.style.objectFit='contain';
        lbContent.appendChild(cloned);
      }
      lb.classList.add('lb-open');
      document.body.style.overflow='hidden';
    });
  });
  function closeLb(){
    lb.classList.remove('lb-open');
    document.body.style.overflow='';
  }
  lbClose?.addEventListener('click',closeLb);
  lb.addEventListener('click',e=>{ if(e.target===lb) closeLb(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeLb(); });
})();

/* ══════════════════════════════════════════════════════════
   6. JALTARU PRODUCT GALLERY — THUMBNAIL SWAP
══════════════════════════════════════════════════════════ */
(function(){
  const mainImg=document.getElementById('jaltaru-main-img');
  const mainFrame=document.getElementById('jaltaru-main-frame');
  const thumbs=document.querySelectorAll('.jaltaru-thumb');
  if(!mainImg||!thumbs.length) return;
  thumbs.forEach(thumb=>{
    thumb.addEventListener('click',()=>{
      const src=thumb.dataset.img;
      if(!src) return;
      mainImg.style.opacity='0';
      setTimeout(()=>{
        mainImg.src=src;
        if(mainFrame) mainFrame.dataset.lbDesc=thumb.querySelector('img')?.alt||mainFrame.dataset.lbDesc;
        mainImg.style.opacity='1';
      },150);
      thumbs.forEach(t=>t.classList.remove('is-active'));
      thumb.classList.add('is-active');
    });
  });
})();

/* ══════════════════════════════════════════════════════════
   7. ACTIVE NAV + BACK-TO-TOP + NAVBAR SCROLL STATE
══════════════════════════════════════════════════════════ */
(function(){
  const navbar=document.getElementById('navbar');
  const navLinks=document.querySelectorAll('[data-nav]');
  const hashNavLinks=[...navLinks].filter(a=>(a.getAttribute('href')||'').startsWith('#'));
  const sections=hashNavLinks.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);

  function onScroll(){
    navbar?.classList.toggle('scrolled', window.scrollY>40);
    let currentId=null;
    const sp=window.scrollY+window.innerHeight*.5;
    sections.forEach(s=>{ if(s.offsetTop<=sp) currentId=s.id; });
    hashNavLinks.forEach(a=>a.classList.toggle('active', a.getAttribute('href')===`#${currentId}`));
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  document.getElementById('back-to-top')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
})();
