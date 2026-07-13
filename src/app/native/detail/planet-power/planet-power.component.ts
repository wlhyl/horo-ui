import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Horoscope } from 'src/app/type/interface/response-data';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import {
  calculateAllPlanetDignities,
  findChartAlmuten,
  PlanetDignity,
} from 'src/app/utils/planet-power/planet-power';

@Component({
  selector: 'app-planet-power',
  templateUrl: './planet-power.component.html',
  styleUrls: ['./planet-power.component.scss'],
  standalone: true,
  imports: [IonicModule, NgStyle],
})
export class PlanetPowerComponent implements OnInit, OnChanges {
  @Input() horoscopeData: Horoscope | null = null;

  planetDignities: PlanetDignity[] = [];

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  private initialized = false;

  constructor(
    public config: Horoconfig,
  ) {}

  get chartAlmuten(): PlanetDignity | null {
    return findChartAlmuten(this.planetDignities);
  }

  ngOnInit(): void {
    this.refresh();
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && changes['horoscopeData']) {
      this.refresh();
    }
  }

  private refresh(): void {
    if (!this.horoscopeData) {
      this.planetDignities = [];
      return;
    }
    const result = calculateAllPlanetDignities(this.horoscopeData.planets);
    if (!result.ok) {
      this.message = result.error;
      this.isAlertOpen = true;
      this.planetDignities = [];
      return;
    }
    this.planetDignities = result.value;
  }
}
