export interface Mesa {
    id: number;
    status: 'aguardando' | 'ok' | 'finalizado';
    pedido_id: number;
}
