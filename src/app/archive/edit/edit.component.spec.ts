import { TestBed, tick, fakeAsync } from '@angular/core/testing';
import { EditComponent } from './edit.component';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { of, delay, throwError } from 'rxjs';
import { HoroscopeRecord } from 'src/app/type/interface/horo-admin/horoscope-record';
import { Path } from '../../type/enum/path';

describe('EditComponent', () => {
  let component: EditComponent;
  let titleService: jasmine.SpyObj<Title>;
  let routerSpy: jasmine.SpyObj<Router>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockHoroscopeRecord: HoroscopeRecord = {
    id: 1,
    name: 'Test User',
    gender: true,
    birth_year: 1990,
    birth_month: 1,
    birth_day: 1,
    birth_hour: 12,
    birth_minute: 0,
    birth_second: 0,
    time_zone_offset: 8,
    is_dst: false,
    location: {
      id: 1,
      name: 'Beijing',
      is_east: true,
      longitude_degree: 116,
      longitude_minute: 23,
      longitude_second: 29,
      is_north: true,
      latitude_degree: 39,
      latitude_minute: 54,
      latitude_second: 23,
    },
    description: 'Test description',
    created_at: '2023-01-01',
    updated_at: null,
  };

  beforeEach(() => {
    titleService = jasmine.createSpyObj('Title', ['setTitle']);
    routerSpy = jasmine.createSpyObj('Router', ['currentNavigation']);
    apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'addNative',
      'updateNative',
    ]);

    TestBed.configureTestingModule({
      providers: [
        EditComponent,
        { provide: Title, useValue: titleService },
        { provide: Router, useValue: routerSpy },
        { provide: ApiService, useValue: apiServiceSpy },
      ],
    });

    const fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    let newComponent: EditComponent;
    const expectedDefaultNative: HoroscopeRecord = {
      id: 0,
      name: '',
      gender: true,
      birth_year: 2023,
      birth_month: 6,
      birth_day: 15,
      birth_hour: 10,
      birth_minute: 30,
      birth_second: 45,
      time_zone_offset: 8,
      is_dst: false,
      location: {
        id: 0,
        name: '北京',
        is_east: true,
        longitude_degree: 116,
        longitude_minute: 23,
        longitude_second: 0,
        is_north: true,
        latitude_degree: 39,
        latitude_minute: 54,
        latitude_second: 0,
      },
      description: '',
      created_at: '',
      updated_at: '',
    };

    beforeEach(() => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date('2023-06-15T10:30:45+08:00'));
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should set title to "编辑" when native data is provided', () => {
      // Set up router spy to return mock data
      routerSpy.currentNavigation.and.returnValue({
        extras: {
          state: mockHoroscopeRecord,
        },
      } as any);

      // Re-create component with new router state
      const fixture = TestBed.createComponent(EditComponent);
      newComponent = fixture.componentInstance;
      newComponent.ngOnInit();
      expect(newComponent.title).toBe('编辑');
      expect(titleService.setTitle).toHaveBeenCalledWith('编辑');
      // Verify that native and oldNative are properly cloned
      expect(newComponent.native).toEqual(mockHoroscopeRecord);
      expect(newComponent.oldNative).toEqual(mockHoroscopeRecord);
      expect(newComponent.native).not.toBe(mockHoroscopeRecord); // Should be a clone
      expect(newComponent.oldNative).not.toBe(mockHoroscopeRecord); // Should be a clone
      expect(newComponent.native).not.toBe(newComponent.oldNative); // Should be different objects
    });

    describe('when no native data is provided', () => {
      beforeEach(() => {
        // Reset the router spy to return undefined state
        routerSpy.currentNavigation.and.returnValue({
          extras: {
            state: undefined,
          },
        } as any);

        // Re-create component with new router state
        const fixture = TestBed.createComponent(EditComponent);
        newComponent = fixture.componentInstance;
        newComponent.ngOnInit();
      });

      it('should set title to "新增"', () => {
        expect(newComponent.title).toBe('新增');
        expect(titleService.setTitle).toHaveBeenCalledWith('新增');
      });

      it('should set native to default values', () => {
        expect(newComponent.native).toEqual(expectedDefaultNative);
      });
    });

    describe('when router.currentNavigation() returns null', () => {
      beforeEach(() => {
        // Set up router spy to return null
        routerSpy.currentNavigation.and.returnValue(null);

        // Re-create component with new router state
        const fixture = TestBed.createComponent(EditComponent);
        newComponent = fixture.componentInstance;
        newComponent.ngOnInit();
      });

      it('should set title to "新增"', () => {
        expect(newComponent.title).toBe('新增');
        expect(titleService.setTitle).toHaveBeenCalledWith('新增');
      });

      it('should set native to default values', () => {
        expect(newComponent.native).toEqual(expectedDefaultNative);
      });
    });
  });

  describe('title property', () => {
    it('should return "新增" when native.id is 0', () => {
      component.native.id = 0;
      expect(component.title).toBe('新增');
    });

    it('should return "编辑" when native.id is not 0', () => {
      component.native.id = 1;
      expect(component.title).toBe('编辑');
    });
  });

  describe('dateTime property', () => {
    it('should get dateTime in correct format', () => {
      // Set the component's native data to our mock data
      component.native = { ...mockHoroscopeRecord };
      const expectedDateTime = `${
        mockHoroscopeRecord.birth_year
      }-${mockHoroscopeRecord.birth_month
        .toString()
        .padStart(2, '0')}-${mockHoroscopeRecord.birth_day
        .toString()
        .padStart(2, '0')}T${mockHoroscopeRecord.birth_hour
        .toString()
        .padStart(2, '0')}:${mockHoroscopeRecord.birth_minute
        .toString()
        .padStart(2, '0')}:${mockHoroscopeRecord.birth_second
        .toString()
        .padStart(2, '0')}`;
      expect(component.dateTime).toBe(expectedDateTime);
    });

    it('should set dateTime correctly', () => {
      // Set the component's native data to our mock data
      component.native = { ...mockHoroscopeRecord };
      component.dateTime = '2000-02-02T13:11:10';
      expect(component.native.birth_year).toBe(2000);
      expect(component.native.birth_month).toBe(2);
      expect(component.native.birth_day).toBe(2);
      expect(component.native.birth_hour).toBe(13);
      expect(component.native.birth_minute).toBe(11);
      // Note: The setter doesn't handle seconds, so we don't test it here
    });
  });

  describe('formattedDateTime property', () => {
    it('should format dateTime correctly', () => {
      // Set the component's native data to our mock data
      component.native = { ...mockHoroscopeRecord };
      const expectedFormattedDateTime = `${
        mockHoroscopeRecord.birth_year
      }-${mockHoroscopeRecord.birth_month
        .toString()
        .padStart(2, '0')}-${mockHoroscopeRecord.birth_day
        .toString()
        .padStart(2, '0')} ${mockHoroscopeRecord.birth_hour
        .toString()
        .padStart(2, '0')}:${mockHoroscopeRecord.birth_minute
        .toString()
        .padStart(2, '0')}:${mockHoroscopeRecord.birth_second
        .toString()
        .padStart(2, '0')}`;
      expect(component.formattedDateTime).toBe(expectedFormattedDateTime);
    });
  });

  describe('formattedTimeZone property', () => {
    it('should format time zone correctly for positive offset', () => {
      component.native.time_zone_offset = 8;
      expect(component.formattedTimeZone).toBe('东8区');
    });

    it('should format time zone correctly for negative offset', () => {
      component.native.time_zone_offset = -5;
      expect(component.formattedTimeZone).toBe('西5区');
    });

    it('should format time zone correctly for zero offset', () => {
      component.native.time_zone_offset = 0;
      expect(component.formattedTimeZone).toBe('0时区');
    });
  });

  describe('formattedLongitude property', () => {
    it('should format longitude correctly for east longitude', () => {
      component.native.location.is_east = true;
      component.native.location.longitude_degree = 116;
      component.native.location.longitude_minute = 23;
      component.native.location.longitude_second = 29;
      expect(component.formattedLongitude).toBe('东经116°23′29″');
    });

    it('should format longitude correctly for west longitude', () => {
      component.native.location.is_east = false;
      component.native.location.longitude_degree = 116;
      component.native.location.longitude_minute = 23;
      component.native.location.longitude_second = 29;
      expect(component.formattedLongitude).toBe('西经116°23′29″');
    });
  });

  describe('formattedLatitude property', () => {
    it('should format latitude correctly for north latitude', () => {
      component.native.location.is_north = true;
      component.native.location.latitude_degree = 39;
      component.native.location.latitude_minute = 54;
      component.native.location.latitude_second = 23;
      expect(component.formattedLatitude).toBe('北纬39°54′23″');
    });

    it('should format latitude correctly for south latitude', () => {
      component.native.location.is_north = false;
      component.native.location.latitude_degree = 39;
      component.native.location.latitude_minute = 54;
      component.native.location.latitude_second = 23;
      expect(component.formattedLatitude).toBe('南纬39°54′23″');
    });
  });

  describe('onTimeZoneChange', () => {
    it('should update time zone offset', () => {
      const event = { detail: { value: 5 } };
      component.onTimeZoneChange(event as CustomEvent);
      expect(component.native.time_zone_offset).toBe(5);
    });
  });

  describe('longitude and latitude change handlers', () => {
    it('should update longitude direction to false', () => {
      const event = { detail: { value: false } };
      component.onLongitudeDirectionChange(event as any);
      expect(component.native.location.is_east).toBeFalse();
    });

    it('should update longitude direction to true', () => {
      component.native.location.is_east = false;
      const event = { detail: { value: true } };
      component.onLongitudeDirectionChange(event as any);
      expect(component.native.location.is_east).toBeTrue();
    });

    it('should update longitude degree', () => {
      const event = { detail: { value: 120 } };
      component.onLongitudeDegreeChange(event as any);
      expect(component.native.location.longitude_degree).toBe(120);
    });

    it('should update longitude minute', () => {
      const event = { detail: { value: 30 } };
      component.onLongitudeMinuteChange(event as any);
      expect(component.native.location.longitude_minute).toBe(30);
    });

    it('should update longitude second', () => {
      const event = { detail: { value: 45 } };
      component.onLongitudeSecondChange(event as any);
      expect(component.native.location.longitude_second).toBe(45);
    });

    it('should update latitude direction to false', () => {
      const event = { detail: { value: false } };
      component.onLatitudeDirectionChange(event as any);
      expect(component.native.location.is_north).toBeFalse();
    });

    it('should update latitude direction to true', () => {
      component.native.location.is_north = false;
      const event = { detail: { value: true } };
      component.onLatitudeDirectionChange(event as any);
      expect(component.native.location.is_north).toBeTrue();
    });

    it('should update latitude degree', () => {
      const event = { detail: { value: 45 } };
      component.onLatitudeDegreeChange(event as any);
      expect(component.native.location.latitude_degree).toBe(45);
    });

    it('should update latitude minute', () => {
      const event = { detail: { value: 30 } };
      component.onLatitudeMinuteChange(event as any);
      expect(component.native.location.latitude_minute).toBe(30);
    });

    it('should update latitude second', () => {
      const event = { detail: { value: 15 } };
      component.onLatitudeSecondChange(event as any);
      expect(component.native.location.latitude_second).toBe(15);
    });
  });

  describe('long and lat properties', () => {
    it('should get correct longitude value', () => {
      component.native.location.is_east = true;
      component.native.location.longitude_degree = 116;
      component.native.location.longitude_minute = 23;
      component.native.location.longitude_second = 29;
      const expectedLong = 116 + 23 / 60 + 29 / 3600;
      expect(component.long).toBeCloseTo(expectedLong, 5);
    });

    it('should get correct latitude value', () => {
      component.native.location.is_north = true;
      component.native.location.latitude_degree = 39;
      component.native.location.latitude_minute = 54;
      component.native.location.latitude_second = 23;
      const expectedLat = 39 + 54 / 60 + 23 / 3600;
      expect(component.lat).toBeCloseTo(expectedLat, 5);
    });

    it('should set longitude correctly', () => {
      component.long = 116.391389;
      expect(component.native.location.is_east).toBeTrue();
      expect(component.native.location.longitude_degree).toBe(116);
      expect(component.native.location.longitude_minute).toBe(23);
      expect(component.native.location.longitude_second).toBe(29);
    });

    it('should set latitude correctly', () => {
      component.lat = 39.906389;
      expect(component.native.location.is_north).toBeTrue();
      expect(component.native.location.latitude_degree).toBe(39);
      expect(component.native.location.latitude_minute).toBe(54);
      expect(component.native.location.latitude_second).toBe(23);
    });

    it('should get correct negative longitude value (west)', () => {
      component.native.location.is_east = false;
      component.native.location.longitude_degree = 116;
      component.native.location.longitude_minute = 23;
      component.native.location.longitude_second = 29;
      const expectedLong = -(116 + 23 / 60 + 29 / 3600);
      expect(component.long).toBeCloseTo(expectedLong, 5);
    });

    it('should get correct negative latitude value (south)', () => {
      component.native.location.is_north = false;
      component.native.location.latitude_degree = 39;
      component.native.location.latitude_minute = 54;
      component.native.location.latitude_second = 23;
      const expectedLat = -(39 + 54 / 60 + 23 / 3600);
      expect(component.lat).toBeCloseTo(expectedLat, 5);
    });

    it('should set negative longitude correctly (west)', () => {
      component.long = -116.391389;
      expect(component.native.location.is_east).toBeFalse();
      expect(component.native.location.longitude_degree).toBe(116);
      expect(component.native.location.longitude_minute).toBe(23);
      expect(component.native.location.longitude_second).toBe(29);
    });

    it('should set negative latitude correctly (south)', () => {
      component.lat = -39.906389;
      expect(component.native.location.is_north).toBeFalse();
      expect(component.native.location.latitude_degree).toBe(39);
      expect(component.native.location.latitude_minute).toBe(54);
      expect(component.native.location.latitude_second).toBe(23);
    });
  });

  describe('validateSecond', () => {
    it('should set second to 0 if less than 0', () => {
      component.native.birth_second = -5;
      component.validateSecond();
      expect(component.native.birth_second).toBe(0);
    });

    it('should set second to 59 if greater than 59', () => {
      component.native.birth_second = 65;
      component.validateSecond();
      expect(component.native.birth_second).toBe(59);
    });

    it('should not change second if within valid range', () => {
      component.native.birth_second = 30;
      component.validateSecond();
      expect(component.native.birth_second).toBe(30);
    });
  });

  describe('Path enum', () => {
    it('should have correct Path enum', () => {
      expect(component.path).toBe(Path);
    });
  });

  describe('timeZoneOptions', () => {
    it('should have 25 options with values -12..12 and matching text', () => {
      expect(component.timeZoneOptions.length).toBe(25);

      // values should be -12..12
      const values = component.timeZoneOptions.map((o) => o.value);
      expect(values).toEqual(Array.from({ length: 25 }, (_, i) => i - 12));

      // each text should correspond to its value
      component.timeZoneOptions.forEach((opt) => {
        const v = opt.value;
        if (v === 0) {
          expect(opt.text).toBe('0时区');
        } else if (v > 0) {
          expect(opt.text).toBe(`东${v}区`);
        } else {
          expect(opt.text).toBe(`西${Math.abs(v)}区`);
        }
      });
    });

    it('should have expected edge and zero entries', () => {
      expect(component.timeZoneOptions[0]).toEqual({
        text: '西12区',
        value: -12,
      });
      expect(component.timeZoneOptions[12]).toEqual({
        text: '0时区',
        value: 0,
      });
      expect(component.timeZoneOptions[24]).toEqual({
        text: '东12区',
        value: 12,
      });
    });
  });

  describe('longitude and latitude options', () => {
    it('should have correct longitude degrees', () => {
      expect(component.longitudeDegrees.length).toBe(180);
      // Verify each value in the array
      for (let i = 0; i < 180; i++) {
        expect(component.longitudeDegrees[i]).toBe(i);
      }
    });

    it('should have correct longitude minutes and seconds', () => {
      expect(component.longitudeMinutes.length).toBe(60);
      expect(component.longitudeSeconds.length).toBe(60);
      // Verify each value in the arrays
      for (let i = 0; i < 60; i++) {
        expect(component.longitudeMinutes[i]).toBe(i);
        expect(component.longitudeSeconds[i]).toBe(i);
      }
    });

    it('should have correct latitude degrees', () => {
      expect(component.latitudeDegrees.length).toBe(90);
      // Verify each value in the array
      for (let i = 0; i < 90; i++) {
        expect(component.latitudeDegrees[i]).toBe(i);
      }
    });

    it('should have correct latitude minutes and seconds', () => {
      expect(component.latitudeMinutes.length).toBe(60);
      expect(component.latitudeSeconds.length).toBe(60);
      // Verify each value in the arrays
      for (let i = 0; i < 60; i++) {
        expect(component.latitudeMinutes[i]).toBe(i);
        expect(component.latitudeSeconds[i]).toBe(i);
      }
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      // Spy on the private methods add and update
      spyOn(component as any, 'add').and.stub();
      spyOn(component as any, 'update').and.stub();
    });

    it('should call add method when native.id is 0', () => {
      // Set component native data with id = 0
      component.native = { ...mockHoroscopeRecord, id: 0 };

      // Call onSubmit
      component.onSubmit();

      // Verify add method was called
      expect((component as any).add).toHaveBeenCalled();
      expect((component as any).update).not.toHaveBeenCalled();
    });

    it('should call update method when native.id is not 0', () => {
      // Set component native data with id != 0
      component.native = { ...mockHoroscopeRecord, id: 1 };

      // Call onSubmit
      component.onSubmit();

      // Verify update method was called
      expect((component as any).add).not.toHaveBeenCalled();
      expect((component as any).update).toHaveBeenCalled();
    });
  });

  describe('add functionality', () => {
    it('should show alert when longitude is out of range', () => {
      // Set up component with invalid longitude
      // 克隆数据，防止污染后续测试
      component.native = structuredClone(mockHoroscopeRecord);
      component.native.location.is_east = true;
      component.native.location.longitude_degree = 181; // Invalid value > 180

      // Trigger add functionality through onSubmit
      (component as any).add();

      // Verify alert is shown
      expect(component.isAlertOpen).toBeTrue();
      expect(component.message).toBe('经度范围为-180~180');
      expect(component.isSaving).toBeFalse();
    });

    it('should show alert when latitude is out of range', () => {
      // Set up component with invalid latitude
      // 克隆数据，防止污染后续测试
      component.native = structuredClone(mockHoroscopeRecord);
      component.native.location.is_north = true;
      component.native.location.latitude_degree = 91; // Invalid value > 90

      // Trigger add functionality through onSubmit
      (component as any).add();

      // Verify alert is shown
      expect(component.isAlertOpen).toBeTrue();
      expect(component.message).toBe('纬度范围为-90~90');
      expect(component.isSaving).toBeFalse();
    });

    it('should show alert when name is empty', () => {
      // Set up component with empty name
      component.native = structuredClone(mockHoroscopeRecord);
      component.native.name = '';

      // Trigger add functionality through onSubmit
      (component as any).add();

      // Verify alert is shown
      expect(component.isAlertOpen).toBeTrue();
      expect(component.message).toBe('姓名长度为1-30个字符');
      expect(component.isSaving).toBeFalse();
    });

    it('should show alert when name is too long', () => {
      // Set up component with a long name
      component.native = structuredClone(mockHoroscopeRecord);
      component.native.name = 'a'.repeat(31);

      // Trigger add functionality through onSubmit
      (component as any).add();

      // Verify alert is shown
      expect(component.isAlertOpen).toBeTrue();
      expect(component.message).toBe('姓名长度为1-30个字符');
      expect(component.isSaving).toBeFalse();
    });

    it('should call api.addNative and handle success response', fakeAsync(() => {
      // Set up component with valid data
      component.native = { ...structuredClone(mockHoroscopeRecord), id: 0 };

      // Mock API response
      const mockResponse = { ...structuredClone(mockHoroscopeRecord), id: 1 };
      apiServiceSpy.addNative.and.returnValue(of(mockResponse).pipe(delay(0)));

      // Trigger add functionality through onSubmit
      (component as any).add();

      // Verify API was called with correct data
      expect(apiServiceSpy.addNative).toHaveBeenCalledWith(component.native);
      expect(component.isSaving).toBeTrue();

      tick();

      // Simulate API success response
      // Verify component state after success
      expect(component.native.id).toBe(1);
      expect(component.oldNative).toEqual(mockResponse);
      expect(component.isAlertOpen).toBeTrue();
      expect(component.message).toBe('新增成功');
      expect(component.isSaving).toBeFalse();
    }));

    it('should call api.addNative and handle error response', () => {
      // Set up component with valid data
      component.native = { ...structuredClone(mockHoroscopeRecord), id: 0 };
      const errorResponse = { error: { error: 'API Error' } };
      // Mock API error response
      apiServiceSpy.addNative.and.returnValue(throwError(() => errorResponse));

      // Trigger add functionality through onSubmit
      (component as any).add();

      // Verify API was called with correct data
      expect(apiServiceSpy.addNative).toHaveBeenCalledWith(component.native);

      // Simulate API error response
      // Verify component state after error
      expect(component.isAlertOpen).toBeTrue();
      expect(component.message).toBe('新增失败');
      expect(component.isSaving).toBeFalse();
    });
  });

  describe('update functionality', () => {
    beforeEach(() => {
      // Set up initial native and oldNative values for testing
      component.native = structuredClone(mockHoroscopeRecord);
      component.oldNative = structuredClone(mockHoroscopeRecord);
    });

    it('should show "no fields to update" message when no data has changed', () => {
      (component as any).update();
      expect(component.message).toBe('没需要更新的字段');
      expect(component.isAlertOpen).toBeTrue();
      expect(component.isSaving).toBeFalse();
    });

    it('should call updateNative when only one field is changed', fakeAsync(() => {
      component.native.name = 'New Name';
      apiServiceSpy.updateNative.and.returnValue(of(undefined).pipe(delay(0)));

      (component as any).update();
      tick();

      expect(apiServiceSpy.updateNative).toHaveBeenCalledWith(
        component.native.id,
        {
          name: 'New Name',
          gender: null,
          birth_year: null,
          birth_month: null,
          birth_day: null,
          birth_hour: null,
          birth_minute: null,
          birth_second: null,
          time_zone_offset: null,
          is_dst: null,
          location: null,
          description: null,
        }
      );
    }));

    it('should handle successful update', fakeAsync(() => {
      component.native.name = 'Updated Name';
      // const updatedRecord = structuredClone(component.native);
      apiServiceSpy.updateNative.and.returnValue(of(undefined).pipe(delay(0)));

      (component as any).update();
      tick();

      expect(component.oldNative).toEqual(component.native);
      expect(component.oldNative).not.toBe(component.native);
      expect(component.message).toBe('更新成功');
      expect(component.isAlertOpen).toBeTrue();
      expect(component.isSaving).toBeFalse();
    }));

    it('should handle update failure', fakeAsync(() => {
      component.native.name = 'Updated Name';
      apiServiceSpy.updateNative.and.returnValue(
        throwError(() => new Error('Update failed'))
      );

      (component as any).update();
      tick();

      expect(component.message).toBe('更新失败');
      expect(component.isAlertOpen).toBeTrue();
      expect(component.isSaving).toBeFalse();
    }));

    it('should show error for invalid longitude', () => {
      component.native.location.longitude_degree = 181;
      (component as any).update();
      expect(component.message).toBe('经度范围为-180~180');
      expect(component.isAlertOpen).toBeTrue();
      expect(component.isSaving).toBeFalse();
    });

    it('should show error for invalid latitude', () => {
      component.native.location.latitude_degree = 91;
      (component as any).update();
      expect(component.message).toBe('纬度范围为-90~90');
      expect(component.isAlertOpen).toBeTrue();
      expect(component.isSaving).toBeFalse();
    });

    it('should show error for invalid name length (too short)', () => {
      component.native.name = '';
      (component as any).update();
      expect(component.message).toBe('姓名长度为1-30个字符');
      expect(component.isAlertOpen).toBeTrue();
      expect(component.isSaving).toBeFalse();
    });

    it('should show error for invalid name length (too long)', () => {
      component.native.name = 'a'.repeat(31);
      (component as any).update();
      expect(component.message).toBe('姓名长度为1-30个字符');
      expect(component.isAlertOpen).toBeTrue();
      expect(component.isSaving).toBeFalse();
    });
  });
});
