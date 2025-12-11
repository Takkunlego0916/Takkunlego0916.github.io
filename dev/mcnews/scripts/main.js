async function loadNews() {
  try {
    const res = await fetch('/data/news.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('ニュースの取得に失敗しました');
    const items = await res.json();

    const list = document.getElementById('news-list');
    const empty = document.getElementById('empty-state');
    list.innerHTML = '';

    if (!items || items.length === 0) {
      empty.hidden = false;
      return;
    }

    // 日付降順ソート
    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    for (const item of items) {
      const card = document.createElement('article');
      card.className = 'news-card';
      card.setAttribute('role', 'listitem');

      const date = document.createElement('div');
      date.className = 'news-date';
      date.textContent = formatDate(item.date);

      const title = document.createElement('h3');
      title.className = 'news-title';
      const link = document.createElement('a');
      link.href = item.url || '#';
      link.textContent = item.title;
      link.rel = 'bookmark';
      title.appendChild(link);

      const desc = document.createElement('p');
      desc.className = 'news-desc';
      desc.textContent = item.summary;

      const actions = document.createElement('div');
      actions.className = 'news-actions';

      const readBtn = document.createElement('a');
      readBtn.className = 'btn';
      readBtn.href = item.url || '#';
      readBtn.textContent = '記事を読む';

      const shareBtn = document.createElement('button');
      shareBtn.className = 'btn';
      shareBtn.type = 'button';
      shareBtn.textContent = '共有';
      shareBtn.addEventListener('click', () => shareItem(item));

      actions.append(readBtn, shareBtn);
      card.append(date, title, desc, actions);
      list.appendChild(card);
    }
  } catch (e) {
    console.error(e);
    const list = document.getElementById('news-list');
    list.innerHTML = `<div class="empty-state"><p>読み込みに失敗しました。しばらくしてから再度お試しください。</p></div>`;
  }
}

function formatDate(iso) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

async function shareItem(item) {
  const text = `${item.title} - erbo 滝花情報局`;
  const url = item.url || location.href;

  if (navigator.share) {
    try {
      await navigator.share({ title: item.title, text, url });
    } catch { /* キャンセルは無視 */ }
  } else {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    alert('記事リンクをコピーしました');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadNews();

  const toggle = document.querySelector('.theme-toggle');
  toggle?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    // classの有無で好みを保存（CSSでprefersが優先、手動切替はclassで上書き）
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.documentElement.classList.add('dark');
});
