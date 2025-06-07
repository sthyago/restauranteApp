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
  dataHoje: string = '';

  constructor(
    private sqliteService: SqliteService,
    private alertController: AlertController,
    private router: Router) { }

  async ionViewWillEnter() {
    await this.verificarOuAbrirCaixa();
  }

  async verificarOuAbrirCaixa() {
    const res = await this.sqliteService.db?.query(
      `SELECT id FROM caixa WHERE DATE(data_abertura) = ? LIMIT 1`,
      [this.dataHoje]
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


  getDataHora() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    const dia = hoje.getDate().toString().padStart(2, '0');

    // Formatar apenas como data (sem hora) para armazenamento
    this.dataHoje = `${ano}-${mes}-${dia}`;
  }
}
