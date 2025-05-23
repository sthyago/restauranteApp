import { Component, OnInit } from '@angular/core';
import { Pedido } from 'src/app/models/pedido';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: false,
})
export class PedidosPage implements OnInit {
  statusFiltro: 'em_andamento' | 'na_conta' | 'finalizado' = 'em_andamento';

  pedidos: Pedido[] = []; // será carregado do SQLite
  pedidosFiltrados: any[] = [];

  constructor(private sqliteService: SqliteService) { }

  ngOnInit() {
    this.carregarPedidos();
  }

  ionViewWillEnter() {
    this.carregarPedidos();
  }

  filtrar() {
    this.pedidosFiltrados = this.pedidos.filter(p => p.status === this.statusFiltro);
  }

  // Atualiza a filtragem quando o usuário muda o segmento
  onSegmentChange() {
    this.filtrar();
  }

  async carregarPedidos() {
    const result = await this.sqliteService.carregarPedidosQuery();

    this.pedidos = result || [];
    this.filtrar();
  }
}
