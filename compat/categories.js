(function(){
 'use strict';
 if(!window.RetroSettings||window.__retroCategories)return;window.__retroCategories=true;
 var R=RetroSettings,all=['c','s','a','d','g','k','e','m','n','o','z','p','r','t','f'];
 var names=['Cartoons','Comedy','Commercials','Drama','Game shows','Kids','Movies','Music','News','Other','Soaps','Specials','Sports','Talk shows','Trailers'];
 if(!Array.isArray(R.state.categories)||!R.state.categories.length)R.state.categories=all.slice();
 if(location.protocol==='file:'){
  function menu(){var dialog=document.querySelector('#retro-showroom-settings .settings-dialog');if(!dialog){setTimeout(menu,150);return;}
   var h=document.createElement('h3');h.textContent='Categories';var grid=document.createElement('div');grid.className='settings-grid';grid.style.gridTemplateColumns='repeat(3,1fr)';grid.id='retro-global-categories';var hint=document.createElement('p');hint.className='settings-note';hint.textContent='Applies to every decade. Keep at least one category enabled.';
   var done=dialog.querySelector('.settings-close');dialog.insertBefore(h,done);dialog.insertBefore(grid,done);dialog.insertBefore(hint,done);
   var buttons=[];function render(){buttons.forEach(function(b){var on=R.state.categories.indexOf(b.dataset.category)>=0;b.textContent=b._name+': '+(on?'On':'Off');b.setAttribute('aria-pressed',String(on));});}
   var selectAll=document.createElement('button');selectAll.type='button';selectAll.textContent='Select all categories';selectAll.style.gridColumn='1/-1';selectAll.addEventListener('click',function(){R.set({categories:all.slice()});hint.textContent='All categories enabled.';});grid.appendChild(selectAll);
   all.forEach(function(code,i){var b=document.createElement('button');b.type='button';b.dataset.category=code;b._name=names[i];b.addEventListener('click',function(){var selected=R.state.categories.slice(),idx=selected.indexOf(code);if(idx>=0&&selected.length===1){hint.textContent='Keep at least one category enabled.';return;}if(idx>=0)selected.splice(idx,1);else selected.push(code);R.set({categories:selected});hint.textContent='Categories saved for every decade.';});grid.appendChild(b);buttons.push(b);});document.addEventListener('retroSettingsChange',render);render();
  }menu();return;
 }
 var applying=false;
 window.__retroApplyCategories=function(){var boxes=Array.from(document.querySelectorAll('#tvfilters input[type=checkbox]'));if(!boxes.length)return false;applying=true;boxes.forEach(function(b){b.checked=R.state.categories.indexOf(b.id.replace('box_',''))>=0;});var first=boxes[0];first.checked=!first.checked;first.click();applying=false;return true;};
 function apply(){var boxes=Array.from(document.querySelectorAll('#tvfilters input[type=checkbox]'));if(!document.querySelector('#retro-auto-sizing')||!boxes.length){setTimeout(apply,250);return;}
  window.__retroApplyCategories();
  document.querySelector('#tvfilters').addEventListener('click',function(){if(applying)return;setTimeout(function(){var selected=boxes.filter(function(b){return b.checked;}).map(function(b){return b.id.replace('box_','');}).filter(function(c){return all.indexOf(c)>=0;});if(selected.length)R.set({categories:selected});},0);});
 }
 apply();
}());
