export interface Produto {
    id: number;
    nome: string;
    descricao?: string;
    valor_unitario: number;
    foto_path: string;
}