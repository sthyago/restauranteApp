export interface ContaCliente {
    id: number;
    nome: string;
    pedidos: number[]; // lista de IDs de pedidos não pagos
}
