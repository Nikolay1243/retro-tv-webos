(function(){
 'use strict';
 function install(){if(!document.head){setTimeout(install,100);return;}if(document.getElementById('retro-player-overlay-style'))return;var style=document.createElement('style');style.id='retro-player-overlay-style';style.textContent='.player-control-play-pause-icon,.ytp-bezel{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}';document.head.appendChild(style);}
 install();
}());
