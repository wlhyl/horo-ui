import { createSpy, createSpyObj, expectAsync, type Spy, type SpyObj } from 'src/test-utils/spy';
import { appInit } from './app-init';
import { Horoconfig } from '../config/horo-config.service';
import { ApiService } from '../api/api.service';
import { of, throwError } from 'rxjs';
import FontFaceObserver from 'fontfaceobserver';

describe('appInit', () => {
  let mockConfig: Horoconfig;
  let mockApi: SpyObj<ApiService>;
  let fontFaceObserverSpy: Spy;
  let fontLoadSpy: Spy;
  let mockFontFaceObserverInstance: { load: Spy };
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
      promittorImage: { width: 0, height: 0 },
      synastryAspectImage: { width: 0, height: 0 },
      synastryHoroscoImage: { width: 0, height: 0 },
      httpOptions: { headers: {} as any },
    };

    // 模拟 ApiService
    mockApi = createSpyObj('ApiService', ['getHouses']);

    mockFontFaceObserverInstance = {
      load: createSpy('load'),
    };

    fontFaceObserverSpy = createSpy('FontFaceObserver')
      .mockReturnValue(mockFontFaceObserverInstance);

    fontFaceObserverFactory = (font: string) => {
      return fontFaceObserverSpy(font);
    };

    fontLoadSpy = mockFontFaceObserverInstance.load;
  });

  it('应该成功加载字体并获取宫位列表', async () => {
    mockApi.getHouses.mockReturnValue(of(['Placidus', 'Koch']));
    fontLoadSpy.mockReturnValue(Promise.resolve());

    await appInit(mockConfig, mockApi, fontFaceObserverFactory)();

    expect(fontFaceObserverSpy).toHaveBeenCalledWith(mockConfig.astrologyFont);
    expect(fontLoadSpy).toHaveBeenCalled();
    expect(mockApi.getHouses).toHaveBeenCalled();
    expect(mockConfig.houses).toEqual(['Placidus', 'Koch']);
  });

  it('应该在字体加载失败时抛出错误', async () => {
    fontLoadSpy.mockReturnValue(Promise.reject('字体加载失败'));

    await expectAsync(
      appInit(mockConfig, mockApi, fontFaceObserverFactory)()
    ).toBeRejected();
    expect(fontFaceObserverSpy).toHaveBeenCalledWith(mockConfig.astrologyFont);
    expect(fontLoadSpy).toHaveBeenCalled();
    expect(mockApi.getHouses).not.toHaveBeenCalled();
  });

  it('应该在获取宫位列表失败时抛出错误', async () => {
    mockApi.getHouses.mockReturnValue(
      throwError(() => new Error('API调用失败'))
    );
    fontLoadSpy.mockReturnValue(Promise.resolve());

    await expectAsync(
      appInit(mockConfig, mockApi, fontFaceObserverFactory)()
    ).toBeRejected();
    expect(fontFaceObserverSpy).toHaveBeenCalledWith(mockConfig.astrologyFont);
    expect(fontLoadSpy).toHaveBeenCalled();
    expect(mockApi.getHouses).toHaveBeenCalled();
  });
});
