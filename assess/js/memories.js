/* InLove memory timeline + gallery; no Swiper dependency. */
(() => {
  'use strict';
  const photo = file => './assess/img/' + file;
  const albums = Object.freeze({
    long: { title: 'Long, through my eyes ♡', label: 'Long', files: ['Long.jpg','Long1.jpg','Long2.jpg','Long3.jpg','Long4.jpg','Long5.jpg','long6.jpg'] },
    thu: { title: 'Thư, my favourite smile ♡', label: 'Thư', files: ['Thu1.jpg','Thu2.jpg','Thu3.jpg','Thu4.jpg','Thu5.jpg','thu6.jpg','thu7.jpg','thu8.jpg','thu9.jpg','thu10.jpg','thu11.jpg','thu12.jpg','thu13.jpg','thu14.jpg','thu15.jpg','thu16.jpg'] },
    ours: { title: 'The moments we share ♡', label: 'Us', files: ['our1.jpg','our2.jpg','out3.jpg','our4.jpg','our5.jpg','our6.jpg','our7.jpg'] },
  });
  const gallery = document.getElementById('gallery-grid');
  const tabs = [...document.querySelectorAll('.gallery__album-tab')];
  const panel = document.getElementById('gallery-panel');
  const albumTitle = document.getElementById('gallery-album-title');
  const count = document.getElementById('gallery-photo-count');
  const dialog = document.getElementById('memories-lightbox');
  const fullImage = document.getElementById('memories-lightbox-image');
  const lightboxTitle = document.getElementById('memories-lightbox-title');
  const lightboxCount = document.getElementById('memories-lightbox-count');
  const prev = document.getElementById('memories-lightbox-prev');
  const next = document.getElementById('memories-lightbox-next');
  const close = document.getElementById('memories-lightbox-close');
  if (!gallery || !dialog || !fullImage) return;

  let album = 'long';
  let displayedPhotos = [];
  let imageIndex = 0;
  let previousFocus = null;

  function showImage() {
    const item = displayedPhotos[imageIndex];
    if (!item) return;
    fullImage.src = item.src;
    fullImage.alt = item.caption;
    lightboxTitle.textContent = item.caption;
    lightboxCount.textContent = displayedPhotos.length > 1 ? (imageIndex + 1) + ' / ' + displayedPhotos.length : 'Our memories ♡';
    prev.hidden = next.hidden = displayedPhotos.length <= 1;
  }

  function openImages(photos, initialIndex) {
    if (!photos.length) return;
    displayedPhotos = photos;
    imageIndex = initialIndex;
    previousFocus = document.activeElement;
    showImage();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open','');
    close.focus();
  }

  function closeLightbox() {
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
    fullImage.removeAttribute('src');
    previousFocus?.focus?.();
  }

  function move(delta) {
    if (!displayedPhotos.length) return;
    imageIndex = (imageIndex + delta + displayedPhotos.length) % displayedPhotos.length;
    showImage();
  }

  close?.addEventListener('click', closeLightbox);
  prev?.addEventListener('click', () => move(-1));
  next?.addEventListener('click', () => move(1));
  dialog.addEventListener('click', event => { if (event.target === dialog) closeLightbox(); });
  dialog.addEventListener('close', () => {
    fullImage.removeAttribute('src');
    previousFocus?.focus?.();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
  });

  function renderGallery(key) {
    const chosen = albums[key];
    if (!chosen) return;
    album = key;
    albumTitle.textContent = chosen.title;
    count.textContent = chosen.files.length + ' photos';
    tabs.forEach(tab => {
      const active = tab.dataset.album === key;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active) panel.setAttribute('aria-labelledby', tab.id);
    });
    const fragment = document.createDocumentFragment();
    chosen.files.forEach((file, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'gallery__tile';
      const caption = chosen.label + ' — kỷ niệm ' + (index + 1);
      button.setAttribute('aria-label', 'Xem ảnh ' + caption);
      button.dataset.index = String(index);
      const img = document.createElement('img');
      img.src = photo(file);
      img.alt = caption;
      img.loading = 'lazy';
      img.decoding = 'async';
      const overlay = document.createElement('span');
      overlay.className = 'gallery__tile-overlay';
      overlay.textContent = 'View memory ↗';
      overlay.setAttribute('aria-hidden','true');
      button.append(img, overlay);
      fragment.append(button);
    });
    gallery.replaceChildren(fragment);
  }

  gallery.addEventListener('click', event => {
    const tile = event.target.closest('button.gallery__tile');
    if (!tile || !gallery.contains(tile)) return;
    const chosen = albums[album];
    openImages(chosen.files.map((file, i) => ({
      src: photo(file), caption: chosen.label + ' — kỷ niệm ' + (i + 1)
    })), Number(tile.dataset.index));
  });

  tabs.forEach(tab => tab.addEventListener('click', () => renderGallery(tab.dataset.album)));
  document.querySelector('.gallery__album-switch')?.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const keys = Object.keys(albums);
    const index = keys.indexOf(album);
    let nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? keys.length-1 :
      (index + (event.key === 'ArrowRight' ? 1 : -1) + keys.length) % keys.length;
    renderGallery(keys[nextIndex]);
    tabs[nextIndex].focus();
  });

  const diary = document.getElementById('diary-timeline');
  diary?.addEventListener('click', event => {
    const trigger = event.target.closest('button[data-story-image]');
    if (!trigger || !diary.contains(trigger)) return;
    const caption = trigger.dataset.storyCaption || 'Our Diary';
    openImages([{ src:trigger.dataset.storyImage, caption }], 0);
  });

  renderGallery(album);
})();
