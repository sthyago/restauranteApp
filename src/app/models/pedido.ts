import { FormaPagamento, StatusPedido, TipoPedido } from "./tipos";

export interface Pedido {
    id?: number;
    itens: any[];
    total: number;
    tipo: TipoPedido;
    status: StatusPedido;
    forma_pagamento?: FormaPagamento;
    valor_pago?: number;
    desconto?: number;
    cliente_id?: number;
    cliente_nome?: string;
    data: string; // ISO string
    mesa_identificacao?: string;
    origem?: string;
}
