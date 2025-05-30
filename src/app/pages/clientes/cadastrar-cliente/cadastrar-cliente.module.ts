import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CadastrarClientePageRoutingModule } from './cadastrar-cliente-routing.module';
import { CadastrarClientePage } from './cadastrar-cliente.page';
import { DirectivasModule } from 'src/app/directives/directivaes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CadastrarClientePageRoutingModule,
    DirectivasModule
  ],
  declarations: [CadastrarClientePage]
})
export class CadastrarClientePageModule { }
