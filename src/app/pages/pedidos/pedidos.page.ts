import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Pedido } from 'src/app/models/pedido';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: false,
})
export class PedidosPage {
  statusFiltro: 'em_andamento' | 'na_conta' | 'finalizado' = 'em_andamento';

  pedidos: Pedido[] = [];
  pedidosFiltrados: any[] = [];

  constructor(private sqliteService: SqliteService, private router: Router) { }

  ionViewWillEnter() {
    this.carregarPedidos();
  }

  filtrar() {
    this.pedidosFiltrados = this.pedidos.filter(p => p.status === this.statusFiltro);
  }

  onSegmentChange() {
    this.filtrar();
  }

  async carregarPedidos() {
    const result = await this.sqliteService.carregarTodosPedidos();
    for (let index = 0; index < result.length; index++) {
      const element = result[index];
      if (element.cliente_id) {
        const res = await this.buscarNomeCliente(element.cliente_id);
        element.cliente_nome = res?.values?.[0]?.nome || '';
      }
    }

    this.pedidos = result || [];
    this.filtrar();
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'em_andamento': return 'Em Andamento';
      case 'na_conta': return 'Na Conta';
      case 'finalizado': return 'Finalizado';
      default: return status;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'em_andamento': return 'warning';
      case 'na_conta': return 'primary';
      case 'finalizado': return 'success';
      default: return 'medium';
    }
  }

  async buscarNomeCliente(id: number) {
    const result = await this.sqliteService.db?.query('SELECT clientes.nome FROM clientes WHERE id = ?', [id]);
    return result;
  }

  irParaFinalizado(pedido: Pedido) {
    if (pedido.status === 'em_andamento')
      this.router.navigateByUrl('/tabs/finalizar-pedido', { state: pedido });
  }
}
