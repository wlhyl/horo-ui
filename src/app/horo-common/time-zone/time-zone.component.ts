import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'horo-time-zone',
  templateUrl: './time-zone.component.html',
  styleUrls: ['./time-zone.component.scss'],
  standalone: false,
})
export class TimeZoneComponent implements OnChanges {
  @Input()
  zone = 8;

  @Output()
  zoneChange = new EventEmitter<number>();

  currentValue = 0;

  isOpen = false;

  readonly zones: ReadonlyArray<number> = Array.from(
    { length: 25 },
    (_, i) => i - 12
  );

  zoneString(v: number): string {
    return v === 0 ? '0时区' : v < 0 ? `西${-v}区` : `东${v}区`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['zone']) {
      this.currentValue = changes['zone'].currentValue;
    }
  }

  onIonChange(event: CustomEvent): void {
    this.currentValue = event.detail.value;
  }

  onDidDismiss(event: CustomEvent): void {
    // 点击确认时：event的值是 currentValue
    // 点击取消时：event的值是 null

    if (event.detail.data) {
      this.zone = event.detail.data;
      this.zoneChange.emit(this.zone);
    } else {
      this.currentValue = this.zone;
    }

    this.isOpen = false;
  }
}
