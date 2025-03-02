import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {
  HoroRequest,
  ProfectionRequest,
  ReturnRequest,
  HoroscopeComparisonRequest,
  FirdariaRequest,
  QiZhengRequst,
} from "src/app/type/interface/request-data";
import {
  FirdariaPeriod,
  Horoscope,
  HoroscopeComparison,
  Profection,
  ReturnHoroscope,
} from "src/app/type/interface/response-data";
import {Horoscope as QiZhengHoroscope} from "src/app/type/interface/response-qizheng";
import {environment} from "src/environments/environment";
import {UpdateUserRequest} from "../../type/interface/user";
import {PageResponser} from "../../type/interface/page";
import {HoroscopeRecord, HoroscopeRecordRequest, UpdateHoroscopeRecordRequest} from "../../type/interface/horoscope-record";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private readonly url = `${environment.base_url}/api`;
  private readonly admin_url = environment.admin_url;

  constructor(private http: HttpClient) {
  }

  /**
   *
   * @returns 获取宫位系统
   */
  public getHouses(): Observable<Array<string>> {
    return this.http.get<Array<string>>(`${this.url}/houses`);
  }

  /**
   *
   * @returns 获取本命星盘
   */
  public getNativeHoroscope(data: HoroRequest): Observable<Horoscope> {
    return this.http.post<Horoscope>(`${this.url}/horo/native`, data);
  }

  /**
   *
   * @returns 获取小限
   */
  public profection(data: ProfectionRequest): Observable<Profection> {
    return this.http.post<Profection>(`${this.url}/process/profection`, data);
  }

  /**
   *
   * @returns 获取法达
   */
  public firdaria(data: FirdariaRequest): Observable<Array<FirdariaPeriod>> {
    return this.http.post<Array<FirdariaPeriod>>(`${this.url}/process/firdaria`, data);
  }

  /**
   *
   * @returns 获取比较盘
   */
  public compare(data: HoroscopeComparisonRequest): Observable<HoroscopeComparison> {
    return this.http.post<HoroscopeComparison>(`${this.url}/process/compare`, data);
  }

  /**
   *
   * @returns 获取太阳返照盘
   */
  public solarReturn(data: ReturnRequest): Observable<ReturnHoroscope> {
    return this.http.post<ReturnHoroscope>(`${this.url}/process/return/solar`, data);
  }

  /**
   *
   * @returns 获取月亮返照盘
   */
  public lunarReturn(data: ReturnRequest): Observable<ReturnHoroscope> {
    return this.http.post<ReturnHoroscope>(`${this.url}/process/return/lunar`, data);
  }

  /**
   *
   * @returns 获取七政
   */
  public qizheng(data: QiZhengRequst): Observable<QiZhengHoroscope> {
    return this.http.post<QiZhengHoroscope>(`${this.url}/qizheng/horo`, data);
  }


  // 更新新user
  updateUser(user: UpdateUserRequest): Observable<void> {
    return this.http.put<void>(`${this.admin_url}/user`, user);
  }


  // 获取HoroscopeRecord
  getNatives(page: number, size: number): Observable<PageResponser<Array<HoroscopeRecord>>> {
    return this.http.get<PageResponser<Array<HoroscopeRecord>>>(`${this.admin_url}/horoscopes?page=${page}&size=${size}`);
  }

  // 根据id获取HoroscopeRecord
  getNativeById(id: number): Observable<HoroscopeRecord> {
    return this.http.get<HoroscopeRecord>(`${this.admin_url}/horoscopes/${id}`);
  }


  // 新增HoroscopeRecord
  addNative(native: HoroscopeRecordRequest): Observable<HoroscopeRecord> {
    return this.http.post<HoroscopeRecord>(`${this.admin_url}/horoscopes`, native);
  }

  // 更新HoroscopeRecord
  updateNative(id: number, native: UpdateHoroscopeRecordRequest): Observable<void> {
    return this.http.put<void>(`${this.admin_url}/horoscopes/${id}`, native);
  }


  // 删除HoroscopeRecord
  deleteNative(id: number): Observable<void> {
    return this.http.delete<void>(`${this.admin_url}/horoscopes/${id}`);
  }
}
