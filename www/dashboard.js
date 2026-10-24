import{auth,db,OWNER}from"./firebase.js";import{ico}from"./icons.js";import{initCalls,startCall}from"./calls.js";import{initOwner}from"./owner.js";
import{onAuthStateChanged as O,signOut,sendPasswordResetEmail as R,deleteUser,reauthenticateWithCredential,EmailAuthProvider}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import{ref,get,set,update,remove,push,onValue,onChildAdded,onDisconnect,serverTimestamp}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
const $=i=>document.getElementById(i),P=p=>ref(db,"wawa/"+p),W=ref(db,"wawa"),T=["VANZZ WAWA","Pembaruan","Panggilan","Profil"];
const MAXF=5*1024*1024,BG=["#6d3df0","#0ea5e9","#e11d48","#16a34a","#f59e0b","#334155"];
const BL={};let deleting=0,me,tab=0,filter=0,srvOff=0,RM=null,CT={},GR={},CHN={},MYS={},FI=null,cleaned=0;
const now=()=>Date.now()+srvOff;
const h=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const col=n=>{let k=0;for(const c of n)k=k*31+c.charCodeAt(0);return`hsl(${k%360} 60% 55%)`};
/* ---------- v3 helpers: badge, foto, presence, banner ---------- */
const BADGE="https://files.catbox.moe/wv6g0b.png",UC={},UW={},PIC={},CPIC={};
const DEF=$("bn").textContent,setBn=t=>{const e=$("bn");e.textContent=t;e.style.setProperty("--d",Math.max(10,6+t.length*.22)+"s")};setBn(DEF);
let rdt;const rdq=()=>{clearTimeout(rdt);rdt=setTimeout(()=>{if(!me)return;drawChats();drawChannels();hdrN()},80)};
function nameB(n,u){const f=document.createDocumentFragment();f.append(n);if(u&&u.blue){const i=document.createElement("img");i.src=BADGE;i.className="vb";i.alt="centang biru";f.append(i)}if(u&&u.mod)f.append(h("span","mb",""));return f}
function wu(id){if(!UW[id]){UW[id]=1;onValue(P("users/"+id),s=>{const o=UC[id],n=s.val()||{};UC[id]=n;document.querySelectorAll('.who[data-u="'+id+'"]').forEach(e=>{e.textContent="";e.append(nameB(e.dataset.n,n))});if(!o||o.blue!=n.blue||o.mod!=n.mod||o.name!=n.name)rdq()},()=>{})}return UC[id]||{}}
const getPic=id=>PIC[id]||(PIC[id]=get(P("pics/"+id)).then(s=>s.val()||{}).catch(()=>({})));
const getCPic=id=>CPIC[id]||(CPIC[id]=get(P("chpics/"+id)).then(s=>s.val()||{}).catch(()=>({})));
const putPic=(el,u)=>{if(u&&u.photo){el.style.backgroundImage="url("+u.photo+")";el.style.backgroundSize="cover";el.style.backgroundPosition="center";el.textContent=""}};
const setAv=(el,id,ch)=>(ch?getCPic:getPic)(id).then(p=>putPic(el,p));
const isOn=x=>x.online===true&&now()-(x.lastSeen||0)<75000;
const fmtLS=t=>{const d=new Date(t),n=new Date(now()),y=new Date(n);y.setDate(n.getDate()-1);const hm=fmtT(t);return d.toDateString()==n.toDateString()?"hari ini "+hm:d.toDateString()==y.toDateString()?"kemarin "+hm:d.toLocaleDateString("id-ID")+" "+hm};
function titleChips(u){const a=[];if(u.blue)a.push(h("span","ttl tb","✦ VERIFIED"));if(u.mod)a.push(h("span","ttl tm","MODERATOR"));if(u.title)a.push(h("span","ttl tc",""+u.title));return a}
function banner(el,url){el.classList.remove("def","img","gif");el.style.backgroundImage="";if(!url){el.classList.add("def");return}el.style.backgroundImage="url("+url+")";el.classList.add(url.indexOf("data:image/gif")==0?"gif":"img")}
let bct,bhd;function hideBc(){const el=$("bcast");clearTimeout(bct);el.classList.add("out");bhd=setTimeout(()=>el.classList.add("hide"),400)}
function showBc(t){const el=$("bcast");clearTimeout(bhd);clearTimeout(bct);el.innerHTML="";const d=h("div","bt");d.append(h("b","","VANZZ WAWA"),h("span","",t));const x=h("button","","✕");x.onclick=hideBc;el.append((()=>{const i=h("i");i.innerHTML=ico("mega");return i})(),d,x,h("u"));el.classList.remove("hide","out");bct=setTimeout(hideBc,10000)}
const fmtT=t=>new Date(t).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
const fmtD=s=>Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
const sz=n=>n>1048576?(n/1048576).toFixed(1)+" MB":Math.max(1,Math.ceil(n/1024))+" KB";
const isOwner=()=>((auth.currentUser&&auth.currentUser.email)||(me&&me.email)||"").trim().toLowerCase()===OWNER.toLowerCase();
const errMsg=e=>/PERMISSION_DENIED|permission/i.test(e.code||e.message||"")?"Ditolak server. Publish dulu rules-wawa.txt yang baru di Firebase.":(e.message||e.code||"Gagal");
const pv=x=>x.dl?"Pesan dihapus":x.ty=="image"?"Foto":x.ty=="video"?"Video":x.ty=="audio"?"Pesan suara":x.ty=="doc"?""+(x.nm||"Dokumen"):x.ty=="loc"?"Lokasi":x.ty=="poll"?""+x.tx:x.ty=="ask"?""+x.tx:(x.tx||"").slice(0,60);
onValue(ref(db,".info/serverTimeOffset"),s=>srvOff=s.val()||0);
setInterval(()=>$("clk").textContent=""+new Date().toLocaleTimeString("id-ID"),1000);
let tt;const toast=(m,ms=2600)=>{const t=$("toast");t.textContent=m;t.classList.remove("hide");clearTimeout(tt);tt=setTimeout(()=>t.classList.add("hide"),ms)};

/* ---------- modal helpers ---------- */
function modal(build){const b=$("mdb");b.innerHTML="";const close=()=>$("md").classList.add("hide");$("md").classList.remove("hide");build(b,close);return close}
$("md").onclick=e=>{if(e.target==$("md"))$("md").classList.add("hide")};
function sheet(title,items){modal((b,close)=>{if(title)b.append(h("h3","",title));items.filter(Boolean).forEach(([l,f,d])=>{const x=h("button","btn"+(d?" dg":""),l);x.onclick=()=>{close();f()};b.append(x)});const c=h("button","btn","Batal");c.onclick=close;b.append(c)})}
function ask(title,fields,ok="Simpan"){return new Promise(res=>{modal((b,close)=>{b.append(h("h3","",title));const inp={};
fields.forEach(f=>{if(f.label)b.append(h("label","",f.label));const i=h("input");i.placeholder=f.ph||"";i.value=f.val||"";i.maxLength=f.max||100;if(f.type)i.type=f.type;inp[f.k]=i;b.append(i)});
const row=h("div","mrow"),c=h("button","btn","Batal"),o=h("button","btn p",ok);
c.onclick=()=>{close();res(null)};o.onclick=()=>{const v={};for(const k in inp)v[k]=inp[k].value.trim();close();res(v)};row.append(c,o);b.append(row);
const f1=Object.values(inp)[0];f1&&(f1.onkeydown=e=>{e.key=="Enter"&&o.click()});setTimeout(()=>f1&&f1.focus(),60)})})}
function row(n,s,a,u,pid,ch){const r=h("div","row"),v=h("div","av",a);v.style.background=col(n);const t=h("div","t"),b=h("b");b.append(nameB(n,u));t.append(b,h("small","",s));r.append(v,t);if(pid)setAv(v,pid,ch);return r}

/* ---------- nav / tabs ---------- */
function show(i){tab=i;[0,1,2,3].forEach(k=>$("t"+k).classList.toggle("hide",k!=i));document.querySelectorAll("nav button").forEach((b,k)=>b.classList.toggle("on",k==i));
$("ttl").textContent=T[i];$("tp").classList.toggle("c",i>0);$("clk").classList.toggle("hide",i>0);$("fab").classList.toggle("hide",i>1);if(i==1)loadFresh()}
document.querySelectorAll("nav button").forEach((b,i)=>b.onclick=()=>show(i));
document.querySelectorAll("#chips button").forEach(b=>b.onclick=()=>{filter=+b.dataset.f;document.querySelectorAll("#chips button").forEach(x=>x.classList.toggle("on",x==b));drawChats()});
$("q").oninput=()=>drawChats();
$("fab").onclick=()=>{if(tab==0)sheet("Chat baru",[["Tambah teman lewat ID",addFriend],["Buat grup",newGroup]]);else if(tab==1)addStatus()};

/* ---------- chat list ---------- */
function items(){const a=[];
Object.values(CT).forEach(c=>{const u=wu(c.uid),n=c.alias||u.name||c.name;a.push({k:"dm",id:c.uid,name:n,sub:BL[c.uid]?"Diblokir":(c.last||"ID "+c.id),lt:c.lt||0,id8:c.id,av:n[0].toUpperCase(),u,pid:c.uid})});
Object.entries(GR).forEach(([g,v])=>a.push({k:"gr",id:g,name:v.name,sub:v.last||"Grup",lt:v.lt||0,av:v.name[0].toUpperCase()}));
return a.sort((x,y)=>y.lt-x.lt)}
function drawChats(){if(!me)return;const el=$("chats"),q=$("q").value.trim().toLowerCase(),f=["","dm","gr","ch"][filter];el.innerHTML="";
const a=items().filter(i=>(!f||i.k==f)&&(!q||i.name.toLowerCase().includes(q)||(i.id8||"").includes(q)));
if(!a.length){el.append(h("p","empty",q?"Tidak ditemukan.":"Belum ada chat di sini. Tap + untuk tambah teman lewat ID atau buat grup."));return}
a.forEach(i=>{const r=row(i.name,i.sub,i.av,i.u,i.pid);r.onclick=()=>{if(!r.ld)openRoom(i)};if(i.k=="dm"){let lp;const menu=()=>{r.ld=1;setTimeout(()=>r.ld=0,500);sheet(i.name,[["Buka chat",()=>openRoom(i)],[BL[i.id]?"Buka blokir":"Blokir pengguna",()=>BL[i.id]?unblockUser(i.id,i.name):blockUser(i.id,i.name),1],["Hapus chat",()=>delChat(i.id,i.name),1]])};r.ontouchstart=()=>{lp=setTimeout(menu,550)};["touchend","touchmove","touchcancel"].forEach(ev=>r.addEventListener(ev,()=>clearTimeout(lp),{passive:true}));r.oncontextmenu=ev=>{ev.preventDefault();menu()}}el.append(r)})}

