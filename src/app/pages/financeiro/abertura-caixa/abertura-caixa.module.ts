import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AberturaCaixaPageRoutingModule } from './abertura-caixa-routing.module';
import { AberturaCaixaPage } from './abertura-caixa.page';
import { DirectivasModule } from 'src/app/directives/directivaes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AberturaCaixaPageRoutingModule,
    DirectivasModule
  ],
  declarations: [AberturaCaixaPage]
})
export class AberturaCaixaPageModule { }
