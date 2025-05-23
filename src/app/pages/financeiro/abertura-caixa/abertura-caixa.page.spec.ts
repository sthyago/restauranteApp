import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AberturaCaixaPage } from './abertura-caixa.page';

describe('AberturaCaixaPage', () => {
  let component: AberturaCaixaPage;
  let fixture: ComponentFixture<AberturaCaixaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AberturaCaixaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
