javascript:(()=>{"use strict";
if(window.__CHAOS_GLITCH__)return;
window.__CHAOS_GLITCH__=true;

/* ============================================================
   PERSISTENCE
   ============================================================ */

const STORAGE="__CHAOS_GLITCH_EXTREME_V6__";
const PAGE=location.origin+location.pathname;

let DB={};

try{
  DB=JSON.parse(localStorage.getItem(STORAGE)||"{}");
}catch{}

let S=DB[PAGE]||{
  intensity:0,
  mutations:{},
  text:{},
  started:Date.now()
};

DB[PAGE]=S;

function save(){
  try{
    localStorage.setItem(
      STORAGE,
      JSON.stringify(DB)
    );
  }catch{}
}

/* ============================================================
   CONFIG
   ============================================================ */

const CHARS=
"█▓▒░╳╬┼│─<>/\\\\$#@%!?░▒▓█";

const COLORS=[
  "#ff003c",
  "#00eaff",
  "#ff00aa",
  "#7cff00",
  "#fff700",
  "#7b61ff",
  "#ff8a00",
  "#ffffff"
];

const FONTS=[
  "Arial",
  "Georgia",
  "Courier New",
  "Times New Roman",
  "Impact",
  "Comic Sans MS",
  "monospace",
  "serif",
  "sans-serif"
];

const ignored=new Set([
  "HTML","HEAD","BODY",
  "SCRIPT","STYLE","META",
  "LINK","TITLE","NOSCRIPT",
  "TEMPLATE","SVG","PATH"
]);

const selector=[
  "h1","h2","h3","h4","h5","h6",
  "p","span","a","button","li",
  "label","strong","em","small",
  "td","th","img","input",
  "textarea","select",
  "section","article","nav",
  "header","footer","main",
  "aside","form","figure",
  "blockquote","pre","code",
  "table","ul","ol"
].join(",");

/* ============================================================
   HELPERS
   ============================================================ */

const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const chance=p=>Math.random()<p;

function good(e){
  if(!e||e.nodeType!==1)return false;

  if(ignored.has(e.tagName))
    return false;

  if(e.dataset.chaosArtifact)
    return false;

  if(e.dataset.chaosIgnore!==undefined)
    return false;

  const r=e.getBoundingClientRect();

  return r.width>2&&r.height>2;
}

function elements(){
  return [...document.querySelectorAll(selector)]
    .filter(good);
}

/* ============================================================
   DOM PATHS
   ============================================================ */

function path(e){
  const out=[];
  let x=e;

  while(
    x &&
    x!==document.body &&
    x.nodeType===1
  ){
    let n=0;
    let s=x.previousElementSibling;

    while(s){
      if(s.tagName===x.tagName)n++;
      s=s.previousElementSibling;
    }

    out.unshift(x.tagName+":"+n);
    x=x.parentElement;
  }

  return out.join("/");
}

function find(pathString){
  if(!pathString)return null;

  let x=document.body;

  for(const part of pathString.split("/")){
    const i=part.lastIndexOf(":");

    if(i<0)return null;

    const tag=part.slice(0,i);
    const index=+part.slice(i+1);

    const children=[
      ...x.children
    ].filter(
      e=>e.tagName===tag
    );

    if(!children[index])
      return null;

    x=children[index];
  }

  return x;
}

function record(e){
  const p=path(e);

  if(!p)return;

  S.mutations[p]=
    e.getAttribute("style")||"";
}

function style(e,p,v){
  try{
    e.style.setProperty(
      p,
      String(v),
      "important"
    );

    record(e);
  }catch{}
}

/* ============================================================
   RESTORE PERSISTENT MUTATIONS
   ============================================================ */

function restore(){

  for(
    const [p,v]
    of Object.entries(S.mutations)
  ){
    const e=find(p);

    if(!e)continue;

    try{
      if(v)
        e.setAttribute("style",v);
      else
        e.removeAttribute("style");
    }catch{}
  }

  /*
   * Restore text separately.
   */

  for(
    const [p,v]
    of Object.entries(S.text)
  ){
    const e=find(p);

    if(!e)continue;

    const walker=
      document.createTreeWalker(
        e,
        NodeFilter.SHOW_TEXT
      );

    const nodes=[];

    while(walker.nextNode())
      nodes.push(walker.currentNode);

    if(nodes.length)
      nodes[0].nodeValue=v;
  }
}

restore();

/* ============================================================
   TEXT CORRUPTION
   ============================================================ */

function corruptText(e){

  const walker=
    document.createTreeWalker(
      e,
      NodeFilter.SHOW_TEXT
    );

  const nodes=[];

  while(walker.nextNode()){
    const n=walker.currentNode;

    if(
      n.nodeValue &&
      n.nodeValue.trim()
    )
      nodes.push(n);
  }

  if(!nodes.length)return;

  const n=pick(nodes);
  let s=n.nodeValue.split("");

  const amount=
    Math.min(
      .8,
      .015+
      S.intensity*.009
    );

  for(let i=0;i<s.length;i++){

    if(/\s/.test(s[i]))
      continue;

    if(chance(amount)){

      const r=Math.random();

      if(r<.45)
        s[i]=pick(CHARS.split(""));

      else if(r<.65)
        s[i]="";

      else if(r<.8)
        s[i]=s[i].toUpperCase();

      else
        s[i]=s[i].toLowerCase();
    }
  }

  if(chance(
    Math.min(
      .4,
      S.intensity*.012
    )
  )){
    s.splice(
      ri(0,s.length),
      0,
      pick(CHARS.split(""))
    );
  }

  n.nodeValue=s.join("");

  const p=path(e);

  if(p)
    S.text[p]=n.nodeValue;
}

/* ============================================================
   TYPOGRAPHY
   ============================================================ */

function typography(e){

  if(chance(.55))
    style(
      e,
      "font-size",
      `${rnd(55,150)}%`
    );

  if(chance(.45))
    style(
      e,
      "font-family",
      pick(FONTS)
    );

  if(chance(.4))
    style(
      e,
      "font-weight",
      pick([
        "100","300","400",
        "500","700","900"
      ])
    );

  if(chance(.4))
    style(
      e,
      "letter-spacing",
      `${rnd(-4,Math.min(
        25,
        S.intensity*.35
      ))}px`
    );

  if(chance(.3))
    style(
      e,
      "word-spacing",
      `${rnd(-8,Math.min(
        40,
        S.intensity*.5
      ))}px`
    );

  if(chance(.35))
    style(
      e,
      "line-height",
      rnd(.35,2.8)
    );

  if(chance(.25))
    style(
      e,
      "text-transform",
      pick([
        "uppercase",
        "lowercase",
        "capitalize",
        "none"
      ])
    );

  if(chance(.25))
    style(
      e,
      "text-decoration",
      pick([
        "underline",
        "line-through",
        "overline",
        "none"
      ])
    );

  if(chance(.2))
    style(
      e,
      "font-style",
      pick([
        "normal",
        "italic",
        "oblique"
      ])
    );
}

/* ============================================================
   POSITION / GEOMETRY
   ============================================================ */

function position(e){

  const i=Math.min(
    120,
    4+S.intensity
  );

  const x=rnd(-i,i);
  const y=rnd(-i*.65,i*.65);
  const r=rnd(-i*.12,i*.12);

  const sx=rnd(
    Math.max(.35,1-i*.006),
    1+i*.006
  );

  const sy=rnd(
    Math.max(.4,1-i*.005),
    1+i*.005
  );

  style(
    e,
    "transform",
    `translate(${x}px,${y}px)
     rotate(${r}deg)
     scale(${sx},${sy})
     skew(${rnd(-8,8)}deg)`
  );
}

function spacing(e){

  const i=Math.min(
    120,
    S.intensity
  );

  if(chance(.5))
    style(e,"margin-left",`${rnd(-i,i)}px`);

  if(chance(.4))
    style(e,"margin-right",`${rnd(-i,i)}px`);

  if(chance(.4))
    style(e,"margin-top",`${rnd(-i,i*.6)}px`);

  if(chance(.35))
    style(e,"margin-bottom",`${rnd(-i,i*.6)}px`);

  if(chance(.35))
    style(e,"padding-left",`${rnd(0,i)}px`);

  if(chance(.35))
    style(e,"padding-right",`${rnd(0,i)}px`);

  if(chance(.25))
    style(e,"gap",`${rnd(0,i)}px`);
}

function dimensions(e){

  if(chance(.3))
    style(
      e,
      "width",
      `${rnd(55,160)}%`
    );

  if(chance(.25))
    style(
      e,
      "height",
      `${rnd(60,160)}%`
    );

  if(chance(.25))
    style(
      e,
      "min-width",
      `${rnd(0,100)}px`
    );

  if(chance(.2))
    style(
      e,
      "max-width",
      `${rnd(40,100)}%`
    );

  if(chance(.2))
    style(
      e,
      "min-height",
      `${rnd(0,100)}px`
    );
}

/* ============================================================
   FLEX / GRID
   ============================================================ */

function flexGrid(e){

  if(chance(.3))
    style(
      e,
      "display",
      pick([
        "block",
        "flex",
        "grid",
        "inline-flex",
        "inline-grid"
      ])
    );

  if(chance(.3))
    style(
      e,
      "flex-direction",
      pick([
        "row",
        "row-reverse",
        "column",
        "column-reverse"
      ])
    );

  if(chance(.3))
    style(
      e,
      "flex-wrap",
      pick([
        "nowrap",
        "wrap",
        "wrap-reverse"
      ])
    );

  if(chance(.35))
    style(
      e,
      "justify-content",
      pick([
        "flex-start",
        "center",
        "flex-end",
        "space-between",
        "space-around",
        "space-evenly"
      ])
    );

  if(chance(.35))
    style(
      e,
      "align-items",
      pick([
        "flex-start",
        "center",
        "flex-end",
        "stretch",
        "baseline"
      ])
    );

  if(chance(.25))
    style(
      e,
      "grid-template-columns",
      pick([
        "1fr",
        "1fr 1fr",
        "1fr 2fr",
        "repeat(3,1fr)",
        "repeat(4,1fr)"
      ])
    );

  if(chance(.25))
    style(
      e,
      "order",
      ri(-10,20)
    );
}

/* ============================================================
   VISUAL CORRUPTION
   ============================================================ */

function visual(e){

  if(chance(.4))
    style(
      e,
      "opacity",
      rnd(.08,1)
    );

  if(chance(.45))
    style(
      e,
      "filter",
      pick([
        "blur(1px)",
        "blur(3px)",
        "contrast(2)",
        "contrast(.35)",
        "brightness(1.7)",
        "brightness(.4)",
        "saturate(4)",
        "saturate(.1)",
        "grayscale(1)",
        "sepia(1)",
        "invert(.7)",
        "hue-rotate(60deg)",
        "hue-rotate(180deg)",
        "blur(1px) contrast(2) saturate(3)",
        "brightness(.6) hue-rotate(130deg)"
      ])
    );

  if(chance(.3))
    style(
      e,
      "border",
      `${rnd(.5,8)}px solid ${pick(COLORS)}`
    );

  if(chance(.3))
    style(
      e,
      "border-radius",
      `${rnd(0,70)}px`
    );

  if(chance(.3))
    style(
      e,
      "box-shadow",
      `${rnd(-30,30)}px
       ${rnd(-30,30)}px
       ${rnd(1,40)}px
       ${pick(COLORS)}`
    );

  if(chance(.25))
    style(
      e,
      "mix-blend-mode",
      pick([
        "difference",
        "screen",
        "multiply",
        "overlay",
        "exclusion",
        "hard-light"
      ])
    );

  if(chance(.25))
    style(
      e,
      "background",
      `linear-gradient(
        ${ri(0,360)}deg,
        ${pick(COLORS)},
        transparent,
        ${pick(COLORS)}
      )`
    );
}

/* ============================================================
   RGB / TEXT EFFECTS
   ============================================================ */

function rgb(e){

  const n=Math.min(
    50,
    2+S.intensity*.5
  );

  style(
    e,
    "text-shadow",
    `${n}px 0 rgba(255,0,50,.7),
     ${-n}px 0 rgba(0,120,255,.7),
     0 ${n/2}px rgba(0,255,150,.25)`
  );
}

function clip(e){

  style(
    e,
    "clip-path",
    `polygon(
      ${ri(0,30)}% ${ri(0,30)}%,
      ${ri(70,100)}% ${ri(0,30)}%,
      ${ri(70,100)}% ${ri(70,100)}%,
      ${ri(0,30)}% ${ri(70,100)}%
    )`
  );
}

function overflow(e){

  if(chance(.4))
    style(
      e,
      "overflow",
      pick([
        "hidden",
        "visible",
        "scroll",
        "auto"
      ])
    );

  if(chance(.25))
    style(
      e,
      "white-space",
      pick([
        "normal",
        "nowrap"
      ])
    );

  if(chance(.2))
    style(
      e,
      "overflow-x",
      "scroll"
    );
}

/* ============================================================
   COLORS
   ============================================================ */

function color(e){

  if(chance(.5))
    style(
      e,
      "color",
      pick(COLORS)
    );

  if(chance(.3))
    style(
      e,
      "background-color",
      pick(COLORS)
    );

  if(chance(.25))
    style(
      e,
      "border-color",
      pick(COLORS)
    );
}

/* ============================================================
   IMAGE DAMAGE
   ============================================================ */

function image(e){

  if(e.tagName!=="IMG")
    return;

  if(chance(.4))
    style(
      e,
      "object-fit",
      pick([
        "fill",
        "cover",
        "contain",
        "none"
      ])
    );

  if(chance(.4))
    style(
      e,
      "object-position",
      `${ri(0,100)}% ${ri(0,100)}%`
    );

  if(chance(.4))
    style(
      e,
      "filter",
      pick([
        "hue-rotate(90deg) saturate(3)",
        "contrast(2) brightness(.7)",
        "invert(.8)",
        "blur(2px)",
        "grayscale(1) contrast(2)",
        "saturate(5) hue-rotate(180deg)"
      ])
    );

  if(chance(.25))
    style(
      e,
      "image-rendering",
      "pixelated"
    );

  if(chance(.2))
    style(
      e,
      "object-fit",
      "none"
    );
}

/* ============================================================
   Z-INDEX / LAYERING
   ============================================================ */

function layering(e){

  style(
    e,
    "position",
    pick([
      "relative",
      "relative",
      "relative",
      "absolute"
    ])
  );

  style(
    e,
    "z-index",
    ri(-50,100)
  );
}

/* ============================================================
   FIXED POSITION ANOMALIES
   ============================================================ */

function floating(e){

  if(!chance(.25))
    return;

  style(e,"position","fixed");

  style(
    e,
    "left",
    `${rnd(0,90)}vw`
  );

  style(
    e,
    "top",
    `${rnd(0,90)}vh`
  );

  style(
    e,
    "z-index",
    ri(10,1000)
  );
}

/* ============================================================
   ROTATION / MIRROR
   ============================================================ */

function rotate(e){

  style(
    e,
    "transform",
    `rotate(${rnd(-35,35)}deg)
     skew(${rnd(-12,12)}deg,${rnd(-8,8)}deg)`
  );
}

function mirror(e){

  style(
    e,
    "transform",
    `scaleX(-1)
     rotate(${rnd(-8,8)}deg)`
  );
}

/* ============================================================
   CONTROL DISTORTION
   ============================================================ */

function controls(e){

  if(![
    "BUTTON",
    "INPUT",
    "TEXTAREA",
    "SELECT"
  ].includes(e.tagName))
    return;

  if(chance(.5))
    style(
      e,
      "cursor",
      "not-allowed"
    );

  if(chance(.5))
    style(
      e,
      "transform",
      `translate(
        ${rnd(-30,30)}px,
        ${rnd(-15,15)}px
      )
      rotate(${rnd(-8,8)}deg)`
    );

  if(chance(.35))
    style(
      e,
      "font-size",
      `${rnd(60,180)}%`
    );

  if(chance(.35))
    style(
      e,
      "width",
      `${rnd(50,180)}%`
    );
}

/* ============================================================
   FAKE DIGITAL TEARS
   ============================================================ */

function tear(e){

  const r=
    e.getBoundingClientRect();

  if(!r.width||!r.height)
    return;

  const c=e.cloneNode(true);

  c.removeAttribute("id");
  c.dataset.chaosArtifact="1";

  Object.assign(
    c.style,
    {
      position:"fixed",
      left:
        `${r.left+rnd(-80,80)}px`,
      top:
        `${r.top+rnd(-20,20)}px`,
      width:
        `${r.width}px`,
      height:
        `${r.height}px`,
      pointerEvents:"none",
      opacity:
        rnd(.02,.22),
      zIndex:
        "2147483646",
      overflow:"hidden",
      filter:pick([
        "hue-rotate(90deg)",
        "hue-rotate(-90deg)",
        "contrast(2)",
        "saturate(4)",
        "invert(.5)"
      ])
    }
  );

  document.body.appendChild(c);

  setTimeout(
    ()=>c.remove(),
    ri(30,300)
  );
}

function echo(e){

  const r=
    e.getBoundingClientRect();

  const c=e.cloneNode(true);

  c.removeAttribute("id");
  c.dataset.chaosArtifact="1";

  Object.assign(
    c.style,
    {
      position:"fixed",
      left:
        `${r.left+rnd(-25,25)}px`,
      top:
        `${r.top+rnd(-20,20)}px`,
      width:
        `${r.width}px`,
      pointerEvents:"none",
      opacity:rnd(.02,.1),
      filter:"blur(2px)",
      zIndex:"2147483645"
    }
  );

  document.body.appendChild(c);

  setTimeout(
    ()=>c.remove(),
    ri(100,600)
  );
}

/* ============================================================
   RANDOM BACKGROUND DAMAGE
   ============================================================ */

function background(e){

  if(chance(.4))
    style(
      e,
      "background-color",
      pick(COLORS)
    );

  if(chance(.35))
    style(
      e,
      "background-image",
      `repeating-linear-gradient(
        ${ri(0,180)}deg,
        ${pick(COLORS)} 0px,
        transparent ${ri(2,20)}px,
        ${pick(COLORS)} ${ri(20,60)}px
      )`
    );
}

/* ============================================================
   POINTER / INTERACTION APPEARANCE
   ============================================================ */

function pointer(e){

  if(chance(.3))
    style(
      e,
      "cursor",
      pick([
        "crosshair",
        "wait",
        "not-allowed",
        "help",
        "progress"
      ])
    );

  if(chance(.2))
    style(
      e,
      "user-select",
      pick([
        "none",
        "text",
        "all"
      ])
    );
}

/* ============================================================
   MASTER EFFECT POOL
   ============================================================ */

const effects=[
  corruptText,
  typography,
  position,
  spacing,
  dimensions,
  flexGrid,
  visual,
  rgb,
  clip,
  overflow,
  color,
  image,
  layering,
  floating,
  rotate,
  mirror,
  controls,
  tear,
  echo,
  background,
  pointer
];

/* ============================================================
   CORRUPTION
   ============================================================ */

function corrupt(e){

  if(!good(e))
    return;

  /*
   * Number of effects rises continuously.
   */

  const count=Math.min(
    effects.length,
    Math.max(
      1,
      Math.floor(
        1+
        Math.pow(
          S.intensity+.5,
          1.08
        )
      )
    )
  );

  const used=new Set();

  for(let i=0;i<count;i++){

    let fn;

    do{
      fn=pick(effects);
    }while(
      used.has(fn) &&
      used.size<effects.length
    );

    used.add(fn);

    try{
      fn(e);
    }catch{}
  }
}

/* ============================================================
   DISABLE NORMAL NAVIGATION / SUBMISSION
   ============================================================ */

function blockActions(){

  /*
   * This is intended for a page you control as part
   * of the prank/simulation.
   */

  document.addEventListener(
    "click",
    event=>{

      const a=
        event.target.closest("a");

      if(!a)
        return;

      event.preventDefault();

      event.stopImmediatePropagation();

      controls(a);

      record(a);
      save();

    },
    true
  );

  document.addEventListener(
    "submit",
    event=>{

      event.preventDefault();

      event.stopImmediatePropagation();

      if(event.target instanceof HTMLElement){
        controls(event.target);
        record(event.target);
        save();
      }

    },
    true
  );

  document.addEventListener(
    "keydown",
    event=>{

      if(
        event.key!=="Enter" &&
        event.key!==" "
      )
        return;

      const t=event.target;

      if(!t||!t.closest)
        return;

      const control=
        t.closest(
          "a,button,input[type=submit],input[type=button]"
        );

      if(!control)
        return;

      event.preventDefault();
      event.stopImmediatePropagation();

      controls(control);

      record(control);
      save();

    },
    true
  );
}

blockActions();

/* ============================================================
   PROGRESSIVE ENGINE
   ============================================================ */

let last=performance.now();

function progression(now){

  const dt=
    Math.min(
      100,
      now-last
    );

  last=now;

  /*
   * Fast escalation.
   */

  S.intensity +=
    dt/1000*.18;

  requestAnimationFrame(
    progression
  );
}

requestAnimationFrame(
  progression
);

/* ============================================================
   CORRUPTION WAVES
   ============================================================ */

function wave(){

  const a=elements();

  if(!a.length)
    return;

  S.intensity+=.12;

  /*
   * Increasing number of elements per wave.
   */

  const amount=Math.min(
    a.length,
    Math.max(
      3,
      Math.floor(
        3+
        Math.pow(
          S.intensity,
          1.12
        )
      )
    )
  );

  for(
    let i=0;
    i<amount;
    i++
  ){
    corrupt(
      pick(a)
    );
  }

  save();
}

wave();

const timer=setInterval(
  wave,
  100
);

/* ============================================================
   DYNAMIC CONTENT OBSERVER
   ============================================================ */

const observer=
new MutationObserver(
  mutations=>{

    for(
      const mutation
      of mutations
    ){

      for(
        const node
        of mutation.addedNodes
      ){

        if(
          !good(node)
        )
          continue;

        const probability=
          Math.min(
            .8,
            .02+
            S.intensity*.015
          );

        if(chance(probability))
          corrupt(node);
      }
    }
  }
);

observer.observe(
  document.body,
  {
    childList:true,
    subtree:true
  }
);

/* ============================================================
   PERIODIC PERSISTENCE
   ============================================================ */

setInterval(
  save,
  500
);

/* ============================================================
   CONSOLE CONTROLS
   ============================================================ */

window.domGlitch={

  intensity(n){
    S.intensity=
      Math.max(
        0,
        Number(n)||0
      );

    save();
  },

  burst(n=500){

    const a=elements();

    for(
      let i=0;
      i<n;
      i++
    ){
      if(!a.length)break;
      corrupt(pick(a));
    }

    save();
  },

  info(){
    return{
      page:PAGE,
      intensity:S.intensity,
      styles:
        Object.keys(
          S.mutations
        ).length,
      text:
        Object.keys(
          S.text
        ).length
    };
  },

  clear(){

    delete DB[PAGE];

    try{
      localStorage.setItem(
        STORAGE,
        JSON.stringify(DB)
      );
    }catch{}

    location.reload();
  }
};

save();

console.log(
  "%cEXTREME CHAOS GLITCH ACTIVE",
  "color:#ff003c;font-size:20px;font-weight:900"
);

})(); 
