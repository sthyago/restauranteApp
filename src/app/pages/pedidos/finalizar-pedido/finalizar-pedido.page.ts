import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Cliente } from 'src/app/models/cliente';
import { Pedido } from 'src/app/models/pedido';
import { FormaPagamento } from 'src/app/models/tipos';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-finalizar-pedido',
  templateUrl: './finalizar-pedido.page.html',
  styleUrls: ['./finalizar-pedido.page.scss'],
  standalone: false,
})
export class FinalizarPedidoPage {
  pedido?: Pedido;
  itensDetalhados: any[] = [];
  clientes: Cliente[] = [];
  formaPagamento?: FormaPagamento;
  clienteSelecionadoId?: number;

  constructor(private router: Router, private sqliteService: SqliteService) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['pedido']) {
      this.pedido = nav.extras.state['pedido'];
    } else {
      this.router.navigateByUrl('/tabs/pedidos');
    }
  }

  async ionViewWillEnter() {
    if (!this.pedido)
      return

    this.clientes = await this.sqliteService.listarClientes();

    const itens = this.pedido.itens;
    const produtos = await this.sqliteService.listarProdutos();

    this.itensDetalhados = itens.map(i => {
      const produto = produtos.find(p => p.id === i.id);
      return {
        ...produto,
        qtd: i.qtd
      };
    });
  }

  async confirmarFinalizacao() {
    if (!this.formaPagamento) {
      alert('Selecione a forma de pagamento.');
      return;
    }

    if (this.formaPagamento.toString() === 'na_conta' && !this.clienteSelecionadoId) {
      alert('Selecione um cliente.');
      return;
    }

    if (this.pedido) {
      this.pedido.status = this.formaPagamento.toString() === 'na_conta' ? 'na_conta' : 'finalizado';
      this.pedido.forma_pagamento = this.formaPagamento;
      this.pedido.cliente_id = this.clienteSelecionadoId;

      try {
        // Dar baixa no estoque para cada item do pedido
        for (const item of this.pedido.itens) {
          const sucesso = await this.sqliteService.darBaixaEstoque(item.id, item.qtd);

          if (!sucesso) {
            alert(`Estoque insuficiente para o produto ID ${item.id}. Pedido não finalizado.`);
            return;
          }
        }

        // Salvar pedido
        await this.sqliteService.salvarPedido(this.pedido);

        alert('Pedido finalizado com sucesso!');

        this.router.navigateByUrl('/tabs/pedidos');
      } catch (e) {
        console.error('Erro ao finalizar pedido:', e);
        alert('Erro ao finalizar pedido. Verifique o console.');
      }
    }
  }

  getTotal(): number | null {
    return this.pedido?.total ?? null;
  }
}
