import { Platform } from '@ionic/angular';
import { StaticCanvas } from 'fabric';

/**
 *
 * @param canvas 绘制完成后根据屏幕大小缩放Canvas
 * @param platform
 * @param maxWidth 可选，自定义参考宽度（如嵌入式模式下容器宽度）。未提供时使用 platform.width()
 * @param originalSize 可选，原始 canvas 尺寸。提供时直接基于此尺寸计算，无需先重置 canvas，避免闪烁
 * @returns
 */
export async function zoomImage(
  canvas: StaticCanvas,
  platform: Platform,
  maxWidth?: number,
  originalSize?: { width: number; height: number }
): Promise<void> {
  await platform.ready();

  const canvasWidth = originalSize?.width ?? canvas.getWidth();
  const canvasHeight = originalSize?.height ?? canvas.getHeight();

  if (!canvasWidth || !canvasHeight) {
    return;
  }

  const screenWidth = platform.width();
  const referenceWidth = maxWidth ?? screenWidth;
  const targetWidth = referenceWidth - 10; // 左右留 5px padding

  if (canvasWidth > targetWidth) {
    const zoom = targetWidth / canvasWidth;
    const targetHeight = canvasHeight * zoom;

    canvas.setDimensions({
      width: targetWidth,
      height: targetHeight,
    });
    canvas.setZoom(zoom);
  } else if (originalSize) {
    // 提供了 originalSize 且 canvas 当前尺寸与原始不同时，恢复到原始尺寸
    if (
      canvas.getWidth() !== originalSize.width ||
      canvas.getHeight() !== originalSize.height
    ) {
      canvas.setDimensions({
        width: originalSize.width,
        height: originalSize.height,
      });
      canvas.setZoom(1);
    }
  }
}
