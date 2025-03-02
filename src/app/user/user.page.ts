import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../services/auth/auth.service';
import { Path } from '../type/enum/path';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {
  path = Path;
  title = '用户';

  // loginModalOpen = false;
  // logoutModalOpen = false;

  user = '';
  password = '';
  error = '';

  // selectedNativeId = 0;

  // isDetailModalOpen = false;
  // selectedNative: Native | null = null;

  // isEditModalOpen = false;
  // editedNative: Native = {
  //   id: 0,
  //   name: null,
  //   sex: false,
  //   year: 0,
  //   month: 0,
  //   day: 0,
  //   hour: 0,
  //   minute: 0,
  //   second: 0,
  //   tz: 0,
  //   st: false,
  //   geo: {
  //     id: 0,
  //     name: '',
  //     east: false,
  //     long_d: 0,
  //     long_m: 0,
  //     long_s: 0,
  //     north: false,
  //     lat_d: 0,
  //     lat_m: 0,
  //     lat_s: 0,
  //   },
  //   describe: null,
  //   create_date: '',
  //   last_update_date: null,
  // };

  constructor(private titleService: Title, public authService: AuthService) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
    if (this.authService.isAuth) {
      // this.getNatives();
      this.user = this.authService.user.name;
    }
  }

  login() {
    this.authService.auth(this.user, this.password).subscribe({
      next: () => {
        // this.user = '';
        this.password = '';
        this.error = '';
      },
      error: (err) => {
        err.error.error
          ? (this.error = err.error.error)
          : (this.error = '登录失败');
      },
    });
  }

  // cancel() {
  //   this.user = '';
  //   this.password;
  //   this.error = '';
  //   this.loginModalOpen = false;
  // }

  // // onDidDismissLogin(event: CustomEvent) {
  // confirm() {
  //   this.authService.auth(this.user, this.password).subscribe({
  //     next: () => {
  //       this.user = '';
  //       this.password;
  //       this.error = '';
  //       this.loginModalOpen = false;
  //       this.getNatives();
  //     },
  //     error: (err) => {
  //       err.error.error
  //         ? (this.error = err.error.error)
  //         : (this.error = '登录失败');
  //     },
  //   });
  // }

  logout() {
    this.authService.deleteToken();
    // this.logoutModalOpen = false;
  }

  // showDetail(native: Native) {
  //   this.selectedNative = native;
  //   this.isDetailModalOpen = true;
  // }
  // edit(native: Native) {
  //   this.editedNative = deepClone(native);
  //   this.isEditModalOpen = true;
  // }

  // saveEdit() {
  //   const request: NativeRequest = {
  //     name: !this.editedNative.name ? null : this.editedNative.name,
  //     sex: this.editedNative.sex,
  //     year: this.editedNative.year,
  //     month: this.editedNative.month,
  //     day: this.editedNative.day,
  //     hour: this.editedNative.hour,
  //     minute: this.editedNative.minute,
  //     second: this.editedNative.second,
  //     tz: this.editedNative.tz,
  //     st: this.editedNative.st,
  //     geo: {
  //       name: this.editedNative.geo.name,
  //       east: this.editedNative.geo.east,
  //       long_d: this.editedNative.geo.long_d,
  //       long_m: this.editedNative.geo.long_m,
  //       long_s: this.editedNative.geo.long_s,
  //       north: this.editedNative.geo.north,
  //       lat_d: this.editedNative.geo.lat_d,
  //       lat_m: this.editedNative.geo.lat_m,
  //       lat_s: this.editedNative.geo.lat_s,
  //     },
  //     describe: !this.editedNative.describe ? null : this.editedNative.describe,
  //   };

  //   this.api.updateNative(this.editedNative.id, request).subscribe({
  //     next: () => {
  //       this.isEditModalOpen = false;
  //       this.getNatives();
  //     },
  //     error: (err) => {
  //       this.isAlertOpen = true;
  //       this.message = '修改档案失败';
  //     },
  //   });
  // }

  // delete(nativeId: number) {
  //   this.api.deleteNative(nativeId).subscribe({
  //     next: () => {
  //       this.getNatives();
  //     },
  //     error: (err) => {
  //       this.isAlertOpen = true;
  //       this.message = '删除档案失败';
  //     },
  //   });
  // }
}
