import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FechamentoPageRoutingModule } from './fechamento-routing.module';

import { FechamentoPage } from './fechamento.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FechamentoPageRoutingModule
  ],
  declarations: [FechamentoPage]
})
export class FechamentoPageModule {}
