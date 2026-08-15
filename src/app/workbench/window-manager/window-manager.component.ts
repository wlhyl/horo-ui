import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HoroRequest, ProcessRequest } from 'src/app/type/interface/request-data';
import { WindowRect } from './window-state';
import { WindowFrameComponent } from './window-frame.component';
import { WindowService } from './window.service';

@Component({
  selector: 'app-window-manager',
  templateUrl: './window-manager.component.html',
  styleUrls: ['./window-manager.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WindowFrameComponent,
    IonicModule,
  ],
})
export class WindowManagerComponent {
  horoData = input.required<HoroRequest>();
  eventData = input.required<HoroRequest>();
  processData = input.required<ProcessRequest>();

  constructor(
    public windowService: WindowService,
    private host: ElementRef<HTMLElement>,
  ) {}

  onFocus(id: string): void {
    this.windowService.focusWindow(id);
  }

  onClose(id: string): void {
    this.windowService.closeWindow(id);
  }

  onMinimize(id: string): void {
    this.windowService.minimizeWindow(id);
  }

  onHide(id: string): void {
    this.windowService.hideWindow(id);
  }

  onToggleMaximize(id: string): void {
    this.windowService.toggleMaximize(id, this.getWorkArea());
  }

  onUpdateRect(payload: { id: string; rect: WindowRect }): void {
    this.windowService.updateWindowRect(payload.id, payload.rect);
  }

  // 事件发生时才读取布局尺寸，避免每次变更检测都强制同步布局
  private getWorkArea(): WindowRect {
    const el = this.host.nativeElement;
    return {
      x: 0,
      y: 0,
      width: el.clientWidth,
      height: el.clientHeight,
    };
  }
}
