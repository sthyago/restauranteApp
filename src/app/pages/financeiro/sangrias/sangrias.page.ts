import { Component, OnInit } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-sangrias',
  templateUrl: './sangrias.page.html',
  styleUrls: ['./sangrias.page.scss'],
  standalone: false
})
export class SangriasPage implements OnInit {

  valor: number = 0;
  motivo: string = '';
  sangriasDoDia: any[] = [];

  constructor(
    private dbService: SqliteService,
    private toastCtrl: ToastController
  ) { }

  async ngOnInit() {
    await this.carregarSangriasDoDia();
  }

  async registrarSangria() {
    const hoje = new Date().toISOString().slice(0, 10);

    const res = await this.dbService.db?.query(
      `SELECT id FROM caixa WHERE DATE(data_abertura) = ? AND data_fechamento IS NULL LIMIT 1`,
      [hoje]
    );

    const caixaId = res?.values?.[0]?.id;

    if (!caixaId) {
      const toast = await this.toastCtrl.create({
        message: 'Nenhum caixa aberto encontrado!',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    await this.dbService.db?.run(
      `INSERT INTO sangrias (valor, motivo, data, caixa_id) VALUES (?, ?, ?, ?)`,
      [this.valor, this.motivo, new Date().toISOString(), caixaId]
    );

    const toast = await this.toastCtrl.create({
      message: 'Sangria registrada com sucesso!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

    this.valor = 0;
    this.motivo = '';

    await this.carregarSangriasDoDia();
  }
  async carregarSangriasDoDia() {
    const hoje = new Date().toISOString().slice(0, 10);

    const res = await this.dbService.db?.query(
      `SELECT valor, motivo, data FROM sangrias WHERE DATE(data) = ? ORDER BY data DESC`,
      [hoje]
    );

    this.sangriasDoDia = res?.values || [];
  }
}
