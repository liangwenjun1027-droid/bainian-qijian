import {mountInspector,inspect} from './chart-inspector.js';
import {createChart as createFood} from './handoff-food.js';
import {createChart as createForeign} from './handoff-foreign.js';

export function mountHandoffChart(host,type){
 const food=type==='food',width=food?1600:3000,height=food?1100:2200;
 host.innerHTML=`<div class="handoff-chart-viewport"><div class="handoff-chart-stage" role="group" aria-label="${food?'食与食器：饮食关系桑基图':'外来影响：器型影响雷达图'}"></div></div>`;
 const viewport=host.firstElementChild,canvas=viewport.firstElementChild;mountInspector(host,food?'主食':(host.closest('dialog')?.querySelector('.painting-period')?.textContent||'唐'));
 Object.assign(canvas.style,{width:width+'px',height:height+'px'});
 const fit=()=>{const scale=viewport.clientWidth/width;canvas.style.transform=`scale(${scale})`;viewport.style.height=height*scale+'px';};
 const observer=new ResizeObserver(fit);observer.observe(viewport);fit();
 let chart,disposed=false;
 document.fonts.ready.then(()=>{
  if(disposed)return;
  try{chart=(food?createFood:createForeign)(canvas,window.echarts);chart.on('mouseover',params=>{const key=food?(params.dataType==='edge'?params.data.source.split('_').slice(1).join('_'):params.data.displayName):params.name;if(key)inspect(canvas,key,food?'食物与食器对应关系':'外来器型本土化影响强度');});chart.on('highlight',params=>{if(!food){const index=params.seriesIndex??params.batch?.[0]?.seriesIndex,name=params.seriesName??chart.getOption().series[index]?.name;if(name)inspect(canvas,name,'时期对照');}});}
  catch(error){canvas.replaceChildren();const message=document.createElement('p');message.className='handoff-error';message.textContent='图表暂未载入，请关闭后重试。';canvas.append(message);console.error(error);}
 });
 return ()=>{disposed=true;observer.disconnect();chart?.dispose();host.replaceChildren();};
}
