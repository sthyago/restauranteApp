import { Component, OnInit } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-financeiro',
  templateUrl: './financeiro.page.html',
  styleUrls: ['./financeiro.page.scss'],
  standalone: false
})
export class FinanceiroPage implements OnInit {

  constructor(private dbService: SqliteService) { }

  caixa: any = null;
  sangrias: any[] = [];
  saldo: number = 0;

  async ngOnInit() {
    await this.carregarCaixaAtual();
  }

  async carregarCaixaAtual() {
    const hoje = new Date().toISOString().slice(0, 10);

    const caixaRes = await this.dbService.db?.query(`
      SELECT * FROM caixa 
      WHERE DATE(data_abertura) = ? 
      ORDER BY id DESC 
      LIMIT 1
    `, [hoje]);

    if (!caixaRes?.values?.length) return;

    this.caixa = caixaRes.values[0];

    // Buscar sangrias do dia
    const sangriaRes = await this.dbService.db?.query(`
      SELECT valor, motivo, data FROM sangrias 
      WHERE DATE(data) = ?
    `, [hoje]);

    this.sangrias = sangriaRes?.values || [];

    const totalSangrias = this.sangrias.reduce((acc, s) => acc + s.valor, 0);

    const entradas =
      this.caixa.total_dinheiro +
      this.caixa.total_pix +
      this.caixa.total_debito +
      this.caixa.total_credito;

    this.saldo = this.caixa.valor_abertura + entradas - totalSangrias;
  }
}
