import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { CleanPage } from './clean.page';
import { HoroStorageService } from '../services/horostorage/horostorage.service';

describe('CleanPage', () => {
  let component: CleanPage;
  let fixture: ComponentFixture<CleanPage>;
  let titleServiceSpy: jasmine.SpyObj<Title>;
  let storageServiceSpy: jasmine.SpyObj<HoroStorageService>;

  beforeEach(async () => {
    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);
    storageServiceSpy = jasmine.createSpyObj('HoroStorageService', ['clean']);

    await TestBed.configureTestingModule({
      declarations: [CleanPage],
      imports: [IonicModule.forRoot()],
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
    titleServiceSpy.setTitle.calls.reset();
    component.ngOnInit();
    expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('清除缓存');
  });

  it('should call storage.clean and update message when clean is called', () => {
    component.clean();
    expect(storageServiceSpy.clean).toHaveBeenCalled();
    expect(component.message).toBe('清除缓存完成');
  });
});
