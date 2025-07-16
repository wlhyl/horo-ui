import {
  ASCHouse,
  DistanceStarLong,
  DongWei,
  Horoscope,
  House,
  LunarCalendar,
  Planet,
  StarTransformedStar,
} from 'src/app/type/interface/response-qizheng';
import * as fabric from 'fabric';
import { QizhengConfigService } from 'src/app/services/config/qizheng-config.service';
import {
  cos,
  degNorm,
  degreeToDMS,
  newtonIteration,
  sin,
} from '../horo-math/horo-math';
import { TipService } from 'src/app/services/qizheng/tip.service';
import { zodiacLong } from '../qizheng-math/qizheng-math';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';

/**
 * 绘制天宫图
 * @param horoscope 天宫图数据
 * @param canvas 天宫图canvas
 * @param options 天宫图图的相关参数
 */
export function drawHoroscope(
  horoscope: Horoscope,
  canvas: fabric.Canvas,
  config: QizhengConfigService,
  tip: TipService,
  options: { width: number; height: number }
) {
  canvas.clear();
  canvas.setDimensions({ width: options.width, height: options.height });

  // 圆心
  const cx = options.width / 2;
  const cy = options.height / 2;
  // 外圆半径
  const r = options.width / 2;

  // 画圆
  for (let i = 1; i < 7; i++) {
    const r1 = (r / 9) * i;
    canvas.add(
      new fabric.Circle({
        left: cx - r1,
        top: cy - r1,
        radius: r1,
        fill: '',
        stroke: 'black', //不填充
        selectable: false,
      })
    );
  }

  // 洞微圆
  const dongWeiR = (r / 9) * 6.5;
  canvas.add(
    new fabric.Circle({
      left: cx - dongWeiR,
      top: cy - dongWeiR,
      radius: dongWeiR,
      fill: '',
      stroke: 'black', //不填充
      selectable: false,
    })
  );

  drawASCHouse(horoscope.asc_house, canvas, config, tip, {
    cx: cx,
    cy: cy,
    r: r / 9.0,
  });

  drawZodiac(canvas, config, {
    cx: cx,
    cy: cy,
    r0: (r * 2.0) / 9.0,
    r1: r / 9.0,
  });

  drawHouse(horoscope.houses, canvas, config, tip, {
    cx: cx,
    cy: cy,
    r0: (r * 3.0) / 9.0,
    r1: (r * 2.0) / 9.0,
  });

  // 画本命行星
  drawPlanets(
    horoscope.native_planets,
    horoscope.native_transformed_stars,
    canvas,
    tip,
    config,
    {
      cx: cx,
      cy: cy,
      r0: (r * 4.0) / 9.0,
      r1: (r * 3.0) / 9.0,
    },
    true
  );

  drawDistanceStar(horoscope.distance_star_long, canvas, tip, config, {
    cx: cx,
    cy: cy,
    r0: (r * 5.0) / 9.0,
    r1: (r * 4.0) / 9.0,
  });

  // 画推运行星
  drawPlanets(
    horoscope.process_planets,
    horoscope.process_transformed_stars,
    canvas,
    tip,
    config,
    {
      cx: cx,
      cy: cy,
      r0: (r * 6.0) / 9.0,
      r1: (r * 5.0) / 9.0,
    },
    false
  );

  // 画洞微
  drawDongWei(horoscope.dong_wei, canvas, tip, config, {
    cx: cx,
    cy: cy,
    r0: dongWeiR,
    r1: (r * 6.0) / 9.0,
  });

  // 画农历
  const nativeLunarCalendarText = `${formatLunarCalendar(
    horoscope.native_lunar_calendar
  )}
八字：${horoscope.bazi[0][0]} ${horoscope.bazi[1][0]} ${horoscope.bazi[2][0]} ${
    horoscope.bazi[3][0]
  }
            ${horoscope.bazi[0][1]} ${horoscope.bazi[1][1]} ${
    horoscope.bazi[2][1]
  } ${horoscope.bazi[3][1]}`;

  const nativeLunarCalendarTextCanvas = new fabric.FabricText(
    nativeLunarCalendarText,
    {
      fontSize: (config.fontSize * 2) / 3,
      selectable: false,
    }
  );

  nativeLunarCalendarTextCanvas.left = 0;
  nativeLunarCalendarTextCanvas.top = 0;
  canvas.add(nativeLunarCalendarTextCanvas);

  const processLunarCalendarText = formatLunarCalendar(
    horoscope.process_lunar_calendar
  );

  const processLunarCalendarTextCanvas = new fabric.FabricText(
    processLunarCalendarText,
    {
      fontSize: (config.fontSize * 2) / 3,
      selectable: false,
    }
  );

  processLunarCalendarTextCanvas.left =
    canvas.width! - processLunarCalendarTextCanvas.width!;
  processLunarCalendarTextCanvas.top = 0;
  canvas.add(processLunarCalendarTextCanvas);

  canvas.forEachObject((obj) => (obj.selectable = false));
}

