// src/app/directivas/moeda-mask.directive.ts
import { Directive, ElementRef, HostListener, Input, OnChanges, OnInit, Renderer2, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
    selector: '[appMoedaMask]',
    standalone: false,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MoedaMaskDirective),
            multi: true
        }
    ]
})
export class MoedaMaskDirective implements OnInit, OnChanges, ControlValueAccessor {
    @Input('appMoedaMask') tipo: 'input' | 'display' | '' = '';
    @Input() valor: number | string | null = null;

    private onChange: any = () => { };
    private onTouched: any = () => { };
    private isUpdating = false;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2
    ) { }

    ngOnInit() {
        // Define o inputmode para teclado numérico
        this.renderer.setAttribute(this.el.nativeElement, 'inputmode', 'decimal');

        // Formata exibições na inicialização
        if (this.tipo === 'display') {
            this.formatarExibicao();
        } else {
            // Para inputs, inicia com formato base
            this.renderer.setProperty(this.el.nativeElement, 'value', 'R$ 0,00');
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        // Atualiza exibições quando o valor muda
        if (this.tipo === 'display' && (changes['valor'] || changes['tipo'])) {
            this.formatarExibicao();
        }
    }

    // Implementação do ControlValueAccessor
    writeValue(value: any): void {
        if (value !== null && value !== undefined) {
            const valorFormatado = this.formatarMoeda(this.converterParaNumero(value));
            this.renderer.setProperty(this.el.nativeElement, 'value', valorFormatado);
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    @HostListener('input', ['$event'])
    onInput(event: any) {
        if (this.isUpdating) return;

        const value = event.target.value;
        const cursorPosition = event.target.selectionStart;

        // Remove tudo exceto números
        const apenasNumeros = value.replace(/[^\d]/g, '');

        // Converte para centavos
        const centavos = parseInt(apenasNumeros) || 0;
        const reais = centavos / 100;

        // Formata como moeda
        const valorFormatado = this.formatarMoeda(reais);

        // Atualiza o campo sem criar loop
        this.isUpdating = true;
        this.renderer.setProperty(this.el.nativeElement, 'value', valorFormatado);
        this.isUpdating = false;

        // Posiciona cursor no final
        const novoTamanho = valorFormatado.length;
        this.el.nativeElement.setSelectionRange(novoTamanho, novoTamanho);

        // Notifica o ngModel
        this.onChange(reais);
    }

    @HostListener('focus', ['$event'])
    onFocus(event: any) {
        this.onTouched();

        // Se o campo estiver vazio ou com valor zero, limpa para facilitar digitação
        const value = event.target.value;
        if (value === 'R$ 0,00' || !value) {
            this.renderer.setProperty(this.el.nativeElement, 'value', 'R$ ');
            // Posiciona cursor após o R$
            setTimeout(() => {
                this.el.nativeElement.setSelectionRange(3, 3);
            }, 0);
        }
    }

    @HostListener('blur', ['$event'])
    onBlur(event: any) {
        const value = event.target.value;

        // Se o campo estiver vazio ou só com "R$ ", define como zero
        if (!value || value === 'R$ ' || value === 'R$') {
            const valorZero = this.formatarMoeda(0);
            this.renderer.setProperty(this.el.nativeElement, 'value', valorZero);
            this.onChange(0);
        }
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        // Permite apenas números, backspace, delete, tab, escape, enter, e ponto decimal
        const allowedKeys = [
            'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
        ];

        if (allowedKeys.includes(event.key)) {
            return;
        }

        // Permite números
        if (event.key >= '0' && event.key <= '9') {
            return;
        }

        // Bloqueia outras teclas
        event.preventDefault();
    }

    private formatarExibicao() {
        let valorNumerico = 0;

        // Obtém o valor a ser formatado
        if (this.valor !== null && this.valor !== undefined) {
            valorNumerico = this.converterParaNumero(this.valor);
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

    private converterParaNumero(valor: any): number {
        // Se já for número, retorna diretamente
        if (typeof valor === 'number') {
            return valor;
        }

        // Se for string, converte
        if (typeof valor === 'string') {
            // Remove formatação existente se houver
            const valorLimpo = valor
                .replace('R$', '')
                .replace(/\./g, '')
                .replace(',', '.')
                .trim();

            return parseFloat(valorLimpo) || 0;
        }
        // Para outros tipos, converte para número
        return Number(valor) || 0;
    }

    private formatarMoeda(valor: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valor);
    }
}