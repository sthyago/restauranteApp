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

    private onChange = (value: any) => { };
    private onTouched = () => { };
    private valorAtual: number | null = null;

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
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        // Atualiza exibições quando o valor muda
        if (this.tipo === 'display' && (changes['valor'] || changes['tipo'])) {
            this.formatarExibicao();
        }
    }

    // ControlValueAccessor
    writeValue(value: any): void {
        this.valorAtual = value;
        if (value !== null && value !== undefined && value !== '') {
            const numero = typeof value === 'number' ? value : this.converterParaNumero(value);
            const valorFormatado = this.formatarMoeda(numero);
            this.renderer.setProperty(this.el.nativeElement, 'value', valorFormatado);
        } else {
            this.renderer.setProperty(this.el.nativeElement, 'value', '');
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
        } else {
            this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
        }
    }

    @HostListener('input', ['$event'])
    onInput(event: any): void {
        const inputValue = event.target.value;

        // Remove tudo exceto números
        const numerosApenas = inputValue.replace(/[^\d]/g, '');

        if (numerosApenas === '' || numerosApenas === '0') {
            this.valorAtual = null;
            this.onChange(null);
            this.renderer.setProperty(this.el.nativeElement, 'value', '');
            return;
        }

        // Converte centavos para reais
        const centavos = parseInt(numerosApenas, 10);
        const reais = centavos / 100;

        // Formata e atualiza
        const valorFormatado = this.formatarMoeda(reais);
        this.renderer.setProperty(this.el.nativeElement, 'value', valorFormatado);

        // Posiciona cursor no final
        setTimeout(() => {
            const tamanho = valorFormatado.length;
            this.el.nativeElement.setSelectionRange(tamanho, tamanho);
        });

        // Atualiza o modelo
        this.valorAtual = reais;
        this.onChange(reais);
    }

    @HostListener('focus', ['$event'])
    onFocus(event: any): void {
        this.onTouched();

        const value = event.target.value;
        if (!value || value === 'R$ 0,00') {
            this.renderer.setProperty(this.el.nativeElement, 'value', 'R$ ');
            setTimeout(() => {
                this.el.nativeElement.setSelectionRange(3, 3);
            });
        }
    }

    @HostListener('blur', ['$event'])
    onBlur(event: any): void {
        const value = event.target.value;

        if (!value || value === 'R$ ' || value === 'R$') {
            this.renderer.setProperty(this.el.nativeElement, 'value', '');
            this.valorAtual = null;
            this.onChange(null);
        } else if (this.valorAtual !== null) {
            // Reaplica a formatação
            const valorFormatado = this.formatarMoeda(this.valorAtual);
            this.renderer.setProperty(this.el.nativeElement, 'value', valorFormatado);
        }
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        // Teclas permitidas
        const teclasPermitidas = [
            'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End'
        ];

        // Permite teclas de controle
        if (teclasPermitidas.includes(event.key)) {
            return;
        }

        // Permite números
        if (event.key >= '0' && event.key <= '9') {
            return;
        }

        // Permite Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
        if (event.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) {
            return;
        }

        // Bloqueia todo o resto
        event.preventDefault();
    }

    private formatarExibicao(): void {
        let valorNumerico = 0;

        if (this.valor !== null && this.valor !== undefined) {
            valorNumerico = this.converterParaNumero(this.valor);
        } else {
            const conteudo = this.el.nativeElement.textContent || '0';
            valorNumerico = this.converterParaNumero(conteudo);
        }

        const valorFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valorNumerico);

        this.renderer.setProperty(this.el.nativeElement, 'textContent', valorFormatado);
    }

    private converterParaNumero(valor: any): number {
        if (typeof valor === 'number') {
            return valor;
        }

        if (typeof valor === 'string') {
            const valorLimpo = valor
                .replace('R$', '')
                .replace(/\./g, '')
                .replace(',', '.')
                .trim();

            return parseFloat(valorLimpo) || 0;
        }

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