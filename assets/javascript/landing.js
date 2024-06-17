// simple function that removes or adds class - starts modal out at invisible
document.getElementById('info-button').addEventListener('click', function () {
  // assigned variable within fx for best practice
  const infoForm = document.getElementById('form-div')
  if (infoForm.classList.contains('invisible')) {
    infoForm.classList.remove('invisible');
    infoForm.classList.add('visible');
    // also, the text of the button to click changes whether modal is visible or invisible
    this.textContent = 'Hide form';  
  } else {
    infoForm.classList.remove('visbile')
    infoForm.classList.add('invisible');
    this.textContent = 'Click me for info';
  }
})