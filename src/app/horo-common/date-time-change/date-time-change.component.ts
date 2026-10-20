import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';

// 步进单位，枚举值即界面显示文本
export enum StepUnit {
  Year = '年',
  Month = '月',
  Day = '日',
  Hour = '时',
  Minute = '分',
  Second = '秒',
}

export type Step = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const STEP_UNITS = Object.values(StepUnit);

const STEP_UNIT_FIELDS: Record<StepUnit, keyof Step> = {
  [StepUnit.Year]: 'year',
  [StepUnit.Month]: 'month',
  [StepUnit.Day]: 'day',
  [StepUnit.Hour]: 'hour',
  [StepUnit.Minute]: 'minute',
  [StepUnit.Second]: 'second',
};

@Component({
  selector: 'horo-date-time-change',
  templateUrl: './date-time-change.component.html',
  styleUrls: ['./date-time-change.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DateTimeChangeComponent implements OnInit {
  @Input()
  stepUnit: StepUnit = StepUnit.Year;

  private step: Step = {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  };

  @Output()
  private changedStep = new EventEmitter<Step>();

  constructor() {
    addIcons({
      chevronBackOutline,
      chevronForwardOutline,
    });
  }

  ngOnInit() {}

  changeStepUnit() {
    this.stepUnit = STEP_UNITS[(STEP_UNITS.indexOf(this.stepUnit) + 1) % STEP_UNITS.length];
  }

  changeStep(n: number) {
    this.step = {
      year: 0,
      month: 0,
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
    };
    this.step[STEP_UNIT_FIELDS[this.stepUnit]] = n;

    this.changedStep.emit(this.step);
  }
}
