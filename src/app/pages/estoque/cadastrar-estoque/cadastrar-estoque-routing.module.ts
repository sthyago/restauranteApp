import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CadastrarEstoquePage } from './cadastrar-estoque.page';

const routes: Routes = [
  {
    path: '',
    component: CadastrarEstoquePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CadastrarEstoquePageRoutingModule {}
