/* ==========================================================================
   common.js — 모든 페이지 공통 동작
   사용법: </body> 바로 앞에 <script src="common.js"></script> 한 줄 추가

   1. 헤더 검색창
      <div class="search">안내 문구</div> 를 찾아서
      입력칸 + 돋보기 버튼 + 최근/급상승 검색어 패널로 바꿔 준다. (스타일은 common.css)
      - 최근 검색어, '저장 끄기' 설정은 localStorage에 저장 (이 브라우저에만)
   * 페이지 코드와 이름이 겹치지 않도록 전체를 함수로 감싸 둔다.
   ========================================================================== */
(function () {
  const search = document.querySelector('.header .search');
  if (!search) return;

  /* 급상승 검색어: [검색어, 상태] — 상태: 'same'(—) / 'up'(▲) / 'new'(NEW) */
  const HOT = [
    ['선크림', 'same'], ['메디힐 마스크팩', 'same'], ['아누아 미스트', 'up'], ['펜슬라이너', 'up'], ['쿠션', 'same'],
    ['단백질쉐이크', 'new'], ['세라마이드', 'new'], ['아이팔레트', 'new'], ['캡슐토너', 'new'], ['바디로션', 'new'],
  ];
  const ST = { same: '<span class="st">&mdash;</span>', up: '<span class="st up">&#9650;</span>', new: '<span class="st">NEW</span>' };
  const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="7"/><path d="M15.8 15.8 21 21"/></svg>';

  /* ---------- 검색창 안을 입력칸 + 버튼 + 패널로 교체 ---------- */
  const placeholder = search.textContent.trim() || '상품, 브랜드, 성분 검색';
  search.innerHTML = `
    <input type="search" placeholder="${placeholder}" autocomplete="off" aria-label="검색어">
    <button class="search-btn" aria-label="검색">${ICON}</button>
    <div class="search-panel">
      <section>
        <h3>최근 검색어</h3>
        <ul class="recent"></ul>
        <div class="foot"><button class="clear">전체 삭제</button><button class="save">검색어 저장 끄기</button></div>
      </section>
      <section>
        <h3>급상승 검색어</h3>
        <ul class="hot">${HOT.map(([w, st], i) => `<li><span class="rank">${i + 1}</span><a>${w}</a>${ST[st]}</li>`).join('')}</ul>
        <div class="foot hot-time"></div>
      </section>
    </div>`;

  const q = search.querySelector('input');
  const recentEl = search.querySelector('.recent');
  const saveBtn = search.querySelector('.save');

  /* ---------- 저장 (localStorage가 막혀 있어도 동작하게 try) ---------- */
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let recent = load('recentSearch', ['선크림', '아이라이너', '쿠션', '토너']);   // 처음 방문 시 예시
  let saveOn = load('recentSearchOn', true);

  function toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1500);
  }

  function drawRecent() {
    saveBtn.textContent = saveOn ? '검색어 저장 끄기' : '검색어 저장 켜기';
    if (!saveOn) { recentEl.innerHTML = '<li class="empty">검색어 저장 기능이 꺼져 있어요</li>'; return; }
    if (!recent.length) { recentEl.innerHTML = '<li class="empty">최근 검색어가 없어요</li>'; return; }
    recentEl.innerHTML = '';
    recent.forEach((word, i) => {
      const li = document.createElement('li');
      li.innerHTML = '<a></a><button class="del" aria-label="삭제">&times;</button>';
      li.querySelector('a').textContent = word;
      li.querySelector('a').addEventListener('click', () => doSearch(word));
      li.querySelector('.del').addEventListener('click', () => { recent.splice(i, 1); store('recentSearch', recent); drawRecent(); });
      recentEl.appendChild(li);
    });
  }

  function doSearch(word) {
    word = word.trim();
    if (!word) return;
    q.value = word;
    if (saveOn) {
      recent = [word, ...recent.filter(w => w !== word)].slice(0, 8);   // 중복 제거, 최대 8개
      store('recentSearch', recent);
    }
    drawRecent();
    search.classList.remove('open');
    toast(`'${word}' 검색 결과 페이지는 준비 중이에요`);
  }

  /* ---------- 이벤트 ---------- */
  q.addEventListener('focus', () => search.classList.add('open'));
  q.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch(q.value);
    if (e.key === 'Escape') { search.classList.remove('open'); q.blur(); }
  });
  search.querySelector('.search-btn').addEventListener('click', () => doSearch(q.value));
  document.addEventListener('click', e => { if (!search.contains(e.target)) search.classList.remove('open'); });
  search.querySelectorAll('.hot a').forEach(a => a.addEventListener('click', () => doSearch(a.textContent)));
  search.querySelector('.clear').addEventListener('click', () => { recent = []; store('recentSearch', recent); drawRecent(); });
  saveBtn.addEventListener('click', () => { saveOn = !saveOn; store('recentSearchOn', saveOn); drawRecent(); });

  const now = new Date();
  search.querySelector('.hot-time').textContent =
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 기준`;
  drawRecent();
})();
