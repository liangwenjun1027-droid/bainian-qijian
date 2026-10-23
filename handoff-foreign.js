import {configureFood,configureForeign,alignFood} from './handoff-chart-config.js';
// Data and interactions retained from the supplied project JSON.
export function createChart(canvas,echarts){

    var dom = canvas;
    var myChart = echarts.init(dom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
    var app = {};
    var option;
const indicators = [
  { name: '多曲轮廓', max: 10 },
  { name: '金属器仿制特征', max: 10 },
  { name: '莲瓣造型', max: 10 },
  { name: '曲瓣口沿', max: 10 },
  { name: '长杯形', max: 10 },
  { name: '棱腹结构', max: 10 },
  { name: '高足结构', max: 10 }
];
// 固定颜色，不受绘制顺序影响
const colors = {
  '初唐': '#E9B79D',
  '盛唐': '#D8A351',
  '中唐': '#D8774F',
  '晚唐': '#A94D38',
  '五代': '#BF8D59',
  '北宋前期': '#B5CBA0',
  '北宋中后期': '#628F77',
  '南宋前期': '#9DBED2',
  '南宋后期': '#537FA7'
};
// 图例按照历史时间排序
const legendOrder = [
  '初唐',
  '盛唐',
  '中唐',
  '晚唐',
  '五代',
  '北宋前期',
  '北宋中后期',
  '南宋前期',
  '南宋后期'
];
// 各时期数据
const periodMap = {
  '初唐': {
    radarIndex: 0,
    value: [3.4, 5.5, 5.5, 2.5, 5.2, 4.2, 6.8]
  },
  '盛唐': {
    radarIndex: 0,
    value: [10, 8, 8, 5, 10, 10, 8]
  },
  '中唐': {
    radarIndex: 0,
    value: [10, 10, 8, 7, 10, 10, 7]
  },
  '晚唐': {
    radarIndex: 0,
    value: [10, 10, 8, 8, 10, 8, 6]
  },
  '五代': {
    radarIndex: 1,
    value: [8, 8, 8, 10, 8, 8, 5]
  },
  '北宋前期': {
    radarIndex: 2,
    value: [5.5, 8, 10, 10, 5.5, 6, 4]
  },
  '北宋中后期': {
    radarIndex: 2,
    value: [3.5, 6, 10, 8, 3.5, 5.5, 3.5]
  },
  '南宋前期': {
    radarIndex: 2,
    value: [3.5, 3.5, 8, 8, 3.5, 3.5, 3.5]
  },
  '南宋后期': {
    radarIndex: 2,
    value: [3.5, 3.5, 8, 8, 3.5, 3.5, 3.5]
  }
};
// 图层绘制顺序
// 初唐最后绘制，位于所有数据面最上层
const drawOrder = [
  '晚唐',
  '中唐',
  '盛唐',
  '五代',
  '北宋前期',
  '北宋中后期',
  '南宋前期',
  '南宋后期',
  '初唐'
];
function rgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
// 默认半透明渐变
function gradient(hex) {
  return new echarts.graphic.RadialGradient(
    0.5, 0.5, 0.85,
    [
      {
        offset: 0,
        color: rgba(hex, 0.48)
      },
      {
        offset: 0.55,
        color: rgba(hex, 0.38)
      },
      {
        offset: 1,
        color: rgba(hex, 0.26)
      }
    ]
  );
}
// 每个时期固定指定颜色
function makeSeries(name) {
  const period = periodMap[name];
  const c = colors[name];
  return {
    id: name,
    name: name,
    type: 'radar',
    radarIndex: period.radarIndex,
    // 每个 series 明确指定自己的颜色
    color: c,
    legendHoverLink: true,
    symbol: 'none',
    // 初唐显示在最上面
    z: name === '初唐' ? 20 : 3,
    itemStyle: {
      color: c
    },
    lineStyle: {
      width: 0,
      opacity: 0
    },
    areaStyle: {
      color: gradient(c),
      opacity: 1
    },
    emphasis: {
      focus: 'none',
      lineStyle: {
        width: 0,
        opacity: 0
      },
      areaStyle: {
        color: c,
        opacity: 1
      }
    },
    data: [
      {
        name: name,
        value: period.value,
        symbol: 'none',
        itemStyle: {
          color: c
        },
        lineStyle: {
          width: 0,
          opacity: 0
        },
        areaStyle: {
          color: gradient(c),
          opacity: 1
        },
        emphasis: {
          lineStyle: {
            width: 0,
            opacity: 0
          },
          areaStyle: {
            color: c,
            opacity: 1
          }
        }
      }
    ]
  };
}
function makeRadar(center) {
  return {
    center: center,
    radius: '20%',
    shape: 'circle',
    startAngle: 90,
    clockwise: true,
    splitNumber: 5,
    indicator: indicators,
    axisName: {
      color: '#66635F',
      fontSize: 12,
      fontWeight: 'normal'
    },
    axisNameGap: 12,
    axisLine: {
      lineStyle: {
        color: 'rgba(120,115,105,0.12)',
        width: 1
      }
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(120,115,105,0.13)',
        width: 1
      }
    },
    splitArea: {
      show: true,
      areaStyle: {
        color: [
          'rgba(120,115,105,0.012)',
          'rgba(120,115,105,0.025)'
        ]
      }
    }
  };
}
option = {
  backgroundColor: '#F7F5F1',
  // 调色盘也按绘制顺序对应，防止错位
  color: drawOrder.map(name => colors[name]),
  title: [
    {
      text: '表8-A｜外来器型本土化影响强度',
      subtext: '唐—五代—宋',
      left: 'center',
      top: 20,
      textStyle: {
        color: '#4A4A4A',
        fontSize: 26,
        fontWeight: 'bold'
      },
      subtextStyle: {
        color: '#777777',
        fontSize: 16
      },
      itemGap: 12
    },
    {
      text: '唐',
      left: '18%',
      top: '24%',
      textAlign: 'center',
      textStyle: {
        color: '#666666',
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    {
      text: '五代',
      left: '50%',
      top: '24%',
      textAlign: 'center',
      textStyle: {
        color: '#666666',
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    {
      text: '宋',
      left: '82%',
      top: '24%',
      textAlign: 'center',
      textStyle: {
        color: '#666666',
        fontSize: 16,
        fontWeight: 'normal'
      }
    }
  ],
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: '#DDDDDD',
    textStyle: {
      color: '#444444',
      fontSize: 13
    }
  },
  legend: {
    // 强制指定每个图例对应的颜色
    data: legendOrder.map(name => ({
      name: name,
      icon: 'roundRect',
      itemStyle: {
        color: colors[name],
        borderWidth: 0
      }
    })),
    selectedMode: true,
    bottom: 18,
    left: 'center',
    itemWidth: 26,
    itemHeight: 11,
    itemGap: 14,
    textStyle: {
      color: '#666666',
      fontSize: 13
    }
  },
  radar: [
    makeRadar(['18%', '53%']),
    makeRadar(['50%', '53%']),
    makeRadar(['82%', '53%'])
  ],
  series: drawOrder.map(makeSeries),
  animationDuration: 800,
  stateAnimation: {
    duration: 180,
    easing: 'cubicOut'
  }
};
// 保留图例悬停高亮
// 阻止点击图例隐藏数据
if (typeof myChart !== 'undefined') {
  myChart.off('legendselectchanged');
  myChart.on('legendselectchanged', function (params) {
    if (params.selected[params.name] === false) {
      myChart.dispatchAction({
        type: 'legendSelect',
        name: params.name
      });
    }
  });
}
    if (option && typeof option === 'object') {
      configureForeign(option,myChart);myChart.setOption(option);
    }
  
return myChart;
}
