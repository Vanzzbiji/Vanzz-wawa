import{ico}from"./icons.js";
import{db}from"./firebase.js";
import{ref,get,set,update,push,onValue,onChildAdded,off}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
const $=i=>document.getElementById(i),P=p=>ref(db,"wawa/"+p),ICE={iceServers:[{urls:"stun:stun.l.google.com:19302"}]};
let uid,gm,pc,ls,cid,role,cur,ans,offs=[],bt,tmr,t0;
const beep=on=>{clearInterval(bt);if(!on)return;const f=()=>{try{const a=new(window.AudioContext||webkitAudioContext)(),o=a.createOscillator();o.connect(a.destination);o.frequency.value=880;o.start();setTimeout(()=>{o.stop();a.close()},300)}catch(e){}navigator.vibrate&&navigator.vibrate(300)};f();bt=setInterval(f,1200)};
const sub=(r,cb,ch)=>{ch?onChildAdded(r,cb):onValue(r,cb);offs.push(()=>off(r))};
const ui=(n,st,inc)=>{$("cl").classList.remove("hide");$("cname").textContent=n;$("cst").textContent=st;$("cav").textContent=n[0].toUpperCase();$("cacc").classList.toggle("hide",!inc);$("cmid").classList.remove("hide");$("cpill").classList.add("hide");$("ccam").classList.add("hide")};
const live=()=>{ans=1;ui(cur.name,"Tersambung",0);const v=cur.type=="video";$("cmid").classList.toggle("hide",v);$("cpill").classList.toggle("hide",!v);$("cpn").textContent=cur.name;$("ccam").classList.toggle("hide",!v);
t0=Date.now();clearInterval(tmr);tmr=setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000),x=Math.floor(s/60)+":"+String(s%60).padStart(2,"0");$("ctm").textContent=x;if(!v)$("cst").textContent="Tersambung · "+x},1000)};
async function media(){ls=await navigator.mediaDevices.getUserMedia({audio:true,video:cur.type=="video"});$("lv").srcObject=ls;$("lv").style.display=cur.type=="video"?"block":"none"}
function mk(){pc=new RTCPeerConnection(ICE);ls.getTracks().forEach(t=>pc.addTrack(t,ls));pc.ontrack=e=>{$("rv").srcObject=e.streams[0]};pc.onicecandidate=e=>{e.candidate&&push(P("call/"+cid+"/"+(role=="a"?"ca":"cb")),e.candidate.toJSON())}}
const cand=()=>sub(P("call/"+cid+"/"+(role=="a"?"cb":"ca")),s=>{pc&&pc.addIceCandidate(s.val()).catch(()=>{})},1);
function watch(){sub(P("call/"+cid),async s=>{const c=s.val();if(!c)return;if(c.state=="ended")return done();
if(role=="a"&&pc&&c.answer&&!pc.currentRemoteDescription){await pc.setRemoteDescription(c.answer);cand();live()}})}
function done(){if(!cid)return;beep(0);clearInterval(tmr);$("ctm").textContent="";$("cmid").classList.remove("hide");$("cpill").classList.add("hide");$("ccam").classList.add("hide");$("cmute").innerHTML=ico("mic");$("ccam").innerHTML=ico("video");offs.forEach(f=>f());offs=[];ls&&ls.getTracks().forEach(t=>t.stop());pc&&pc.close();pc=ls=null;
$("rv").srcObject=null;$("lv").srcObject=null;$("cl").classList.add("hide");$("cav").classList.remove("hide");$("cst").classList.remove("hide");
push(P("calllog/"+uid),{name:cur.name,type:cur.type,dir:cur.dir,ok:!!ans,t:Date.now()});set(P("incoming/"+uid),null);if(role=="a")set(P("incoming/"+cur.uid),null);cid=cur=null;ans=0}
async function end(){if(cid)await update(P("call/"+cid),{state:"ended"}).catch(()=>{});done()}
export async function startCall(c,t){if(cid)return;role="a";cur={name:c.name,uid:c.uid,type:t,dir:"keluar"};
try{await media()}catch(e){cur=null;return alert("Izin mikrofon/kamera ditolak.")}
cid=push(P("call")).key;const my=cid;mk();ui(c.name,"Memanggil...",0);
await set(P("call/"+cid),{from:uid,fromName:gm().name,to:c.uid,type:t,state:"ringing",t:Date.now()});
const o=await pc.createOffer();await pc.setLocalDescription(o);await update(P("call/"+cid),{offer:{type:o.type,sdp:o.sdp}});
await set(P("incoming/"+c.uid),cid);watch();setTimeout(()=>{if(cid==my&&!ans)end()},45000)}
export function initCalls(u,g){uid=u;gm=g;
document.addEventListener("click",()=>{"Notification"in window&&Notification.permission=="default"&&Notification.requestPermission()},{once:true});
onValue(P("calllog/"+uid),s=>{const el=$("calls");el.innerHTML="";if(!s.exists()){el.innerHTML='<p class="empty">Belum ada panggilan. Buka chat teman lalu tap ikon telepon atau video.</p>';return}
const a=[];s.forEach(d=>{a.push(d.val())});a.reverse().forEach(x=>{const r=document.createElement("div");r.className="row";const t=document.createElement("div");t.className="t";
const b=document.createElement("b");b.textContent=(x.type=="video"?"Video · ":"Suara · ")+x.name;const m=document.createElement("small");m.textContent=(x.dir=="keluar"?"↗ Keluar":"↙ Masuk")+(x.ok?"":" · tak terjawab")+" · "+new Date(x.t).toLocaleString("id-ID");t.append(b,m);r.append(t);el.append(r)})});
onValue(P("incoming/"+uid),async s=>{const id=s.val();if(!id||cid)return;const c=(await get(P("call/"+id))).val();if(!c||c.state!="ringing"||cid)return;
cid=id;role="b";cur={name:c.fromName,uid:c.from,type:c.type,dir:"masuk"};ui(c.fromName,"Panggilan masuk ("+(c.type=="video"?"video":"suara")+")",1);beep(1);watch();
try{Notification.permission=="granted"&&new Notification("Panggilan masuk",{body:c.fromName+" menelpon kamu",requireInteraction:true})}catch(e){}});
$("cacc").onclick=async()=>{beep(0);$("cacc").classList.add("hide");try{await media()}catch(e){alert("Izin mikrofon/kamera ditolak.");return end()}
mk();const c=(await get(P("call/"+cid))).val();await pc.setRemoteDescription(c.offer);const a=await pc.createAnswer();await pc.setLocalDescription(a);
await update(P("call/"+cid),{answer:{type:a.type,sdp:a.sdp},state:"active"});cand();live()};
$("cend").onclick=end;$("ccam").onclick=()=>{const t=ls&&ls.getVideoTracks()[0];if(!t)return;t.enabled=!t.enabled;$("ccam").innerHTML=ico(t.enabled?"video":"videooff")};$("cmute").onclick=()=>{if(!ls)return;const t=ls.getAudioTracks()[0];t.enabled=!t.enabled;$("cmute").innerHTML=ico(t.enabled?"mic":"micoff")}}
