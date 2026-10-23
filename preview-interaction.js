import {PAINTING_GROUP_ASSET,RIGHT_PAINTING_GROUP_ASSET} from './painting-config.js';
// Interaction is scoped to the main composition; editing geometry stays untouched.
export const MAIN_PAGE_ID='ef752455-becf-4fee-8fe3-cd7af6e49a8c';
export const HOVER_LIFT_PX=6;
export function createVisibleScale(pageWidth){
 let last=1;
 return width=>{if(width>0)last=Math.max(.02,width/pageWidth);return last;};
}
export const VESSEL_ASSETS=[
 '4265f437-83e7-4410-a19f-fb17c1e68da8','ccebd497-5326-41b8-8352-1c896234248e',
 '6ec9d1cd-babf-4824-b0e0-2578b054529b','7bb74f37-6c4b-4fb5-8691-fa1df1220e3a','30e73211-1e6c-4ea7-9d20-dba19a28faf0'
];
export const ILLUSTRATION_ASSETS=[PAINTING_GROUP_ASSET,'bddeed84-52a2-45d2-ad53-c3254e47d5e3',RIGHT_PAINTING_GROUP_ASSET];
export function getHoverTargets(page){
 if(page?.id!==MAIN_PAGE_ID)return [];
 return page.layers.filter(l=>!l.hidden&&(VESSEL_ASSETS.includes(l.assetId)||ILLUSTRATION_ASSETS.includes(l.assetId)))
  .map(layer=>({layer,kind:VESSEL_ASSETS.includes(layer.assetId)?'vessel':'illustration'}));
}
export function findHoverTarget(point,targets,sampleAlpha){
 for(let i=targets.length-1;i>=0;i--){
  const target=targets[i],l=target.layer,a=-(l.rotation||0)*Math.PI/180;
  const dx=point.x-l.x-l.width/2,dy=point.y-l.y-l.height/2;
  const u=(dx*Math.cos(a)-dy*Math.sin(a)+l.width/2)/l.width;
  const v=(dx*Math.sin(a)+dy*Math.cos(a)+l.height/2)/l.height;
  if(u>=0&&u<1&&v>=0&&v<1&&sampleAlpha(target,u,v)>18)return target;
 }
 return null;
}

