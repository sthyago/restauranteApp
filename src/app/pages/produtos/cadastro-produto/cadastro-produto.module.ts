import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CadastroProdutoPageRoutingModule } from './cadastro-produto-routing.module';

import { CadastroProdutoPage } from './cadastro-produto.page';
import { DirectivasModule } from 'src/app/directives/directivaes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CadastroProdutoPageRoutingModule,
    DirectivasModule
  ],
  declarations: [CadastroProdutoPage]
})
export class CadastroProdutoPageModule { }
