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
  gastosEstoque: any[] = [];

  constructor(private db: SqliteService) { }

  async ngOnInit() {
    await this.gerarRelatorio();
  }

  async gerarRelatorio() {
    if (!this.dataInicio || !this.dataFim) return;

    alert(this.dataInicio.toString());

    // Buscar dados da tabela caixa no período especificado
    const caixas = await this.db.db?.query(`
      SELECT 
        total_dinheiro,
        total_pix,
        total_debito,
        total_credito
      FROM caixa 
      WHERE DATE(data_abertura) BETWEEN ? AND ?
        OR (data_fechamento IS NOT NULL AND DATE(data_fechamento) BETWEEN ? AND ?)
    `, [this.dataInicio, this.dataFim, this.dataInicio, this.dataFim]);

    // Buscar pedidos para calcular totais por tipo
    const pedidos = await this.db.db?.query(`
      SELECT tipo, total 
      FROM pedidos 
      WHERE status = 'finalizado' 
        AND DATE(data) BETWEEN ? AND ?
    `, [this.dataInicio, this.dataFim]);

    // Buscar sangrias no período
    const sangriasRes = await this.db.db?.query(`
      SELECT * FROM sangrias 
      WHERE DATE(data) BETWEEN ? AND ?
    `, [this.dataInicio, this.dataFim]);

    // Buscar gastos com estoque no período (assumindo que há um campo data na tabela estoque)
    // Caso não tenha campo data, você pode usar a data de criação ou outro critério
    const estoque = await this.db.db?.query(`
      SELECT 
        e.valor_pago,
        p.nome as produto_nome,
        e.quantidade
      FROM estoque e
      INNER JOIN produtos p ON e.produto_id = p.id
      WHERE DATE(e.data) BETWEEN ? AND ?
    `, [this.dataInicio, this.dataFim]);

    // Inicializar totais
    const totais = {
      totalGeral: 0,
      porForma: { dinheiro: 0, pix: 0, debito: 0, credito: 0 },
      porTipo: { local: 0, entrega: 0, levar: 0 },
      totalGastosEstoque: 0
    };

    // Somar valores da tabela caixa
    caixas?.values?.forEach(caixa => {
      totais.porForma.dinheiro += caixa.total_dinheiro || 0;
      totais.porForma.pix += caixa.total_pix || 0;
      totais.porForma.debito += caixa.total_debito || 0;
      totais.porForma.credito += caixa.total_credito || 0;
    });

    // Calcular total geral das formas de pagamento
    totais.totalGeral = totais.porForma.dinheiro + totais.porForma.pix +
      totais.porForma.debito + totais.porForma.credito;

    // Calcular totais por tipo de pedido
    pedidos?.values?.forEach(pedido => {
      const tipo = pedido.tipo as 'na mesa' | 'entregar' | 'retirar';

      switch (tipo) {
        case 'na mesa':
          totais.porTipo.local += pedido.total;
          break;
        case 'entregar':
          totais.porTipo.entrega += pedido.total;
          break;
        case 'retirar':
          totais.porTipo.levar += pedido.total;
          break;
      }
    });

    // Calcular total de gastos com estoque
    estoque?.values?.forEach(item => {
      totais.totalGastosEstoque += item.valor_pago || 0;
    });

    this.relatorio = totais;
    this.sangrias = sangriasRes?.values || [];
    this.gastosEstoque = estoque?.values || [];
  }
}