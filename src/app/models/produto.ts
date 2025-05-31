export interface Produto {
    alerta_minimo: number;
    id: number;
    nome: string;
    descricao?: string;
    valor_unitario: number;
    foto_path: string;
}