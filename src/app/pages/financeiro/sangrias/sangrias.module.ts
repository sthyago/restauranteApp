import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SangriasPageRoutingModule } from './sangrias-routing.module';

import { SangriasPage } from './sangrias.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SangriasPageRoutingModule
  ],
  declarations: [SangriasPage]
})
export class SangriasPageModule { }
