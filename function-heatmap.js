import {mountInspector,inspect} from './chart-inspector.js';
// Values transcribed from the supplied function differentiation reference.
export const functionColors={3:'#ce6557',5:'#89c2ab',7:'#d5ad72',9:'#eab4a7'};
export const functionColumns=['初唐','盛唐','中唐','晚唐','五代','北宋前期','北宋中后期','南宋前期','南宋后期'];
export const functionRows=[
 ['主食器',[7,7,7,7,7,9,9,9,9]],
 ['菜肴器',[7,7,7,7,7,9,9,9,9]],
 ['羹汤器',[7,7,7,7,7,7,7,7,7]],
 ['果点器',[5,7,7,7,7,7,9,9,9]],
 ['调味器',[3,3,5,5,5,7,7,7,7]],
 ['饮酒器',[9,9,9,9,9,9,9,9,9]],
 ['温酒／盛酒器',[5,7,7,9,9,9,9,7,7]],
 ['饮茶器',[5,7,7,7,7,9,9,9,9]],
 ['礼仪食器',[3,3,3,5,5,7,9,9,9]]
];
export const columnPeriod=index=>index<4?'唐':index===4?'五代':'宋';
export const cellOpacity=(value,column,period,hover)=>hover!==null?(value===hover?1:.13):(columnPeriod(column)===period?1:.18);

export function mountFunctionHeatmap(host,period){
 const labels={3:'少量',5:'较常见',7:'流行',9:'高度流行'};
 host.innerHTML=`<div class="function-heading"><h3>唐—五代—宋食器功能分化</h3><p>当前观览 · ${period}　<span>移至色块，比较同一流行程度</span></p></div>
 <div class="function-legend" aria-label="流行程度">${[3,5,7,9].map(value=>`<button type="button" data-level="${value}" aria-label="突出${value} ${labels[value]}"><i style="background:${functionColors[value]}"></i><span>${value} ${labels[value]}</span></button>`).join('')}</div>
 <div class="function-chart-scroll"><div class="function-grid" role="table" aria-label="唐五代宋食器功能分化，当前朝代${period}">
 <div class="function-grid-row function-columns" role="row"><span role="columnheader"></span>${functionColumns.map((name,i)=>`<span role="columnheader" class="${columnPeriod(i)===period?'current-period':''}">${name}</span>`).join('')}</div>
 ${functionRows.map(([name,values],row)=>`<div class="function-grid-row" role="row"><span class="function-row-name" role="rowheader">${name}</span>${values.map((value,column)=>`<div class="function-cell" role="cell"><button type="button" data-level="${value}" data-column="${column}" data-row="${row}" aria-label="${name}，${functionColumns[column]}：${value} ${labels[value]}" style="background:${functionColors[value]};opacity:${cellOpacity(value,column,period,null)}"><span class="function-cell-value">${value}</span></button></div>`).join('')}</div>`).join('')}</div></div>
 <p class="function-footnote">3 少量 · 5 较常见 · 7 流行 · 9 高度流行</p>`;
 mountInspector(host,'主食器');
 const cells=[...host.querySelectorAll('.function-cell button')],animations=[];
 let hovered=null,focused=null;
 const paint=()=>{const level=hovered??focused;cells.forEach(cell=>{cell.style.opacity=cellOpacity(Number(cell.dataset.level),Number(cell.dataset.column),period,level);});host.querySelectorAll('.function-legend button').forEach(button=>{button.classList.toggle('level-active',Number(button.dataset.level)===level);button.classList.toggle('level-muted',level!==null&&Number(button.dataset.level)!==level);});};
 const finishIntro=()=>animations.forEach(animation=>animation.cancel());
 let order=0;
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  cells.filter(cell=>columnPeriod(Number(cell.dataset.column))===period).forEach(cell=>{
   animations.push(cell.animate([{opacity:0},{opacity:1}],{duration:420,delay:order++*32,fill:'backwards',easing:'ease-out'}));
  });
 }
 host.querySelectorAll('button[data-level]').forEach(button=>{
  button.addEventListener('pointerenter',()=>{if(button.dataset.row!==undefined)inspect(button,functionRows[Number(button.dataset.row)][0],functionColumns[Number(button.dataset.column)]+' · '+button.dataset.level+' '+labels[button.dataset.level]);finishIntro();hovered=Number(button.dataset.level);paint();});
  button.addEventListener('pointerleave',()=>{hovered=null;paint();});
  button.addEventListener('focus',()=>{if(button.matches(':focus-visible')){finishIntro();focused=Number(button.dataset.level);paint();}});
  button.addEventListener('blur',()=>{focused=null;paint();});
 });
 return ()=>{finishIntro();host.replaceChildren();};
}
