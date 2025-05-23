import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SangriasPage } from './sangrias.page';

const routes: Routes = [
  {
    path: '',
    component: SangriasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SangriasPageRoutingModule { }
