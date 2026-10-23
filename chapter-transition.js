import {ILLUSTRATION_ASSETS} from './preview-interaction.js';

export function exitDirection(layer,pageWidth){
 return ILLUSTRATION_ASSETS.includes(layer.assetId)||/^下景/.test(layer.name)
  ?[(layer.x+layer.width/2<pageWidth/2?-1:1)*48,0]
  :[0,-36];
}

// Require a fresh gesture after a transition, so trackpad inertia cannot switch twice.
export function createWheelNavigation(){
 let total=0,last=-Infinity,locked=false;
 return (current,event,now,blocked=false)=>{
  const gap=now-last;last=now;
  if(gap>240){total=0;locked=false;}
  if(blocked){total=0;locked=true;return null;}
  if(locked||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return null;
  const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?800:1);
  if(!delta)return null;
  if(Math.sign(total)!==Math.sign(delta))total=0;
  total+=delta;
  if(Math.abs(total)<55)return null;
  const next=current==='composition'&&total>0?'materials':current==='materials'&&total<0?'composition':null;
  total=0;if(next)locked=true;
  return next;
 };
}
export function needsPageScroll(deltaY,scrollTop,scrollHeight,viewportHeight){
 return deltaY>0?scrollTop+viewportHeight<scrollHeight-3:deltaY<0&&scrollTop>3;
}

export function bindChapterTransition(getPage){
 const composition=document.querySelector('#composition'),materials=document.querySelector('#materials');
 const links=[...document.querySelectorAll('a[href="#composition"],a[href="#materials"]')];
 let current='composition',busy=false;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 async function switchTo(next,updateHistory=true){
  if(busy||next===current)return;
  busy=true;const page=getPage(),art=document.querySelector('#previewArt');
  composition.inert=true;materials.inert=true;
  try{
   if(current==='composition'&&!reduced()){
    const scale=Math.max(.02,art.getBoundingClientRect().width/(page?.width||3000));
    const animations=[...art.children].map(node=>{
     const layer=page?.layers.find(layer=>layer.id===node.dataset.id);
     if(!layer)return null;
     const [x,y]=exitDirection(layer,page.width),opacity=getComputedStyle(node).opacity;
     return node.animate([{translate:'0 0',opacity},{translate:`${x/scale}px ${y/scale}px`,opacity:0}],{duration:600,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
    }).filter(Boolean);
    await Promise.all(animations.map(a=>a.finished));
    composition.hidden=true;animations.forEach(a=>a.cancel());
   }else{
    const outgoing=current==='composition'?composition:materials;
    if(!reduced())await outgoing.animate([{opacity:1},{opacity:0}],{duration:320,easing:'ease-in'}).finished;
    outgoing.hidden=true;
   }
   const incoming=next==='composition'?composition:materials;
   incoming.hidden=false;window.scrollTo({top:0,behavior:'instant'});
   if(!reduced())await incoming.animate([{opacity:0,translate:'0 6px'},{opacity:1,translate:'0 0'}],{duration:450,easing:'ease-out'}).finished;
   current=next;
   if(updateHistory)history.pushState(null,'','#'+next);
   document.querySelectorAll('.chapter-nav a').forEach(link=>{
    if(link.hash==='#'+next)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
   });
  }finally{
   composition.inert=composition.hidden;materials.inert=materials.hidden;busy=false;
  }
 }
 links.forEach(link=>link.addEventListener('click',event=>{event.preventDefault();switchTo(link.hash.slice(1));}));
 const wheelNavigation=createWheelNavigation();
 window.addEventListener('wheel',event=>{
  if(event.composedPath().some(node=>node.classList?.contains('inspector-gallery')))return;
  const scrolling=document.scrollingElement;
  if(!busy&&needsPageScroll(event.deltaY,scrolling.scrollTop,scrolling.scrollHeight,window.innerHeight)){
   wheelNavigation(current,event,performance.now(),true);return;
  }
  const blocked=busy||document.body.classList.contains('intro-open')||!!document.querySelector('dialog[open]');
  const next=wheelNavigation(current,event,performance.now(),blocked);
  // Leave zooming, horizontal gestures and dialog scrolling to the browser.
  if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||document.querySelector('dialog[open]')||document.body.classList.contains('intro-open'))return;
  event.preventDefault();
  if(next)switchTo(next);
 },{passive:false});
 window.addEventListener('popstate',()=>switchTo(location.hash==='#materials'?'materials':'composition',false));
}
