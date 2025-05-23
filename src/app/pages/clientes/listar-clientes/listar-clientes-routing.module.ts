import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListarClientesPage } from './listar-clientes.page';

const routes: Routes = [
  {
    path: '',
    component: ListarClientesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListarClientesPageRoutingModule {}
