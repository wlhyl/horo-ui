import { Component, OnInit } from '@angular/core';
import { Path } from 'src/app/type/enum/path';
import { Title } from '@angular/platform-browser';
import { ReturnHoroscope } from 'src/app/type/interface/response-data';
import { Router } from '@angular/router';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { degreeToDMS } from 'src/app/utils/horo-math/horo-math';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    standalone: false
})
export class DetailComponent implements OnInit {
  path = Path;
  title = '返照盘详情';

  returnData: ReturnHoroscope | null = null;

  degreeToDMSFn = degreeToDMS;

  constructor(
    private titleService: Title,
    private router: Router,
    public config: Horoconfig
  ) {
    this.titleService.setTitle(this.title);
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.returnData = navigation.extras.state['data'] as ReturnHoroscope;
    }
  }

  ngOnInit() {}
}
