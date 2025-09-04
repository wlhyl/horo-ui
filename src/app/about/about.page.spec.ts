import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { AboutPage } from './about.page';

describe('AboutPage', () => {
  let component: AboutPage;
  let fixture: ComponentFixture<AboutPage>;
  let titleServiceSpy: jasmine.SpyObj<Title>;

  beforeEach(async () => {
    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);

    await TestBed.configureTestingModule({
      declarations: [AboutPage],
      imports: [IonicModule.forRoot()],
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
    titleServiceSpy.setTitle.calls.reset();
    component.ngOnInit();
    expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('说明');
  });
});
