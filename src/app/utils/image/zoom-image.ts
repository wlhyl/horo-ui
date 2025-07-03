import { Platform } from '@ionic/angular';
import { StaticCanvas } from 'fabric';

/**
 *
 * @param canvas 绘制完成后根据屏幕大小缩放Canvas
 * @param platform
 * @returns
 */
export async function zoomImage(
  canvas: StaticCanvas,
  platform: Platform
): Promise<void> {
  await platform.ready();

  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();

  if (!canvasWidth || !canvasHeight) {
    return;
  }

  const screenWidth = platform.width();
  const targetWidth = screenWidth - 10; // 左右留 5px padding

  if (canvasWidth > targetWidth) {
    const zoom = targetWidth / canvasWidth;
    const targetHeight = canvasHeight * zoom;

    canvas.setDimensions({
      width: targetWidth,
      height: targetHeight,
    });
    canvas.setZoom(zoom);
  }
}
