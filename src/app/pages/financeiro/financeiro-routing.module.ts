import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FinanceiroPage } from './financeiro.page';

const routes: Routes = [
  {
    path: '',
    component: FinanceiroPage
  },
  {
    path: 'abertura-caixa',
    loadChildren: () => import('./abertura-caixa/abertura-caixa.module').then(m => m.AberturaCaixaPageModule)
  },
  {
    path: 'fechamento',
    loadChildren: () => import('./fechamento/fechamento.module').then(m => m.FechamentoPageModule)
  },
  {
    path: 'sanguias',
    loadChildren: () => import('./sangrias/sangrias.module').then(m => m.SangriasPageModule)
  },
  {
    path: 'contas',
    loadChildren: () => import('./contas/contas.module').then(m => m.ContasPageModule)
  },
  {
    path: 'relatorios',
    loadChildren: () => import('./relatorios/relatorios.module').then( m => m.RelatoriosPageModule)
  },
  {
    path: 'backup',
    loadChildren: () => import('./backup/backup.module').then( m => m.BackupPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceiroPageRoutingModule { }
