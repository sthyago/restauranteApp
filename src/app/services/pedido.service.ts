import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PedidoService {
    // Subject para notificar sobre pedidos finalizados
    private pedidoFinalizadoSource = new Subject<void>();
    pedidoFinalizado$ = this.pedidoFinalizadoSource.asObservable();

    // Método para emitir o evento
    notificarPedidoFinalizado() {
        this.pedidoFinalizadoSource.next();
    }
}