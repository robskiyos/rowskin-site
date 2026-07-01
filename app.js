/* =========================================================
   rowskin — app.js
   ========================================================= */

/* ─────────────────────────────────────────────────────────
   CONFIG  —  ✏️  EDIT THIS BLOCK BEFORE LAUNCH
   ───────────────────────────────────────────────────────── */
const CONFIG = {
  /* Where cart/inquiry leads go.
     1) webhookUrl: a POST endpoint that forwards to your CRM / Telegram.
        Works with Make.com, n8n, Zapier, Formspree, or a Telegram-bot webhook.
        The site POSTs JSON {type,name,company,city,phone,email,telegram,message,items,total,source,ts}.
        Leave "" to use the email fallback below.
     2) email:    used as a mailto fallback when no webhook is set.
     3) telegram: your @handle / bot — shown as a quick-contact link. */
  crm: {
    webhookUrl: "",                       // e.g. "https://hook.eu2.make.com/xxxxxxxx"
    email:      "info@rowskin.ru",
    telegram:   ""                        // нет канала — заявки уходят на почту
  },

  contacts: {
    email:    "info@rowskin.ru",
    phone:    "+7 (916) 308-92-31",
    telegram: "",
    city:     "Москва",
    inn:      "ИНН 9705255766",
    hours:    "Пн–Пт, 10:00–19:00 МСК"
  },

  currency: "₽"
};

/* ─────────────────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────────────────── */
const PRODUCTS = [
  { id:"shampoo",    en:"shampoo",               ru:"шампунь",                         cat:"волосы",      p350:595, p50:190,  img:"tall" },
  { id:"conditioner",en:"hair conditioner",      ru:"кондиционер для волос",           cat:"волосы",      p350:615, p50:195,  img:"tall" },
  { id:"bodywash",   en:"body wash",             ru:"гель для душа",                   cat:"тело",        p350:575, p50:185,  img:"tall" },
  { id:"handwash",   en:"exfoliating hand wash", ru:"жидкое мыло-эксфолиант для рук",  cat:"руки",        p350:860, p50:215,  img:"tall" },
  { id:"mouthwash",  en:"mouthwash",             ru:"ополаскиватель для полости рта",  cat:"полость рта", p350:825, p50:170,  img:"tall" },
  { id:"bodylotion", en:"body lotion",           ru:"молочко для тела",                cat:"тело",        p350:640, p50:195,  img:"tall" },
  { id:"handlotion", en:"hand lotion",           ru:"лосьон для рук",                  cat:"руки",        p350:715, p50:null, img:"tall" },
  /* аксессуары — раздел (фото добавим позже) */
  { id:"acc-dispenser", en:"dispenser", ru:"дозатор",   cat:"аксессуары", accessory:true },
  { id:"acc-tray",      en:"tray",      ru:"подставка", cat:"аксессуары", accessory:true },
  { id:"acc-pouch",     en:"pouch",     ru:"несессер",  cat:"аксессуары", accessory:true },
  { id:"acc-slippers",  en:"slippers",  ru:"тапочки",   cat:"аксессуары", accessory:true }
];

const FAQ = [
  { q:"минимальный тираж", a:"Мы предлагаем к заказу минимальный тираж от 20 ед. на артикул без брендирования и от 1000 ед. на артикул с брендированием." },
  { q:"сроки выполнения заказа", a:"В зависимости от сложности и объёма заказа, срок реализации проекта составит от двух до шести месяцев." },
  { q:"есть ли своё производство", a:"Наше производство расположено во Владимирской области, в окружении лесных массивов и природных источников." },
  { q:"есть ли сертификаты качества", a:"Контроль качества и безопасности продукции rowskin подтверждён необходимыми сертификатами и декларациями соответствия." },
  { q:"осуществляете ли вы доставку по россии и за рубеж", a:"Мы осуществляем доставку по всей России и в другие страны. Стоимость доставки рассчитывается индивидуально в зависимости от региона, объёма заказа и выбранного способа транспортировки." },
  { q:"есть ли у вас решения для spa- и wellness-комплексов", a:"Мы разрабатываем продукцию для SPA- и wellness-комплексов. В нашем портфеле представлены специализированные SPA-линейки, включая популярный мист для лица с экстрактами степных цветов." }
];

const EMBLEM = "";   /* emblem is now the «R» mark, applied via CSS mask on [data-emblem] */

/* ─────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────── */
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const fmt = n => n.toLocaleString("ru-RU");
/* image map — single source of truth so the standalone build can inline these */
const IMG = { tall:"assets/bottle-tall.png", small:"assets/bottle-small.png" };
const bottleSrc = k => IMG[k] || IMG.tall;
function productImg(p){ return `<img class="product-img" src="assets/prod-${p.id}.jpg" alt="${p.ru} — 350 мл" loading="lazy"><img class="product-img product-img-alt" src="assets/prod-${p.id}-50.jpg" alt="${p.ru} — 50 мл" loading="lazy" aria-hidden="true">`; }

