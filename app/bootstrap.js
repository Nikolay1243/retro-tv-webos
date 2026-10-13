(function () {
  'use strict';
  if (typeof PalmServiceBridge === 'undefined') return;
  var status=document.createElement('p');
  status.setAttribute('role','status');status.style.cssText='position:fixed;bottom:8px;left:24px;font-size:16px;color:#fff;background:#26372d;padding:8px 12px;z-index:1000';
  status.textContent='Starting TV controls…';document.body.appendChild(status);
  var bridge=new PalmServiceBridge();window.__retroBootstrapBridge=bridge;
  var done=false;
  function fail(){if(done)return;done=true;status.textContent='TV controls need rooted Homebrew Channel. Relaunch after enabling it.';}
  var timeout=setTimeout(fail,12000);
  bridge.onservicecallback=function(message){
    if(done)return;
    var result;try{result=JSON.parse(message);}catch(e){fail();return;}
    if(!result.returnValue || (result.stdoutString||'').indexOf('RETRO_HELPER_STARTED')<0){fail();return;}
    done=true;clearTimeout(timeout);status.remove();
  };
  try{bridge.call('luna://org.webosbrew.hbchannel.service/exec',JSON.stringify({command:'/bin/sh /media/developer/apps/usr/palm/applications/com.retro.decades.tv/compat/start.sh'}));}catch(e){fail();}
}());
