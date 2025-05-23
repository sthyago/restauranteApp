import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Cliente } from 'src/app/models/cliente';
import { Pedido } from 'src/app/models/pedido';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-finalizar-pedido',
  templateUrl: './finalizar-pedido.page.html',
  styleUrls: ['./finalizar-pedido.page.scss'],
  standalone: false,
})
export class FinalizarPedidoPage {
  pedido?: any;
  itensDetalhados: any[] = [];
  clientes: Cliente[] = [];
  formaPagamento: string = '';
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
    this.clientes = await this.sqliteService.listarClientes();

    const itens: { id: number, qtd: number }[] = JSON.parse(this.pedido.itens);
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
      alert('Selecione a forma de pagamento ou "Na conta".');
      return;
    }

    if (this.formaPagamento === 'na_conta' && !this.clienteSelecionadoId) {
      alert('Informe o nome do cliente.');
      return;
    }

    // Atualiza status
    this.pedido!.status = this.formaPagamento === 'na_conta' ? 'na_conta' : 'finalizado';
    this.pedido!.forma_pagamento = this.formaPagamento;
    this.pedido!.cliente_id = this.clienteSelecionadoId;

    // Atualiza itens
    const itensFormatados = JSON.parse(this.pedido!.itens).map((i: any) => ({
      id: i.id,
      qtd: i.qtd
    }));

    this.pedido!.itens = itensFormatados;

    // Salvar no SQLite
    try {
      await this.sqliteService.salvarPedido(this.pedido!);
      alert('Pedido salvo com sucesso!');
      this.router.navigateByUrl('/tabs/pedidos');
    } catch (e) {
      console.error('Erro ao salvar pedido:', e);
      alert('Erro ao salvar pedido.');
    }
  }
}
