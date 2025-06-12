import { Component, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Produto } from 'src/app/models/produto';
import { SqliteService } from 'src/app/services/sqlite.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-editar-produto',
  templateUrl: './editar-produto.page.html',
  standalone: false
})
export class EditarProdutoPage {
  @Input() produto!: Produto;
  produtoEditado: Produto = { id: 0, nome: '', descricao: '', valor_unitario: 0, foto_path: '', alerta_minimo: 0 };

  salvando = false;

  constructor(
    private modalCtrl: ModalController,
    private sqlite: SqliteService,
    private alertController: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    // Criar cópia para edição
    this.produtoEditado = { ...this.produto };
  }

  async salvarAlteracoes() {
    const confirmacao = await this.confirmarAlteracoes();

    if (!confirmacao) return;

    this.salvando = true;

    try {
      await this.sqlite.atualizarProduto(this.produtoEditado);
      this.mostrarAlerta('success', 'Produto atualizado com sucesso!');
      this.modalCtrl.dismiss({ atualizado: true });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      this.mostrarAlerta('danger', 'Falha ao atualizar produto. Tente novamente.');
    } finally {
      this.salvando = false;
    }
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }

  private async mostrarAlerta(color: string, mensagem: string) {

    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 2000,
      position: 'middle',
      color: color
    });
    await toast.present();
  }
  private async confirmarAlteracoes(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Confirmar',
        message: 'Tem certeza que deseja salvar as alterações?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Salvar',
            handler: () => resolve(true)
          }
        ]
      });

      await alert.present();
    });
  }
}