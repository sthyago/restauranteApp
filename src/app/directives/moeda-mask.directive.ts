// src/app/directivas/moeda-mask.directive.ts
import { Directive, ElementRef, HostListener, Input, Renderer2, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
    selector: '[appMoedaMask]',
    standalone: false
})
export class MoedaMaskDirective {
    @Input('appMoedaMask') tipo: 'input' | 'display' | '' = '';

    private onChange: any = () => { };
    private onTouched: any = () => { };
    private valor: number | null = null;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2
    ) { }

    @HostListener('input', ['$event.target.value'])
    onInput(value: string) {
        const valorLimpo = value.replace(/[^\d,]/g, '');
        this.renderer.setProperty(this.el.nativeElement, 'value', valorLimpo);
    }

    @HostListener('ionFocus', ['$event.target.value'])
    @HostListener('focus', ['$event.target.value'])
    onFocus(value: string) {
        // Remove formatação ao focar
        const valorNumerico = this.converterParaNumero(value);
        this.renderer.setProperty(this.el.nativeElement, 'value', valorNumerico.toString());
    }

    @HostListener('ionBlur', ['$event.target.value']) // Usa ionBlur para Ionic
    @HostListener('blur', ['$event.target.value']) // Fallback para elementos padrão
    onBlur(value: string) {
        if (!value) return;

        // Formata o valor
        const numero = this.converterParaNumero(value);
        const valorFormatado = this.formatarMoeda(numero);

        this.renderer.setProperty(this.el.nativeElement, 'value', valorFormatado);
    }

    private converterParaNumero(valor: string): number {
        // Remove tudo que não é dígito
        const valorLimpo = valor.replace(/[^\d]/g, '');

        // Converte para número com 2 casas decimais
        return parseFloat(valorLimpo) / 100;
    }

    private formatarMoeda(valor: number): string {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}