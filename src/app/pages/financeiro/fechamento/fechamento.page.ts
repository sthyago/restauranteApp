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
  valorAbertura: number = 0;
  totalSangrias: number = 0;

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
    if (!this.dbService || !this.caixaAbertoHoje) return;

    // Buscar totais da tabela caixa
    const sqlCaixa = `
      SELECT valor_abertura, total_dinheiro, total_pix, total_debito, total_credito
      FROM caixa 
      WHERE id = ?
    `;

    const resultCaixa = await this.dbService.db?.query(sqlCaixa, [this.caixaAbertoHoje.id]);
    const caixaData = resultCaixa?.values?.[0];

    if (caixaData) {
      this.valorAbertura = caixaData.valor_abertura || 0;
      this.totaisPorForma = {
        'dinheiro': caixaData.total_dinheiro || 0,
        'pix': caixaData.total_pix || 0,
        'debito': caixaData.total_debito || 0,
        'credito': caixaData.total_credito || 0
      };
    }

    // Buscar total de sangrias do dia
    const sqlSangrias = `
      SELECT COALESCE(SUM(valor), 0) as total_sangrias
      FROM sangrias 
      WHERE caixa_id = ?
    `;

    const resultSangrias = await this.dbService.db?.query(sqlSangrias, [this.caixaAbertoHoje.id]);
    this.totalSangrias = resultSangrias?.values?.[0]?.total_sangrias || 0;

    // Calcular total geral: valor_abertura + totais_vendas - sangrias
    const totalVendas = Object.values(this.totaisPorForma).reduce((sum, valor) => sum + valor, 0);
    this.totalGeral = this.valorAbertura + totalVendas - this.totalSangrias;
  }

  async salvarFechamento() {
    if (!this.dbService.db || !this.caixaAbertoHoje) return;

    const agora = new Date().toISOString();

    const update = `
      UPDATE caixa
      SET valor_fechamento = ?, 
          data_fechamento = ?, 
          observacoes_fechamento = ?
      WHERE id = ?
    `;

    const values = [
      this.totalGeral,
      agora,
      this.observacoesFechamento || '',
      this.caixaAbertoHoje.id
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