import {
  Component,
  Input,
} from '@angular/core';
import { HoroRequest, ProcessRequest } from 'src/app/type/interface/request-data';
import { WindowRect } from './window-state';
import { WindowService } from './window.service';

@Component({
  selector: 'app-window-manager',
  templateUrl: './window-manager.component.html',
  styleUrls: ['./window-manager.component.scss'],
  standalone: false,
})
export class WindowManagerComponent {
  @Input() horoData!: HoroRequest;
  @Input() eventData!: HoroRequest;
  @Input() processData!: ProcessRequest;
  @Input() workArea: WindowRect = { x: 0, y: 0, width: 0, height: 0 };

  constructor(public windowService: WindowService) {}

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
    this.windowService.toggleMaximize(id, this.workArea);
  }

  onUpdateRect(payload: { id: string; rect: WindowRect }): void {
    this.windowService.updateWindowRect(payload.id, payload.rect);
  }

  onTaskbarClick(id: string): void {
    this.windowService.restoreWindow(id);
  }

  onTaskbarClose(id: string, event: Event): void {
    event.stopPropagation();
    this.windowService.closeWindow(id);
  }

  get visibleWindows() {
    return this.windowService.visibleWindows;
  }

  get taskbarWindows() {
    return this.windowService.taskbarWindows;
  }
}
