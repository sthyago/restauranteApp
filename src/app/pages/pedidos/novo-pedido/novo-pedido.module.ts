import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NovoPedidoPageRoutingModule } from './novo-pedido-routing.module';

import { NovoPedidoPage } from './novo-pedido.page';
import { DirectivasModule } from 'src/app/directives/directivaes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NovoPedidoPageRoutingModule,
    DirectivasModule
  ],
  declarations: [NovoPedidoPage]
})
export class NovoPedidoPageModule { }
