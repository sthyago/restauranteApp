export interface Caixa {
    id?: number;
    data_abertura?: string,
    valor_abertura?: number,
    valor_fechamento?: number,
    data_fechamento?: string,
    total_dinheiro?: number,
    total_pix?: number,
    total_debito?: number,
    total_credito?: number,
    observacoes?: string,
    observacoes_fechamento?: string,
}