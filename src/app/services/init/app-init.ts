import FontFaceObserver from 'fontfaceobserver';
import { Horoconfig } from '../config/horo-config.service';
import { ApiService } from '../api/api.service';
import { lastValueFrom } from 'rxjs';

// 使用工厂函数，自定义FontFaceObserver，以便单元测试
export function appInit(
  config: Horoconfig,
  api: ApiService,
  fontFaceObserverFactory?: (font: string) => FontFaceObserver
) {
  return async () => {
    const font = config.astrologyFont;
    const customFont = fontFaceObserverFactory
      ? fontFaceObserverFactory(font)
      : new FontFaceObserver(font);
    try {
      await customFont.load();
    } catch (error) {
      const message = `字体 “${font}” 加载失败! '${error}'`;
      console.error(message);
      throw error;
    }

    try {
      config.houses = await lastValueFrom(api.getHouses());
    } catch (error) {
      const message = '从server获取宫位系统失败!';
      console.error(message);
      throw error;
    }
  };
}
