import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastrarEstoquePage } from './cadastrar-estoque.page';

describe('CadastrarEstoquePage', () => {
  let component: CadastrarEstoquePage;
  let fixture: ComponentFixture<CadastrarEstoquePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastrarEstoquePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
