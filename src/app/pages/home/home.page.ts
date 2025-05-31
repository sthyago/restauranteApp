import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SqliteService } from 'src/app/services/sqlite.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})

export class HomePage {

  mesas: any[] = [];

  constructor(
    private sqliteService: SqliteService,
    private alertController: AlertController,
    private toastCtrl: ToastController,
    private router: Router) { }

  async ionViewWillEnter() {
    await this.verificarOuAbrirCaixa();
  }

  async verificarOuAbrirCaixa() {
    const hoje = new Date().toISOString().slice(0, 10);
    const res = await this.sqliteService.db?.query(
      `SELECT id FROM caixa WHERE DATE(data_abertura) = ? LIMIT 1`,
      [hoje]
    );

    if (!res?.values?.length) {
      // Elemento temporário para formatação
      const tempInput = document.createElement('input');

      const alert = await this.alertController.create({
        header: 'Abertura de Caixa',
        cssClass: 'custom-alert',
        inputs: [
          {
            name: 'valor',
            type: 'text',
            placeholder: 'R$ 0,00',
            id: 'valorAberturaInput',
            cssClass: 'alert-input',
            attributes: {
              inputmode: 'decimal',
              autofocus: true
            }
          },
          {
            name: 'observacoes',
            type: 'text',
            placeholder: 'Observações (opcional)',
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Abrir Caixa',
            handler: async (data) => {
              // Converte o valor formatado para número
              const valorNumerico = this.converterMoedaParaNumero(data.valor);

              // Validação melhorada
              if (valorNumerico <= 0) {
                const toast = await this.toastCtrl.create({
                  message: 'Informe um valor válido maior que zero.',
                  duration: 2000,
                  color: 'danger'
                });
                await toast.present();
                return false;
              }

              // Formata o valor com 2 casas decimais para o banco de dados
              const valorAbertura = parseFloat(valorNumerico.toFixed(2));

              await this.sqliteService.db?.run(
                `INSERT INTO caixa (data_abertura, valor_abertura, observacoes) VALUES (?, ?, ?)`,
                [new Date().toISOString(), valorAbertura, data.observacoes || null]
              );

              const toast = await this.toastCtrl.create({
                message: 'Caixa aberto com sucesso!',
                duration: 2000,
                color: 'success'
              });
              await toast.present();
              return true;
            }
          }
        ]
      });

      await alert.present();

      // Adiciona máscara monetária ao input
      const inputEl = document.getElementById('valorAberturaInput') as HTMLInputElement;
      if (inputEl) {
        inputEl.addEventListener('input', (event) => {
          this.aplicarMascaraMonetariaInput(event.target as HTMLInputElement);
        });
      }
    }
  }

  private aplicarMascaraMonetariaInput(input: HTMLInputElement) {
    // Mantém apenas números e vírgulas
    let valor = input.value.replace(/[^0-9,]/g, '');

    // Remove múltiplas vírgulas
    const partes = valor.split(',');
    if (partes.length > 2) {
      valor = partes[0] + ',' + partes.slice(1).join('');
    }

    // Atualiza o valor mantendo a vírgula
    input.value = 'R$ ' + valor;
  }

  private converterMoedaParaNumero(valorFormatado: string): number {
    // Se for número, retorna diretamente
    if (typeof valorFormatado === 'number') return valorFormatado;

    // Se for string vazia, retorna 0
    if (!valorFormatado) return 0;

    // Mantém apenas números, pontos e vírgulas
    const valorLimpo = valorFormatado
      .replace('R$', '')
      .replace(/[^0-9,.]/g, '')
      .trim();

    // Substitui vírgulas por pontos para conversão decimal
    const valorNumerico = valorLimpo.replace(',', '.');

    // Converte para float
    return parseFloat(valorNumerico) || 0;
  }
}
