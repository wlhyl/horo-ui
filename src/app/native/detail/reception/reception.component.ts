import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Horoscope, ReturnHoroscope } from 'src/app/type/interface/response-data';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { degreeToDMS } from 'src/app/utils/horo-math/horo-math';
import {
  calculateMutualReceptions,
  calculateReceptions,
  DignityKind,
  MutualReception,
  Reception,
} from 'src/app/utils/reception/reception';

@Component({
  selector: 'app-reception',
  templateUrl: './reception.component.html',
  styleUrls: ['./reception.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class ReceptionComponent implements OnInit, OnChanges {
  @Input() horoscopeData: Horoscope | ReturnHoroscope | null = null;
  receptions: Reception[] = [];
  mutualReceptions: MutualReception[] = [];
  private initialized = false;

  constructor(public config: Horoconfig) {}

  ngOnInit(): void {
    this.refresh();
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && changes['horoscopeData']) {
      this.refresh();
    }
  }

  dignityLabel(k: DignityKind): string {
    return DignityKind.label(k);
  }

  formatOrb(degree: number): string {
    const { d, m, s } = degreeToDMS(degree);
    return `${d}°${m.toString().padStart(2, '0')}'${s.toString().padStart(2, '0')}"`;
  }

  private refresh(): void {
    if (!this.horoscopeData) {
      this.receptions = [];
      this.mutualReceptions = [];
      return;
    }
    this.receptions = calculateReceptions(this.horoscopeData);
    this.mutualReceptions = calculateMutualReceptions(this.horoscopeData);
  }
}
