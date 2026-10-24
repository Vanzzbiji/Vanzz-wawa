import{db,OWNER}from"./firebase.js";
import{ref,set,update,remove,push,onValue,serverTimestamp}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
const $=i=>document.getElementById(i),P=p=>ref(db,"wawa/"+p);
export function initOwner(gm,isOwner){let on=false,U={},M=0,CH=0;
const el=(t,x,c)=>{const e=document.createElement(t);e.textContent=x;if(c)e.className=c;return e};
function stats(){const n=Date.now(),a=Object.values(U).filter(u=>u.name);$("st").innerHTML="";
[[a.length,"Pengguna"],[a.filter(u=>u.online===true&&n-(u.lastSeen||0)<90000).length,"Online"],[a.filter(u=>n-(u.createdAt||0)<864e5).length,"Baru 24 jam"],[M,"Pesan 24 jam"],[a.filter(u=>u.banned).length,"Diblokir"],[CH,"Saluran"]].forEach(([v,l])=>{const d=document.createElement("div");d.style.textAlign="center";const b=el("b",v);b.style.cssText="font-size:26px;color:var(--tx)";d.append(b,l);$("st").append(d)});
$("ul").innerHTML="";a.sort((x,y)=>(y.createdAt||0)-(x.createdAt||0)).forEach(u=>{const r=el("div","","row"),t=el("div","","t");
t.append(el("b",u.name+(u.blue?" [verified]":"")+(u.mod?" [mod]":"")+(u.banned?" [banned]":"")),el("small",u.id+" · daftar "+new Date(u.createdAt||0).toLocaleDateString("id-ID")));r.append(el("div",u.name[0].toUpperCase(),"av"),t);r.onclick=()=>modal(u);$("ul").append(r)})}
function modal(u){const b=$("umb");b.innerHTML="";b.append(el("h2",u.name),el("p","ID "+u.id,"sub"));$("um").classList.remove("hide");
const k=(x,fn,s)=>{const e=el("button",x,"btn");if(s)e.style.cssText=s;e.onclick=async()=>{await fn();$("um").classList.add("hide")};b.append(e)};
const up=d=>update(P("users/"+u.uid),d);
k(u.blue?"Cabut centang biru":"Beri centang biru",()=>up({blue:!u.blue}));
k(u.banned?"Buka blokir":"Blokir akun",()=>up({banned:!u.banned}));
k(u.mod?"Cabut moderator":"Jadikan moderator",()=>up({mod:!u.mod}));
k("Atur title khusus",()=>{const t=prompt("Title khusus untuk "+u.name+" (kosongkan untuk hapus)",u.title||"");if(t!==null)return up({title:t.trim().slice(0,24)||null})});
k("Hapus akun",async()=>{if(confirm("Hapus akun "+u.name+"?")){await remove(P("ids/"+u.id));await remove(P("contacts/"+u.uid));await remove(P("pics/"+u.uid));await remove(P("users/"+u.uid))}},"background:var(--red);border:0");
k("Tutup",()=>{})}
$("own").onclick=()=>{if(!isOwner())return;$("ow").classList.remove("hide");if(on)return;on=true;const er=e=>{$("owe").textContent="Gagal membaca data ("+(e.code||e.message)+"). Pastikan rules-wawa.txt versi terbaru sudah di-Publish di Firebase."};
onValue(P("users"),s=>{U={};s.forEach(d=>{U[d.key]=d.val()});stats()},er);
onValue(P("mlog"),s=>{const n=Date.now();M=0;s.forEach(d=>{if(n-d.val()<864e5){M++}});stats()},er);
onValue(P("channels"),s=>{CH=s.numChildren();stats()},er);
onValue(P("config/banner"),s=>{$("bi").value=s.val()||""},er)};
$("owb").onclick=()=>$("ow").classList.add("hide");
$("bs").onclick=()=>set(P("config/banner"),$("bi").value.trim()).then(()=>alert("Banner disimpan"));
$("br").onclick=()=>remove(P("config/banner")).then(()=>{$("bi").value=""});
$("bsend").onclick=async()=>{const t=$("bt").value.trim();if(!t)return;await push(P("broadcast"),{text:t,t:serverTimestamp()});$("bt").value="";alert("Terkirim ke semua pengguna")}}
