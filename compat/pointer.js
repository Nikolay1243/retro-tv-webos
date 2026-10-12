(function () {
  'use strict';
  if (!/^https:\/\/(50s|60s|70s|80s|90s|00s)\.myretrotvs\.com$/.test(location.origin) || window.__retroPointerButton) return;
  window.__retroPointerButton = true;
  var pointerVisible = false;
  var active = true;
  function update() {
    var button = document.getElementById('retro-controls-trigger');
    if (!button) return;
    var show = pointerVisible && active && !document.hidden;
    button.style.setProperty('display', show ? 'block' : 'none', 'important');
    button.setAttribute('aria-hidden', String(!show));
    if (!show && document.activeElement === button) button.blur();
  }
  document.addEventListener('cursorStateChange', function (event) {
    if (event.detail && typeof event.detail.visibility === 'boolean') {
      pointerVisible = event.detail.visibility;
      update();
    }
  });
  // Pointer movement establishes the initial visible state if injected mid-session.
  document.addEventListener('mousemove', function (event) {
    if (!event.isTrusted) return;
    pointerVisible = true;
    update();
  }, true);
  window.addEventListener('blur', function () { active = false; update(); });
  window.addEventListener('focus', function () { active = true; update(); });
  document.addEventListener('visibilitychange', update);
  function install() {
    if (!document.getElementById('retro-controls-trigger')) { setTimeout(install, 100); return; }
    update();
  }
  install();
}());
