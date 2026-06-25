import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Title } from '@angular/platform-browser';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import {
  HoroRequest,
  ProcessRequest,
} from 'src/app/type/interface/request-data';
import {
  ChartType,
  WindowRect,
  WindowState,
  WorkbenchWindow,
} from './window-manager/window-state';
import { WindowService } from './window-manager/window.service';
import { InputPanelComponent } from './input-panel/input-panel.component';
import { WindowManagerComponent } from './window-manager/window-manager.component';

@Component({
  selector: 'app-workbench',
  templateUrl: './workbench.page.html',
  styleUrls: ['./workbench.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    InputPanelComponent,
    WindowManagerComponent,
  ],
  providers: [
    WindowService,
  ],
})
export class WorkbenchPage implements OnInit, OnDestroy {
  @ViewChild('workAreaEl', { static: true })
  workAreaRef!: ElementRef<HTMLDivElement>;

  horoData: HoroRequest;
  eventData: HoroRequest;
  processData: ProcessRequest;

  title = '工作台';
  sidebarCollapsed = false;
  sidebarWidth = 340;
  workareaHeight: number | null = null;
  windowListOpen = false;

  private resizing = false;
  private resizeStartX = 0;
  private resizeStartWidth = 0;
  private heightResizing = false;
  private heightResizeStartY = 0;
  private heightResizeStartHeight = 0;

  private static readonly SIDEBAR_MIN_WIDTH = 280;
  private static readonly WORKAREA_MIN_HEIGHT = 300;

  constructor(
    private storage: HoroStorageService,
    private titleService: Title,
    public windowService: WindowService,
  ) {
    this.horoData = structuredClone(this.storage.horoData);
    this.eventData = structuredClone(this.storage.eventData);
    this.processData = structuredClone(this.storage.processData);
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.onSidebarResizeMove);
    document.removeEventListener('mouseup', this.onSidebarResizeEnd);
    document.removeEventListener('mousemove', this.onWorkareaResizeMove);
    document.removeEventListener('mouseup', this.onWorkareaResizeEnd);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onSidebarResizeStart(event: MouseEvent): void {
    if (this.sidebarCollapsed) return;
    this.resizing = true;
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = this.sidebarWidth;
    event.preventDefault();
    document.addEventListener('mousemove', this.onSidebarResizeMove);
    document.addEventListener('mouseup', this.onSidebarResizeEnd);
  }

  private onSidebarResizeMove = (event: MouseEvent): void => {
    if (!this.resizing) return;
    const dx = event.clientX - this.resizeStartX;
    const maxWidth = window.innerWidth / 2;
    const newWidth = Math.max(
      WorkbenchPage.SIDEBAR_MIN_WIDTH,
      Math.min(this.resizeStartWidth + dx, maxWidth),
    );
    this.sidebarWidth = newWidth;
  };

  private onSidebarResizeEnd = (): void => {
    this.resizing = false;
    document.removeEventListener('mousemove', this.onSidebarResizeMove);
    document.removeEventListener('mouseup', this.onSidebarResizeEnd);
  };

  onWorkareaResizeStart(event: MouseEvent): void {
    this.heightResizing = true;
    this.heightResizeStartY = event.clientY;
    const el = this.workAreaRef?.nativeElement;
    this.heightResizeStartHeight = el ? el.getBoundingClientRect().height : window.innerHeight - 48;
    event.preventDefault();
    document.addEventListener('mousemove', this.onWorkareaResizeMove);
    document.addEventListener('mouseup', this.onWorkareaResizeEnd);
  }

  private onWorkareaResizeMove = (event: MouseEvent): void => {
    if (!this.heightResizing) return;
    const dy = event.clientY - this.heightResizeStartY;
    const newHeight = Math.max(
      WorkbenchPage.WORKAREA_MIN_HEIGHT,
      this.heightResizeStartHeight + dy,
    );
    this.workareaHeight = newHeight;
  };

  private onWorkareaResizeEnd = (): void => {
    this.heightResizing = false;
    document.removeEventListener('mousemove', this.onWorkareaResizeMove);
    document.removeEventListener('mouseup', this.onWorkareaResizeEnd);
  };

  onHoroDataChange(data: HoroRequest): void {
    this.horoData = structuredClone(data);
    this.storage.horoData = structuredClone(data);
  }

  onEventDataChange(data: HoroRequest): void {
    this.eventData = structuredClone(data);
    this.storage.eventData = structuredClone(data);
  }

  onProcessDataChange(data: ProcessRequest): void {
    this.processData = structuredClone(data);
    this.storage.processData = structuredClone(data);
  }

  onOpenChart(type: ChartType): void {
    const area = this.getWorkArea();
    this.windowService.openWindow(type, {
      width: area.width,
      height: area.height,
    });
  }

  getWorkArea(): WindowRect {
    const el = this.workAreaRef?.nativeElement;
    if (!el) {
      return { x: 0, y: 0, width: 800, height: 600 };
    }
    const rect = el.getBoundingClientRect();
    return {
      x: 0,
      y: 0,
      width: rect.width,
      height: rect.height,
    };
  }

  get workArea(): WindowRect {
    return this.getWorkArea();
  }

  get windowCount(): number {
    return this.windowService.windows.length;
  }

  get allWindows(): ReadonlyArray<WorkbenchWindow> {
    return [...this.windowService.windows].sort((a, b) => b.zIndex - a.zIndex);
  }

  get topWindowId(): string | null {
    const visible = this.windowService.visibleWindows;
    if (visible.length === 0) return null;
    return visible.reduce((a, b) => (b.zIndex > a.zIndex ? b : a)).id;
  }

  toggleWindowList(event: Event): void {
    event.stopPropagation();
    this.windowListOpen = !this.windowListOpen;
  }

  closeWindowList(): void {
    this.windowListOpen = false;
  }

  onSwitchWindow(id: string): void {
    const win = this.windowService.windows.find((w) => w.id === id);
    if (!win) return;
    if (
      win.state === WindowState.Minimized ||
      win.state === WindowState.Hidden
    ) {
      this.windowService.restoreWindow(id);
    } else {
      this.windowService.focusWindow(id);
    }
    this.closeWindowList();
  }

  onListClose(id: string, event: Event): void {
    event.stopPropagation();
    this.windowService.closeWindow(id);
  }

  stateLabel(state: WindowState): string {
    switch (state) {
      case WindowState.Minimized:
        return '最小化';
      case WindowState.Hidden:
        return '隐藏';
      case WindowState.Maximized:
        return '最大化';
      default:
        return '';
    }
  }

  stateIcon(state: WindowState): string {
    switch (state) {
      case WindowState.Minimized:
        return 'remove-circle-outline';
      case WindowState.Hidden:
        return 'eye-off-circle-outline';
      case WindowState.Maximized:
        return 'expand-outline';
      default:
        return 'square-outline';
    }
  }
}
