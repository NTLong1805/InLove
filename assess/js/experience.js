/* InLove interaction enhancements; zero build dependencies. */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const menu = $('#menu-checkbox');
  const menuTrigger = $('.toggle-menu');
  const drawer = $('.menu-drawer');
  const closeMenu = () => {
    if (!menu) return;
    menu.checked = false;
    menuTrigger?.setAttribute('aria-expanded', 'false');
  };
  if (menu) {
    menu.addEventListener('change', () => menuTrigger?.setAttribute('aria-expanded', String(menu.checked)));
    drawer?.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.checked) { closeMenu(); menuTrigger?.focus(); }
    });
  }
  const topButton = $('.back-to-top');
  if (topButton) {
    const update = () => topButton.classList.toggle('is-visible', window.scrollY > 550);
    window.addEventListener('scroll', update, { passive:true });
    update();
    topButton.addEventListener('click', () => window.scrollTo({top:0, behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}));
  }
  // Make sections discoverable and highlight the active nav item.
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.pc-nav a[href^="#"]'));
  if ('IntersectionObserver' in window) {
    const watcher = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          if (link.getAttribute('href') === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin:'-20% 0px -65% 0px' });
    sections.forEach(section => watcher.observe(section));
  }
  // Defer offscreen images without changing their layout or Swiper markup.
  document.querySelectorAll('img').forEach((img, index) => {
    img.decoding = 'async';
    if (!img.hasAttribute('loading') && !img.closest('.hero') && index > 2) img.loading = 'lazy';
  });
  // For a static GitHub Pages site, never put service credentials in the browser.
  // Instead, let visitors explicitly copy their composed message.
  const form = $('#discord-form');
  const textarea = $('#message');
  const status = $('#message-status');
  if (form && textarea && status) {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const message = textarea.value.trim();
      if (!message) {
        status.dataset.state = 'error';
        status.textContent = 'Bạn hãy viết một lời nhắn trước nhé ♡';
        textarea.focus();
        return;
      }
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(message);
        status.dataset.state = 'success';
        status.textContent = 'Đã sao chép lời nhắn! Bạn có thể dán và gửi qua kênh yêu thích ♡';
      } catch {
        textarea.focus();
        textarea.select();
        status.dataset.state = 'error';
        status.textContent = 'Hãy sao chép nội dung đang được chọn để gửi nhé ♡';
      }
    });
  }
})();
