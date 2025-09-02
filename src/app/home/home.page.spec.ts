import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth/auth.service';
import { Path } from '../type/enum/path';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuth: false,
    });

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('should initialize path property', () => {
      expect(component.path).toBe(Path);
    });

    it('should inject Router service', () => {
      expect(component['router']).toBe(routerSpy);
    });

    it('should inject AuthService', () => {
      expect(component.authService).toBe(authServiceSpy);
    });
  });

  describe('navigate method', () => {
    it('should call router.navigateByUrl with correct URL', () => {
      const testUrl = '/test-url';
      component.navigate(testUrl);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(testUrl);
    });

    it('should handle empty URL', () => {
      component.navigate('');
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('');
    });

    it('should handle path enum values', () => {
      component.navigate(Path.Native);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(Path.Native);
    });

    it('should handle all path enum values', () => {
      const paths = Object.values(Path);
      paths.forEach((path) => {
        routerSpy.navigateByUrl.calls.reset();
        component.navigate(path);
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(path);
      });
    });

    it('should handle special characters in URL', () => {
      const specialUrl = '/test?param=value&another=123#section';
      component.navigate(specialUrl);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(specialUrl);
    });
  });

  describe('component properties', () => {
    it('should have authService as public property', () => {
      expect(component.authService).toBeDefined();
      expect(component.authService).toBe(authServiceSpy);
    });

    it('should have path property set to Path enum', () => {
      expect(component.path).toBe(Path);
    });
  });

  describe('template integration', () => {
    it('should render navigation items', () => {
      const compiled = fixture.nativeElement;
      const navItems = compiled.querySelectorAll('.item');
      expect(navItems.length).toBeGreaterThan(0);
    });

    it('should have click handlers on navigation items', () => {
      const compiled = fixture.nativeElement;
      const navItems = compiled.querySelectorAll('.item');
      navItems.forEach((navItem: any) => {
        routerSpy.navigateByUrl.calls.reset();
        navItem.click();
        expect(routerSpy.navigateByUrl).toHaveBeenCalled();
      });
    });

    it('should render page title correctly', () => {
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('ion-title');
      expect(title.textContent.trim()).toBe('星盘');
    });

    it('should not render archive item when authService.isAuth is false', () => {
      const compiled = fixture.nativeElement;
      const archiveItems = compiled.querySelectorAll(
        '.item ion-icon[name="server-outline"]'
      );
      expect(archiveItems.length).toBe(0);
    });
  });
});

describe('HomePage with authenticated user', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuth: true, // Set to true for this test suite
    });

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render archive item when authService.isAuth is true', () => {
    const compiled = fixture.nativeElement;
    const archiveItems = compiled.querySelectorAll(
      '.item ion-icon[name="server-outline"]'
    );
    expect(archiveItems.length).toBe(1);
  });
});
