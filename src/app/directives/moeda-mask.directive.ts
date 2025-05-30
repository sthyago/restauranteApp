// src/app/directivas/moeda-mask.directive.ts
import { Directive, ElementRef, HostListener, Input, OnChanges, OnInit, Renderer2, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
    selector: '[appMoedaMask]',
    standalone: false
})
export class MoedaMaskDirective implements OnInit, OnChanges {
    @Input('appMoedaMask') tipo: 'input' | 'display' | '' = '';
    @Input() valor: number | string | null = null;

    private onChange: any = () => { };
    private onTouched: any = () => { };

    constructor(
        private el: ElementRef,
        private renderer: Renderer2
    ) { }

    ngOnInit() {
        // Formata exibições na inicialização
        if (this.tipo === 'display') {
            this.formatarExibicao();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        // Atualiza exibições quando o valor muda
        if (this.tipo === 'display' && (changes['valor'] || changes['tipo'])) {
            this.formatarExibicao();
        }
    }

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

    private formatarExibicao() {
        let valorNumerico: number;

        // Obtém o valor a ser formatado
        if (this.valor !== null && this.valor !== undefined) {
            valorNumerico = this.converterParaNumero(this.valor.toString());
        } else {
            const conteudo = this.el.nativeElement.textContent || '0';
            valorNumerico = this.converterParaNumero(conteudo);
        }

        // Formata como moeda brasileira
        const valorFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valorNumerico);

        // Atualiza o conteúdo do elemento
        this.renderer.setProperty(this.el.nativeElement, 'textContent', valorFormatado);
    }

    private converterParaNumero(valor: string): number {
        // Se o valor estiver vazio ou só conter caracteres não numéricos
        if (!valor || /^\D*$/.test(valor)) return 0;

        // Tenta converter de várias formas
        let valorNumerico: number;

        // Se já estiver formatado (contém R$)
        if (valor.includes('R$')) {
            valorNumerico = parseFloat(
                valor.replace('R$', '')
                    .replace(/\./g, '')
                    .replace(',', '.')
                    .trim()
            );
        }
        // Se contém vírgula (formato brasileiro)
        else if (valor.includes(',')) {
            valorNumerico = parseFloat(
                valor.replace(/\./g, '')
                    .replace(',', '.')
            );
        }
        // Valor simples (apenas números)
        else {
            valorNumerico = parseFloat(valor) / 100;
        }

        return isNaN(valorNumerico) ? 0 : valorNumerico;
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