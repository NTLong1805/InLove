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
    menuTrigger?.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        menu.checked = !menu.checked;
        menu.dispatchEvent(new Event('change'));
      }
    });
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
  // Letters are copied and opened as Gmail drafts. Static GitHub Pages cannot send mail.
  const form = $('#letter-form');
  const titleInput = $('#letter-title');
  const recipientInput = $('#letter-recipient');
  const textarea = $('#message');
  const count = $('#letter-count');
  const status = $('#message-status');
  const share = window.InLoveShare;
  if (form && titleInput && recipientInput && textarea && status && share) {
    textarea.addEventListener('input', () => {
      if (count) count.textContent = textarea.value.length + ' / 2000 ký tự';
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const title = titleInput.value.trim();
      const message = textarea.value.trim();
      const recipient = share.recipients[recipientInput.value];
      if (!recipient || !title || !message) {
        status.dataset.state = 'error';
        status.textContent = 'Hãy chọn người nhận và nhập cả tiêu đề lẫn nội dung bức thư ♡';
        (!title ? titleInput : !message ? textarea : recipientInput).focus();
        return;
      }
      if (title.length > 120 || message.length > 2000) {
        status.dataset.state = 'error';
        status.textContent = 'Bức thư đã vượt quá giới hạn ký tự.';
        return;
      }
      const result = share.copyAndCompose({
        to: recipient.email,
        subject: title,
        body: message
      });
      if (result.tooLong) {
        status.dataset.state = 'error';
        status.textContent = 'Thư hơi dài cho liên kết Gmail; mình đã thử sao chép đầy đủ để bạn dán thủ công.';
      } else {
        status.dataset.state = 'success';
        status.textContent = 'Đã yêu cầu mở Gmail gửi đến ' + recipient.name + '. Vui lòng kiểm tra và tự nhấn Gửi.';
      }
      // Do not claim copying worked until the browser confirms it.
      result.copyResult.then(ok => {
        if (ok) {
          status.textContent += ' Tiêu đề, email và nội dung cũng đã được sao chép ♡';
        } else {
          status.dataset.state = 'error';
          status.textContent += ' Trình duyệt không cho phép tự sao chép; bạn vẫn có thể dùng bản nháp Gmail.';
        }
      });
    });
  }
})();