/* ─────────────────────────────────────────────────────────
   RENDER: emblems, marquee, contacts, faq
   ───────────────────────────────────────────────────────── */
function injectEmblems(root=document){ $$("[data-emblem]",root).forEach(el=>{ if(!el.dataset.done){el.innerHTML=EMBLEM;el.dataset.done="1";} }); }

function renderContacts(){
  const c=CONFIG.contacts;
  const tel=c.phone.replace(/[^+\d]/g,'');
  const tgLi = c.telegram ? `<li><span class="c-label">Telegram</span><a href="https://t.me/${c.telegram}" target="_blank" rel="noopener">@${c.telegram}</a></li>` : "";
  const cl=$("#contactList");           // блок контактов на странице убран — контакты только в подвале
  if(cl) cl.innerHTML = `
    <li><span class="c-label">Email</span><a href="mailto:${c.email}">${c.email}</a></li>
    <li><span class="c-label">Телефон</span><a href="tel:${tel}">${c.phone}</a></li>
    ${tgLi}
    <li><span class="c-label">Город</span><span class="c-val">${c.city}</span></li>
    <li><span class="c-label">Реквизиты</span><span class="c-val">${c.inn}</span></li>`;
  const tgF = c.telegram ? `<a href="https://t.me/${c.telegram}" target="_blank" rel="noopener">Telegram · @${c.telegram}</a>` : "";
  $("#footerContacts").innerHTML = `
    <span class="c-label">Связаться</span>
    <a href="mailto:${c.email}">${c.email}</a>
    <a href="tel:${tel}">${c.phone}</a>
    ${tgF}
    <span style="opacity:.6;margin-top:.4rem">${c.city} · ${c.hours}</span>
    <span style="opacity:.5">${c.inn}</span>`;
}

function renderFaq(){
  $("#faqList").innerHTML = FAQ.map((f,i)=>`
    <div class="faq-item">
      <button class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}">
        <span>${f.q}${/\?$/.test(f.q)?'':'?'}</span><span class="ico"></span>
      </button>
      <div class="faq-a" id="faq-a-${i}"><p>${f.a}</p></div>
    </div>`).join("");
  $$(".faq-q").forEach(btn=>btn.addEventListener("click",()=>{
    const item=btn.closest(".faq-item"); const ans=item.querySelector(".faq-a");
    const open=item.classList.toggle("open");
    btn.setAttribute("aria-expanded",open);
    ans.style.maxHeight = open ? ans.scrollHeight+"px" : 0;
  }));
}

/* ─────────────────────────────────────────────────────────
   CATALOG + FILTERS
   ───────────────────────────────────────────────────────── */
/* каталог делится на две категории: косметика | аксессуары (строчными) */
const CATS = ["косметика","аксессуары"];
let activeCat="косметика";

function renderFilters(){
  $("#catalogFilters").innerHTML = CATS.map(c=>
    `<button class="filter${c===activeCat?' active':''}" data-cat="${c}">${c}</button>`).join("");
  $$("#catalogFilters .filter").forEach(b=>b.addEventListener("click",()=>{
    if(b.dataset.cat===activeCat) return;
    const fwd=b.dataset.cat==="аксессуары";   // косметика→аксессуары = up; back = down
    activeCat=b.dataset.cat;
    $$("#catalogFilters .filter").forEach(x=>x.classList.toggle("active",x===b));
    const row=$("#productGrid");
    row.classList.remove("enter-below","enter-above");
    row.classList.add(fwd?"leave-up":"leave-down");
    setTimeout(()=>{
      renderProducts();
      row.classList.remove("leave-up","leave-down");
      row.classList.add(fwd?"enter-below":"enter-above");
      row.scrollLeft=0; if(window.__catArrows) window.__catArrows();
    },300);
  }));
}

const MIN = { "350":50, "50":350 };   // minimum order quantity per size

