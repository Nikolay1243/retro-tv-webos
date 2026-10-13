(function () {
  'use strict';
  if (!/^https:\/\/(50s|60s|70s|80s|90s|00s)\.myretrotvs\.com$/.test(location.origin) || window.__retroAutoChannel) return;
  window.__retroAutoChannel = true;
  var enabled = false;
  try { enabled = localStorage.getItem('retro-auto-channel') === 'true'; } catch (e) {}
  var lastAdvance = 0;
  var button;
  function render() {
    if (!button) return;
    button.textContent = 'Auto change channel: ' + (enabled ? 'On' : 'Off');
    button.setAttribute('aria-pressed', String(enabled));
  }
  window.addEventListener('message', function (event) {
    if (!enabled) return;
    var player = document.getElementById('myytplayer');
    if (!player || event.source !== player.contentWindow || !/^https:\/\/(www\.)?youtube(-nocookie)?\.com$/.test(event.origin)) return;
    var message;
    try { message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data; } catch (e) { return; }
    if (!message || message.event !== 'onStateChange' || message.info !== 0) return;
    var p=window.RetroSettings&&RetroSettings.player();
    if(p&&typeof p.getPlayerState==='function'&&p.getPlayerState()===-1)return;
    // Consume the ended callback before the original site restarts this clip.
    event.stopImmediatePropagation();
    if (Date.now() - lastAdvance < 1500) return;
    lastAdvance = Date.now();
    var key = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: 39, which: 39 });
    if (key.which !== 39) Object.defineProperty(key, 'which', { get: function () { return 39; } });
    if (key.keyCode !== 39) Object.defineProperty(key, 'keyCode', { get: function () { return 39; } });
    document.dispatchEvent(key);
  }, true);
  function install() {
    var grid = document.querySelector('#retro-controls-panel .retro-grid');
    if (!grid) { setTimeout(install, 200); return; }
    button = document.createElement('button'); button.type = 'button'; button.id = 'retro-auto-channel';
    button.addEventListener('click', function () {
      enabled = !enabled;
      try { localStorage.setItem('retro-auto-channel', String(enabled)); } catch (e) {}
      render();
      document.getElementById('retro-controls-status').textContent = enabled ? 'Next channel when the current video finishes' : 'Original playback mode restored';
    });
    grid.insertBefore(button, grid.firstChild);
    render();
  }
  install();
}());
