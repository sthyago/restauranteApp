import { Component, OnInit } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-fechamento',
  templateUrl: './fechamento.page.html',
  styleUrls: ['./fechamento.page.scss'],
  standalone: false
})
export class FechamentoPage implements OnInit {
  valorFechamento: number = 0;
  observacoes: string = '';
  caixaAbertoHoje: any = null;
  dataHoje: string = '';
  observacoesFechamento: string = '';


  totaisPorForma: { [key: string]: number } = {};
  totalGeral: number = 0;

  constructor(
    private dbService: SqliteService,
    private toastCtrl: ToastController
  ) { }

  async ngOnInit() {
    this.dataHoje = new Date().toLocaleDateString('sv-SE');
    await this.verificarCaixaAberto();
    await this.carregarTotais();
  }

  get formasPagamento(): string[] {
    return Object.keys(this.totaisPorForma || {});
  }

  async verificarCaixaAberto() {
    const sql = `SELECT * FROM caixa WHERE data_abertura = ? AND data_fechamento IS NULL`;
    const result = await this.dbService.db?.query(sql, [this.dataHoje]);
    this.caixaAbertoHoje = result?.values?.[0] || null;
  }

  async carregarTotais() {
    if (!this.dbService) return;

    const sql = `
      SELECT forma_pagamento, SUM(total) as total
      FROM pedidos
      WHERE status = 'finalizado'
        AND cliente_id IS NULL
        AND DATE(data) = DATE('now')
      GROUP BY forma_pagamento
    `;

    const result = await this.dbService.db?.query(sql);
    const totais: { [forma: string]: number } = {};
    let soma = 0;

    for (const row of result?.values || []) {
      totais[row.forma_pagamento] = row.total;
      soma += row.total;
    }

    this.totaisPorForma = totais;
    this.totalGeral = soma;
  }

  async salvarFechamento() {
    if (!this.dbService.db) return;

    const hoje = new Date().toLocaleDateString('sv-SE');
    const agora = new Date().toLocaleDateString(); // data completa para o fechamento

    const dados = {
      valor_fechamento: this.totalGeral,
      total_dinheiro: this.totaisPorForma['dinheiro'] || 0,
      total_pix: this.totaisPorForma['pix'] || 0,
      total_debito: this.totaisPorForma['debito'] || 0,
      total_credito: this.totaisPorForma['credito'] || 0,
      data_fechamento: agora,
      observacoes_fechamento: this.observacoesFechamento || ''
    };

    const update = `
      UPDATE caixa
      SET valor_fechamento = ?, 
          data_fechamento = ?, 
          total_dinheiro = ?, 
          total_pix = ?, 
          total_debito = ?, 
          total_credito = ?, 
          observacoes_fechamento = ?
      WHERE DATE(data_abertura) = ?
    `;

    const values = [
      dados.valor_fechamento,
      dados.data_fechamento,
      dados.total_dinheiro,
      dados.total_pix,
      dados.total_debito,
      dados.total_credito,
      dados.observacoes_fechamento,
      hoje
    ];

    await this.dbService.db.run(update, values);

    const toast = await this.toastCtrl.create({
      message: 'Fechamento salvo com sucesso!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }

}
