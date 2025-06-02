export interface Estoque {
    id: number;
    produto_id: number;
    nome: string;
    quantidade_total: number;
    valor_pago: number;
    alerta_minimo: number;
    foto_path?: string;
    preco_venda?: number;
}
