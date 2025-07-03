import { TestBed } from '@angular/core/testing';
import { TipService } from './tip.service';
import { QizhengConfigService } from '../config/qizheng-config.service';
import * as fabric from 'fabric';

describe('TipService', () => {
  let service: TipService;
  let config: QizhengConfigService;
  let canvas: fabric.Canvas;
  let object: fabric.Rect;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TipService, QizhengConfigService],
    });
    service = TestBed.inject(TipService);
    config = TestBed.inject(QizhengConfigService);

    // 创建 Canvas 和 测试对象
    const el = document.createElement('canvas');
    canvas = new fabric.Canvas(el, { width: 200, height: 100 });
    object = new fabric.Rect({
      left: 10,
      top: 10,
      width: 50,
      height: 20,
    });
    canvas.add(object);
  });

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
    expect(tip2).not.toEqual(tip1);
  });

  it('should remove tip on tip mousedown', () => {
    service.newTip('hey', object, canvas);
    object.fire('mousedown');
    const tip = canvas._objects.find((o) => o.type === 'text') as fabric.Text;

    tip.fire('mousedown');
    expect(canvas._objects.some((o) => o === tip)).toBeFalse();
  });

  it('should position tip to right or left based on canvas width', () => {
    // 放一个很靠右的 object，模拟 tip 超出右侧
    object.set({ left: 160, width: 50, height: 20 });
    service.newTip('world', object, canvas);
    object.fire('mousedown');
    const tip = canvas._objects.find((o) => o.type === 'text') as fabric.Text;
    expect(tip.left! + tip.width!).toBeLessThanOrEqual(canvas.width!);
  });

  it('should adjust vertical position when top < 0 or bottom overflow', () => {
    // 让 object.top 为负
    object.set({ top: -10 });
    service.newTip('vert', object, canvas);
    object.fire('mousedown');
    const tip = canvas._objects.find((o) => o.type === 'text') as fabric.Text;
    expect(tip.top!).toBeGreaterThanOrEqual(0);

    // 测试底部溢出
    object.set({ top: 90, height: 20 });
    service.newTip('vert2', object, canvas);
    object.fire('mousedown');
    const tip2 = canvas._objects.find((o) => o.type === 'text') as fabric.Text;
    expect(tip2.top! + tip2.height!).toBeLessThanOrEqual(canvas.height!);
  });
});
