import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Caixa } from 'src/app/models/caixa';
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
  caixa?: Caixa;
  desconto: number = 0;
  valor_pago: number = 0;

  constructor(private router: Router, private sqliteService: SqliteService) {
    const nav = this.router.getCurrentNavigation();

    if (nav?.extras?.state?.['origem'] === 'contas') {
      this.pedido = nav.extras.state['pedido'];
      this.pedido!.status = 'finalizado'; // Muda status automaticamente
      this.valor_pago = this.pedido!.total; // Preenche valor pago
    }

    if (nav?.extras?.state?.['pedido']) {
      this.pedido = nav.extras.state['pedido'];
    } else {
      this.router.navigateByUrl('/tabs/pedidos');
    }
  }

  async ionViewWillEnter() {
    if (!this.pedido) return;

    this.valor_pago = this.pedido.total;

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
    // Validação adicional para valor pago
    const valorLiquido = this.pedido!.total - this.desconto;
    if (this.formaPagamento.toString() !== 'na_conta' && this.valor_pago < valorLiquido) {
      alert(`Valor pago (${this.valor_pago}) não pode ser menor que o valor líquido (${valorLiquido})`);
      return;
    }

    if (this.pedido) {
      this.pedido.status = this.formaPagamento.toString() === 'na_conta' ? 'na_conta' : 'finalizado';
      this.pedido.forma_pagamento = this.formaPagamento;
      this.pedido.cliente_id = this.clienteSelecionadoId;
      this.pedido.desconto = this.desconto;
      this.pedido.valor_pago = this.formaPagamento.toString() === 'na_conta' ? 0 : this.valor_pago;

      try {
        // Se veio da página de contas, não precisa dar baixa no estoque novamente
        if (!this.pedido?.origem || this.pedido.origem !== 'contas') {
          for (const item of this.pedido!.itens) {
            const sucesso = await this.sqliteService.darBaixaEstoque(item.id, item.qtd);
            if (!sucesso) {
              alert(`Estoque insuficiente para o produto ID ${item.id}. Pedido não finalizado.`);
              return;
            }
          }
        }

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

        // Atualizar Caixa
        await this.sqliteService.atualizarCaixa(this.pedido);

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

  calcularValorPago() {
    if (this.pedido) {
      // Calcula o valor líquido (total - desconto)
      const valorLiquido = this.pedido.total - this.desconto;

      // Atualiza o valor_pago se não foi modificado manualmente
      if (this.valor_pago === this.pedido.total) {
        this.valor_pago = valorLiquido;
      }
    }
  }

  validarValorPago() {
    if (this.pedido && this.valor_pago < (this.pedido.total - this.desconto)) {
      alert('Valor pago não pode ser menor que o valor líquido (Total - Desconto)');
      this.valor_pago = this.pedido.total - this.desconto;
    }
  }
}

