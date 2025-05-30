import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Produto } from 'src/app/models/produto';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-novo-pedido',
  templateUrl: './novo-pedido.page.html',
  styleUrls: ['./novo-pedido.page.scss'],
  standalone: false,
})
export class NovoPedidoPage {

  itemPedidoId = 0;
  produtos: Produto[] = [];
  pedidoSelecionado: any[] = [];
  tipoPedido: 'local' | 'entrega' = 'local';
  numeroDaMesa: any;

  constructor(private navCtrl: NavController, private sqlite: SqliteService) { }

  ionViewWillEnter() {
    this.carregarProdutos();
  }

  async carregarProdutos() {
    const res = await this.sqlite.db?.query('SELECT * FROM produtos');
    this.produtos = res?.values || [];
  }

  adicionarItem(ev: any) {
    const produtoId = ev.detail.value;
    if (!produtoId) return;

    const produtoSelecionado = this.produtos.find(p => p.id === produtoId);
    if (!produtoSelecionado) return;

    const index = this.pedidoSelecionado.findIndex((i: any) => i.id === produtoId);

    if (index > -1) {
      this.pedidoSelecionado[index].qtd += 1;
    } else {
      // Você precisará adicionar mais informações do produto aqui
      this.pedidoSelecionado.push({
        id: produtoSelecionado.id,
        nome: produtoSelecionado.nome,
        valor_unitario: produtoSelecionado.valor_unitario || 0, // Adicione este campo aos produtos
        foto_path: produtoSelecionado.foto_path,
        descricao: produtoSelecionado.descricao || '',
        qtd: 1
      });
    }

    // Resetar a seleção para permitir nova seleção do mesmo produto
    this.itemPedidoId = 0;
  }

  alterarQtd(item: any, delta: number) {
    const index = this.pedidoSelecionado.findIndex((i: any) => i.id === item.id);

    if (index > -1) {
      this.pedidoSelecionado[index].qtd += delta;

      if (this.pedidoSelecionado[index].qtd <= 0) {
        this.pedidoSelecionado.splice(index, 1);
      }
    }
  }

  confirmarPedido() {
    if (this.pedidoSelecionado.length === 0) {
      alert('Adicione pelo menos um item.');
      return;
    }

    const pedido = {
      itens: this.pedidoSelecionado,
      total: this.calcularTotal(),
      tipo: this.tipoPedido,
      status: 'em_andamento',
      data: new Date().toISOString()
    };

    this.navCtrl.navigateForward('/finalizar-pedido', {
      state: { pedido }
    });
  }

  calcularTotal(): number {
    return this.pedidoSelecionado.reduce((total, item) => {
      return total + (item.valor_unitario * item.qtd);
    }, 0);
  }

}
