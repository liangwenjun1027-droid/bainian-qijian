import {createCombinationChart} from './combination-chart.js';
import {inspect} from './chart-inspector.js';

export function mountCombinations(host){
 host.innerHTML='<div class="combination-viewport"><div class="combination-stage"></div><div id="combination-ripple" aria-hidden="true"><span></span><span></span><span></span></div></div>';
 const viewport=host.firstElementChild,stage=viewport.firstElementChild,ripple=viewport.lastElementChild;
 const fit=()=>{const scale=viewport.clientWidth/3000;stage.style.transform=`scale(${scale})`;viewport.style.height=2200*scale+'px';};
 const observer=new ResizeObserver(fit);observer.observe(viewport);fit();
 const controller=createCombinationChart(stage,window.echarts,ripple);
 const visibility=new MutationObserver(()=>{if(host.closest('[hidden]'))controller.pause();else controller.resume();});
 for(const section of [host.closest('.history-panel'),host.closest('#materials')])if(section)visibility.observe(section,{attributes:true,attributeFilter:['hidden']});
 controller.chart.on('mouseover',params=>{if(params.seriesName)inspect(host,params.seriesName,'食器组合 · '+params.name+' · 强度 '+params.value);});
 controller.chart.on('showTip',params=>{
  if(params.seriesIndex==null||params.dataIndex==null)return;
  const series=controller.chart.getOption().series[params.seriesIndex];
  if(series?.name)inspect(host,series.name,'食器组合 · '+controller.chart.getOption().xAxis[0].data[params.dataIndex]);
 });
 return controller;
}
