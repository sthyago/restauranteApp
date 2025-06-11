import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RelatoriosPageRoutingModule } from './relatorios-routing.module';

import { RelatoriosPage } from './relatorios.page';
import { DirectivasModule } from 'src/app/directives/directivaes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RelatoriosPageRoutingModule,
    DirectivasModule
  ],
  declarations: [RelatoriosPage]
})
export class RelatoriosPageModule { }
