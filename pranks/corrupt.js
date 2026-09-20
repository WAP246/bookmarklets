javascript:(()=>{if(window.__CHAOS_GLITCH__)return;window.__CHAOS_GLITCH__=1;

const KEY="__CHAOS_GLITCH_V5__";
const PAGE=location.origin+location.pathname;
const CHARS="█▓▒░╳╬┼│─<>/\\\\$#@%!?";
const COLORS=["#ff003c","#00eaff","#ff00aa","#7cff00","#fff","#7b61ff","#ffb000"];

let DB={};
try{DB=JSON.parse(localStorage.getItem(KEY)||"{}")}catch{}
let S=DB[PAGE]||{intensity:0,mutations:{},seed:Math.random()};

function save(){
  try{
    DB[PAGE]=S;
    localStorage.setItem(KEY,JSON.stringify(DB));
  }catch{}
}

const ignored=new Set([
  "HTML","HEAD","BODY","SCRIPT","STYLE","META","LINK",
  "TITLE","NOSCRIPT","TEMPLATE","SVG","PATH"
]);

const selector=[
  "h1","h2","h3","h4","h5","h6","p","span","a",
  "button","li","label","strong","em","small",
  "td","th","img","input","textarea","select",
  "section","article","nav","header","footer",
  "main","aside","form","figure","blockquote",
  "pre","code"
].join(",");

const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

function good(e){
  if(!e||e.nodeType!==1)return false;
  if(ignored.has(e.tagName))return false;
  if(e.dataset.chaosArtifact)return false;
  if(e.closest("[data-chaos-ignore]"))return false;
  const r=e.getBoundingClientRect();
  return r.width>3&&r.height>3;
}

function els(){
  return [...document.querySelectorAll(selector)].filter(good);
}

/* ---------- persistent element addressing ---------- */

function path(e){
  let out=[],x=e;
  while(x&&x!==document.body&&x.nodeType===1){
    let n=0,s=x.previousElementSibling;
    while(s){
      if(s.tagName===x.tagName)n++;
      s=s.previousElementSibling;
    }
    out.unshift(x.tagName+":"+n);
    x=x.parentElement;
  }
  return out.join("/");
}

function find(p){
  if(!p)return null;
  let x=document.body;
  for(const q of p.split("/")){
    const i=q.lastIndexOf(":");
    if(i<0)return null;
    const tag=q.slice(0,i);
    const n=+q.slice(i+1);
    const c=[...x.children].filter(z=>z.tagName===tag);
    if(!c[n])return null;
    x=c[n];
  }
  return x;
}

function record(e){
  const p=path(e);
  if(!p)return;
  S.mutations[p]=e.getAttribute("style")||"";
}

function restore(){
  for(const [p,style] of Object.entries(S.mutations)){
    const e=find(p);
    if(e&&style!==undefined)e.setAttribute("style",style);
  }
}

/* ---------- style helpers ---------- */

function add(e,prop,value){
  e.style.setProperty(prop,value,"important");
  record(e);
}

function transform(e){
  const i=Math.min(80,S.intensity);
  const x=rnd(-i,i);
  const y=rnd(-i*.5,i*.5);
  const r=rnd(-i*.12,i*.12);
  const sx=rnd(Math.max(.45,1-i*.008),1+i*.008);
  const sy=rnd(Math.max(.5,1-i*.006),1+i*.006);

  add(e,"transform",
    `translate(${x}px,${y}px) rotate(${r}deg) scale(${sx},${sy})`);
}

function typography(e){
  const i=S.intensity;
  if(Math.random()<.3)add(e,"font-size",`${clamp(rnd(60,140)+i,7,180)}%`);
  if(Math.random()<.35)add(e,"font-weight",pick(["300","400","500","700","900"]));
  if(Math.random()<.35)add(e,"letter-spacing",`${rnd(-3,Math.min(20,i*.3))}px`);
  if(Math.random()<.25)add(e,"word-spacing",`${rnd(-5,Math.min(30,i*.4))}px`);
  if(Math.random()<.25)add(e,"line-height",rnd(.45,2.4));
  if(Math.random()<.2)add(e,"text-transform",pick(["uppercase","lowercase","capitalize","none"]));
  if(Math.random()<.15)add(e,"text-decoration",pick(["line-through","underline","overline"]));
}

function spacing(e){
  const i=Math.min(100,S.intensity);
  if(Math.random()<.5)add(e,"margin-left",`${rnd(-i,i)}px`);
  if(Math.random()<.4)add(e,"margin-top",`${rnd(-i,i/2)}px`);
  if(Math.random()<.3)add(e,"padding-left",`${rnd(0,i)}px`);
  if(Math.random()<.3)add(e,"padding-right",`${rnd(0,i)}px`);
  if(Math.random()<.25)add(e,"gap",`${rnd(0,i)}px`);
}

function dimensions(e){
  const i=Math.min(80,S.intensity);
  if(Math.random()<.3)add(e,"width",`${clamp(rnd(50,150),20,180)}%`);
  if(Math.random()<.25)add(e,"height",`${clamp(rnd(50,150),20,180)}%`);
  if(Math.random()<.2)add(e,"min-width",`${rnd(0,i*3)}px`);
  if(Math.random()<.2)add(e,"max-width",`${rnd(50,100)}%`);
}

function layout(e){
  if(Math.random()<.25)add(e,"display",pick(["block","inline-block","flex","grid"]));

  if(Math.random()<.25)add(e,"justify-content",
    pick(["flex-start","center","flex-end","space-between","space-around"]));

  if(Math.random()<.25)add(e,"align-items",
    pick(["flex-start","center","flex-end","stretch"]));

  if(Math.random()<.2)add(e,"flex-direction",
    pick(["row","row-reverse","column","column-reverse"]));

  if(Math.random()<.2)add(e,"flex-wrap",
    pick(["nowrap","wrap","wrap-reverse"]));

  if(Math.random()<.2)add(e,"grid-template-columns",
    pick(["1fr","1fr 1fr","1fr 2fr","repeat(3,1fr)","repeat(4,1fr)"]));

  if(Math.random()<.2)add(e,"order",ri(-5,10));
}

function colors(e){
  if(Math.random()<.4)add(e,"color",pick(COLORS));
  if(Math.random()<.25)add(e,"background-color",pick(COLORS));
  if(Math.random()<.25)add(e,"border-color",pick(COLORS));
}

function visual(e){
  const i=Math.min(100,S.intensity);

  if(Math.random()<.35)
    add(e,"opacity",rnd(.15,1));

  if(Math.random()<.35)
    add(e,"filter",pick([
      "blur(1px)",
      "blur(3px)",
      "contrast(2)",
      "contrast(.4)",
      "saturate(4)",
      "saturate(.1)",
      "brightness(1.7)",
      "brightness(.45)",
      "invert(.7)",
      "sepia(1)",
      "hue-rotate(90deg)",
      "hue-rotate(180deg)",
      "grayscale(1)",
      "blur(1px) contrast(2) saturate(3)"
    ]));

  if(Math.random()<.3)
    add(e,"border",
      `${rnd(.5,Math.min(8,i/5))}px solid ${pick(COLORS)}`);

  if(Math.random()<.3)
    add(e,"border-radius",`${rnd(0,60)}px`);

  if(Math.random()<.3)
    add(e,"box-shadow",
      `${rnd(-20,20)}px ${rnd(-20,20)}px ${rnd(1,30)}px ${pick(COLORS)}`);

  if(Math.random()<.2)
    add(e,"mix-blend-mode",
      pick(["difference","screen","multiply","overlay","exclusion"]));

  if(Math.random()<.2)
    add(e,"background",
      `linear-gradient(${ri(0,360)}deg,${pick(COLORS)},transparent)`);

  if(Math.random()<.2)
    add(e,"clip-path",
      `polygon(${ri(0,30)}% ${ri(0,30)}%,
               ${ri(70,100)}% ${ri(0,30)}%,
               ${ri(70,100)}% ${ri(70,100)}%,
               ${ri(0,30)}% ${ri(70,100)}%)`);
}

function stacking(e){
  add(e,"position",
    pick(["relative","relative","relative","absolute"]));
  add(e,"z-index",ri(-20,100));
}

function overflow(e){
  if(Math.random()<.4)add(e,"overflow",pick(["hidden","visible","scroll","auto"]));
  if(Math.random()<.2)add(e,"overflow-x","scroll");
  if(Math.random()<.15)add(e,"white-space",pick(["normal","nowrap"]));
}

function image(e){
  if(e.tagName!=="IMG")return;

  if(Math.random()<.4)add(e,"object-fit",pick(["fill","cover","contain","none"]));
  if(Math.random()<.3)add(e,"object-position",`${ri(0,100)}% ${ri(0,100)}%`);
  if(Math.random()<.3)add(e,"filter",pick([
    "hue-rotate(90deg) saturate(3)",
    "contrast(2) brightness(.7)",
    "invert(.8)",
    "blur(2px)",
    "grayscale(1) contrast(2)"
  ]));
  if(Math.random()<.25)add(e,"image-rendering","pixelated");
}

/* ---------- text corruption ---------- */

function text(e){
  const w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);
  const a=[];

  while(w.nextNode()){
    const n=w.currentNode;
    if(n.nodeValue&&n.nodeValue.trim())a.push(n);
  }

  if(!a.length)return;

  const n=pick(a);
  let s=n.nodeValue.split("");

  const chance=clamp(.015+S.intensity*.008,0,.75);

  for(let i=0;i<s.length;i++){
    if(/\s/.test(s[i]))continue;

    if(Math.random()<chance){
      const mode=Math.random();

      if(mode<.55)s[i]=pick(CHARS.split(""));
      else if(mode<.75)s[i]=s[i].toUpperCase();
      else if(mode<.9)s[i]=s[i].toLowerCase();
      else s[i]="";
    }
  }

  if(Math.random()<Math.min(.25,S.intensity*.01)){
    const pos=ri(0,s.length);
    s.splice(pos,0,pick(CHARS.split("")));
  }

  n.nodeValue=s.join("");

  const p=path(n.parentElement);
  if(p){
    S.mutations[p+"|TEXT"]={
      node:n.nodeValue
    };
  }
}

/* ---------- duplicate/tear artifacts ---------- */

function tear(e){
  const r=e.getBoundingClientRect();
  if(!r.width||!r.height)return;

  const c=e.cloneNode(true);
  c.removeAttribute("id");
  c.dataset.chaosArtifact="1";

  Object.assign(c.style,{
    position:"fixed",
    left:`${r.left+rnd(-50,50)}px`,
    top:`${r.top+rnd(-12,12)}px`,
    width:`${r.width}px`,
    height:`${r.height}px`,
    pointerEvents:"none",
    zIndex:"2147483646",
    opacity:rnd(.03,.2),
    overflow:"hidden",
    filter:pick([
      "hue-rotate(90deg)",
      "hue-rotate(-90deg)",
      "contrast(2)",
      "saturate(4)"
    ])
  });

  document.body.appendChild(c);

  setTimeout(()=>c.remove(),ri(40,250));
}

function echo(e){
  const r=e.getBoundingClientRect();
  const c=e.cloneNode(true);

  c.removeAttribute("id");
  c.dataset.chaosArtifact="1";

  Object.assign(c.style,{
    position:"fixed",
    left:`${r.left+rnd(-15,15)}px`,
    top:`${r.top+rnd(-15,15)}px`,
    width:`${r.width}px`,
    pointerEvents:"none",
    opacity:rnd(.02,.08),
    zIndex:"2147483645",
    filter:"blur(1px)"
  });

  document.body.appendChild(c);

  setTimeout(()=>c.remove(),ri(100,500));
}

/* ---------- special failures ---------- */

function controlFailure(e){
  if(!["BUTTON","INPUT","TEXTAREA","SELECT"].includes(e.tagName))
    return;

  if(Math.random()<.5)
    add(e,"cursor","not-allowed");

  if(Math.random()<.4)
    add(e,"transform",
      `translate(${rnd(-20,20)}px,${rnd(-10,10)}px) rotate(${rnd(-5,5)}deg)`);

  if(Math.random()<.3)
    add(e,"width",`${rnd(60,180)}%`);

  if(Math.random()<.25)
    add(e,"font-size",`${rnd(70,180)}%`);
}

function fixedFailure(e){
  if(Math.random()<.2){
    add(e,"position","fixed");
    add(e,"top",`${rnd(0,90)}vh`);
    add(e,"left",`${rnd(0,90)}vw`);
  }
}

function rotation(e){
  add(e,"transform",
    `rotate(${rnd(-25,25)}deg)
     skew(${rnd(-10,10)}deg,${rnd(-5,5)}deg)`);
}

function mirror(e){
  add(e,"transform",
    `scaleX(-1) rotate(${rnd(-4,4)}deg)`);
}

/* ---------- master corruption ---------- */

const effects=[
  transform,
  typography,
  spacing,
  dimensions,
  layout,
  colors,
  visual,
  stacking,
  overflow,
  image,
  text,
  tear,
  echo,
  controlFailure,
  fixedFailure,
  rotation,
  mirror
];

function corrupt(e){
  if(!good(e))return;

  /*
   * Multiple independent effects per wave.
   * This is what prevents the result from becoming
   * mostly chromatic aberration.
   */

  const count=
    Math.min(
      effects.length,
      1+
      Math.floor(
        Math.pow(S.intensity+.5,1.08)
      )
    );

  const used=new Set();

  for(let i=0;i<count;i++){
    let fn;

    do{
      fn=pick(effects);
    }while(used.has(fn)&&used.size<effects.length);

    used.add(fn);

    try{
      fn(e);
    }catch{}
  }
}

/* ---------- restore first ---------- */

restore();

/* ---------- progressively worsen ---------- */

let last=performance.now();

function progress(now){
  const dt=Math.min(100,now-last);
  last=now;

  /*
   * Fast progression.
   */
  S.intensity += dt/1000*.12;

  requestAnimationFrame(progress);
}

requestAnimationFrame(progress);

/* ---------- corruption waves ---------- */

function wave(){

  const list=els();
  if(!list.length)return;

  /*
   * Much faster than the previous version.
   */
  S.intensity+=.08;

  const amount=Math.min(
    list.length,
    Math.max(
      2,
      Math.floor(
        2+
        Math.pow(
          S.intensity,
          1.12
        )*.8
      )
    )
  );

  for(let i=0;i<amount;i++){
    corrupt(pick(list));
  }

  save();
}

wave();

const timer=setInterval(
  wave,
  120
);

/* ---------- dynamic DOM ---------- */

const observer=new MutationObserver(ms=>{
  for(const m of ms){
    for(const n of m.addedNodes){
      if(!good(n))continue;

      if(
        Math.random()<
        clamp(
          .02+
          S.intensity*.012,
          0,
          .7
        )
      ){
        corrupt(n);
      }
    }
  }
});

observer.observe(
  document.body,
  {
    childList:true,
    subtree:true
  }
);

/* ---------- keyboard controls ---------- */

window.domGlitch={
  get intensity(){
    return S.intensity;
  },

  burst(n=100){
    const a=els();

    for(let i=0;i<n;i++){
      if(!a.length)break;
      corrupt(pick(a));
    }

    save();
  },

  intensity(n){
    S.intensity=Math.max(
      0,
      Number(n)||0
    );
    save();
  },

  clear(){
    delete DB[PAGE];
    localStorage.setItem(
      KEY,
      JSON.stringify(DB)
    );
    location.reload();
  },

  info(){
    return{
      page:PAGE,
      intensity:S.intensity,
      mutations:Object.keys(S.mutations).length
    };
  }
};

save();

console.log(
  "%cCHAOS GLITCH ACTIVE",
  "color:#ff1744;font-size:18px;font-weight:bold"
);

})(); 
