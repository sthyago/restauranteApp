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


  mostrarAlerta = false;

  constructor(private sqlite: SqliteService, private alertController: AlertController) { }

  ionViewWillEnter() {
    this.carregarInsumos();
  }

  async carregarInsumos() {
    this.insumos = await this.sqlite.carregarEstoqueQuery();

    // Filtrar produtos que precisam de reposição
    this.produtosReposicao = this.insumos.filter(insumo =>
      insumo.quantidade <= insumo.alerta_minimo
    );

    // Mostrar alerta se houver produtos para repor
    if (this.produtosReposicao.length > 0 && !localStorage.getItem('alertaReposicaoFechado')) {
      this.mostrarAlerta = true;
    }
  }

  fecharAlerta() {
    this.mostrarAlerta = false;
    localStorage.setItem('alertaReposicaoFechado', 'true');
  }

  async remover(id: number) {
    if (!confirm('Deseja realmente excluir este item?')) return;

    if (this.sqlite.db) {
      await this.sqlite.db.run(`DELETE FROM estoque WHERE id = ?`, [id]);
      this.carregarInsumos();
    }
  }

}
