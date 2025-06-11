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
  haCaixaAberto?: boolean;

  constructor(
    private sqliteService: SqliteService,
    private alertController: AlertController,
    private router: Router) { }

  async ionViewWillEnter() {
    this.getDataHora();
    await this.verificarOuAbrirCaixa();
  }

  private async verificarCaixaAberto(): Promise<boolean> {
    try {
      const res = await this.sqliteService.db?.query(
        `SELECT * FROM caixa 
        WHERE data_abertura = ?`,
        [this.dataHoje]
      );
      alert(res?.values?.toString());
      return (res?.values?.length ?? 0) > 0;
    } catch (error) {
      console.error('Erro ao verificar caixa:', error);
      return false;
    }
  }

  async verificarOuAbrirCaixa() {
    // Verifica primeiro se já existe caixa aberto
    const caixaAberto = await this.verificarCaixaAberto();

    if (!caixaAberto) {
      const alert = await this.alertController.create({
        header: 'Nenhum caixa aberto!',
        message: 'Deseja ir para a tela de abertura?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Sim',
            handler: () => {
              this.router.navigateByUrl('/tabs/abertura-caixa');
            }
          }
        ]
      });
      await alert.present();
    }
  }

  getDataHora() {
    this.dataHoje = new Date().toISOString().split('T')[0];
  }
}