/* ---------- add friend / group ---------- */
function addFriend(){modal((b,close)=>{b.append(h("h3","","Tambah teman"),h("p","sub","Masukkan ID milik temanmu."));
const i=h("input");i.placeholder="contoh: 77790549";i.inputMode="numeric";i.maxLength=12;
const er=h("div","err"),res=h("div"),go=h("button","btn p","Cari"),cc=h("button","btn","Tutup");cc.onclick=close;b.append(i,er,res,go,cc);
const find=async()=>{er.textContent="";res.innerHTML="";const id=i.value.replace(/\D/g,"");
if(id.length<6){er.textContent="ID tidak valid.";return}if(id==me.id){er.textContent="Itu ID kamu sendiri.";return}
go.disabled=true;try{const s=await get(P("ids/"+id));if(!s.exists()){er.textContent="ID tidak ditemukan.";return}
const f=(await get(P("users/"+s.val()))).val();if(!f){er.textContent="Pengguna tidak ditemukan.";return}
const r=row(f.name,"ID "+f.id,f.name[0].toUpperCase(),f,f.uid),ad=h("button","btn p",CT[f.uid]?"Buka chat":"Tambahkan & chat");
ad.onclick=async()=>{close();if(!CT[f.uid])await set(P("contacts/"+me.uid+"/"+f.uid),{uid:f.uid,id:f.id,name:f.name,lt:Date.now()}).catch(e=>toast(errMsg(e)));openRoom({k:"dm",id:f.uid,name:f.name,id8:f.id})};
r.onclick=()=>showProfile(f.uid);res.append(r,ad)}catch(e){er.textContent=errMsg(e)}finally{go.disabled=false}};
go.onclick=find;i.onkeydown=e=>{e.key=="Enter"&&find()};setTimeout(()=>i.focus(),60)})}
function pickContacts(title,ex,cb,withName){modal((b,close)=>{b.append(h("h3","",title));let ni;if(withName){ni=h("input");ni.placeholder="Nama grup";ni.maxLength=40;b.append(ni)}
const l=Object.values(CT).filter(c=>!ex.includes(c.uid)),sel=new Set(),box=h("div","pk");
if(!l.length)b.append(h("p","empty","Belum ada teman. Tambahkan teman lewat ID dulu."));
l.forEach(c=>{const r=row(c.name,"ID "+c.id,c.name[0].toUpperCase());r.append(h("b","ck","✓"));r.onclick=()=>{sel.has(c.uid)?sel.delete(c.uid):sel.add(c.uid);r.classList.toggle("sel",sel.has(c.uid))};box.append(r)});b.append(box);
const er=h("div","err"),ok=h("button","btn p",withName?"Buat grup":"Tambahkan"),cc=h("button","btn","Batal");cc.onclick=close;
ok.onclick=()=>{const n=withName?ni.value.trim():"";if(withName&&!n){er.textContent="Nama grup wajib diisi.";return}if(!sel.size){er.textContent="Pilih minimal 1 teman.";return}close();cb([...sel],n)};b.append(er,ok,cc)})}
function newGroup(){pickContacts("Buat grup",[],async(sel,name)=>{const gid=push(P("groups")).key,t=Date.now(),members={[me.uid]:true};sel.forEach(m=>members[m]=true);
const u={["groups/"+gid]:{name,owner:me.uid,members,t}};Object.keys(members).forEach(m=>u["ugroups/"+m+"/"+gid]={name,gid,lt:t,last:"Grup dibuat"});
try{await update(W,u);toast("Grup dibuat");openRoom({k:"gr",id:gid,name})}catch(e){toast(errMsg(e))}},1)}
function pickTarget(){return new Promise(res=>{modal((b,close)=>{b.append(h("h3","","Teruskan ke..."));const l=items().filter(i=>i.k!="ch");if(!l.length)b.append(h("p","empty","Belum ada tujuan."));
l.forEach(i=>{const r=row(i.name,i.k=="gr"?"Grup":"ID "+i.id8,i.av);r.onclick=()=>{close();res(i)};b.append(r)});const c=h("button","btn","Batal");c.onclick=()=>{close();res(null)};b.append(c)})})}

/* ---------- files ---------- */
const readURL=f=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(f)});
async function compress(f,max=1280){const im=new Image(),u=URL.createObjectURL(f);await new Promise((ok,no)=>{im.onload=ok;im.onerror=()=>no(new Error("Format gambar tidak didukung"));im.src=u});URL.revokeObjectURL(u);
const s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext("2d").drawImage(im,0,0,c.width,c.height);return c.toDataURL("image/jpeg",.72)}
async function prep(f,kind,max){if(kind=="image")return{url:await compress(f,max),m:{}};
if(f.size>MAXF)throw new Error("Ukuran file maksimal "+sz(MAXF)+" (file ini "+sz(f.size)+")");return{url:await readURL(f),m:{nm:f.name,sz:f.size}}}
async function cropTo(f,w,hh,q){const im=new Image(),u=URL.createObjectURL(f);await new Promise((ok,no)=>{im.onload=ok;im.onerror=()=>no(new Error("Format gambar tidak didukung"));im.src=u});URL.revokeObjectURL(u);const c=document.createElement("canvas");c.width=w;c.height=hh;const s=Math.max(w/im.width,hh/im.height),dw=im.width*s,dh=im.height*s;c.getContext("2d").drawImage(im,(w-dw)/2,(hh-dh)/2,dw,dh);return c.toDataURL("image/jpeg",q)}
const FC={};
const getFile=(fp,k)=>FC[fp+"/"+k]||(FC[fp+"/"+k]=get(P(fp+"/"+k)).then(async s=>{if(!s.exists())throw new Error("hilang");return URL.createObjectURL(await (await fetch(s.val())).blob())}).catch(e=>{delete FC[fp+"/"+k];throw e}));
const rawFile=async(fp,k)=>{const s=await get(P(fp+"/"+k));if(!s.exists())throw new Error("File sudah tidak ada");return s.val()};
function pickFile(kind,cb){FI=cb;const i=$("fi");i.accept=kind=="image"?"image/*":kind=="video"?"video/*":"*/*";i.dataset.k=kind;i.click()}
$("fi").onchange=e=>{const f=e.target.files[0],k=e.target.dataset.k;e.target.value="";if(f&&FI)FI(f,k)};

