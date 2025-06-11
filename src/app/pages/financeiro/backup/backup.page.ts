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
    try {
      alert('1. Iniciando geração de backup...');

      // Debug das datas RAW
      alert(`2. Data Início RAW: "${this.dataInicio}"`);
      alert(`3. Data Fim RAW: "${this.dataFim}"`);

      if (!this.dataInicio || !this.dataFim) {
        alert('4. ERRO: Datas não selecionadas');
        const alerta = await this.toastCtrl.create({
          message: 'Selecione o período desejado.',
          duration: 2000,
          color: 'warning'
        });
        await alerta.present();
        return;
      }

      // Validação e formatação das datas
      const dataInicioObj = new Date(this.dataInicio);
      const dataFimObj = new Date(this.dataFim);

      alert(`5. Data Início convertida: ${dataInicioObj.toString()}`);
      alert(`6. Data Fim convertida: ${dataFimObj.toString()}`);

      if (isNaN(dataInicioObj.getTime()) || isNaN(dataFimObj.getTime())) {
        alert('7. ERRO: Datas inválidas');
        return;
      }

      if (dataInicioObj > dataFimObj) {
        alert('8. ERRO: Data início maior que data fim');
        return;
      }

      // Usar o mesmo formato que você usa no app: toLocaleDateString('sv-SE')
      const dataInicioFormatada = dataInicioObj.toLocaleDateString('sv-SE');
      const dataFimFormatada = dataFimObj.toLocaleDateString('sv-SE');

      alert(`9. Data Início formatada (sv-SE): ${dataInicioFormatada}`);
      alert(`10. Data Fim formatada (sv-SE): ${dataFimFormatada}`);

      // Verificar se o serviço existe
      if (!this.sqliteService) {
        alert('11. ERRO: sqliteService é null/undefined');
        return;
      }

      if (typeof this.sqliteService.exportarDados !== 'function') {
        alert('12. ERRO: método exportarDados não existe');
        return;
      }

      alert('13. Serviço SQLite OK, chamando exportarDados...');

      const dados = await this.sqliteService.exportarDados(dataInicioFormatada, dataFimFormatada);

      alert(`14. Dados retornados: ${dados ? 'Sim' : 'Não (null/undefined)'}`);

      if (dados) {
        alert(`15. Tipo de dados: ${typeof dados}`);
        alert(`16. Dados detalhados: ${JSON.stringify(dados).substring(0, 200)}...`);

        // Verificar cada propriedade
        alert(`17. Pedidos: ${dados.pedidos ? dados.pedidos.length : 'undefined'} registros`);
        alert(`18. Caixa: ${dados.caixa ? dados.caixa.length : 'undefined'} registros`);
        alert(`19. Sangrias: ${dados.sangrias ? dados.sangrias.length : 'undefined'} registros`);
        alert(`20. Contas: ${dados.contas ? dados.contas.length : 'undefined'} registros`);
      }

      if (!dados) {
        alert('21. ERRO: Nenhum dado foi retornado do banco');
        const toast = await this.toastCtrl.create({
          message: 'Nenhum dado encontrado no período selecionado.',
          duration: 2000,
          color: 'warning'
        });
        await toast.present();
        return;
      }

      // Verificar se dados não está vazio
      if (typeof dados === 'object' && Object.keys(dados).length === 0) {
        alert('22. ERRO: Dados retornados estão vazios (objeto sem propriedades)');
        return;
      }

      alert('23. Convertendo dados para JSON...');
      const json = JSON.stringify(dados, null, 2);
      const filename = `backup-${format(new Date(), 'yyyyMMdd-HHmmss')}.json`;

      alert(`24. Nome do arquivo: ${filename}`);
      alert(`25. Tamanho do JSON: ${json.length} caracteres`);

      // Verificar permissões de escrita
      try {
        alert('26. Tentando escrever arquivo...');

        await Filesystem.writeFile({
          path: filename,
          data: json,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });

        alert('27. Arquivo escrito com sucesso!');

        // Verificar se arquivo foi criado
        try {
          const fileExists = await Filesystem.readFile({
            path: filename,
            directory: Directory.Documents,
            encoding: Encoding.UTF8
          });
          alert('28. Arquivo confirmado no sistema de arquivos');
        } catch (checkError) {
          alert(`29. ERRO ao verificar arquivo: ${JSON.stringify(checkError)}`);
        }

      } catch (writeError) {
        alert(`30. ERRO ao escrever arquivo: ${JSON.stringify(writeError)}`);
        return;
      }

      if (this.compactarZip) {
        alert('31. Compactação ZIP solicitada (não implementada)');
        // implementar compactação se necessário (ex: Capacitor Community ZIP plugin)
      }

      if (this.compartilharDepois) {
        try {
          alert('32. Tentando compartilhar arquivo...');

          const fileUri = await Filesystem.getUri({
            directory: Directory.Documents,
            path: filename
          });

          alert(`33. URI do arquivo: ${fileUri.uri}`);

          await Share.share({
            title: 'Backup de Dados',
            url: fileUri.uri,
            dialogTitle: 'Compartilhar backup'
          });

          alert('34. Compartilhamento iniciado');
        } catch (shareError) {
          alert(`35. ERRO ao compartilhar: ${JSON.stringify(shareError)}`);
        }
      }

      const toast = await this.toastCtrl.create({
        message: 'Backup gerado com sucesso!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      alert('36. Backup concluído com sucesso!');

    } catch (error) {
      alert(`37. ERRO GERAL: ${error}`);
      alert(`38. ERRO DETALHADO: ${JSON.stringify(error)}`);
      console.error('Erro no backup:', error);

      const toast = await this.toastCtrl.create({
        message: 'Erro ao gerar backup. Verifique os logs.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
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
    alert(`Seletor de data: ${this.isDatePickerVisible ? 'Visível' : 'Oculto'}`);
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