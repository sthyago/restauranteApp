import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CadastrarEstoquePageRoutingModule } from './cadastrar-estoque-routing.module';

import { CadastrarEstoquePage } from './cadastrar-estoque.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CadastrarEstoquePageRoutingModule
  ],
  declarations: [CadastrarEstoquePage]
})
export class CadastrarEstoquePageModule {}
