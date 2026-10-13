(function () {
  'use strict';
  if (!/^https:\/\/(50s|60s|70s|80s|90s|00s)\.myretrotvs\.com\/$/.test(location.origin + '/')) return;
  if (window.__retroRemoteControls) return;
  window.__retroRemoteControls = true;
  function install() {
    if (!document.body) { setTimeout(install, 100); return; }
    var style = document.createElement('style');
    style.textContent = '#retro-controls-trigger{position:fixed;bottom:24px;left:24px;z-index:2147483646;padding:14px 22px;border:2px solid #f0c383;border-radius:10px;background:#182320;color:#fff5dc;font:20px Arial;cursor:pointer}#retro-controls-panel{position:fixed;z-index:2147483647;inset:6vh 12vw;background:#14211ff5;color:#fff0d4;border:3px solid #f0c383;border-radius:18px;padding:28px;overflow:auto;font:20px Arial;box-shadow:0 20px 80px #000}#retro-controls-panel[hidden]{display:none}#retro-controls-panel h2{font-size:32px;margin:0 0 10px}#retro-controls-panel p{color:#c3cdbf;margin:0 0 18px;font-size:18px}#retro-controls-panel .retro-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}#retro-controls-panel button{font:19px Arial;color:#fff0d4;background:#2d3c35;border:2px solid #526357;border-radius:8px;padding:14px 12px;min-height:54px;cursor:pointer}#retro-controls-panel button:focus,#retro-controls-panel button:hover,#retro-controls-trigger:focus{outline:4px solid #f0c383;outline-offset:2px;background:#44523b}#retro-controls-panel .retro-years{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}#retro-controls-panel h3{font-size:20px;margin:20px 0 12px}#retro-controls-status{min-height:24px;margin-top:16px!important}#help[data-retro-adapted]{opacity:0!important;pointer-events:none!important}';
    document.head.appendChild(style);
    var trigger=document.createElement('button');trigger.id='retro-controls-trigger';trigger.textContent='TV controls';trigger.type='button';
    var panel=document.createElement('section');panel.id='retro-controls-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','retro-controls-title');
    panel.innerHTML='<h2 id="retro-controls-title">TV controls</h2><p>Point and click, or use arrows and OK. Back closes this panel.</p><div class="retro-grid"></div><h3>Choose a year</h3><div class="retro-years"></div><p id="retro-controls-status" aria-live="polite"></p><button type="button" id="retro-controls-close">Close controls</button>';
    document.body.appendChild(trigger);document.body.appendChild(panel);
    function key(code) {
      var event = new KeyboardEvent('keydown',{bubbles:true,cancelable:true,keyCode:code,which:code});
      if(event.which!==code)Object.defineProperty(event,'which',{get:function(){return code;}});
      if(event.keyCode!==code)Object.defineProperty(event,'keyCode',{get:function(){return code;}});
      document.dispatchEvent(event);
    }
    var help;
    function visible(){return help&&help.style.visibility==='visible';}
    function open(){panel.hidden=false;trigger.setAttribute('aria-expanded','true');panel.querySelector('button').focus();}
    function close(){panel.hidden=true;trigger.setAttribute('aria-expanded','false');if(visible())key(72);trigger.focus();}
    trigger.setAttribute('aria-controls',panel.id);trigger.setAttribute('aria-expanded','false');
    trigger.addEventListener('click',function(){if(!panel.hidden){close();return;}if(!visible())key(72);open();});
    panel.querySelector('#retro-controls-close').addEventListener('click',close);
    var actions=[['Power on / off',32],['Previous channel',37],['Next channel',39],['Volume down',189],['Volume up',187],['Toggle sound effects',77],['Toggle tube glow',71],['Toggle static overlay',79],['Change picture noise',78],['Change fullscreen',70],['Toggle playlist mode',80],['Toggle shuffle mode',83],['Toggle sidebar',86],['Watch clip on YouTube',89]];
    if(location.hostname.indexOf('70s.')===0)actions.push(['Toggle black & white',66],['Change TV colour',67]);
    function add(label,code,parent){var b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',function(){key(code);panel.querySelector('#retro-controls-status').textContent=label+' command sent';});parent.appendChild(b);}
    actions.forEach(function(a){add(a[0],a[1],panel.querySelector('.retro-grid'));});
    var decade=location.hostname.slice(0,3);var start=decade==='00s'?2000:1900+parseInt(decade,10);
    for(var i=0;i<10;i++)add(String(start+i),48+i,panel.querySelector('.retro-years'));
    document.addEventListener('keydown',function(e){
      if(panel.hidden||!e.isTrusted)return;
      var code=e.keyCode||e.which;
      if(code===461||code===27){e.preventDefault();e.stopImmediatePropagation();close();return;}
      if([37,38,39,40].indexOf(code)===-1)return;
      e.preventDefault();e.stopImmediatePropagation();
      var buttons=Array.prototype.slice.call(panel.querySelectorAll('button'));
      var current=document.activeElement,rect=current.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,best=null,score=Infinity;
      buttons.forEach(function(b){if(b===current)return;var r=b.getBoundingClientRect(),dx=r.left+r.width/2-cx,dy=r.top+r.height/2-cy;
        var valid=code===37?dx<-5:code===39?dx>5:code===38?dy<-5:dy>5;
        if(!valid)return;var parallel=code===37||code===39?Math.abs(dx):Math.abs(dy),perp=code===37||code===39?Math.abs(dy):Math.abs(dx),s=parallel+perp*4;
        if(s<score){score=s;best=b;}});
      if(best){best.focus();best.scrollIntoView({block:'nearest'});}
    },true);
    function watch(){help=document.querySelector('#help');if(!help){setTimeout(watch,250);return;}
      help.setAttribute('data-retro-adapted','true');
      new MutationObserver(function(){if(visible()&&panel.hidden)open();else if(!visible()&&!panel.hidden){panel.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.focus();}}).observe(help,{attributes:true,attributeFilter:['style'],childList:true});
      if(visible())open();
    }
    watch();
  }
  install();
}());