/* ---------- room ---------- */
function mkRoom(it){
if(it.k=="dm"){const c=[me.uid,it.id].sort().join("_");return{k:"dm",id:it.id,mp:"msgs/"+c,fp:"dmf/"+c,tp:"typ/"+c,name:it.name,send:BL[it.id]?0:1}}
if(it.k=="gr")return{k:"gr",id:it.id,mp:"gmsgs/"+it.id,fp:"gf/"+it.id,tp:"typ/g_"+it.id,name:it.name,send:1};
const c=CHN[it.id]||{};return{k:"ch",id:it.id,mp:"chposts/"+it.id,fp:"chf/"+it.id,name:it.name,send:c.owner==me.uid||!!(c.admins&&c.admins[me.uid])}}
function openRoom(it){closeRoom();const r=RM=mkRoom(it);r.L=[];r.M={};r.first=1;r.un=[];r.TY={};r.rs="";r.rk=rk(r);r.RX={};r.VT={};r.RP={};
$("room").classList.remove("hide");hdr();
$("vc").classList.toggle("hide",r.k!="dm");$("vv").classList.toggle("hide",r.k!="dm");$("rmn").classList.remove("hide");
$("ms").innerHTML="";$("mi").value="";clearCtx();setSendBar();setRs();drawTyping();
const bad=e=>toast(errMsg(e));
r.un.push(onValue(P(r.mp),s=>{r.L=[];r.M={};s.forEach(d=>{r.L.push([d.key,d.val()]);r.M[d.key]=d.val()});draw()},bad));
if(r.tp)r.un.push(onValue(P(r.tp),s=>{r.TY={};s.forEach(d=>{if(d.key!=me.uid)r.TY[d.key]=d.val()});drawTyping()},()=>{}));
if(r.k=="dm")r.un.push(onValue(P("users/"+r.id),s=>{r.U=s.val()||{};seenTxt()},()=>{}));
if(r.k=="gr")r.un.push(onValue(P("groups/"+r.id),s=>{r.G=s.val();if(!r.G){if(RM===r)closeRoom();return}r.rs=Object.keys(r.G.members||{}).length+" anggota";r.name=r.G.name;hdrN();setRs()},()=>{}));
r.un.push(onValue(P("react/"+r.rk),s=>{r.RX=s.val()||{};draw()},()=>{}));
if(r.k=="ch"){r.un.push(onValue(P("chvotes/"+r.id),s=>{r.VT=s.val()||{};draw()},()=>{}));r.un.push(onValue(P("chreplies/"+r.id),s=>{r.RP=s.val()||{};draw()},()=>{}))}
if(r.k=="ch")chRoomInfo()}
function chRoomInfo(){const r=RM;if(!r||r.k!="ch")return;const c=CHN[r.id];if(!c)return;r.send=c.owner==me.uid||!!(c.admins&&c.admins[me.uid]);r.rs=Object.keys(c.followers||{}).length+" pengikut";setRs();setSendBar()}
function closeRoom(){if(!RM)return;stopRec(0);RM.un.forEach(f=>f());RM=null;$("room").classList.add("hide");$("ms").innerHTML=""}
$("bk").onclick=closeRoom;
function hdrN(){const r=RM;if(!r)return;const n=$("rn");n.textContent="";n.append(nameB(r.name,r.k=="dm"?wu(r.id):null))}
function hdr(){const r=RM;if(!r)return;hdrN();const a=$("rav");a.style.backgroundImage="";a.style.background=col(r.name);a.textContent=r.name[0].toUpperCase();if(r.k=="dm")setAv(a,r.id);else if(r.k=="ch")setAv(a,r.id,1)}
$("rav").onclick=$("rn").onclick=()=>{const r=RM;if(!r)return;if(r.k=="dm")showProfile(r.id,r.name);else if(r.k=="ch")chInfo();else grInfo()};
function seenTxt(){const r=RM;if(!r||r.k!="dm")return;const x=r.U||{};r.rs=x.showSeen===false?"":isOn(x)?"online":x.lastSeen?"terakhir dilihat "+fmtLS(x.lastSeen):"";setRs()}
setInterval(seenTxt,10000);
function setRs(){const r=RM;if(!r)return;const ty=activeTyping();const e=$("rs");e.textContent=ty?(r.k=="gr"?ty+" mengetik...":"sedang mengetik..."):r.rs;e.style.color=ty?"#22d3ee":""}
function setSendBar(){const r=RM;if(!r)return;$("sendbar").classList.toggle("hide",!r.send);const n=$("nosend");n.classList.toggle("hide",!!r.send);
if(!r.send){n.innerHTML="";if(r.k=="dm"){const bt=h("button","btn p","Buka blokir");bt.onclick=()=>unblockUser(r.id,r.name);n.append(h("p","sub","Kamu memblokir kontak ini"),bt);return}const c=CHN[r.id]||{};if(c.followers&&c.followers[me.uid])n.textContent="Hanya pemilik dan admin saluran yang dapat mengirim pesan";else{const b=h("button","btn p","Ikuti saluran");b.onclick=()=>followCh(r.id,1);n.append(b)}}}
function activeTyping(){if(!RM)return"";const a=Object.values(RM.TY||{}).filter(v=>v&&now()-v.t<4500);return a.length?a.map(v=>v.n).join(", "):""}
function drawTyping(){const t=activeTyping(),bar=$("typ");bar.classList.toggle("hide",!t);if(t)$("typt").textContent=(RM.k=="gr"?t+" ":"")+"sedang mengetik...";setRs()}
setInterval(drawTyping,1000);
function draw(){const r=RM;if(!r)return;const m=$("ms"),near=r.first||m.scrollHeight-m.scrollTop-m.clientHeight<160;m.innerHTML="";
r.L.forEach(([k,x])=>{if(x.dm&&x.dm[me.uid])return;if(r.k=="dm"&&BL[r.id]&&x.from==r.id)return;m.append(msgEl(r,k,x,near))});if(near)m.scrollTop=m.scrollHeight;r.first=0}
function msgEl(r,k,x,stick){const mine=x.from==me.uid,e=h("div","m"+(mine?" me":""));e.dataset.k=k;if(x.sys){e.className="sysm";e.textContent=x.tx;return e}
if(x.dl){e.classList.add("del");e.append(h("span","",""+(mine?"Kamu menghapus pesan ini":"Pesan ini dihapus")))}
else{
if(r.k=="gr"&&!mine){const w=h("div","who");w.dataset.u=x.from;w.dataset.n=x.fn||"?";w.append(nameB(x.fn||"?",wu(x.from)));e.append(w)}
if(x.fw)e.append(h("div","fw","↪ Diteruskan"));
if(x.rp){const q=h("div","qt");q.append(h("b","",x.rp.n),h("span","",x.rp.t));q.onclick=()=>jump(x.rp.k);e.append(q)}
if(x.ty=="image"){const im=h("img","mi");im.alt="";getFile(r.fp,k).then(u=>{im.src=u;im.onload=()=>{if(stick&&RM===r)$("ms").scrollTop=$("ms").scrollHeight};im.onclick=()=>{$("lbi").src=u;$("lb").classList.remove("hide")}}).catch(()=>im.alt="Foto tidak tersedia");e.append(im)}
else if(x.ty=="video"||x.ty=="audio"){const b=h("div","fl"),d=h("div");d.append(x.ty=="video"?"Video":"Pesan suara",h("small","",x.ty=="audio"&&x.du?fmtD(x.du):sz(x.sz||0)));b.append(si(x.ty=="video"?"play":"mic"),d);
b.onclick=async()=>{b.firstChild.textContent="...";try{const u=await getFile(r.fp,k),m=document.createElement(x.ty);m.controls=true;m.src=u;if(x.ty=="video")m.playsInline=true;b.replaceWith(m);m.play().catch(()=>{})}catch(er){b.firstChild.textContent="";toast("File tidak tersedia")}};e.append(b)}
else if(x.ty=="doc"){const b=h("div","fl"),d=h("div");d.append(x.nm||"Dokumen",h("small","",sz(x.sz||0)));b.append(si("doc"),d);
b.onclick=async()=>{try{const u=await getFile(r.fp,k),a=h("a");a.href=u;a.download=x.nm||"dokumen";document.body.append(a);a.click();a.remove()}catch(er){toast("File tidak tersedia")}};e.append(b)}
if(x.tx){const q=h("div","tx");q.append(rich(r,x.tx));e.append(q)}if(x.ty=="loc")locEl(x,e);if(x.ty=="poll")pollEl(r,k,x,e);if(x.ty=="ask")askEl(r,k,x,e)}
if(!x.dl)rxEl(r,k,e);
const mt=h("div","mt");if(x.ed&&!x.dl)mt.append("diedit");mt.append(fmtT(x.t||Date.now()));const mb=h("button","","⋮");mb.onclick=ev=>{ev.stopPropagation();msgMenu(r,k,x)};mt.append(mb);e.append(mt);
let lp;e.ontouchstart=()=>{lp=setTimeout(()=>msgMenu(r,k,x),550)};["touchend","touchmove","touchcancel"].forEach(ev=>e.addEventListener(ev,()=>clearTimeout(lp),{passive:true}));e.oncontextmenu=ev=>{ev.preventDefault();msgMenu(r,k,x)};
return e}
function jump(k){const e=$("ms").querySelector('[data-k="'+k+'"]');if(!e)return toast("Pesan asli tidak ditemukan");e.scrollIntoView({block:"center"});e.classList.add("hl");setTimeout(()=>e.classList.remove("hl"),1500)}
$("lb").onclick=()=>{$("lb").classList.add("hide");$("lbi").src=""};

/* ---------- message actions ---------- */
function msgMenu(r,k,x){const mine=x.from==me.uid;
sheet("",[!x.dl&&["Beri reaksi",()=>reactPick(r.rk,k)],!x.dl&&r.send&&["↩Balas",()=>startReply(r,k,x)],x.tx&&!x.dl&&["Salin",()=>navigator.clipboard.writeText(x.tx).then(()=>toast("Disalin"),()=>{})],
!x.dl&&x.ty!="poll"&&x.ty!="ask"&&["↪Teruskan",()=>forward(r,k,x)],mine&&!x.dl&&x.ty=="text"&&["Edit (maks 5 menit)",()=>startEdit(r,k,x)],
r.k!="ch"&&["Hapus untuk saya",()=>set(P(r.mp+"/"+k+"/dm/"+me.uid),1).catch(e=>toast(errMsg(e)))],
mine&&!x.dl&&["Hapus untuk semua",()=>{if(confirm("Hapus pesan ini untuk semua orang?"))update(W,{[r.mp+"/"+k]:{from:x.from,fn:x.fn||"",t:x.t||now(),dl:1},[r.fp+"/"+k]:null}).catch(e=>toast(errMsg(e)))},1]])}
function clearCtx(){if(RM){RM.rp=null;RM.ed=null}$("rpl").classList.add("hide")}
function startReply(r,k,x){clearCtx();r.rp={k,n:x.from==me.uid?"Kamu":(x.fn||"?"),t:pv(x)};$("rpn").textContent="Membalas "+r.rp.n;$("rpt").textContent=r.rp.t;$("rpl").classList.remove("hide");$("mi").focus()}
function startEdit(r,k,x){if(now()-(x.t||0)>3e5)return toast("Batas edit 5 menit setelah kirim sudah lewat");clearCtx();r.ed=k;$("rpn").textContent="Edit pesan";$("rpt").textContent=x.tx;$("rpl").classList.remove("hide");$("mi").value=x.tx;updSb();$("mi").focus()}
$("rpx").onclick=()=>{const w=RM&&RM.ed;clearCtx();if(w){$("mi").value="";updSb()}};
async function forward(r,k,x){const tg=await pickTarget();if(!tg)return;try{const r2=mkRoom(tg);const o={ty:x.ty||"text",fw:1};["tx","nm","sz","du","la","lo"].forEach(f=>{if(x[f]!=null)o[f]=x[f]});
const file=/^(image|video|audio|doc)$/.test(o.ty)?await rawFile(r.fp,k):null;await sendMsg(r2,o,file);toast("Pesan diteruskan")}catch(e){toast(errMsg(e))}}

/* ---------- sending ---------- */
async function sendMsg(r,o,file){if(r.k=="dm"&&(await get(P("blocks/"+r.id+"/"+me.uid))).exists())throw new Error("Pesan tidak terkirim. Kamu diblokir oleh pengguna ini.");if(r.k=="gr"&&!r.G)r.G=(await get(P("groups/"+r.id))).val();
const mk=push(P(r.mp)).key,u={[r.mp+"/"+mk]:{from:me.uid,fn:me.name,t:serverTimestamp(),...o}};if(file)u[r.fp+"/"+mk]=file;
await update(W,u);push(P("mlog"),Date.now()).catch(()=>{});bump(r,o)}
function bump(r,o){const t=Date.now(),p=pv(o),q=()=>{};
if(r.k=="dm"){update(P("contacts/"+me.uid+"/"+r.id),{last:"Kamu: "+p,lt:t}).catch(q);update(P("contacts/"+r.id+"/"+me.uid),{uid:me.uid,id:me.id,name:me.name,last:p,lt:t}).catch(q)}
else if(r.k=="gr"&&r.G)Object.keys(r.G.members||{}).forEach(m=>update(P("ugroups/"+m+"/"+r.id),{name:r.G.name,gid:r.id,last:(o.mn&&o.mn[m]?"@ ":"")+me.name+": "+p,lt:t}).catch(q));
else if(r.k=="ch")update(P("channels/"+r.id),{last:p,lt:t}).catch(q)}
async function send(){const r=RM;if(!r||!r.send)return;const t=$("mi").value.trim();if(!t)return;
if(r.ed){const k=r.ed,x=r.M[k];clearCtx();$("mi").value="";updSb();if(!x||now()-(x.t||0)>3e5)return toast("Batas edit 5 menit sudah lewat");
return update(P(r.mp+"/"+k),{tx:t,ed:1}).catch(e=>toast(errMsg(e)))}
const o={ty:"text",tx:t};if(r.k=="gr"){const mn={};mnames(r).forEach(([u,n])=>{if(u!=me.uid&&t.toLowerCase().includes("@"+n.toLowerCase()))mn[u]=1});if(Object.keys(mn).length)o.mn=mn}if(r.rp)o.rp=r.rp;clearCtx();$("mi").value="";updSb();if(r.tp)remove(P(r.tp+"/"+me.uid)).catch(()=>{});
try{await sendMsg(r,o)}catch(e){toast(errMsg(e))}}
async function sendFile(f,kind){const r=RM;if(!r||!r.send)return;toast("Mengirim...",15000);
try{const p=await prep(f,kind);const o={ty:kind,...p.m};if(r.rp)o.rp=r.rp;clearCtx();await sendMsg(r,o,p.url);toast("Terkirim",1200)}catch(e){toast(errMsg(e))}}
$("att").onclick=()=>sheet("Kirim",[["Foto",()=>pickFile("image",sendFile)],["Video (maks 5 MB)",()=>pickFile("video",sendFile)],["Dokumen (maks 5 MB)",()=>pickFile("doc",sendFile)],["Lokasi",sendLoc],RM&&RM.k=="ch"&&["Buat voting",newPoll],RM&&RM.k=="ch"&&["Ajukan pertanyaan",newAsk]]);
let lastTy=0;
const updSb=()=>{$("sb").innerHTML=ico((rec||$("mi").value.trim())?"send":"mic")};
$("mi").oninput=()=>{updSb();const r=RM;if(!r||!r.tp||r.ed)return;const n=Date.now();if($("mi").value&&n-lastTy>2500){lastTy=n;set(P(r.tp+"/"+me.uid),{t:now(),n:me.name}).catch(()=>{})}};
$("mi").onkeydown=e=>{if(e.key=="Enter")send()};
$("sb").onclick=()=>{if(rec)return stopRec(1);if($("mi").value.trim())return send();startRec()};
/* voice note */
let rec,rcs,rt,rt0,rcancel;
async function startRec(){if(!RM||!navigator.mediaDevices||!window.MediaRecorder)return toast("Perangkat tidak mendukung rekam suara");
let st;try{st=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){return toast("Izin mikrofon ditolak")}
const mt=["audio/webm;codecs=opus","audio/webm","audio/mp4"].find(t=>MediaRecorder.isTypeSupported(t)),room=RM,mr=rec=new MediaRecorder(st,mt?{mimeType:mt,audioBitsPerSecond:32000}:{});rcs=[];rcancel=0;
mr.ondataavailable=e=>e.data.size&&rcs.push(e.data);
mr.onstop=async()=>{clearInterval(rt);st.getTracks().forEach(t=>t.stop());const du=Math.round((Date.now()-rt0)/1000),b=new Blob(rcs,{type:mr.mimeType||mt||"audio/webm"});rec=null;
$("mi").classList.remove("hide");$("rbar").classList.add("hide");updSb();if(rcancel||du<1||RM!==room)return;if(b.size>MAXF)return toast("Rekaman terlalu besar");
try{await sendMsg(room,{ty:"audio",du,sz:b.size},await readURL(b))}catch(e){toast(errMsg(e))}};
mr.start();rt0=Date.now();$("mi").classList.add("hide");$("rbar").classList.remove("hide");$("rtm").textContent="0:00";updSb();
rt=setInterval(()=>{const s=Math.round((Date.now()-rt0)/1000);$("rtm").textContent=fmtD(s);if(s>=180)stopRec(1)},500)}
function stopRec(ok){if(!rec)return;rcancel=!ok;if(rec.state!="inactive")rec.stop()}
$("rcx").onclick=()=>stopRec(0);
$("vc").onclick=()=>RM&&(BL[RM.id]?toast("Buka blokir dulu untuk menelepon"):startCall({name:RM.name,uid:RM.id},"audio"));$("vv").onclick=()=>RM&&(BL[RM.id]?toast("Buka blokir dulu untuk menelepon"):startCall({name:RM.name,uid:RM.id},"video"));
$("rmn").onclick=()=>{const r=RM;if(!r)return;if(r.k=="gr"){const own=r.G&&r.G.owner==me.uid;sheet(r.name,[["Info & anggota",grInfo],["Tautan & undang teman",grLink],["Bersihkan chat",clearChat,1],own?["Bubarkan grup",disband,1]:["Keluar grup",leaveGr,1]])}else if(r.k=="dm"){sheet(r.name,[["Lihat profil",()=>showProfile(r.id,r.name)],["Bersihkan chat",clearChat,1],[BL[r.id]?"Buka blokir":"Blokir pengguna",()=>BL[r.id]?unblockUser(r.id,r.name):blockUser(r.id,r.name),1],["Hapus chat",()=>delChat(r.id,r.name),1]])}else{const c=CHN[r.id]||{},f=c.followers&&c.followers[me.uid];sheet(r.name,[["Info & admin saluran",chInfo],c.owner==me.uid&&["Ubah foto saluran",chPhoto],c.owner!=me.uid&&[f?"Berhenti mengikuti":"Ikuti saluran",()=>followCh(r.id,!f)]])}};
async function grInfo(){const r=RM,g=r.G;if(!g)return;const ids=Object.keys(g.members||{});
const us=await Promise.all(ids.map(i=>get(P("users/"+i)).then(s=>s.val()||{name:"?"}).catch(()=>({name:"?"}))));
modal((b,close)=>{b.append(h("h3","",g.name),h("p","sub",ids.length+" anggota"));us.forEach((u,j)=>{const x=row(u.name+(ids[j]==g.owner?" (pembuat)":""),"ID "+(u.id||"-"),(u.name||"?")[0].toUpperCase(),u,ids[j]);x.onclick=()=>showProfile(ids[j],u.name);b.append(x)});
const ad=h("button","btn p","+ Tambah anggota"),lv=h("button","btn dg","Keluar grup"),cc=h("button","btn","Tutup");cc.onclick=close;
ad.onclick=()=>{close();pickContacts("Tambah anggota",ids,async sel=>{const u={},t=Date.now();sel.forEach(m=>{u["groups/"+r.id+"/members/"+m]=true;u["ugroups/"+m+"/"+r.id]={name:g.name,gid:r.id,lt:t,last:"Kamu ditambahkan"}});try{await update(W,u);sel.forEach(m=>sysMsg(r.id,(wu(m).name||"Anggota")+" ditambahkan oleh "+me.name));toast("Anggota ditambahkan")}catch(e){toast(errMsg(e))}})};
lv.onclick=async()=>{if(!confirm("Keluar dari grup?"))return;close();const id=r.id;closeRoom();try{await update(W,{["groups/"+id+"/members/"+me.uid]:null,["ugroups/"+me.uid+"/"+id]:null})}catch(e){toast(errMsg(e))}};
const lk=h("button","btn","Tautan & undang teman");lk.onclick=()=>{close();grLink()};if(g.owner==me.uid){lv.textContent="Bubarkan grup";lv.onclick=()=>{close();disband()}}b.append(ad,lk,lv,cc)})}

/* ---------- channels ---------- */
const followCh=(id,on)=>set(P("channels/"+id+"/followers/"+me.uid),on?true:null).catch(e=>toast(errMsg(e)));
function drawChannels(){const el=$("chn");el.innerHTML="";const e=Object.entries(CHN);if(!e.length){el.append(h("p","empty","Belum ada saluran. Buat yang pertama."));return}
e.forEach(([id,c])=>{const fl=Object.keys(c.followers||{}),on=fl.includes(me.uid),r=row(c.name,fl.length+" pengikut"+(c.desc?" · "+c.desc:""),c.name[0].toUpperCase(),null,id,1),b=h("b","",on?"✓":"+");
b.style.cssText="background:var(--ac);border-radius:50%;width:38px;height:38px;display:grid;place-items:center;flex:none";b.onclick=ev=>{ev.stopPropagation();followCh(id,!on)};r.append(b);
r.onclick=()=>openRoom({k:"ch",id,name:c.name});el.append(r)})}
$("mkch").onclick=async()=>{const v=await ask("Buat saluran",[{k:"n",label:"Nama saluran",max:40},{k:"d",label:"Deskripsi singkat (opsional)",max:80}],"Buat");if(!v||!v.n)return;
try{await push(P("channels"),{name:v.n,desc:v.d,owner:me.uid,followers:{[me.uid]:true},lt:Date.now()});toast("Saluran dibuat")}catch(e){toast(errMsg(e))}};

/* ---------- status ---------- */
const live24=o=>Object.entries(o||{}).filter(([k,v])=>v&&now()-v.t<864e5).sort((a,b)=>a[1].t-b[1].t);
function drawMine(){const l=live24(MYS);$("mst").textContent=l.length?l.length+" status aktif · ketuk untuk lihat":"Ketuk untuk menambah status";$("av1").classList.toggle("ring",l.length>0);
if(!cleaned){cleaned=1;Object.entries(MYS).forEach(([k,v])=>{if(v&&now()-v.t>=864e5)update(W,{["status/"+me.uid+"/"+k]:null,["statusf/"+me.uid+"/"+k]:null}).catch(()=>{})})}}
$("mys").onclick=()=>{const l=live24(MYS);if(!l.length)return addStatus();sheet("Status saya",[["Lihat status saya",()=>viewStatus(me.uid,"Status saya",l,1)],["Tambah status",addStatus]])};
function addStatus(){sheet("Buat status",[["Teks",stText],["Foto",()=>pickFile("image",stFile)],["Video (maks 5 MB)",()=>pickFile("video",stFile)]])}
async function postStatus(o,file){const tg=Object.values(CT).filter(c=>o.tx&&[c.alias,c.name].some(n=>n&&o.tx.toLowerCase().includes("@"+n.toLowerCase())));const k=push(P("status/"+me.uid)).key,u={["status/"+me.uid+"/"+k]:{...o,t:now()}};if(file)u["statusf/"+me.uid+"/"+k]=file;await update(W,u);tg.forEach(c=>sendMsg(mkRoom({k:"dm",id:c.uid,name:c.name}),{ty:"text",tx:""+me.name+" menandaimu di statusnya"}).catch(()=>{}));toast("Status terkirim")}
async function stFile(f,kind){try{toast("Memproses...",8000);const p=await prep(f,kind,1080);$("toast").classList.add("hide");const c=await ask("Keterangan",[{k:"c",ph:"Keterangan (opsional, @nama untuk tandai)",max:120}],"Kirim");if(!c)return;toast("Mengirim...",15000);await postStatus({ty:kind,...(c.c?{tx:c.c}:{})},p.url)}catch(e){toast(errMsg(e))}}
function stText(){modal((b,close)=>{let bg=BG[0];b.append(h("h3","","Status teks"));const ta=h("textarea");ta.placeholder="Tulis sesuatu... (@nama untuk tandai teman)";ta.maxLength=200;ta.style.background=bg;ta.style.color="#fff";
const sw=h("div","sw");BG.forEach((c,i)=>{const d=h("i",i?"":"on");d.style.background=c;d.onclick=()=>{bg=c;ta.style.background=c;[...sw.children].forEach(x=>x.classList.toggle("on",x==d))};sw.append(d)});
const ok=h("button","btn p","Kirim"),cc=h("button","btn","Batal");cc.onclick=close;ok.onclick=async()=>{const t=ta.value.trim();if(!t)return;close();try{await postStatus({ty:"text",tx:t,bg})}catch(e){toast(errMsg(e))}};b.append(ta,sw,ok,cc)})}
async function loadFresh(){if(!me)return;const el=$("fresh"),cs=Object.values(CT);
const res=await Promise.all(cs.map(async c=>{try{const s=await get(P("status/"+c.uid));return[c,live24(s.val())]}catch(e){return[c,[]]}}));
el.innerHTML="";const a=res.filter(([c,l])=>l.length);if(!a.length){el.append(h("p","empty","Belum ada status dari temanmu. Status muncul dari teman yang ada di daftar chat."));return}
el.append(h("h3","","Pembaruan terbaru"));el.lastChild.style.margin="4px 0 12px";
a.sort((x,y)=>y[1][y[1].length-1][1].t-x[1][x[1].length-1][1].t).forEach(([c,l])=>{const r=row(c.name,l.length+" status · "+fmtT(l[l.length-1][1].t),c.name[0].toUpperCase());r.firstChild.classList.add("ring");r.onclick=()=>viewStatus(c.uid,c.name,l,0);el.append(r)})}
function viewStatus(uid,name,list,own){const o=$("sv"),bars=$("svp"),body=$("svb");let i=0,tm,vid;o.classList.remove("hide");bars.innerHTML="";list.forEach(()=>{const d=h("i");d.append(h("b"));bars.append(d)});
$("svn").textContent=name;$("svd").classList.toggle("hide",!own);
const stop=()=>{clearTimeout(tm);if(vid){vid.pause();vid=null}},close=()=>{stop();o.classList.add("hide");body.innerHTML="";const q=$("svr");q&&q.remove()};
const fill=(ms)=>{const b=bars.children[i].firstChild;b.style.transition="none";b.style.width="0";void b.offsetWidth;b.style.transition="width "+ms+"ms linear";b.style.width="100%";clearTimeout(tm);tm=setTimeout(()=>go(i+1),ms+400)};
function go(n){if(n<0)n=0;if(n>=list.length)return close();i=n;stop();body.innerHTML="";[...bars.children].forEach((d,j)=>{d.firstChild.style.transition="none";d.firstChild.style.width=j<i?"100%":"0"});
const[k,v]=list[i];$("svt").textContent=fmtT(v.t);if(own)seeRx(uid,k);
if(v.ty=="text"){const t=h("div","stx",v.tx);t.style.background=v.bg||BG[0];body.append(t);fill(5000);return}
const ld=h("div","sld","Memuat...");body.append(ld);
getFile("statusf/"+uid,k).then(u=>{if(!list[i]||list[i][0]!=k)return;ld.remove();
if(v.ty=="image"){const im=h("img");im.src=u;body.append(im)}else{const vd=h("video");vd.src=u;vd.autoplay=true;vd.playsInline=true;vd.onended=()=>go(i+1);vid=vd;body.append(vd)}
if(v.tx)body.append(h("div","scp",v.tx));
if(v.ty=="image")fill(5000);else{const vd=vid;vd.onloadedmetadata=()=>fill((vd.duration||10)*1000)}
}).catch(()=>{ld.textContent="Gagal memuat";tm=setTimeout(()=>go(i+1),1800)})}
body.onclick=e=>{const x=e.clientX/innerWidth;go(x<.35?i-1:i+1)};$("svx").onclick=close;
$("svd").onclick=async()=>{const k=list[i][0];if(!confirm("Hapus status ini?"))return;close();try{await update(W,{["status/"+me.uid+"/"+k]:null,["statusf/"+me.uid+"/"+k]:null})}catch(e){toast(errMsg(e))}};
{const old=$("svr");old&&old.remove();if(!own){const bar=h("div");bar.id="svr";const em=h("div","svem"),ip=h("input"),sd=h("button");sd.innerHTML=ico("send");ip.placeholder="Balas status...";ip.maxLength=300;
const sendR=async(txt,emo)=>{const[k,v]=list[i];try{if(emo)await set(P("react/s_"+uid+"/"+k+"/"+me.uid),emo);await sendMsg(mkRoom({k:"dm",id:uid,name}),{ty:"text",tx:txt,rp:{k:"",n:"Status "+name,t:pv(v)||"Status"}});toast(emo?"Reaksi terkirim":"Balasan terkirim",1500);ip.value=""}catch(e){toast(errMsg(e))}};
EMO.forEach(e=>{const b=h("button","",e);b.onclick=ev=>{ev.stopPropagation();sendR(e+" Bereaksi ke status",e)};em.append(b)});
ip.onfocus=()=>stop();sd.onclick=()=>{const t=ip.value.trim();if(t)sendR(t).then(()=>go(i))};ip.onkeydown=e=>{e.key=="Enter"&&sd.click()};bar.append(em,ip,sd);o.append(bar)}}
go(0)}

/* ---------- profile ---------- */
const upd=d=>update(P("users/"+me.uid),d);
$("es").onclick=async()=>{const v=await ask("Edit status",[{k:"s",val:me.status||"",ph:"Tulis status...",max:80}]);if(v)upd({status:v.s})};
$("cn").onclick=async()=>{const v=await ask("Ubah nama",[{k:"n",val:me.name,max:30}]);if(v&&v.n)upd({name:v.n})};
$("pub").onclick=()=>upd({public:!me.public});
$("cid").onclick=()=>navigator.clipboard.writeText(me.id).then(()=>toast("ID disalin: "+me.id),()=>toast("ID kamu: "+me.id));
$("cpw").onclick=()=>R(auth,me.email,{url:location.origin+"/login.html",handleCodeInApp:false}).catch(x=>/continue-uri/.test(x.code||"")?R(auth,me.email):Promise.reject(x)).then(()=>toast("Link ubah password dikirim ke "+me.email+". Cek juga folder Spam.",5000)).catch(e=>toast(errMsg(e)));
$("out").onclick=async()=>{try{await update(P("users/"+me.uid),{online:false,lastSeen:serverTimestamp()})}catch(e){}signOut(auth)};
$("cph").onclick=()=>sheet("Foto profil",[["Pilih foto",()=>pickFile("image",async f=>{try{toast("Memproses...",8000);await set(P("pics/"+me.uid+"/photo"),await cropTo(f,256,256,.8));toast("Foto profil diperbarui")}catch(e){toast(errMsg(e))}})],MYP.photo&&["Hapus foto",()=>remove(P("pics/"+me.uid+"/photo")).catch(e=>toast(errMsg(e))),1]]);
$("cbn").onclick=()=>sheet("Banner profil",[["Pilih banner (foto / GIF)",()=>pickFile("image",async f=>{try{toast("Memproses...",8000);let u;if(f.type=="image/gif"){if(f.size>1572864)throw new Error("GIF maksimal 1,5 MB");u=await readURL(f)}else u=await cropTo(f,900,300,.75);await set(P("pics/"+me.uid+"/banner"),u);toast("Banner diperbarui")}catch(e){toast(errMsg(e))}})],MYP.banner&&["Hapus banner",()=>remove(P("pics/"+me.uid+"/banner")).catch(e=>toast(errMsg(e))),1]]);
$("del").onclick=async()=>{if(!confirm("Hapus akun permanen? Semua datamu ikut terhapus."))return;
const v=await ask("Konfirmasi password",[{k:"p",ph:"Password akunmu",type:"password"}],"Hapus akun");if(!v||!v.p)return;
try{const x=auth.currentUser;await reauthenticateWithCredential(x,EmailAuthProvider.credential(x.email,v.p));
deleting=1;const uid=me.uid,id=me.id;await remove(P("ids/"+id));await remove(P("contacts/"+uid));await remove(P("ugroups/"+uid));await remove(P("status/"+uid));await remove(P("statusf/"+uid));await remove(P("pics/"+uid));await remove(P("users/"+uid));
await deleteUser(x);location.href="login.html"}catch(e){deleting=0;toast(/password|credential/i.test(e.code||e.message)?"Password salah.":errMsg(e))}};

/* ---------- v3: profil orang, info saluran ---------- */
async function showProfile(id,fb){let u=null;try{u=(await get(P("users/"+id))).val()}catch(e){}
u=u||UC[id]||{name:fb||"?"};const mine=id==me.uid,pub=mine||u.public!==false,p=pub?await getPic(id):{},nm0=u.name||"?";
modal((b,close)=>{const w=h("div","pbody"),cv=h("div","cv pcv");banner(cv,p.banner);
const av=h("div","av lg",nm0[0].toUpperCase());av.style.background=col(nm0);putPic(av,p);
const nm=h("h2","pn2");nm.append(nameB(nm0,u));const tt=h("div","ttw");titleChips(u).forEach(x=>tt.append(x));
w.append(cv,av,nm,tt);if(u.id)w.append(h("div","id2","ID "+u.id));
if(pub){if(u.status)w.append(h("p","pst",u.status));if(!mine&&u.showSeen!==false){const t=isOn(u)?"online":u.lastSeen?"terakhir dilihat "+fmtLS(u.lastSeen):"";if(t)w.append(h("small","pls",t))}}
else w.append(h("p","pst","Profil ini privat"));
b.append(w);
if(!mine){const sv=h("button","btn",CT[id]?"Ubah nama kontak":"Simpan kontak");sv.onclick=async()=>{const v=await ask("Simpan kontak",[{k:"n",label:"Nama kontak",val:(CT[id]&&CT[id].alias)||u.name||"",max:30}]);if(!v||!v.n)return;try{await update(P("contacts/"+me.uid+"/"+id),{uid:id,id:u.id,name:u.name,alias:v.n,...(CT[id]?{}:{lt:Date.now()})});toast("Kontak disimpan")}catch(e){toast(errMsg(e))}};b.append(sv);const bk=h("button","btn dg",BL[id]?"Buka blokir":"Blokir pengguna");bk.onclick=()=>{close();BL[id]?unblockUser(id,u.name||"?"):blockUser(id,u.name||"?")};b.append(bk)}
if(!mine){const m=h("button","btn p","Kirim pesan");m.onclick=async()=>{close();if(!CT[id])await set(P("contacts/"+me.uid+"/"+id),{uid:id,id:u.id,name:u.name,lt:Date.now()}).catch(e=>toast(errMsg(e)));openRoom({k:"dm",id,name:u.name,id8:u.id})};b.append(m)}
const c=h("button","btn","Tutup");c.onclick=close;b.append(c)})}
function chPhoto(){const r=RM;if(!r||r.k!="ch")return;const id=r.id;sheet("Foto saluran",[["Pilih foto",()=>pickFile("image",async f=>{try{toast("Memproses...",8000);await set(P("chpics/"+id+"/photo"),await cropTo(f,256,256,.8));delete CPIC[id];setAv($("rav"),id,1);drawChannels();toast("Foto saluran diperbarui")}catch(e){toast(errMsg(e))}})],["Hapus foto",async()=>{try{await remove(P("chpics/"+id+"/photo"));delete CPIC[id];hdr();drawChannels()}catch(e){toast(errMsg(e))}},1]])}
async function chInfo(){const r=RM;if(!r||r.k!="ch")return;const id=r.id,c=CHN[id];if(!c)return;const own=c.owner==me.uid,ad=Object.keys(c.admins||{}),gu=i=>get(P("users/"+i)).then(s=>s.val()||{name:"?"}).catch(()=>({name:"?"}));
const[pic,ow,us]=await Promise.all([getCPic(id),gu(c.owner),Promise.all(ad.map(gu))]);
modal((b,close)=>{const av=h("div","av lg",c.name[0].toUpperCase());av.style.background=col(c.name);av.style.margin="0 auto 8px";putPic(av,pic);
b.append(av,h("h3","",c.name),h("p","sub",(c.desc||"Tidak ada deskripsi")+" · "+Object.keys(c.followers||{}).length+" pengikut"));
b.append(h("label","","Pemilik"));const ro=row(ow.name||"?","ID "+(ow.id||"-"),(ow.name||"?")[0].toUpperCase(),ow,c.owner);ro.onclick=()=>showProfile(c.owner,ow.name);b.append(ro);
b.append(h("label","","Admin ("+ad.length+"/5)"));if(!ad.length)b.append(h("p","sub","Belum ada admin."));
us.forEach((u,j)=>{const x=row(u.name||"?","ID "+(u.id||"-"),(u.name||"?")[0].toUpperCase(),u,ad[j]);x.onclick=()=>own?sheet(u.name,[["Lihat profil",()=>showProfile(ad[j],u.name)],["Hapus dari admin",()=>set(P("channels/"+id+"/admins/"+ad[j]),null).then(()=>toast("Admin dihapus")).catch(e=>toast(errMsg(e))),1]]):showProfile(ad[j],u.name);b.append(x)});
if(own){const a=h("button","btn p","+ Tambah admin"),f=h("button","btn","Ubah foto saluran");
a.onclick=()=>{close();if(ad.length>=5)return toast("Batas admin saluran adalah 5");pickContacts("Tambah admin",[...ad,me.uid],async sel=>{if(ad.length+sel.length>5)return toast("Maksimal 5 admin. Sisa slot: "+(5-ad.length));const u={};sel.forEach(m=>u["channels/"+id+"/admins/"+m]=true);try{await update(W,u);toast("Admin ditambahkan")}catch(e){toast(errMsg(e))}})};
f.onclick=()=>{close();chPhoto()};b.append(a,f)}
const cc=h("button","btn","Tutup");cc.onclick=close;b.append(cc)})}
let MYP={};function drawMyPic(){["av1","av3"].forEach(i=>{const e=$(i);e.style.backgroundImage="";e.textContent=me?me.name[0].toUpperCase():"V";putPic(e,MYP)});banner($("cv3"),MYP.banner)}

/* ---------- v3.1: tautan grup, bubarkan, bersihkan chat ---------- */
let pendG=new URLSearchParams(location.search).get("g");
const newCode=()=>{const a=new Uint8Array(16);crypto.getRandomValues(a);return[...a].map(x=>x.toString(36).padStart(2,"0")).join("").slice(0,22)};
const linkOf=c=>location.origin+"/join.html?c="+c;
function linkBtns(b,c,name){b.append(h("div","lnk",linkOf(c)));let sv=null;if(window.QRCode){const q=h("div","qr");b.append(q);try{new QRCode(q,{text:linkOf(c),width:220,height:220,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});sv=h("button","btn","Simpan kode QR");sv.onclick=()=>{const cv=q.querySelector("canvas");if(!cv)return toast("Tahan lama gambar QR untuk menyimpan");const a=h("a");a.href=cv.toDataURL("image/png");a.download="qr-grup.png";document.body.append(a);a.click();a.remove()}}catch(e){q.remove()}}
const cp=h("button","btn p","Salin tautan"),sh=h("button","btn","Bagikan tautan");
cp.onclick=()=>navigator.clipboard.writeText(linkOf(c)).then(()=>toast("Tautan disalin"),()=>toast(linkOf(c),7000));
sh.onclick=()=>navigator.share?navigator.share({title:"Gabung grup "+name,text:"Gabung grup "+name+" di Vanzz Wawa",url:linkOf(c)}).catch(()=>{}):cp.click();b.append(cp,sh);if(sv)b.append(sv)}
async function grLink(){const r=RM;if(!r||r.k!="gr")return;const id=r.id;let g=null;try{g=(await get(P("groups/"+id))).val()}catch(e){return toast(errMsg(e))}if(!g)return;const own=g.owner==me.uid;
if(!g.link&&own){const c=newCode();try{await update(W,{["ginv/"+c]:{gid:id,name:g.name,once:false,t:Date.now()},["groups/"+id+"/link"]:c});g.link=c}catch(e){return toast(errMsg(e))}}
modal((b,close)=>{b.append(h("h3","","Tautan grup"),h("p","sub","Siapa pun yang punya tautan ini bisa langsung bergabung ke "+g.name+"."));
if(g.link)linkBtns(b,g.link,g.name);else b.append(h("p","empty","Pemilik grup belum membuat tautan."));
if(own){const ob=h("div"),once=h("button","btn","Buat tautan sekali pakai"),rs=h("button","btn dg","Atur ulang tautan");
once.onclick=async()=>{const c=newCode();try{await set(P("ginv/"+c),{gid:id,name:g.name,once:true,t:Date.now()});ob.innerHTML="";ob.append(h("label","","Tautan sekali pakai (hangus setelah dipakai 1 orang)"));linkBtns(ob,c,g.name)}catch(e){toast(errMsg(e))}};
rs.onclick=async()=>{if(!confirm("Atur ulang tautan grup? Tautan lama tidak berlaku lagi."))return;close();const c=newCode(),u={["ginv/"+c]:{gid:id,name:g.name,once:false,t:Date.now()},["groups/"+id+"/link"]:c};if(g.link)u["ginv/"+g.link]=null;try{await update(W,u);toast("Tautan diatur ulang");grLink()}catch(e){toast(errMsg(e))}};
b.append(once,ob,rs)}
const cc=h("button","btn","Tutup");cc.onclick=close;b.append(cc)})}
async function disband(){const r=RM;if(!r||r.k!="gr")return;let g=null;try{g=(await get(P("groups/"+r.id))).val()}catch(e){return toast(errMsg(e))}if(!g||g.owner!=me.uid)return toast("Hanya pembuat grup yang bisa membubarkan");
if(!confirm("Bubarkan grup \""+g.name+"\"? Semua anggota dikeluarkan dan semua pesan grup dihapus permanen."))return;
const id=r.id,u={["groups/"+id]:null,["gmsgs/"+id]:null,["gf/"+id]:null};Object.keys(g.members||{}).forEach(m=>u["ugroups/"+m+"/"+id]=null);if(g.link)u["ginv/"+g.link]=null;
closeRoom();try{await update(W,u);toast("Grup dibubarkan")}catch(e){toast(errMsg(e))}}
async function leaveGr(){const r=RM;if(!r||r.k!="gr")return;if(!confirm("Keluar dari grup?"))return;const id=r.id;closeRoom();try{await update(W,{["groups/"+id+"/members/"+me.uid]:null,["ugroups/"+me.uid+"/"+id]:null})}catch(e){toast(errMsg(e))}}
async function clearChat(){const r=RM;if(!r||r.k=="ch")return;const u={};r.L.forEach(([k])=>{u[r.mp+"/"+k+"/dm/"+me.uid]=1});if(!Object.keys(u).length)return toast("Chat sudah kosong");
if(!confirm("Bersihkan semua pesan di chat ini hanya untuk kamu? Pesan tetap ada di pihak lain."))return;
if(r.k=="dm")u["contacts/"+me.uid+"/"+r.id+"/last"]="";else u["ugroups/"+me.uid+"/"+r.id+"/last"]="Chat dibersihkan";
try{await update(W,u);toast("Chat dibersihkan")}catch(e){toast(errMsg(e))}}


/* ---------- v4: reaksi, tag, notif, lokasi, voting, tanya, pesan sistem ---------- */
const EMO=["👍","❤️","😂","😮","😢","🙏"],rdy={},LT={};
const rk=r=>r.k=="dm"?[me.uid,r.id].sort().join("_"):r.id;
const sysMsg=(gid,tx)=>push(P("gmsgs/"+gid),{sys:1,tx,t:Date.now()}).catch(()=>{});
/* reaksi */
const react=(key,k,em)=>{const p=P("react/"+key+"/"+k+"/"+me.uid);return get(p).then(s=>s.val()==em?remove(p):set(p,em)).catch(e=>toast(errMsg(e)))};
function reactPick(key,k){modal((b,close)=>{const d=h("div","rxp");EMO.forEach(em=>{const x=h("button","",em);x.onclick=()=>{close();react(key,k,em)};d.append(x)});b.append(h("h3","","Beri reaksi"),d)})}
function rxEl(r,k,e){const m=(r.RX||{})[k];if(!m)return;const c={};Object.entries(m).forEach(([u,em])=>{(c[em]=c[em]||[]).push(u)});
const d=h("div","rx");Object.entries(c).forEach(([em,us])=>{const b=h("button",us.includes(me.uid)?"on":"",em+" "+us.length);b.onclick=ev=>{ev.stopPropagation();react(r.rk,k,em)};d.append(b)});e.append(d)}
function seeRx(uid,k){get(P("react/s_"+uid+"/"+k)).then(s=>{const m=s.val();if(!m)return;const c={};Object.values(m).forEach(e=>c[e]=(c[e]||0)+1);$("svt").textContent+=" · "+Object.entries(c).map(([e,n])=>e+n).join(" ")}).catch(()=>{})}
/* tag @nama di grup */
function mnames(r){const a=[];if(r&&r.k=="gr"&&r.G)Object.keys(r.G.members||{}).forEach(u=>{const n=(u==me.uid?me:wu(u)).name;n&&a.push([u,n])});return a.sort((x,y)=>y[1].length-x[1].length)}
function rich(r,t){const f=document.createDocumentFragment(),ns=mnames(r);if(!ns.length||!t.includes("@")){f.append(t);return f}
let i=0,buf="";while(i<t.length){if(t[i]=="@"){const n=ns.find(([u,nm])=>t.slice(i+1,i+1+nm.length).toLowerCase()==nm.toLowerCase());if(n){if(buf){f.append(buf);buf=""}const s=h("span","mn","@"+t.slice(i+1,i+1+n[1].length));if(n[0]==me.uid)s.classList.add("me");f.append(s);i+=1+n[1].length;continue}}buf+=t[i++]}
if(buf)f.append(buf);return f}
const mns=h("div","mns hide");$("sendbar").before(mns);
$("mi").addEventListener("input",()=>{const r=RM;mns.innerHTML="";const m=r&&r.k=="gr"&&$("mi").value.match(/@([^@\s]*)$/);if(!m){mns.classList.add("hide");return}
const q=m[1].toLowerCase(),l=mnames(r).filter(([u,n])=>u!=me.uid&&n.toLowerCase().startsWith(q)).slice(0,6);
l.forEach(([u,n])=>{const b=h("button","",n);b.onclick=()=>{$("mi").value=$("mi").value.replace(/@([^@\s]*)$/,"@"+n+" ");mns.classList.add("hide");$("mi").focus();updSb()};mns.append(b)});mns.classList.toggle("hide",!l.length)});
/* notifikasi pesan masuk */
function notif(key,title,body,open,lt,ready){const p=LT[key];LT[key]=lt;if(!notifOn()||(p==null&&!ready)||(key[0]=="d"&&BL[key.slice(1)]))return;if(p!=null&&lt<=p)return;
const r=RM;if(r&&!document.hidden&&((key[0]=="d"&&r.k=="dm"&&"d"+r.id==key)||(key[0]=="g"&&r.k=="gr"&&"g"+r.id==key)))return;
toast(title+": "+body,4500);$("toast").onclick=()=>{$("toast").classList.add("hide");open()};
if(window.Notification&&Notification.permission=="granted"&&document.hidden)try{const n=new Notification(title,{body,icon:BADGE,tag:key});n.onclick=()=>{focus();open();n.close()}}catch(e){}}
document.addEventListener("click",()=>{if(window.Notification&&Notification.permission=="default")Notification.requestPermission().catch(()=>{})},{once:true});
/* lokasi */
function locEl(x,e){const a=h("a","fl");a.href="https://www.google.com/maps?q="+x.la+","+x.lo;a.target="_blank";a.rel="noopener";a.style.color="inherit";a.style.textDecoration="none";const d=h("div");d.append("Lokasi",h("small","",(+x.la).toFixed(5)+", "+(+x.lo).toFixed(5)+" · ketuk untuk buka Maps"));a.append(si("pin"),d);a.onclick=ev=>ev.stopPropagation();e.append(a)}
function sendLoc(){const r=RM;if(!r||!r.send)return;if(!navigator.geolocation)return toast("Perangkat tidak mendukung lokasi");toast("Mencari lokasi...",10000);
navigator.geolocation.getCurrentPosition(async p=>{try{const o={ty:"loc",la:+p.coords.latitude,lo:+p.coords.longitude};if(r.rp)o.rp=r.rp;clearCtx();await sendMsg(r,o);toast("Lokasi terkirim",1200)}catch(e){toast(errMsg(e))}},()=>toast("Izin lokasi ditolak atau lokasi tidak ditemukan"),{enableHighAccuracy:true,timeout:12000})}
/* voting saluran */
async function newPoll(){const v=await ask("Buat voting",[{k:"q",label:"Pertanyaan",max:120},{k:"a",label:"Pilihan 1",max:40},{k:"b",label:"Pilihan 2",max:40},{k:"c",label:"Pilihan 3 (opsional)",max:40},{k:"d",label:"Pilihan 4 (opsional)",max:40}],"Kirim");if(!v)return;
const op=[v.a,v.b,v.c,v.d].filter(Boolean);if(!v.q||op.length<2)return toast("Isi pertanyaan dan minimal 2 pilihan");try{await sendMsg(RM,{ty:"poll",tx:v.q,op})}catch(e){toast(errMsg(e))}}
function pollEl(r,k,x,e){const v=(r.VT||{})[k]||{},vs=Object.values(v),tot=vs.length,my=v[me.uid],d=h("div","poll");
(x.op||[]).forEach((o,i)=>{const n=vs.filter(z=>z===i).length,pc=tot?Math.round(n/tot*100):0,b=h("button","po"+(my===i?" on":"")),bar=h("i");bar.style.width=pc+"%";b.append(bar,h("span","",o),h("em","",n+" · "+pc+"%"));
b.onclick=ev=>{ev.stopPropagation();const p=P("chvotes/"+r.id+"/"+k+"/"+me.uid);(my===i?remove(p):set(p,i)).catch(er=>toast(errMsg(er)))};d.append(b)});
d.append(h("small","",tot+" suara · ketuk lagi untuk batal"));e.append(d)}
/* pertanyaan admin + balasan */
async function newAsk(){const v=await ask("Ajukan pertanyaan",[{k:"q",label:"Pertanyaan untuk pengikut",max:200}],"Kirim");if(!v||!v.q)return;try{await sendMsg(RM,{ty:"ask",tx:v.q})}catch(e){toast(errMsg(e))}}
function askEl(r,k,x,e){const n=Object.keys((r.RP||{})[k]||{}).length,b=h("button","btn ask","Balas ("+n+")");b.onclick=ev=>{ev.stopPropagation();askRoom(r,k,x)};e.append(b)}
function askRoom(r,k,x){modal((b,close)=>{b.append(h("h3","",""+x.tx));const box=h("div"),rp=Object.entries((r.RP||{})[k]||{}).sort((a,c)=>a[1].t-c[1].t);
if(!rp.length)box.append(h("p","sub","Belum ada balasan."));
rp.forEach(([id,v])=>{const it=h("div","rpi");it.append(h("b","",v.n+(v.u==me.uid?" (kamu)":"")),h("div","",v.tx));if(v.u==me.uid){const dl=h("button");dl.innerHTML=ico("trash");dl.onclick=()=>remove(P("chreplies/"+r.id+"/"+k+"/"+id)).then(close).catch(er=>toast(errMsg(er)));it.append(dl)}box.append(it)});
const i=h("input");i.placeholder="Tulis balasan...";i.maxLength=300;const ok=h("button","btn p","Kirim"),cc=h("button","btn","Tutup");cc.onclick=close;
ok.onclick=async()=>{const t=i.value.trim();if(!t)return;try{await push(P("chreplies/"+r.id+"/"+k),{u:me.uid,n:me.name,tx:t,t:now()});close()}catch(er){toast(errMsg(er))}};b.append(box,i,ok,cc)})}


