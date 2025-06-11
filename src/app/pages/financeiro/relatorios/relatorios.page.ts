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
  isDatePickerVisible = false;

  constructor(private db: SqliteService) { }

  async ngOnInit() {
    // Inicializar com data atual se necessário
    this.inicializarDatas();
    await this.gerarRelatorio();
  }

  // Método para inicializar datas padrão
  inicializarDatas() {
    if (!this.dataInicio || !this.dataFim) {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      this.dataInicio = inicioMes.toISOString();
      this.dataFim = hoje.toISOString();
    }
  }

  // Método auxiliar para formatar data para SQL
  private formatarDataParaSQL(data: string): string {
    return data.split('T')[0];
  }

  async gerarRelatorio() {
    try {
      // Se não houver datas, inicializar
      if (!this.dataInicio || !this.dataFim) {
        this.inicializarDatas();
      }

      const dataInicioSQL = this.formatarDataParaSQL(this.dataInicio);
      const dataFimSQL = this.formatarDataParaSQL(this.dataFim);

      console.log('Gerando relatório para período:', dataInicioSQL, 'até', dataFimSQL);

      // Buscar dados da tabela caixa no período especificado
      const caixas = await this.db.db?.query(`
        SELECT 
          COALESCE(total_dinheiro, 0) as total_dinheiro,
          COALESCE(total_pix, 0) as total_pix,
          COALESCE(total_debito, 0) as total_debito,
          COALESCE(total_credito, 0) as total_credito
        FROM caixa 
        WHERE DATE(data_abertura) BETWEEN ? AND ?
          OR (data_fechamento IS NOT NULL AND DATE(data_fechamento) BETWEEN ? AND ?)
      `, [dataInicioSQL, dataFimSQL, dataInicioSQL, dataFimSQL]);

      // Buscar pedidos para calcular totais por tipo
      const pedidos = await this.db.db?.query(`
        SELECT tipo, COALESCE(total, 0) as total
        FROM pedidos 
        WHERE status = 'finalizado' 
          AND DATE(data) BETWEEN ? AND ?
      `, [dataInicioSQL, dataFimSQL]);

      // Buscar sangrias no período
      const sangriasRes = await this.db.db?.query(`
        SELECT * FROM sangrias 
        WHERE DATE(data) BETWEEN ? AND ?
      `, [dataInicioSQL, dataFimSQL]);

      // Buscar gastos com estoque no período
      const estoque = await this.db.db?.query(`
        SELECT 
          COALESCE(e.valor_pago, 0) as valor_pago,
          p.nome as produto_nome,
          COALESCE(e.quantidade, 0) as quantidade
        FROM estoque e
        INNER JOIN produtos p ON e.produto_id = p.id
        WHERE DATE(e.data) BETWEEN ? AND ?
      `, [dataInicioSQL, dataFimSQL]);

      // Inicializar totais
      const totais = {
        totalGeral: 0,
        porForma: { dinheiro: 0, pix: 0, debito: 0, credito: 0 },
        porTipo: { local: 0, entrega: 0, levar: 0 },
        totalGastosEstoque: 0
      };

      // Debug: Log dos resultados das consultas
      console.log('Resultados das consultas:', {
        caixas: caixas?.values,
        pedidos: pedidos?.values,
        sangrias: sangriasRes?.values,
        estoque: estoque?.values
      });
      alert(`${caixas?.values?.toString()}`)
      // Somar valores da tabela caixa
      if (caixas?.values && caixas.values.length > 0) {
        caixas.values.forEach((caixa: any) => {
          totais.porForma.dinheiro += Number(caixa.total_dinheiro) || 0;
          totais.porForma.pix += Number(caixa.total_pix) || 0;
          totais.porForma.debito += Number(caixa.total_debito) || 0;
          totais.porForma.credito += Number(caixa.total_credito) || 0;
        });
      }

      // Calcular total geral das formas de pagamento
      totais.totalGeral = totais.porForma.dinheiro + totais.porForma.pix +
        totais.porForma.debito + totais.porForma.credito;

      // Calcular totais por tipo de pedido
      if (pedidos?.values && pedidos.values.length > 0) {
        pedidos.values.forEach((pedido: any) => {
          const tipo = pedido.tipo as string;
          const valorPedido = Number(pedido.total) || 0;

          switch (tipo) {
            case 'na mesa':
              totais.porTipo.local += valorPedido;
              break;
            case 'entregar':
              totais.porTipo.entrega += valorPedido;
              break;
            case 'retirar':
              totais.porTipo.levar += valorPedido;
              break;
          }
        });
      }

      // Calcular total de gastos com estoque
      if (estoque?.values && estoque.values.length > 0) {
        estoque.values.forEach((item: any) => {
          totais.totalGastosEstoque += Number(item.valor_pago) || 0;
        });
      }

      alert(`${totais.porForma.dinheiro.toString()}+${totais.totalGeral.toString()}`)

      this.relatorio = totais;
      this.sangrias = sangriasRes?.values || [];
      this.gastosEstoque = estoque?.values || [];

      // Só esconde o date picker se não estava visível
      if (this.isDatePickerVisible) {
        this.toggleDatePicker();
      }

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      // Inicializar com valores zerados em caso de erro
      this.relatorio = {
        totalGeral: 0,
        porForma: { dinheiro: 0, pix: 0, debito: 0, credito: 0 },
        porTipo: { local: 0, entrega: 0, levar: 0 },
        totalGastosEstoque: 0
      };
      this.sangrias = [];
      this.gastosEstoque = [];
    }
  }

  toggleDatePicker() {
    this.isDatePickerVisible = !this.isDatePickerVisible;
  }
}