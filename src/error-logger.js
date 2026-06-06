window.addEventListener('error', function(e) {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.background = 'red';
  div.style.color = 'white';
  div.style.zIndex = '9999';
  div.style.padding = '10px';
  div.innerText = 'Error: ' + e.message + ' at ' + e.filename + ':' + e.lineno;
  document.body.appendChild(div);
});
window.addEventListener('unhandledrejection', function(e) {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.background = 'red';
  div.style.color = 'white';
  div.style.zIndex = '9999';
  div.style.padding = '10px';
  div.innerText = 'Unhandled Rejection: ' + e.reason;
  document.body.appendChild(div);
});
