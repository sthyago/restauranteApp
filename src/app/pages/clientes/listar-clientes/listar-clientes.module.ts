import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListarClientesPageRoutingModule } from './listar-clientes-routing.module';

import { ListarClientesPage } from './listar-clientes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListarClientesPageRoutingModule
  ],
  declarations: [ListarClientesPage]
})
export class ListarClientesPageModule {}
