import { Injectable } from '@angular/core';
import {
    CapacitorSQLite,
    SQLiteConnection,
    SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { Pedido } from '../models/pedido';
import { Cliente } from '../models/cliente';
import { Produto } from '../models/produto';

@Injectable({
    providedIn: 'root'
})
export class SqliteService {

    sqliteConnection: SQLiteConnection;
    db: SQLiteDBConnection | null = null;

    constructor() {
        this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    }

    async initDb() {
        try {
            if (Capacitor.getPlatform() === 'web') {
                const jeepEl = document.querySelector('jeep-sqlite');
                if (jeepEl != null) {
                    await customElements.whenDefined('jeep-sqlite');
                    await CapacitorSQLite.initWebStore();
                } else {
                    throw new Error('Elemento jeep-sqlite não encontrado no DOM');
                }
            }

            this.db = await this.sqliteConnection.createConnection('restauranteDB', false, 'no-encryption', 1, false);
            await this.db.open();
            await this.createTables();
        } catch (err) {
            console.error('Erro ao iniciar DB:', err);
        }
    }

    async createTables() {
        if (!this.db) return;

        const sqlCliente = `
            CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            telefone TEXT,
            email TEXT
            );
        `;
        const sqlEstoque = `
            CREATE TABLE IF NOT EXISTS estoque (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                produto_id INTEGER NOT NULL,
                quantidade INTEGER NOT NULL,
                valor_pago REAL NOT NULL,
                FOREIGN KEY (produto_id) REFERENCES produtos(id)
            );
        `;
        const sqlPedidos = `
            CREATE TABLE IF NOT EXISTS pedidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                itens TEXT NOT NULL,
                total REAL NOT NULL,
                tipo TEXT NOT NULL,
                status TEXT NOT NULL,
                forma_pagamento TEXT,
                valor_pago REAL,
                cliente_id INTEGER,
                data TEXT  NOT NULL,
                mesa_id INTEGER,
                FOREIGN KEY (cliente_id) REFERENCES clientes(id)
            );
        `;
        const sqlProdutos = `
            CREATE TABLE IF NOT EXISTS produtos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT,
                valor_unitario REAL NOT NULL,
                foto_path TEXT
            );
        `;
        const sqlCaixa = `
            CREATE TABLE IF NOT EXISTS caixa (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data_abertura TEXT NOT NULL,
            valor_abertura REAL NOT NULL,
            valor_fechamento REAL,
            data_fechamento TEXT,
            total_dinheiro REAL DEFAULT 0,
            total_pix REAL DEFAULT 0,
            total_debito REAL DEFAULT 0,
            total_credito REAL DEFAULT 0,
            observacoes TEXT,
            observacoes_fechamento TEXT
            )
        `;
        const produtosPadrao = [
            { nome: 'Gatorade (sabores)', descricao: 'Bebida isotonica saborizada', valor_unitario: 8.00, foto_path: 'assets/images/produtos/gatorade.jpg' },
            { nome: 'H2O limão', descricao: 'Bebida sabor limão', valor_unitario: 7.00, foto_path: 'assets/images/produtos/h2o-limao.jpg' },
            { nome: 'Red Bull Lt', descricao: 'Energetico em lata', valor_unitario: 10.00, foto_path: 'assets/images/produtos/red-bull-lt.jpg' },

            { nome: 'Agua Tônica Lt 350ml', descricao: 'Agua Tônica em lata 350ml', valor_unitario: 5.00, foto_path: 'assets/images/produtos/agua-tonica-350ml.jpg' },
            { nome: 'Agua Mineral 500ml', descricao: 'Agua mineral 500ml', valor_unitario: 3.00, foto_path: 'assets/images/produtos/agua-mineral-500ml.jpg' },
            { nome: 'Agua Mineral com gás 500ml', descricao: 'Agua mineral 500ml', valor_unitario: 4.00, foto_path: 'assets/images/produtos/agua-mineral-com-gas-500ml.jpg' },

            { nome: 'Pepsi 2L', descricao: 'Refrigerante de sabor cola 2L', valor_unitario: 10.00, foto_path: 'assets/images/produtos/pepsi-2l.jpg' },
            { nome: 'Sukita laranja 2L', descricao: 'Refrigerante de sabor laranja 2L', valor_unitario: 10.00, foto_path: 'assets/images/produtos/sukita-laranja-2l.jpg' },

            { nome: 'Coca-Cola Lt 350ml', descricao: 'Refrigerante de sabor cola em lata 350ml', valor_unitario: 5.00, foto_path: 'assets/images/produtos/coca-cola-350ml.jpg' },
            { nome: 'Coca-Cola 600ml', descricao: 'Refrigerante de sabor cola PET 600ml', valor_unitario: 7.00, foto_path: 'assets/images/produtos/coca-cola-600ml.jpg' },
            { nome: 'Coca-Cola 1L', descricao: 'Refrigerante de sabor cola em lata 350ml', valor_unitario: 9.00, foto_path: 'assets/images/produtos/coca-cola-1l.jpg' },
            { nome: 'Coca-Cola 2L', descricao: 'Refrigerante de sabor cola PET 2L', valor_unitario: 12.00, foto_path: 'assets/images/produtos/coca-cola-2l.jpg' },

            { nome: 'Guaraná Antártica Lt 350ml', descricao: 'Refrigerante de guaraná em lata 350ml', valor_unitario: 5.00, foto_path: 'assets/images/produtos/guarana-antartica-350ml.jpg' },
            { nome: 'Guaraná Antártica zero Lt 350ml', descricao: 'Refrigerante de guaraná zero açucar em lata 350ml', valor_unitario: 5.00, foto_path: 'assets/images/produtos/guarana-antartica-zero-350ml.jpg' },
            { nome: 'Guaraná Antártica 2L', descricao: 'Refrigerante de guaraná 2L', valor_unitario: 10.00, foto_path: 'assets/images/produtos/guarana-antartica-2l.jpg' },
            { nome: 'Guaraná Antártica  Zero 2L', descricao: 'Refrigerante de guaraná zero acucar 2L', valor_unitario: 10.00, foto_path: 'assets/images/produtos/guarana-antartica-zero-2l.jpg' },

            { nome: 'Mineiro Lt 350ml', descricao: 'Refrigerante de guaraná em lata 350ml', valor_unitario: 5.00, foto_path: 'assets/images/produtos/mineiro-350ml.jpg' },
            { nome: 'Mineiro 600ml', descricao: 'Refrigerante de guaraná retornável', valor_unitario: 7.00, foto_path: 'assets/images/produtos/mineiro-600ml.jpg' },
            { nome: 'Mineiro 2L', descricao: 'Refrigerante de guaraná PET 2L', valor_unitario: 10.00, foto_path: 'assets/images/produtos/mineiro-2l.jpg' },

            { nome: 'Soda limonada 2L', descricao: 'Refrigerante de limão PET 2L', valor_unitario: 10.00, foto_path: 'assets/images/produtos/soda-limonada-2l.jpg' },

            { nome: 'Budweiser Ln 330ml', descricao: 'Cerveja Budweiser long neck 330ml', valor_unitario: 7.00, foto_path: 'assets/images/produtos/budweiser-330ml.jpg' },
            { nome: 'Budweiser 600ml', descricao: 'Cerveja Budweiser 600ml', valor_unitario: 12.00, foto_path: 'assets/images/produtos/budweiser-600ml.jpg' },
            { nome: 'Budweiser 990ml', descricao: 'Cerveja Budweiser 990ml', valor_unitario: 14.00, foto_path: 'assets/images/produtos/budweiser-990ml.jpg' },

            { nome: 'Stella Artois Ln 330ml', descricao: 'Cerveja Stella Artois long neck 330ml', valor_unitario: 8.00, foto_path: 'assets/images/produtos/stella-artois-330ml.jpg' },
            { nome: 'Stella Artois 600ml', descricao: 'Cerveja Stella Artois 600ml', valor_unitario: 18.00, foto_path: 'assets/images/produtos/stella-artois-600ml.jpg' },

            { nome: 'Original litrinho', descricao: 'Cerveja Antártica original em lata 350ml', valor_unitario: 5.00, foto_path: 'assets/images/produtos/original-litrinho.jpg' },
            { nome: 'Original 600ml', descricao: 'Cerveja Antártica original 600ml', valor_unitario: 16.00, foto_path: 'assets/images/produtos/original-600ml.jpg' },

            { nome: 'Skol Lt 350ml', descricao: 'Cerveja Skol em lata 350ml', valor_unitario: 5.00, foto_path: 'assets/images/produtos/skol-350ml.jpg' },
            { nome: 'Skol 600ml', descricao: 'Cerveja Skol retornável 600ml', valor_unitario: 12.00, foto_path: 'assets/images/produtos/skol-600ml.jpg' },
            { nome: 'Skol 1L', descricao: 'Cerveja Skol retornável 1L', valor_unitario: 14.00, foto_path: 'assets/images/produtos/skol-1l.jpg' },

            { nome: 'Skol Puro Malte Lt 350ml', descricao: 'Cerveja Skol puro malte em lata 350ml', valor_unitario: 5.00, foto_path: 'assets/images/produtos/skol-puro-malte-350ml.jpg' },
            { nome: 'Skol Puro Malte 600ml', descricao: 'Cerveja Skol Puro Malte retornável 600ml', valor_unitario: 12.00, foto_path: 'assets/images/produtos/skol-puro-malte-600ml.jpg' },
            { nome: 'Skol Puro Malte 1L', descricao: 'Cerveja Skol Puro Malte retornável 1L', valor_unitario: 14.00, foto_path: 'assets/images/produtos/skol-puro-malte-1l.jpg' },

            { nome: 'Antártica Lt 350ml', descricao: 'Cerveja Antártica em lata 350ml', valor_unitario: 5.00, foto_path: 'assets/images/produtos/antartica-350ml.jpg' },
            { nome: 'Antártica 600ml', descricao: 'Cerveja Antártica retornável 600ml', valor_unitario: 12.00, foto_path: 'assets/images/produtos/antartica-600ml.jpg' },

            { nome: 'Brahma Lt 350ml', descricao: 'Cerveja Brahma em lata 350ml', valor_unitario: 5.00, foto_path: 'assets/images/produtos/brahma-350ml.jpg' },
            { nome: 'Brahma 600ml', descricao: 'Cerveja Brahma retornável 600ml', valor_unitario: 12.00, foto_path: 'assets/images/produtos/brahma-600ml.jpg' },
            { nome: 'Brahma 1L', descricao: 'Cerveja Brahma retornável 1L', valor_unitario: 14.00, foto_path: 'assets/images/produtos/brahma-1l.jpg' },

            { nome: 'Brahma duplo malte 600ml', descricao: 'Cerveja Brahma duplo malte retornável 600ml', valor_unitario: 13.00, foto_path: 'assets/images/produtos/brahma-duplo-malte-600ml.jpg' },
            { nome: 'Brahma duplo malte 1L', descricao: 'Cerveja Brahma duplo malte retornável 1L', valor_unitario: 14.00, foto_path: 'assets/images/produtos/brahma-duplo-malte-1l.jpg' },

            { nome: 'Bohemia litrinho', descricao: 'Cerveja Bohemia litrinho', valor_unitario: 5.00, foto_path: 'assets/images/produtos/bohemia-litrinho.jpg' },
            { nome: 'Bohemia 600ml', descricao: 'Cerveja Bohemia retornável 600ml', valor_unitario: 12.00, foto_path: 'assets/images/produtos/bohemia-600ml.jpg' },
            { nome: 'Bohemia 990ml', descricao: 'Cerveja Bohemia retornável 990ml', valor_unitario: 14.00, foto_path: 'assets/images/produtos/bohemia-990ml.jpg' },

            { nome: 'Spaten 600ml', descricao: 'Cerveja Spaten retornável 600ml', valor_unitario: 17.00, foto_path: 'assets/images/produtos/spaten-600ml.jpg' },
            { nome: 'Amstel 269ml', descricao: 'Cerveja Amstel lata 269ml', valor_unitario: 5.00, foto_path: 'assets/images/produtos/amstel-269ml.jpg' },

            { nome: 'Cigarro picado de 1', descricao: 'Cigarro picado varias marcas', valor_unitario: 1.00, foto_path: 'assets/images/produtos/cigarro-picado-1.jpg' },
            { nome: 'Cigarro picado de 2', descricao: 'Cigarro picado varias marcas', valor_unitario: 2.00, foto_path: 'assets/images/produtos/cigarro-picado-2.jpg' },
            { nome: 'Doce variado', descricao: 'Doces de varios sabores', valor_unitario: 1.00, foto_path: 'assets/images/produtos/doce-variado.jpg' },

            { nome: 'Marmitex Padrão', descricao: 'Self service no local + proteina', valor_unitario: 25.00, foto_path: 'assets/images/produtos/marmitex-padrao.jpg' },

            { nome: 'Contra filé', descricao: 'Espetinho de contra filé bovino', valor_unitario: 10.00, foto_path: 'assets/images/produtos/contra-file.jpg' },
            { nome: 'Cupim', descricao: 'Espetinho de cupim bovino', valor_unitario: 10.00, foto_path: 'assets/images/produtos/cupim.jpg' },
            { nome: 'Picanha montada', descricao: 'Espetinho de carne bovina montada', valor_unitario: 10.00, foto_path: 'assets/images/produtos/picanha-montada.jpg' },
            { nome: 'Frango com bacon', descricao: 'Espetinho de file de frango com bacon', valor_unitario: 10.00, foto_path: 'assets/images/produtos/frango-bacon.jpg' },

            { nome: 'Frango Assado', descricao: 'Frango assado inteiro com batatas', valor_unitario: 50.00, foto_path: 'assets/images/produtos/frango-assado.jpg' },
            { nome: 'Pernil Assado', descricao: 'Pedaço de pernil assado', valor_unitario: 28.00, foto_path: 'assets/images/produtos/pernil-assado.jpg' },
            { nome: 'Coxa e Sobrecoxa Assada', descricao: 'Coxa e sobrecoxa assada com batatas', valor_unitario: 25.00, foto_path: 'assets/images/produtos/coxa-sobrecoxa-assada.jpg' }
        ];

        const sqlSangria = `
        CREATE TABLE IF NOT EXISTS sangrias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            valor REAL NOT NULL,
            motivo TEXT,
            data TEXT NOT NULL,
            caixa_id INTEGER,
            FOREIGN KEY (caixa_id) REFERENCES caixa(id)
        )
        `;

        await this.db.execute(sqlEstoque);
        await this.db.execute(sqlPedidos);
        await this.db.execute(sqlCliente);
        await this.db.execute(sqlProdutos);
        await this.db.execute(sqlCaixa);
        await this.db.execute(sqlSangria);

        await this.addProdutosPadrao(produtosPadrao);
    }

    private async addProdutosPadrao(produtosPadrao: { nome: string; descricao: string; valor_unitario: number, foto_path: string }[]) {
        if (!this.db) return;

        for (const p of produtosPadrao) {
            const sql = `INSERT INTO produtos (nome, descricao, valor_unitario, foto_path) VALUES (?, ?, ?, ?)`;
            await this.db.run(sql, [p.nome, p.descricao, p.valor_unitario, p.foto_path]);
        }
    }

    async addInsumo(produtoId: number, quantidade: number, valorPago: number) {
        if (!this.db) return;
        const sql = `INSERT INTO estoque (nome, quantidade, alerta_minimo) VALUES (?, ?, ?)`;
        await this.db.run(sql, [produtoId, quantidade, valorPago]);
    }

    async getInsumos() {
        if (!this.db) return [];
        const res = await this.db.query(`SELECT * FROM estoque`);
        return res.values || [];
    }

    async salvarPedido(pedido: Pedido): Promise<number> {
        if (!this.db) return 0;

        const insert = `
        INSERT INTO pedidos (
            itens, total, tipo, status, forma_pagamento,
            valor_pago, cliente_id, data, mesa_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const values = [
            pedido.itens, // JSON.stringify dos produtos com id e qtd
            pedido.total,
            pedido.tipo,
            pedido.status,
            pedido.forma_pagamento || null,
            pedido.valor_pago || null,
            pedido.cliente_id || null,
            pedido.data,
            pedido.mesa_id || null
        ];

        const result = await this.db!.run(insert, values);
        return result.changes?.lastId || 0;
    }

    async listarPedidos(): Promise<Pedido[]> {
        if (!this.db) [];

        const result = await this.db!.query('SELECT * FROM pedidos ORDER BY data DESC');
        return result.values as Pedido[];
    }

    async listarClientes(): Promise<Cliente[]> {
        if (!this.db) return [];

        const result = await this.db!.query('SELECT * FROM clientes ORDER BY nome ASC');
        return result.values || [];
    }

    async listarClientesDetalhados(): Promise<{ id: number; nome: string; telefone?: string; email?: string }[]> {
        if (!this.db) return [];

        const result = await this.db!.query('SELECT * FROM clientes ORDER BY nome ASC');

        return result.values || [];
    }

    async adicionarCliente(nome: string, telefone: string, email: string) {
        if (!this.db) return;

        const sql = `
            INSERT INTO clientes (nome, telefone, email)
            VALUES (?, ?, ?)
        `;
        await this.db!.run(sql, [nome, telefone, email]);
    }

    async listarProdutos(): Promise<Produto[]> {
        if (!this.db) return [];

        const result = await this.db!.query('SELECT * FROM produtos ORDER BY nome ASC');

        return result.values || [];
    }

    async carregarEstoqueQuery() {
        if (!this.db) return [];

        const sql = `
            SELECT 
            estoque.id, 
            estoque.produto_id,
            produtos.nome AS nome,
            estoque.quantidade,
            estoque.valor_pago
            FROM estoque
            JOIN produtos ON estoque.produto_id = produtos.id
            ORDER BY produtos.nome
        `;

        const result = await this.db.query(sql);
        return result.values || [];
    }

    async carregarPedidosQuery() {
        if (!this.db) return [];

        const result = await this.db!.query('SELECT p.*, c.nome AS cliente_nome FROM pedidos p LEFT JOIN clientes c ON c.id = p.cliente_id ORDER BY p.data DESC');

        return result.values || [];
    }

    async carregarMesasQuery() {
        if (!this.db) return [];

        const result = await this.db!.query(`SELECT id, mesa_id, status FROM pedidos WHERE tipo = 'local' AND status = 'em_andamento' AND mesa_id IS NOT NULL`);

        return result.values || [];
    }
    async exportarDados(dataInicio: string, dataFim: string) {
        const pedidos = await this.db?.query(`
        SELECT * FROM pedidos WHERE data BETWEEN ? AND ?
    `, [dataInicio, dataFim]);

        const caixa = await this.db?.query(`
        SELECT * FROM caixa WHERE data_abertura BETWEEN ? AND ?
    `, [dataInicio, dataFim]);

        const sangrias = await this.db?.query(`
        SELECT * FROM sangrias WHERE data BETWEEN ? AND ?
    `, [dataInicio, dataFim]);

        const contas = await this.db?.query(`
        SELECT * FROM pedidos
        WHERE status = 'na_conta' AND data BETWEEN ? AND ?
    `, [dataInicio, dataFim]);

        return {
            pedidos: pedidos?.values || [],
            caixa: caixa?.values || [],
            sangrias: sangrias?.values || [],
            contas: contas?.values || []
        };
    }
    async limparDados() {
        const tables = ['pedidos', 'caixa', 'sangrias'];
        for (const t of tables) {
            await this.db?.run(`DELETE FROM ${t}`);
        }
    }

}
