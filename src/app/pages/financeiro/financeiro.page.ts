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

  dataHoje: string = '';
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
    `, [this.dataHoje]);

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
    this.getDataHora
    return await this.dbService.db?.query(`
      SELECT * FROM caixa 
      WHERE DATE(data_abertura) = ? 
      ORDER BY id DESC 
      LIMIT 1
    `, [this.dataHoje]);
  }

  getDataHora() {
    const data = new Date();

    // Converte para o fuso de São Paulo (Goiânia)
    const formatador = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const [dataStr] = formatador.format(data).split(', ');
    const [dia, mes, ano] = dataStr.split('/');

    this.dataHoje = `${ano}-${mes}-${dia}`;
  }
}
