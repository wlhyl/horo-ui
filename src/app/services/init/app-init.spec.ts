import { appInit } from './app-init';
import { Horoconfig } from '../config/horo-config.service';
import { ApiService } from '../api/api.service';
import { of, throwError } from 'rxjs';
import FontFaceObserver from 'fontfaceobserver';

describe('appInit', () => {
  let mockConfig: Horoconfig;
  let mockApi: jasmine.SpyObj<ApiService>;
  let fontFaceObserverSpy: jasmine.Spy;
  let fontLoadSpy: jasmine.Spy;
  let mockFontFaceObserverInstance: { load: jasmine.Spy };
  let fontFaceObserverFactory: (font: string) => FontFaceObserver;

  beforeEach(() => {
    // 模拟 Horoconfig
    mockConfig = {
      astrologyFont: 'HamburgSymbols',
      houses: [],
      horoPlanets: [],
      textFont: 'Verdana',
      planetFontString: () => '',
      aspectFontString: () => '',
      planetFontFamily: () => '',
      aspectFontFamily: () => '',
      zodiacFontString: () => '',
      zodiacFontFamily: () => '',
      aspectImage: { width: 0, height: 0 },
      horoscoImage: { width: 0, height: 0 },
      synastryAspectImage: { width: 0, height: 0 },
      synastryHoroscoImage: { width: 0, height: 0 },
      httpOptions: { headers: {} as any },
    };

    // 模拟 ApiService
    mockApi = jasmine.createSpyObj('ApiService', ['getHouses']);

    mockFontFaceObserverInstance = {
      load: jasmine.createSpy('load'),
    };

    fontFaceObserverSpy = jasmine
      .createSpy('FontFaceObserver')
      .and.returnValue(mockFontFaceObserverInstance);

    fontFaceObserverFactory = (font: string) => {
      return fontFaceObserverSpy(font);
    };

    fontLoadSpy = mockFontFaceObserverInstance.load;
  });

  it('应该成功加载字体并获取宫位列表', async () => {
    mockApi.getHouses.and.returnValue(of(['Placidus', 'Koch']));
    fontLoadSpy.and.returnValue(Promise.resolve());

    await appInit(mockConfig, mockApi, fontFaceObserverFactory)();

    expect(fontFaceObserverSpy).toHaveBeenCalledWith(mockConfig.astrologyFont);
    expect(fontLoadSpy).toHaveBeenCalled();
    expect(mockApi.getHouses).toHaveBeenCalled();
    expect(mockConfig.houses).toEqual(['Placidus', 'Koch']);
  });

  it('应该在字体加载失败时抛出错误', async () => {
    fontLoadSpy.and.returnValue(Promise.reject('字体加载失败'));

    await expectAsync(
      appInit(mockConfig, mockApi, fontFaceObserverFactory)()
    ).toBeRejected();
    expect(fontFaceObserverSpy).toHaveBeenCalledWith(mockConfig.astrologyFont);
    expect(fontLoadSpy).toHaveBeenCalled();
    expect(mockApi.getHouses).not.toHaveBeenCalled();
  });

  it('应该在获取宫位列表失败时抛出错误', async () => {
    mockApi.getHouses.and.returnValue(
      throwError(() => new Error('API调用失败'))
    );
    fontLoadSpy.and.returnValue(Promise.resolve());

    await expectAsync(
      appInit(mockConfig, mockApi, fontFaceObserverFactory)()
    ).toBeRejected();
    expect(fontFaceObserverSpy).toHaveBeenCalledWith(mockConfig.astrologyFont);
    expect(fontLoadSpy).toHaveBeenCalled();
    expect(mockApi.getHouses).toHaveBeenCalled();
  });
});
