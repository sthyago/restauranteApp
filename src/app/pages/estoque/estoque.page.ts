import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Estoque } from 'src/app/models/estoque';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.page.html',
  styleUrls: ['./estoque.page.scss'],
  standalone: false,
})

export class EstoquePage {
  insumos: Estoque[] = [];
  produtosReposicao: any[] = [];

  constructor(private sqlite: SqliteService, private alertController: AlertController) { }

  ionViewWillEnter() {
    this.carregarInsumos();
  }

  async carregarInsumos() {
    try {
      this.insumos = await this.sqlite.carregarEstoqueQuery();
      this.produtosReposicao = this.insumos.filter(insumo =>
        insumo.quantidade_total <= insumo.alerta_minimo
      );
    } catch (error) {
      console.error('Erro ao carregar estoque', error);
    }
  }

  async remover(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Deseja realmente excluir este item?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          handler: async () => {
            if (this.sqlite.db) {
              await this.sqlite.db.run(`DELETE FROM estoque WHERE id = ?`, [id]);
              this.carregarInsumos();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
