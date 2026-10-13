'use strict';
const http = require('http');
const crypto = require('crypto');
const EventEmitter = require('events');
class CDP extends EventEmitter {
  constructor(url) {
    super(); this.next = 1; this.pending = new Map(); this.buffer = Buffer.alloc(0);
    const u = new URL(url);
    const req = http.request({hostname:u.hostname, port:u.port, path:u.pathname,
      headers:{Connection:'Upgrade', Upgrade:'websocket','Sec-WebSocket-Version':'13',
        'Sec-WebSocket-Key':crypto.randomBytes(16).toString('base64')}});
    req.on('upgrade', (res, socket, head) => {
      this.socket = socket;
      socket.on('data', data => this.receive(data));
      socket.on('error', e => this.emit('failure', e));
      socket.on('close', () => { this.pending.forEach(p => p.reject(new Error('closed'))); this.pending.clear(); this.emit('closed'); });
      if (head.length) this.receive(head);
      this.emit('ready');
    });
    req.on('error', e => this.emit('failure', e)); req.end();
  }
  sendFrame(op, payload) {
    if (!this.socket) return;
    const mask = crypto.randomBytes(4); const length = payload.length;
    const extra = length < 126 ? 0 : length < 65536 ? 2 : 8;
    const h = Buffer.alloc(2 + extra + 4); h[0] = 128 | op;
    h[1] = 128 | (extra === 0 ? length : extra === 2 ? 126 : 127);
    if (extra === 2) h.writeUInt16BE(length,2);
    if (extra === 8) {h.writeUInt32BE(0,2);h.writeUInt32BE(length,6);}
    mask.copy(h,2+extra); const body=Buffer.from(payload);
    for(let i=0;i<body.length;i++) body[i]^=mask[i%4];
    this.socket.write(Buffer.concat([h,body]));
  }
  receive(data) {
    this.buffer=Buffer.concat([this.buffer,data]);
    while(this.buffer.length>=2) {
      const b=this.buffer,op=b[0]&15,masked=b[1]&128; let len=b[1]&127,offset=2;
      if(len===126){if(b.length<4)return;len=b.readUInt16BE(2);offset=4;}
      else if(len===127){if(b.length<10)return;if(b.readUInt32BE(2)!==0){this.close();return;}len=b.readUInt32BE(6);offset=10;}
      if(masked)offset+=4;if(b.length<offset+len)return;
      const payload=Buffer.from(b.subarray(offset,offset+len));
      if(masked){const mask=b.subarray(offset-4,offset);for(let i=0;i<len;i++)payload[i]^=mask[i%4];}
      this.buffer=b.subarray(offset+len);
      if(op===8){this.close();return;}if(op===9){this.sendFrame(10,payload);continue;}
      if(op!==1)continue;
      try{const msg=JSON.parse(payload.toString());const p=this.pending.get(msg.id);
        if(p){this.pending.delete(msg.id);msg.error?p.reject(new Error(msg.error.message)):p.resolve(msg.result);}
        else if(msg.method)this.emit('event',msg);
      }catch(e){}
    }
  }
  call(method,params={},sessionId) {
    const id=this.next++;
    return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('timeout'));},8000);
      this.pending.set(id,{resolve:r=>{clearTimeout(timer);resolve(r);},reject:e=>{clearTimeout(timer);reject(e);}});
      this.sendFrame(1,Buffer.from(JSON.stringify({id,method,params,...(sessionId?{sessionId}: {})})));
    });
  }
  close(){if(this.socket)this.socket.destroy();}
}
module.exports=CDP;
