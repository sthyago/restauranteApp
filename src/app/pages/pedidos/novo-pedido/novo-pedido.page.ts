import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Pedido } from 'src/app/models/pedido';
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
  pedido?: Pedido;

  constructor(
    private cdr: ChangeDetectorRef,
    private sqlite: SqliteService,
    private router: Router) { }

  ionViewWillEnter() {
    this.carregarProdutos();
  }

  async carregarProdutos() {
    this.produtos = await this.sqlite.carregarEstoqueQuery();
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

  adicionarItem() {
    const produtoId = this.itemPedidoId;
    if (!produtoId) return;

    const produtoSelecionado = this.produtos.find(p => p.id === produtoId);
    if (!produtoSelecionado) return;

    const index = this.pedidoSelecionado.findIndex((i: any) => i.id === produtoId);

    if (index > -1) {
      this.pedidoSelecionado[index].qtd += 1;
    } else {
      this.pedidoSelecionado.push({
        id: produtoSelecionado.id,
        nome: produtoSelecionado.nome,
        valor_unitario: produtoSelecionado.valor_unitario || 0,
        foto_path: produtoSelecionado.foto_path,
        descricao: produtoSelecionado.descricao || '',
        qtd: 1
      });
    }

    // Resetar a seleção
    this.itemPedidoId = 0;
  }

  alterarQtd(item: any, delta: number) {
    const index = this.pedidoSelecionado.findIndex((i: any) => i.id === item.id);

    if (index > -1) {
      // Cria uma cópia do array para forçar detecção de mudanças
      const updatedItems = [...this.pedidoSelecionado];

      // Atualiza a quantidade
      updatedItems[index] = {
        ...updatedItems[index],
        qtd: updatedItems[index].qtd + delta
      };

      // Remove item se quantidade <= 0
      if (updatedItems[index].qtd <= 0) {
        updatedItems.splice(index, 1);
      }

      // Atualiza o array principal
      this.pedidoSelecionado = updatedItems;
      this.cdr.detectChanges();
    }
  }

  confirmarPedido() {
    if (this.pedidoSelecionado.length === 0) {
      alert('Adicione pelo menos um item.');
      return;
    }

    // Criar cópia simplificada dos itens
    const itensSimplificados = this.pedidoSelecionado.map(item => ({
      id: item.id,
      qtd: item.qtd
    }));

    const pedido: Pedido = {
      itens: itensSimplificados,
      total: this.calcularTotal(),
      tipo: this.tipoPedido,
      status: 'em_andamento',
      data: new Date().toISOString(),
      forma_pagamento: undefined,
      cliente_id: undefined
    };

    this.router.navigateByUrl('/tabs/finalizar-pedido', {
      state: { pedido }
    });
  }

  calcularTotal(): number {
    return this.pedidoSelecionado.reduce((total, item) => {
      return total + (item.valor_unitario * item.qtd);
    }, 0);
  }
}
