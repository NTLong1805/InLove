/* Pure text-only formatter for Wishlist Gmail/Telegram drafts.
 * No secrets, network calls or storage; safe for GitHub Pages.
 */
(() => {
  'use strict';

  const recipientNames = Object.freeze({ thu: 'Thư', long: 'Long' });

  function suggestedSubject(scope, activeRecipient) {
    return scope === 'all'
      ? '💌 Những điều ước nhỏ của chúng mình | Long & Thư'
      : '💝 Wishlist dành tặng ' + recipientNames[activeRecipient === 'long' ? 'long' : 'thu'] + ' | InLove';
  }

  function format({ gifts, scope, activeRecipient, to, subject, personalNote, includeSamples, categories }) {
    const people = scope === 'all' ? ['thu','long'] : [activeRecipient === 'long' ? 'long' : 'thu'];
    const selected = (Array.isArray(gifts) ? gifts : []).filter(gift =>
      people.includes(gift.recipient) && (includeSamples || !gift.sample)
    );
    const gifted = selected.filter(gift => gift.gifted).length;
    const pending = selected.length - gifted;
    const cleanSubject = String(subject || '').trim().slice(0, 120);
    const cleanNote = String(personalNote || '').trim().slice(0, 500);
    const toName = to?.name || 'người thương';
    const toEmail = to?.email || '';

    const lines = [
      'Gửi ' + toName + ' thương mến ♡,',
      '',
      'Có những món quà không cần thật lớn lao,',
      'chỉ cần mình nhớ đến nhau là đã đủ đặc biệt rồi. 💗',
    ];
    if (cleanNote) lines.push('', '💌 Lời nhắn dành riêng cho cậu:', cleanNote);
    lines.push(
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '             OUR GIFT WISHLIST ♡',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━',
      'Tổng cộng: ' + selected.length + ' món | Chưa tặng: ' + pending + ' | Đã tặng: ' + gifted
    );

    people.forEach(person => {
      const list = selected.filter(gift => gift.recipient === person);
      const name = recipientNames[person];
      lines.push('', (person === 'thu' ? '🎀' : '🎁') + ' DÀNH TẶNG ' + name.toLocaleUpperCase('vi-VN') + ' (' + list.length + ' món)');
      if (!list.length) {
        lines.push('Chưa có món quà nào trong danh sách này.');
        return;
      }
      const groups = [
        { items: list.filter(g => !g.gifted), heading: '♡ ĐANG MONG CHỜ' },
        { items: list.filter(g => g.gifted), heading: '✓ ĐÃ TẶNG' },
      ];
      groups.forEach(group => {
        if (!group.items.length) return;
        lines.push('', group.heading + ' (' + group.items.length + ')');
        group.items.forEach((gift, index) => {
          const meta = categories[gift.category] || categories.other || { icon:'🎁', label:'Món quà' };
          lines.push((index + 1) + '. ' + meta.icon + ' ' + String(gift.name || '').trim() +
            (gift.sample ? ' [Gợi ý mẫu]' : ''));
          lines.push('   Loại: ' + meta.label);
          if (gift.note?.trim()) lines.push('   Ghi chú: ' + gift.note.trim());
          if (gift.url) lines.push('   Tham khảo: ' + gift.url);
        });
      });
    });

    lines.push(
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━',
      'Dù là món quà gì, điều đáng quý nhất vẫn là chúng mình ♡',
      'With love,',
      'InLove — Long & Thư'
    );

    const body = lines.join('\n');
    const complete = 'To: ' + toEmail + '\nSubject: ' + cleanSubject + '\n\n' + body;
    return {
      subject: cleanSubject,
      body,
      complete,
      toEmail,
      toName,
      count: selected.length,
      pending,
      gifted,
      valid: Boolean(toEmail && cleanSubject && selected.length),
    };
  }

  window.InLoveWishlistEmail = Object.freeze({ suggestedSubject, format });
})();
