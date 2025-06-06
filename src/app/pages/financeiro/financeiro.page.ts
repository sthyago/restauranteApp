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

  hoje?: string;
  caixaRes: any;
  caixa: any = null;
  sangrias: any[] = [];
  saldo: number = 0;

  async ngOnInit() {
    await this.carregarCaixaAtual();
  }

  async carregarCaixaAtual() {
    this.pegarCaixasDoDia();

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
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const [dia, mes, ano] = formatter.format(agora).split('/');
    this.hoje = `${ano}-${mes}-${dia}`;

    const caixaRes = await this.dbService.db?.query(`
      SELECT * FROM caixa 
      WHERE DATE(data_abertura) = ? 
      ORDER BY id DESC 
      LIMIT 1
    `, [this.hoje]);

    return caixaRes
  }
}
