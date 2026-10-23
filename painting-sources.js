import {assetUrl} from './asset-paths.js';
import {mountHandoffChart} from './handoff-charts.js';
import {mountFunctionHeatmap} from './function-heatmap.js';
import {ORIGINAL_ASSETS,RIGHT_ORIGINAL_ASSETS,MIDDLE_ORIGINAL_ASSET} from './painting-config.js';
let works=[
 {title:'十八学士图',long:true,version:'旧传刘松年 · 手卷',source:'国立故宫博物院',url:'https://digitalarchive.npm.gov.tw/Collection/Detail/14410?dep=P',description:'以十八学士雅集为题，展开文人会聚、观赏与交流的场景。馆藏著录为“宋刘松年十八学士图”，作者归属沿用旧传。',note:'手卷较长，可切换细节模式，左右滚动观看。'},
 {title:'唐人宫乐图',version:'唐 · 佚名 · 绢本设色',source:'国立故宫博物院',url:'https://theme.npm.edu.tw/selection/Article.aspx?sNo=04000957',description:'宫中女子围坐方桌，奏乐、品茗与宴饮共同构成画面。作品没有作者款印，馆方结合人物发式、服饰、家具与乐器形制，将其定名为“唐人宫乐图”。',note:'绢本设色，纵48.7厘米、横69.5厘米。'}
];
const leftWorks=works;
const rightWorks=[
 {title:'文会图',long:false,version:'北宋 · 宋徽宗画院 · 绢本',source:'国立故宫博物院',url:'https://digitalarchive.npm.gov.tw/Collection/Detail/50?dep=P',description:'庭院大案旁，文士围坐，侍者往来。案上器皿与席间陈设呈现文人宴集的图像线索。馆方指出，此为徽宗指导下的画院作品，并非徽宗亲笔。',note:'本幅纵184.4厘米，横123.9厘米。'},
 {title:'清明上河图',long:true,version:'北宋 · 张择端 · 绢本淡设色',source:'故宫博物院',url:'https://www.dpm.org.cn/collection/paint/228226.html',description:'长卷描绘汴京城郊、汴河两岸与城内的往来生活。店铺、舟车与人物活动，为观察城市饮食及日常器用提供图像线索。',note:'张择端本全卷；图像为 Wikimedia Commons 公共领域复制图。长卷可横向滚动。',imageSource:'https://commons.wikimedia.org/wiki/File:Alongtheriver_QingMing.jpg'}
];
const middleWorks=[{title:'韩熙载夜宴图',long:true,version:'五代 · 顾闳中（传）· 宋摹本',source:'故宫博物院',url:'https://www.dpm.org.cn/collection/paint/228200.html',description:'画卷描绘韩熙载家中夜宴的场景，宾客、乐舞与侍者穿插其间。案几上的饮食器与人物动作相互呼应，可作为观察五代宴饮图像的线索。馆方将现存卷著录为宋代摹本。',note:'绢本设色，纵28.7厘米、横335.5厘米。可横向滚动观看全卷。'}];
const periods={left:'唐',middle:'五代',right:'宋'};
let currentAssets=ORIGINAL_ASSETS;
let dialog,lastFocus,disposeHeatmap;
function showOriginal(){
 disposeHeatmap?.();disposeHeatmap=null;
 dialog.querySelector('.function-view').hidden=true;
 dialog.querySelector('.painting-tabs').hidden=false;
 dialog.querySelector('.painting-panel').hidden=false;
 dialog.querySelector('.analysis-dock').hidden=false;
 dialog.querySelectorAll('.function-open').forEach(button=>button.setAttribute('aria-pressed','false'));
 dialog.querySelector('.painting-period-heading>span').textContent='画中一席';
}
export function openPaintingSources(group='left'){
 works=group==='middle'?middleWorks:group==='right'?rightWorks:leftWorks;currentAssets=group==='middle'?[MIDDLE_ORIGINAL_ASSET]:group==='right'?RIGHT_ORIGINAL_ASSETS:ORIGINAL_ASSETS;
 if(!dialog){
  dialog=document.createElement('dialog');dialog.className='painting-dialog';dialog.setAttribute('aria-label','原画与来源介绍');
  dialog.innerHTML=`<header class="painting-header"><div><p>宴饮主题</p><div class="painting-period-heading"><h2 class="painting-period">唐</h2><span>画中一席</span></div></div><button class="painting-close" aria-label="关闭原画介绍">关闭 ×</button></header><div class="painting-tabs" role="tablist" aria-label="选择原画"><button type="button" role="tab" id="work-tab-0" aria-controls="painting-panel">十八学士图</button><button type="button" role="tab" id="work-tab-1" aria-controls="painting-panel">唐人宫乐图</button></div><div id="painting-panel" class="painting-panel" role="tabpanel"><div class="painting-view"><div class="painting-tools"><span>原画全图</span><button class="painting-zoom" type="button" aria-pressed="false">放大看细节</button><a class="painting-original" target="_blank" rel="noopener">新窗口查看原图 ↗</a></div><div class="painting-image-frame"><img class="painting-image" alt=""></div></div><aside class="painting-copy"><h3></h3><p class="painting-version"></p><p class="painting-description"></p><p class="painting-note"></p><div class="painting-credit"><span class="image-credit">图像文件：本地原画资料</span><a class="image-credit-link" target="_blank" rel="noopener" hidden>查看图像出处 ↗</a><span class="painting-institution"></span><a class="painting-source" target="_blank" rel="noopener">查看馆方介绍 ↗</a></div></aside></div>`;
  dialog.innerHTML+=`<footer class="analysis-dock"><div id="analysis-categories" class="analysis-categories"><p>循器而观</p><ul>${[['功能分化','function'],['食与食器','food'],['外来影响','foreign']].map(([name,key])=>`<li><button class="function-open" type="button" data-analysis="${key}"><span class="analysis-symbol" aria-hidden="true"><img src="./analysis-${key}.svg" alt="" width="84" height="72"></span><span class="analysis-label">${name}</span></button></li>`).join('')}</ul></div></footer>`;
  dialog.insertAdjacentHTML('beforeend','<section class="function-view" hidden><button class="function-back" type="button">← 返回原画</button><div class="function-chart-host"></div></section>');
  dialog.append(dialog.querySelector('.analysis-dock'));
  document.body.append(dialog);
  dialog.querySelectorAll('.function-open').forEach(button=>button.onclick=()=>{
   dialog.querySelectorAll('.function-open').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
   dialog.querySelector('.painting-tabs').hidden=true;
   dialog.querySelector('.painting-panel').hidden=true;
   dialog.querySelector('.analysis-dock').hidden=false;
   dialog.querySelector('.function-view').hidden=false;
   dialog.querySelector('.painting-period-heading>span').textContent=button.querySelector('.analysis-label').textContent;
   disposeHeatmap?.();const host=dialog.querySelector('.function-chart-host');disposeHeatmap=button.dataset.analysis==='function'?mountFunctionHeatmap(host,dialog.querySelector('.painting-period').textContent):mountHandoffChart(host,button.dataset.analysis);
   dialog.querySelector('.function-back').focus({preventScroll:true});dialog.scrollTop=0;
  });
  dialog.querySelector('.function-back').onclick=()=>{showOriginal();dialog.querySelector('.function-open').focus({preventScroll:true});};
  const select=index=>{
   const work=works[index],src=assetUrl(currentAssets[index]);
   dialog.querySelectorAll('[role=tab]').forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
   dialog.querySelector('[role=tabpanel]').setAttribute('aria-labelledby','work-tab-'+index);
   const image=dialog.querySelector('.painting-image');image.src=src;image.alt=work.title+'原画全图';
   dialog.querySelector('.painting-original').href=src;
   dialog.querySelector('h3').textContent=work.title;
   for(const [selector,key] of [['.painting-version','version'],['.painting-description','description'],['.painting-note','note']])dialog.querySelector(selector).textContent=work[key];
   dialog.querySelector('.painting-institution').textContent='馆藏与说明来源：'+work.source;
   dialog.querySelector('.painting-source').href=work.url;
   dialog.querySelector('.image-credit').textContent=work.imageSource?'图像：Wikimedia Commons，公共领域':'图像：本地原画资料';const credit=dialog.querySelector('.image-credit-link');credit.hidden=!work.imageSource;if(work.imageSource)credit.href=work.imageSource;
   const frame=dialog.querySelector('.painting-image-frame');frame.classList.toggle('detail',!!work.long);
   dialog.querySelector('.painting-zoom').setAttribute('aria-pressed',String(!!work.long));dialog.querySelector('.painting-zoom').textContent=!!work.long?'适应全图':'放大看细节';
   frame.scrollLeft=0;image.decode().then(()=>{if(image.getAttribute('src')===src&&!!work.long&&frame.classList.contains('detail'))frame.scrollLeft=Math.round(image.clientWidth*.15);}).catch(()=>{});
  };
  dialog.querySelector('.painting-zoom').onclick=e=>{const detail=dialog.querySelector('.painting-image-frame').classList.toggle('detail');e.currentTarget.setAttribute('aria-pressed',String(detail));e.currentTarget.textContent=detail?'适应全图':'放大看细节';};
  dialog.querySelector('.painting-close').onclick=()=>dialog.close();
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{disposeHeatmap?.();disposeHeatmap=null;document.body.classList.remove('painting-open');lastFocus?.focus({preventScroll:true});});
  dialog.selectWork=select;
 }
 showOriginal();
 dialog.querySelector('.painting-period').textContent=periods[group]||'唐';
 dialog.querySelector('.painting-tabs').innerHTML=works.map((work,i)=>`<button type="button" role="tab" id="work-tab-${i}" aria-controls="painting-panel">${work.title}</button>`).join('');
 dialog.querySelectorAll('[role=tab]').forEach((tab,i)=>{tab.onclick=()=>dialog.selectWork(i);tab.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const next=(i+(e.key==='ArrowRight'?1:works.length-1))%works.length;dialog.selectWork(next);dialog.querySelectorAll('[role=tab]')[next].focus();}};});lastFocus=document.activeElement;dialog.selectWork(0);document.body.classList.add('painting-open');dialog.showModal();
}
