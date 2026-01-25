import * as fabric from 'fabric';
import { QizhengConfigService } from 'src/app/services/config/qizheng-config.service';
import { TipService } from 'src/app/services/qizheng/tip.service';
import { Horoscope } from 'src/app/type/interface/response-qizheng';
import {
  drawDistanceStar,
  drawHouse,
  drawPlanets,
  drawZodiac,
  formatLunarCalendar,
} from './qizheng';

export function drawQizhengSynastry(
  nativeHoro: Horoscope,
  comparisonHoro: Horoscope,
  canvas: fabric.Canvas,
  config: QizhengConfigService,
  tip: TipService,
  options: { width: number; height: number }
) {
  canvas.clear();
  canvas.setDimensions({ width: options.width, height: options.height });

  const cx = options.width / 2;
  const cy = options.height / 2;
  const r = options.width / 2;

  // Draw circles (1-8)
  for (let i = 1; i < 8; i++) {
    const r1 = (r / 9) * i;
    canvas.add(
      new fabric.Circle({
        left: cx,
        top: cy,
        radius: r1,
        fill: '',
        stroke: 'black',
        selectable: false,
      })
    );
  }

  // 1. Draw Zodiac (Houses 12) - Original logic (r0=2/9, r1=1/9)
  drawZodiac(canvas, config, {
    cx: cx,
    cy: cy,
    r0: (r * 2.0) / 9.0,
    r1: r / 9.0,
  });

  // 2. Draw House (Zodiac positions) - Base Chart Houses
  drawHouse(nativeHoro.houses, canvas, config, tip, {
    cx: cx,
    cy: cy,
    r0: (r * 3.0) / 9.0,
    r1: (r * 2.0) / 9.0,
  });

  // 3. Draw Base Chart Planets (Inner Ring: 3/9 - 4/9)
  drawPlanets(
    nativeHoro.native_planets,
    nativeHoro.native_transformed_stars,
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

  drawDistanceStar(nativeHoro.distance_star_long, canvas, tip, config, {
    cx: cx,
    cy: cy,
    r0: (r * 5.0) / 9.0,
    r1: (r * 4.0) / 9.0,
  });

  // 4. Draw Comparison Chart Planets (Outer Ring: 5/9 - 6/9)
  drawPlanets(
    comparisonHoro.native_planets, // Use comparison's native planets
    comparisonHoro.native_transformed_stars,
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

  // 5. Draw Comparison Chart 12 Houses (DongWei position: 6/9 - 6.5/9)
  drawHouse(comparisonHoro.houses, canvas, config, tip, {
    cx: cx,
    cy: cy,
    r0: (r * 7.0) / 9.0,
    r1: (r * 6.0) / 9.0,
  });

  // 6. Lunar Calendar Info
  // Native (Base) -> Top Left
  let nativeText = formatLunarCalendar(nativeHoro.native_lunar_calendar);
  if (nativeHoro.bazi && nativeHoro.bazi.length === 4) {
    nativeText += `
八字：${nativeHoro.bazi[0][0]} ${nativeHoro.bazi[1][0]} ${nativeHoro.bazi[2][0]} ${nativeHoro.bazi[3][0]}
            ${nativeHoro.bazi[0][1]} ${nativeHoro.bazi[1][1]} ${nativeHoro.bazi[2][1]} ${nativeHoro.bazi[3][1]}`;
  } else if (nativeHoro.bazi && nativeHoro.bazi.length > 0) {
    nativeText += ' ' + nativeHoro.bazi.join(' ');
  }

  const nativeTextObj = new fabric.FabricText(nativeText, {
    fontSize: (config.fontSize * 2) / 3,
    selectable: false,
  });
  nativeTextObj.left = nativeTextObj.width! / 2;
  nativeTextObj.top = nativeTextObj.height! / 2;
  canvas.add(nativeTextObj);

  // Comparison -> Top Right
  let comparisonText = formatLunarCalendar(
    comparisonHoro.native_lunar_calendar
  );
  if (comparisonHoro.bazi && comparisonHoro.bazi.length === 4) {
    comparisonText += `
八字：${comparisonHoro.bazi[0][0]} ${comparisonHoro.bazi[1][0]} ${comparisonHoro.bazi[2][0]} ${comparisonHoro.bazi[3][0]}
            ${comparisonHoro.bazi[0][1]} ${comparisonHoro.bazi[1][1]} ${comparisonHoro.bazi[2][1]} ${comparisonHoro.bazi[3][1]}`;
  } else if (comparisonHoro.bazi && comparisonHoro.bazi.length > 0) {
    comparisonText += ' ' + comparisonHoro.bazi.join(' ');
  }

  const comparisonTextObj = new fabric.FabricText(comparisonText, {
    fontSize: (config.fontSize * 2) / 3,
    selectable: false,
  });
  comparisonTextObj.left = canvas.width! - comparisonTextObj.width! / 2;
  comparisonTextObj.top = comparisonTextObj.height! / 2;
  canvas.add(comparisonTextObj);

  canvas.forEachObject((obj) => (obj.selectable = false));
}
