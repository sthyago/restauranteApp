import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-novo-pedido',
  templateUrl: './novo-pedido.page.html',
  styleUrls: ['./novo-pedido.page.scss'],
  standalone: false,
})
export class NovoPedidoPage {

  novoInsumo = { produto_id: 0, quantidade: 0, valor_pago: 0 };
  produtos: { id: number; nome: string }[] = [];
  pedidoSelecionado: any[] = [];
  tipoPedido: 'local' | 'levar' | 'entrega' = 'local';
  numeroDaMesa: any;

  constructor(private navCtrl: NavController, private sqlite: SqliteService) { }

  ionViewWillEnter() {
    this.carregarProdutos();
  }

  async carregarProdutos() {
    const res = await this.sqlite.db?.query('SELECT id, nome, foto_path FROM produtos');
    this.produtos = res?.values || [];
  }

  adicionarItem(ev: any) {
    const itemSelecionado = ev.detail.value;
    const index = this.pedidoSelecionado.findIndex((i: any) => i.id === itemSelecionado.id);

    if (index > -1) {
      this.pedidoSelecionado[index].qtd += 1;
    } else {
      this.pedidoSelecionado.push({
        ...itemSelecionado,
        qtd: 1
      });
    }
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
      data: new Date().toISOString(),
      mesa_id: this.numeroDaMesa
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
