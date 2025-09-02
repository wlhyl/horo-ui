import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { IonicModule, NavController } from '@ionic/angular';

import { QizhengHoroDetailComponent } from './detail.component';
import { Horoscope } from 'src/app/type/interface/response-qizheng';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { LunarMansionsName } from 'src/app/type/enum/qizheng';

const mockHoroscopeData: Horoscope = {
  native_date: {
    year: 1990,
    month: 5,
    day: 15,
    hour: 10,
    minute: 30,
    second: 0,
    tz: 8,
  },
  process_date: {
    year: 2023,
    month: 10,
    day: 20,
    hour: 14,
    minute: 45,
    second: 0,
    tz: 8,
  },
  geo: {
    long: 116.4074,
    lat: 39.9042,
  },
  native_planets: [],
  process_planets: [],
  distance_star_long: [],
  asc_house: {
    asc_long: 0,
    xiu: LunarMansionsName.角,
    xiu_degree: 0,
  },
  houses: [],
  native_lunar_calendar: {
    is_lean_year: false,
    lunar_year: '庚午年',
    lunar_month: '四月',
    lunar_day: '廿一',
    lunar_year_gan_zhi: '庚午',
    lunar_month_gan_zhi: '辛巳',
    lunar_day_gan_zhi: '庚辰',
    time_gan_zhi: '丙午',
    solar_term_first: {
      name: '立夏',
      year: 1990,
      month: 5,
      day: 6,
      hour: 2,
      minute: 35,
      second: 26,
    },
    solar_term_second: {
      name: '小满',
      year: 1990,
      month: 5,
      day: 21,
      hour: 15,
      minute: 37,
      second: 23,
    },
  },
  process_lunar_calendar: {
    is_lean_year: false,
    lunar_year: '癸卯年',
    lunar_month: '九月',
    lunar_day: '初六',
    lunar_year_gan_zhi: '癸卯',
    lunar_month_gan_zhi: '壬戌',
    lunar_day_gan_zhi: '辛亥',
    time_gan_zhi: '己未',
    solar_term_first: {
      name: '寒露',
      year: 2023,
      month: 10,
      day: 8,
      hour: 21,
      minute: 15,
      second: 23,
    },
    solar_term_second: {
      name: '霜降',
      year: 2023,
      month: 10,
      day: 24,
      hour: 0,
      minute: 20,
      second: 39,
    },
  },
  bazi: ['庚午', '辛巳', '庚辰', '丙午'],
  dong_wei: {
    long_of_per_year: [],
    long: 0,
    xiu: LunarMansionsName.角,
    xiu_degree: 0,
    lunar_mansions_dong_wei_time: [],
  },
  native_transformed_stars: [
    {
      star: '火',
      transformed_star: '天禄',
      transformed_star_house: '官禄',
      transformed_star_describe: '天禄化禄在命宫，主富贵。',
      ten_gods: '正财',
    },
  ],
  process_transformed_stars: [
    {
      star: '金',
      transformed_star: '天权',
      transformed_star_house: '命宫',
      transformed_star_describe: '天权在命宫，主感情顺。',
      ten_gods: '七杀',
    },
  ],
};

describe('QizhengHoroDetailComponent', () => {
  let component: QizhengHoroDetailComponent;
  let fixture: ComponentFixture<QizhengHoroDetailComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let titleServiceSpy: jasmine.SpyObj<Title>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['currentNavigation']);
    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);

    await await TestBed.configureTestingModule({
      declarations: [QizhengHoroDetailComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: Title, useValue: titleServiceSpy },
        { provide: NavController, useValue: {} },
      ],
    }).compileComponents();
  });

  describe('Component Creation and Initialization', () => {
    it('should create the component', () => {
      routerSpy.currentNavigation.and.returnValue(null);
      fixture = TestBed.createComponent(QizhengHoroDetailComponent);
      component = fixture.componentInstance;

      expect(component).toBeTruthy();
      expect(component.title).toBe('星盘详情');
    });

    it('should set the title on ngOnInit', () => {
      routerSpy.currentNavigation.and.returnValue(null);
      fixture = TestBed.createComponent(QizhengHoroDetailComponent);
      component = fixture.componentInstance;

      component.ngOnInit();
      expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('星盘详情');
    });

    it('should initialize collapse states correctly', () => {
      routerSpy.currentNavigation.and.returnValue(null);
      fixture = TestBed.createComponent(QizhengHoroDetailComponent);
      component = fixture.componentInstance;

      expect(component.isNativeTransformedStarsCollapsed).toBe(true);
      expect(component.isProcessTransformedStarsCollapsed).toBe(true);
      expect(component.isLunarMansionsCollapsed).toBe(true);
    });
  });

  describe('Router State Handling', () => {
    it('should set horoscopeData from router state', () => {
      routerSpy.currentNavigation.and.returnValue({
        extras: {
          state: {
            data: mockHoroscopeData,
          },
        },
      } as any);

      fixture = TestBed.createComponent(QizhengHoroDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.horoscopeData).toEqual(mockHoroscopeData);
      expect(component.planetsGoodConfigs).toBeDefined();
      expect(component.planetsBadConfigs).toBeDefined();
      expect(Array.isArray(component.planetsGoodConfigs)).toBe(true);
      expect(Array.isArray(component.planetsBadConfigs)).toBe(true);
    });

    it('should have null horoscopeData if router state is missing', () => {
      routerSpy.currentNavigation.and.returnValue({
        extras: {},
      } as any);

      fixture = TestBed.createComponent(QizhengHoroDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.horoscopeData).toBeNull();
    });

    it('should have null horoscopeData if navigation is null', () => {
      routerSpy.currentNavigation.and.returnValue(null);

      fixture = TestBed.createComponent(QizhengHoroDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.horoscopeData).toBeNull();
    });
  });

  describe('天厨 Method Tests', () => {
    beforeEach(() => {
      routerSpy.currentNavigation.and.returnValue(null);
      fixture = TestBed.createComponent(QizhengHoroDetailComponent);
      component = fixture.componentInstance;
    });

    it('should return correct index for 甲', () => {
      expect(component.天厨('甲')).toBe(5);
    });

    it('should return correct index for 乙', () => {
      expect(component.天厨('乙')).toBe(6);
    });

    it('should return correct index for 丙', () => {
      expect(component.天厨('丙')).toBe(0);
    });

    it('should return correct index for 丁', () => {
      expect(component.天厨('丁')).toBe(5);
    });

    it('should return correct index for 戊', () => {
      expect(component.天厨('戊')).toBe(6);
    });

    it('should return correct index for 己', () => {
      expect(component.天厨('己')).toBe(8);
    });

    it('should return correct index for 庚', () => {
      expect(component.天厨('庚')).toBe(2);
    });

    it('should return correct index for 辛', () => {
      expect(component.天厨('辛')).toBe(6);
    });

    it('should return correct index for 壬', () => {
      expect(component.天厨('壬')).toBe(9);
    });

    it('should return default index (11) for unknown gan', () => {
      expect(component.天厨('癸')).toBe(11);
      expect(component.天厨('')).toBe(11);
      expect(component.天厨('unknown')).toBe(11);
    });
  });

  describe('ShenSha Initialization', () => {
    it('should initialize ShenSha arrays correctly with horoscopeData', () => {
      routerSpy.currentNavigation.and.returnValue({
        extras: {
          state: {
            data: mockHoroscopeData,
          },
        },
      } as any);

      fixture = TestBed.createComponent(QizhengHoroDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      // 验证神煞数组的初始化
      expect(component.nativeShenShas.length).toBe(12);
      expect(component.processShenShas.length).toBe(12);

      // 验证天厨神煞的添加
      const nativeGan =
        mockHoroscopeData.native_lunar_calendar.lunar_year_gan_zhi[0];
      const processGan =
        mockHoroscopeData.process_lunar_calendar.lunar_year_gan_zhi[0];
      const nativeIndex = component.天厨(nativeGan);
      const processIndex = component.天厨(processGan);

      expect(component.nativeShenShas[nativeIndex]).toContain('天厨');
      expect(component.processShenShas[processIndex]).toContain('天厨');
    });
  });

  describe('Component Properties', () => {
    beforeEach(() => {
      routerSpy.currentNavigation.and.returnValue(null);
      fixture = TestBed.createComponent(QizhengHoroDetailComponent);
      component = fixture.componentInstance;
    });

    it('should have correct initial property values', () => {
      expect(component.title).toBe('星盘详情');
      expect(component.config).toBeDefined();
      expect(component.config instanceof Horoconfig).toBe(true);
      expect(component.horoscopeData).toBeNull();
      expect(Array.isArray(component.planetsGoodConfigs)).toBe(true);
      expect(Array.isArray(component.planetsBadConfigs)).toBe(true);
    });

    it('should initialize ShenSha arrays with correct length', () => {
      expect(component.nativeShenShas.length).toBe(12);
      expect(component.processShenShas.length).toBe(12);
      component.nativeShenShas.forEach((array) => {
        expect(Array.isArray(array)).toBe(true);
      });
      component.processShenShas.forEach((array) => {
        expect(Array.isArray(array)).toBe(true);
      });
    });
  });
});
