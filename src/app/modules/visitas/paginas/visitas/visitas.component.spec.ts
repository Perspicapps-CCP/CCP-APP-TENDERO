import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VisitasComponent } from './visitas.component';

describe('VisitasComponent', () => {
  let component: VisitasComponent;
  let fixture: ComponentFixture<VisitasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), VisitasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
