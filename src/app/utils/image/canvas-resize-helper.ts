import { ElementRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StaticCanvas } from 'fabric';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { zoomImage } from './zoom-image';

/**
 * 嵌入式模式下 canvas 自适应缩放的辅助类。
 * 封装了 ResizeObserver 监听、防抖重算、基于原始尺寸缩放等逻辑，
 * 避免在每个使用 canvas 的组件中重复实现。
 *
 * 用法：
 * 1. 在组件中创建实例：this.resizeHelper = new CanvasResizeHelper(...)
 * 2. 绘制完成后调用：this.resizeHelper.onDraw()
 * 3. ngAfterViewInit 中调用：this.resizeHelper.setupResizeObserver()
 * 4. ngOnDestroy 中调用：this.resizeHelper.destroy()
 */
export class CanvasResizeHelper {
  private resizeObserver?: ResizeObserver;
  private resizeSubject = new Subject<void>();
  private originalCanvasWidth = 0;
  private originalCanvasHeight = 0;

  constructor(
    private getCanvas: () => StaticCanvas | undefined,
    private getCanvasRef: () => ElementRef<HTMLCanvasElement> | undefined,
    private getEmbedded: () => boolean,
    private platform: Platform,
    private destroy$: Observable<void>,
    private isBusy: () => boolean,
  ) {}

  /** 绘制完成后调用：记录原始 canvas 尺寸并应用缩放 */
  onDraw() {
    const canvas = this.getCanvas();
    if (!canvas) return;
    this.originalCanvasWidth = canvas.getWidth();
    this.originalCanvasHeight = canvas.getHeight();
    this.applyZoom();
  }

  /** 根据当前模式应用缩放：嵌入式用容器宽度，否则用屏幕宽度 */
  private applyZoom() {
    const canvas = this.getCanvas();
    if (!canvas) return;
    if (this.getEmbedded()) {
      const containerWidth = this.getContainerWidth();
      if (containerWidth <= 0) return; // 容器不可见（如 tab 隐藏）时跳过
      zoomImage(canvas, this.platform, containerWidth, {
        width: this.originalCanvasWidth,
        height: this.originalCanvasHeight,
      });
    } else {
      zoomImage(canvas, this.platform);
    }
  }

  private getContainer(): HTMLElement | null {
    return this.getCanvasRef()?.nativeElement?.parentElement ?? null;
  }

  private getContainerWidth(): number {
    return this.getContainer()?.clientWidth ?? 0;
  }

  /** 嵌入式窗口尺寸变化时，基于原始尺寸重新缩放（无需重置 canvas，避免闪烁） */
  private rezoom() {
    const canvas = this.getCanvas();
    if (!canvas || this.isBusy()) return;
    if (!this.originalCanvasWidth || !this.originalCanvasHeight) return;
    this.applyZoom();
  }

  /** 注册 ResizeObserver，仅在嵌入式模式下生效 */
  setupResizeObserver() {
    if (!this.getEmbedded()) return;
    if (typeof ResizeObserver === 'undefined') return;
    const container = this.getContainer();
    if (!container) return;
    // 防抖：拖动调整窗口时 ResizeObserver 会高频触发，避免每次都重算导致闪烁
    this.resizeSubject
      .pipe(debounceTime(150), takeUntil(this.destroy$))
      .subscribe(() => this.rezoom());
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeSubject.next();
    });
    this.resizeObserver.observe(container);
  }

  /** 组件销毁时调用，清理 ResizeObserver 和 Subject */
  destroy() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.resizeSubject.complete();
  }
}