// 添加日期格式化辅助函数
function formatDate(date: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}): string {
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.year}-${pad(date.month)}-${pad(date.day)} ${pad(
    date.hour
  )}:${pad(date.minute)}:${pad(date.second)}`;
}

// 添加农历信息格式化辅助函数
function formatLunarCalendar(lunar: LunarCalendar): string {
  const {
    lunar_year_gan_zhi,
    lunar_month_gan_zhi,
    lunar_day_gan_zhi,
    time_gan_zhi,
    solar_term_first,
    solar_term_second,
    lunar_year,
    lunar_month,
    lunar_day,
  } = lunar;

  return `${lunar_year_gan_zhi[0]} ${lunar_month_gan_zhi[0]} ${
    lunar_day_gan_zhi[0]
  } ${time_gan_zhi[0]}
${lunar_year_gan_zhi[1]} ${lunar_month_gan_zhi[1]} ${lunar_day_gan_zhi[1]} ${
    time_gan_zhi[1]
  }
${solar_term_first.name}：${formatDate(solar_term_first)}
${solar_term_second.name}：${formatDate(solar_term_second)}
农历：${lunar_year}年${lunar_month}${lunar_day}`;
}

/**
 * 绘制上升宫标注
 * @param asc_house  上升宫
 * @param canvas 天宫图canvas
 * @param options 天宫图的相关参数
 */
function drawASCHouse(
  asc_house: DeepReadonly<ASCHouse>,
  canvas: fabric.Canvas,
  config: DeepReadonly<QizhengConfigService>,
  tip: TipService,
  options: Readonly<{
    cx: number; // 圆心坐标：x
    cy: number; // 圆心坐标：y
    r: number; // 标注圆半径
  }>
) {
  const cx = options.cx;
  const cy = options.cy;

  const r = options.r;

  const houseNames = [
    '戌',
    '酉',
    '申',
    '未',
    '午',
    '巳',
    '辰',
    '卯',
    '寅',
    '丑',
    '子',
    '亥',
  ];
  const n = Math.floor(asc_house.asc_long / 30);
  const ascLongDMS = degreeToDMS(asc_house.asc_long - n * 30);

  const message = `命度：${asc_house.xiu}${Math.floor(
    asc_house.xiu_degree
  )}度\n上升：${houseNames[n]}宫${ascLongDMS.d}度${ascLongDMS.m}分${
    ascLongDMS.s
  }秒`;

  const houseNumText = new fabric.FabricText(
    `${asc_house.xiu}${Math.floor(asc_house.xiu_degree)}度`,
    {
      fontSize: config.fontSize,
      selectable: false,
    }
  );

  houseNumText.left = cx - houseNumText.width! / 2;
  houseNumText.top = cy - houseNumText.height! / 2;

  // 以下一行不能放到 mousedown的回调函数中，因为houseNumText添加到组后会
  // 重新计算坐标，此坐标不再是相对于整个画布
  tip.newTip(message, houseNumText, canvas);

  canvas.add(houseNumText);
}

/**
 * 绘制黄道12宫
 * @param canvas 天宫图canvas
 * @param options 天宫图的相关参数
 */
function drawZodiac(
  canvas: fabric.Canvas,
  config: DeepReadonly<QizhengConfigService>,
  options: Readonly<{
    cx: number; // 圆心坐标：x
    cy: number; // 圆心坐标：y
    r0: number; // 外圆半径
    r1: number; // 内圆半径
  }>
) {
  const cx = options.cx;
  const cy = options.cy;

  const r0 = options.r0;
  const r1 = options.r1;

  const houseNames = [
    '酉', // 酉宫从0度起
    '申',
    '未',
    '午',
    '巳',
    '辰',
    '卯',
    '寅',
    '丑',
    '子',
    '亥',
    '戌',
  ];

  houseNames.forEach((houseName, index) => {
    // 画宫位分隔线
    const x0 = cx + r1 * cos(30 * index);
    const y0 = cx - r1 * sin(30 * index);

    const x1 = cx + r0 * cos(30 * index);
    const y1 = cx - r0 * sin(30 * index);
    let path = new fabric.Path(`M ${x0}, ${y0} L ${x1} ${y1}`, {
      stroke: 'black',
      selectable: false,
    });
    canvas.add(path);

    // 画文字
    // r1+(r0-r1)/2=r0/2+r1/2=(r0+r1)/2
    const x = cx + ((r0 + r1) / 2) * cos(30 * index + 15);
    const y = cx - ((r0 + r1) / 2) * sin(30 * index + 15);

    let houseNumText = new fabric.FabricText(`${houseName}`, {
      fontSize: config.fontSize,
      selectable: false,
    });
    houseNumText.left = x - houseNumText.width! / 2;
    houseNumText.top = y - houseNumText.height! / 2;
    canvas.add(houseNumText);
  });
}

/**
 * 绘制宫位
 * @param houses 宫位
 * @param canvas 天宫图canvas
 * @param options 天宫图的相关参数
 */
function drawHouse(
  houses: ReadonlyArray<House>,
  canvas: fabric.Canvas,
  config: DeepReadonly<QizhengConfigService>,
  tip: TipService,
  options: Readonly<{
    cx: number; // 圆心坐标：x
    cy: number; // 圆心坐标：y
    r0: number; // 外圆半径
    r1: number; // 内圆半径
  }>
) {
  const cx = options.cx;
  const cy = options.cy;

  const r0 = options.r0;
  const r1 = options.r1;

  houses.forEach((house, index) => {
    // 画宫位分隔线
    const x0 = cx + r1 * cos(30 * index);
    const y0 = cx - r1 * sin(30 * index);

    const x1 = cx + r0 * cos(30 * index);
    const y1 = cx - r0 * sin(30 * index);
    let path = new fabric.Path(`M ${x0}, ${y0} L ${x1} ${y1}`, {
      stroke: 'black',
      selectable: true,
    });
    canvas.add(path);

    // 画文字
    // r1+(r0-r1)/2=r0/2+r1/2=(r0+r1)/2
    // 因为图上0度从酉开始，因需要减去30
    const x = cx + ((r0 + r1) / 2) * cos(house.long + 15 - 30);
    const y = cx - ((r0 + r1) / 2) * sin(house.long + 15 - 30);

    const xiuDMS = degreeToDMS(house.xiu_degree);

    const message = `${house.xiu}宿：${xiuDMS.d}度${xiuDMS.m}分${xiuDMS.s}秒`;

    const houseNumText = new fabric.FabricText(`${house.name}`, {
      fontSize: config.fontSize,
      selectable: true,
      // fontFamily: config.textFont,
    });
    houseNumText.left = x - houseNumText.width! / 2;
    houseNumText.top = y - houseNumText.height! / 2;

    tip.newTip(message, houseNumText, canvas);

    canvas.add(houseNumText);
  });
}

/**
 * 绘制本命盘行星
 * @param planets 行星数组，包含了四轴
 * @param canvas canvas
 * @param firstCupsLong 第一宫头度数
 * @param options (cx, cy)：画布中心坐标，r: 行星字符位置不能超过的半径
 */
function drawPlanets(
  planets: ReadonlyArray<Planet>,
  transformed_stars: ReadonlyArray<StarTransformedStar>,
  canvas: fabric.Canvas,
  tip: TipService,
  config: DeepReadonly<QizhengConfigService>,
  options: Readonly<{
    cx: number; // 圆心坐标：x
    cy: number; // 圆心坐标：y
    r0: number; // 外圆半径
    r1: number; // 内圆半径
  }>,
  is_native: boolean
) {
  const cx = options.cx;
  const cy = options.cy;

  const r0 = options.r0;
  const r1 = options.r1;
  // 依long从小到大对行星进行排序，方便后面计算绘制位置
  const planetsSorted = planets.toSorted(
    (a: Planet, b: Planet) => degNorm(a.long) - degNorm(b.long)
  );

  // p：行星在canvas的位置
  // 戌宫在-30.0度
  let p = planetsSorted.map((x) => degNorm(x.long - 30.0));
  // 克隆一份p，用于调整间距
  // let p0 = p.slice();

  // 以下调整行星间的输出间距，保证行星间到少相距w度
  let w = is_native ? 12 : 7; // 字符间宽度，以角度表示
  for (let i = 0; i < p.length; i++) {
    let n = 0; // 从行星i开始有n-1个行星需要调整间距
    for (let j = 1; j < p.length; j++) {
      if (degNorm(p[(i + j) % p.length] - p[i]) >= w * j) {
        n = j;
        break;
      }
    }

    // 当n===1时，不用调整，因为此行星i与行星i+1之间的间距已经至少是w度
    if (n === 1) {
      continue;
    }

    // n最小值是2，即行星i与行星i+1之间的间距至小于w度
    // 计算行星i与行星i+n-1的中间位置
    // (p[(i+n-1) % p.length] - p[i]) / 2 + p[i]
    const mid0 = degNorm(degNorm(p[(i + n - 1) % p.length] - p[i]) / 2 + p[i]);
    // 增加行星i+1...行星i+n-1的间距
    for (let j = 1; j < n; j++) {
      p[(i + j) % p.length] = degNorm(p[i] + j * w);
    }
    // 计算调整后的行星i与行星i+n-1的中间位置
    const mid1 = degNorm(degNorm(p[(i + n - 1) % p.length] - p[i]) / 2 + p[i]);
    // 计算需要顺时针移动的距离
    const d = degNorm(mid1 - mid0);
    // 顺时针调整i-1开始的行星位置
    // 需要调整m-1个
    let m = 0;
    for (let j = 1; j < p.length; j++) {
      const diff = degNorm(
        // 注意：这里必需用p(i-j+1) - p(i-j),这样作减法才是逆时针的间距
        p[(i - j + 1 + p.length) % p.length] - p[(i - j + p.length) % p.length]
      );

      // 如果diff<=d，必需移动d度
      if (diff <= d) {
        continue;
      }

      if (diff - d >= w) {
        //   // 当行星k-1与行星k的间距-d>=w时，不用调整
        m = j;
        break;
      }
    }

    // 以下两个循环可以合并成一个
    // 最后一个需要移动的行星是：i-(m-1)
    // 第二个循环最后一个需要移动的行星是：i+(n-1)
    // 从i-(m-1)共需要移动行星个数：i+(n-1)-(i-(m-1))+1=n+m-1
    // for(j=(i-(m-1)+p.length) % p.length;j<n+m;j++)
    for (let j = 1; j < m; j++) {
      p[(i - j + p.length) % p.length] = degNorm(
        p[(i - j + p.length) % p.length] - d
      );
    }

    // 从行星i开始顺时针移动
    for (let j = 0; j < n; j++) {
      p[(i + j) % p.length] = degNorm(p[(i + j) % p.length] - d);
    }
  }

  for (let i = 0; i < p.length; i++) {
    // 文字中心位置
    // r1+(r0-r1)/2 = (r0+r1)/2
    const x = cx + ((r0 + r1) / 2) * cos(p[i]);
    const y = cy - ((r0 + r1) / 2) * sin(p[i]);

    // 先画行星指示线，以保证行星名字的图层能在指示线之上
    // 标注线半径，本命行星：外圆半径，推运行星：内圆半径
    // const tipR = is_native ? r0 : r1;
    let x0 = x;
    let y0 = y;
    const x1 = cx + (is_native ? r0 : r1) * cos(planetsSorted[i].long - 30);
    const y1 = cy - (is_native ? r0 : r1) * sin(planetsSorted[i].long - 30);
    // (x0, y0), (x1, y1)组成的直线方程是：
    // x-x0=(x1-x0)t
    // y-y0=(y1-y0)t
    // 圆心(cx,cy),r= r1+(r0-r1)*2.5/3 作为标示线的起点
    // 直线与圆交点：
    // ((x1-x0)t+x0-cx)^2+((y1-y0)t+y0-cy)^2=(r1+(r0-r1)*2.5/3)^2
    // 在t=0处作牛顿迭代，求出t>0的值
    const f = (t: number) =>
      ((x1 - x0) * t + x0 - cx) ** 2 +
      ((y1 - y0) * t + y0 - cy) ** 2 -
      (r1 + ((r0 - r1) * (is_native ? 2.5 : 1)) / 3) ** 2;

    // 计算指示线靠近文字这一侧的坐标，保存在(x0, y0)中
    // (x1, y1)是行星的实际位置
    try {
      // 从t=1开始迭代
      // 直线与圆会有两个交点，如果从t=0开始迭代，
      // 当行星在画布上的位置与行星的实际位置相距太远
      // 可会得到t<0的另一个值，
      // 如1998年3月28日6:0，计算水星，会得到t<0的值
      const t = newtonIteration(1, f);
      x0 = x0 + (x1 - x0) * t;
      y0 = y0 + (y1 - y0) * t;
    } catch (error) {
      console.error('Error in newtonIteration:', error);
    }

    let path = new fabric.Path(`M ${x0}, ${y0} L ${x1} ${y1}`, {
      selectable: true,
      stroke: 'black',
      strokeDashArray: [3, 2], // strokeDashArray[a,b] =》 每隔a个像素空b个像素
    });
    canvas.add(path);

    // 绘制行星名
    const fontSize = config.fontSize;

    let color = '#28a745';
    if (planetsSorted[i].speed < 0) color = '#dc3545';
    if (planetsSorted[i].is_stationary) color = '#ffc107';

    const planetText = new fabric.FabricText(planetsSorted[i].name, {
      fontSize: fontSize,
      selectable: true,
      stroke: color,
      // fontFamily: config.planetFontFamily(planets[i].name),
    });
    planetText.left = x - planetText.width! / 2;
    planetText.top = y - planetText.height! / 2;

    const planetLongOnZoodiac = zodiacLong(planetsSorted[i].long);
    const planetLongDMSOnZoodiac = degreeToDMS(planetLongOnZoodiac.long);

    const xiuDMS = degreeToDMS(planetsSorted[i].xiu_degree);

    // 化曜，十神
    const transformed_star = transformed_stars.find(
      (starTransformedStar) =>
        starTransformedStar.star === planetsSorted[i].name
    );
    let message = `${planetsSorted[i].name}
