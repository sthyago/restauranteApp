import { Component } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import * as JSZip from 'jszip';
import { format, formatISO } from 'date-fns';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-backup',
  templateUrl: './backup.page.html',
  styleUrls: ['./backup.page.scss'],
  standalone: false
})

export class BackupPage {
  compactarZip = false;
  limparAposExportar = false;
  caminhoBackup: string = '';
  mensagem = '';
  dataInicio: string = '';
  dataFim: string = '';
  compartilharDepois: boolean = false;
  isDatePickerVisible = false;

  constructor(private sqliteService: SqliteService, private toastCtrl: ToastController) { }

  async gerarBackup() {
    if (!this.dataInicio || !this.dataFim) {
      const alerta = await this.toastCtrl.create({
        message: 'Selecione o período desejado.',
        duration: 2000,
        color: 'warning'
      });
      await alerta.present();
      return;
    }

    const dataInicioFormatada = formatISO(new Date(this.dataInicio));
    const dataFimFormatada = formatISO(new Date(this.dataFim));

    const dados = await this.sqliteService.exportarDados(dataInicioFormatada, dataFimFormatada);

    if (dados) {
      const json = JSON.stringify(dados, null, 2);
      const filename = `backup-${format(new Date(), 'yyyyMMdd-HHmmss')}.json`;

      const filePath = `${Directory.Documents}/${filename}`;

      await Filesystem.writeFile({
        path: filename,
        data: json,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      if (this.compactarZip) {
        // implementar compactação se necessário (ex: Capacitor Community ZIP plugin)
      }

      if (this.compartilharDepois) {
        await Share.share({
          title: 'Backup de Dados',
          url: filePath,
          dialogTitle: 'Compartilhar backup'
        });
      }

      const toast = await this.toastCtrl.create({
        message: 'Backup gerado com sucesso!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    }
  }


  async compartilharBackup() {
    if (!this.caminhoBackup) return;

    const nomeArquivo = this.caminhoBackup.split('/').pop();
    const fileUri = await Filesystem.getUri({
      directory: Directory.Documents,
      path: this.caminhoBackup,
    });

    await Share.share({
      title: 'Backup de dados',
      text: 'Segue o backup exportado.',
      url: fileUri.uri,
      dialogTitle: 'Compartilhar backup'
    });
  }

  toggleDatePicker() {
    this.isDatePickerVisible = !this.isDatePickerVisible;
  }
}

// Utilitário para converter Blob em Base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
