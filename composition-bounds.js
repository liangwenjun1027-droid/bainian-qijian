// Keep the saved page coordinates, including visible layers outside the canvas.
export function compositionBounds(page,excludedAssets=[]){
 let left=0,top=0,right=page.width,bottom=page.height;
 for(const layer of page.layers){
  if(layer.hidden||excludedAssets.includes(layer.assetId))continue;
  const angle=(layer.rotation||0)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
  const cx=layer.x+layer.width/2,cy=layer.y+layer.height/2;
  for(const dx of [-layer.width/2,layer.width/2])for(const dy of [-layer.height/2,layer.height/2]){
   const x=cx+dx*c-dy*s,y=cy+dx*s+dy*c;
   left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
 }
 return {left,top,width:right-left,height:bottom-top};
}
