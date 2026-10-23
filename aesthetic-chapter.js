import {inspect} from './chart-inspector.js';
// Native SVG interaction retained from the supplied aesthetic migration handoff.
export function mountAesthetic(host){
 const root=host.shadowRoot||host.attachShadow({mode:"open"});
 root.innerHTML="<style>:host{display:block;width:100%}svg{display:block;width:100%;height:100%;font-family:\"长卷明朝\",\"Huiwen-mincho\",\"汇文明朝体\",serif;color:#30251e}.ribbon{transition:opacity .18s;cursor:pointer;outline:none}.ribbon:focus-visible .hit{stroke:#70533d;stroke-width:2}svg.active .ribbon{opacity:.12}svg.active .ribbon.chosen{opacity:1}.hit{fill:transparent;pointer-events:all}.grid{stroke:#9a8e82;stroke-opacity:.3;stroke-dasharray:10 9;stroke-width:1}text{fill:currentColor}svg{height:auto;aspect-ratio:1536/1024}</style><svg viewBox=\"0 0 1536 1024\" role=\"group\" aria-label=\"唐五代宋食器审美特征迁移图，悬停或聚焦某一色带可单独突出显示\"><text x=\"768\" y=\"65\" text-anchor=\"middle\" font-size=\"48\" font-weight=\"bold\">唐—五代—宋食器审美特征迁移图</text><g id=\"grid\"></g><g id=\"bands\"></g><g id=\"labels\"></g><g id=\"timeline\"></g></svg>";

const ns='http://www.w3.org/2000/svg',svg=root.querySelector('svg'),xs=[150,183,334,476,625,769,913,1057,1201,1343,1485];
// Contours visually reconstructed from the supplied image; no numerical source data was supplied.
const rows=[
['饱满厚重','#CE6557',[198,190,137,167,198,222,237,277,305,309,317],[235,240,214,236,252,286,290,310,340,339,343],220],
['华丽繁复','#EAB4A7',[238,243,217,239,255,289,293,313,343,342,346],[312,320,312,328,331,354,351,377,378,376,378],305],
['域外风格','#D5AD72',[365,355,315,332,335,358,355,381,382,380,382],[410,421,438,441,416,393,389,381,392,414,401],391],
['自然仿生','#A7B58D',[480,480,442,445,420,397,393,385,396,418,405],[505,510,511,530,510,478,470,473,463,470,473],490],
['规整精致','#789FA1',[557,550,515,534,514,482,474,477,467,474,477],[580,592,595,598,568,560,558,543,566,561,543],575],
['清雅简约','#89C2AB',[656,655,641,640,620,577,566,565,570,562,547],[668,671,681,682,667,641,633,620,609,620,611],667],
['含蓄素雅','#A98B75',[735,733,723,708,671,645,637,624,613,624,615],[749,752,754,751,750,732,711,712,708,703,676],748],
['仿古复古','#AD6657',[817,816,805,767,766,752,714,715,711,707,680],[830,829,829,829,816,820,812,822,812,814,791],831]];
function el(tag,attrs,parent){const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n}
function curve(points,move){let d=(move?'M':'L')+points[0].join(',');for(let i=0;i<points.length-1;i++){const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],z=points[Math.min(points.length-1,i+2)];d+='C'+[b[0]+(c[0]-a[0])/6,b[1]+(c[1]-a[1])/6,c[0]-(z[0]-b[0])/6,c[1]-(z[1]-b[1])/6,c[0],c[1]].join(',')}return d}
function path(top,bottom){return curve(xs.map((x,i)=>[x,top[i]]),true)+curve(xs.map((x,i)=>[x,bottom[i]]).reverse(),false)+'Z'}
function choose(group){inspect(host,group.getAttribute('aria-label'),'审美特征 · 唐—五代—宋');svg.classList.add('active');root.querySelectorAll('.ribbon').forEach(g=>g.classList.toggle('chosen',g===group))}function reset(){svg.classList.remove('active');root.querySelectorAll('.chosen').forEach(g=>g.classList.remove('chosen'))}
rows.forEach(([name,color,top,bottom,labelY])=>{const g=el('g',{class:'ribbon',tabindex:'0',role:'button','aria-label':name},root.querySelector('#bands'));for(let k=0;k<64;k++){const a=k/64,b=(k+1.04)/64;el('path',{d:path(top.map((t,i)=>t+(bottom[i]-t)*a),top.map((t,i)=>t+(bottom[i]-t)*Math.min(1,b))),fill:color,'fill-opacity':(.64*(1-a)+.045).toFixed(4),'pointer-events':'none'},g)}el('path',{d:path(top,bottom),class:'hit'},g);const label=el('text',{x:145,y:labelY+8,'text-anchor':'end','font-size':28,tabindex:0,role:'button','aria-label':name},root.querySelector('#labels'));label.textContent=name;for(const n of [g,label]){n.addEventListener('pointerenter',()=>choose(g));n.addEventListener('pointerleave',reset);n.addEventListener('focus',()=>choose(g));n.addEventListener('blur',reset)}});
const periods=['初唐','盛唐','中唐','晚唐','五代','北宋前期','北宋中后期','南宋前期','南宋后期'];const stops=xs.slice(1);el('line',{x1:183,y1:889,x2:1485,y2:889,stroke:'#7b6d60','stroke-width':1.2},root.querySelector('#timeline'));stops.forEach((x,i)=>{el('line',{x1:x,y1:115,x2:x,y2:868,class:'grid'},root.querySelector('#grid'));el('circle',{cx:x,cy:889,r:6,fill:'none',stroke:'#7b6d60','stroke-width':1.2},root.querySelector('#timeline'));if(i<periods.length){const t=el('text',{x,y:938,'text-anchor':'middle','font-size':29},root.querySelector('#timeline'));t.textContent=periods[i]}});svg.addEventListener('pointerleave',reset);

 const fitText=()=>{
  const width=host.clientWidth;if(!width)return;
  const units=1536/width;
  svg.querySelector(':scope > text').setAttribute('font-size',Math.min(42,Math.max(25,width*.024))*units);
  root.querySelectorAll('#labels text').forEach(label=>label.setAttribute('font-size',Math.min(34,Math.min(22,Math.max(16,width*.014))*units)));
  root.querySelectorAll('#timeline text').forEach(label=>label.setAttribute('font-size',Math.min(20,Math.max(13,width*.013))*units));
 };
 const observer=new ResizeObserver(fitText);observer.observe(host);fitText();
 return ()=>observer.disconnect();

}
