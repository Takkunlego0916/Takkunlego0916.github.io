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

  // --- テスト用アカウントをシードする関数 ---
  function seedTestUser() {
    const users = loadUsers();
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    if (!users.some(u => u.email === testEmail)) {
      users.push({ name: 'テストユーザー', email: testEmail, password: testPassword, avatar: '' });
      saveUsers(users);
      console.log('テストユーザーを作成しました:', testEmail);
    } else {
      console.log('テストユーザーは既に存在します:', testEmail);
    }
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

  // 表示切替（アイコン反映を含む）
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
    renderAvatar();
  }

  // モーダル開閉
  function openAuth(initialTab = 'login') {
    authOverlay.setAttribute('aria-hidden', 'false');
    authOverlay.style.display = 'flex';
    if (initialTab === 'signup') showSignup();
    else showLogin();
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

    const newUser = { name, email, password: pw, avatar: '' };
    users.push(newUser);
    saveUsers(users);
    signupMsg.textContent = '登録しました。自動でログインします。';
    setTimeout(() => {
      setCurrentUser({ name, email, avatar: '' });
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
      setCurrentUser({ name: found.name, email: found.email, avatar: found.avatar || '' });
      closeAuth();
    }, 600);
  });

  // ログアウト
  logoutBtn.addEventListener('click', () => {
    clearCurrentUser();
  });

  // --- プロフィール編集機能の追加 ---
  const editProfileBtn = document.getElementById('editProfileBtn');
  const profileOverlay = document.getElementById('profileOverlay');
  const profileClose = document.getElementById('profileClose');
  const profileForm = document.getElementById('profileForm');
  const profileCancel = document.getElementById('profileCancel');
  const profileMsg = document.getElementById('profileMsg');
  const profileAvatarInput = document.getElementById('profileAvatarInput');
  const profileAvatarPreview = document.getElementById('profileAvatarPreview');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profilePassword = document.getElementById('profilePassword');
  const profilePasswordConfirm = document.getElementById('profilePasswordConfirm');
  const userAvatarImg = document.getElementById('userAvatar');

  function loadProfileToForm() {
    const cur = getCurrentUser();
    if (!cur) return;
    profileName.value = cur.name || '';
    profileEmail.value = cur.email || '';
    profilePassword.value = '';
    profilePasswordConfirm.value = '';
    if (cur.avatar) {
      profileAvatarPreview.src = cur.avatar;
      profileAvatarPreview.style.display = '';
    } else {
      profileAvatarPreview.style.display = 'none';
      profileAvatarPreview.src = '';
    }
    if (profileAvatarInput) profileAvatarInput.value = '';
  }

  function openProfile() {
    profileOverlay.setAttribute('aria-hidden', 'false');
    profileOverlay.style.display = 'flex';
    loadProfileToForm();
    setTimeout(() => {
      const first = profileOverlay.querySelector('input[type="file"], input[type="text"], input[type="email"]');
      if (first) first.focus();
    }, 50);
    document.addEventListener('keydown', profileOverlayKey);
    document.addEventListener('click', profileOutsideClick);
  }
  function closeProfile() {
    profileOverlay.setAttribute('aria-hidden', 'true');
    profileOverlay.style.display = 'none';
    profileMsg.textContent = '';
    document.removeEventListener('keydown', profileOverlayKey);
    document.removeEventListener('click', profileOutsideClick);
  }
  function profileOverlayKey(e) {
    if (e.key === 'Escape') closeProfile();
  }
  function profileOutsideClick(e) {
    const modal = profileOverlay.querySelector('.auth-modal');
    if (modal && !modal.contains(e.target) && e.target !== editProfileBtn) {
      closeProfile();
    }
  }

  if (profileAvatarInput) {
    profileAvatarInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) {
        profileAvatarPreview.style.display = 'none';
        profileAvatarPreview.src = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        profileAvatarPreview.src = reader.result;
        profileAvatarPreview.style.display = '';
      };
      reader.readAsDataURL(file);
    });
  }

  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      profileMsg.textContent = '';
      const name = profileName.value.trim();
      const email = profileEmail.value.trim().toLowerCase();
      const pw = profilePassword.value;
      const pwc = profilePasswordConfirm.value;

      if (!name || !email) {
        profileMsg.textContent = '名前とメールは必須です。';
        return;
      }
      if (pw && pw.length < 6) {
        profileMsg.textContent = 'パスワードは6文字以上にしてください。';
        return;
      }
      if (pw && pw !== pwc) {
        profileMsg.textContent = 'パスワードが一致しません。';
        return;
      }

      const users = loadUsers();
      const cur = getCurrentUser();
      if (!cur) {
        profileMsg.textContent = 'ログイン状態が見つかりません。';
        return;
      }

      const other = users.find(u => u.email === email && u.email !== cur.email);
      if (other) {
        profileMsg.textContent = 'そのメールアドレスは他のアカウントで使用されています。';
        return;
      }

      const idx = users.findIndex(u => u.email === cur.email);
      if (idx === -1) {
        profileMsg.textContent = 'ユーザー情報が見つかりません。';
        return;
      }

      const file = profileAvatarInput.files && profileAvatarInput.files[0];
      const finalizeSave = (avatarDataUrl) => {
        if (avatarDataUrl !== undefined) users[idx].avatar = avatarDataUrl;
        users[idx].name = name;
        users[idx].email = email;
        if (pw) users[idx].password = pw;
        saveUsers(users);
        setCurrentUser({ name, email, avatar: users[idx].avatar || '' });
        profileMsg.textContent = '保存しました。';
        renderAvatar();
        setTimeout(() => closeProfile(), 700);
      };

      if (file) {
        const reader = new FileReader();
        reader.onload = () => finalizeSave(reader.result);
        reader.readAsDataURL(file);
      } else {
        finalizeSave(undefined);
      }
    });
  }

  if (profileClose) profileClose.addEventListener('click', closeProfile);
  if (profileCancel) profileCancel.addEventListener('click', closeProfile);
  if (editProfileBtn) editProfileBtn.addEventListener('click', openProfile);

  function renderAvatar() {
    const cur = getCurrentUser();
    if (cur && cur.avatar) {
      userAvatarImg.src = cur.avatar;
      userAvatarImg.style.display = '';
    } else {
      userAvatarImg.style.display = 'none';
      userAvatarImg.src = '';
    }
  }

  // --- 初期処理 ---
  seedTestUser();
  renderAuthState();

  // モーダルの初期非表示スタイル
  if (authOverlay) authOverlay.style.display = 'none';
  if (profileOverlay) profileOverlay.style.display = 'none';
});
