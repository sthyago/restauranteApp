import { Component } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
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
        const toast = await this.toastCtrl.create({
          message: 'Erro: Datas inválidas',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
        return;
      }

      if (dataInicioObj > dataFimObj) {
        const toast = await this.toastCtrl.create({
          message: 'Erro: Data início deve ser anterior à data fim',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
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

      // Arquivo JSON normal
      finalData = json;
      filename = `${filename}.json`;
      encoding = Encoding.UTF8;

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
    try {
      // Primeira confirmação
      const alert1 = await this.alertController.create({
        header: '⚠️ LIMPEZA GERAL',
        subHeader: 'ATENÇÃO - AÇÃO IRREVERSÍVEL!',
        message: `
          <div class="limpeza-warning">
            <p><strong>Todos os dados das seguintes tabelas serão PERMANENTEMENTE EXCLUÍDOS:</strong></p>
            <ul>
              <li>• Pedidos</li>
              <li>• Caixa</li>
              <li>• Sangrias</li>
              <li>• Contas</li>
              <li>• Estoque</li>
            </ul>
            <p><ion-text color="danger"><strong>Certifique-se de ter feito o BACKUP antes de continuar!</strong></ion-text></p>
          </div>
        `,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary'
          },
          {
            text: 'Continuar',
            cssClass: 'danger',
            handler: () => {
              this.solicitarSenha();
            }
          }
        ]
      });

      await alert1.present();

    } catch (error) {
      console.error('Erro em iniciarLimpezaGeral:', error);
      const toast = await this.toastCtrl.create({
        message: 'Erro ao iniciar limpeza.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async solicitarSenha() {
    const alert = await this.alertController.create({
      header: '🔐 Autorização Necessária',
      message: 'Digite a senha de administrador:',
      inputs: [
        {
          name: 'senha',
          type: 'password',
          placeholder: 'Senha do administrador',
          attributes: {
            maxlength: 20
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Verificar',
          cssClass: 'primary',
          handler: (data) => {
            if (!data.senha) {
              this.mostrarErroSenha('Senha não pode estar vazia');
              return false;
            }

            if (data.senha !== this.senhaAdmin) {
              this.mostrarErroSenha('Senha incorreta! Acesso negado.');
              return false;
            }

            this.confirmarLimpezaFinal();
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async mostrarErroSenha(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: `❌ ${mensagem}`,
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  }

  async confirmarLimpezaFinal() {
    const alert = await this.alertController.create({
      header: '🔥 CONFIRMAÇÃO FINAL',
      subHeader: 'ÚLTIMA CHANCE!',
      message: `
        <div class="confirmacao-final">
          <p><strong>Você tem certeza absoluta de que deseja excluir TODOS OS DADOS?</strong></p>
          <p><ion-text color="danger">Esta ação não pode ser desfeita!</ion-text></p>
        </div>
      `,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'CONFIRMAR EXCLUSÃO',
          cssClass: 'danger',
          handler: () => {
            this.executarLimpeza();
          }
        }
      ]
    });

    await alert.present();
  }

  async executarLimpeza() {
    try {
      // Mostrar loading
      const loading = await this.alertController.create({
        header: 'Executando Limpeza...',
        message: 'Por favor, aguarde...',
        backdropDismiss: false
      });
      await loading.present();

      // Lista das tabelas para limpar
      const tabelas = ['pedidos', 'caixa', 'sangrias', 'estoque'];

      for (const tabela of tabelas) {
        try {
          const query = `DELETE FROM ${tabela}`;
          await this.sqliteService.db?.query(query);
        } catch (tabelaError) {
          console.error(`Erro ao limpar tabela ${tabela}:`, tabelaError);
          // Continua com as outras tabelas mesmo se uma falhar
        }
      }

      await loading.dismiss();

      // Sucesso
      const sucessoAlert = await this.alertController.create({
        header: '✅ Limpeza Concluída',
        message: 'Todas as tabelas foram limpas com sucesso!',
        buttons: ['OK']
      });
      await sucessoAlert.present();

      const toast = await this.toastCtrl.create({
        message: '✅ Limpeza geral concluída com sucesso!',
        duration: 4000,
        color: 'success'
      });
      await toast.present();

    } catch (error) {
      console.error('Erro na limpeza:', error);

      const toast = await this.toastCtrl.create({
        message: 'Erro ao executar limpeza geral.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async compartilharBackup() {
    try {
      if (!this.caminhoBackup) {
        const toast = await this.toastCtrl.create({
          message: 'Erro: Caminho do backup não definido',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
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
      console.error('Erro ao compartilhar:', error);
      const toast = await this.toastCtrl.create({
        message: 'Erro ao compartilhar backup.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  toggleDatePicker() {
    this.isDatePickerVisible = !this.isDatePickerVisible;
  }
}