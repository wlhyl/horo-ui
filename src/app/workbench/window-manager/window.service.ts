import { Injectable } from '@angular/core';
import {
  ChartType,
  WindowRect,
  WindowState,
  WorkbenchWindow,
  chartTitle,
  generateWindowId,
} from './window-state';

const DEFAULT_WIDTH = 460;
const DEFAULT_HEIGHT = 560;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 360;
const CASCADE_OFFSET = 30;

@Injectable()
export class WindowService {
  private _windows: WorkbenchWindow[] = [];
  private _zCounter = 10;
  private _cascadeIndex = 0;

  get windows(): ReadonlyArray<WorkbenchWindow> {
    return this._windows;
  }

  get visibleWindows(): ReadonlyArray<WorkbenchWindow> {
    return this._windows.filter(
      (w) => w.state !== WindowState.Minimized && w.state !== WindowState.Hidden,
    );
  }

  get taskbarWindows(): ReadonlyArray<WorkbenchWindow> {
    return this._windows.filter(
      (w) => w.state === WindowState.Minimized || w.state === WindowState.Hidden,
    );
  }

  openWindow(
    chartType: ChartType,
    workArea: { width: number; height: number },
  ): WorkbenchWindow {
    const offset = (this._cascadeIndex % 8) * CASCADE_OFFSET;
    const rect: WindowRect = {
      x: Math.max(10, offset),
      y: Math.max(10, offset),
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
    };
    if (rect.x + rect.width > workArea.width) {
      rect.x = Math.max(10, workArea.width - rect.width - 10);
    }
    if (rect.y + rect.height > workArea.height) {
      rect.y = Math.max(10, workArea.height - rect.height - 10);
    }

    const win: WorkbenchWindow = {
      id: generateWindowId(),
      title: chartTitle(chartType),
      chartType,
      state: WindowState.Normal,
      rect,
      zIndex: ++this._zCounter,
    };
    this._windows = [...this._windows, win];
    this._cascadeIndex++;
    return win;
  }

  closeWindow(id: string): void {
    this._windows = this._windows.filter((w) => w.id !== id);
  }

  focusWindow(id: string): void {
    this._windows = this._windows.map((w) =>
      w.id === id ? { ...w, zIndex: ++this._zCounter } : w,
    );
  }

  minimizeWindow(id: string): void {
    this._windows = this._windows.map((w) =>
      w.id === id ? { ...w, state: WindowState.Minimized } : w,
    );
  }

  hideWindow(id: string): void {
    this._windows = this._windows.map((w) =>
      w.id === id ? { ...w, state: WindowState.Hidden } : w,
    );
  }

  maximizeWindow(id: string, workArea: WindowRect): void {
    this._windows = this._windows.map((w) => {
      if (w.id !== id) return w;
      if (w.state === WindowState.Maximized) {
        return w;
      }
      return {
        ...w,
        state: WindowState.Maximized,
        prevRect: { ...w.rect },
        rect: { ...workArea },
        zIndex: ++this._zCounter,
      };
    });
  }

  restoreWindow(id: string): void {
    this._windows = this._windows.map((w) => {
      if (w.id !== id) return w;
      // 从最小化/隐藏状态恢复时，若之前是最大化状态（prevRect 存在），
      // 恢复为最大化状态并保留 prevRect，以便后续点击最大化按钮能还原为正常大小
      if (
        (w.state === WindowState.Minimized || w.state === WindowState.Hidden) &&
        w.prevRect
      ) {
        return {
          ...w,
          state: WindowState.Maximized,
          zIndex: ++this._zCounter,
        };
      }
      if (w.state === WindowState.Maximized && w.prevRect) {
        return {
          ...w,
          state: WindowState.Normal,
          rect: { ...w.prevRect },
          prevRect: undefined,
          zIndex: ++this._zCounter,
        };
      }
      return { ...w, state: WindowState.Normal, zIndex: ++this._zCounter };
    });
  }

  toggleMaximize(id: string, workArea: WindowRect): void {
    const win = this._windows.find((w) => w.id === id);
    if (!win) return;
    if (win.state === WindowState.Maximized) {
      this.restoreWindow(id);
    } else {
      this.maximizeWindow(id, workArea);
    }
  }

  updateWindowRect(id: string, rect: WindowRect): void {
    this._windows = this._windows.map((w) =>
      w.id === id
        ? {
            ...w,
            rect: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.max(MIN_WIDTH, Math.round(rect.width)),
              height: Math.max(MIN_HEIGHT, Math.round(rect.height)),
            },
          }
        : w,
    );
  }

  closeAll(): void {
    this._windows = [];
    this._cascadeIndex = 0;
  }

  getMinSize(): { width: number; height: number } {
    return { width: MIN_WIDTH, height: MIN_HEIGHT };
  }

  isTopWindow(id: string): boolean {
    const visible = this.visibleWindows;
    if (visible.length === 0) return false;
    const top = visible.reduce((a, b) => (b.zIndex > a.zIndex ? b : a));
    return top.id === id;
  }
}
