export interface Estoque {
    id: number;
    produto_id: number;
    nome: string;
    quantidade: number;
    valor_pago: number;
    alerta_minimo: number;
}
