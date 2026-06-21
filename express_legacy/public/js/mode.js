document.querySelectorAll('[data-bs-theme-value]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-bs-theme-value]').forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
    const theme = button.getAttribute('data-bs-theme-value');
    document.documentElement.setAttribute('data-bs-theme', theme);
    // Additional logic to persist the theme selection can be added here
  });
});
