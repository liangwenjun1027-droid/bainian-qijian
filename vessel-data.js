import {VESSEL_PHOTO_GROUPS} from './vessel-photo-data.js';
export const VESSEL_GROUPS=VESSEL_PHOTO_GROUPS;
// Values and motif–meaning pairs transcribed from the user's supplied chart references.
export const FOOD_DATA=[['碗',7,'#59aaa4'],['碟',7,'#e9a244'],['盘',6,'#4aaabd'],['钵',5,'#7487c7'],['盆',2,'#a077b1'],['盒',2,'#ca7965'],['杯',2,'#cc969e'],['盖',2,'#8aa298']];
export const PATTERNS=['莲花纹','牡丹纹','宝相花纹','龙纹','凤纹','花鸟纹','卷草纹'];
export const MEANINGS=['佛教意象','富贵繁荣','吉祥祈愿','自然审美','身份象征','文化交融'];
export const PATTERN_PAIRS=[[0,0],[0,2],[0,3],[1,1],[1,2],[1,3],[2,0],[2,1],[2,5],[3,2],[3,4],[4,1],[4,2],[4,4],[5,2],[5,3],[6,3],[6,5]];
export function selectedItems(group,index=-1){return index<0?group.items:[group.items[index]];}
export function focusedFood(group,index=-1){return [...new Set(selectedItems(group,index).map(i=>i.category).filter(Boolean))];}
export function visiblePatternPoints(group,index=-1){
 const names=new Set(selectedItems(group,index).flatMap(i=>i.patterns));
 return PATTERN_PAIRS.filter(([column])=>names.has(PATTERNS[column]));
}

export function availableVesselViews(group,index=-1){return ['intro',...(focusedFood(group,index).length?['food']:[]),...(visiblePatternPoints(group,index).length?['pattern']:[])];}
