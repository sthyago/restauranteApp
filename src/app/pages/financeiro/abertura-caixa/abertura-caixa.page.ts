import { Component, OnInit } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-abertura-caixa',
  templateUrl: './abertura-caixa.page.html',
  styleUrls: ['./abertura-caixa.page.scss'],
  standalone: false
})

export class AberturaCaixaPage implements OnInit {

  valorAbertura?: number;
  observacoes: string = '';
  dataHoje: string = '';
  caixaAbertoHoje: boolean = false;

  constructor(private dbService: SqliteService, private toastCtrl: ToastController) { }

  async ngOnInit() {
    this.dataHoje = new Date().toISOString().split('T')[0];
    await this.verificarCaixaAberto();
  }

  async verificarCaixaAberto() {
    const sql = `SELECT * FROM caixa WHERE data_abertura = ?`;
    const result = await this.dbService.db?.query(sql, [this.dataHoje]);
    this.caixaAbertoHoje = (result?.values?.length || 0) > 0;
  }

  async abrirCaixa() {

    if (this.caixaAbertoHoje) {
      alert('Já existe um caixa aberta hoje');
      return;
    }

    if (!this.valorAbertura) {
      alert('Informe valor de abertura');
      return;
    }

    const insert = `
      INSERT INTO caixa (data_abertura, valor_abertura, observacoes)
      VALUES (?, ?, ?)
    `;

    await this.dbService.db?.run(insert, [this.dataHoje, this.valorAbertura, this.observacoes]);

    const toast = await this.toastCtrl.create({
      message: 'Caixa aberto com sucesso!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
    this.caixaAbertoHoje = true;
  }
}

