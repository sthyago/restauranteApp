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
    this.carregarMesas();
    await this.verificarOuAbrirCaixa();
  }

  async carregarMesas() {
    const result = await this.sqliteService.carregarMesasQuery();
    this.mesas = result || [];
  }

  async aoClicarNaMesa(mesa: any) {
    if (!mesa.confirmado) {
      const alert = await this.alertController.create({
        header: `Mesa ${mesa.mesa_id}`,
        message: 'Deseja adicionar bebidas ou outros itens ao pedido?',
        buttons: [
          {
            text: 'Sim, adicionar',
            handler: () => {
              this.router.navigate(['/novo-pedido'], {
                state: { pedidoId: mesa.id }
              });
            }
          },
          {
            text: 'Não, está tudo certo',
            handler: () => {
              mesa.confirmado = true;
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.router.navigate(['/finalizar-pedido'], {
        state: { pedidoId: mesa.id }
      });
    }
  }

  async verificarOuAbrirCaixa() {
    const hoje = new Date().toISOString().slice(0, 10);

    const res = await this.sqliteService.db?.query(
      `SELECT id FROM caixa WHERE DATE(data_abertura) = ? LIMIT 1`,
      [hoje]
    );

    if (!res?.values?.length) {
      const alert = await this.alertController.create({
        header: 'Abertura de Caixa',
        inputs: [
          {
            name: 'valor',
            type: 'number',
            placeholder: 'Valor inicial em caixa',
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
              const valor = parseFloat(data.valor);
              if (isNaN(valor) || valor < 0) {
                const toast = await this.toastCtrl.create({
                  message: 'Informe um valor válido.',
                  duration: 2000,
                  color: 'danger'
                });
                await toast.present();
                return false;
              }

              await this.sqliteService.db?.run(
                `INSERT INTO caixa (data_abertura, valor_abertura, observacoes) VALUES (?, ?, ?)`,
                [new Date().toISOString(), valor, data.observacoes || null]
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
    }
  }

}