function renderProducts(){
  const grid=$("#productGrid"), cc=$("#catalogCount");
  if(activeCat==="аксессуары"){                     // accessories not available yet
    grid.classList.add("is-soon");
    grid.innerHTML = `<div class="catalog-soon"><span class="catalog-soon-h">скоро</span><span class="catalog-soon-sub">аксессуары появятся позже</span></div>`;
    if(cc) cc.textContent="";
    if(window.__catArrows) window.__catArrows();
    return;
  }
  grid.classList.remove("is-soon");
  const list = PRODUCTS.filter(p=>!p.accessory);
  grid.innerHTML = list.map((p,i)=>`
    <article class="product-card" data-id="${p.id}" style="animation-delay:${i*45}ms">
      <div class="product-visual">${productImg(p)}</div>
      <div class="product-line">
        <h3 class="product-name">${p.ru}</h3>
        <span class="product-price">от ${fmt(p.p350)} ${CONFIG.currency}</span>
      </div>
      <p class="product-sub">${p.en}</p>
      <div class="buy" data-id="${p.id}" data-size="350" data-min="50" data-p350="${p.p350}" data-p50="${p.p50!=null?p.p50:''}">
        <div class="buy-sizes">
          <button type="button" class="buy-size is-on" data-size="350">350 мл</button>
          ${p.p50!=null?`<button type="button" class="buy-size" data-size="50">50 мл</button>`:``}
        </div>
        <div class="buy-row">
          <span class="qstep">
            <button type="button" class="qbtn qminus" data-step="-1" disabled aria-label="меньше">−</button>
            <input class="qinput" type="text" inputmode="numeric" value="50" aria-label="количество" />
            <button type="button" class="qbtn" data-step="1" aria-label="больше">+</button>
          </span>
          <button type="button" class="buy-add" aria-label="в заявку">+</button>
        </div>
      </div>
    </article>`).join("");
  if(cc) cc.textContent="("+list.length+")";
  $$("#productGrid .buy").forEach(buy=>{
    const id=buy.dataset.id, input=buy.querySelector(".qinput"), minus=buy.querySelector(".qminus");
    const priceEl=buy.closest(".product-card").querySelector(".product-price");
    const card=buy.closest(".product-card");
    const applyImg=()=>card.classList.toggle("show-50", buy.dataset.size==="50");
    const getMin=()=>+buy.dataset.min;
    const clamp=()=>{let v=parseInt((input.value||"").replace(/[^\d]/g,""),10);const m=getMin();if(!v||v<m)v=m;input.value=v;return v;};
    const sync=()=>{minus.disabled=(clamp()<=getMin());};
    const showPrice=()=>{if(priceEl){const pr=buy.dataset.size==="50"?+buy.dataset.p50:+buy.dataset.p350;priceEl.textContent="от "+fmt(pr)+" "+CONFIG.currency;}};
    buy.querySelectorAll(".buy-size").forEach(sb=>{
      sb.addEventListener("click",()=>{
        buy.querySelectorAll(".buy-size").forEach(x=>x.classList.toggle("is-on",x===sb));
        const sz=sb.dataset.size; buy.dataset.size=sz; buy.dataset.min=MIN[sz]; input.value=MIN[sz];
        showPrice(); sync(); applyImg();
      });
      sb.addEventListener("mouseenter",()=>card.classList.toggle("show-50", sb.dataset.size==="50"));  // preview that size's photo
    });
    buy.querySelector(".buy-sizes").addEventListener("mouseleave",applyImg);                            // revert to selected size
    buy.querySelectorAll(".qbtn").forEach(b=>b.addEventListener("click",()=>{
      if(b.disabled) return;
      const m=getMin(); let v=clamp()+(+b.dataset.step)*m; if(v<m)v=m; input.value=v; sync();
    }));
    input.addEventListener("change",()=>{clamp();sync();}); input.addEventListener("blur",()=>{clamp();sync();});
    buy.querySelector(".buy-add").addEventListener("click",()=>{
      const qty=clamp(), size=buy.dataset.size, ab=buy.querySelector(".buy-add");
      addToCart(id,{size,qty});
      ab.classList.add("added"); ab.textContent="✓";
      setTimeout(()=>{ab.classList.remove("added");ab.textContent="+";},1300);
    });
    sync(); applyImg();
  });
}

/* ─────────────────────────────────────────────────────────
   CART
   ───────────────────────────────────────────────────────── */
let cart=[]; // {id,name,sub,price,qty,custom}

function addToCart(id,opts={}){
  const p=PRODUCTS.find(x=>x.id===id);
  const size = opts.size || null;                       // "350" | "50" | null
  const sizeLabel = size ? size+" мл" : "";
  const min = size ? (MIN[size]||1) : 1;
  const addQty = Math.max(min, opts.qty!=null ? (parseInt(opts.qty,10)||min) : min);
  const key = opts.custom ? id+":"+opts.brand : (size? id+":"+size : id);
  const existing=cart.find(x=>x.key===key);
  if(existing){existing.qty += addQty;}                 // add the chosen amount
  else cart.push({
    key, id,
    name: opts.name || (p?p.ru:id),
    sub:  opts.sub  || (sizeLabel ? sizeLabel+(p?" · "+p.en:"") : (p?p.en:"")),
    size: sizeLabel,
    price: opts.price!=null?opts.price:(p?(size==="50"?p.p50:p.p350):0),
    qty: addQty, min,
    custom:!!opts.custom, accessory:!!(p&&p.accessory), img: opts.img || (p?p.img:"tall"),
    photo: opts.photo || (p && !p.accessory ? "assets/prod-"+p.id+(size==="50"?"-50":"")+".jpg" : null)
  });
  updateCart(); bumpCount();
  toast(opts.custom?"образец с вашим брендом добавлен":(sizeLabel? sizeLabel+" ×"+addQty+" — в заявке":"добавлено в заявку"));
}
function removeFromCart(key){cart=cart.filter(x=>x.key!==key);updateCart();}
function changeQty(key,d){const it=cart.find(x=>x.key===key);if(!it)return;const step=it.min||1;it.qty=Math.max(step,it.qty+d*step);updateCart();}
function setQty(key,val){const it=cart.find(x=>x.key===key);if(!it)return;let v=parseInt(String(val).replace(/[^\d]/g,""),10);if(!v||v<it.min)v=it.min;it.qty=v;updateCart();}

function cartCount(){return cart.reduce((s,i)=>s+i.qty,0);}
function cartTotal(){return cart.reduce((s,i)=>s+i.price*i.qty,0);}

function bumpCount(){const el=$("#cartCount");el.classList.add("bump");setTimeout(()=>el.classList.remove("bump"),200);}

function updateCart(){
  const n=cart.length;                      // badge = number of distinct items
  const cc=$("#cartCount"); cc.textContent=n; cc.dataset.count=n;
  const has=cart.length>0;
  $("#cartEmpty").style.display = has?"none":"flex";
  $("#cartFoot").hidden = !has;
  $("#cartItems").innerHTML = !has ? "" : cart.map(it=>`
    <div class="cart-row" data-key="${it.key}">
      <div class="cart-thumb">${it.accessory?`<span class="cart-emb" data-emblem></span>`:`<img src="${it.photo||bottleSrc(it.img)}" alt="">`}</div>
      <div class="cart-row-main">
        <span class="cart-row-name">${it.name}${it.sub?`<small>${it.sub}</small>`:""}</span>
        ${it.custom?`<span class="cart-row-meta">с вашим брендом · образец</span>`:`<span class="cart-row-meta">${it.price>0?`от ${fmt(it.price)} ${CONFIG.currency}/шт`:'по запросу'}</span>`}
        <div class="cart-row-foot">
          <span class="qty"><button class="qbtn" data-q="-1" aria-label="минус" ${it.qty<=it.min?'disabled':''}>−</button><input class="cart-qin" data-qin value="${it.qty}" inputmode="numeric" aria-label="количество" /><button class="qbtn" data-q="1" aria-label="плюс">+</button></span>
          <button class="cart-remove" data-rm aria-label="убрать">убрать</button>
        </div>
      </div>
    </div>`).join("");
  if(has){
    injectEmblems($("#cartItems"));
    $$("#cartItems .cart-row").forEach(row=>{
      const key=row.dataset.key;
      row.querySelectorAll("[data-q]").forEach(b=>b.addEventListener("click",()=>changeQty(key,+b.dataset.q)));
      const qin=row.querySelector("[data-qin]"); if(qin) qin.addEventListener("change",()=>setQty(key,qin.value));
      row.querySelector("[data-rm]").addEventListener("click",()=>removeFromCart(key));
    });
    $("#cartTotal").textContent = "от "+fmt(cartTotal())+" "+CONFIG.currency;
  }
}

/* drawer */
function openCart(){$("#cartDrawer").classList.add("open");$("#cartDrawer").setAttribute("aria-hidden","false");showOverlay("#drawerOverlay");}
function closeCart(){$("#cartDrawer").classList.remove("open");$("#cartDrawer").setAttribute("aria-hidden","true");hideOverlay("#drawerOverlay");}
function showOverlay(sel){const o=$(sel);o.hidden=false;requestAnimationFrame(()=>o.classList.add("show"));}
function hideOverlay(sel){const o=$(sel);o.classList.remove("show");setTimeout(()=>o.hidden=true,300);}

/* ─────────────────────────────────────────────────────────
   CONFIGURATOR
   ───────────────────────────────────────────────────────── */
let configState={ brand:null, brandName:"свой бренд" };

function initConfigurator(){
  const input=$("#logoUpload"), label=$("#uploadLabel");
  input.addEventListener("change",e=>handleLogo(e.target.files[0]));
  ["dragover","dragenter"].forEach(ev=>label.addEventListener(ev,e=>{e.preventDefault();label.classList.add("drag");}));
  ["dragleave","drop"].forEach(ev=>label.addEventListener(ev,e=>{e.preventDefault();label.classList.remove("drag");}));
  label.addEventListener("drop",e=>{if(e.dataTransfer.files[0])handleLogo(e.dataTransfer.files[0]);});
  // preview (logo on the bottle) is created automatically on upload via handleLogo → setPartner
}

function handleLogo(file){
  if(!file||!file.type.startsWith("image/"))return toast("нужен файл изображения");
  const r=new FileReader();
  r.onload=()=>setPartner(r.result,(file.name||"бренд").replace(/\.[^.]+$/,""));
  r.readAsDataURL(file);
}
function setPartner(src,name){
  configState.brand=src; configState.brandName=name||"свой бренд";
  const slot=$("#partnerSlot");
  slot.innerHTML = src ? `<img src="${src}" alt="${configState.brandName}">`
                       : `<span class="partner-placeholder">ваш логотип</span>`;
}

/* ─────────────────────────────────────────────────────────
   FORMS + CRM
   ───────────────────────────────────────────────────────── */
function buildMessage(d){
  let m=`Новая заявка с сайта rowskin\n`;
  m+=`Тип: ${d.type}\n`;
  m+=`Имя: ${d.name||"—"}\n`;
  m+=`Отель/компания: ${d.company||"—"}\n`;
  if(d.city)m+=`Город: ${d.city}\n`;
  m+=`Телефон: ${d.phone||"—"}\n`;
  if(d.email)m+=`Email: ${d.email}\n`;
  if(d.telegram)m+=`Telegram: ${d.telegram}\n`;
  if(d.items&&d.items.length){
    m+=`\nСостав заявки:\n`;
    d.items.forEach(i=>m+=` • ${i.name}${i.size?" "+i.size:""}${i.custom?" (с брендом)":""} ×${i.qty} — от ${fmt(i.price*i.qty)} ${CONFIG.currency}\n`);
    m+=`Ориентир: от ${fmt(d.total)} ${CONFIG.currency} (без учёта тиража)\n`;
  }
  if(d.message)m+=`\nКомментарий: ${d.message}\n`;
  return m;
}

async function submitInquiry(d){
  const payload={...d,source:"rowskin website",ts:new Date().toISOString()};
  if(CONFIG.crm.webhookUrl){
    try{
      const r=await fetch(CONFIG.crm.webhookUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      if(r.ok)return{ok:true,via:"webhook"};
    }catch(e){/* fall through to mailto */}
  }
  // Fallback: open a prefilled email draft so the lead is never lost
  const subj=encodeURIComponent(`Заявка с сайта rowskin — ${d.company||d.name||""}`);
  const body=encodeURIComponent(buildMessage(d));
  setTimeout(()=>{window.location.href=`mailto:${CONFIG.crm.email}?subject=${subj}&body=${body}`;},400);
  return{ok:true,via:"mailto"};
}

function readForm(form,type){
  const f=Object.fromEntries(new FormData(form).entries());
  return {type,...f};
}
function validate(form){
  let ok=true;
  $$(".field",form).forEach(fl=>fl.classList.remove("invalid"));
  $$("[required]",form).forEach(inp=>{
    let bad=!inp.value.trim();
    if(!bad && inp.type==="email") bad=!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim());
    if(bad){inp.closest(".field").classList.add("invalid");ok=false;}
  });
  return ok;
}

async function handleSubmit(form,statusEl,type,after){
  if(!validate(form)){statusEl.textContent="Заполните обязательные поля";statusEl.style.color="#d29a8a";return;}
  const data=readForm(form,type);
  if(type==="checkout"||type==="cart"){data.items=cart.map(i=>({name:i.name,size:i.size,qty:i.qty,price:i.price,custom:i.custom}));data.total=cartTotal();}
  statusEl.style.color="";statusEl.textContent="Отправляем…";
  const res=await submitInquiry(data);
  if(res.ok){
    form.reset();
    statusEl.textContent = res.via==="mailto" ? "Открываем письмо — отправьте его нам ✓" : "Заявка отправлена ✓";
    toast("Спасибо! Свяжемся в течение рабочего дня");
    if(after)after();
  }else{
    statusEl.textContent="Не удалось отправить. Напишите на info@rowskin.ru";
  }
}

/* ─────────────────────────────────────────────────────────
   MODAL / CHECKOUT
   ───────────────────────────────────────────────────────── */
function openModal(){showOverlay("#modalOverlay");$("#modalOverlay").style.display="flex";}
function closeModal(){hideOverlay("#modalOverlay");}

/* ─────────────────────────────────────────────────────────
   TOAST
   ───────────────────────────────────────────────────────── */
let toastT;
function toast(msg){
  const el=$("#toast");el.innerHTML=`<span class="t-dot"></span>${msg}`;
  el.classList.add("show");clearTimeout(toastT);
  toastT=setTimeout(()=>el.classList.remove("show"),3200);
}

