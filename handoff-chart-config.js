const font='长卷明朝, Huiwen-mincho, 汇文明朝体, serif';
function applyFont(option){
 option.backgroundColor='transparent';option.textStyle={...option.textStyle,fontFamily:font};
 const walk=value=>{if(!value||typeof value!=='object')return;for(const [key,child] of Object.entries(value)){if((key==='textStyle'||key==='axisName'||key==='label')&&child&&typeof child==='object')child.fontFamily=font;walk(child);}};
 walk(option);
}
export function configureFood(option){
 option.title.text=option.title.text.replace(/^表\s*[5五]\s*[｜|]\s*/,'');
 option.title.subtext='';option.title.top=80;option.title.padding=0;option.title.textStyle.fontSize=42;
 option.series.forEach(series=>{
  Object.assign(series,{left:150,right:180,top:155,bottom:75,nodeGap:18,nodeWidth:31});
  series.label.fontSize=24;series.levels.forEach(level=>{level.label.fontSize=level.depth===0?26:24;});
  Object.assign(series.levels.find(level=>level.depth===0).label,{position:'left',align:'right',distance:12});
  series.emphasis={...series.emphasis,focus:'trajectory',blurScope:'series',lineStyle:{opacity:.95}};
  series.blur={lineStyle:{opacity:.035},itemStyle:{opacity:.3},label:{opacity:.3}};
 });
 applyFont(option);
}
export function alignFood(chart){
 const model=chart.getModel().getSeriesByIndex(0),data=model.getData(),H=model.layoutInfo.height,W=model.layoutInfo.width;
 const orders=[['主食','菜肴','羹汤','果点','调味','饮品'],['米饭','粥、糜','面条、冷淘','馄饨','胡饼、蒸饼','包子、馒头类','炖肉、软羊','烤肉、炙肉','鱼脍','煎鱼','蔬菜','肉羹','腌菜、齑','菜羹、瓠羹','清汤','鲜果','糕点、酥饼','果脯、蜜饯','酱、醋等','茶','酒'],['碗','盘','碟','小碟','盏','杯'],['箸','匙','手取','蘸取','直接饮用']];
 const weights=[[30,75,96,125,34],Array(20).fill(1),[76,65,86,49,84],[140,76,76,70]],xs=[0,.354,.714,1];
 const updated=chart.getOption().series[0].data.map(node=>({...node}));
 orders.forEach((names,column)=>{
  const rows=names.map(name=>{const i=updated.findIndex(n=>n.name===column+'_'+name);return {i,layout:i>=0?data.getItemLayout(i):null};}).filter(row=>row.layout);
  const total=rows.reduce((sum,row)=>sum+row.layout.dy,0),free=Math.max(0,H-total),sum=weights[column].reduce((a,b)=>a+b,0);let y=0;
  rows.forEach((row,j)=>{updated[row.i].localX=xs[column]*(W-row.layout.dx)/W;updated[row.i].localY=y/H;y+=row.layout.dy+free*(weights[column][j]||0)/sum;});
 });
 chart.setOption({series:[{data:updated}]});
}
export function configureForeign(option,chart){
 option.textStyle={fontFamily:font,fontSize:36};
 option.series.forEach(series=>{
  series.z=series.name==='初唐'?1:3;
  const edge={color:series.color,width:4,opacity:.9};
  series.lineStyle={...series.lineStyle,...edge};
  series.emphasis.lineStyle={...edge,width:5,opacity:1};
  series.data.forEach(item=>{
   item.lineStyle={...item.lineStyle,...edge};
   item.emphasis.lineStyle={...edge,width:5,opacity:1};
  });
 });
 option.title.forEach((title,i)=>{
  title.subtext='';title.padding=0;title.textStyle.fontSize=i?48:60;title.textStyle.color='#514638';
  if(!i){title.text=title.text.replace(/^表8-A[｜|]\s*/,'');title.show=false;}
  else{title.left=[760,1500,2240][i-1];title.top=[300,950,300][i-1];}
 });
 option.radar.forEach((radar,i)=>{
  radar.center=[[760,1500,2240][i],[780,1430,780][i]];radar.radius=330;
  radar.axisName={...radar.axisName,fontSize:36,lineHeight:45,color:'#625747',formatter:name=>name==='金属器仿制特征'?'金属器\n仿制特征':name};radar.axisNameGap=20;
  radar.axisLine.show=false;radar.splitLine.show=false;radar.splitArea.show=false;
 });
 Object.assign(option.legend,{bottom:160,itemWidth:60,itemHeight:30,itemGap:36});option.legend.textStyle.fontSize=44;option.legend.textStyle.color='#625747';option.tooltip.textStyle.fontSize=32;
 option.graphic=[];
 option.radar.forEach((radar,i)=>{
  [{radius:340,fill:'rgba(251,247,237,.72)',stroke:'#9D896C',width:3},{radius:326,fill:'transparent',stroke:'rgba(164,143,111,.46)',width:1.6},{radius:292,fill:'rgba(235,225,204,.16)',stroke:'rgba(164,143,111,.38)',width:1.5}].forEach((ring,j)=>option.graphic.push({id:`plate-${i}-${j}`,type:'circle',silent:true,z:-1,shape:{cx:radar.center[0],cy:radar.center[1],r:ring.radius},style:{fill:ring.fill,stroke:ring.stroke,lineWidth:ring.width}}));
 });
 option.graphic.push({id:'centered-main-title',type:'text',silent:true,z:50,x:chart.getWidth()/2,y:150,style:{text:option.title[0].text,font:`60px ${font}`,fill:'#514638',align:'center',verticalAlign:'top'}});
 applyFont(option);
}
