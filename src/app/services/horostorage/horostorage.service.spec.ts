import { TestBed } from '@angular/core/testing';
import { HoroStorageService } from './horostorage.service';
import { ProcessName } from 'src/app/process/enum/process';
import {
  HoroRequest,
  ProcessRequest,
} from 'src/app/type/interface/request-data';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import { createMockHoroRequest, createMockProcessRequest } from 'src/app/test-utils/test-data-factory.spec';

// 辅助函数：递归检查对象的只读性
function testDeepReadonly<T extends object>(obj: DeepReadonly<T>): void {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        // 递归检查嵌套对象
        testDeepReadonly(value as DeepReadonly<object>);
      }

      // 尝试修改属性，并期望抛出错误
      expect(() => {
        (obj as any)[key] = typeof value === 'number' ? value + 1 : 'new value';
      }).toThrowError(/Cannot assign to read only property/);
    }
  }
}

describe('HoroStorageService', () => {
  let service: HoroStorageService;
  let storage: Storage;

  const mockHoroData: HoroRequest = createMockHoroRequest({
    id: 1,
    date: {
      year: 2025,
      month: 7,
      day: 4,
      hour: 14,
      minute: 38,
      second: 0,
      tz: 8,
      st: false,
    },
    geo_name: '北京',
    geo: {
      long: 116.4167,
      lat: 39.9,
    },
    house: 'Alcabitus',
    sex: true,
    name: 'Test Name',
  });

  const mockProcessData: ProcessRequest = createMockProcessRequest({
    date: {
      year: 2026,
      month: 8,
      day: 4,
      hour: 14,
      minute: 38,
      second: 0,
      tz: 8,
      st: false,
    },
    geo_name: '北京',
    geo: {
      long: 116.4167,
      lat: 39.9,
    },
    process_name: ProcessName.Profection,
    isSolarReturn: false,
  });

  beforeEach(() => {
    storage = localStorage;
    // 监听 localStorage 交互来检查是否被调用
    spyOn(storage, 'setItem').and.callThrough();
    spyOn(storage, 'removeItem').and.callThrough();
    spyOn(storage, 'getItem').and.callThrough();

    TestBed.configureTestingModule({
      providers: [HoroStorageService],
    });

    service = TestBed.inject(HoroStorageService);
    service.clean(); // 确保每个测试都是从干净的状态开始
  });

  describe('#set horoData()', () => {
    it('应设置 horoData 并保存到 localStorage', () => {
      service.horoData = mockHoroData;
      const stored = localStorage.getItem('horo_data') as string;
      expect(JSON.parse(stored)).toEqual(mockHoroData);
      expect(service.horoData).toEqual(mockHoroData);
      // 检查 horoData 是否是只读的
      testDeepReadonly(service.horoData);
    });
  });

  describe('#set processData()', () => {
    it('应设置 processData 并保存到 localStorage', () => {
      service.processData = mockProcessData;
      const stored = localStorage.getItem('process_data');
      expect(JSON.parse(stored as string)).toEqual(mockProcessData);
      expect(service.processData).toEqual(mockProcessData);
      // 检查 processData 是否是只读的
      testDeepReadonly(service.processData);
    });
  });

  describe('#clean()', () => {
    it('应清除 horo 和 process 数据从 localStorage 并重设初始值', () => {
      service.horoData = mockHoroData;
      service.processData = mockProcessData;

      // 执行
      service.clean();

      // 检查从 localStorage 删除数据
      expect(localStorage.getItem('horo_data')).toBeNull();
      expect(localStorage.getItem('process_data')).toBeNull();

      // 检查重置到默认初始值
      const now = new Date();
      const expectedHoroData: HoroRequest = {
        id: 0,
        date: {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          day: now.getDate(),
          hour: now.getHours(),
          minute: now.getMinutes(),
          second: now.getSeconds(),
          tz: Math.abs(now.getTimezoneOffset() / 60),
          st: false,
        },
        geo_name: '北京',
        geo: { long: 116 + 25 / 60.0, lat: 39 + 54 / 60.0 },
        house: 'Alcabitus',
        sex: true,
        name: '',
      };

      expect(service.horoData).toEqual(
        jasmine.objectContaining({
          ...expectedHoroData,
          date: jasmine.objectContaining({
            ...expectedHoroData.date,
            tz: jasmine.any(Number),
          }),
        })
      );
    });
  });

  describe('#localStorage交互', () => {
    it('应该从localStorage加载内容（如有）', () => {
      // 在 beforeEach 之后，手动设置 localStorage
      const storedHoroData: HoroRequest = createMockHoroRequest({
        ...mockHoroData,
        house: 'Placidus',
      });
      const storedProcessData: ProcessRequest = createMockProcessRequest({
        ...mockProcessData,
        geo_name: '上海',
      });

      localStorage.setItem('horo_data', JSON.stringify(storedHoroData));
      localStorage.setItem('process_data', JSON.stringify(storedProcessData));

      // 重新初始化 TestBed，确保服务能从 localStorage 读取
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [HoroStorageService],
      });
      const testService = TestBed.inject(HoroStorageService);

      // 验证存储读取
      expect(localStorage.getItem('horo_data')).toBe(
        JSON.stringify(storedHoroData)
      );
      expect(localStorage.getItem('process_data')).toBe(
        JSON.stringify(storedProcessData)
      );
      // 检查初始值是否取自存储内容
      expect(testService.horoData).toEqual(storedHoroData);
      expect(testService.processData).toEqual(storedProcessData);
    });
  });
});
