import { createSpy, createSpyObj, expectAsync, type Spy, type SpyObj } from 'src/test-utils/spy';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { AboutPage } from './about.page';

describe('AboutPage', () => {
  let component: AboutPage;
  let fixture: ComponentFixture<AboutPage>;
  let titleServiceSpy: SpyObj<Title>;

  beforeEach(async () => {
    titleServiceSpy = createSpyObj('Title', ['setTitle']);

    await TestBed.configureTestingModule({
      imports: [IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar, AboutPage],
      providers: [{ provide: Title, useValue: titleServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call titleService.setTitle with correct title', () => {
    titleServiceSpy.setTitle.mockClear();
    component.ngOnInit();
    expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('说明');
  });
});
