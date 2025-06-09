// src/app/pages/contas/contas.page.ts
import { Component, OnInit } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Pedido } from 'src/app/models/pedido';

@Component({
  selector: 'app-contas',
  templateUrl: './contas.page.html',
  styleUrls: ['./contas.page.scss'],
  standalone: false
})
export class ContasPage implements OnInit {
  contas: any[] = [];
  contasFiltradas: any[] = [];
  filtroCliente: string = '';

  constructor(
    private dbService: SqliteService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.carregarContas();
  }

  async carregarContas() {
    const sql = `
      SELECT p.id, p.total, p.data, c.nome AS cliente_nome, p.itens
      FROM pedidos p
      JOIN clientes c ON c.id = p.cliente_id
      WHERE p.status = 'na_conta'
      ORDER BY p.data DESC
    `;
    const result = await this.dbService.db?.query(sql);
    this.contas = result?.values || [];
    this.contas.forEach(c => c.selecionado = false);
    this.filtrar();
  }

  filtrar() {
    const termo = this.filtroCliente.toLowerCase();
    this.contasFiltradas = this.contas.filter(c =>
      c.cliente_nome.toLowerCase().includes(termo)
    );
  }
  // Verifica se há pedidos selecionados
  haSelecionados(): boolean {
    return this.contasFiltradas.some(c => c.selecionado);
  }

  // Conta quantos pedidos estão selecionados
  quantidadeSelecionados(): number {
    return this.contasFiltradas.filter(c => c.selecionado).length;
  }

  // Pagar um pedido individual
  async pagarPedido(conta: any) {
    await this.processarPagamentos([conta]);
  }

  // Pagar todos os pedidos filtrados
  async pagarTodosFiltrados() {
    await this.processarPagamentos(this.contasFiltradas);
  }

  // Pagar os pedidos selecionados
  async pagarSelecionados() {
    const selecionados = this.contasFiltradas.filter(c => c.selecionado);
    await this.processarPagamentos(selecionados);
  }

  // Processa múltiplos pagamentos
  async processarPagamentos(contas: any[]) {
    if (contas.length === 0) return;

    // Se for apenas um pedido, redireciona para a página de pagamento
    if (contas.length === 1) {
      const pedido: Pedido = {
        id: contas[0].id,
        itens: JSON.parse(contas[0].itens),
        total: contas[0].total,
        tipo: 'retirar',
        status: 'na_conta',
        cliente_id: contas[0].cliente_id,
        cliente_nome: contas[0].cliente_nome,
        data: contas[0].data
      };

      this.router.navigate(['/tabs/finalizar-pedido'], {
        state: {
          pedido,
          origem: 'contas'
        }
      });
      return;
    }

    // Para múltiplos pedidos, mostra alerta de confirmação
    const total = contas.reduce((sum, conta) => sum + conta.total, 0);

    const alert = await this.alertCtrl.create({
      header: 'Pagamento em Massa',
      message: `Deseja pagar ${contas.length} pedidos? Total: R$ ${total.toFixed(2)}`,
      inputs: [
        {
          name: 'forma_pagamento',
          type: 'radio',
          label: 'Dinheiro',
          value: 'dinheiro',
          checked: true
        },
        {
          name: 'forma_pagamento',
          type: 'radio',
          label: 'Pix',
          value: 'pix'
        },
        {
          name: 'forma_pagamento',
          type: 'radio',
          label: 'Cartão Débito',
          value: 'debito'
        },
        {
          name: 'forma_pagamento',
          type: 'radio',
          label: 'Cartão Crédito',
          value: 'credito'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async (dados) => {
            await this.realizarPagamentos(contas, dados.forma_pagamento);
          }
        }
      ]
    });

    await alert.present();
  }
  // Realiza os pagamentos no banco de dados
  async realizarPagamentos(contas: any[], formaPagamento: string) {
    const dataAtual = new Date().toISOString();

    for (const conta of contas) {
      const sql = `
        UPDATE pedidos
        SET status = 'finalizado', 
            forma_pagamento = ?, 
            data = ?
        WHERE id = ?
      `;

      await this.dbService.db?.run(sql, [formaPagamento, dataAtual, conta.id]);

      // Atualizar caixa (criar pedido fake para atualização)
      const pedidoFake: Pedido = {
        id: conta.id,
        itens: [],
        total: conta.total,
        tipo: 'retirar',
        status: 'finalizado',
        forma_pagamento: formaPagamento as any,
        valor_pago: conta.total,
        data: dataAtual
      };

      await this.dbService.atualizarCaixa(pedidoFake);
    }

    const toast = await this.toastCtrl.create({
      message: `${contas.length} pedidos pagos com sucesso!`,
      duration: 3000,
      color: 'success'
    });

    await toast.present();
    await this.carregarContas();
  }
  async marcarComoPago(pedidoId: number) {
    const alert = await this.alertCtrl.create({
      header: 'Forma de Pagamento',
      inputs: [
        {
          name: 'forma_pagamento',
          type: 'radio',
          label: 'Dinheiro',
          value: 'dinheiro',
          checked: true
        },
        {
          name: 'forma_pagamento',
          type: 'radio',
          label: 'Pix',
          value: 'pix'
        },
        {
          name: 'forma_pagamento',
          type: 'radio',
          label: 'Cartão Débito',
          value: 'debito'
        },
        {
          name: 'forma_pagamento',
          type: 'radio',
          label: 'Cartão Crédito',
          value: 'credito'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async (forma: string) => {
            const sql = `
              UPDATE pedidos
              SET status = 'finalizado', forma_pagamento = ?, data = ?
              WHERE id = ?
            `;
            await this.dbService.db?.run(sql, [forma, pedidoId]);

            const toast = await this.toastCtrl.create({
              message: 'Conta marcada como paga!',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
            await this.carregarContas();
          }
        }
      ]
    });
    await alert.present();
  }
}
