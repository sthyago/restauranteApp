import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarClientesPage } from './listar-clientes.page';

describe('ListarClientesPage', () => {
  let component: ListarClientesPage;
  let fixture: ComponentFixture<ListarClientesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarClientesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
