/* Branded, inline-styled HTML email plus rich clipboard fallback for Gmail. */
(() => {
  'use strict';
  const escapeHtml = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const multiline = value => escapeHtml(value).replace(/\r\n?/g, '\n').replace(/\n/g, '<br>');
  const safeUrl = value => {
    try { const u = new URL(String(value)); return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : ''; }
    catch { return ''; }
  };
  const people = { thu:{name:'Thư',icon:'🎀'}, long:{name:'Long',icon:'🎁'} };
  const font = 'font-family:Arial,Helvetica,sans-serif;';
  function giftCard(gift, categories) {
    const meta = categories[gift.category] || categories.other || {icon:'🎁',label:'Món quà'};
    const url = safeUrl(gift.url);
    const note = gift.note ? '<p style="margin:8px 0 0;color:#876276;font-size:13px;line-height:1.7;' + font + '">' + multiline(gift.note) + '</p>' : '';
    const link = url ? '<p style="margin:10px 0 0"><a href="' + escapeHtml(url) + '" style="color:#b13c77;text-decoration:underline;font-size:13px;' + font + '">Xem món quà ↗</a></p>' : '';
    return '<tr><td style="padding:0 0 12px"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#ffffff;border:1px solid #f3d9e5;border-radius:14px">' +
      '<tr><td style="padding:16px 17px">' +
      '<p style="margin:0 0 8px;color:#c95187;font-size:12px;' + font + '">' + escapeHtml(meta.icon) + ' ' + escapeHtml(meta.label) + (gift.sample ? ' · Gợi ý mẫu' : '') + '</p>' +
      '<p style="margin:0 0 7px;font-size:17px;line-height:1.5;color:#63384d;font-weight:bold;' + font + '">' + escapeHtml(gift.name) + '</p>' +
      '<p style="margin:0;color:' + (gift.gifted ? '#24805d' : '#b44c7b') + ';font-size:12px;font-weight:bold;' + font + '">' + (gift.gifted ? '✓ Đã tặng' : '♡ Chưa tặng') + '</p>' +
      note + link + '</td></tr></table></td></tr>';
  }
  function section(person, email, categories) {
    const settings = people[person] || people.thu;
    const list = email.selected.filter(gift => gift.recipient === person);
    if (!list.length) return '';
    const pending = list.filter(g => !g.gifted);
    const gifted = list.filter(g => g.gifted);
    const heading = (label,count) => '<tr><td style="padding:15px 0 11px;color:#87546b;font-size:13px;font-weight:bold;' + font + '">' + label + ' (' + count + ')</td></tr>';
    return '<tr><td style="padding:29px 0 7px"><h2 style="margin:0;color:#bb427f;font-size:21px;' + font + '">' + settings.icon + ' Dành tặng ' + settings.name + '</h2></td></tr>' +
      (pending.length ? heading('♡ Những điều mong chờ',pending.length) + pending.map(g => giftCard(g,categories)).join('') : '') +
      (gifted.length ? heading('✓ Những món quà đã trao',gifted.length) + gifted.map(g => giftCard(g,categories)).join('') : '');
  }
  function render(email, categories) {
    if (!email || !email.valid || !email.selected) return '';
    const note = email.personalNote ? '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff0f6;border-left:4px solid #d75792;border-radius:9px"><tr><td style="padding:17px 18px">' +
      '<p style="margin:0 0 8px;color:#b23d7a;font-size:12px;font-weight:bold;' + font + '">💌 LỜI NHẮN DÀNH RIÊNG CHO CẬU</p>' +
      '<p style="margin:0;color:#63384d;line-height:1.8;font-size:14px;' + font + '">' + multiline(email.personalNote) + '</p></td></tr></table>' : '';
    const stats = [
      [email.count,'Món quà','#bd427d'],
      [email.pending,'Mong chờ','#bd427d'],
      [email.gifted,'Đã tặng','#24805d']
    ].map((item,i) => '<td width="33%" align="center" style="padding:18px 5px;' + (i<2?'border-right:1px solid #efd6e0;':'') + '">' +
      '<strong style="font-size:25px;color:' + item[2] + ';' + font + '">' + item[0] + '</strong><br><span style="font-size:11px;color:#986a80;' + font + '">' + item[1] + '</span></td>').join('');
    return '<!doctype html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
      '<body style="margin:0;padding:0;background:#fff3f8">' +
      '<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#fff3f8"><tr><td align="center" style="padding:26px 12px 40px">' +
      '<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fffafd;border:1px solid #f1cddd;border-radius:19px">' +
      '<tr><td align="center" style="background:#d45d92;padding:38px 20px 34px;border-radius:18px 18px 0 0">' +
      '<p style="margin:0 0 12px;color:#ffebf4;font-size:12px;letter-spacing:2px;font-weight:bold;' + font + '">A LITTLE GIFT, A LOT OF LOVE</p>' +
      '<h1 style="margin:0 0 13px;color:#ffffff;font-size:37px;line-height:1.3;font-family:Georgia,serif">Our Gift Wishlist ♡</h1>' +
      '<p style="margin:0;color:#ffeef6;font-size:13px;' + font + '">Long &amp; Thư · Made with love</p></td></tr>' +
      '<tr><td style="padding:33px 27px 0">' +
      '<h2 style="margin:0 0 15px;color:#63384d;font-size:21px;' + font + '">Gửi ' + escapeHtml(email.toName) + ' thương mến ♡,</h2>' +
      '<p style="margin:0 0 18px;color:#825e72;font-size:14px;line-height:1.85;' + font + '">Có những món quà không cần thật lớn lao. Chỉ cần chúng mình luôn nhớ đến nhau, mỗi điều nhỏ bé cũng trở nên đặc biệt. 💗</p>' +
      note + '</td></tr>' +
      '<tr><td style="padding:26px 27px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff0f6;border-radius:14px"><tr>' + stats + '</tr></table></td></tr>' +
      '<tr><td style="padding:0 27px 21px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + email.people.map(p => section(p,email,categories)).join('') + '</table></td></tr>' +
      '<tr><td align="center" style="padding:28px 20px 30px;border-top:1px solid #f1d8e4;background:#fff0f6;border-radius:0 0 18px 18px">' +
      '<p style="margin:0 0 8px;color:#63384d;font-size:15px;font-weight:bold;' + font + '">Dù là món quà gì, quan trọng nhất vẫn là chúng mình ♡</p>' +
      '<p style="margin:0;color:#b94981;font-size:13px;' + font + '">With love, InLove — Long &amp; Thư</p>' +
      '</td></tr></table></td></tr></table></body></html>';
  }
  async function copyRich(html,plain) {
    if (html && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      try {
        await navigator.clipboard.write([new ClipboardItem({
          'text/html': new Blob([html],{type:'text/html'}),
          'text/plain': new Blob([plain],{type:'text/plain'})
        })]);
        return 'html';
      } catch { /* Try a plain text fallback. */ }
    }
    if (window.InLoveShare?.copy && await window.InLoveShare.copy(plain)) return 'text';
    return 'failed';
  }
  window.InLoveWishlistRich = Object.freeze({render,copyRich});
})();