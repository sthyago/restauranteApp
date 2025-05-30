import { Directive, HostListener, ElementRef, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appTelefoneMask]',
    standalone: false
})
export class TelefoneMaskDirective {

    constructor(
        private el: ElementRef,
        private renderer: Renderer2
    ) { }

    @HostListener('input', ['$event.target.value'])
    onInput(value: string) {
        // Remove não-dígitos mas mantém o cursor
        const cursorPos = this.el.nativeElement.selectionStart;
        const valorLimpo = value.replace(/\D/g, '');

        // Aplica máscara parcial
        let valorFormatado = '';
        if (valorLimpo.length > 0) {
            valorFormatado = `(${valorLimpo.substring(0, 2)}`;
        }
        if (valorLimpo.length > 2) {
            valorFormatado += `) ${valorLimpo.substring(2, 7)}`;
        }
        if (valorLimpo.length > 7) {
            valorFormatado += `-${valorLimpo.substring(7, 11)}`;
        }

        this.renderer.setProperty(this.el.nativeElement, 'value', valorFormatado);

        // Restaura a posição do cursor
        setTimeout(() => {
            this.el.nativeElement.setSelectionRange(cursorPos, cursorPos);
        }, 0);
    }

    @HostListener('ionBlur', ['$event.target.value']) // Para componentes Ionic
    @HostListener('blur', ['$event.target.value'])    // Para elementos HTML padrão
    onBlur(value: string) {
        if (!value) return;

        // Formata o telefone
        const telefoneFormatado = this.formatarTelefone(value);
        this.renderer.setProperty(this.el.nativeElement, 'value', telefoneFormatado);
    }

    private formatarTelefone(valor: string): string {
        // Remove tudo que não é dígito
        const valorLimpo = valor.replace(/\D/g, '');

        // Aplica a máscara de acordo com o tamanho
        if (valorLimpo.length === 10) {
            return `(${valorLimpo.substring(0, 2)}) ${valorLimpo.substring(2, 6)}-${valorLimpo.substring(6, 10)}`;
        } else if (valorLimpo.length === 11) {
            return `(${valorLimpo.substring(0, 2)}) ${valorLimpo.substring(2, 7)}-${valorLimpo.substring(7, 11)}`;
        } else {
            // Não formata se não tiver 10 ou 11 dígitos
            return valorLimpo;
        }
    }
}