import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoedaMaskDirective } from './moeda-mask.directive';
import { TelefoneMaskDirective } from './telefone-mask.directive';

@NgModule({
    declarations: [
        MoedaMaskDirective,
        TelefoneMaskDirective
    ],
    imports: [
        CommonModule
    ],
    exports: [
        MoedaMaskDirective,
        TelefoneMaskDirective
    ]
})
export class DirectivasModule { }