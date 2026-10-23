import {mountInspector} from './chart-inspector.js';
import {mountAesthetic} from './aesthetic-chapter.js';
import {mountCombinations} from './combination-chapter.js';

export function mountHistoryViews(){
 const tabs=[...document.querySelectorAll('.history-tabs [role="tab"]')];
 const section=document.querySelector('#materials'),selector=section.querySelector('.history-tabs'),back=section.querySelector('.return-link');
 const panels=[...section.querySelectorAll('.history-panel')];
 panels.forEach(panel=>{const stage=document.createElement('div');stage.className='history-fit-stage';stage.append(...panel.childNodes);panel.append(stage);const combination=panel.id.includes('combinations');mountInspector(stage,combination?'碗＋箸':panel.id.includes('aesthetic')?'自然仿生':'瓷器',{photos:!combination});});
 const number=value=>parseFloat(value)||0;
 const fit=()=>{
  if(section.hidden)return;
  const sectionStyle=getComputedStyle(section),tabsStyle=getComputedStyle(selector),backStyle=getComputedStyle(back);
  const available=Math.max(40,section.clientHeight-number(sectionStyle.paddingTop)-number(sectionStyle.paddingBottom)-selector.offsetHeight-number(tabsStyle.marginBottom)-number(tabsStyle.marginTop)-back.offsetHeight-number(backStyle.marginTop)-number(backStyle.marginBottom)-8);
  panels.filter(panel=>!panel.hidden).forEach(panel=>{
   const stage=panel.firstElementChild,height=stage.offsetHeight;if(!height)return;
   const scale=Math.min(1,available/height);stage.style.transform=`scale(${scale})`;panel.style.height=height*scale+'px';
  });
 };
 const observer=new ResizeObserver(fit);observer.observe(section);panels.forEach(panel=>observer.observe(panel.firstElementChild));
 window.addEventListener('resize',fit);
 let aestheticReady=false,combinations;
 const choose=tab=>{
  if(tab.getAttribute('aria-selected')==='true')return;
  tabs.forEach(button=>{
   const selected=button===tab,panel=document.getElementById(button.getAttribute('aria-controls'));
   button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;panel.hidden=!selected;
  });
  if(tab.id==='history-tab-aesthetic'&&!aestheticReady){mountAesthetic(document.querySelector('#aestheticChart'));aestheticReady=true;}
  if(tab.id==='history-tab-combinations'){
   if(!combinations)combinations=mountCombinations(document.querySelector('#combinationsChart'));
   else combinations.resume();
  }else combinations?.pause();
  fit();
  const panel=document.getElementById(tab.getAttribute('aria-controls'));
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)panel.animate([{opacity:0,translate:'0 8px'},{opacity:1,translate:'0 0'}],{duration:300,easing:'ease-out'});
 };
 tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>choose(tab));
  tab.addEventListener('keydown',event=>{
   const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:['ArrowLeft','ArrowRight'].includes(event.key)?(index+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length:null;
   if(next===null)return;event.preventDefault();choose(tabs[next]);tabs[next].focus({preventScroll:true});
  });
 });
 fit();
}
