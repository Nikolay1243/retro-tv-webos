(function () {
  "use strict";
  var links = Array.prototype.slice.call(document.querySelectorAll("#decades a"));
  var saved = "00s";
  try { saved = localStorage.getItem("retro-era") || saved; } catch (ignore) {}
  function restoreFocus() {
    var chosen = links.filter(function (link) { return link.getAttribute("data-era") === saved; })[0];
    (chosen || links[5]).focus();
  }
  links.forEach(function (link) {
    link.addEventListener("click", function () {
      saved = link.getAttribute("data-era");
      try { localStorage.setItem("retro-era", saved); } catch (ignore) {}
      // Regular top-level navigation preserves the local launcher in history.
    });
  });
  document.addEventListener("keydown", function (event) {
    var code = event.keyCode || event.which;
    if ([37, 38, 39, 40].indexOf(code) === -1) return;
    event.preventDefault();
    var choices = Array.prototype.slice.call(document.querySelectorAll('#decades a, #retro-showroom-options button:not(:disabled)'));
    var current = document.activeElement;
    if (choices.indexOf(current) < 0) { restoreFocus(); return; }
    var rect=current.getBoundingClientRect(), cx=rect.left+rect.width/2, cy=rect.top+rect.height/2, best=null, score=Infinity;
    choices.forEach(function(choice){if(choice===current)return;var r=choice.getBoundingClientRect(),dx=r.left+r.width/2-cx,dy=r.top+r.height/2-cy;
      var valid=code===37?dx<-5:code===39?dx>5:code===38?dy<-5:dy>5;if(!valid)return;
      var parallel=code===37||code===39?Math.abs(dx):Math.abs(dy),perp=code===37||code===39?Math.abs(dy):Math.abs(dx),s=parallel+perp*4;
      if(s<score){score=s;best=choice;}});
    if(best)best.focus();
  });
  // Enter/OK uses native link activation. Back is managed by webOS history.
  window.addEventListener("pageshow", restoreFocus);
  function place00sLogo() {
    var stage=document.querySelector('[data-era="00s"] .tv-stage');
    var photo=stage.querySelector('img:not(.tv-screen-logo)'),logo=stage.querySelector('.tv-screen-logo');
    var image=photo.getBoundingClientRect(),area=stage.getBoundingClientRect();
    logo.style.left=(image.left-area.left+image.width*(415/827))+'px';
    logo.style.top=(image.top-area.top+image.height*(247/580))+'px';
    logo.style.width=(image.width*0.48)+'px';
  }
  document.querySelector('[data-era="00s"] .tv-stage img').addEventListener('load',place00sLogo);
  window.addEventListener('resize',place00sLogo);
  window.addEventListener('pageshow',place00sLogo);
  place00sLogo();
  restoreFocus();
}());
