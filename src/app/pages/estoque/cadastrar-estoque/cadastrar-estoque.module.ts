import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CadastrarEstoquePageRoutingModule } from './cadastrar-estoque-routing.module';

import { CadastrarEstoquePage } from './cadastrar-estoque.page';
import { DirectivasModule } from 'src/app/directives/directivaes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CadastrarEstoquePageRoutingModule,
    DirectivasModule
  ],
  declarations: [CadastrarEstoquePage]
})
export class CadastrarEstoquePageModule { }
