// Настройка переключения видимости пароля
function setupPasswordToggle(buttonId, inputId, iconId) {
  document.getElementById(buttonId).addEventListener('click', () => {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(iconId);
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    eyeIcon.src = isHidden ? 'img/Hide.svg' : 'img/Eye.svg';
    eyeIcon.alt = isHidden ? 'Скрыть пароль' : 'Показать пароль';
  });
}