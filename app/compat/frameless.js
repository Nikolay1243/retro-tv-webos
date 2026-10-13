(function () {
  'use strict';
  if (!/^https:\/\/(50s|60s|70s|80s|90s|00s)\.myretrotvs\.com$/.test(location.origin) || window.__retroFrameless) return;
  window.__retroFrameless = true;
  var mode = 'frame';
  try { mode = localStorage.getItem('retro-fullscreen-surround') === 'none' ? 'none' : 'frame'; } catch (e) {}
  function full() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function install() {
    var grid = document.querySelector('#retro-controls-panel .retro-grid');
    if (!grid || !document.getElementById('retro-frame-style')) { setTimeout(install, 200); return; }
    var style = document.createElement('style'); style.id = 'retro-frameless-style'; document.head.appendChild(style);
    var frameButton = Array.from(grid.querySelectorAll('button')).find(function (b) { return b.textContent === 'Fullscreen with TV frame'; });
    var plainButton = document.createElement('button'); plainButton.type = 'button'; plainButton.id = 'retro-fullscreen-no-frame'; plainButton.textContent = 'Fullscreen without TV frame';
    var exitButton = document.createElement('button'); exitButton.type = 'button'; exitButton.id = 'retro-fullscreen-exit'; exitButton.textContent = 'Exit fullscreen';
    grid.appendChild(plainButton); grid.appendChild(exitButton);
    function update() {
      document.documentElement.classList.toggle('retro-frameless-fullscreen', full() && mode === 'none');
      var wide = false;
      try { wide = localStorage.getItem('retro-effects-aspect') === 'wide'; } catch (e) {}
      var ratio = window.__retroDetectedAspect || (wide ? 16 / 9 : 4 / 3);
      var pw = Math.min(innerWidth, innerHeight * ratio), ph = Math.min(innerHeight, innerWidth / ratio);
      var sx = (innerWidth - pw) / 2, sy = (innerHeight - ph) / 2;
      style.textContent = '.retro-frameless-fullscreen .wrapper{left:0!important;top:0!important;width:100vw!important;height:100vh!important;transform:none!important;overflow:hidden!important}' +
        '.retro-frameless-fullscreen .wrapper > :not(#myytplayer):not(#tvstatic){visibility:hidden!important;pointer-events:none!important}' +
        '.retro-frameless-fullscreen #myytplayer{left:0!important;top:0!important;width:100vw!important;height:100vh!important;clip-path:none!important;z-index:20!important}' +
        '.retro-frameless-fullscreen #tvstatic{left:0!important;top:0!important;width:100vw!important;height:100vh!important;clip-path:inset(' + sy + 'px ' + sx + 'px)!important;z-index:21!important}';
      if (frameButton) frameButton.setAttribute('aria-pressed', String(mode === 'frame'));
      plainButton.setAttribute('aria-pressed', String(mode === 'none'));
    }
    function select(next) {
      mode = next;
      try { localStorage.setItem('retro-fullscreen-surround', mode); } catch (e) {}
      var panel = document.getElementById('retro-controls-panel');
      if (panel && !panel.hidden) document.getElementById('retro-controls-close').click();
      update();
      if (!full()) {
        var promise = document.documentElement.requestFullscreen ? document.documentElement.requestFullscreen() : document.documentElement.webkitRequestFullscreen();
        if (promise && promise.catch) promise.catch(function () { document.getElementById('retro-controls-status').textContent = 'Fullscreen could not be opened. Please try again.'; });
      }
    }
    plainButton.addEventListener('click', function () { select('none'); });
    if (frameButton) frameButton.addEventListener('click', function (event) { event.stopImmediatePropagation(); event.preventDefault(); select('frame'); }, true);
    exitButton.addEventListener('click', function () { if (full()) { if (document.exitFullscreen) document.exitFullscreen(); else document.webkitExitFullscreen(); } });
    grid.addEventListener('click', function (event) { if (event.target.hasAttribute('data-retro-aspect')) update(); });
    document.addEventListener('fullscreenchange', update); document.addEventListener('webkitfullscreenchange', update); window.addEventListener('resize', update);
    document.addEventListener('retroAspectChange',update);
    update();
  }
  install();
}());
