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
    refreshEmailPreview();
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
    if (shareRecipient) shareRecipient.value = value;
    subjectEdited = false;
    syncSubject();
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

  // Compose beautiful plain-text emails with a visible preview.
  // No automatic sending is possible from static GitHub Pages.
  const shareScope = document.getElementById('wishlist-share-scope');
  const shareRecipient = document.getElementById('wishlist-share-recipient');
  const emailSubject = document.getElementById('wishlist-email-subject');
  const emailNote = document.getElementById('wishlist-email-note');
  const includeSamples = document.getElementById('wishlist-include-samples');
  const emailSummary = document.getElementById('wishlist-email-summary');
  const emailPreview = document.getElementById('wishlist-email-preview');
  const richPreview = document.getElementById('wishlist-rich-preview');
  const shareStatus = document.getElementById('wishlist-share-status');
  const shareButtons = Array.from(document.querySelectorAll('[data-wishlist-share]'));
  const mail = window.InLoveShare;
  const formatter = window.InLoveWishlistEmail;
  const rich = window.InLoveWishlistRich;
  let subjectEdited = false;

  function syncSubject() {
    if (!subjectEdited && formatter && emailSubject) {
      emailSubject.value = formatter.suggestedSubject(shareScope?.value, recipient);
    }
  }

  function buildEmail() {
    if (!formatter || !mail) return null;
    const to = mail.recipients[shareRecipient?.value || recipient];
    if (!to) return null;
    return formatter.format({
      gifts,
      scope: shareScope?.value || 'current',
      activeRecipient: recipient,
      to,
      subject: emailSubject?.value,
      personalNote: emailNote?.value,
      includeSamples: includeSamples?.checked === true,
      categories,
    });
  }

  function setShareStatus(message, error) {
    if (!shareStatus) return;
    shareStatus.textContent = message;
    shareStatus.dataset.state = error ? 'error' : 'success';
  }

  function refreshEmailPreview() {
    const email = buildEmail();
    if (!email) {
      shareButtons.forEach(button => { button.disabled = true; });
      if (emailSummary) emailSummary.textContent = 'Không thể chuẩn bị email. Vui lòng tải lại trang.';
      return;
    }

    if (emailPreview) emailPreview.value = email.complete;
    if (richPreview) richPreview.srcdoc = (email.valid && rich)
      ? rich.render(email, categories)
      : '<!doctype html><html lang="vi"><body style="font:15px Arial,sans-serif;color:#985b77;text-align:center;padding:60px 18px;background:#fff7fb">Hãy thêm quà và nhập tiêu đề để xem thiệp email ♡</body></html>';
    shareButtons.forEach(button => { button.disabled = !email.valid; });
    if (emailSummary) {
      const missingSubject = !email.subject;
      emailSummary.dataset.empty = String(!email.valid);
      emailSummary.textContent = email.count === 0
        ? '♡ Chưa có món quà thật nào để gửi. Hãy thêm quà hoặc bật tùy chọn gợi ý mẫu.'
        : missingSubject
          ? '♡ Đã chọn ' + email.count + ' món, nhưng cần nhập tiêu đề email trước khi gửi.'
          : '♡ ' + email.count + ' món quà · ' + email.pending + ' chưa tặng · ' +
            email.gifted + ' đã tặng · Gửi tới ' + email.toName + '.';
    }
  }

  // Form changes update the preview immediately without overwriting a custom subject.
  shareScope?.addEventListener('change', () => {
    syncSubject();
    refreshEmailPreview();
  });
  shareRecipient?.addEventListener('change', refreshEmailPreview);
  emailSubject?.addEventListener('input', () => {
    subjectEdited = true;
    refreshEmailPreview();
  });
  emailNote?.addEventListener('input', refreshEmailPreview);
  includeSamples?.addEventListener('change', refreshEmailPreview);

  shareButtons.forEach(button => {
    button.addEventListener('click', () => {
      const mode = button.dataset.wishlistShare;
      const email = buildEmail();
      if (!email || !email.valid || !mail) {
        setShareStatus('Hãy chọn người nhận, nhập tiêu đề và có ít nhất một món quà trước khi gửi nhé ♡', true);
        return;
      }
      const html = rich?.render(email, categories) || '';
      if (mode === 'copy') {
        void rich.copyRich(html, email.body).then(format => {
          setShareStatus(
            format === 'html'
              ? 'Đã sao chép thiệp HTML có màu sắc và thẻ quà. Mở Gmail rồi dán (Ctrl+V hoặc ⌘V) vào phần nội dung nhé ♡'
              : format === 'text'
                ? 'Trình duyệt chỉ sao chép được văn bản. Bạn có thể dán nội dung vào Gmail, nhưng sẽ không có kiểu dáng HTML.'
                : 'Không sao chép được. Hãy thử lại trên Chrome/Edge bằng HTTPS hoặc sử dụng bản văn bản dự phòng.',
            format !== 'html'
          );
        });
        return;
      }
      if (mode === 'gmail') {
        // Open Gmail with To/Subject already set and EMPTY body. Rich HTML can only
        // be inserted by the user pasting the HTML clipboard into the compose editor.
        // Clipboard write must start immediately from the click's user activation.
        const copyResult = rich.copyRich(html, email.body);
        const url = mail.gmailUrl({ to:email.toEmail, subject:email.subject, body:'' });
        try {
          window.open(url, '_blank', 'noopener,noreferrer');
        } catch {
          setShareStatus('Không mở được Gmail tự động. Hãy mở Gmail thủ công rồi dán thiệp đã sao chép.', true);
        }
        copyResult.then(format => {
          setShareStatus(
            format === 'html'
              ? 'Đã sao chép thiệp HTML! Trong Gmail gửi đến ' + email.toName +
                ', nhấn Ctrl+V (Mac: ⌘V) trong ô nội dung rồi kiểm tra và nhấn Gửi ♡'
              : format === 'text'
                ? 'Gmail đã được yêu cầu mở nhưng trình duyệt chỉ cho sao chép văn bản. Nhấn Ctrl+V trong Gmail; định dạng màu có thể không giữ được.'
                : 'Không sao chép được thiệp. Bạn có thể dùng bản văn bản dự phòng ở phần xem trước để gửi thủ công.',
            format !== 'html'
          );
        });
        return;
      }
      if (mode === 'telegram') {
        // Telegram only opens a share sheet. It cannot target an email address.
        const telegram = new URL('https://t.me/share/url');
        telegram.searchParams.set('url', window.location.href.split('#')[0] + '#wishlist');
        telegram.searchParams.set('text', email.subject + '\n\n' + email.body);
        const copyResult = mail.copy(email.complete);
        if (telegram.href.length > 5500) {
          setShareStatus('Tin nhắn quá dài. Đang thử sao chép để bạn dán vào Telegram thủ công.', true);
        } else {
          window.open(telegram.href, '_blank', 'noopener,noreferrer');
          setShareStatus('Đã yêu cầu mở Telegram. Hãy chọn cuộc trò chuyện, kiểm tra rồi tự nhấn Gửi.', false);
        }
        copyResult.then(ok => {
          if (ok) setShareStatus(shareStatus.textContent + ' Nội dung cũng đã được sao chép.', shareStatus.dataset.state === 'error');
          else setShareStatus(shareStatus.textContent + ' Nếu cần, hãy sao chép bản xem trước.', true);
        });
      }
    });
  });

  syncSubject();
  setRecipient(recipient);
})();
