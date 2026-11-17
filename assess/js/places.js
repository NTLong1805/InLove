/* InLove Places: interactive static memory cards. Works without a backend. */
(() => {
  'use strict';

  // Preserve existing locations, captions and dates from the original repository.
  const places = [
    {
      id: 1, name: 'Seoul Garden', city: 'Hà Nội',
      date: '2024-07-18', displayDate: '18.07.2024',
      image: './assess/img/our1.jpg',
      description: 'Our first hotpot together. So much food, so many laughs.',
      favorite: 'Cheese Tteokbokki', tags: ['food', 'hotpot', 'first date']
    },
    {
      id: 2, name: 'Đà Lạt', city: 'Đà Lạt',
      date: '2024-08-24', displayDate: '24.08.2024',
      image: './assess/img/our2.jpg',
      description: 'Our first trip together. Cold weather, warm hearts.',
      favorite: 'Dâu lắc', tags: ['travel', 'trip', 'dalat']
    },
    {
      id: 3, name: 'Cộng Cà Phê', city: 'Hà Nội',
      date: '2024-09-02', displayDate: '02.09.2024',
      image: './assess/img/our4.jpg',
      description: 'A chill afternoon with you. Love the vibe here.',
      favorite: 'Kem dừa', tags: ['coffee', 'cafe', 'date']
    }
  ];

  const ITEMS_PER_PAGE = 6;
  const $ = selector => document.querySelector(selector);
  const grid = $('#placesGrid');
  const pagination = $('#placesPagination');
  const empty = $('#placesEmpty');
  const search = $('#placesSearch');
  const clear = $('#clearSearch');
  const reset = $('#placesReset');
  const sort = $('#placesSort');
  const resultCount = $('#placesResultCount');
  const total = $('#placesTotal');
  const dialog = $('#placesDialog');
  const dialogClose = $('#placesDialogClose');
  if (!grid || !search || !sort || !resultCount || !pagination || !dialog) return;

  total.textContent = String(places.length);
  let currentPage = 1;
  let results = [...places];
  let previousFocus = null;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function normalize(text) {
    return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('vi-VN').trim();
  }

  function filterPlaces() {
    const query = normalize(search.value);
    const filtered = places.filter(place =>
      normalize([place.name,place.city,place.description,place.favorite,...place.tags].join(' ')).includes(query));
    if (sort.value === 'name') return filtered.sort((a,b) => a.name.localeCompare(b.name,'vi'));
    return filtered.sort((a,b) => sort.value === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  }

  function createCard(place, index) {
    const card = el('article','place-card');
    const figure = el('figure','place-card__media');
    const img = document.createElement('img');
    img.src = place.image;
    img.alt = 'Kỷ niệm tại ' + place.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    figure.append(img, el('span','place-card__index',String(index+1).padStart(2,'0')));
    const content = el('div','place-card__body');
    const meta = el('div','place-card__meta');
    meta.append(el('span','', '♡ ' + place.city));
    const date = el('time','',place.displayDate);
    date.dateTime = place.date;
    meta.append(date);
    content.append(meta,el('h3','place-card__name',place.name));
    content.append(el('p','place-card__description',place.description));
    const favorite = el('p','place-card__favorite','♥ Favorite: ' + place.favorite);
    content.append(favorite);
    const bottom = el('div','place-card__bottom');
    const tags = el('div','place-card__tags');
    place.tags.slice(0,3).forEach(tag=>tags.append(el('span','place-card__tag','#' + tag)));
    const button = el('button','place-card__view','Xem kỷ niệm ↗');
    button.type='button';
    button.dataset.placeId=String(place.id);
    button.setAttribute('aria-label','Xem chi tiết kỷ niệm ' + place.name);
    bottom.append(tags,button);
    content.append(bottom);
    card.append(figure,content);
    return card;
  }

  function render() {
    const start=(currentPage-1)*ITEMS_PER_PAGE;
    const shown=results.slice(start,start+ITEMS_PER_PAGE);
    grid.replaceChildren(...shown.map((place,i)=>createCard(place,start+i)));
    const hasResults=results.length>0;
    empty.hidden=hasResults;
    grid.hidden=!hasResults;
    resultCount.textContent=results.length+' '+(results.length===1?'kỷ niệm':'kỷ niệm được tìm thấy');
    const pages=Math.ceil(results.length/ITEMS_PER_PAGE);
    pagination.replaceChildren();
    if(pages<=1)return;
    function pageButton(label,page,disabled,current) {
      const b=el('button','',''+label);
      b.type='button';
      b.disabled=disabled;
      if(current)b.setAttribute('aria-current','page');
      b.setAttribute('aria-label','Trang '+page);
      b.addEventListener('click',()=>{
        currentPage=page;render();
        $('#places-list')?.scrollIntoView({
          behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',
          block:'start'
        });
      });
      pagination.append(b);
    }
    pageButton('‹',Math.max(1,currentPage-1),currentPage===1,false);
    for(let page=1;page<=pages;page++)pageButton(page,page,false,currentPage===page);
    pageButton('›',Math.min(pages,currentPage+1),currentPage===pages,false);
  }

  function refresh() {
    results=filterPlaces();
    currentPage=1;
    clear.hidden=!search.value.trim();
    render();
  }

  function openPlace(place) {
    previousFocus=document.activeElement;
    const image=$('#placesDialogImage');
    image.src=place.image;
    image.alt='Kỷ niệm tại '+place.name;
    $('#placesDialogMeta').textContent=place.displayDate+' • '+place.city;
    $('#placesDialogTitle').textContent=place.name;
    $('#placesDialogDescription').textContent=place.description;
    $('#placesDialogFavorite').textContent='♥ Món yêu thích: '+place.favorite;
    const tags=$('#placesDialogTags');
    tags.replaceChildren(...place.tags.map(t=>el('span','places-dialog__tag','#'+t)));
    if(typeof dialog.showModal==='function')dialog.showModal();
    else dialog.setAttribute('open','');
    dialogClose.focus();
  }

  function closeDialog() {
    if(dialog.open&&typeof dialog.close==='function')dialog.close();
    else dialog.removeAttribute('open');
    previousFocus?.focus?.();
  }

  grid.addEventListener('click',event=>{
    const button=event.target.closest('button[data-place-id]');
    if(!button||!grid.contains(button))return;
    const place=places.find(p=>p.id===Number(button.dataset.placeId));
    if(place)openPlace(place);
  });
  dialogClose?.addEventListener('click',closeDialog);
  dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog();});
  dialog.addEventListener('close',()=>{
    $('#placesDialogImage').removeAttribute('src');
    previousFocus?.focus?.();
  });
  clear?.addEventListener('click',()=>{search.value='';refresh();search.focus();});
  reset?.addEventListener('click',()=>{search.value='';sort.value='newest';refresh();search.focus();});
  search.addEventListener('input',refresh);
  sort.addEventListener('change',refresh);
  refresh();
})();
