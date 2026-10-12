(function(){
 'use strict';
 if(!/^https:\/\/(50s|60s|70s|80s|90s|00s)\.myretrotvs\.com$/.test(location.origin)||window.__retroFrameDisplay)return;
 window.__retroFrameDisplay=true;
 var aspect=4/3;
 try{if(localStorage.getItem('retro-effects-aspect')==='wide')aspect=16/9;}catch(e){}
 function originalRule(selector){var result={};function walk(rules){for(var i=0;i<rules.length;i++){var r=rules[i];if(r.cssRules)walk(r.cssRules);else if(r.selectorText&&r.selectorText.split(',').map(function(s){return s.trim();}).indexOf(selector)>=0){['left','top','width','height'].forEach(function(k){var v=parseFloat(r.style[k]);if(isFinite(v))result[k]=v;});}}}
  Array.prototype.forEach.call(document.styleSheets,function(sheet){try{walk(sheet.cssRules);}catch(e){}});return result;}
 function install(){
  var wrap=document.querySelector('.wrapper'),frame=document.querySelector('#tvbackground'),noise=document.querySelector('#tvstatic');
  if(!wrap||!frame||!noise||!frame.offsetWidth){setTimeout(install,250);return;}
  var screen=originalRule('#tvstatic'),player=originalRule('#myytplayer');
  if(!screen.width||!screen.height||!player.width||!player.height){setTimeout(install,250);return;}
  var style=document.createElement('style');style.id='retro-frame-style';document.head.appendChild(style);
  function update(){
   var full=!!(document.fullscreenElement||document.webkitFullscreenElement);
   document.documentElement.classList.toggle('retro-frame-fullscreen',full);
   var x=frame.offsetLeft,y=frame.offsetTop,w=frame.offsetWidth,h=frame.offsetHeight;
   var scale=Math.min(innerWidth/w,innerHeight/h);
   var tx=(innerWidth-w*scale)/2-x*scale,ty=(innerHeight-h*scale)/2-y*scale;
   var pictureW=Math.min(screen.width,screen.height*aspect),pictureH=Math.min(screen.height,screen.width/aspect);
   var sx=(screen.width-pictureW)/2,sy=(screen.height-pictureH)/2;
   var playerLeft=player.left-1000,playerWidth=player.width+2000;
   var top=Math.max(0,screen.top-player.top),left=Math.max(0,screen.left-playerLeft);
   var right=Math.max(0,playerWidth-left-screen.width),bottom=Math.max(0,player.height-top-screen.height);
   style.textContent=
    '#tvstatic{left:'+screen.left+'px!important;top:'+screen.top+'px!important;width:'+screen.width+'px!important;height:'+screen.height+'px!important;z-index:2!important;clip-path:inset('+sy+'px '+sx+'px '+sy+'px '+sx+'px)!important;overflow:hidden!important}' +
    '#myytplayer{clip-path:inset('+top+'px '+right+'px '+bottom+'px '+left+'px)!important}' +
    '.retro-frame-fullscreen .wrapper{position:fixed!important;left:0!important;top:0!important;width:'+(x+w)+'px!important;height:'+(y+h)+'px!important;overflow:hidden!important;transform-origin:0 0!important;transform:translate('+tx+'px,'+ty+'px) scale('+scale+')!important}' +
    '.retro-frame-fullscreen .wrapper:before{display:none!important}' +
    '.retro-frame-fullscreen #myytplayer{left:'+playerLeft+'px!important;top:'+player.top+'px!important;width:'+playerWidth+'px!important;height:'+player.height+'px!important;z-index:2!important}' +
    '.retro-frame-fullscreen #glass{z-index:0!important}' +
    '.retro-frame-fullscreen #sidebar,.retro-frame-fullscreen #tvfilters,.retro-frame-fullscreen #credit,.retro-frame-fullscreen #remotestatus,.retro-frame-fullscreen #tvbuttons,.retro-frame-fullscreen .ios-beta-promo,.retro-frame-fullscreen .tvcurtain{display:none!important}';
  }
  document.addEventListener('fullscreenchange',update);document.addEventListener('webkitfullscreenchange',update);window.addEventListener('resize',update);frame.querySelector('img')&&frame.querySelector('img').addEventListener('load',update);
  window.__retroDisplaySetAspect=function(ratio){if(isFinite(ratio)&&ratio>0.3&&ratio<4){aspect=ratio;update();}};
  update();
  function controls(){var grid=document.querySelector('#retro-controls-panel .retro-grid');if(!grid){setTimeout(controls,200);return;}
   [['Effects: 4:3 picture',4/3,'classic'],['Effects: widescreen',16/9,'wide']].forEach(function(a){var b=document.createElement('button');b.type='button';b.textContent=a[0];b.setAttribute('aria-pressed',String(aspect===a[1]));b.setAttribute('data-retro-aspect',a[2]);b.addEventListener('click',function(){aspect=a[1];try{localStorage.setItem('retro-effects-aspect',a[2]);}catch(e){}update();grid.querySelectorAll('[data-retro-aspect]').forEach(function(el){el.setAttribute('aria-pressed',String(el===b));});document.querySelector('#retro-controls-status').textContent='Effects clipped to '+(aspect===4/3?'4:3':'16:9')+' picture';});grid.appendChild(b);});
   Array.from(grid.querySelectorAll('button')).forEach(function(b){if(b.textContent==='Change fullscreen')b.textContent='Fullscreen with TV frame';});
  }
  controls();
 }
 install();
}());
