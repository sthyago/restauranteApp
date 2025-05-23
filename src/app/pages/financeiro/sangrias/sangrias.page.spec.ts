import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SanguiasPage } from './sangrias.page';

describe('SanguiasPage', () => {
  let component: SanguiasPage;
  let fixture: ComponentFixture<SanguiasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SanguiasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
