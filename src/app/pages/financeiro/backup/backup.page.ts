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
    alert('DEBUG: Função iniciarLimpezaGeral() chamada');

    try {
      alert('DEBUG: Criando primeiro alert...');

      // Primeira confirmação simples
      const confirmacao1 = confirm(`⚠️ ATENÇÃO - LIMPEZA GERAL ⚠️
      
ESTA AÇÃO É IRREVERSÍVEL!

Todos os dados das seguintes tabelas serão PERMANENTEMENTE EXCLUÍDOS:
• Pedidos
• Caixa  
• Sangrias
• Contas
• Estoque

Certifique-se de ter feito o BACKUP antes de continuar!

Deseja continuar?`);

      if (!confirmacao1) {
        alert('DEBUG: Usuário cancelou primeira confirmação');
        return;
      }

      alert('DEBUG: Primeira confirmação OK, solicitando senha...');

      // Solicitar senha
      const senha = prompt('Digite a senha de administrador:');

      if (!senha) {
        alert('DEBUG: Usuário cancelou entrada de senha');
        return;
      }

      alert(`DEBUG: Senha digitada, verificando... (senha: ${senha})`);

      if (senha !== this.senhaAdmin) {
        alert('❌ Senha incorreta! Acesso negado.');
        alert('DEBUG: Senha incorreta');
        return;
      }

      alert('DEBUG: Senha correta, indo para confirmação final...');
      this.confirmarLimpezaDebug();

    } catch (error) {
      alert(`DEBUG: Erro em iniciarLimpezaGeral: ${error}`);
      console.error('Erro:', error);
    }
  }

  async confirmarLimpezaDebug() {
    alert('DEBUG: Função confirmarLimpezaDebug() chamada');

    try {
      const confirmacao2 = confirm(`🔥 CONFIRMAÇÃO FINAL 🔥

ÚLTIMA CHANCE!

Você tem certeza absoluta de que deseja excluir TODOS OS DADOS?

Esta ação não pode ser desfeita!

Confirmar exclusão?`);

      if (!confirmacao2) {
        alert('DEBUG: Usuário cancelou confirmação final');
        return;
      }

      alert('DEBUG: Confirmação final OK, executando limpeza...');
      this.executarLimpezaDebug();

    } catch (error) {
      alert(`DEBUG: Erro em confirmarLimpezaDebug: ${error}`);
      console.error('Erro:', error);
    }
  }

  async executarLimpezaDebug() {
    alert('DEBUG: Função executarLimpezaDebug() chamada');

    try {
      alert('DEBUG: Iniciando limpeza...');

      // Tentar executar limpeza com tratamento de transação
      try {
        await this.sqliteService.limparDadosGeral();
        alert('DEBUG: Limpeza executada com sucesso!');
      } catch (transactionError) {
        alert(`DEBUG: Erro de transação detectado: ${transactionError}`);

        // Tentar método alternativo se houver problema de transação
        if (transactionError) {
          alert('DEBUG: Tentando método alternativo de limpeza...');
          await this.executarLimpezaAlternativa();
        } else {
          throw transactionError;
        }
      }

      // Sucesso
      const toast = await this.toastCtrl.create({
        message: '✅ Limpeza geral concluída com sucesso!',
        duration: 4000,
        color: 'success'
      });
      await toast.present();

      alert('✅ Limpeza concluída! Todas as tabelas foram limpas.');

    } catch (error) {
      alert(`DEBUG: Erro ao executar limpeza: ${error}`);
      console.error('Erro na limpeza:', error);

      const toast = await this.toastCtrl.create({
        message: 'Erro ao executar limpeza geral.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  // Método alternativo para limpeza sem usar transações complexas
  async executarLimpezaAlternativa() {
    alert('DEBUG: Executando limpeza alternativa...');

    try {
      // Lista das tabelas para limpar
      const tabelas = ['pedidos', 'caixa', 'sangrias', 'contas', 'estoque'];

      for (const tabela of tabelas) {
        alert(`DEBUG: Limpando tabela: ${tabela}`);

        try {
          // Executar DELETE diretamente para cada tabela
          const query = `DELETE FROM ${tabela}`;
          await this.sqliteService.db?.query(query);
          alert(`DEBUG: Tabela ${tabela} limpa com sucesso`);
        } catch (tabelaError) {
          alert(`DEBUG: Erro ao limpar tabela ${tabela}: ${tabelaError}`);
          // Continua com as outras tabelas mesmo se uma falhar
        }
      }

      alert('DEBUG: Limpeza alternativa concluída');

    } catch (error) {
      alert(`DEBUG: Erro na limpeza alternativa: ${error}`);
      throw error;
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



}