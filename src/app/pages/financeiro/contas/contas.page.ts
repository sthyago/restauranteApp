// src/app/pages/contas/contas.page.ts
import { Component, OnInit } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { ToastController, AlertController } from '@ionic/angular';

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
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    await this.carregarContas();
  }

  async carregarContas() {
    const sql = `
      SELECT p.id, p.total, p.data, c.nome AS cliente_nome
      FROM pedidos p
      JOIN clientes c ON c.id = p.cliente_id
      WHERE p.status = 'na_conta'
      ORDER BY p.data DESC
    `;
    const result = await this.dbService.db?.query(sql);
    this.contas = result?.values || [];
    this.filtrar();
  }

  filtrar() {
    const termo = this.filtroCliente.toLowerCase();
    this.contasFiltradas = this.contas.filter(c =>
      c.cliente_nome.toLowerCase().includes(termo)
    );
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
