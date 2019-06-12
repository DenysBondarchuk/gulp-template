const place = document.querySelector('.footer__year');

const date = new Date();
const year = date.getFullYear();

place.innerHTML = year;