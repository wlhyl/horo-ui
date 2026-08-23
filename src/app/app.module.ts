import { NgModule, inject, provideAppInitializer } from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {RouteReuseStrategy} from "@angular/router";

// 数据双向绑定
// import { FormsModule } from '@angular/forms';

import {IonApp, IonRouterOutlet, IonicRouteStrategy, provideIonicAngular} from "@ionic/angular";

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
    IonApp,
    IonRouterOutlet,
    AppRoutingModule], providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    provideIonicAngular(),
    provideAppInitializer(() => appInit(inject(Horoconfig), inject(ApiService))()),
    provideHttpClient(withInterceptors([authInterceptor])),
  ]
})
export class AppModule {
}
