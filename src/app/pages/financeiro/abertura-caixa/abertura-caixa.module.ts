import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AberturaCaixaPageRoutingModule } from './abertura-caixa-routing.module';

import { AberturaCaixaPage } from './abertura-caixa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AberturaCaixaPageRoutingModule
  ],
  declarations: [AberturaCaixaPage]
})
export class AberturaCaixaPageModule {}
