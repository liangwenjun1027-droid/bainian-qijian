import {assetUrl} from './asset-paths.js';
import {VESSEL_GROUPS} from './vessel-data.js';
import {INSPECTION_CONTENT} from './inspection-content.js';
import {FOOD_PHOTOS} from './food-photos.js';
const all=VESSEL_GROUPS.flatMap(group=>group.items);
const aliases={'主食器':'主食','菜肴器':'菜肴','羹汤器':'羹汤','果点器':'果点','调味器':'调味','饮酒器':'酒','温酒／盛酒器':'酒','饮茶器':'茶','礼仪食器':'饮品'};
const shapeKinds={'多曲轮廓':['盘','碗'],'金属器仿制特征':['杯'],'莲瓣造型':['碗','盘'],'曲瓣口沿':['碗','盘','碟'],'长杯形':['杯'],'棱腹结构':['碗'],'高足结构':['杯']};
export function inspectionEntry(key,context=''){
 key=aliases[key]||key;
 const group=VESSEL_GROUPS.find(group=>group.title===key);
 if(group)return {title:key,text:group.lead,sourceTitle:'器物实物',context,photos:group.items.map(item=>({src:assetUrl(item.photo),name:item.name,caption:'器物实物'}))};
 const exact=all.find(item=>item.name===key);
 let items=exact?[exact]:all.filter(item=>item.category===key||item.patterns.includes(key));
 if(shapeKinds[key])items=all.filter(item=>shapeKinds[key].includes(item.category));
 if(!exact&&/唐|五代|宋/.test(key))items=all.filter(item=>item.name.includes(key.includes('唐')?'唐':key.includes('五代')?'五代':'宋'));
 if(key==='金银器')items=all.filter(item=>item.name.includes('银酒杯'));
 if(key==='瓷器')items=all.filter(item=>/窑|瓷/.test(item.name));
 if(key==='铜器')items=all.filter(item=>item.name.includes('铜圆筷'));
 if(['自然仿生','多曲轮廓','规整精致'].includes(key))items=all.filter(item=>/葵|菊|菱/.test(item.name));
 if(['清雅简约','含蓄素雅','仿古复古'].includes(key))items=all.filter(item=>/宋|白玉/.test(item.name));
 if(['饱满厚重','华丽繁复','域外风格'].includes(key))items=all.slice(0,7);
 const combinations={
  '碗＋箸':item=>item.category==='碗'||/筷/.test(item.name),
  '碗＋匙':item=>item.category==='碗'||/勺/.test(item.name),
  '盘＋碟':item=>['盘','碟'].includes(item.category),
  '杯/盏＋壶':item=>item.category==='杯'||/壶/.test(item.name),
  '盏＋盏托':item=>item.category==='杯',
  '注子＋温碗':item=>/景德镇.*注壶/.test(item.name),
  '多盘＋多碟＋碗':item=>['碗','盘','碟'].includes(item.category),
  '茶盏＋茶瓶等':item=>/壶|高足杯/.test(item.name),
  '仿古礼器组合':item=>/宋/.test(item.name)
 };
 if(combinations[key])items=all.filter(combinations[key]);
 let entry=INSPECTION_CONTENT[key];
 const photos=[];
 if(['盏＋盏托','茶盏＋茶瓶等'].includes(key)&&FOOD_PHOTOS['茶'])photos.push({...FOOD_PHOTOS['茶'],name:'茶'});
 if(entry?.kind==='food'){
  for(const name of entry.photoKeys||[key])if(FOOD_PHOTOS[name])photos.push({...FOOD_PHOTOS[name],name});
 }
 for(const item of items)if(item.photo)photos.push({src:assetUrl(item.photo),name:item.name,caption:'器物实物'});
 if(!entry&&exact)entry={title:key,text:exact.description,sourceTitle:'器物实物'};
 if(!entry&&shapeKinds[key])entry={title:key,text:'口沿、器腹与足部结构共同构成器物的外形。起伏的曲线、分瓣的轮廓与不同高度的足部，呈现造型在各时期的延续与变化。',sourceTitle:'器形对照'};
 if(!entry)entry={title:key,text:/唐|五代|宋/.test(key)?'这一时期的器物通过器口、腹部及足部的变化，呈现多样的承盛与饮用方式。釉色、材质和装饰工艺，共同塑造了宴饮器用的面貌。':'器形、盛置方式与使用动作相互配合。不同深浅的器腹、开阔或收束的口沿，以及手持、夹取和舀取等动作，共同构成席间的器用关系。',sourceTitle:'器物形制'};
 if(!photos.length){
  const names=key==='木器'?['木器']:key==='漆器'?['漆器']:key==='普通陶器'?['普通陶器']:[];
  for(const name of names)if(FOOD_PHOTOS[name])photos.push({...FOOD_PHOTOS[name],name});
 }
 if(!photos.length&&entry.kind==='food'){
  const fallback=FOOD_PHOTOS['米饭'];if(fallback)photos.push({...fallback,name:'谷物食物示意',caption:'谷物食物'});
 }
 if(!photos.length)for(const item of all.slice(0,3))photos.push({src:assetUrl(item.photo),name:item.name,caption:'器物实物'});
 return {...entry,key,context,photos};
}
export function inspect(host,key,context=''){
 host.dispatchEvent(new CustomEvent('chart-inspect',{bubbles:true,composed:true,detail:{key,context}}));
}
export function mountInspector(host,defaultKey,{photos=true}={}){
 const layout=document.createElement('div');layout.className='inspector-layout';
 const plot=document.createElement('div');plot.className='inspector-plot';plot.append(...host.childNodes);
 const aside=document.createElement('aside');aside.className='chart-inspector';aside.setAttribute('aria-label','对应图文介绍');
 aside.innerHTML='<div class="inspector-gallery" tabindex="0" aria-label="图片，可在此滚动查看"></div><div class="inspector-copy" aria-live="polite"><h3></h3><p class="inspector-context"></p><p class="inspector-description"></p><a class="inspector-source" target="_blank" rel="noopener"></a></div>';
 if(!photos){aside.querySelector('.inspector-gallery').remove();aside.classList.add('combination-copy-only');}
 layout.append(plot,aside);host.append(layout);let previous='',previousKey='';
 const update=(key,context='')=>{
  const token=key+'|'+context;if(token===previous)return;previous=token;
  const entry=inspectionEntry(key,context),gallery=aside.querySelector('.inspector-gallery');if(gallery&&key!==previousKey){gallery.replaceChildren();gallery.scrollTop=0;
  for(const photo of entry.photos){const figure=document.createElement('figure'),image=document.createElement('img'),caption=document.createElement('figcaption');image.src=photo.src;image.alt=photo.name;image.loading='lazy';caption.textContent=photo.name+' · '+photo.caption;figure.append(image,caption);if(photo.url){const a=document.createElement('a');a.href=photo.url;a.target='_blank';a.rel='noopener';a.textContent='图片来源 ↗';figure.append(a);}gallery.append(figure);}previousKey=key;}
  aside.querySelector('h3').textContent=entry.title;aside.querySelector('.inspector-context').textContent=context;
  aside.querySelector('.inspector-description').textContent=entry.text;
  const source=aside.querySelector('.inspector-source');source.textContent=entry.sourceTitle+(entry.source?' ↗':'');source.hidden=!entry.source;if(entry.source)source.href=entry.source;
 };
 layout.addEventListener('chart-inspect',event=>update(event.detail.key,event.detail.context));
 update(defaultKey);return {plot,update,aside};
}
