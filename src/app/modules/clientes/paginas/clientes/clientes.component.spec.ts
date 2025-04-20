import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClientesComponent } from './clientes.component';

describe('ClientesComponent', () => {
  let component: ClientesComponent;
  let fixture: ComponentFixture<ClientesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ClientesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
