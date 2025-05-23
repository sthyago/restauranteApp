import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EstoquePage } from './estoque.page';

const routes: Routes = [
    {
        path: '',
        component: EstoquePage
    },  {
    path: 'cadastrar-estoque',
    loadChildren: () => import('./cadastrar-estoque/cadastrar-estoque.module').then( m => m.CadastrarEstoquePageModule)
  }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EstoquePageRoutingModule { }
