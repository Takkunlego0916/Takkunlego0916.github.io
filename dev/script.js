// script.js (更新版)
document.addEventListener('DOMContentLoaded', () => {
  // --- 既存カード処理 ---
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    const url = card.getAttribute('data-url') || '#';
    card.addEventListener('click', () => {
      if (url && url !== '#') {
        window.open(url, '_blank', 'noopener');
      } else {
        alert('このゲームのページはまだ設定されていません。');
      }
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // --- メニュー処理（既存） ---
  const menuBtn = document.getElementById('siteMenuBtn');
  const menuPanel = document.getElementById('siteMenu');
  if (menuBtn && menuPanel) {
    const openMenu = () => {
      menuBtn.setAttribute('aria-expanded', 'true');
      menuPanel.setAttribute('aria-hidden', 'false');
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
      if (e.key === 'Escape') { closeMenu(); return; }
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
        closeMenu();
      }
    };
    menuBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
    menuBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (menuBtn.getAttribute('aria-expanded') !== 'true') openMenu(); }
    });
  }

  // --- 認証 UI / ロジック ---
  const signupBtn = document.getElementById('signupBtn');
  const loginBtn = document.getElementById('loginBtn');
  const authOverlay = document.getElementById('authOverlay');
  const authClose = document.getElementById('authClose');
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const toSignup = document.getElementById('toSignup');
  const toLogin = document.getElementById('toLogin');
  const loginMsg = document.getElementById('loginMsg');
  const signupMsg = document.getElementById('signupMsg');

  const authControls = document.getElementById('authControls');
  const userControls = document.getElementById('userControls');
  const userNameEl = document.getElementById('userName');
  const logoutBtn = document.getElementById('logoutBtn');

  // localStorageキー
  const USERS_KEY = 'gp_users';
  const CURRENT_KEY = 'gp_currentUser';

  // ユーザー配列取得
  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
      return [];
    }
  }
  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // 現在ユーザー
  function setCurrentUser(user) {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    renderAuthState();
  }
  function clearCurrentUser() {
    localStorage.removeItem(CURRENT_KEY);
    renderAuthState();
  }
  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(CURRENT_KEY)); } catch { return null; }
  }

  // 表示切替
  function renderAuthState() {
    const cur = getCurrentUser();
    if (cur && cur.name) {
      authControls.style.display = 'none';
      userControls.style.display = 'flex';
      userNameEl.textContent = cur.name;
    } else {
      authControls.style.display = 'flex';
      userControls.style.display = 'none';
      userNameEl.textContent = '';
    }
  }

  // モーダル開閉
  function openAuth(initialTab = 'login') {
    authOverlay.setAttribute('aria-hidden', 'false');
    authOverlay.style.display = 'flex';
    if (initialTab === 'signup') showSignup();
    else showLogin();
    // フォーカスを最初の入力へ
    setTimeout(() => {
      const first = authOverlay.querySelector('input');
      if (first) first.focus();
    }, 50);
    document.addEventListener('keydown', overlayKeyHandler);
    document.addEventListener('click', overlayOutsideClick);
  }
  function closeAuth() {
    authOverlay.setAttribute('aria-hidden', 'true');
    authOverlay.style.display = 'none';
    document.removeEventListener('keydown', overlayKeyHandler);
    document.removeEventListener('click', overlayOutsideClick);
  }
  function overlayKeyHandler(e) {
    if (e.key === 'Escape') closeAuth();
  }
  function overlayOutsideClick(e) {
    const modal = authOverlay.querySelector('.auth-modal');
    if (modal && !modal.contains(e.target) && e.target !== signupBtn && e.target !== loginBtn) {
      closeAuth();
    }
  }

  // タブ表示
  function showLogin() {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    loginForm.style.display = '';
    signupForm.style.display = 'none';
    loginMsg.textContent = '';
    signupMsg.textContent = '';
  }
  function showSignup() {
    tabLogin.classList.remove('active');
    tabSignup.classList.add('active');
    loginForm.style.display = 'none';
    signupForm.style.display = '';
    loginMsg.textContent = '';
    signupMsg.textContent = '';
  }

  // イベントバインド
  if (signupBtn) signupBtn.addEventListener('click', () => openAuth('signup'));
  if (loginBtn) loginBtn.addEventListener('click', () => openAuth('login'));
  if (authClose) authClose.addEventListener('click', closeAuth);
  if (tabLogin) tabLogin.addEventListener('click', showLogin);
  if (tabSignup) tabSignup.addEventListener('click', showSignup);
  if (toSignup) toSignup.addEventListener('click', showSignup);
  if (toLogin) toLogin.addEventListener('click', showLogin);

  // サインアップ処理
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const pw = document.getElementById('signupPassword').value;
    const pwc = document.getElementById('signupPasswordConfirm').value;

    if (!name || !email || !pw) {
      signupMsg.textContent = '全ての項目を入力してください。';
      return;
    }
    if (pw.length < 6) {
      signupMsg.textContent = 'パスワードは6文字以上にしてください。';
      return;
    }
    if (pw !== pwc) {
      signupMsg.textContent = 'パスワードが一致しません。';
      return;
    }

    const users = loadUsers();
    if (users.some(u => u.email === email)) {
      signupMsg.textContent = 'そのメールアドレスは既に登録されています。';
      return;
    }

    // 簡易保存（パスワードは平文で保存されます。実運用ではサーバー側でハッシュ化してください）
    const newUser = { name, email, password: pw };
    users.push(newUser);
    saveUsers(users);
    signupMsg.textContent = '登録しました。自動でログインします。';
    setTimeout(() => {
      setCurrentUser({ name, email });
      closeAuth();
    }, 800);
  });

  // ログイン処理
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pw = document.getElementById('loginPassword').value;
    if (!email || !pw) {
      loginMsg.textContent = 'メールとパスワードを入力してください。';
      return;
    }
    const users = loadUsers();
    const found = users.find(u => u.email === email && u.password === pw);
    if (!found) {
      loginMsg.textContent = 'メールまたはパスワードが正しくありません。';
      return;
    }
    loginMsg.textContent = 'ログインしました。';
    setTimeout(() => {
      setCurrentUser({ name: found.name, email: found.email });
      closeAuth();
    }, 600);
  });

  // ログアウト
  logoutBtn.addEventListener('click', () => {
    clearCurrentUser();
  });

  // 初期表示
  renderAuthState();

  // モーダルの初期非表示スタイル
  authOverlay.style.display = 'none';
});
