import { createSpy, createSpyObj, expectAsync, type Spy, type SpyObj } from 'src/test-utils/spy';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { LongLatResponse } from 'src/app/type/interface/horo-admin/longLat-response';

import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let apiServiceSpy: SpyObj<ApiService>;

  const mockLocations: LongLatResponse[] = [
    { name: 'Shanghai', longitude: '121.47', latitude: '31.23' },
    { name: 'Beijing', longitude: '116.40', latitude: '39.90' },
  ];

  beforeEach(async () => {
    apiServiceSpy = createSpyObj('ApiService', ['getLongLat']);

    await TestBed.configureTestingModule({
      declarations: [MapComponent],
      imports: [IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonRadio, IonRadioGroup, IonSpinner, IonTitle, IonToolbar],
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
    component.locations.set(mockLocations);
    component.selectedLocation = mockLocations[0];
    component.queryErrorMessage.set('error');

    component.open();

    expect(component.isModalOpen).toBe(true);
    expect(component.locations().length).toBe(0);
    expect(component.selectedLocation).toBeNull();
    expect(component.queryErrorMessage()).toBe('');
  });

  it('cancel() should close modal', () => {
    component.isModalOpen = true;
    component.cancel();
    expect(component.isModalOpen).toBe(false);
  });

  describe('ok()', () => {
    beforeEach(() => {
     vi.spyOn(component.localNameChange, 'emit');
     vi.spyOn(component.longChange, 'emit');
     vi.spyOn(component.latChange, 'emit');
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
      expect(component.isModalOpen).toBe(false);
    });

    it('should not emit and just close modal if no location is selected', () => {
      component.selectedLocation = null;

      component.ok();

      expect(component.localNameChange.emit).not.toHaveBeenCalled();
      expect(component.longChange.emit).not.toHaveBeenCalled();
      expect(component.latChange.emit).not.toHaveBeenCalled();
      expect(component.isModalOpen).toBe(false);
    });
  });

  describe('queryGeo()', () => {
    beforeEach(() => {
      component.locations.set([]);
      component.selectedLocation = null;
      component.queryError.set(false);
      component.queryErrorMessage.set('');
      component.queryLoading.set(false);
    });

    it('should not call api if localName is empty', () => {
      component.localName = '';
      component.queryGeo();
      expect(apiServiceSpy.getLongLat).not.toHaveBeenCalled();
    });

    it('should call api and handle successful response', () => {
      apiServiceSpy.getLongLat.mockReturnValue(of(mockLocations));
      component.localName = 'test';

      component.queryGeo();

      expect(apiServiceSpy.getLongLat).toHaveBeenCalledWith('test');

      expect(component.queryLoading()).toBe(false);
      expect(component.locations()).toEqual(mockLocations);
      expect(component.queryError()).toBe(false);
    });

    it('should handle successful response with empty result', () => {
      apiServiceSpy.getLongLat.mockReturnValue(of([]));
      component.localName = 'unknown';

      component.queryGeo();
      fixture.detectChanges();

      expect(component.queryLoading()).toBe(false);
      expect(component.locations().length).toBe(0);
      expect(component.queryError()).toBe(true);
      expect(component.queryErrorMessage()).toBe('未查询到任何结果');
    });

    it('should handle api error with a specific error message', () => {
      const errorResponse = { error: { error: 'Backend Error' } };
      apiServiceSpy.getLongLat.mockReturnValue(throwError(() => errorResponse));
      component.localName = 'test';

      component.queryGeo();
      fixture.detectChanges();

      expect(component.queryLoading()).toBe(false);
      expect(component.queryError()).toBe(true);
      expect(component.queryErrorMessage()).toBe('Backend Error');
    });

    it('should handle api error with an unknown error message', () => {
      const errorResponse = { status: 500 };
      apiServiceSpy.getLongLat.mockReturnValue(throwError(() => errorResponse));
      component.localName = 'test';

      component.queryGeo();
      fixture.detectChanges();

      expect(component.queryLoading()).toBe(false);
      expect(component.queryError()).toBe(true);
      expect(component.queryErrorMessage()).toBe('未知错误');
    });
  });
});