${planetLongOnZoodiac.zodiac}宫：${planetLongDMSOnZoodiac.d}度${planetLongDMSOnZoodiac.m}分${planetLongDMSOnZoodiac.s}秒
${planetsSorted[i].xiu}宿：${xiuDMS.d}度${xiuDMS.m}分${xiuDMS.s}秒`;
    if (transformed_star) {
      message = `${message}\n${transformed_star.transformed_star}、${transformed_star.ten_gods}、${transformed_star.transformed_star_house}`;
    }
    message = `${message}\n${planetsSorted[i].speed_state}`;

    if (planetsSorted[i].speed < 0) message = `${message}、逆`;
    else message = `${message}、顺`;

    if (planetsSorted[i].is_stationary) message = `${message}、留`;

    tip.newTip(message, planetText, canvas);

    canvas.add(planetText);
  }
}

/**
 * 画二十八宿
 * @param distanceStarLongs
 * @param canvas
 * @param tip
 * @param config
 * @param options
 */
function drawDistanceStar(
  distanceStarLongs: ReadonlyArray<DistanceStarLong>,
  canvas: fabric.Canvas,
  tip: TipService,
  config: DeepReadonly<QizhengConfigService>,
  options: Readonly<{
    cx: number; // 圆心坐标：x
    cy: number; // 圆心坐标：y
    r0: number; // 外圆半径
    r1: number; // 内圆半径
  }>
) {
  const cx = options.cx;
  const cy = options.cy;

  const r0 = options.r0;
  const r1 = options.r1;

  distanceStarLongs.forEach((distance_star, index) => {
    // 画分隔线
    const x0 = cx + (r0 - 6) * cos(distance_star.long - 30);
    const y0 = cy - (r0 - 6) * sin(distance_star.long - 30);

    const x1 = cx + (r1 + 4) * cos(distance_star.long - 30);
    const y1 = cy - (r1 + 4) * sin(distance_star.long - 30);

    let path = new fabric.Path(`M ${x0}, ${y0} L ${x1} ${y1}`, {
      selectable: true,
      stroke: '#f28b82',
      // strokeDashArray: [3, 2], // strokeDashArray[a,b] =》 每隔a个像素空b个像素
    });
    canvas.add(path);

    // 画文字
    const next_distance_star =
      distanceStarLongs[(index + 1) % distanceStarLongs.length];

    // r=r1+(r0-r1)/2=(r0+r1)/2
    // long = long0+(long1-long0)/2=(long0+long1)/2
    // const long = (next_distance_star.long + distance_star.long) / 2;
    const long = degNorm(
      degNorm(next_distance_star.long - distance_star.long) / 2 +
        distance_star.long
    );
    const x = cx + ((r0 + r1) / 2) * cos(long - 30);
    const y = cy - ((r0 + r1) / 2) * sin(long - 30);

    const planetText = new fabric.FabricText(distance_star.lunar_mansions, {
      fontSize: config.fontSize,
      selectable: true,
      // stroke: 'black',
      // fontFamily: config.planetFontFamily(planets[i].name),
    });
    planetText.left = x - planetText.width! / 2;
    planetText.top = y - planetText.height! / 2;

    // 距星经度
    const planetLongOnZoodiac = zodiacLong(distance_star.long);
    const planetLongDMSOnZoodiac = degreeToDMS(planetLongOnZoodiac.long);

    // 宿宽度
    const xiuWidth = degNorm(next_distance_star.long - distance_star.long);
    const xiuDMS = degreeToDMS(xiuWidth);

    let message = `${distance_star.lunar_mansions}
