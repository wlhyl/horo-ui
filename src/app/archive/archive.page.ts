import {Component, OnInit} from "@angular/core";
import {Title} from "@angular/platform-browser";
import {InfiniteScrollCustomEvent, ViewWillEnter} from "@ionic/angular";
import {ApiService} from "../services/api/api.service";
import {PageResponser} from "../type/interface/page";
import {HoroscopeRecord} from "../type/interface/horoscope-record";
import {ActivatedRoute, Router} from "@angular/router";
import {HoroStorageService} from "../services/horostorage/horostorage.service";
import {HoroRequest} from "../type/interface/request-data";
import {Path} from "../type/enum/path";
import {Path as SubPath} from "./enum";

@Component({
    selector: "app-archive",
    templateUrl: "./archive.page.html",
    styleUrls: ["./archive.page.scss"],
    standalone: false
})
export class ArchivePage implements OnInit, ViewWillEnter {
  title = "档案库";

  path = Path;

  isAlertOpen = false;
  alertButtons = ["OK"];
  message = "";

  private page = 0;
  private size = 10;
  natives: PageResponser<Array<HoroscopeRecord>> = {
    data: [],
    total: 0,
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private api: ApiService,
    private storage: HoroStorageService
  ) {
  }

  ionViewWillEnter(): void {
    this.getNatives();
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
    // this.getNatives();
  }

  getNatives(event?: InfiniteScrollCustomEvent) {
    this.api.getNatives(0, this.size * (this.page + 1)).subscribe({
      next: (res) => {
        // 将res.data添加到this.natives.data中
        // this.natives.data = this.natives.data.concat(res.data);

        // this.natives.total = res.total;
        // this.natives.data.push(...res.data);
        this.natives = res;
        if (event) {
          event.target.complete();
        }
      },
      error: (error) => {
        const msg = error.error.error;
        let message = "获取档案数据失败！";
        if (msg) message += msg;
        this.message = message;
        this.isAlertOpen = true;
        // this.message = error.error + ' ' + error.error.message;
        if (event) {
          event.target.complete();
        }
      },
    });
    // .add(() => {
    //   if (event) {
    //     event.target.complete();
    //   }
    // });
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    if (this.natives.total == 1) {
      event.target.complete();
      return;
    }

    this.page++;
    this.getNatives(event);
  }

  add() {
    this.router.navigate([SubPath.Edit], {
      relativeTo: this.route,
    });
  }

  delete(id: number) {
    this.api.deleteNative(id).subscribe({
      next: () => {
        this.getNatives();
      },
      error: (error) => {
        const msg = error.error.error;
        let message = "删除档案失败！";
        if (msg) message += msg;
        this.message = message;
        this.isAlertOpen = true;
      },
    });
  }

  edit(native: HoroscopeRecord) {
    this.router.navigate(["edit"], {
      relativeTo: this.route,
      state: native,
    });
  }

  toHoro(native: HoroscopeRecord, path: string) {
    // date: DateRequest;
    //   geo_name: string;
    //   geo: GeoRequest;
    //   house: string;
    //   describe: string;
    //   sex: boolean;
    // this.storage.horoData.date.year = native.year;
    // this.storage.horoData.date.month = native.month;
    // this.storage.horoData.date.day = native.day;
    // this.storage.horoData.date.hour = native.hour;
    // this.storage.horoData.date.minute = native.minute;
    // this.storage.horoData.date.second = native.second;
    // this.storage.horoData.date.tz = native.tz;
    // this.storage.horoData.date.st = native.st;
    // this.storage.horoData.geo_name = native.geo.name;
    // this.storage.horoData.geo.long =
    //   native.geo.long_d + native.geo.long_m / 60 + native.geo.long_s / 3600;
    // this.storage.horoData.geo.lat =
    //   native.geo.lat_d + native.geo.lat_m / 60 + native.geo.lat_s / 3600;
    // if (!native.geo.east)
    //   this.storage.horoData.geo.long = -this.storage.horoData.geo.long;
    // if (!native.geo.north)
    //   this.storage.horoData.geo.lat = -this.storage.horoData.geo.lat;
    // this.storage.horoData.describe = native.describe ? native.describe : '';
    // this.storage.horoData.sex = native.sex;

    // console.log(native)
    // console.log(this.storage.horoData.date.year);
    let long =
      native.location.longitude_degree + native.location.longitude_minute / 60 + native.location.longitude_second / 3600;
    let lat =
      native.location.latitude_degree + native.location.latitude_minute / 60 + native.location.latitude_second / 3600;
    if (!native.location.is_east) long = -long;
    if (!native.location.is_north) lat = -lat;

    const date: HoroRequest = {
      id: native.id,
      date: {
        year: native.birth_year,
        month: native.birth_month,
        day: native.birth_day,
        hour: native.birth_hour,
        minute: native.birth_minute,
        second: native.birth_second,
        tz: native.time_zone_offset,
        st: native.is_dst,
      },
      geo_name: native.location.name,
      geo: {
        long,
        lat,
      },
      house: this.storage.horoData.house,
      name: native.name ? native.name : "",
      sex: native.gender,
    };

    this.storage.horoData = date;
    this.router.navigateByUrl(path);
  }
}
