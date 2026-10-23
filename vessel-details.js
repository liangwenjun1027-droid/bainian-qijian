import {assetUrl} from './asset-paths.js';
import {mountInspector,inspect} from './chart-inspector.js';
import {VESSEL_GROUPS,FOOD_DATA,PATTERNS,MEANINGS,focusedFood,visiblePatternPoints,selectedItems,availableVesselViews} from './vessel-data.js';
const ns='http://www.w3.org/2000/svg';
function svgNode(tag,attrs={},text){const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;}
let dialog,group,index=-1,view='intro',lastFocus;
function renderFood(root){
 const focus=focusedFood(group,index),svg=svgNode('svg',{viewBox:'0 0 1160 610',role:'img','aria-label':'食物适配广度：本组合相关器类保持原色，其他类别淡化'});
 const title=svgNode('text',{x:580,y:40,'text-anchor':'middle',class:'data-chart-title'},'不同食器的食物适配广度');svg.append(title);
 svg.append(svgNode('text',{x:580,y:75,'text-anchor':'middle',class:'data-chart-sub'},'唐—五代—宋｜适配食物类别数量'));
 svg.append(svgNode('line',{x1:25,y1:530,x2:1135,y2:530,stroke:'#aeb3a4','stroke-width':1}));
 FOOD_DATA.forEach(([name,value,color],i)=>{
  const x=105+i*136,y=530-value*51,relevant=focus.includes(name),g=svgNode('g',{'data-food':name,'data-relevant':String(relevant),opacity:relevant?1:.16});
  g.append(svgNode('path',{d:`M ${x-135} 530 C ${x-40} 525 ${x-15} ${y+100} ${x} ${y} C ${x+15} ${y+100} ${x+40} 525 ${x+135} 530 Z`,fill:color,'fill-opacity':.7}));
  g.append(svgNode('circle',{cx:x,cy:y,r:10,fill:color}));g.append(svgNode('text',{x,y:y-28,'text-anchor':'middle',class:'data-chart-value'},value));
  g.append(svgNode('text',{x,y:570,'text-anchor':'middle',class:'data-chart-label'},name));svg.append(g);
  g.setAttribute('tabindex','0');g.setAttribute('role','button');g.setAttribute('aria-label',name+'：适配类别 '+value);for(const event of ['pointerenter','focus'])g.addEventListener(event,()=>inspect(root,name,'食物适配 · '+value+'类'));
 });root.append(svg);
}
function renderPatterns(root){
 const svg=svgNode('svg',{viewBox:'0 0 1160 740',role:'group','aria-label':'纹样与文化内涵棋盘，仅显示本组相关点'});
 svg.append(svgNode('text',{x:580,y:43,'text-anchor':'middle',class:'data-chart-title'},'食器纹样与文化内涵'));
 svg.append(svgNode('text',{x:580,y:80,'text-anchor':'middle',class:'data-chart-sub'},'唐—五代—宋'));
 const left=200,top=180,dx=143,dy=91;
 PATTERNS.forEach((name,i)=>{const x=left+i*dx;svg.append(svgNode('text',{x,y:140,'text-anchor':'middle',class:'data-chart-label'},name));svg.append(svgNode('line',{x1:x,y1:top,x2:x,y2:top+5*dy,stroke:'#bdc1b4','stroke-width':5}));});
 MEANINGS.forEach((name,i)=>{const y=top+i*dy;svg.append(svgNode('text',{x:left-35,y:y+7,'text-anchor':'end',class:'data-chart-label'},name));svg.append(svgNode('line',{x1:left,y1:y,x2:left+6*dx,y2:y,stroke:'#bdc1b4','stroke-width':5}));});
 const points=visiblePatternPoints(group,index),status=document.createElement('p');status.className='vessel-pattern-status';status.setAttribute('aria-live','polite');
 status.textContent=points.length?'移近或选择棋点，查看对应关系。':'';
 points.forEach(([c,r],i)=>{
  const dot=svgNode('circle',{cx:left+c*dx,cy:top+r*dy,r:22,fill:FOOD_DATA[c][2],stroke:'#fbf7ee','stroke-width':5,tabindex:0,role:'button','aria-label':PATTERNS[c]+'：'+MEANINGS[r],class:'motif-stone',style:`--stone-delay:${i*70}ms`,'data-pattern':PATTERNS[c],'data-meaning':MEANINGS[r]});
  const select=()=>{svg.querySelectorAll('.motif-stone').forEach(n=>n.classList.remove('stone-selected'));dot.classList.add('stone-selected');status.textContent=PATTERNS[c]+' · '+MEANINGS[r];inspect(root,PATTERNS[c],MEANINGS[r]);};
  dot.addEventListener('pointerenter',select);dot.addEventListener('focus',select);dot.addEventListener('click',select);dot.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});svg.append(dot);
 });root.append(svg,status);

}
function render(){
 const available=availableVesselViews(group,index);if(!available.includes(view))view='intro';
 dialog.querySelector('#vessel-title').textContent=group.title;
 const tabs=[...dialog.querySelectorAll('[data-view]')];tabs.forEach(tab=>{tab.hidden=!available.includes(tab.dataset.view);const selected=tab.dataset.view===view;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
 const picks=dialog.querySelector('.vessel-picks');picks.replaceChildren();
 ['整组',...group.items.map(i=>i.name)].forEach((name,i)=>{const button=document.createElement('button');button.type='button';button.textContent=name;button.setAttribute('aria-pressed',String(index===i-1));button.onclick=()=>{index=i-1;render();dialog.querySelectorAll('.vessel-picks button')[i].focus({preventScroll:true});};picks.append(button);});
 const panel=dialog.querySelector('.vessel-content');panel.replaceChildren();panel.setAttribute('aria-labelledby','vessel-tab-'+view);
 if(view==='intro'){
  if(index<0){
   const image=document.createElement('img');image.src=assetUrl(group.asset);image.alt=group.title+'组合示意';image.className='vessel-intro-illustration';panel.append(image);
   mountInspector(panel,group.title);
  }else{
   const item=group.items[index],layout=document.createElement('div');layout.className='vessel-single-detail';
   const image=document.createElement('img');image.src=assetUrl(item.photo);image.alt=item.name+'实物图';
   const copy=document.createElement('aside');copy.className='vessel-single-copy';
   const title=document.createElement('h3'),description=document.createElement('p');title.textContent=item.name;description.textContent=item.description;copy.append(title,description);
   layout.append(image,copy);panel.append(layout);
  }
 }else{
  const chart=document.createElement('div');chart.className='vessel-chart-scroll';if(view==='food')renderFood(chart);else renderPatterns(chart);panel.append(chart);mountInspector(panel,view==='food'?(focusedFood(group,index)[0]):selectedItems(group,index).flatMap(item=>item.patterns)[0]);
 }
}
export function openVesselDetails(assetId){
 group=VESSEL_GROUPS.find(g=>g.asset===assetId);if(!group)return;index=-1;view='intro';lastFocus=document.activeElement;
 if(!dialog){
  dialog=document.createElement('dialog');dialog.className='painting-dialog vessel-dialog';dialog.setAttribute('aria-labelledby','vessel-title');
  dialog.innerHTML=`<header class="vessel-header"><div><h2 id="vessel-title"></h2></div><div class="vessel-header-actions"><div class="vessel-tabs" role="tablist" aria-label="器物阅读分类"><button type="button" role="tab" id="vessel-tab-intro" data-view="intro" aria-controls="vessel-content">来源介绍</button><button type="button" role="tab" id="vessel-tab-food" data-view="food" aria-controls="vessel-content">食物适配</button><button type="button" role="tab" id="vessel-tab-pattern" data-view="pattern" aria-controls="vessel-content">纹样内涵</button></div><button class="vessel-close" aria-label="关闭器物介绍">关闭 ×</button></div></header><div class="vessel-picks" role="group" aria-label="筛选组合中的器物"></div><div id="vessel-content" class="vessel-content" role="tabpanel"></div>`;
  document.body.append(dialog);
  const chooseView=tab=>{view=tab.dataset.view;render();tab.focus({preventScroll:true});};
  dialog.querySelectorAll('[data-view]').forEach((tab,i)=>{tab.onclick=()=>chooseView(tab);tab.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const tabs=[...dialog.querySelectorAll('[data-view]')].filter(tab=>!tab.hidden),current=tabs.indexOf(e.currentTarget);chooseView(tabs[(current+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length]);}};});
  dialog.querySelector('.vessel-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{document.body.classList.remove('painting-open');lastFocus?.focus({preventScroll:true});});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 }
 render();document.body.classList.add('painting-open');dialog.showModal();
}
