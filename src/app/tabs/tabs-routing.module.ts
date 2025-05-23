import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'listar-clientes',
        loadChildren: () => import('../pages/clientes/listar-clientes/listar-clientes.module').then(m => m.ListarClientesPageModule)
      },
      {
        path: 'finalizar-pedido',
        loadChildren: () => import('../pages/pedidos/finalizar-pedido/finalizar-pedido.module').then(m => m.FinalizarPedidoPageModule)
      },
      {
        path: 'novo-pedido',
        loadChildren: () => import('../pages/pedidos/novo-pedido/novo-pedido.module').then(m => m.NovoPedidoPageModule)
      },
      {
        path: 'pedidos',
        loadChildren: () => import('../pages/pedidos/pedidos.module').then(m => m.PedidosPageModule)
      },
      {
        path: 'home',
        loadChildren: () => import('../pages/home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'estoque',
        loadChildren: () => import('../pages/estoque/estoque.module').then(m => m.EstoquePageModule)
      },
      {
        path: 'financeiro',
        loadChildren: () => import('../pages/financeiro/financeiro.module').then(m => m.FinanceiroPageModule)
      },
      {
        path: 'abertura-caixa',
        loadChildren: () => import('../pages/financeiro/abertura-caixa/abertura-caixa.module').then(m => m.AberturaCaixaPageModule)
      },
      {
        path: 'fechamento',
        loadChildren: () => import('../pages/financeiro/fechamento/fechamento.module').then(m => m.FechamentoPageModule)
      },
      {
        path: 'sangrias',
        loadChildren: () => import('../pages/financeiro/sangrias/sangrias.module').then(m => m.SangriasPageModule)
      },
      {
        path: 'contas',
        loadChildren: () => import('../pages/financeiro/contas/contas.module').then(m => m.ContasPageModule)
      },
      {
        path: 'relatorio',
        loadChildren: () => import('../pages/financeiro/relatorios/relatorios.module').then(m => m.RelatoriosPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      },

    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }