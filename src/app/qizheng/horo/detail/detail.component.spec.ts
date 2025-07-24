import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { IonicModule, NavController } from '@ionic/angular';

import { QizhengHoroDetailComponent } from './detail.component';
import { Horoscope } from 'src/app/type/interface/response-qizheng';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { LunarMansionsName } from 'src/app/type/enum/qizheng';

class MockRouter {
  getCurrentNavigation = () => ({
    extras: {
      state: {
        data: mockHoroscopeData,
      },
    },
  });
}

class MockTitleService {
  setTitle = jasmine.createSpy('setTitle');
}

class MockHoroconfig {
  // 添加需要的 mock 方法或属性
}

// 添加NavController的mock
class MockNavController {
  subscribe = jasmine.createSpy('subscribe');
}

// 添加NavController的mock

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
  let titleService: Title;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QizhengHoroDetailComponent],
      imports: [IonicModule.forRoot()], // 添加IonicModule导入
      providers: [
        { provide: Router, useClass: MockRouter },
        { provide: Title, useClass: MockTitleService },
        { provide: Horoconfig, useClass: MockHoroconfig },
        { provide: NavController, useClass: MockNavController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QizhengHoroDetailComponent);
    component = fixture.componentInstance;
    titleService = TestBed.inject(Title);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the page title', () => {
    expect(titleService.setTitle).toHaveBeenCalledWith('星盘详情');
  });

  it('should initialize horoscopeData from router state', () => {
    expect(component.horoscopeData).toEqual(mockHoroscopeData);
  });

  it('should render native transformed stars', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const nativeTransformedStar = mockHoroscopeData.native_transformed_stars[0];
    const row = compiled.querySelector('[data-testid="native-star-row-0"]');
    expect(row?.textContent).toContain(nativeTransformedStar.transformed_star);
  });

  it('should render process transformed stars', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const processTransformedStar =
      mockHoroscopeData.process_transformed_stars[0];
    const row = compiled.querySelector('[data-testid="process-star-row-0"]');
    expect(row?.textContent).toContain(
      processTransformedStar.transformed_star
    );
  });
});

  describe('when router state is missing', () => {
    let component: QizhengHoroDetailComponent;
    let fixture: ComponentFixture<QizhengHoroDetailComponent>;

    beforeEach(async () => {
      // 重新配置 TestBed，使用一个不返回 state 的 MockRouter
      await TestBed.overrideProvider(Router, {
        useValue: {
          getCurrentNavigation: () => ({
            extras: {}, // No state here
          }),
        },
      }).compileComponents();

      fixture = TestBed.createComponent(QizhengHoroDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should have null horoscopeData', () => {
      expect(component.horoscopeData).toBeNull();
    });
  });