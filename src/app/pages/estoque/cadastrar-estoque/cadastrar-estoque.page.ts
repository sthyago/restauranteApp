import { Component, OnInit } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-cadastrar-estoque',
  templateUrl: './cadastrar-estoque.page.html',
  styleUrls: ['./cadastrar-estoque.page.scss'],
  standalone: false
})
export class CadastrarEstoquePage {

  novoInsumo = { produto_id: 0, quantidade: 0, valor_pago: 0 };
  produtos: { id: number; nome: string }[] = [];

  constructor(private sqlite: SqliteService) { }

  ionViewWillEnter() {
    this.carregarProdutos();
  }

  async salvar() {
    if (!this.novoInsumo.produto_id || this.novoInsumo.quantidade <= 0 || this.novoInsumo.valor_pago <= 0) {
      alert('Preencha todos os campos corretamente.');
      return;
    }

    await this.sqlite.addInsumo(this.novoInsumo.produto_id, this.novoInsumo.quantidade, this.novoInsumo.valor_pago);
  }

  async carregarProdutos() {
    const res = await this.sqlite.db?.query('SELECT id, nome FROM produtos');
    this.produtos = res?.values || [];
  }
}