/* ---------- v5: profil gaya baru, tema, kunci, notifikasi ---------- */
const si=n=>{const s=h("span","fi");s.innerHTML=ico(n);return s};
const LS={g:k=>{try{return localStorage.getItem(k)}catch(e){return null}},s:(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}};
const THEMES=[["Ungu Nova","#8b5cf6"],["Biru Laut","#3b82f6"],["Hijau Mint","#22c55e"],["Merah Rose","#f43f5e"],["Oranye","#f59e0b"],["Pink","#ec4899"]];
const THM=()=>THEMES.find(t=>t[0]==LS.g("wawa_theme"))||THEMES[0];
const applyTheme=()=>{const c=THM()[1],s=document.documentElement.style;s.setProperty("--ac",c);s.setProperty("--g","linear-gradient(90deg,"+c+",#22d3ee)")};applyTheme();
const notifOn=()=>LS.g("wawa_notif")!=="0",SEL="Semua yang menyimpan ID-ku";
function drawSet(){const sv=(i,t)=>{const e=$(i);e&&(e.textContent=t)};sv("thmv",THM()[0]);sv("lkv",LS.g("wawa_lock")?"Aktif. Memakai kunci layar HP. Tap untuk mengatur.":"Mati. Tap untuk mengaktifkan dengan kunci HP.");sv("blkv",Object.keys(BL).length?Object.keys(BL).length+" pengguna diblokir":"Lihat dan buka blokir");sv("ntv",notifOn()?"Aktif. Tap untuk mematikan.":"Mati. Tap untuk mengaktifkan.");
if(me){$("pubv").classList.toggle("on",!!me.public);sv("seenv",me.showSeen===false?"Tidak ada":SEL);sv("stv",me.storyOff?"Hanya aku":SEL)}}
drawSet();
$("thm").onclick=()=>sheet("Tema warna",THEMES.map(t=>[t[0],()=>{LS.s("wawa_theme",t[0]);applyTheme();drawSet()}]));
$("stp").onclick=()=>sheet("Siapa yang bisa melihat story-ku",[[SEL,()=>upd({storyOff:null})],["Hanya aku",()=>upd({storyOff:true})]]);
$("seen").onclick=()=>sheet("Terakhir dilihat dan status online",[[SEL,()=>upd({showSeen:true})],["Tidak ada",()=>upd({showSeen:false})]]);
$("ntf").onclick=()=>{if(notifOn())LS.s("wawa_notif","0");else{LS.s("wawa_notif","1");window.Notification&&Notification.permission=="default"&&Notification.requestPermission().catch(()=>{})}drawSet()};
$("dph").onclick=async()=>{if(!confirm("Hapus foto profil?"))return;try{await remove(P("pics/"+me.uid+"/photo"));toast("Foto profil dihapus")}catch(e){toast(errMsg(e))}};
/* kunci aplikasi: memakai sidik jari / wajah / kunci layar bawaan HP (WebAuthn) */
const b64=a=>btoa(String.fromCharCode(...new Uint8Array(a))),unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const canLock=()=>!!(window.PublicKeyCredential&&navigator.credentials&&window.isSecureContext);
let lockEl=null,hideAt=0;
async function devAuth(){const id=LS.g("wawa_lock");if(!id)return true;await navigator.credentials.get({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),allowCredentials:[{type:"public-key",id:unb64(id),transports:["internal"]}],userVerification:"required",timeout:60000}});return true}
function showLock(){if(lockEl||!LS.g("wawa_lock"))return;lockEl=h("div","lockscr");const c=h("div","lkc"),er=h("div","err"),ok=h("button","btn p","Buka dengan kunci HP");
const go=async()=>{er.textContent="";try{await devAuth();lockEl.remove();lockEl=null}catch(e){er.textContent="Verifikasi dibatalkan atau gagal. Coba lagi."}};ok.onclick=go;
c.append(h("h2","","Aplikasi terkunci"),h("p","sub","Buka dengan sidik jari, wajah, atau kunci layar HP-mu"),er,ok);lockEl.append(c);document.body.append(lockEl);setTimeout(go,300)}
showLock();
document.addEventListener("visibilitychange",()=>{if(document.hidden)hideAt=Date.now();else if(hideAt&&Date.now()-hideAt>60000)showLock()});
async function enableLock(){if(!canLock())return toast("Browser atau perangkat ini tidak mendukung kunci HP");
try{const cr=await navigator.credentials.create({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),rp:{name:"Vanzz Wawa"},user:{id:new TextEncoder().encode(me.uid),name:me.email||me.uid,displayName:me.name},pubKeyCredParams:[{type:"public-key",alg:-7},{type:"public-key",alg:-257}],authenticatorSelection:{authenticatorAttachment:"platform",userVerification:"required",residentKey:"discouraged"},timeout:60000}});LS.s("wawa_lock",b64(cr.rawId));drawSet();toast("Kunci aplikasi aktif")}
catch(e){toast("Gagal mengaktifkan. Pastikan HP punya kunci layar atau sidik jari.")}}
$("lck").onclick=()=>{if(!LS.g("wawa_lock"))return enableLock();sheet("Kunci aplikasi",[["Matikan kunci",async()=>{try{await devAuth();LS.s("wawa_lock",null);drawSet();toast("Kunci dimatikan")}catch(e){toast("Verifikasi dibatalkan")}},1]])};
/* ---------- v6: blokir + hapus chat ---------- */
const blockUser=async(id,name)=>{if(!confirm("Blokir "+name+"? Dia tidak bisa mengirim pesan ke kamu, dan kamu tidak menerima pesan atau notifikasi darinya."))return;try{await set(P("blocks/"+me.uid+"/"+id),true);toast(name+" diblokir")}catch(e){toast(errMsg(e))}};
const unblockUser=async(id,name)=>{try{await remove(P("blocks/"+me.uid+"/"+id));toast("Blokir "+name+" dibuka")}catch(e){toast(errMsg(e))}};
async function blockList(){const ids=Object.keys(BL),us=await Promise.all(ids.map(i=>get(P("users/"+i)).then(s=>s.val()||{name:"?"}).catch(()=>({name:"?"}))));
modal((b,close)=>{b.append(h("h3","","Pengguna diblokir"));if(!ids.length)b.append(h("p","empty","Tidak ada pengguna yang diblokir."));
us.forEach((u,j)=>{const r=row(u.name||"?","ID "+(u.id||"-"),(u.name||"?")[0].toUpperCase(),u,ids[j]),bt=h("button","btn","Buka blokir");bt.style.cssText="width:auto;padding:8px 12px;margin:0;letter-spacing:0;flex:none";bt.onclick=ev=>{ev.stopPropagation();close();unblockUser(ids[j],u.name||"?")};r.append(bt);b.append(r)});
const cc=h("button","btn","Tutup");cc.onclick=close;b.append(cc)})}
$("blk").onclick=blockList;
async function delChat(id,name){if(!confirm("Hapus chat dengan "+name+"? Semua pesan dihapus dari tampilanmu dan kontak keluar dari daftar. Pesan di pihak lain tidak ikut terhapus."))return;
const c=[me.uid,id].sort().join("_");try{const s=await get(P("msgs/"+c)),u={};s.forEach(d=>{u["msgs/"+c+"/"+d.key+"/dm/"+me.uid]=1});u["contacts/"+me.uid+"/"+id]=null;if(RM&&RM.k=="dm"&&RM.id==id)closeRoom();await update(W,u);toast("Chat dihapus")}catch(e){toast(errMsg(e))}}

/* ---------- bootstrap ---------- */
O(auth,u=>{if(!u)return location.href="login.html";
initCalls(u.uid,()=>me);initOwner(()=>me,isOwner);
const uref=P("users/"+u.uid);
const goOn=()=>{if(!me||document.hidden)return;update(uref,{online:true,lastSeen:serverTimestamp()}).catch(()=>{});onDisconnect(uref).update({online:false,lastSeen:serverTimestamp()}).catch(()=>{})};
const goOff=()=>{me&&update(uref,{online:false,lastSeen:serverTimestamp()}).catch(()=>{})};
setInterval(goOn,25000);setTimeout(goOn,2500);document.addEventListener("visibilitychange",()=>document.hidden?goOff():goOn());addEventListener("pagehide",goOff);onValue(ref(db,".info/connected"),s=>{s.val()&&goOn()});
onValue(P("config/banner"),s=>setBn(s.val()||DEF));
const seenBc=new Set();onChildAdded(P("broadcast"),s=>{const b=s.val();if(!b||!b.text||seenBc.has(s.key))return;seenBc.add(s.key);if(now()-(b.t||0)<60000)showBc(b.text)},()=>{});
onValue(P("users/"+u.uid),s=>{me=s.val();if(!me){if(!deleting)alert("Akun tidak ditemukan atau sudah dihapus.");signOut(auth);return}const ini=me.name[0].toUpperCase();
["av1","av3"].forEach(i=>$(i).textContent=ini);$("pn").textContent="";$("pn").append(nameB(me.name,me));$("ptt").replaceChildren(...titleChips(me));$("pid").textContent=me.id;$("pid2").textContent=me.id;
$("ps").textContent=me.status||"Belum ada status";$("py").textContent="Lahir "+me.year;drawSet();
$("own").classList.toggle("hide",!isOwner());if(me.banned){alert("Akunmu diblokir oleh owner.");signOut(auth)}setTimeout(()=>$("splash").classList.add("hide"),900);drawChats();drawChannels();drawMine();drawMyPic()});
onValue(P("blocks/"+u.uid),s=>{Object.keys(BL).forEach(k=>delete BL[k]);s.forEach(d=>{BL[d.key]=1});if(RM&&RM.k=="dm"){RM.send=!BL[RM.id];setSendBar();draw()}if(me)drawChats();drawSet()},()=>{});
onValue(P("pics/"+u.uid),s=>{MYP=s.val()||{};PIC[u.uid]=Promise.resolve(MYP);if(me)drawMyPic()},()=>{});
onValue(P("contacts/"+u.uid),s=>{CT={};s.forEach(d=>{const c=d.val();if(c&&c.name)CT[d.key]=c});Object.values(CT).forEach(c=>c.last&&!c.last.startsWith("Kamu: ")&&notif("d"+c.uid,c.alias||c.name,c.last,()=>openRoom({k:"dm",id:c.uid,name:c.alias||c.name}),c.lt||0,rdy.c));rdy.c=1;drawChats();if(tab==1)loadFresh()});
onValue(P("ugroups/"+u.uid),s=>{GR={};s.forEach(d=>{if(d.val())GR[d.key]=d.val()});Object.entries(GR).forEach(([g,v])=>v.last&&!(me&&v.last.startsWith(me.name+": "))&&notif("g"+g,v.name,v.last,()=>openRoom({k:"gr",id:g,name:v.name}),v.lt||0,rdy.g));rdy.g=1;drawChats();if(pendG&&GR[pendG]){const g=pendG;pendG=null;history.replaceState(null,"","dashboard.html");openRoom({k:"gr",id:g,name:GR[g].name})}},()=>{});
onValue(P("channels"),s=>{CHN={};s.forEach(d=>{CHN[d.key]=d.val()});if(me){drawChats();drawChannels()}chRoomInfo()},()=>{});
onValue(P("status/"+u.uid),s=>{MYS=s.val()||{};if(me)drawMine()},()=>{})});
