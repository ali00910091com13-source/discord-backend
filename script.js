const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');
menuButton.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('open')));
document.querySelector('#appointment-form').addEventListener('submit', event => {
  event.preventDefault();
  const message = document.querySelector('#form-message');
  message.textContent = 'درخواست شما با موفقیت ثبت شد. به‌زودی با شما تماس می‌گیریم.';
  event.currentTarget.reset();
});
