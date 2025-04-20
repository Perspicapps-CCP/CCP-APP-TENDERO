import { TestBed } from '@angular/core/testing';

import { SpinnerService } from './spinner.service';

describe('SpinnerService', () => {
  let service: SpinnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpinnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call spinner show', () => {
    const spinnerService = TestBed.inject(SpinnerService);
    const spinnerSpy = spyOn(spinnerService, 'show').and.callThrough();
    spinnerService.show();
    expect(spinnerSpy).toHaveBeenCalled();
  });
  it('should call spinner hide', () => {
    const spinnerService = TestBed.inject(SpinnerService);
    const spinnerSpy = spyOn(spinnerService, 'hide').and.callThrough();
    spinnerService.hide();
    expect(spinnerSpy).toHaveBeenCalled();
  });
});
