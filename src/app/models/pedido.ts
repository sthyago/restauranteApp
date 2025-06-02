import { FormaPagamento, StatusPedido, TipoPedido } from "./tipos";

export interface Pedido {
    id?: number;
    itens: any[];
    total: number;
    tipo: TipoPedido;
    status: StatusPedido;
    forma_pagamento?: FormaPagamento;
    valor_pago?: number;
    cliente_id?: number;
    data: string; // ISO string
    mesa_id?: number;
}
