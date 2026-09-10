import { createSpy, createSpyObj, expectAsync, type Spy, type SpyObj } from 'src/test-utils/spy';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { CleanPage } from './clean.page';
import { HoroStorageService } from '../services/horostorage/horostorage.service';

describe('CleanPage', () => {
  let component: CleanPage;
  let fixture: ComponentFixture<CleanPage>;
  let titleServiceSpy: SpyObj<Title>;
  let storageServiceSpy: SpyObj<HoroStorageService>;

  beforeEach(async () => {
    titleServiceSpy = createSpyObj('Title', ['setTitle']);
    storageServiceSpy = createSpyObj('HoroStorageService', ['clean']);

    await TestBed.configureTestingModule({
      imports: [IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CleanPage],
      providers: [
        { provide: Title, useValue: titleServiceSpy },
        { provide: HoroStorageService, useValue: storageServiceSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CleanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call titleService.setTitle with correct title', () => {
    titleServiceSpy.setTitle.mockClear();
    component.ngOnInit();
    expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('清除缓存');
  });

  it('should call storage.clean and update message when clean is called', () => {
    component.clean();
    expect(storageServiceSpy.clean).toHaveBeenCalled();
    expect(component.message).toBe('清除缓存完成');
  });
});
