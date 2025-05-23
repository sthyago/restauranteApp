import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FechamentoPage } from './fechamento.page';

describe('FechamentoPage', () => {
  let component: FechamentoPage;
  let fixture: ComponentFixture<FechamentoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FechamentoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
