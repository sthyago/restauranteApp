import { Component, OnInit } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.page.html',
  styleUrls: ['./relatorios.page.scss'],
  standalone: false
})
export class RelatoriosPage implements OnInit {

  dataInicio: string = '';
  dataFim: string = '';
  relatorio: any = null;
  sangrias: any[] = [];

  constructor(private db: SqliteService) { }

  async ngOnInit() {
    await this.gerarRelatorio();
  }

  async gerarRelatorio() {
    if (!this.dataInicio || !this.dataFim) return;

    const pedidos = await this.db.db?.query(`
      SELECT forma_pagamento, tipo, total 
      FROM pedidos 
      WHERE status = 'finalizado' 
        AND DATE(data) BETWEEN ? AND ?
    `, [this.dataInicio, this.dataFim]);

    const sangriasRes = await this.db.db?.query(`
      SELECT * FROM sangrias 
      WHERE DATE(data) BETWEEN ? AND ?
    `, [this.dataInicio, this.dataFim]);

    const totais = {
      totalGeral: 0,
      porForma: { dinheiro: 0, pix: 0, debito: 0, credito: 0 },
      porTipo: { local: 0, entrega: 0, levar: 0 }
    };

    pedidos?.values?.forEach(p => {
      const forma = p.forma_pagamento as 'dinheiro' | 'pix' | 'debito' | 'credito';
      const tipo = p.tipo as 'local' | 'entrega' | 'levar';

      if (totais.porForma[forma] !== undefined) {
        totais.porForma[forma] += p.total;
      }

      if (totais.porTipo[tipo] !== undefined) {
        totais.porTipo[tipo] += p.total;
      }

      totais.totalGeral += p.total;
    });


    this.relatorio = totais;
    this.sangrias = sangriasRes?.values || [];
  }

}
