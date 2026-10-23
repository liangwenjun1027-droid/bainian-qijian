import {COMBINATION_PERIODS,COMBINATION_SERIES} from './combination-data.js';
export function createCombinationChart(dom,echarts,ripple){
const periods=COMBINATION_PERIODS,datasets=COMBINATION_SERIES;
const myChart=echarts.init(dom,null,{renderer:'canvas',useDirtyRect:false});
let option;
const showCombination=name=>dom.dispatchEvent(new CustomEvent('chart-inspect',{bubbles:true,detail:{key:name,context:'食器组合'}}));
const bg = '#F7F1E8';
const textColor = '#6E5444';
const axisColor = '#CDBFB1';
const splitColor = '#DED3C8';

// 统一颜色强度
// 不再叠加额外透明度
const fillOpacity = 1;

// 弱化边缘线
const lineOpacity = 0.18;
const lineWidth = 0.8;

// 渐变：顶部浓郁，向下自然透明
const gradientStops = [
  { offset: 0.00, alpha: 0.85 },
  { offset: 0.12, alpha: 0.78 },
  { offset: 0.28, alpha: 0.65 },
  { offset: 0.45, alpha: 0.48 },
  { offset: 0.65, alpha: 0.28 },
  { offset: 0.82, alpha: 0.12 },
  { offset: 1.00, alpha: 0.00 }
];

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ============================
// 九宫格布局
// ============================

const lefts = ['6%', '38%', '70%'];
const tops = ['17%', '45%', '73%'];
const gridWidth = '23%';
const gridHeight = '13%';

const grids = [];
const xAxes = [];
const yAxes = [];
const series = [];
const graphics = [];

datasets.forEach((item, i) => {
  const row = Math.floor(i / 3);
  const col = i % 3;

  grids.push({
    left: lefts[col],
    top: tops[row],
    width: gridWidth,
    height: gridHeight,
    containLabel: false
  });

  xAxes.push({
    type: 'category',
    gridIndex: i,
    boundaryGap: false,
    data: periods,

    axisLine: {
      show: true,
      lineStyle: {
        color: axisColor,
        width: 1
      }
    },

    axisTick: {
      show: false
    },

    axisLabel: {
      show: true,
      interval: 0,
      rotate: 35,
      fontSize: 12,
      color: '#907C6D',
      margin: 12,
      hideOverlap: false
    },

    splitLine: {
      show: false
    }
  });

  yAxes.push({
    type: 'value',
    gridIndex: i,
    min: 0,
    max: 10,
    interval: 5,

    axisLine: {
      show: false
    },

    axisTick: {
      show: false
    },

    axisLabel: {
      show: col === 0,
      color: '#9A8778',
      fontSize: 12,
      margin: 10
    },

    splitLine: {
      show: true,
      lineStyle: {
        color: splitColor,
        type: 'dashed',
        width: 1,
        opacity: 0.5
      }
    }
  });

  series.push({
    name: item.name,
    type: 'line',
    xAxisIndex: i,
    yAxisIndex: i,
    data: item.values,

    smooth: 0.4,
    smoothMonotone: 'x',
    symbol: 'none',
    clip: true,

    // 保留极弱的轮廓线
    lineStyle: {
      width: lineWidth,
      color: hexToRgba(item.color, lineOpacity)
    },

    // 更浓郁、自然渐隐的面积
    areaStyle: {
      origin: 'start',
      opacity: fillOpacity,
      color: new echarts.graphic.LinearGradient(
        0, 0, 0, 1,
        gradientStops.map(stop => ({
          offset: stop.offset,
          color: hexToRgba(item.color, stop.alpha)
        })),
        false
      )
    },

    emphasis: {
      focus: 'series',
      lineStyle: {
        width: 1.2
      }
    },

    animationDuration: 700
  });

  graphics.push({
    type: 'text',
    left: lefts[col],
    top: (parseFloat(tops[row]) - 4.1) + '%',
    style: {
      text: item.name,
      fill: textColor,
      font: 'bold 18px 长卷明朝,serif'
    }
  });
});

option = {
  backgroundColor: bg,

  title: {
    text: '唐—五代—宋食器组合强度',
    left: 'center',
    top: 25,

    textStyle: {
      color: '#6B4F40',
      fontSize: 34,
      fontWeight: 'bold'
    }
  },

  tooltip: {
    trigger: 'axis',
    confine: true,
    backgroundColor: '#FFF9F2',
    borderColor: '#D8C8B9',

    textStyle: {
      color: textColor,
      fontSize: 14
    },

    axisPointer: {
      type: 'line',
      lineStyle: {
        color: '#BFAF9F',
        type: 'dashed'
      }
    }
  },

  grid: grids,
  xAxis: xAxes,
  yAxis: yAxes,
  series: series,
  graphic: graphics
};


    if (option && typeof option === 'object') {
      option.backgroundColor='transparent';
    }

    
// One shared coordinate system opens into the existing nine-panel layout.
let combinationProgress = 0;
let combinationExpanded = false;
let combinationFrame = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const lerp = (a, b, t) => a + (b - a) * t;
const combinationMainSeries = option.series.slice();
const combinationOutlines = combinationMainSeries.map((series, i) => ({
  id: 'combination-outline-' + i, name: '', type: 'line',
  xAxisIndex: i, yAxisIndex: i, data: series.data,
  smooth: series.smooth, smoothMonotone: 'x', symbol: 'none', clip: true,
  silent: true, z: 30, animation: false,
  tooltip: {show: false, trigger: 'none'}, emphasis: {disabled: true},
  lineStyle: {width: 2.4, color: hexToRgba(datasets[i].color, .8)}
}));

// Render a refracted copy of the chart, so the curves themselves bend with the water.
let combinationWater = null;
function startCombinationWater() {
  if (reducedMotion.matches) return;
  if (!combinationWater) combinationWater = createCombinationWater();
  if (combinationWater) combinationWater.start();
}
function stopCombinationWater() {
  if (combinationWater) combinationWater.stop();
  dom.classList.remove('water-refracting');
}
function createCombinationWater() {
  const canvas = document.createElement('canvas');
  canvas.className = 'water-refraction';
  const gl = canvas.getContext('webgl', {alpha: true, premultipliedAlpha: true, antialias: false});
  if (!gl) return null;
  function shader(type, source) {
    const result = gl.createShader(type);
    gl.shaderSource(result, source);gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw Error('Water shader unavailable');
    return result;
  }
  let program;
  try {
    const vertex = shader(gl.VERTEX_SHADER, 'attribute vec2 a_position; varying vec2 v_uv; void main(){v_uv=vec2((a_position.x+1.0)*.5,(1.0-a_position.y)*.5);gl_Position=vec4(a_position,0.0,1.0);}');
    const fragment = shader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      uniform sampler2D u_chart;
      uniform vec2 u_view;
      uniform float u_time;
      varying vec2 v_uv;
      void main(){
        float unit=min(u_view.x/3000.0,u_view.y/2200.0);
        vec2 point=(v_uv-vec2(.5))*u_view/max(unit,.001);
        float radius=length(point);
        vec2 direction=point/max(radius,1.0);
        float age=u_time;
        float active=smoothstep(0.0,.35,age)*(1.0-smoothstep(3.5,4.7,age));
        float ring=radius-max(age,0.0)*360.0;
        float packet=exp(-pow(ring/270.0,2.0));
        float ripple=sin(ring*.035)*packet*active;
        // The radial displacement samples the real chart rather than decorating it.
        vec2 offset=direction*ripple*13.0*unit/u_view;
        vec4 base=texture2D(u_chart,clamp(v_uv+offset,vec2(.001),vec2(.999)));
        float slope=cos(ring*.035)*packet*active;
        float light=max(slope,0.0)*.22;
        float shade=max(-slope,0.0)*.10;
        float impact=0.0;
        float sheen=light+impact;
        vec3 color=base.rgb*(1.0-shade)+vec3(light*.45);
        float alpha=base.a+sheen*(1.0-base.a);
        gl_FragColor=vec4(color*base.a+vec3(.97,.98,1.0)*sheen*(1.0-base.a),alpha);
      }
    `);
    program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    gl.deleteShader(vertex);gl.deleteShader(fragment);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Water program unavailable');
  } catch(error) {console.warn(error.message);return null;}
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(program,'u_chart'),0);
  const time=gl.getUniformLocation(program,'u_time'), view=gl.getUniformLocation(program,'u_view');
  const snapshot=document.createElement('canvas');
  let running=false,frame=0,start=0,width=0,height=0,last=-Infinity;
  function capture(){
    width=myChart.getWidth();height=myChart.getHeight();
    const ratio=Math.min(1,2400/width,1800/height);
    snapshot.width=canvas.width=Math.round(width*ratio);
    snapshot.height=canvas.height=Math.round(height*ratio);
    const image=myChart.getRenderedCanvas({pixelRatio:ratio,backgroundColor:'rgba(0,0,0,0)'});
    snapshot.getContext('2d').drawImage(image,0,0,snapshot.width,snapshot.height);
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,snapshot);
    gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(view,width,height);
  }
  function stop(){running=false;cancelAnimationFrame(frame);dom.classList.remove('water-refracting');ripple.classList.remove('water-ready');canvas.style.display='none';}
  function draw(now){
    if(!running)return;
    if(now-last>=30){
      try{
        if(myChart.getWidth()!==width||myChart.getHeight()!==height)capture();
        gl.uniform1f(time,((now-start)/1000)%6);
        gl.drawArrays(gl.TRIANGLES,0,6);
        dom.classList.add('water-refracting');canvas.style.display='block';last=now;
      }catch(error){stop();return;}
    }
    frame=requestAnimationFrame(draw);
  }
  canvas.addEventListener('webglcontextlost',function(event){event.preventDefault();stop();});
  ripple.prepend(canvas);

  return {start(){if(running)return;try{capture();ripple.classList.add('water-ready');running=true;start=performance.now();last=-Infinity;frame=requestAnimationFrame(draw);}catch(error){stop();}},stop};
}

let rippleTimer = 0, rippleDismissed = false;
function scheduleCombinationRipple() {
  stopCombinationWater();
  clearTimeout(rippleTimer);
  ripple.classList.remove('active');
  if (rippleDismissed || document.hidden || dom.closest('[hidden]')) return;
  rippleTimer = setTimeout(function () {
    if (!rippleDismissed && !document.hidden && !combinationExpanded) {ripple.classList.add('active');startCombinationWater();}
  }, 3000);
}
function dismissCombinationRipple() {
  stopCombinationWater();
  rippleDismissed = true;
  clearTimeout(rippleTimer);
  ripple.classList.remove('active');
}
document.addEventListener('visibilitychange', scheduleCombinationRipple);
window.addEventListener('pagehide', dismissCombinationRipple);
function applyCombinationLayout() {
  const w = myChart.getWidth(), h = myChart.getHeight();
  const sx = w / 3000, sy = h / 2200, scale = Math.min(sx, sy);
  const p = combinationProgress;
  option.animation = false;
  option.title.show = false;
  option.backgroundColor = 'transparent';
  option.tooltip.show = p === 0 || p === 1;
  option.tooltip.textStyle.fontSize = 58 * scale;
  option.graphic = [{
    id: 'combination-title', type: 'text', silent: true,
    x: w / 2, y: 150 * sy,
    style: {text: '唐—五代—宋食器组合强度', fill: '#6B4F40',
      font: 'bold ' + (120 * scale) + 'px 长卷明朝,serif', align: 'center', verticalAlign: 'top'}
  }];
  datasets.forEach((item, i) => {
    const row = Math.floor(i / 3), col = i % 3;
    const left = 180 + col * 920, top = 330 + row * 610;
    Object.assign(option.grid[i], {
      left: lerp(235, left + 55, p) * sx,
      top: lerp(450, top + 110, p) * sy,
      width: lerp(2550, 710, p) * sx,
      height: lerp(1160, 310, p) * sy, containLabel: false
    });
    const axisOpacity = i === 0 ? 1 : p;
    Object.assign(option.xAxis[i].axisLabel, {show: i === 0 || p > 0,
      opacity: axisOpacity, fontSize: 58 * scale, rotate: 0,
      formatter:value=>p>.5?value[0]+'\n'+value.slice(1):value,
      margin: 24 * sy, color: '#6E594A', hideOverlap: false});
    option.xAxis[i].axisLine.lineStyle.opacity = axisOpacity;
    Object.assign(option.yAxis[i].axisLabel, {show: i === 0 || (col === 0 && p > 0),
      opacity: axisOpacity, fontSize: 50 * scale, margin: 14 * sx, color: '#806C5B'});
    option.yAxis[i].splitLine.lineStyle.opacity = .5 * axisOpacity;
    option.series[i].id = 'combination-series-' + i;
    option.series[i].itemStyle = {color: item.color};
    option.series[i].areaStyle.opacity = lerp(.64, 1, p);
    option.series[i].emphasis.disabled = p > 0 && p < 1;
    option.graphic.push({id: 'combination-label-' + i, type: 'text', silent: p===0,onmouseover:()=>showCombination(item.name),
      x: left * sx, y: top * sy,
      style: {text: item.name, fill: '#6E5444', opacity: p,
        font: 'bold ' + (70 * scale) + 'px 长卷明朝,serif', verticalAlign: 'top'}});
    // Two evenly spaced legend rows remain clear of the common x-axis.
    const legendRow = i < 5 ? 0 : 1;
    const legendCol = i < 5 ? i : i - 5;
    const legendX = (legendRow === 0 ? 250 : 500) + legendCol * 500;
    const legendY = legendRow === 0 ? 1860 : 1960;
    option.graphic.push({id: 'combination-legend-swatch-' + i, type: 'rect', silent: p===1,onmouseover:()=>showCombination(item.name),
      x: legendX * sx, y: (legendY + 8) * sy,
      shape: {width: 44 * sx, height: 26 * sy, r: 5 * scale},
      style: {fill: item.color, opacity: 1 - p}});
    option.graphic.push({id: 'combination-legend-text-' + i, type: 'text', silent: p===1,onmouseover:()=>showCombination(item.name),
      x: (legendX + 62) * sx, y: legendY * sy,
      style: {text: item.name, fill: '#6E5444', opacity: 1 - p,
        font: (62 * scale) + 'px 长卷明朝,serif', verticalAlign: 'top'}});
  });
  combinationOutlines.forEach(line => {
    line.lineStyle.width = 2.4 * scale;
    line.lineStyle.opacity = 1 - p;
  });
  // Paint the fine peaks above every translucent area; remove them at the expanded endpoint.
  option.series = p < 1 ? combinationMainSeries.concat(combinationOutlines) : combinationMainSeries;
  myChart.setOption(option, {silent: true, replaceMerge: ['series']});
}
function toggleCombination() {
  dismissCombinationRipple();
  cancelAnimationFrame(combinationFrame);
  combinationExpanded = !combinationExpanded;
  const from = combinationProgress, target = combinationExpanded ? 1 : 0;
  dom.setAttribute('aria-expanded', String(combinationExpanded));
  dom.setAttribute('aria-label', combinationExpanded ? '九宫格组合图，点击收拢' : '叠合组合图，点击展开');
  myChart.dispatchAction({type: 'hideTip'});
  if (reducedMotion.matches || from === target) {
    combinationProgress = target;
    applyCombinationLayout();
    return;
  }
  const start = performance.now();
  const duration = 1250 * Math.abs(target - from);
  let last = -Infinity;
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    if (now - last >= 30 || t === 1) {
      const eased = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      combinationProgress = lerp(from, target, eased);
      applyCombinationLayout();
      last = now;
    }
    if (t < 1) combinationFrame = requestAnimationFrame(frame);
  }
  combinationFrame = requestAnimationFrame(frame);
}
dom.style.cursor = 'pointer';
dom.setAttribute('role', 'button');
dom.setAttribute('tabindex', '0');
dom.setAttribute('aria-expanded', 'false');
dom.setAttribute('aria-label', '叠合组合图，点击展开');
dom.addEventListener('click', toggleCombination);
dom.addEventListener('keydown', function (event) {
  if (event.key === 'Enter' || event.key === ' ') {event.preventDefault(); toggleCombination();}
});
applyCombinationLayout();

scheduleCombinationRipple();

  
return {chart:myChart,pause(){clearTimeout(rippleTimer);stopCombinationWater();ripple.classList.remove('active');},resume:scheduleCombinationRipple,dispose(){dismissCombinationRipple();cancelAnimationFrame(combinationFrame);document.removeEventListener('visibilitychange',scheduleCombinationRipple);window.removeEventListener('pagehide',dismissCombinationRipple);myChart.dispose();}};

}