export function bindPreviewInteraction({page,art,stage,onArtworkOpen}){
 const targets=getHoverTargets(page);
 const canOpen=assetId=>!!onArtworkOpen&&(VESSEL_ASSETS.includes(assetId)||ILLUSTRATION_ASSETS.includes(assetId));
 if(!targets.length)return ()=>{};
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const masks=new Map(),items=new Map();let active=null,disposed=false,lastPoint=null;
 art.dataset.interactive='true';
 const foliageAssets=new Set(['df110c2d-4ef6-45c3-bdac-f889f5a9437e','1315af34-4573-4928-b087-fa6789a88e83']);
 for(const layer of page.layers){
  if(!foliageAssets.has(layer.assetId))continue;
  const node=[...art.querySelectorAll('.canvas-element')].find(n=>n.dataset.id===layer.id);
  if(node)node.classList.add('preview-foliage');
 }
 const visibleScale=createVisibleScale(page.width);
 const scale=()=>visibleScale(art.getBoundingClientRect().width);
 function makeAnimation(target){
  const item=items.get(target.layer.id);item.animation?.cancel();
  const s=scale(),duration=motion.matches?160:500;
  const frames=motion.matches?[{opacity:.55},{opacity:1}]:[
   {offset:0,opacity:.55,transform:'translate3d(0,0,0) rotate(0deg)'},
   {offset:.6,opacity:.96,transform:`translate3d(${2/s}px,${-4/s}px,0) rotate(-.1deg)`},
   {offset:1,opacity:1,transform:`translate3d(0,${-HOVER_LIFT_PX/s}px,0) rotate(${target.kind==='vessel'?-.2:-.1}deg)`}
  ];
  item.duration=duration;item.animation=item.visual.animate(frames,{duration,easing:'cubic-bezier(.22,.72,.2,1)',fill:'both'});
  item.animation.pause();item.animation.currentTime=active===target?duration:0;
 }
 function activate(target){
  if(disposed||target===active)return;
  if(active){const old=items.get(active.layer.id);old.node.classList.remove('is-hovered');playTowards(old,false);}
  active=target;stage.style.cursor=canOpen(target?.layer.assetId)?'pointer':'';
  if(target){const item=items.get(target.layer.id);item.node.classList.add('is-hovered');playTowards(item,true);}
 }
 function playTowards(item,hovered){
  const time=Number(item.animation.currentTime)||0;
  if(hovered?time>=item.duration:time<=0){item.animation.pause();item.animation.currentTime=hovered?item.duration:0;return;}
  item.animation.playbackRate=hovered?1:-1;item.animation.play();
 }
 const alpha=(target,u,v)=>{
  const mask=masks.get(target.layer.assetId);if(!mask)return 0;
  return mask.bytes[(Math.min(mask.height-1,Math.floor(v*mask.height))*mask.width+Math.min(mask.width-1,Math.floor(u*mask.width)))*4+3];
 };
 function updatePointer(){
  if(!lastPoint||disposed)return;
  const rect=art.getBoundingClientRect(),s=scale(),point={x:(lastPoint.x-rect.left)/s,y:(lastPoint.y-rect.top)/s};
  let target=findHoverTarget(point,targets,alpha);
  // Keep the stationary original silhouette as the hit area and also accept
  // the lifted silhouette, avoiding hover flicker along a moving image edge.
  if(!target&&active)target=findHoverTarget({x:point.x,y:point.y+HOVER_LIFT_PX/s},[active],alpha);
  activate(target);
 }
 const onMove=e=>{if(e.pointerType==='touch')return;lastPoint={x:e.clientX,y:e.clientY};updatePointer();};
 const onLeave=()=>{lastPoint=null;activate(null);};
 const onFocus=e=>{const node=e.target.closest('.preview-reactive');if(node)activate(targets.find(t=>t.layer.id===node.dataset.id)||null);};
 const onBlur=()=>{activate(null);};
 const rebuild=()=>{if(art.getBoundingClientRect().width>0)targets.forEach(makeAnimation);};
 const sizeObserver=new ResizeObserver(rebuild);sizeObserver.observe(art);
 for(const target of targets){
  const node=[...art.querySelectorAll('.canvas-element')].find(n=>n.dataset.id===target.layer.id);
  if(!node)continue;
  node.classList.add('preview-reactive');node.classList.remove('selected');node.dataset.hoverKind=target.kind;
  node.tabIndex=0;node.setAttribute('role',canOpen(target.layer.assetId)?'button':'img');if(canOpen(target.layer.assetId)){node.setAttribute('aria-haspopup','dialog');node.setAttribute('aria-label','查看'+target.layer.name+'的来源与介绍');}node.removeAttribute('title');
  const image=node.querySelector('img'),visual=document.createElement('span');visual.className='preview-hover-visual';
  image.replaceWith(visual);visual.append(image);items.set(target.layer.id,{node,visual});makeAnimation(target);
  image.decode().then(()=>{
   if(disposed)return;
   const ratio=Math.min(1,512/Math.max(image.naturalWidth,image.naturalHeight));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));
   const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0,canvas.width,canvas.height);
   masks.set(target.layer.assetId,{width:canvas.width,height:canvas.height,bytes:context.getImageData(0,0,canvas.width,canvas.height).data});updatePointer();
  }).catch(()=>{});
 }
 const onClick=e=>{const rect=art.getBoundingClientRect(),s=scale();const point={x:(e.clientX-rect.left)/s,y:(e.clientY-rect.top)/s};let hit=findHoverTarget(point,targets,alpha);if(!hit&&active)hit=findHoverTarget({x:point.x,y:point.y+HOVER_LIFT_PX/s},[active],alpha);if(canOpen(hit?.layer.assetId))onArtworkOpen(hit.layer.assetId);};
 const onKey=e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('[aria-haspopup=dialog]')){e.preventDefault();const node=e.target.closest('[data-id]'),target=targets.find(t=>t.layer.id===node?.dataset.id);if(canOpen(target?.layer.assetId))onArtworkOpen(target.layer.assetId);}};
 stage.addEventListener('click',onClick);art.addEventListener('keydown',onKey);
 stage.addEventListener('pointermove',onMove);stage.addEventListener('pointerleave',onLeave);
 art.addEventListener('focusin',onFocus);art.addEventListener('focusout',onBlur);
 window.addEventListener('resize',rebuild);window.addEventListener('blur',onLeave);motion.addEventListener('change',rebuild);
 return ()=>{
  disposed=true;sizeObserver.disconnect();stage.removeEventListener('click',onClick);art.removeEventListener('keydown',onKey);stage.removeEventListener('pointermove',onMove);stage.removeEventListener('pointerleave',onLeave);
  art.removeEventListener('focusin',onFocus);art.removeEventListener('focusout',onBlur);
  window.removeEventListener('resize',rebuild);window.removeEventListener('blur',onLeave);motion.removeEventListener('change',rebuild);
  items.forEach(item=>item.animation.cancel());delete art.dataset.interactive;
 };
}
