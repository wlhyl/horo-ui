import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { LongLatResponse } from 'src/app/type/interface/horo-admin/longLat-response';

import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockLocations: LongLatResponse[] = [
    { name: 'Shanghai', longitude: '121.47', latitude: '31.23' },
    { name: 'Beijing', longitude: '116.40', latitude: '39.90' },
  ];

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['getLongLat']);

    await TestBed.configureTestingModule({
      declarations: [MapComponent],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: ApiService, useValue: apiServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('open() should open modal and reset state', () => {
    component.isModalOpen = false;
    component.locations = mockLocations;
    component.selectedLocation = mockLocations[0];
    component.query.errorMessage = 'error';

    component.open();

    expect(component.isModalOpen).toBeTrue();
    expect(component.locations.length).toBe(0);
    expect(component.selectedLocation).toBeNull();
    expect(component.query.errorMessage).toBe('');
  });

  it('cancel() should close modal', () => {
    component.isModalOpen = true;
    component.cancel();
    expect(component.isModalOpen).toBeFalse();
  });

  describe('ok()', () => {
    beforeEach(() => {
      spyOn(component.localNameChange, 'emit');
      spyOn(component.longChange, 'emit');
      spyOn(component.latChange, 'emit');
      component.isModalOpen = true;
    });

    it('should emit selected location and close modal if a location is selected', () => {
      const selected = mockLocations[0];
      component.selectedLocation = selected;

      component.ok();

      expect(component.localNameChange.emit).toHaveBeenCalledWith(
        selected.name
      );
      expect(component.longChange.emit).toHaveBeenCalledWith(
        Number(selected.longitude)
      );
      expect(component.latChange.emit).toHaveBeenCalledWith(
        Number(selected.latitude)
      );
      expect(component.isModalOpen).toBeFalse();
    });

    it('should not emit and just close modal if no location is selected', () => {
      component.selectedLocation = null;

      component.ok();

      expect(component.localNameChange.emit).not.toHaveBeenCalled();
      expect(component.longChange.emit).not.toHaveBeenCalled();
      expect(component.latChange.emit).not.toHaveBeenCalled();
      expect(component.isModalOpen).toBeFalse();
    });
  });

  describe('queryGeo()', () => {
    beforeEach(() => {
      component.locations = [];
      component.selectedLocation = null;
      component.query = { error: false, errorMessage: '', loading: false };
    });

    it('should not call api if localName is empty', () => {
      component.localName = '';
      component.queryGeo();
      expect(apiServiceSpy.getLongLat).not.toHaveBeenCalled();
    });

    it('should call api and handle successful response', () => {
      apiServiceSpy.getLongLat.and.returnValue(of(mockLocations));
      component.localName = 'test';

      component.queryGeo();

      expect(apiServiceSpy.getLongLat).toHaveBeenCalledWith('test');

      expect(component.query.loading).toBeFalse();
      expect(component.locations).toEqual(mockLocations);
      expect(component.query.error).toBeFalse();
    });

    it('should handle successful response with empty result', () => {
      apiServiceSpy.getLongLat.and.returnValue(of([]));
      component.localName = 'unknown';

      component.queryGeo();
      fixture.detectChanges();

      expect(component.query.loading).toBeFalse();
      expect(component.locations.length).toBe(0);
      expect(component.query.error).toBeTrue();
      expect(component.query.errorMessage).toBe('未查询到任何结果');
    });

    it('should handle api error with a specific error message', () => {
      const errorResponse = { error: { error: 'Backend Error' } };
      apiServiceSpy.getLongLat.and.returnValue(throwError(() => errorResponse));
      component.localName = 'test';

      component.queryGeo();
      fixture.detectChanges();

      expect(component.query.loading).toBeFalse();
      expect(component.query.error).toBeTrue();
      expect(component.query.errorMessage).toBe('Backend Error');
    });

    it('should handle api error with an unknown error message', () => {
      const errorResponse = { status: 500 };
      apiServiceSpy.getLongLat.and.returnValue(throwError(() => errorResponse));
      component.localName = 'test';

      component.queryGeo();
      fixture.detectChanges();

      expect(component.query.loading).toBeFalse();
      expect(component.query.error).toBeTrue();
      expect(component.query.errorMessage).toBe('未知错误');
    });
  });
});
