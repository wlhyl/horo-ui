import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Horoscope, ReturnHoroscope } from 'src/app/type/interface/response-data';
import { PlanetName } from 'src/app/type/enum/planet';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import {
  calculateAllPlanetPowers,
  PlanetPower,
} from 'src/app/utils/planet-power/planet-power';

@Component({
  selector: 'app-planet-power',
  templateUrl: './planet-power.component.html',
  styleUrls: ['./planet-power.component.scss'],
  standalone: true,
  imports: [IonicModule, NgStyle],
})
export class PlanetPowerComponent implements OnInit, OnChanges {
  @Input() horoscopeData: Horoscope | ReturnHoroscope | null = null;

  planetPowers: PlanetPower[] = [];

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  private initialized = false;

  constructor(
    public config: Horoconfig,
  ) {}

  get chartAlmuten(): PlanetPower | null {
    const planets = this.planetPowers.filter(
      (p) => p.planet.name !== PlanetName.PartOfFortune,
    );
    if (planets.length === 0) return null;
    return planets.reduce((max, current) =>
      current.totalScore > max.totalScore ? current : max,
    );
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
      this.planetPowers = [];
      return;
    }
    const result = calculateAllPlanetPowers(this.horoscopeData);
    if (!result.ok) {
      this.message = result.error;
      this.isAlertOpen = true;
      this.planetPowers = [];
      return;
    }
    this.planetPowers = result.value;
  }
}
