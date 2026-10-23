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
const rawData = [
  // 主食
  { category: '主食', food: '米饭', vessel: '碗', tools: ['箸', '匙'] },
  { category: '主食', food: '粥、糜', vessel: '碗', tools: ['匙'] },
  { category: '主食', food: '面条、冷淘', vessel: '碗', tools: ['箸'] },
  { category: '主食', food: '馄饨', vessel: '碗', tools: ['匙', '箸'] },
  { category: '主食', food: '胡饼、蒸饼', vessel: '盘', tools: ['手取', '箸'] },
  { category: '主食', food: '包子、馒头类', vessel: '盘', tools: ['手取', '箸'] },
  // 菜肴
  { category: '菜肴', food: '烤肉、炙肉', vessel: '盘', tools: ['箸'] },
  { category: '菜肴', food: '炖肉、软羊', vessel: '碗', tools: ['箸', '匙'] },
  { category: '菜肴', food: '鱼脍', vessel: '盘', tools: ['箸'] },
  { category: '菜肴', food: '煎鱼', vessel: '盘', tools: ['箸'] },
  { category: '菜肴', food: '蔬菜', vessel: '盘', tools: ['箸'] },
  { category: '菜肴', food: '腌菜、齑', vessel: '碟', tools: ['箸'] },
  // 羹汤
  { category: '羹汤', food: '肉羹', vessel: '碗', tools: ['匙', '箸'] },
  { category: '羹汤', food: '菜羹、瓠羹', vessel: '碗', tools: ['匙'] },
  { category: '羹汤', food: '清汤', vessel: '碗', tools: ['匙'] },
  // 果点
  { category: '果点', food: '鲜果', vessel: '盘', tools: ['手取'] },
  { category: '果点', food: '果脯、蜜饯', vessel: '碟', tools: ['手取'] },
  { category: '果点', food: '糕点、酥饼', vessel: '盘', tools: ['手取'] },
  // 调味
  { category: '调味', food: '酱、醋等', vessel: '小碟', tools: ['蘸取'] },
  // 饮品
  { category: '饮品', food: '茶', vessel: '盏', tools: ['直接饮用'] },
  { category: '饮品', food: '酒', vessel: '杯', tools: ['直接饮用'] }
];
// ============================================================
// 2. 配色
// 只将原浅米色 #F9EADF 替换为 #BF8D59
// ============================================================
const palette = {
  coral: '#CE6557',
  mint: '#89C2AB',
  ochre: '#D5AD72',
  blush: '#EAB4A7',
  sage: '#A7B58D',
  cream: '#BF8D59'
};
const categoryColors = {
  '主食': palette.coral,
  '菜肴': palette.blush,
  '羹汤': palette.ochre,
  '果点': palette.sage,
  '调味': palette.mint,
  '饮品': palette.cream
};
// 盛食器配色
const vesselColors = {
  '碗': '#B8A892',
  '盘': '#C9A99A',
  '碟': '#A9B69B',
  '小碟': '#91B7A7',
  '盏': '#B6ADA1',
  '杯': '#B9A69C'
};
// 进食器具配色
const toolColors = {
  '箸': '#BF8073',
  '匙': '#D2A47F',
  '手取': '#A7B58D',
  '蘸取': '#89C2AB',
  '直接饮用': '#A3B8B2'
};
// ============================================================
// 3. 食物顺序
// ============================================================
const foodOrder = [
  '米饭',
  '烤肉、炙肉',
  '粥、糜',
  '肉羹',
  '胡饼、蒸饼',
  '鱼脍',
  '面条、冷淘',
  '鲜果',
  '炖肉、软羊',
  '馄饨',
  '菜羹、瓠羹',
  '煎鱼',
  '包子、馒头类',
  '糕点、酥饼',
  '蔬菜',
  '清汤',
  '果脯、蜜饯',
  '腌菜、齑',
  '酱、醋等',
  '茶',
  '酒'
];
// ============================================================
// 4. 创建节点
// ============================================================
const nodes = [];
const nodeSet = new Set();
function addNode(name, depth, color) {
  const id = depth + '_' + name;
  if (!nodeSet.has(id)) {
    nodeSet.add(id);
    nodes.push({
      name: id,
      displayName: name,
      depth: depth,
      itemStyle: {
        color: color
      }
    });
  }
}
// 第一列：食物类别
[
  '主食',
  '菜肴',
  '羹汤',
  '果点',
  '调味',
  '饮品'
].forEach(function (name) {
  addNode(name, 0, categoryColors[name]);
});
// 第二列：具体食物
foodOrder.forEach(function (food) {
  const item = rawData.find(function (d) {
    return d.food === food;
  });
  if (item) {
    addNode(
      item.food,
      1,
      categoryColors[item.category]
    );
  }
});
// 第三列：主要盛食器
[
  '碗',
  '盘',
  '碟',
  '小碟',
  '盏',
  '杯'
].forEach(function (name) {
  addNode(name, 2, vesselColors[name]);
});
// 第四列：进食器具
[
  '箸',
  '匙',
  '手取',
  '蘸取',
  '直接饮用'
].forEach(function (name) {
  addNode(name, 3, toolColors[name]);
});
// ============================================================
// 5. 连线
// ============================================================
const links = [];
function addLink(source, target, value) {
  const oldLink = links.find(function (d) {
    return (
      d.source === source &&
      d.target === target
    );
  });
  if (oldLink) {
    oldLink.value += value;
  } else {
    links.push({
      source: source,
      target: target,
      value: value
    });
  }
}
rawData.forEach(function (item) {
  // 类别 → 食物
  addLink(
    '0_' + item.category,
    '1_' + item.food,
    1
  );
  // 食物 → 盛食器
  addLink(
    '1_' + item.food,
    '2_' + item.vessel,
    1
  );
  // 盛食器 → 进食器具
  const toolWeight = 1 / item.tools.length;
  item.tools.forEach(function (tool) {
    addLink(
      '2_' + item.vessel,
      '3_' + tool,
      toolWeight
    );
  });
});
// ============================================================
// 6. 图表配置
// ============================================================
option = {
  backgroundColor: '#F7F5F0',
  title: {
    text: '表5｜唐—五代—宋食物类型 × 食器对应关系',
    subtext: '食物类别 → 具体食物 → 主要盛食器 → 进食器具',
    left: 'center',
    top: 15,
    textStyle: {
      color: '#4A4946',
      fontSize: 20,
      fontWeight: 'bold'
    },
    subtextStyle: {
      color: '#77746E',
      fontSize: 13
    }
  },
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove',
    backgroundColor: 'rgba(247,245,240,0.98)',
    borderColor: '#D6D1C8',
    borderWidth: 1,
    textStyle: {
      color: '#4A4946',
      fontSize: 13
    },
    formatter: function (params) {
      if (params.dataType === 'node') {
        return params.data.displayName;
      }
      const source = params.data.source
        .split('_')
        .slice(1)
        .join('_');
      const target = params.data.target
        .split('_')
        .slice(1)
        .join('_');
      return source + ' → ' + target;
    }
  },
  series: [
    {
      type: 'sankey',
      data: nodes,
      links: links,
      left: '2%',
      right: '4%',
      top: '12%',
      bottom: '2%',
      nodeWidth: 26,
      nodeGap: 12,
      nodeAlign: 'justify',
      layoutIterations: 64,
      itemStyle: {
        borderColor: '#F7F5F0',
        borderWidth: 0.8,
        borderRadius: 0
      },
      // 半透明流带
      lineStyle: {
        color: 'source',
        opacity: 0.27,
        curveness: 0.52
      },
      label: {
        show: true,
        color: '#55524D',
        fontSize: 11,
        distance: 7,
        formatter: function (params) {
          return params.data.displayName;
        }
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          opacity: 0.75
        }
      },
      levels: [
        // 第一列
        {
          depth: 0,
          itemStyle: {
            borderColor: '#F7F5F0',
            borderWidth: 0.8
          },
          label: {
            color: '#4A4946',
            fontSize: 15,
            fontWeight: 'bold',
            distance: 10,
            formatter: function (params) {
              return params.data.displayName;
            }
          },
          lineStyle: {
            color: 'source',
            opacity: 0.31,
            curveness: 0.52
          }
        },
        // 第二列
        {
          depth: 1,
          itemStyle: {
            opacity: 0.84,
            borderColor: '#F7F5F0',
            borderWidth: 0.6
          },
          label: {
            color: '#625F59',
            fontSize: 11,
            formatter: function (params) {
              return params.data.displayName;
            }
          },
          lineStyle: {
            color: 'source',
            opacity: 0.24,
            curveness: 0.52
          }
        },
        // 第三列
        {
          depth: 2,
          itemStyle: {
            borderColor: '#F7F5F0',
            borderWidth: 0.8
          },
          label: {
            color: '#4A4946',
            fontSize: 14,
            fontWeight: 'bold',
            formatter: function (params) {
              return params.data.displayName;
            }
          },
          lineStyle: {
            color: 'gradient',
            opacity: 0.31,
            curveness: 0.52
          }
        },
        // 第四列
        {
          depth: 3,
          itemStyle: {
            borderColor: '#F7F5F0',
            borderWidth: 0.8
          },
          label: {
            color: '#4A4946',
            fontSize: 15,
            fontWeight: 'bold',
            distance: 10,
            formatter: function (params) {
              return params.data.displayName;
            }
          }
        }
      ]
    }
  ]
};
    if (option && typeof option === 'object') {
      configureFood(option,myChart);myChart.setOption(option);alignFood(myChart);
    }
  
return myChart;
}
