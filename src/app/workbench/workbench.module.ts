import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { WorkbenchPageRoutingModule } from './workbench-routing.module';
import { WorkbenchPage } from './workbench.page';
import { InputPanelComponent } from './input-panel/input-panel.component';
import { WindowManagerComponent } from './window-manager/window-manager.component';
import { WindowFrameComponent } from './window-manager/window-frame.component';
import { WindowService } from './window-manager/window.service';

import { HoroCommonModule } from '../horo-common/horo-common.module';
import { NativePageModule } from '../native/native.module';
import { ProcessPageModule } from '../process/process.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkbenchPageRoutingModule,
    HoroCommonModule,
    NativePageModule,
    ProcessPageModule,
  ],
  declarations: [
    WorkbenchPage,
    InputPanelComponent,
    WindowManagerComponent,
    WindowFrameComponent,
  ],
  providers: [WindowService],
})
export class WorkbenchPageModule {}
