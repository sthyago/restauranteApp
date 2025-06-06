import { Component, OnInit } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-financeiro',
  templateUrl: './financeiro.page.html',
  styleUrls: ['./financeiro.page.scss'],
  standalone: false
})
export class FinanceiroPage {

  constructor(private dbService: SqliteService) { }

  hoje?: string;
  caixaRes: any;
  caixa: any = null;
  sangrias: any[] = [];
  saldo: number = 0;

  async carregarCaixaAtual() {
    this.caixaRes = await this.pegarCaixasDoDia();

    if (!this.caixaRes?.values?.length) return;

    this.caixa = this.caixaRes.values[0];

    // Buscar sangrias do dia
    const sangriaRes = await this.dbService.db?.query(`
      SELECT valor, motivo, data FROM sangrias 
      WHERE DATE(data) = ?
    `, [this.hoje]);

    this.sangrias = sangriaRes?.values || [];

    const totalSangrias = this.sangrias.reduce((acc, s) => acc + s.valor, 0);

    const entradas =
      this.caixa.total_dinheiro +
      this.caixa.total_pix +
      this.caixa.total_debito +
      this.caixa.total_credito;

    this.saldo = this.caixa.valor_abertura + entradas - totalSangrias;
  }
  async pegarCaixasDoDia() {
    const agora = new Date();

    // Usar mesmo formato que a abertura de caixa (YYYY-MM-DD)
    const [dia, mes, ano] = [
      agora.getDate().toString().padStart(2, '0'),
      (agora.getMonth() + 1).toString().padStart(2, '0'),
      agora.getFullYear()
    ];

    this.hoje = `${ano}-${mes}-${dia}`;

    return await this.dbService.db?.query(`
      SELECT * FROM caixa 
      WHERE DATE(data_abertura) = ? 
      ORDER BY id DESC 
      LIMIT 1
    `, [this.hoje]);
  }
}
