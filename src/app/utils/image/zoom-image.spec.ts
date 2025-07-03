import { Platform } from '@ionic/angular';
import * as fabric from 'fabric';
import { zoomImage } from './zoom-image';

// Mock Platform
const mockPlatform = (width: number) =>
  ({
    ready: () => Promise.resolve(),
    width: () => width,
  } as unknown as Platform);

describe('zoomImage', () => {
  let mockCanvas: jasmine.SpyObj<fabric.StaticCanvas>;

  beforeEach(() => {
    // Mock StaticCanvas
    mockCanvas = jasmine.createSpyObj('StaticCanvas', [
      'getWidth',
      'getHeight',
      'setDimensions',
      'setZoom',
    ]);
  });

  it('should zoom image if canvas is wider than screen', async () => {
    const platform = mockPlatform(300);
    const targetWidth = 290; // 300 - 10
    const canvasWidth = 600;
    const canvasHeight = 400;
    const zoom = targetWidth / canvasWidth;
    const targetHeight = canvasHeight * zoom;

    mockCanvas.getWidth.and.returnValue(canvasWidth);
    mockCanvas.getHeight.and.returnValue(canvasHeight);

    await zoomImage(mockCanvas, platform);

    expect(mockCanvas.setDimensions).toHaveBeenCalledOnceWith({
      width: targetWidth,
      height: targetHeight,
    });
    expect(mockCanvas.setZoom).toHaveBeenCalledOnceWith(zoom);
  });

  it('should not zoom image if canvas is narrower than screen', async () => {
    const platform = mockPlatform(300);
    mockCanvas.getWidth.and.returnValue(200);
    mockCanvas.getHeight.and.returnValue(150);

    await zoomImage(mockCanvas, platform);

    expect(mockCanvas.setDimensions).not.toHaveBeenCalled();
    expect(mockCanvas.setZoom).not.toHaveBeenCalled();
  });

  it('should do nothing if canvas width is 0', async () => {
    const platform = mockPlatform(300);
    mockCanvas.getWidth.and.returnValue(0);
    mockCanvas.getHeight.and.returnValue(300);

    await zoomImage(mockCanvas, platform);

    expect(mockCanvas.setDimensions).not.toHaveBeenCalled();
    expect(mockCanvas.setZoom).not.toHaveBeenCalled();
  });
});
