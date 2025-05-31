import { Component, OnInit } from '@angular/core';
import { Produto } from 'src/app/models/produto';
import { SqliteService } from 'src/app/services/sqlite.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-cadastrar-estoque',
  templateUrl: './cadastrar-estoque.page.html',
  styleUrls: ['./cadastrar-estoque.page.scss'],
  standalone: false
})
export class CadastrarEstoquePage {

  novoInsumo = { produto_id: 0, quantidade: 0, valor_pago: 0 };
  produtos: Produto[] = [];
  salvando = false;
  sucesso = false;

  constructor(private sqlite: SqliteService, private alertController: AlertController) { }

  ionViewWillEnter() {
    this.carregarProdutos();
  }

  async salvar() {
    this.salvando = true;
    this.sucesso = false;

    if (!this.novoInsumo.produto_id || this.novoInsumo.quantidade <= 0 || this.novoInsumo.valor_pago <= 0) {
      this.mostrarAlerta('Atenção', 'Preencha todos os campos corretamente.');
      return;
    }

    try {
      await this.sqlite.addInsumo(
        this.novoInsumo.produto_id,
        this.novoInsumo.quantidade,
        this.novoInsumo.valor_pago
      );

      // Feedback de sucesso e reset do formulário
      this.mostrarAlerta('Sucesso', 'Insumo cadastrado com sucesso!');
      this.novoInsumo = { produto_id: 0, quantidade: 0, valor_pago: 0 };
      this.sucesso = true;
    } catch (error) {
      console.error('Erro ao salvar insumo:', error);
      this.mostrarAlerta('Erro', 'Falha ao cadastrar insumo. Tente novamente.');
    } finally {
      this.salvando = false;
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
}