/* ─────────────────────────────────────────────────────────
   NAV / MENU
   ───────────────────────────────────────────────────────── */
function initNav(){
  const mt=$("#menuToggle"),mm=$("#mobileMenu");
  mt.addEventListener("click",()=>{
    const open=mm.classList.toggle("open");
    mt.setAttribute("aria-expanded",open);
    mm.setAttribute("aria-hidden",!open);
  });
  $$("#mobileMenu a").forEach(a=>a.addEventListener("click",()=>{
    mm.classList.remove("open");mt.setAttribute("aria-expanded","false");
  }));
}

/* ─────────────────────────────────────────────────────────
   INIT
   ───────────────────────────────────────────────────────── */
function initReveal(){
  if(!("IntersectionObserver" in window)) return;
  if(window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const els=$$(".bf-item, .special-card, .faq");
  const io=new IntersectionObserver(ents=>{
    ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  },{threshold:.12, rootMargin:"0px 0px -6% 0px"});
  els.forEach((el,i)=>{ el.classList.add("reveal"); el.style.transitionDelay=(Math.min(i%5,4)*0.05)+"s"; io.observe(el); });
}

/* ─────────────────────────────────────────────────────────
   HERO 3D — stylized live scene (mossy boulders bloom + rotate
   to reveal the bottle). Transparent. Falls back to the image.
   ───────────────────────────────────────────────────────── */
function initHero3D(){
  const canvas=document.getElementById("heroCanvas");
  const stage=document.getElementById("heroStage");
  if(!canvas||!stage||!window.THREE) return;
  try{
    const T=window.THREE;
    const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    const scene=new T.Scene();
    const camera=new T.PerspectiveCamera(33,1,0.1,100);
    camera.position.set(0,0.3,9.2); camera.lookAt(0,-0.2,0);
    const resize=()=>{const w=stage.clientWidth||1,h=stage.clientHeight||1;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
    resize(); window.addEventListener("resize",resize);

    scene.add(new T.AmbientLight(0xfff1de,0.95));
    const key=new T.DirectionalLight(0xfff0d6,1.5); key.position.set(-4,6.5,4.5); scene.add(key);
    const rim=new T.DirectionalLight(0xC4B695,0.55); rim.position.set(5,1.5,-4.5); scene.add(rim);

    const pivot=new T.Group(); scene.add(pivot);
    const up=new T.Vector3(0,1,0); const dummy=new T.Object3D();

    function boulder(r,color){
      const g=new T.IcosahedronGeometry(r,3); const p=g.attributes.position;
      for(let i=0;i<p.count;i++){
        const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
        const n=Math.sin(x*3.0+y*1.6)*0.5+Math.cos(z*2.6+y*2.0)*0.5;
        const d=1+n*0.12+(Math.random()-0.5)*0.10;
        p.setXYZ(i,x*d,y*d*0.9,z*d);
      }
      g.computeVertexNormals();
      const m=new T.Mesh(g,new T.MeshStandardMaterial({color,roughness:0.97,metalness:0,flatShading:true}));
      return m;
    }
    const b1=boulder(1.55,0x6e6a51); b1.position.set(0,-1.7,0);
    const b2=boulder(1.25,0x77704f); b2.position.set(0.35,-0.25,0.15);
    const b3=boulder(1.05,0x615c46); b3.position.set(-0.25,1.05,-0.05);
    const boulders=[b1,b2,b3]; pivot.add(b1,b2,b3);

    function scatterOn(count,geo,mat,outset,yScale){
      const inst=new T.InstancedMesh(geo,mat,count); let i=0;
      while(i<count){
        const b=boulders[Math.floor(Math.random()*boulders.length)];
        const pos=b.geometry.attributes.position; const idx=Math.floor(Math.random()*pos.count);
        const v=new T.Vector3(pos.getX(idx),pos.getY(idx),pos.getZ(idx));
        const nrm=v.clone().normalize();
        dummy.position.set(b.position.x+v.x+nrm.x*outset,b.position.y+v.y+nrm.y*outset,b.position.z+v.z+nrm.z*outset);
        dummy.quaternion.setFromUnitVectors(up,nrm);
        const s=0.6+Math.random()*0.7; dummy.scale.set(s,s*(yScale||1)*(0.7+Math.random()*0.7),s);
        dummy.updateMatrix(); inst.setMatrixAt(i,dummy.matrix); i++;
      }
      inst.instanceMatrix.needsUpdate=true; pivot.add(inst); return inst;
    }
    const mossGeo=new T.ConeGeometry(0.03,0.17,4);
    scatterOn(440,mossGeo,new T.MeshStandardMaterial({color:0x49591f,roughness:1}),0.015,1.1);
    scatterOn(210,mossGeo,new T.MeshStandardMaterial({color:0x6f7d33,roughness:1}),0.045,1.3);

    // flowers (bloom-animated); two colours for irises + cream blossoms
    function makeFlowers(count,color,size){
      const mesh=new T.InstancedMesh(new T.SphereGeometry(size,6,5),new T.MeshStandardMaterial({color,roughness:0.6}),count);
      const base=[]; let i=0;
      while(i<count){
        const b=boulders[Math.floor(Math.random()*boulders.length)];
        const pos=b.geometry.attributes.position; const idx=Math.floor(Math.random()*pos.count);
        const v=new T.Vector3(pos.getX(idx),pos.getY(idx),pos.getZ(idx)); const nrm=v.clone().normalize();
        base.push({p:new T.Vector3(b.position.x+v.x+nrm.x*0.07,b.position.y+v.y+nrm.y*0.07,b.position.z+v.z+nrm.z*0.07),
                   q:new T.Quaternion().setFromUnitVectors(up,nrm),s:0.55+Math.random()*0.7,ph:Math.random()*6.28});
        i++;
      }
      pivot.add(mesh); return {mesh,base};
    }
    const irises=makeFlowers(78,0xB79AD6,0.085);   // iris violet
    const cream =makeFlowers(46,0xEFE7D8,0.06);    // cream blossoms
    function bloomUpdate(fl,bloom,t){
      for(let i=0;i<fl.base.length;i++){const f=fl.base[i];
        const s=f.s*(0.14+0.86*bloom)*(0.9+0.12*Math.sin(t*1.4+f.ph));
        dummy.position.copy(f.p); dummy.quaternion.copy(f.q); dummy.scale.set(s,s*1.5,s); dummy.updateMatrix();
        fl.mesh.setMatrixAt(i,dummy.matrix);}
      fl.mesh.instanceMatrix.needsUpdate=true;
    }

    // bottle (bone) wedged behind/between the boulders
    const bone=new T.MeshStandardMaterial({color:0xD8CFC4,roughness:0.5,metalness:0.02});
    const blk=new T.MeshStandardMaterial({color:0x14110e,roughness:0.5});
    const bottle=new T.Group();
    const body=new T.Mesh(new T.CylinderGeometry(0.4,0.45,1.5,40),bone); body.scale.x=0.72;
    const sh=new T.Mesh(new T.CylinderGeometry(0.2,0.4,0.28,40),bone); sh.position.y=0.86; sh.scale.x=0.72;
    const nk=new T.Mesh(new T.CylinderGeometry(0.15,0.2,0.18,24),bone); nk.position.y=1.06;
    const cap=new T.Mesh(new T.CylinderGeometry(0.2,0.2,0.24,24),blk); cap.position.y=1.26;
    bottle.add(body,sh,nk,cap);
    bottle.position.set(0.0,-0.15,-0.35); bottle.rotation.z=0.05; pivot.add(bottle);

    // soft contact shadow (transparent-friendly)
    const sc=document.createElement("canvas"); sc.width=sc.height=128; const cx=sc.getContext("2d");
    const grd=cx.createRadialGradient(64,64,4,64,64,62); grd.addColorStop(0,"rgba(40,30,18,0.42)"); grd.addColorStop(1,"rgba(40,30,18,0)");
    cx.fillStyle=grd; cx.fillRect(0,0,128,128);
    const shadow=new T.Mesh(new T.PlaneGeometry(5.5,5.5),new T.MeshBasicMaterial({map:new T.CanvasTexture(sc),transparent:true,depthWrite:false}));
    shadow.rotation.x=-Math.PI/2; shadow.position.y=-3.35; scene.add(shadow);

    const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches;
    const clock=new T.Clock();
    function frame(){
      const t=clock.getElapsedTime();
      pivot.rotation.y=Math.sin(t*0.3)*0.72;        // turn to reveal the bottle, then back
      pivot.position.y=Math.sin(t*0.5)*0.05;
      const bloom=Math.sin(t*0.42)*0.5+0.5;          // flowers open then close
      bloomUpdate(irises,bloom,t); bloomUpdate(cream,bloom,t);
      renderer.render(scene,camera);
      if(!reduce) requestAnimationFrame(frame);
    }
    frame();                  // first render
    stage.classList.add("is-3d");   // only swap in once it actually drew
  }catch(e){ /* keep the image fallback */ }
}

function init(){
  injectEmblems();
  renderContacts();
  renderFaq();
  renderFilters();
  renderProducts();
  initConfigurator();
  initNav();
  initReveal();
  updateCart();
  $("#year").textContent=new Date().getFullYear();

  // consolidated scroll-driven UI — ONE rAF loop, all layout reads first then all
  // writes (no layout thrash), GPU translate3d. Header + hero morph + parallax in a
  // single pass keeps the main thread free and scrolling buttery-smooth.
  (function(){
    const hdr=$(".site-header"), feat=$("#ingredients");
    const hero=$("#hero"),roll=$("#heroRoll"),heroImg=$("#heroImg"),ovBw=$("#ovBw"),ovLogo=$("#ovLogo"),ovScrim=$("#ovScrim");
    const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
    const para = reduce ? [] : $$("[data-parallax]");
    let total = hero ? hero.offsetHeight-innerHeight : 0;   // cached; re-measured on resize
    let vh = innerHeight;
    let ticking=false;
    function frame(){
      ticking=false;
      const y=window.scrollY||document.documentElement.scrollTop;
      /* ---- READ: every layout query up front ---- */
      const featR  = (hdr&&feat) ? feat.getBoundingClientRect() : null;
      const heroTop= (hero&&roll) ? hero.getBoundingClientRect().top : 0;
      const paraR  = para.map(el=>el.parentElement.getBoundingClientRect());
      /* ---- WRITE: no layout reads past this line ---- */
      if(hdr){
        hdr.classList.toggle("scrolled", y>40);
        if(featR) hdr.classList.toggle("hdr-dark", featR.top<72 && featR.bottom>72);
      }
      if(hero&&roll){
        const p = total>0 ? Math.min(Math.max(-heroTop/total,0),1) : 0;
        roll.style.transform="translate3d(0,"+(-p*50).toFixed(2)+"%,0)";
        const a=1-Math.min(p/0.5,1), b=Math.min(Math.max((p-0.30)/0.45,0),1);
        if(heroImg) heroImg.style.opacity=1;
        if(ovScrim) ovScrim.style.opacity=a;
        if(ovLogo) ovLogo.style.opacity=a;
        if(ovBw) ovBw.style.opacity=b*0.7;
        if(hdr) hdr.classList.toggle("logo-on", p>=0.5);   // logo fades in as the b&w photo takes over
      }
      for(let i=0;i<para.length;i++){
        const r=paraR[i];
        const prog=(r.top+r.height/2-vh/2)/vh;
        const amt=parseFloat(para[i].getAttribute("data-parallax"))||0.15;
        para[i].style.transform="translate3d(0,"+(prog*amt*100).toFixed(1)+"px,0) scale(1.12)";
      }
    }
    function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(frame); } }
    addEventListener("scroll",onScroll,{passive:true});
    addEventListener("resize",()=>{ if(hero) total=hero.offsetHeight-innerHeight; vh=innerHeight; onScroll(); });
    frame();
  })();

  // catalog arrows (scroll the product row; slider hidden)
  (function(){
    const row=$("#productGrid"),prev=$("#catPrev"),next=$("#catNext");
    if(!row||!next) return;
    const step=()=>{const c=row.querySelector(".product-card");const g=parseFloat(getComputedStyle(row).columnGap||getComputedStyle(row).gap)||24;return (c?c.offsetWidth+g:300)*2;};
    const upd=()=>{const max=row.scrollWidth-row.clientWidth-2;if(prev)prev.disabled=row.scrollLeft<=2;next.disabled=row.scrollLeft>=max;};
    if(prev) prev.addEventListener("click",()=>row.scrollBy({left:-step(),behavior:"smooth"}));
    next.addEventListener("click",()=>row.scrollBy({left:step(),behavior:"smooth"}));
    row.addEventListener("scroll",upd,{passive:true}); addEventListener("resize",upd); setTimeout(upd,120);
    window.__catArrows=upd;
  })();

  // cart open/close
  $("#cartToggle").addEventListener("click",openCart);
  $("#cartClose").addEventListener("click",closeCart);
  $("#drawerOverlay").addEventListener("click",closeCart);
  $$("[data-close-cart]").forEach(a=>a.addEventListener("click",closeCart));

  // checkout
  $("#cartCheckout").addEventListener("click",()=>{closeCart();setTimeout(openModal,260);});
  $("#modalClose").addEventListener("click",closeModal);
  $("#modalOverlay").addEventListener("click",e=>{if(e.target.id==="modalOverlay")closeModal();});

  // «обсудить проект» → то же окно заявки, что и при чекауте (отдельной формы больше нет)
  $$("[data-inquire]").forEach(b=>b.addEventListener("click",openModal));
  $("#checkoutForm").addEventListener("submit",e=>{e.preventDefault();handleSubmit(e.target,$("#checkoutStatus"),"checkout",()=>{cart=[];updateCart();setTimeout(closeModal,1400);});});

  // esc closes overlays
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();closeModal();}});
}

/* run init whether or not the DOM has already parsed */
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
else init();
