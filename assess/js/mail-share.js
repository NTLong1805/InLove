/* Shared, no-secret mail composer for GitHub Pages. Never sends mail automatically. */
(() => {
  'use strict';
  const recipients = Object.freeze({
    long: Object.freeze({ name: 'Long', email: 'longprolc10@gmail.com' }),
    thu: Object.freeze({ name: 'Thư', email: 'thuminhpham29@gmail.com' })
  });

  function draftText(to, subject, body) {
    return ['To: ' + to, 'Subject: ' + subject, '', body].join('\n');
  }

  async function copy(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch { /* Fall back when clipboard permission is denied. */ }
    try {
      const field = document.createElement('textarea');
      field.value = text;
      field.readOnly = true;
      field.style.cssText = 'position:fixed;left:-9999px;top:0;';
      document.body.appendChild(field);
      field.focus();
      field.select();
      const success = document.execCommand('copy');
      field.remove();
      return Boolean(success);
    } catch {
      return false;
    }
  }

  function gmailUrl({ to, subject, body }) {
    const url = new URL('https://mail.google.com/mail/');
    url.searchParams.set('view', 'cm');
    url.searchParams.set('fs', '1');
    url.searchParams.set('to', to);
    url.searchParams.set('su', subject);
    url.searchParams.set('body', body);
    return url.toString();
  }

  // Start clipboard write during the original click before opening the mail tab.
  // Opening a new tab is never proof that a message was actually sent.
  function copyAndCompose({ to, subject, body }) {
    const copyResult = copy(draftText(to, subject, body));
    const url = gmailUrl({ to, subject, body });
    if (url.length > 7000) {
      return { copyResult, opened: false, tooLong: true };
    }
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      return { copyResult, opened: true, tooLong: false };
    } catch {
      return { copyResult, opened: false, tooLong: false };
    }
  }

  window.InLoveShare = Object.freeze({ recipients, draftText, copy, gmailUrl, copyAndCompose });
})();