${planetLongOnZoodiac.zodiac}宫：${planetLongDMSOnZoodiac.d}度${planetLongDMSOnZoodiac.m}分${planetLongDMSOnZoodiac.s}秒
宿宽：${xiuDMS.d}度${xiuDMS.m}分${xiuDMS.s}秒`;

    tip.newTip(message, planetText, canvas);

    canvas.add(planetText);
  });
}

function drawDongWei(
  dong_wei: DeepReadonly<DongWei>,
  canvas: fabric.Canvas,
  tip: TipService,
  config: DeepReadonly<QizhengConfigService>,
  options: Readonly<{
    cx: number; // 圆心坐标：x
    cy: number; // 圆心坐标：y
    r0: number; // 外圆半径
    r1: number; // 内圆半径
  }>
) {
  const cx = options.cx;
  const cy = options.cy;

  const r0 = options.r0;
  const r1 = options.r1;

  for (let i = 0; i < dong_wei.long_of_per_year.length - 1; i++) {
    // 画分隔线
    const x0 = cx + r0 * cos(dong_wei.long_of_per_year[i] - 30);
    const y0 = cy - r0 * sin(dong_wei.long_of_per_year[i] - 30);

    const x1 = cx + r1 * cos(dong_wei.long_of_per_year[i] - 30);
    const y1 = cy - r1 * sin(dong_wei.long_of_per_year[i] - 30);

    let path = new fabric.Path(`M ${x0}, ${y0} L ${x1} ${y1}`, {
      selectable: false,
      stroke: 'black',
      // strokeDashArray: [3, 2], // strokeDashArray[a,b] =》 每隔a个像素空b个像素
    });
    canvas.add(path);

    // 画文字
    const next_long =
      dong_wei.long_of_per_year[(i + 1) % dong_wei.long_of_per_year.length];

    // 洞微是逆行，因此用next_long+( long - next_long )/2
    const long = degNorm(
      degNorm(dong_wei.long_of_per_year[i] - next_long) / 2 + next_long
    );

    // r1+(r0-r1)/2=(r0+r1)/2
    const x = cx + ((r0 + r1) / 2) * cos(long - 30);
    const y = cy - ((r0 + r1) / 2) * sin(long - 30);

    const planetText = new fabric.FabricText(`${i + 1}`, {
      fontSize: config.fontSize / 2,
      selectable: false,
      // stroke: 'black',
      // fontFamily: config.planetFontFamily(planets[i].name),
    });
    planetText.left = x - planetText.width! / 2;
    planetText.top = y - planetText.height! / 2;

    canvas.add(planetText);
  }

  // 画当前的洞微
  // 画分隔线
  const x0 = cx + r0 * cos(dong_wei.long - 30);
  const y0 = cy - r0 * sin(dong_wei.long - 30);

  const x1 = cx + r1 * cos(dong_wei.long - 30);
  const y1 = cy - r1 * sin(dong_wei.long - 30);

  let path = new fabric.Path(`M ${x0}, ${y0} L ${x1} ${y1}`, {
    selectable: false,
    stroke: 'blue',
    strokeWidth: 5,
    // strokeDashArray: [3, 2], // strokeDashArray[a,b] =》 每隔a个像素空b个像素
  });

  // 距星经度
  const planetLongOnZoodiac = zodiacLong(dong_wei.long);
  const planetLongDMSOnZoodiac = degreeToDMS(planetLongOnZoodiac.long);

  // 宿宽度
  const xiuDMS = degreeToDMS(dong_wei.xiu_degree);

  let message = `${planetLongOnZoodiac.zodiac}宫：${planetLongDMSOnZoodiac.d}度${planetLongDMSOnZoodiac.m}分${planetLongDMSOnZoodiac.s}秒
${dong_wei.xiu}宿：${xiuDMS.d}度${xiuDMS.m}分${xiuDMS.s}秒`;

  tip.newTip(message, path, canvas);

  canvas.add(path);
}
