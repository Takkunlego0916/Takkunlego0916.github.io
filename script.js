// script.js
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    const url = card.getAttribute('data-url') || '#';

    // Click opens the target URL in a new tab if a valid URL is set
    card.addEventListener('click', () => {
      if (url && url !== '#') {
        window.open(url, '_blank', 'noopener');
      } else {
        alert('このゲームのページはまだ設定されていません。');
      }
    });

    // キーボード操作対応（Enter / Space）
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // ---------- メニュー処理 ----------
  const menuBtn = document.getElementById('siteMenuBtn');
  const menuPanel = document.getElementById('siteMenu');

  if (menuBtn && menuPanel) {
    const openMenu = () => {
      menuBtn.setAttribute('aria-expanded', 'true');
      menuPanel.setAttribute('aria-hidden', 'false');
      // フォーカスを最初のメニュー項目へ移す
      const first = menuPanel.querySelector('.menu-item');
      if (first) first.focus();
      document.addEventListener('click', outsideClickHandler);
      document.addEventListener('keydown', keydownHandler);
    };

    const closeMenu = () => {
      menuBtn.setAttribute('aria-expanded', 'false');
      menuPanel.setAttribute('aria-hidden', 'true');
      menuBtn.focus();
      document.removeEventListener('click', outsideClickHandler);
      document.removeEventListener('keydown', keydownHandler);
    };

    const toggleMenu = () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      if (expanded) closeMenu(); else openMenu();
    };

    const outsideClickHandler = (e) => {
      if (!menuPanel.contains(e.target) && e.target !== menuBtn) {
        closeMenu();
      }
    };

    const keydownHandler = (e) => {
      // Escで閉じる
      if (e.key === 'Escape') {
        closeMenu();
        return;
      }
      // メニュー内で上下キー移動
      const items = Array.from(menuPanel.querySelectorAll('.menu-item'));
      if (items.length === 0) return;
      const active = document.activeElement;
      const idx = items.indexOf(active);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = items[(idx + 1) % items.length];
        next.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = items[(idx - 1 + items.length) % items.length];
        prev.focus();
      } else if (e.key === 'Tab' && e.shiftKey && idx === 0) {
        // Shift+Tabで先頭から抜けるときはメニューボタンへ戻す
        closeMenu();
      }
    };

    // ボタンで開閉（Enter / Space もサポート）
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
    menuBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        // 開いて最初の項目へ
        if (menuBtn.getAttribute('aria-expanded') !== 'true') openMenu();
      }
    });

    // メニュー項目はリンクなのでクリックで新しいタブへ遷移する（既に target="_blank" を設定）
    // 追加: メニュー内で Enter を押したときのフォーカス挙動はブラウザに任せる
  }
});
