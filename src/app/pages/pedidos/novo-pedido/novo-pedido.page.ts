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
  itemPedidoId: number | undefined = 0;
  produtos: Produto[] = [];
  pedidoSelecionado: any[] = [];
  tipoPedido: 'retirar' | 'entregar' | 'na mesa' = 'retirar';
  mesa_identificacao?: string = 'Mesa';

  constructor(
    private cdr: ChangeDetectorRef,
    private sqlite: SqliteService,
    private router: Router) { }

  ionViewWillEnter() {
    this.carregarProdutos();
    this.resetForm();
  }

  private resetForm() {
    this.pedidoSelecionado = [];
    this.itemPedidoId = undefined;
  }

  async carregarProdutos() {
    this.produtos = await this.sqlite.carregarEstoqueQuery();
    this.prepararProdutos();
  }

  prepararProdutos() {
    this.produtos.forEach(p => {
      // Se já for número válido, mantém o valor
      if (typeof p.valor_unitario === 'number' && !isNaN(p.valor_unitario)) {
        return;
      }

      try {
        const valorString = String(p.valor_unitario).trim();

        // Verifica se já é um número válido (incluindo decimais)
        if (/^-?\d+(\.\d+)?$/.test(valorString)) {
          p.valor_unitario = parseFloat(valorString);
          return;
        }

        // Trata valores com vírgula como separador decimal
        if (/^-?\d+,\d+$/.test(valorString)) {
          p.valor_unitario = parseFloat(valorString.replace(',', '.'));
          return;
        }

        // Trata valores com símbolos de moeda
        const numericValue = valorString
          .replace(/[^\d,.-]/g, '')  // Remove não numéricos exceto ,.-
          .replace(/\./g, '')         // Remove pontos de milhares
          .replace(',', '.');         // Substitui vírgula decimal por ponto

        p.valor_unitario = parseFloat(numericValue) || 0;
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

  async confirmarPedido() {
    if (this.pedidoSelecionado.length === 0) {
      alert('Adicione pelo menos um item.');
      return;
    }

    // Criar cópia simplificada dos itens
    const itensSimplificados = this.pedidoSelecionado.map(item => ({
      id: item.id,
      qtd: item.qtd,
      produto_id: item.id
    }));

    const pedido: Pedido = {
      itens: itensSimplificados,
      total: this.calcularTotal(),
      tipo: this.tipoPedido,
      status: 'em_andamento',
      data: new Date().toLocaleDateString('sv-SE'),
      forma_pagamento: undefined,
      cliente_id: undefined,
      mesa_identificacao: this.tipoPedido === 'na mesa' ? this.mesa_identificacao : ''
    };

    if (this.tipoPedido == 'na mesa') {
      try {
        await this.sqlite.salvarPedido(pedido);
      } catch (error) {
        alert('Falha ao salvar pedido.');
        console.error(error);
      }
      this.resetForm();

      this.router.navigateByUrl('/tabs/pedidos');
    } else {
      this.router.navigate(['/tabs/finalizar-pedido'], {
        state: { pedido }
      });

      this.resetForm();
    }
  }

  calcularTotal(): number {
    return this.pedidoSelecionado.reduce((total, item) => {
      return total + (item.valor_unitario * item.qtd);
    }, 0);
  }
}
