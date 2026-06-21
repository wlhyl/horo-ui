import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NgStyle } from '@angular/common';
import { HoroscopeComparison } from 'src/app/type/interface/response-data';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { degreeToDMS } from 'src/app/utils/horo-math/horo-math';

@Component({
  selector: 'app-process-compare-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: true,
  imports: [IonicModule, NgStyle],
})
export class DetailComponent {
  @Input() compareData: HoroscopeComparison | null = null;

  degreeToDMSFn = degreeToDMS;

  constructor(public config: Horoconfig) {}
}
