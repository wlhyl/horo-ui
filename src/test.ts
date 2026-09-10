// This file is required by karma.conf.js and loads recursively all the .spec and framework files

// fakeAsync()/tick()/flush() 需要 zone.js/testing（应用本身已使用 zoneless 变更检测）
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting()
);
