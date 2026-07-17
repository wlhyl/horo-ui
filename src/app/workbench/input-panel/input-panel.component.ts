import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { DateRequest, HoroRequest, ProcessRequest } from 'src/app/type/interface/request-data';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { ProcessName } from 'src/app/process/enum/process';
import { DirectionMethod } from 'src/app/process/enum/direction-method';
import { ArcToDateMethod } from 'src/app/process/enum/arc-to-date-method';
import { ProfectionArcToDateMethod } from 'src/app/process/enum/profection-arc-to-date-method';
import { DailyDirectionMethod } from 'src/app/process/enum/daily-direction-method';
import { ChartType } from '../window-manager/window-state';
import { isInChineseDST } from 'src/app/utils/dst/dst';

@Component({
  selector: 'app-input-panel',
  templateUrl: './input-panel.component.html',
  styleUrls: ['./input-panel.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    HoroCommonModule,
  ],
})
export class InputPanelComponent {
  @Input() horoData!: HoroRequest;
  @Input() eventData!: HoroRequest;
  @Input() processData!: ProcessRequest;

  @Output() horoDataChange = new EventEmitter<HoroRequest>();
  @Output() eventDataChange = new EventEmitter<HoroRequest>();
  @Output() processDataChange = new EventEmitter<ProcessRequest>();
  @Output() openChart = new EventEmitter<ChartType>();

  readonly chartType = ChartType;
  readonly processNameEnum = ProcessName;

  readonly houses: ReadonlyArray<string> = this.config.houses;

  readonly processOptions = [
    ProcessName.Profection,
    ProcessName.MedievalProfection,
    ProcessName.CustomDayProfection,
    ProcessName.Transit,
    ProcessName.Firdaria,
    ProcessName.SolarReturn,
    ProcessName.LunarReturn,
    ProcessName.DailyReturn,
    ProcessName.SolarcomparNative,
    ProcessName.NativecomparSolar,
    ProcessName.LunarcomparNative,
    ProcessName.NativecomparLunar,
    ProcessName.DailycomparNative,
    ProcessName.NativecomparDaily,
    ProcessName.Direction,
    ProcessName.DailyDirection,
    ProcessName.SolarArc,
    ProcessName.QuadrantProcess,
  ].map((process_name) => ({
    text: ProcessName.name(process_name),
    value: process_name,
  }));

  readonly directionMethodOptions = Object.values(DirectionMethod)
    .filter((v) => typeof v === 'string')
    .map((method) => ({
      text: DirectionMethod.name(method),
      value: method,
    }));

  readonly arcToDateMethodOptions = Object.values(ArcToDateMethod)
    .filter((v) => typeof v === 'string')
    .map((method) => ({
      text: ArcToDateMethod.name(method),
      value: method,
    }));

  readonly dailyDirectionMethodOptions = Object.values(DailyDirectionMethod)
    .filter((v) => typeof v === 'string')
    .map((method) => ({
      text: DailyDirectionMethod.name(method),
      value: method,
    }));

  readonly profectionArcToDateMethodOptions = Object.values(ProfectionArcToDateMethod)
    .filter((v) => typeof v === 'string')
    .map((method) => ({
      text: ProfectionArcToDateMethod.name(method),
      value: method,
    }));

  readonly chartButtons: { type: ChartType; label: string; group: string }[] = [
    { type: ChartType.Native, label: '本命盘', group: '基础' },
    { type: ChartType.Event, label: '天象盘', group: '基础' },
    { type: ChartType.Direction, label: '主向推运', group: '推运' },
    { type: ChartType.DailyDirection, label: '每日回归方向弧', group: '推运' },
    { type: ChartType.SolarArc, label: '太阳弧', group: '推运' },
    { type: ChartType.MedievalProfection, label: '中世纪小限', group: '推运' },
    { type: ChartType.CustomDayProfection, label: '自定义日小限', group: '推运' },
    { type: ChartType.Transit, label: '行运', group: '推运' },
    { type: ChartType.Promittor, label: '承诺星盘', group: '推运' },
    { type: ChartType.QuadrantProcess, label: '象限推运', group: '推运' },
    { type: ChartType.Profection, label: '小限', group: '推运' },
    { type: ChartType.Firdaria, label: '法达', group: '推运' },
    { type: ChartType.SolarReturn, label: '日返', group: '返照' },
    { type: ChartType.LunarReturn, label: '月返', group: '返照' },
    { type: ChartType.DailyReturn, label: '每日回归', group: '返照' },
    { type: ChartType.SolarcomparNative, label: '日返比本命', group: '比较' },
    { type: ChartType.NativecomparSolar, label: '本命比日返', group: '比较' },
    { type: ChartType.LunarcomparNative, label: '月返比本命', group: '比较' },
    { type: ChartType.NativecomparLunar, label: '本命比月返', group: '比较' },
    { type: ChartType.DailycomparNative, label: '每日回归比本命', group: '比较' },
    { type: ChartType.NativecomparDaily, label: '本命比每日回归', group: '比较' },
  ];

  readonly chartGroups: string[] = ['基础', '推运', '返照', '比较'];

  showEventInput = false;
  showNativeInput = true;
  showProcessInput = true;

  constructor(public config: Horoconfig, private alertController: AlertController) {}

  onHoroDataChange(): void {
    this.horoDataChange.emit(this.horoData);
  }

  onEventDataChange(): void {
    this.eventDataChange.emit(this.eventData);
  }

  onProcessDataChange(): void {
    this.processDataChange.emit(this.processData);
  }

  async onNativeDateChange(): Promise<void> {
    await this.checkDST(this.horoData.date, '');
  }

  async onEventDateChange(): Promise<void> {
    await this.checkDST(this.eventData.date, '天象时间：');
  }

  private async checkDST(date: DateRequest, label: string): Promise<void> {
    if (date.tz !== 8) return;
    if (!isInChineseDST({
      year: date.year,
      month: date.month,
      day: date.day,
      hour: date.hour,
      minute: date.minute,
    })) return;
    const alert = await this.alertController.create({
      header: '夏令时提示',
      message: `${label}${date.year}年${date.month}月${date.day}日处于中国夏令时实施期间，请确认是否需要勾选夏令时。`,
      buttons: ['确定'],
    });
    await alert.present();
  }

  onOpenChart(type: ChartType): void {
    this.openChart.emit(type);
  }

  onArchiveSelected(horoData: HoroRequest): void {
    this.horoData = horoData;
    this.horoDataChange.emit(this.horoData);
  }

  get processName(): string {
    return ProcessName.name(this.processData.process_name);
  }
}
