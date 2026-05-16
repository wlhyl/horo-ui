import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { ProfectionRequest } from 'src/app/type/interface/request-data';
import { HoroDateTime, Profection } from 'src/app/type/interface/response-data';

@Component({
  selector: 'app-profection',
  templateUrl: './profection.component.html',
  styleUrls: ['./profection.component.scss'],
  standalone: false,
})
export class ProfectionComponent implements OnInit {
  horoData = this.storage.horoData;
  processData = this.storage.processData;
  profection: Profection = {
    year_house: 0,
    month_house: 0,
    day_house: 0,
    hour_house: 0,
    date_per_house: [],
    hour_per_house: [],
  };

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  isDatePerHouseCollapsed = false;
  isHourPerHouseCollapsed = false;

  title = '小限';

  constructor(
    private api: ApiService,
    private storage: HoroStorageService,
    private titleService: Title,
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);

    const profectionData: ProfectionRequest = {
      native_date: this.horoData.date,
      process_date: this.processData.date,
    };
    this.api.profection(profectionData).subscribe({
      next: (response) => (this.profection = response),
      error: (error) => {
        const message = error.message + ' ' + error.error.message;
        this.message = message;
        this.isAlertOpen = true;
      },
    });
  }

  formatDate(date: HoroDateTime): string {
    return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')} ${date.hour.toString().padStart(2, '0')}:${date.minute.toString().padStart(2, '0')}:${date.second.toString().padStart(2, '0')}`;
  }
}
