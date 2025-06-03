import { Component, OnInit } from '@angular/core';
import { Produto } from 'src/app/models/produto';
import { SqliteService } from 'src/app/services/sqlite.service';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cadastrar-estoque',
  templateUrl: './cadastrar-estoque.page.html',
  styleUrls: ['./cadastrar-estoque.page.scss'],
  standalone: false
})
export class CadastrarEstoquePage {

  novoInsumo = { produto_id: 0, quantidade: 0, valor_pago: 0 };
  produtos: Produto[] = [];

  constructor(
    private sqlite: SqliteService,
    private route: ActivatedRoute,
    private alertController: AlertController) { }

  ionViewWillEnter() {
    this.carregarProdutos();
    const produtoId = this.route.snapshot.paramMap.get('id');

    if (produtoId) {
      this.novoInsumo.produto_id = parseInt(produtoId, 10);
    }
  }

  async salvar() {

    if (!this.novoInsumo.produto_id || this.novoInsumo.quantidade <= 0) {
      this.mostrarAlerta('Atenção', 'Preencha todos os campos corretamente.');
      return;
    }

    try {
      await this.sqlite.addInsumo(
        this.novoInsumo.produto_id,
        this.novoInsumo.quantidade,
        this.novoInsumo.valor_pago
      );

      this.mostrarAlerta('Sucesso', 'Insumo cadastrado com sucesso!');
      this.novoInsumo = { produto_id: 0, quantidade: 0, valor_pago: 0 };
    } catch (error) {
      console.error('Erro ao salvar insumo:', error);
    }
  }

  async carregarProdutos() {
    this.produtos = await this.sqlite.listarProdutos() || [];
  }

  private async mostrarAlerta(titulo: string, mensagem: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensagem,
      buttons: ['OK']
    });

    await alert.present();
  }

  areAllFieldValid() {
    return (!this.novoInsumo.produto_id != null || this.novoInsumo.produto_id != 0)
      && (this.novoInsumo.quantidade != null || this.novoInsumo.quantidade != 0)
  }
}
