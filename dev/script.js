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
        // オセロなど未設定のカード用の挙動（必要なら変更）
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
});
