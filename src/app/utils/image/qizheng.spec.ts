import { TestBed } from '@angular/core/testing';
import { QizhengConfigService } from 'src/app/services/config/qizheng-config.service';
import * as fabric from 'fabric';

import { drawHoroscope } from './qizheng';
import { qizhengHoroscope } from './qizheng-horoscope.spec';
import { TipService } from 'src/app/services/qizheng/tip.service';

describe('Qizheng Horo Image Functions', () => {
  let canvas: fabric.Canvas;
  let config: QizhengConfigService;
  // let tip: TipService;
  let fabricjsObjects: fabric.Object[];

  beforeEach(() => {
    // 设置测试环境
    TestBed.configureTestingModule({
      providers: [QizhengConfigService, TipService],
    });

    // 获取服务实例
    config = TestBed.inject(QizhengConfigService);
    const tip = TestBed.inject(TipService);
    const canvasElement = document.createElement('canvas');

    canvas = new fabric.Canvas(canvasElement);

    drawHoroscope(qizhengHoroscope, canvas, config, tip, {
      width: config.HoroscoImage.width,
      height: config.HoroscoImage.height,
    });

    fabricjsObjects = canvas.getObjects();
  });

  it('检查fabricjs canvas 基础设置', () => {
    // 检查宽、高
    expect(canvas.width).toBe(config.HoroscoImage.width);
    expect(canvas.height).toBe(config.HoroscoImage.height);

    // 检查对象数量
    expect(fabricjsObjects.length).toBe(351);

    // 所有对象不可选中
    fabricjsObjects.forEach((o) => {
      expect(o.selectable).toBe(false);
    });
  });

  it('检查最后两个fabricjs object， 此两个object是农历和八字', () => {
    // 检查对象类型
    expect(fabricjsObjects.at(-2)?.type).toBe('text');
    expect(fabricjsObjects.at(-1)?.type).toBe('text');

    // 检查文本
    expect((fabricjsObjects.at(-2) as fabric.FabricText).text).toBe(
      '癸 癸 壬 甲\n酉 亥 子 辰\n立冬：1993-11-07 17:45:33\n小雪：1993-11-22 15:06:50\n农历：癸酉年十月十四\n八字：癸 癸 壬 甲\n            酉 亥 子 辰'
    );
    expect((fabricjsObjects.at(-1) as fabric.FabricText).text).toBe(
      '丙 丙 乙 戊\n申 申 酉 子\n立秋：2016-08-07 09:53:02\n处暑：2016-08-23 00:38:28\n农历：丙申年七月廿九'
    );
    expect((fabricjsObjects.at(-2) as fabric.FabricText).top).toBe(0);
    expect((fabricjsObjects.at(-2) as fabric.FabricText).left).toBe(0);
    expect((fabricjsObjects.at(-1) as fabric.FabricText).top).toBe(0);
    expect((fabricjsObjects.at(-1) as fabric.FabricText).left).toBe(
      547.0442708333334
    );
  });

  it('检查圆', () => {
    // 检查其它元素
    // 检查圆
    const fabricCircleObjects = (
      fabricjsObjects.filter((o) => o.type === 'circle') as fabric.Circle[]
    ).toSorted((o1, o2) => o1.radius - o2.radius);
    expect(fabricCircleObjects.length).toBe(7);

    //  检查所有圆
    const cx = config.HoroscoImage.width / 2;
    const cy = config.HoroscoImage.height / 2;
    const r = config.HoroscoImage.height / 2;

    expect(fabricCircleObjects[0].left).toBe(311.1111111111111);
    expect(fabricCircleObjects[0].top).toBe(311.1111111111111);
    expect(fabricCircleObjects[0].radius).toBe(38.888888888888886);

    expect(fabricCircleObjects[1].left).toBe(272.22222222222223);
    expect(fabricCircleObjects[1].top).toBe(272.22222222222223);
    expect(fabricCircleObjects[1].radius).toBe(77.77777777777777);

    expect(fabricCircleObjects[2].left).toBe(233.33333333333334);
    expect(fabricCircleObjects[2].top).toBe(233.33333333333334);
    expect(fabricCircleObjects[2].radius).toBe(116.66666666666666);

    expect(fabricCircleObjects[3].left).toBe(194.44444444444446);
    expect(fabricCircleObjects[3].top).toBe(194.44444444444446);
    expect(fabricCircleObjects[3].radius).toBe(155.55555555555554);

    expect(fabricCircleObjects[4].left).toBe(155.55555555555557);
    expect(fabricCircleObjects[4].top).toBe(155.55555555555557);
    expect(fabricCircleObjects[4].radius).toBe(194.44444444444443);

    expect(fabricCircleObjects[5].left).toBe(116.66666666666669);
    expect(fabricCircleObjects[5].top).toBe(116.66666666666669);
    expect(fabricCircleObjects[5].radius).toBe(233.33333333333331);

    expect(fabricCircleObjects[6].left).toBe(97.22222222222223);
    expect(fabricCircleObjects[6].top).toBe(97.22222222222223);
    expect(fabricCircleObjects[6].radius).toBe(252.77777777777777);
  });

  it('检查命度', () => {
    const ascHouseObjects = fabricjsObjects.filter(
      (o) =>
        o.type === 'text' && (o as fabric.FabricText).text.includes('房1度')
    );

    expect(ascHouseObjects.length).toBe(1);

    const ascHouseObject = ascHouseObjects[0];

    // 检查left,top
    expect(ascHouseObject.left).toBe(325);
    expect(ascHouseObject.top).toBe(338.7);
    expect(ascHouseObject.width).toBe(50);
    expect(ascHouseObject.height).toBe(22.599999999999998);

    // 触发点击事件
    ascHouseObject.fire('mousedown');

    // 获取更新后的对象列表并检查文本内容
    const updatedObjects = canvas.getObjects();
    const infoTextObject = updatedObjects.find(
      (o) =>
        o.type === 'text' &&
        (o as fabric.FabricText).text.includes('命度：房1度') &&
        (o as fabric.FabricText).text.includes('上升：寅宫28度48分38秒')
    );

    expect(infoTextObject).toBeTruthy();
  });

  it('检查星座', () => {
    const expectedPositions = [
      { text: '酉', left: 396.3456732001956, top: 323.6022223690196 },
      { text: '申', left: 381.2478955692153, top: 297.45210443078474 },
      { text: '未', left: 355.0977776309804, top: 282.35432679980437 },
      { text: '午', left: 324.9022223690196, top: 282.35432679980437 },
      { text: '巳', left: 298.75210443078475, top: 297.4521044307847 },
      { text: '辰', left: 283.6543267998044, top: 323.6022223690196 },
      { text: '卯', left: 283.6543267998043, top: 353.79777763098036 },
      { text: '寅', left: 298.7521044307847, top: 379.94789556921523 },
      { text: '丑', left: 324.9022223690196, top: 395.0456732001956 },
      { text: '子', left: 355.0977776309804, top: 395.0456732001956 },
      { text: '亥', left: 381.24789556921525, top: 379.9478955692153 },
      { text: '戌', left: 396.3456732001956, top: 353.79777763098036 },
    ];

    const houseTextObjects = expectedPositions
      .map((pos) =>
        fabricjsObjects.filter(
          (o): o is fabric.FabricText =>
            o.type === 'text' &&
            (o as fabric.FabricText).text === pos.text &&
            o.left === pos.left &&
            o.top === pos.top
        )
      )
      .flat();

    expect(houseTextObjects.length).toBe(12);
    houseTextObjects.forEach((textObj) => {
      expect(textObj.fontSize).toBe(20);
    });
  });

  it('检查宫位', () => {
    // prettier-ignore
    const expectedHouses = [
      { text: '命', left: 271.2535073846412, top: 407.44649261535875, tip: "氐宿：15度0分13秒" },
      { text: '财', left: 314.8370372816994, top: 432.6094553336594, tip: "尾宿：13度55分53秒" },
      { text: '兄', left: 365.16296271830066, top: 432.6094553336594, tip: "斗宿：19度54分17秒" },
      { text: '田', left: 408.74649261535876, top: 407.4464926153588, tip: "虚宿：6度41分14秒" },
      // { text: '子', left: 355.0977776309804, top: 395.0456732001956 },
      { text: '子', left: 433.9094553336594, top: 363.8629627183006, tip: "室宿：6度35分36秒" },
      { text: '奴', left: 433.9094553336594, top: 313.5370372816994, tip: "奎宿：7度42分1秒" },
      { text: '妻', left: 408.74649261535876, top: 269.9535073846412, tip: "昴宿：0度39分48秒" },
      { text: '疾', left: 365.1629627183006, top: 244.79054466634057, tip: "参宿：5度23分37秒" },
      { text: '迁', left: 314.83703728169934, top: 244.79054466634057, tip: "井宿：24度46分27秒" },
      { text: '官', left: 271.25350738464124, top: 269.9535073846412, tip: "星宿：2度48分2秒" },
      { text: '福', left: 246.09054466634058, top: 313.5370372816993, tip: "翼宿：6度23分33秒" },
      { text: '相', left: 246.09054466634058, top: 363.8629627183006, tip: "角宿：6度14分38秒" },
    ];

    const houseTextObjects = expectedHouses
      .map((house) =>
        fabricjsObjects.filter(
          (o): o is fabric.FabricText =>
            o.type === 'text' &&
            (o as fabric.FabricText).text === house.text &&
            o.left === house.left &&
            o.top === house.top
        )
      )
      .flat();

    expect(houseTextObjects.length).toBe(12);

    houseTextObjects.forEach((textObj) => {
      expect(textObj.fontSize).toBe(20);
    });

    // 检查点击事件
    expectedHouses.forEach((houseInfo) => {
      const houseObject = houseTextObjects.find(
        (o) =>
          o.text === houseInfo.text &&
          o.left === houseInfo.left &&
          o.top === houseInfo.top
      );

      expect(houseObject).toBeTruthy();

      // 触发点击事件
      houseObject!.fire('mousedown');

      // 检查提示是否显示
      const updatedObjects = canvas.getObjects();
      const tipObject = updatedObjects.find(
        (o) =>
          o.type === 'text' &&
          (o as fabric.FabricText).text.includes(houseInfo.tip)
      );

      expect(tipObject)
        .withContext(
          `houseInfo.text: ${houseInfo.text}, houseInfo.tip: ${houseInfo.tip}`
        )
        .toBeTruthy();

      // 清理提示对象，以便下一次迭代
      canvas.remove(tipObject!);
    });
  });

  it('检查二十八宿距星', () => {
    // prettier-ignore
    const expectDistanceStars = [
      // 东方七宿
      { text: '角', left: 165.02247428510714, top: 335.8954510712054, tip: "辰宫：23度45分21秒\n宿宽：10度39分6秒" },
      { text: '亢', left: 167.5028586021662, top: 368.1912904020108, tip: "卯宫：4度24分27秒\n宿宽：10度35分18秒" },
      { text: '氐', left: 180.03593239966597, top: 409.66828218828294, tip: "卯宫：14度59分46秒\n宿宽：17度51分24秒" },
      { text: '房', left: 197.1455232796663, top: 439.7821372991273, tip: "寅宫：2度51分10秒\n宿宽：4度51分35秒" },
      { text: '心', left: 209.72631965499025, top: 455.5493397900314, tip: "寅宫：7度42分45秒\n宿宽：8度21分21秒" },
      { text: '尾', left: 236.20534069447848, top: 479.5959499050654, tip: "寅宫：16度4分6秒\n宿宽：15度6分23秒" },
      { text: '箕', left: 267.80457145634335, top: 498.11398965397535, tip: "丑宫：1度10分30秒\n宿宽：8度55分12秒" },
      // 北方七宿
      { text: '斗', left: 315.73303612441913, top: 512.0093028785855, tip: "丑宫：10度5分42秒\n宿宽：23度52分4秒" },
      { text: '牛', left: 363.754465584036, top: 512.0802911660287, tip: "子宫：3度57分47秒\n宿宽：7度40分35秒" },
      { text: '女', left: 392.5541526032325, top: 505.622320389324, tip: "子宫：11度38分22秒\n宿宽：11度40分22秒" },
      { text: '虚', left: 422.9437306651983, top: 492.79522232483083, tip: "子宫：23度18分45秒\n宿宽：9度57分30秒" },
      { text: '危', left: 460.10446993605115, top: 465.9788918139225, tip: "亥宫：3度16分16秒\n宿宽：20度8分7秒" },
      { text: '室', left: 493.4159840168836, top: 422.893443023381, tip: "亥宫：23度24分23秒\n宿宽：15度40分18秒" },
      { text: '壁', left: 509.5693579142513, top: 381.9577490924865, tip: "戌宫：9度4分41秒\n宿宽：13度13分16秒" },
      // 西方七宿
      { text: '奎', left: 514.9034452183806, top: 344.5124737195905, tip: "戌宫：22度17分58秒\n宿宽：11度35分39秒" },
      { text: '娄', left: 512.1378891761963, top: 307.17941767727683, tip: "酉宫：3度53分37秒\n宿宽：12度57分56秒" },
      { text: '胃', left: 500.97121047727825, top: 270.0467451792722, tip: "酉宫：16度51分34秒\n宿宽：12度28分37秒" },
      { text: '昴', left: 485.3152702865465, top: 241.18860465797889, tip: "酉宫：29度20分11秒\n宿宽：9度3分10秒" },
      { text: '毕', left: 461.542531731754, top: 212.79363407581187, tip: "申宫：8度23分21秒\n宿宽：15度14分30秒" },
      { text: '觜', left: 442.56893906995754, top: 196.90926427279058, tip: "申宫：23度37分52秒\n宿宽：0度58分29秒" },
      { text: '参', left: 427.72249666604534, top: 187.2742307971471, tip: "申宫：24度36分22秒\n宿宽：10度37分10秒" },
      // 南方七宿
      { text: '井', left: 369.07049004898823, top: 166.1314437439089, tip: "未宫：5度13分32秒\n宿宽：30度25分28秒" },
      { text: '鬼', left: 315.83220164611686, top: 165.37684077790976, tip: "午宫：5度39分0秒\n宿宽：4度34分32秒" },
      { text: '柳', left: 283.85643152859734, top: 172.9504910435722, tip: "午宫：10度13分33秒\n宿宽：16度58分24秒" },
      { text: '星', left: 248.81085936885063, top: 189.33621379011421, tip: "午宫：27度11分57秒\n宿宽：8度24分40秒" },
      { text: '张', left: 217.1038576069987, top: 214.1145346161152, tip: "巳宫：5度36分37秒\n宿宽：17度59分49秒" },
      { text: '翼', left: 185.3060815504804, top: 256.87829386566557, tip: "巳宫：23度36分26秒\n宿宽：17度2分2秒" },
      { text: '轸', left: 169.34976572288937, top: 299.9250397657553, tip: "辰宫：10度38分29秒\n宿宽：13度6分52秒" },
    ];

    const distanceStarObjects = expectDistanceStars
      .map((star) =>
        fabricjsObjects.filter(
          (o): o is fabric.FabricText =>
            o.type === 'text' &&
            (o as fabric.FabricText).text === star.text &&
            o.left === star.left &&
            o.top === star.top
        )
      )
      .flat();

    expect(distanceStarObjects.length).toBe(28);

    // 检查字体
    distanceStarObjects.forEach((textObj) => {
      expect(textObj.fontSize).toBe(20);
    });

    // 检查点击事件和提示信息
    expectDistanceStars.forEach((starInfo) => {
      const starObject = distanceStarObjects.find(
        (o) =>
          o.text === starInfo.text &&
          o.left === starInfo.left &&
          o.top === starInfo.top
      );

      expect(starObject).toBeTruthy();

      // 触发点击事件
      starObject!.fire('mousedown');

      // 检查提示是否显示
      const updatedObjects = canvas.getObjects();
      const tipObject = updatedObjects.find(
        (o) =>
          o.type === 'text' &&
          (o as fabric.FabricText).text.includes(starInfo.tip)
      );

      expect(tipObject)
        .withContext(
          `starInfo.text: ${starInfo.text}, starInfo.tip: ${starInfo.tip}`
        )
        .toBeTruthy();

      // 清理提示对象，以便下一次迭代
      canvas.remove(tipObject!);
    });
  });

  it('检查本命行星', () => {
    // prettier-ignore
    const expectPlanets = [
      { text: '日', left: 237.8096043882739, top: 428.6074947522182, tip: "日\n寅宫：4度45分58秒\n房宿：1度54分47秒\n均、顺" },
      { text: '月', left: 474.25083845350116, top: 316.27352139917684, tip: "月\n酉宫：9度29分1秒\n娄宿：5度35分23秒\n天刑、七杀、奴仆\n迟、顺" },
      { text: '水', left: 204.47993380229772, top: 351.3706837097148, tip: "水\n卯宫：15度47分21秒\n氐宿：0度47分34秒\n天印、正印、田宅\n均、顺" },
      { text: '金', left: 210.0757556713349, top: 379.2700049732135, tip: "金\n卯宫：22度28分45秒\n氐宿：7度28分59秒\n天荫、偏财、妻妾\n疾、顺" },
      { text: '木', left: 204.90162419319802, top: 322.127027355802, tip: "木\n卯宫：3度27分14秒\n角宿：9度41分53秒\n天耗、正财、兄弟\n疾、顺" },
      { text: '火', left: 258.73552896547415, top: 447.88937821683913, tip: "火\n寅宫：12度53分37秒\n心宿：5度10分51秒\n天暗、伤官、相貌\n疾、顺" },
      { text: '土', left: 396.2143256222325, top: 462.6604136921898, tip: "土\n子宫：24度23分37秒\n虚宿：1度4分51秒\n天贵、正官、男女\n均、顺" },
      { text: '气', left: 361.20823185104564, top: 204.25132775049977, tip: "气\n未宫：21度2分9秒\n井宿：15度48分37秒\n天囚、偏印、疾厄\n均、顺" },
      { text: '罗', left: 454.21772256716775, top: 264.6692873229581, tip: "罗\n申宫：2度56分58秒\n昴宿：3度36分46秒\n天禄、比肩、官禄\n均、逆" },
      { text: '计', left: 221.3498904632292, top: 405.39622234289976, tip: "计\n寅宫：2度56分58秒\n房宿：0度5分47秒\n天权、劫财、命宫\n均、逆" },
      { text: '孛', left: 471.7360934229805, top: 372.9320939697381, tip: "孛\n戌宫：15度26分1秒\n壁宿：6度21分19秒\n天福、食神、财帛、福德、迁移\n均、顺" },
    ];

    const planetObjects = expectPlanets
      .map((planet) =>
        fabricjsObjects.filter(
          (o): o is fabric.FabricText =>
            o.type === 'text' &&
            (o as fabric.FabricText).text === planet.text &&
            o.left === planet.left &&
            o.top === planet.top
        )
      )
      .flat();

    expect(planetObjects.length).toBe(11);

    // 检查点击事件和提示信息
    expectPlanets.forEach((planetInfo) => {
      const planetObject = planetObjects.find(
        (o) =>
          o.text === planetInfo.text &&
          o.left === planetInfo.left &&
          o.top === planetInfo.top
      );

      expect(planetObject).toBeTruthy();

      // 触发点击事件
      planetObject!.fire('mousedown');

      // 检查提示是否显示
      const updatedObjects = canvas.getObjects();
      const tipObject = updatedObjects.find(
        (o) =>
          o.type === 'text' &&
          (o as fabric.FabricText).text.includes(planetInfo.tip)
      );

      expect(tipObject)
        .withContext(
          `planetInfo.text: ${planetInfo.text}, planetInfo.tip: ${planetInfo.tip}`
        )
        .toBeTruthy();

      // 清理提示对象，以便下一次迭代
      canvas.remove(tipObject!);
    });
  });

  it('检查推运行星', () => {
    // prettier-ignore
    const expectPlanets = [
      { text: '日', left: 210.73252108897137, top: 168.29349869764286, tip: "日\n巳宫：8度39分41秒\n张宿：3度3分4秒\n均、顺" },
      { text: '月', left: 236.92694994077692, top: 151.284944197078, tip: "月\n巳宫：0度17分15秒\n星宿：3度5分18秒\n天耗、伤官、兄弟\n均、顺" },
      { text: '水', left: 154.70254777705898, top: 231.8669012439948, tip: "水\n巳宫：29度0分57秒\n翼宿：5度24分30秒\n天荫、偏财、妻妾\n迟、逆、留" },
      { text: '金', left: 143.06404728784656, top: 255.2452977988662, tip: "金\n辰宫：1度55分49秒\n翼宿：8度19分22秒\n天暗、劫财、相貌\n疾、顺" },
      { text: '木', left: 169.10340648650984, top: 210.08114012475312, tip: "木\n巳宫：28度8分18秒\n翼宿：4度31分51秒\n天禄、比肩、官禄\n疾、顺" },
      { text: '火', left: 189.81485917225086, top: 490.99208864767934, tip: "火\n寅宫：13度45分4秒\n心宿：6度2分19秒\n天囚、偏印、疾厄\n均、顺" },
      { text: '土', left: 172.37457958841642, top: 471.5539620107858, tip: "土\n寅宫：10度2分48秒\n心宿：2度20分3秒\n天福、食神、财帛、福德、迁移\n迟、顺" },
      { text: '气', left: 547.8219901102876, top: 288.11860799935437, tip: "气\n酉宫：13度40分44秒\n娄宿：9度47分7秒\n天贵、正财、男女\n均、顺" },
      { text: '罗', left: 485.0650382680766, top: 495.87694316408164, tip: "罗\n亥宫：12度42分18秒\n危宿：9度26分2秒\n天印、正官、田宅\n均、逆" },
      { text: '计', left: 190.92873284879613, top: 185.31742569620928, tip:"计\n巳宫：12度42分18秒\n张宿：7度5分41秒\n天刑、七杀、奴仆\n均、逆" },
      { text: '孛', left: 130.3165675015216, top: 380.9056267075792, tip: "孛\n卯宫：11度22分50秒\n亢宿：6度58分22秒\n天权、正印、命宫\n均、顺" },
    ];

    const planetObjects = expectPlanets
      .map((planet) =>
        fabricjsObjects.filter(
          (o): o is fabric.FabricText =>
            o.type === 'text' &&
            (o as fabric.FabricText).text === planet.text &&
            o.left === planet.left &&
            o.top === planet.top
        )
      )
      .flat();

    expect(planetObjects.length).toBe(11);

    // 检查点击事件和提示信息
    expectPlanets.forEach((planetInfo) => {
      const planetObject = planetObjects.find(
        (o) =>
          o.text === planetInfo.text &&
          o.left === planetInfo.left &&
          o.top === planetInfo.top
      );

      expect(planetObject).toBeTruthy();

      // 触发点击事件
      planetObject!.fire('mousedown');

      // 检查提示是否显示
      const updatedObjects = canvas.getObjects();
      const tipObject = updatedObjects.find(
        (o) =>
          o.type === 'text' &&
          (o as fabric.FabricText).text.includes(planetInfo.tip)
      );

      expect(tipObject)
        .withContext(
          `planetInfo.text: ${planetInfo.text}, planetInfo.tip: ${planetInfo.tip}`
        )
        .toBeTruthy();

      // 清理提示对象，以便下一次迭代
      canvas.remove(tipObject!);
    });
  });

  // 检查洞微
  it('检查洞微', () => {
    // 检查文本值1到96的存在
    const expectedNumbers = Array.from({ length: 96 }, (_, i) =>
      (i + 1).toString()
    );
    const numberTextObjects = fabricjsObjects.filter(
      (o) =>
        o.type === 'text' &&
        expectedNumbers.includes((o as fabric.FabricText).text)
    );
    expect(numberTextObjects.length).toBe(96);
    expectedNumbers.forEach((number) => {
      const found = numberTextObjects.some(
        (o) => (o as fabric.FabricText).text === number
      );
      expect(found).withContext(`数字 ${number} 不存在`).toBe(true);
    });

    // 检查推运时刻洞微
    const processDongWeiObjects = fabricjsObjects.filter(
      (o): o is fabric.Path =>
        o.type === 'path' &&
        (o as fabric.Path).stroke === 'blue' &&
        o.strokeWidth === 5 &&
        o.left === 95.11670847058252 &&
        o.top === 333.3833752246271
    );

    expect(processDongWeiObjects.length).toBe(1);

    const dongWeiObject = processDongWeiObjects[0];
    // 模拟鼠标点击事件
    dongWeiObject.fire('mousedown');
    // 获取提示文本对象
    const tipObject = canvas
      .getObjects()
      .find(
        (obj) =>
          obj.type === 'text' &&
          (obj as fabric.FabricText).text ===
            '辰宫：26度47分54秒\n角宿：3度2分33秒'
      );
    expect(tipObject).toBeTruthy();
  });

  it('检查除洞微指示线外的其它线数量', () => {
    const otherLineObjects = fabricjsObjects.filter(
      (o) =>
        o.type === 'path' &&
        (o as fabric.Path).stroke !== 'blue' &&
        o.strokeWidth !== 5
    );
    expect(otherLineObjects.length).toBe(170);
  });
});
