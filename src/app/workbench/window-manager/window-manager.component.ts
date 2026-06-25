import {
  Component,
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
  imports: [
    WindowFrameComponent,
    IonicModule,
  ],
})
export class WindowManagerComponent {
  horoData = input.required<HoroRequest>();
  eventData = input.required<HoroRequest>();
  processData = input.required<ProcessRequest>();
  workArea = input.required<WindowRect>();

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
    this.windowService.toggleMaximize(id, this.workArea());
  }

  onUpdateRect(payload: { id: string; rect: WindowRect }): void {
    this.windowService.updateWindowRect(payload.id, payload.rect);
  }

  get visibleWindows() {
    return this.windowService.visibleWindows;
  }
}
