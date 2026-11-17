(() => {
  const start = () => {
    const body = document.body;
    const header=document.querySelector('.pp-bar');
    const fitAnchor=()=>{if(header)document.documentElement.style.scrollPaddingTop=(header.getBoundingClientRect().height+16)+'px';};
    fitAnchor();
    if(header&&'ResizeObserver' in window)new ResizeObserver(fitAnchor).observe(header);
    const restoreAnchor=()=>{fitAnchor();const target=document.getElementById(location.hash.slice(1));if(target)target.scrollIntoView({behavior:'instant'});};
    if(document.readyState==='complete')restoreAnchor();
    else addEventListener('load',restoreAnchor,{once:true});
    // Font loading can rewrap company names and move the requested section.
    if(document.fonts)document.fonts.ready.then(()=>requestAnimationFrame(restoreAnchor));
    body.classList.toggle('pp-long-name', (body.dataset.ppName || '').length > 30);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.pp-service-detail').forEach(detail=>detail.addEventListener('toggle',()=>{
      if(!detail.open)return;
      const figure=document.querySelector('.pp-nail-service-photo');
      if(!figure)return;
      const image=figure.querySelector('img');
      image.src=detail.dataset.servicePhoto;
      image.alt=detail.dataset.serviceAlt;
      figure.querySelector('figcaption').textContent=detail.dataset.serviceReference==='true'?'Template photo · design reference':'Business photo';
      if(!reduced)image.animate([{opacity:.4,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:350,easing:'ease-out'});
    }));
    const targets = [...document.querySelectorAll('[data-pp-reveal]')];
    // Clear copied start states before observing. Theme runtimes can no longer
    // strand a scrolled image at opacity zero or outside the viewport.
    targets.forEach(el => {
      el.style.removeProperty('opacity');
      el.style.removeProperty('transform');
      el.classList.remove('elementor-invisible');
    });
    if (!reduced && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('pp-visible', 'tst-active');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
      body.classList.add('pp-reveal-ready');
      targets.forEach(el => {
        const box = el.getBoundingClientRect();
        if ((el.dataset.ppMinWidth && innerWidth < Number(el.dataset.ppMinWidth)) || (box.top < innerHeight - 24 && box.bottom > 0)) el.classList.add('pp-visible', 'tst-active');
        else observer.observe(el);
      });
    } else targets.forEach(el => el.classList.add('pp-visible', 'tst-active'));
    if (body.dataset.ppTemplate === '02-tastyc' && window.Swiper) {
      document.querySelectorAll('.tst-main-slider').forEach(el => {
        new Swiper(el, {
          slidesPerView: 1, speed: reduced ? 0 : 900, effect: 'fade',
          fadeEffect: { crossFade: true }, loop: true,
          autoplay: reduced ? false : { delay: 6000, disableOnInteraction: true },
          keyboard: { enabled: true, onlyInViewport: true },
          pagination: { el: '.tst-main-pagination', clickable: true },
          navigation: { nextEl: '.tst-main-next', prevEl: '.tst-main-prev' },
        });
      });
    }
    if (body.dataset.ppTemplate === '04-elysia') {
      document.querySelectorAll('#gallery ul').forEach((track, index) => {
        const frame = track.parentElement;
        frame.setAttribute('role', 'region');
        frame.setAttribute('aria-label', `Gallery inspiration row ${index + 1}`);
        frame.setAttribute('tabindex', '0');
        if (reduced) { frame.style.overflowX = 'auto'; return; }
        const items = [...track.children];
        const gap = parseFloat(getComputedStyle(track).gap) || 24;
        const distance = items.reduce((sum, el) => sum + el.getBoundingClientRect().width + gap, 0);
        if (!distance) return;
        items.forEach(item => {
          const copy = item.cloneNode(true);
          copy.setAttribute('aria-hidden', 'true');
          copy.removeAttribute('aria-posinset');
          copy.removeAttribute('aria-setsize');
          copy.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '-1'));
          copy.querySelectorAll('[data-pp-reveal]').forEach(el => el.removeAttribute('data-pp-reveal'));
          track.append(copy);
        });
        const motion = track.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-distance}px)` }], {
          duration: distance / 22 * 1000, iterations: Infinity, easing: 'linear', direction: index % 2 ? 'reverse' : 'normal',
        });
        frame.addEventListener('mouseenter', () => motion.pause());
        frame.addEventListener('mouseleave', () => { if (!frame.contains(document.activeElement)) motion.play(); });
        frame.addEventListener('focusin', () => motion.pause());
        frame.addEventListener('focusout', () => motion.play());
      });
    }
    if (!reduced) {
      const parallax = [...document.querySelectorAll('.tst-parallax, [data-pp-scroll-speed]')];
      let queued = false;
      const updateScroll = () => {
        queued = false;
        parallax.forEach(el => {
          if (el.dataset.ppScrollSpeed) {
            const amount = Math.min(scrollY, innerHeight) * Number(el.dataset.ppScrollSpeed);
            el.style.transform = `translateY(${-amount}px)`;
            el.style.opacity = String(Math.max(0, 1 - scrollY / innerHeight));
          } else el.style.transform = `translateY(${Math.min(scrollY * .15, 100)}px)`;
        });
      };
      addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(updateScroll); } }, { passive: true });
      updateScroll();
    }
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      event.preventDefault();
      if(location.hash!==link.getAttribute('href'))history.pushState(null,'',link.getAttribute('href'));
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
