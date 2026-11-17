/* InLove: local-first gift wishlist. No backend or shared cross-device storage. */
(() => {
  'use strict';

  const grid = document.getElementById('wishlist-grid');
  const form = document.getElementById('wishlist-form');
  if (!grid || !form) return;

  const KEY = 'inlove-gift-wishlist-v1';
  const tabs = Array.from(document.querySelectorAll('.wishlist__tab'));
  const panel = document.getElementById('wishlist-panel');
  const empty = document.getElementById('wishlist-empty');
  const total = document.getElementById('wishlist-total');
  const giftedCount = document.getElementById('wishlist-gifted');
  const feedback = document.getElementById('wishlist-feedback');
  const nameInput = document.getElementById('wishlist-name');
  const categoryInput = document.getElementById('wishlist-category');
  const urlInput = document.getElementById('wishlist-url');
  const noteInput = document.getElementById('wishlist-note');

  const categories = Object.freeze({
    flowers: { label: 'Hoa & cây', icon: '🌷' },
    memories: { label: 'Kỷ niệm', icon: '📸' },
    date: { label: 'Buổi hẹn', icon: '💌' },
    book: { label: 'Sách', icon: '📖' },
    other: { label: 'Món quà', icon: '🎁' },
  });
  // Examples are intentionally not presented as the couple's actual preferences.
  const examples = [
    { id: 'sample-thu-1', recipient: 'thu', name: 'Một bó hoa bất ngờ', category: 'flowers', note: 'Gợi ý mẫu — có thể chỉnh danh sách theo sở thích của Thư.', url: '', gifted: false, sample: true },
    { id: 'sample-thu-2', recipient: 'thu', name: 'Buổi hẹn hò bí mật', category: 'date', note: 'Gợi ý mẫu — một kỷ niệm thật đáng yêu.', url: '', gifted: false, sample: true },
    { id: 'sample-long-1', recipient: 'long', name: 'Album ảnh nhỏ', category: 'memories', note: 'Gợi ý mẫu — lưu lại những khoảnh khắc bên nhau.', url: '', gifted: false, sample: true },
    { id: 'sample-long-2', recipient: 'long', name: 'Một quyển sách hay', category: 'book', note: 'Gợi ý mẫu — có thể đổi thành món quà Long mong muốn.', url: '', gifted: false, sample: true },
  ];
  let recipient = 'thu';

  function safeUrl(raw) {
    if (!raw) return '';
    try {
      const url = new URL(String(raw).trim());
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
    } catch { return ''; }
  }

  function normalize(value) {
    if (!value || !['thu', 'long'].includes(value.recipient)) return null;
    const name = String(value.name || '').trim().slice(0, 80);
    if (!name) return null;
    return {
      id: String(value.id || '').slice(0, 90),
      recipient: value.recipient,
      name,
      category: categories[value.category] ? value.category : 'other',
      note: String(value.note || '').slice(0, 180),
      url: safeUrl(value.url),
      gifted: value.gifted === true,
      sample: value.sample === true,
    };
  }

  function readStored() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === null) return examples.map(item => ({...item}));
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed.map(normalize).filter(Boolean).slice(0, 200);
    } catch { /* Storage may be disabled; keep the page interactive. */ }
    return examples.map(item => ({...item}));
  }

  let gifts = readStored();
  const persist = () => {
    try { localStorage.setItem(KEY, JSON.stringify(gifts)); }
    catch { feedback.textContent = 'Trình duyệt chưa cho phép lưu dữ liệu; thay đổi chỉ có trong phiên này.'; }
  };
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function action(label, className, type, id) {
    const button = el('button', className, label);
    button.type = 'button';
    button.dataset.action = type;
    button.dataset.id = id;
    return button;
  }
  function createCard(gift) {
    const card = el('article', 'wishlist__card');
    card.dataset.gifted = String(gift.gifted);
    const head = el('div', 'wishlist__card-top');
    const icon = el('span', 'wishlist__icon', categories[gift.category].icon);
    icon.setAttribute('aria-hidden', 'true');
    const badge = el('span', 'wishlist__badge', gift.gifted ? '✓ Đã tặng' : (gift.sample ? 'Gợi ý mẫu' : '♡ Đang ước'));
    head.append(icon, badge);
    card.append(head, el('h3', 'wishlist__name', gift.name));
    card.append(el('p', 'wishlist__note', gift.note || categories[gift.category].label));
    const footer = el('div', 'wishlist__card-footer');
    const toggle = action(gift.gifted ? '↶ Chưa tặng' : '♡ Đánh dấu đã tặng', 'wishlist__action' + (gift.gifted ? ' wishlist__action--gifted' : ''), 'toggle', gift.id);
    toggle.setAttribute('aria-label', (gift.gifted ? 'Đánh dấu chưa tặng: ' : 'Đánh dấu đã tặng: ') + gift.name);
    footer.append(toggle);
    if (gift.url) {
      const link = el('a', 'wishlist__action', 'Xem quà ↗');
      link.href = gift.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', 'Xem liên kết món quà: ' + gift.name + ' (mở tab mới)');
      footer.append(link);
    }
    const remove = action('Xóa', 'wishlist__delete', 'remove', gift.id);
    remove.setAttribute('aria-label', 'Xóa món quà: ' + gift.name);
    footer.append(remove);
    card.append(footer);
    return card;
  }

  function render() {
    const selected = gifts.filter(gift => gift.recipient === recipient);
    const ordered = [...selected].sort((a, b) => Number(a.gifted) - Number(b.gifted));
    grid.replaceChildren(...ordered.map(createCard));
    empty.hidden = selected.length > 0;
    total.textContent = String(selected.length);
    giftedCount.textContent = String(selected.filter(gift => gift.gifted).length);
  }

  function setRecipient(value) {
    recipient = value;
    tabs.forEach(tab => {
      const active = tab.dataset.recipient === value;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active) panel.setAttribute('aria-labelledby', tab.id);
    });
    feedback.textContent = '';
    render();
  }

  tabs.forEach(tab => tab.addEventListener('click', () => setRecipient(tab.dataset.recipient)));
  document.querySelector('.wishlist__tabs')?.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' || event.key === 'ArrowLeft' ? 'thu' : 'long';
    setRecipient(next);
    tabs.find(tab => tab.dataset.recipient === next)?.focus();
  });

  grid.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button || !grid.contains(button)) return;
    const index = gifts.findIndex(gift => gift.id === button.dataset.id);
    if (index < 0) return;
    if (button.dataset.action === 'toggle') {
      gifts[index].gifted = !gifts[index].gifted;
      feedback.textContent = gifts[index].gifted ? 'Đã ghi nhận một món quà được trao đi ♡' : 'Đã chuyển về danh sách chờ tặng ♡';
    } else if (button.dataset.action === 'remove') {
      gifts.splice(index, 1);
      feedback.textContent = 'Đã xóa món quà khỏi danh sách.';
    }
    persist();
    render();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = nameInput.value.trim().slice(0, 80);
    if (!name) { nameInput.focus(); return; }
    if (gifts.length >= 200) {
      feedback.textContent = 'Danh sách tối đa 200 món quà.';
      return;
    }
    const rawUrl = urlInput.value.trim();
    const url = safeUrl(rawUrl);
    if (rawUrl && !url) {
      feedback.textContent = 'Vui lòng dùng đường dẫn bắt đầu bằng https:// hoặc http://.';
      urlInput.focus();
      return;
    }
    gifts.unshift({
      id: 'gift-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9),
      recipient, name, category: categoryInput.value,
      note: noteInput.value.trim().slice(0, 180),
      url, gifted: false, sample: false,
    });
    persist();
    form.reset();
    feedback.textContent = 'Đã thêm món quà mới vào wishlist ♡';
    render();
    nameInput.focus();
  });

  // Keep separate tabs in the same browser in sync. Devices are not synchronized.
  window.addEventListener('storage', event => {
    if (event.key === KEY) {
      gifts = readStored();
      render();
    }
  });

  // Share the actual local data, not just a page URL: localStorage is device-specific.
  // Gmail/Telegram receive only a user-approved draft; we never send automatically.
  const shareScope = document.getElementById('wishlist-share-scope');
  const shareEmail = document.getElementById('wishlist-share-email');
  const shareStatus = document.getElementById('wishlist-share-status');
  const shareButtons = Array.from(document.querySelectorAll('[data-wishlist-share]'));

  function shareMessage() {
    const who = shareScope && shareScope.value === 'all' ? ['thu', 'long'] : [recipient];
    const lines = ['♡ INLOVE — OUR GIFT WISHLIST', '', 'Những món quà nhỏ dành cho nhau ♡'];
    who.forEach(person => {
      const list = gifts.filter(gift => gift.recipient === person);
      lines.push('', person === 'thu' ? '🎀 DÀNH TẶNG THƯ' : '🎁 DÀNH TẶNG LONG');
      if (!list.length) {
        lines.push('Chưa có món quà nào.');
        return;
      }
      list.forEach((gift, i) => {
        lines.push((i + 1) + '. ' + categories[gift.category].icon + ' ' + gift.name +
          (gift.sample ? ' [Gợi ý mẫu]' : ''));
        lines.push('   ' + (gift.gifted ? '✓ Đã tặng' : '♡ Chưa tặng'));
        if (gift.note.trim()) lines.push('   Lời nhắn: ' + gift.note.trim());
        if (gift.url) lines.push('   Link: ' + gift.url);
      });
    });
    lines.push('', 'Made with ♡ by InLove');
    return lines.join('\n');
  }

  function setShareStatus(message, error) {
    if (!shareStatus) return;
    shareStatus.textContent = message;
    shareStatus.dataset.state = error ? 'error' : 'success';
  }

  async function copyShareText(message) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
        setShareStatus('Đã sao chép toàn bộ wishlist! Bạn có thể dán vào Gmail hoặc Telegram ♡', false);
        return;
      }
      // Clipboard API may not exist in embedded/insecure browsers.
      const temporary = document.createElement('textarea');
      temporary.value = message;
      temporary.setAttribute('readonly', '');
      temporary.style.position = 'fixed';
      temporary.style.left = '-9999px';
      document.body.append(temporary);
      temporary.select();
      const copied = document.execCommand && document.execCommand('copy');
      temporary.remove();
      if (!copied) throw new Error('Clipboard unavailable');
      setShareStatus('Đã sao chép toàn bộ wishlist ♡', false);
    } catch {
      setShareStatus('Không thể sao chép tự động. Hãy mở trang bằng HTTPS hoặc thử trình duyệt khác.', true);
    }
  }

  shareButtons.forEach(button => {
    button.addEventListener('click', () => {
      const mode = button.dataset.wishlistShare;
      const message = shareMessage();
      if (mode === 'copy') {
        void copyShareText(message);
        return;
      }

      let target;
      if (mode === 'gmail') {
        const email = shareEmail ? shareEmail.value.trim() : '';
        if (email && !shareEmail.checkValidity()) {
          setShareStatus('Địa chỉ email chưa hợp lệ. Vui lòng kiểm tra lại.', true);
          shareEmail.focus();
          return;
        }
        target = new URL('https://mail.google.com/mail/');
        target.searchParams.set('view', 'cm');
        target.searchParams.set('fs', '1');
        if (email) target.searchParams.set('to', email);
        target.searchParams.set('su', 'Our Gift Wishlist ♡ | Long & Thư');
        target.searchParams.set('body', message);
      } else if (mode === 'telegram') {
        // Telegram requires a URL parameter; the gift content is in the text.
        target = new URL('https://t.me/share/url');
        const currentPage = window.location.href.split('#')[0] + '#wishlist';
        target.searchParams.set('url', currentPage);
        target.searchParams.set('text', message);
      } else {
        return;
      }

      // Query-string sharing can exceed URL limits with long wishlists.
      // Never silently truncate a gift; offer the complete text via copy instead.
      if (target.href.length > 5500) {
        setShareStatus('Wishlist hơi dài để mở bản nháp bằng đường dẫn. Hãy chọn “Copy wishlist” rồi dán vào ứng dụng nhé.', true);
        return;
      }

      window.open(target.href, '_blank', 'noopener,noreferrer');
      setShareStatus(
        mode === 'gmail'
          ? 'Đã yêu cầu mở Gmail. Kiểm tra người nhận và nội dung, sau đó nhấn Gửi trong Gmail nhé ♡'
          : 'Đã yêu cầu mở Telegram. Chọn cuộc trò chuyện, kiểm tra nội dung và tự nhấn gửi nhé ♡',
        false
      );
    });
  });

  setRecipient(recipient);
})();
