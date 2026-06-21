import {
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  input,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HoroRequest, ProcessRequest } from 'src/app/type/interface/request-data';
import { Mode } from 'src/app/native/enum';
import { ImageComponent } from 'src/app/native/image/image.component';
import { ProcessPageModule } from 'src/app/process/process.module';
import { ProcessName } from 'src/app/process/enum/process';
import { ProfectionMode } from 'src/app/process/enum/profection-mode';
import { CompareComponent } from 'src/app/process/compare/compare.component';
import { ReturnComponent } from 'src/app/process/return/return.component';
import {
  ChartType,
  WindowRect,
  WindowState,
  WorkbenchWindow,
} from './window-state';

@Component({
  selector: 'app-window-frame',
  templateUrl: './window-frame.component.html',
  styleUrls: ['./window-frame.component.scss'],
  standalone: true,
  imports: [
    NgStyle,
    IonicModule,
    ImageComponent,
    ProcessPageModule,
    CompareComponent,
    ReturnComponent,
  ],
})
export class WindowFrameComponent implements OnDestroy {
  window = input.required<WorkbenchWindow>();
  horoData = input.required<HoroRequest>();
  eventData = input.required<HoroRequest>();
  processData = input.required<ProcessRequest>();
  workArea = input.required<WindowRect>();

  @Output() focus = new EventEmitter<string>();
  @Output() close = new EventEmitter<string>();
  @Output() minimize = new EventEmitter<string>();
  @Output() hide = new EventEmitter<string>();
  @Output() toggleMaximize = new EventEmitter<string>();
  @Output() updateRect = new EventEmitter<{ id: string; rect: WindowRect }>();

  readonly chartType = ChartType;
  readonly windowState = WindowState;
  readonly modeEnum = Mode;
  readonly processNameEnum = ProcessName;
  readonly profectionModeEnum = ProfectionMode;

  private dragging = false;
  private resizing: string | null = null;
  private dragStart = { x: 0, y: 0, rectX: 0, rectY: 0, rectW: 0, rectH: 0 };

  ngOnDestroy(): void {
    this.detachDragListeners();
  }

  get isVisible(): boolean {
    return (
      this.window().state === WindowState.Normal ||
      this.window().state === WindowState.Maximized
    );
  }

  get isMaximized(): boolean {
    return this.window().state === WindowState.Maximized;
  }

  onTitleMouseDown(event: MouseEvent): void {
    if (this.isMaximized) return;
    if ((event.target as HTMLElement).closest('.win-btn')) return;
    const win = this.window();
    this.focus.emit(win.id);
    this.dragging = true;
    this.dragStart = {
      x: event.clientX,
      y: event.clientY,
      rectX: win.rect.x,
      rectY: win.rect.y,
      rectW: 0,
      rectH: 0,
    };
    event.preventDefault();
    this.attachDragListeners();
  }

  onResizeHandleMouseDown(event: MouseEvent, handle: string): void {
    if (this.isMaximized) return;
    const win = this.window();
    this.focus.emit(win.id);
    this.resizing = handle;
    this.dragStart = {
      x: event.clientX,
      y: event.clientY,
      rectX: win.rect.x,
      rectY: win.rect.y,
      rectW: win.rect.width,
      rectH: win.rect.height,
    };
    event.preventDefault();
    event.stopPropagation();
    this.attachDragListeners();
  }

  private attachDragListeners(): void {
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  private detachDragListeners(): void {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  private onMouseMove = (event: MouseEvent): void => {
    if (this.dragging) {
      const dx = event.clientX - this.dragStart.x;
      const dy = event.clientY - this.dragStart.y;
      let newX = this.dragStart.rectX + dx;
      let newY = this.dragStart.rectY + dy;
      const wa = this.workArea();
      const minX = wa.x;
      const maxX = wa.x + wa.width - 40;
      const minY = wa.y;
      const maxY = wa.y + wa.height - 40;
      newX = Math.max(minX, Math.min(newX, maxX));
      newY = Math.max(minY, Math.min(newY, maxY));
      const win = this.window();
      this.updateRect.emit({
        id: win.id,
        rect: {
          ...win.rect,
          x: newX,
          y: newY,
        },
      });
    } else if (this.resizing) {
      const dx = event.clientX - this.dragStart.x;
      const dy = event.clientY - this.dragStart.y;
      const minSize = { width: 320, height: 360 };
      let { rectX, rectY, rectW, rectH } = this.dragStart;
      let x = rectX;
      let y = rectY;
      let width = rectW;
      let height = rectH;

      if (this.resizing.includes('e')) {
        width = Math.max(minSize.width, rectW + dx);
      }
      if (this.resizing.includes('s')) {
        height = Math.max(minSize.height, rectH + dy);
      }
      if (this.resizing.includes('w')) {
        const newWidth = Math.max(minSize.width, rectW - dx);
        x = rectX + (rectW - newWidth);
        width = newWidth;
      }
      if (this.resizing.includes('n')) {
        const newHeight = Math.max(minSize.height, rectH - dy);
        y = rectY + (rectH - newHeight);
        height = newHeight;
      }

      this.updateRect.emit({
        id: this.window().id,
        rect: { x, y, width, height },
      });
    }
  };

  private onMouseUp = (): void => {
    this.dragging = false;
    this.resizing = null;
    this.detachDragListeners();
  };

  onWindowClick(): void {
    this.focus.emit(this.window().id);
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.close.emit(this.window().id);
  }

  onMinimize(event: Event): void {
    event.stopPropagation();
    this.minimize.emit(this.window().id);
  }

  onHide(event: Event): void {
    event.stopPropagation();
    this.hide.emit(this.window().id);
  }

  onToggleMaximize(event: Event): void {
    event.stopPropagation();
    this.toggleMaximize.emit(this.window().id);
  }

  get windowStyle(): Record<string, string> {
    const win = this.window();
    const r = win.rect;
    return {
      left: `${r.x}px`,
      top: `${r.y}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
      'z-index': `${win.zIndex}`,
    };
  }
}
