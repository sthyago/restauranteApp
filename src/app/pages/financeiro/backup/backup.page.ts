import { Component } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { format } from 'date-fns';
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

  // Senha de administrador (considere mover para um serviço de configuração)
  private senhaAdmin = 'but23eco'; // ALTERE PARA SUA SENHA
  private senhaTemporaria = ''; // Para armazenar temporariamente a senha digitada
  private aguardandoSenha = false;
  private confirmandoLimpeza = false;

  constructor(
    private sqliteService: SqliteService,
    private toastCtrl: ToastController
  ) { }

  async gerarBackup() {
    try {
      if (!this.dataInicio || !this.dataFim) {
        const alerta = await this.toastCtrl.create({
          message: 'Selecione o período desejado.',
          duration: 3000,
          color: 'warning',
          position: 'middle'
        });
        await alerta.present();
        return;
      }

      const dataInicioObj = new Date(this.dataInicio);
      const dataFimObj = new Date(this.dataFim);

      if (isNaN(dataInicioObj.getTime()) || isNaN(dataFimObj.getTime())) {
        const toast = await this.toastCtrl.create({
          message: 'Erro: Datas inválidas',
          duration: 3000,
          color: 'danger',
          position: 'middle'
        });
        await toast.present();
        return;
      }

      if (dataInicioObj > dataFimObj) {
        const toast = await this.toastCtrl.create({
          message: 'Erro: Data início deve ser anterior à data fim',
          duration: 3000,
          color: 'danger',
          position: 'middle'
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
          duration: 3000,
          color: 'warning',
          position: 'middle'
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
        message: `✅ Backup salvo: ${filename}`,
        duration: 4000,
        color: 'success',
        position: 'middle'
      });
      await toast.present();

    } catch (error) {
      console.error('Erro no backup:', error);

      const toast = await this.toastCtrl.create({
        message: 'Erro ao gerar backup. Tente novamente.',
        duration: 3000,
        color: 'danger',
        position: 'middle'
      });
      await toast.present();
    }
  }

  async iniciarLimpezaGeral() {
    try {
      // Primeira confirmação via toast
      const toast = await this.toastCtrl.create({
        message: `
          ⚠️ LIMPEZA GERAL - ATENÇÃO!
          
          Todos os dados serão PERMANENTEMENTE EXCLUÍDOS:
          • Pedidos • Caixa • Sangrias • Contas • Estoque
          
          Certifique-se de ter feito BACKUP!
          
          Toque novamente para confirmar ou aguarde para cancelar.
        `,
        duration: 8000,
        color: 'warning',
        position: 'middle',
        buttons: [
          {
            text: 'CONFIRMAR LIMPEZA',
            role: 'confirm',
            handler: () => {
              this.solicitarSenha();
            }
          },
          {
            text: 'Cancelar',
            role: 'cancel'
          }
        ]
      });

      await toast.present();

    } catch (error) {
      console.error('Erro em iniciarLimpezaGeral:', error);
      const toast = await this.toastCtrl.create({
        message: 'Erro ao iniciar limpeza.',
        duration: 3000,
        color: 'danger',
        position: 'middle'
      });
      await toast.present();
    }
  }

  async solicitarSenha() {
    this.aguardandoSenha = true;

    const toast = await this.toastCtrl.create({
      message: `
        🔐 AUTORIZAÇÃO NECESSÁRIA
        
        Digite a senha de administrador e toque em VERIFICAR:
        
        [A senha será solicitada via prompt do navegador]
      `,
      duration: 6000,
      color: 'primary',
      position: 'middle',
      buttons: [
        {
          text: 'VERIFICAR SENHA',
          handler: () => {
            this.verificarSenha();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.aguardandoSenha = false;
          }
        }
      ]
    });

    await toast.present();
  }

  verificarSenha() {
    const senha = prompt('Digite a senha de administrador:');

    if (!senha) {
      this.mostrarErroSenha('Senha não pode estar vazia');
      this.aguardandoSenha = false;
      return;
    }

    if (senha !== this.senhaAdmin) {
      this.mostrarErroSenha('Senha incorreta! Acesso negado.');
      this.aguardandoSenha = false;
      return;
    }

    this.aguardandoSenha = false;
    this.confirmarLimpezaFinal();
  }

  async mostrarErroSenha(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: `❌ ${mensagem}`,
      duration: 3000,
      color: 'danger',
      position: 'middle'
    });
    await toast.present();
  }

  async confirmarLimpezaFinal() {
    this.confirmandoLimpeza = true;

    const toast = await this.toastCtrl.create({
      message: `
        🔥 CONFIRMAÇÃO FINAL - ÚLTIMA CHANCE!
        
        Você tem certeza absoluta de que deseja excluir TODOS OS DADOS?
        
        Esta ação não pode ser desfeita!
        
        Toque em CONFIRMAR EXCLUSÃO para prosseguir.
      `,
      duration: 10000,
      color: 'danger',
      position: 'middle',
      buttons: [
        {
          text: 'CONFIRMAR EXCLUSÃO',
          handler: () => {
            this.executarLimpeza();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.confirmandoLimpeza = false;
          }
        }
      ]
    });

    await toast.present();
  }

  async executarLimpeza() {
    try {
      this.confirmandoLimpeza = false;

      // Mostrar toast de loading
      const loadingToast = await this.toastCtrl.create({
        message: '⏳ Executando limpeza... Por favor, aguarde...',
        duration: 0, // Indefinido
        color: 'medium',
        position: 'middle'
      });
      await loadingToast.present();

      // Lista das tabelas para limpar
      const tabelas = ['pedidos', 'caixa', 'sangrias', 'estoque'];
      let tabelasLimpas = 0;

      for (const tabela of tabelas) {
        try {
          const query = `DELETE FROM ${tabela}`;
          await this.sqliteService.db?.query(query);
          tabelasLimpas++;
        } catch (tabelaError) {
          console.error(`Erro ao limpar tabela ${tabela}:`, tabelaError);
          // Continua com as outras tabelas mesmo se uma falhar
        }
      }

      await loadingToast.dismiss();

      // Toast de sucesso
      const sucessoToast = await this.toastCtrl.create({
        message: `✅ Limpeza concluída! ${tabelasLimpas}/${tabelas.length} tabelas foram limpas com sucesso.`,
        duration: 5000,
        color: 'success',
        position: 'middle'
      });
      await sucessoToast.present();

    } catch (error) {
      console.error('Erro na limpeza:', error);

      const toast = await this.toastCtrl.create({
        message: '❌ Erro ao executar limpeza geral. Tente novamente.',
        duration: 4000,
        color: 'danger',
        position: 'middle'
      });
      await toast.present();
    }
  }

  async compartilharBackup() {
    try {
      if (!this.caminhoBackup) {
        const toast = await this.toastCtrl.create({
          message: 'Erro: Caminho do backup não definido',
          duration: 3000,
          color: 'danger',
          position: 'middle'
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

      const toast = await this.toastCtrl.create({
        message: '✅ Backup compartilhado com sucesso!',
        duration: 3000,
        color: 'success',
        position: 'middle'
      });
      await toast.present();

    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      const toast = await this.toastCtrl.create({
        message: 'Erro ao compartilhar backup.',
        duration: 3000,
        color: 'danger',
        position: 'middle'
      });
      await toast.present();
    }
  }

  toggleDatePicker() {
    this.isDatePickerVisible = !this.isDatePickerVisible;
  }
}