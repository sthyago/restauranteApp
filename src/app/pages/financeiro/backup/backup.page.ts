import { Component } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import * as JSZip from 'jszip';
import { format } from 'date-fns';
import { ToastController, AlertController } from '@ionic/angular';

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

  // Senha de administrador (considere mover para um serviço de configuração)
  private senhaAdmin = 'but23eco'; // ALTERE PARA SUA SENHA

  constructor(
    private sqliteService: SqliteService,
    private toastCtrl: ToastController,
    private alertController: AlertController
  ) { }

  async gerarBackup() {
    try {
      if (!this.dataInicio || !this.dataFim) {
        const alerta = await this.toastCtrl.create({
          message: 'Selecione o período desejado.',
          duration: 2000,
          color: 'warning'
        });
        await alerta.present();
        return;
      }

      const dataInicioObj = new Date(this.dataInicio);
      const dataFimObj = new Date(this.dataFim);

      if (isNaN(dataInicioObj.getTime()) || isNaN(dataFimObj.getTime())) {
        alert('Erro: Datas inválidas');
        return;
      }

      if (dataInicioObj > dataFimObj) {
        alert('Erro: Data início deve ser anterior à data fim');
        return;
      }

      // Usar o mesmo formato que você usa no app
      const dataInicioFormatada = dataInicioObj.toLocaleDateString('sv-SE');
      const dataFimFormatada = dataFimObj.toLocaleDateString('sv-SE');

      const dados = await this.sqliteService.exportarDados(dataInicioFormatada, dataFimFormatada);

      if (!dados) {
        const toast = await this.toastCtrl.create({
          message: 'Nenhum dado encontrado no período selecionado.',
          duration: 2000,
          color: 'warning'
        });
        await toast.present();
        return;
      }

      const json = JSON.stringify(dados, null, 2);
      const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
      let filename = `backup-${timestamp}`;
      let finalData: string;
      let encoding = Encoding.UTF8;

      if (this.compactarZip) {
        // Criar arquivo ZIP
        const zip = new JSZip();
        zip.file(`backup-${timestamp}.json`, json);

        // Gerar ZIP como ArrayBuffer
        const zipArrayBuffer = await zip.generateAsync({
          type: 'arraybuffer',
          compression: 'DEFLATE',
          compressionOptions: {
            level: 6
          }
        });

        // Converter ArrayBuffer para Base64
        finalData = this.arrayBufferToBase64Alt(zipArrayBuffer);
        filename = `${filename}.zip`;

        // Para arquivos binários, usar encoding UTF8 mas com dados em Base64
        encoding = Encoding.UTF8;
      } else {
        // Arquivo JSON normal
        finalData = json;
        filename = `${filename}.json`;
        encoding = Encoding.UTF8;
      }

      // Salvar arquivo
      await Filesystem.writeFile({
        path: filename,
        data: finalData,
        directory: Directory.Documents,
        encoding: encoding
      });

      // Compartilhar se solicitado
      if (this.compartilharDepois) {
        const fileUri = await Filesystem.getUri({
          directory: Directory.Documents,
          path: filename
        });

        await Share.share({
          title: 'Backup de Dados',
          url: fileUri.uri,
          dialogTitle: 'Compartilhar backup'
        });
      }

      const toast = await this.toastCtrl.create({
        message: `Backup salvo: ${filename}`,
        duration: 4000,
        color: 'success'
      });
      await toast.present();

    } catch (error) {
      alert(`Erro ao gerar backup: ${error}`);
      console.error('Erro no backup:', error);

      const toast = await this.toastCtrl.create({
        message: 'Erro ao gerar backup. Tente novamente.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async iniciarLimpezaGeral() {
    const alert = await this.alertController.create({
      header: '⚠️ ATENÇÃO - LIMPEZA GERAL',
      message: `
        <div style="text-align: center; padding: 10px;">
          <ion-icon name="warning" style="font-size: 48px; color: #ff6b6b; margin-bottom: 15px;"></ion-icon>
          <p style="font-weight: bold; color: #ff6b6b; margin-bottom: 10px;">
            ESTA AÇÃO É IRREVERSÍVEL!
          </p>
          <p style="margin-bottom: 15px;">
            Todos os dados das seguintes tabelas serão <strong>PERMANENTEMENTE EXCLUÍDOS</strong>:
          </p>
          <ul style="text-align: left; margin-bottom: 15px;">
            <li>• Pedidos</li>
            <li>• Caixa</li>
            <li>• Sangrias</li>
            <li>• Contas</li>
            <li>• Estoque</li>
          </ul>
          <p style="font-weight: bold; color: #ff6b6b;">
            Certifique-se de ter feito o BACKUP antes de continuar!
          </p>
        </div>
      `,
      cssClass: 'alert-danger',
      inputs: [
        {
          name: 'senha',
          type: 'password',
          placeholder: 'Digite a senha de administrador',
          attributes: {
            style: 'text-align: center; font-size: 16px; padding: 10px; margin-top: 10px;'
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
          handler: () => {
            console.log('Limpeza cancelada');
          }
        },
        {
          text: 'CONFIRMAR LIMPEZA',
          cssClass: 'alert-button-confirm-danger',
          handler: (data) => {
            if (data.senha === this.senhaAdmin) {
              this.confirmarLimpeza();
            } else {
              this.senhaIncorreta();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmarLimpeza() {
    const confirmAlert = await this.alertController.create({
      header: '🔥 CONFIRMAÇÃO FINAL',
      message: `
        <div style="text-align: center; padding: 15px;">
          <p style="font-size: 18px; font-weight: bold; color: #ff6b6b; margin-bottom: 15px;">
            ÚLTIMA CHANCE!
          </p>
          <p style="margin-bottom: 15px;">
            Você tem certeza absoluta de que deseja excluir TODOS OS DADOS?
          </p>
          <p style="font-weight: bold; color: #333;">
            Esta ação não pode ser desfeita!
          </p>
        </div>
      `,
      cssClass: 'alert-danger',
      buttons: [
        {
          text: 'NÃO, CANCELAR',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'SIM, EXCLUIR TUDO',
          cssClass: 'alert-button-confirm-danger',
          handler: () => {
            this.executarLimpeza();
          }
        }
      ]
    });

    await confirmAlert.present();
  }

  async executarLimpeza() {
    try {
      // Mostrar loading
      const loading = await this.toastCtrl.create({
        message: 'Executando limpeza geral...',
        duration: 0,
        color: 'warning'
      });
      await loading.present();

      // Executar limpeza no banco
      await this.sqliteService.limparDadosGeral();

      await loading.dismiss();

      // Sucesso
      const toast = await this.toastCtrl.create({
        message: '✅ Limpeza geral concluída com sucesso!',
        duration: 4000,
        color: 'success'
      });
      await toast.present();

      alert('Limpeza concluída! Todas as tabelas foram limpas.');

    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Erro ao executar limpeza geral.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();

      alert(`Erro na limpeza: ${error}`);
      console.error('Erro na limpeza:', error);
    }
  }

  async senhaIncorreta() {
    const toast = await this.toastCtrl.create({
      message: '❌ Senha incorreta! Acesso negado.',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  }

  async compartilharBackup() {
    try {
      if (!this.caminhoBackup) {
        alert('Erro: Caminho do backup não definido');
        return;
      }

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

    } catch (error) {
      alert(`Erro ao compartilhar: ${JSON.stringify(error)}`);
    }
  }

  toggleDatePicker() {
    this.isDatePickerVisible = !this.isDatePickerVisible;
  }

  // Converter ArrayBuffer para Base64 (método correto para arquivos ZIP)
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const uint8Array = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }

  // Método alternativo caso o anterior não funcione
  private arrayBufferToBase64Alt(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
    return btoa(binary);
  }
}