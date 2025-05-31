import { Component } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { ModalController, NavController } from '@ionic/angular';
import { Produto } from 'src/app/models/produto';
import { EditarProdutoPage } from '../editar-produto/editar-produto.page';

@Component({
  selector: 'app-cadastro-produto',
  templateUrl: './cadastro-produto.page.html',
  styleUrls: ['./cadastro-produto.page.scss'],
  standalone: false
})

export class CadastroProdutoPage {
  produto: Produto = {
    id: 0,
    nome: '',
    valor_unitario: 0,
    foto_path: '',
    alerta_minimo: 0
  };
  produtos: Produto[] = [];

  constructor(
    private sqlite: SqliteService,
    private navCtrl: NavController,
    private modalCtrl: ModalController) { }

  async ngOnInit() {
    await this.carregarProdutos();
    this.prepararProdutos();
  }

  prepararProdutos() {
    this.produtos.forEach(p => {
      try {
        // Converte qualquer tipo para string
        const valorString = String(p.valor_unitario);

        // Remove caracteres não numéricos exceto ponto e vírgula
        const numericString = valorString
          .replace(/[^0-9,.]/g, '')
          .replace(',', '.');

        // Converte para número
        p.valor_unitario = parseFloat(numericString) || 0;
      } catch (e) {
        console.error('Erro ao converter valor:', p.valor_unitario, e);
        p.valor_unitario = 0;
      }
    });
  }

  async salvar() {
    if (!this.produto!.nome || !this.produto!.valor_unitario) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const insert = `INSERT INTO produtos (nome, descricao, valor_unitario) VALUES (?, ?, ?)`;
    const values = [this.produto!.nome, this.produto!.descricao, this.produto!.valor_unitario];
    await this.sqlite.db?.run(insert, values);
    this.navCtrl.back();
  }

  async abrirModalEdicao(produto: Produto) {
    const modal = await this.modalCtrl.create({
      component: EditarProdutoPage,
      componentProps: {
        produto: produto
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data && data.data.atualizado) {
        this.carregarProdutos(); // Recarrega a lista se houve atualização
      }
    });

    await modal.present();
  }

  async carregarProdutos() {
    this.produtos = await this.sqlite.listarProdutos() || [];
  }
}
