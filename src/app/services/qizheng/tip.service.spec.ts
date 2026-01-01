import { TestBed } from '@angular/core/testing';
import { TipService } from './tip.service';
import { QizhengConfigService } from '../config/qizheng-config.service';
import * as fabric from 'fabric';

describe('TipService', () => {
  let service: TipService;
  // let config: QizhengConfigService;
  let canvas: fabric.Canvas;
  let object: fabric.Rect;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TipService, QizhengConfigService],
    });
    service = TestBed.inject(TipService);

    const el = document.createElement('canvas');
    canvas = new fabric.Canvas(el, { width: 200, height: 100 });
    object = new fabric.Rect({
      left: 35,
      top: 20,
      width: 50,
      height: 20,
    });
    canvas.add(object);
  });

  afterEach(() => {
    canvas.clear();
    canvas.dispose();
    TestBed.resetTestingModule();
  });

  // 两次占击同一对象，新 tip 与旧 tip 是不同对象
  it('should add tip on object mousedown and remove previous tip', () => {
    service.newTip('hello', object, canvas);

    // 模拟第一次点击
    object.fire('mousedown');
    expect(canvas._objects.some((o) => o.type === 'text')).toBeTrue();
    const tip1 = canvas._objects.find((o) => o.type === 'text') as fabric.Text;

    // 再次点击同一个控件，又生成 tip，新 tip 替换旧 tip
    object.fire('mousedown');
    const tips = canvas._objects.filter(
      (o) => o.type === 'text'
    ) as fabric.Text[];
    expect(tips.length).toBe(1);
    const tip2 = tips[0];
    expect(tip2).not.toBe(tip1);
  });

  // 点击 tip 可以移除 tip
  it('should remove tip on tip mousedown', () => {
    service.newTip('hey', object, canvas);
    object.fire('mousedown');
    const tip = canvas._objects.find((o) => o.type === 'text') as fabric.Text;

    tip.fire('mousedown');
    expect(canvas._objects.some((o) => o === tip)).toBeFalse();
  });

  // tip一定不会溢出画布左侧，代码已经保证
  // tip溢出画布右侧
  it('should position tip to right or left based on canvas width', () => {
    // 放一个很靠右的 object，模拟 tip 超出右侧，超出10像素
    // width: 50, height: 20
    // left: 35, top:20
    // 设置object的左侧距画面右侧5像素
    // object位于画面外
    object.set({ left: 220 });
    service.newTip('world', object, canvas);
    object.fire('mousedown');
    const tip = canvas._objects.find((o) => o.type === 'text') as fabric.Text;
    expect(tip.left! + tip.width! / 2).toBeLessThanOrEqual(canvas.width!);
  });

  // tip溢出上侧和下侧
  it('should adjust vertical position when top < 0 or bottom overflow', () => {
    // width: 50, height: 20
    // 让 object.top 为负
    object.set({ top: 0 });
    service.newTip('vert', object, canvas);
    object.fire('mousedown');
    const tip = canvas._objects.find((o) => o.type === 'text') as fabric.Text;
    expect(tip.top!).toBeGreaterThanOrEqual(0);

    // 测试底部溢出
    // width: 50, height: 20
    object.set({ top: canvas.height });
    service.newTip('vert2', object, canvas);
    object.fire('mousedown');
    const tip2 = canvas._objects.find((o) => o.type === 'text') as fabric.Text;
    expect(tip2.top! + tip2.height! / 2).toBeLessThanOrEqual(canvas.height!);
  });
});
