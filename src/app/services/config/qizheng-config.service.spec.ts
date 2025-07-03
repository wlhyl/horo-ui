import { TestBed } from '@angular/core/testing';

import { QizhengConfigService } from './qizheng-config.service';

describe('QizhengConfigService', () => {
  let service: QizhengConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QizhengConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('字体大小应为20像素', () => {
    expect(service.fontSize).toBe(20);
  });

  it('注释文本颜色应为黄色调色板', () => {
    expect(service.noteTextColor).toBe('#FFFF99');
  });

  it('本命盘图像尺寸应为700x700像素', () => {
    expect(service.HoroscoImage.width).toBe(700);
    expect(service.HoroscoImage.height).toBe(700);
  });
});
