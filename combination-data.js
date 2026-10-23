export const COMBINATION_PERIODS = [
  '初唐', '盛唐', '中唐', '晚唐',
  '五代', '北宋', '南宋'
];
export const COMBINATION_ORIGINAL_DATA = [
  { name: '碗＋箸', color: '#C97163', values: [9.2,9.2,9.2,9.2,9.2,9.2,9.2,9.2,9.2] },
  { name: '碗＋匙', color: '#8EAEAA', values: [8.8,8.8,8.8,8.8,8.8,8.8,8.8,8.8,8.8] },
  { name: '盘＋碟', color: '#D48677', values: [5.1,5.1,7.1,7.1,7.1,9.1,9.1,9.1,9.1] },
  { name: '杯/盏＋壶', color: '#D4AA67', values: [7.3,9.3,9.3,9.3,9.3,9.3,9.3,9.3,9.3] },
  { name: '盏＋盏托', color: '#A48FB0', values: [2.7,4.7,4.7,6.7,6.7,8.7,8.7,8.7,8.7] },
  { name: '注子＋温碗', color: '#DE947B', values: [0,0,3,4.9,6.9,8.9,8.9,6.9,6.9] },
  { name: '多盘＋多碟＋碗', color: '#D9ABA6', values: [5.4,5.4,5.4,7.4,7.4,9.4,9.4,9.4,9.4] },
  { name: '茶盏＋茶瓶等', color: '#97AE96', values: [4.6,4.6,4.6,4.6,4.6,6.6,8.6,8.6,8.6] },
  { name: '仿古礼器组合', color: '#A88D7A', values: [3,3,3,5,5,7,8.8,8.7,8.7] }
];
export const COMBINATION_SERIES=COMBINATION_ORIGINAL_DATA.map(item=>({...item,values:[...item.values.slice(0,5),(item.values[5]+item.values[6])/2,(item.values[7]+item.values[8])/2]}));
