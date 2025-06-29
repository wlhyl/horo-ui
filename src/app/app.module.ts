import { NgModule, inject, provideAppInitializer } from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {RouteReuseStrategy} from "@angular/router";

// 数据双向绑定
// import { FormsModule } from '@angular/forms';

import {IonicModule, IonicRouteStrategy} from "@ionic/angular";

// http访问
import {provideHttpClient, withInterceptors} from "@angular/common/http";

import {AppComponent} from "./app.component";
import {AppRoutingModule} from "./app-routing.module";
import {Horoconfig} from "./services/config/horo-config.service";
import {ApiService} from "./services/api/api.service";
import {appInit} from "./services/init/app-init";
import {authInterceptor} from "./interceptor/auth/auth.interceptor";

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule], providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    provideAppInitializer(() => {
        const initializerFn = ((config: Horoconfig, api: ApiService) => () => appInit(config, api))(inject(Horoconfig), inject(ApiService));
        return initializerFn();
      }),
    provideHttpClient(withInterceptors([authInterceptor])),
  ]
})
export class AppModule {
}
