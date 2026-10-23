import {assetUrl} from './asset-paths.js';
import {mountHistoryViews} from './history-views.js';
import {compositionBounds} from './composition-bounds.js';
import {bindChapterTransition} from './chapter-transition.js';
import './music-player.js';
import {openArtworkDetails} from './artwork-details.js';
import {INTRO_PAGE_ID} from './intro-config.js';
import {MAIN_PAGE_ID,bindPreviewInteraction} from './preview-interaction.js';
import {mountMaterials} from './material-chapter.js';

const intro=document.querySelector('#intro'),introArt=document.querySelector('#introArt');
const introStatus=document.querySelector('#introStatus'),progress=document.querySelector('#introProgress'),enter=document.querySelector('#enterScroll');
let introPrepared=false;
function fitIntro(){const frame=document.querySelector('#introFrame'),scale=Math.min(frame.clientWidth/1920,frame.clientHeight/1080);introArt.style.transform=`translate(${(frame.clientWidth-1920*scale)/2}px,${(frame.clientHeight-1080*scale)/2}px) scale(${scale})`;}
new ResizeObserver(fitIntro).observe(document.querySelector('#introFrame'));
enter.addEventListener('click',()=>{intro.classList.add('is-leaving');document.body.classList.remove('intro-open');document.querySelectorAll('main,.chapter-nav').forEach(n=>n.inert=false);const finish=()=>{intro.hidden=true;document.querySelector('.chapter-nav a').focus({preventScroll:true});};if(matchMedia('(prefers-reduced-motion: reduce)').matches)finish();else setTimeout(finish,650);});
async function prepareIntro(project){
 if(introPrepared)return;introPrepared=true;
 const cover=project.pages.find(p=>p.id===INTRO_PAGE_ID);
 if(cover)for(const layer of cover.layers){if(layer.hidden)continue;const image=document.createElement('img');image.src=assetUrl(layer.assetId);image.alt=layer.name;if(/^百年器间-开场-[百年器间]$/.test(layer.name)){image.className='intro-letter';image.style.setProperty('--letter-index','百年器间'.indexOf(layer.name.at(-1)));}Object.assign(image.style,{left:layer.x+'px',top:layer.y+'px',width:layer.width+'px',height:layer.height+'px',transform:`rotate(${layer.rotation||0}deg)`});introArt.append(image);}
 fitIntro();
 const images=[...introArt.querySelectorAll('img'),...art.querySelectorAll('img')];let loaded=0;
 try{await Promise.all(images.map(image=>image.decode().then(()=>{progress.value=Math.round(++loaded/images.length*100);})));await document.fonts.ready;introStatus.textContent='';introStatus.hidden=true;intro.classList.add('is-ready');progress.hidden=true;enter.hidden=false;}
 catch{introStatus.textContent='部分图片未能载入，请刷新页面重试';}
}
const stage=document.querySelector('#heroStage');
const frame=document.querySelector('#artFrame');
const art=document.querySelector('#previewArt');
const status=document.querySelector('#loadStatus');
let disposeInteraction=()=>{},page=null,bounds=null,version='',loadNumber=0;
const fitArt=()=>{
 if(page&&bounds){const scale=frame.clientWidth/bounds.width;art.style.transform=`translate(${-bounds.left*scale}px,${-bounds.top*scale}px) scale(${scale})`;}
};
new ResizeObserver(fitArt).observe(frame);

async function refreshComposition(){
 const request=++loadNumber;
 try{
  const response=await fetch(new URL('./scene.json',import.meta.url));
  if(!response.ok)throw new Error('读取项目失败');
  const project=await response.json();
  if(request!==loadNumber)return;
  const next=project.pages.find(p=>p.id===MAIN_PAGE_ID);
  if(!next)throw new Error('展示内容未能载入');
  const nextVersion=`${project.epoch}:${next.revision}`;
  if(version===nextVersion)return;
  disposeInteraction();page=next;version=nextVersion;
  art.replaceChildren();
  art.style.width=page.width+'px';art.style.height=page.height+'px';
  // Paper extends continuously beneath both chapters; the saved background layer remains intact in the editor.
  const paperAsset='83e90478-79ba-4e9c-af37-cefa180203f6';
  bounds=compositionBounds(page,[paperAsset]);
  frame.style.aspectRatio=`${bounds.width}/${bounds.height}`;
  frame.style.setProperty('--composition-ratio',bounds.width/bounds.height);
  for(const layer of page.layers){
   if(layer.hidden||layer.assetId===paperAsset)continue;
   const node=document.createElement('div');node.className='canvas-element';node.dataset.id=layer.id;
   node.setAttribute('aria-label',layer.name);
   Object.assign(node.style,{left:layer.x+'px',top:layer.y+'px',width:layer.width+'px',height:layer.height+'px',transform:`rotate(${layer.rotation||0}deg)`});
   const image=document.createElement('img');image.src=assetUrl(layer.assetId);image.alt=layer.name;image.draggable=false;
   node.append(image);art.append(node);
  }
  fitArt();disposeInteraction=bindPreviewInteraction({page,art,stage,onArtworkOpen:openArtworkDetails});status.hidden=true;prepareIntro(project);
 }catch(error){
  if(request!==loadNumber)return;
  status.textContent=error.message+'，请刷新页面重试。';status.hidden=false;introStatus.textContent=error.message+'，请刷新重试';
 }
}

mountMaterials(document.querySelector('#materialsChart'));
mountHistoryViews();
refreshComposition();



bindChapterTransition(()=>page);
