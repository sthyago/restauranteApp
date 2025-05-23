import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FechamentoPage } from './fechamento.page';

const routes: Routes = [
  {
    path: '',
    component: FechamentoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FechamentoPageRoutingModule {}
