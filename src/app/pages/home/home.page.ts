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

      const alert = await this.alertController.create({
        header: 'Nenhum caixa aberto!',
        message: 'Deseja ir para a tela de abertura?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Sim',
            handler: async () => {
              this.router.navigateByUrl('/tabs/abertura-caixa')
            }
          }
        ]
      });

      await alert.present();
    }
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
