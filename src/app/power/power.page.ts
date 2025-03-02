import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Horoconfig } from '../services/config/horo-config.service';
import { Zodiac } from '../type/enum/zodiac';
import {
  detriment,
  egyptianTerm,
  exaltation,
  face,
  fall,
  ptolemyTerm,
  rulership,
  tripilicity,
  tripilicityOfLily,
} from '../utils/image/zodiac';
import { Path } from '../type/enum/path';

@Component({
  selector: 'app-power',
  templateUrl: './power.page.html',
  styleUrls: ['./power.page.scss'],
})
export class PowerPage implements OnInit {
  path = Path;
  title = '行星力量表';
  selectedSegment: string = 'natal'; // 默认选中的段

  rulershipFn = rulership;
  exaltationFn = exaltation;
  tripilicityFn = tripilicity;
  tripilicityOfLilyFn = tripilicityOfLily;
  faceFn = face;
  detrimentFn = detriment;
  fallFn = fall;
  ptolemyTermFn = ptolemyTerm;
  egyptianTermFn = egyptianTerm;

  zodiacs = [
    Zodiac.Aries,
    Zodiac.Taurus,
    Zodiac.Gemini,
    Zodiac.Cancer,
    Zodiac.Leo,
    Zodiac.Virgo,
    Zodiac.Libra,
    Zodiac.Scorpio,
    Zodiac.Sagittarius,
    Zodiac.Capricorn,
    Zodiac.Aquarius,
    Zodiac.Pisces,
  ];
  constructor(public config: Horoconfig, private titleService: Title) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }
}
