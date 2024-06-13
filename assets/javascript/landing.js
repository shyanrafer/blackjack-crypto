document.getElementById('info-button').addEventListener('click', function () {
  const infoForm = document.getElementById('form-div')
  if (infoForm.classList.contains('invisible')) {
    infoForm.classList.remove('invisible');
    infoForm.classList.add('visible');
    this.textContent = 'Hide form';  
  } else {
    infoForm.classList.remove('visbile')
    infoForm.classList.add('invisible');
    this.textContent = 'Click me for info';
  }
})