import { EventEmitter, Injectable } from '@angular/core';
import {
    CapacitorSQLite,
    SQLiteConnection,
    SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { Pedido } from '../models/pedido';
import { Cliente } from '../models/cliente';
import { Produto } from '../models/produto';
import { FormaPagamento } from '../models/tipos';

@Injectable({
    providedIn: 'root'
})
export class SqliteService {
    atualizarEstoquePosInclusao = new EventEmitter<void>();
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
                mesa_identificacao TEXT,
                FOREIGN KEY (cliente_id) REFERENCES clientes(id)
            );
        `;
        const sqlProdutos = `
            CREATE TABLE IF NOT EXISTS produtos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT,
                valor_unitario REAL NOT NULL,
                foto_path TEXT,
                alerta_minimo INTEGER DEFAULT 0,
                estoque REAL DEFAULT 0
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

            { nome: 'Cigarro picado R$ 1,00', descricao: 'Cigarro picado varias marcas', valor_unitario: 1.00, foto_path: 'assets/images/produtos/cigarro-picado-1.jpg' },
            { nome: 'Cigarro picado R$ 2,00', descricao: 'Cigarro picado varias marcas', valor_unitario: 2.00, foto_path: 'assets/images/produtos/cigarro-picado-2.jpg' },
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

        const produtosExistentes = await this.listarProdutos();

        if (produtosExistentes.length === 0) {
            await this.addProdutosPadrao(produtosPadrao);
        }
    }

    private async addProdutosPadrao(produtosPadrao: { nome: string; descricao: string; valor_unitario: number, foto_path: string }[]) {
        if (!this.db) return;

        for (const p of produtosPadrao) {
            const sql = `INSERT INTO produtos (nome, descricao, valor_unitario, foto_path, alerta_minimo) VALUES (?, ?, ?, ?, ?)`;
            await this.db.run(sql, [p.nome, p.descricao, p.valor_unitario, p.foto_path, 0]);
        }
    }
    async addInsumo(produtoId: number, quantidade: number, valorPago: number) {
        if (!this.db) return;
        const sql = `INSERT INTO estoque (produto_id, quantidade, valor_pago) VALUES (?, ?, ?)`;
        await this.db.run(sql, [produtoId, quantidade, valorPago]);
    }
    async salvarPedido(pedido: Pedido): Promise<void> {
        if (!this.db) return;

        if (pedido.id) {
            // Atualizar pedido existente
            await this.db.run(
                `UPDATE pedidos SET 
                    itens = ?, 
                    total = ?, 
                    tipo = ?, 
                    status = ?, 
                    forma_pagamento = ?, 
                    cliente_id = ?
                    mesa_identificacao = ?
                WHERE id = ?`,
                [
                    JSON.stringify(pedido.itens),
                    pedido.total,
                    pedido.tipo,
                    pedido.status,
                    pedido.mesa_identificacao,
                    pedido.forma_pagamento,
                    pedido.cliente_id,
                    pedido.id
                ]
            );
        } else {
            // Inserir novo pedido
            const result = await this.db.run(
                `INSERT INTO pedidos (
                    itens, total, tipo, status, data, forma_pagamento, cliente_id, mesa_identificacao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    JSON.stringify(pedido.itens),
                    pedido.total,
                    pedido.tipo,
                    pedido.status,
                    new Date().toISOString().split('T')[0],
                    pedido.forma_pagamento,
                    pedido.cliente_id,
                    pedido.mesa_identificacao
                ]
            );
        }
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
                produtos.id,
                produtos.nome,
                produtos.foto_path,
                produtos.valor_unitario,
                COALESCE(SUM(estoque.quantidade), 0) AS quantidade_total,
                produtos.alerta_minimo
            FROM produtos
            LEFT JOIN estoque ON produtos.id = estoque.produto_id
            GROUP BY produtos.id, produtos.nome, produtos.foto_path, 
                     produtos.valor_unitario, produtos.alerta_minimo
            ORDER BY produtos.nome
        `;
        const result = await this.db.query(sql);
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
    async atualizarProduto(produto: Produto) {
        if (!this.db) return;

        const sql = `
            UPDATE produtos 
            SET 
            nome = ?, 
            descricao = ?, 
            valor_unitario = ?,
            alerta_minimo = ?
            WHERE id = ?
        `;

        await this.db.run(sql, [
            produto.nome,
            produto.descricao,
            produto.valor_unitario,
            produto.alerta_minimo,
            produto.id
        ]);
    }
    async darBaixaEstoque(produtoId: number, quantidade: number): Promise<boolean> {
        if (!this.db) return false;

        try {
            // Buscar as entradas de estoque para o produto (ordem FIFO)
            const entradas = await this.db.query(
                `SELECT id, quantidade FROM estoque WHERE produto_id = ? AND quantidade > 0 ORDER BY id ASC`,
                [produtoId]
            );

            if (!entradas.values || entradas.values.length === 0) {
                console.error(`Nenhuma entrada de estoque encontrada para o produto ${produtoId}`);
                return false;
            }

            let qtdRestante = quantidade;

            for (const entrada of entradas.values) {
                if (qtdRestante <= 0) break;

                const entradaId = entrada.id;
                const qtdDisponivel = entrada.quantidade;

                if (qtdDisponivel > qtdRestante) {
                    // Atualizar a entrada com a quantidade restante
                    await this.db.run(
                        `UPDATE estoque SET quantidade = quantidade - ? WHERE id = ?`,
                        [qtdRestante, entradaId]
                    );
                    qtdRestante = 0;
                } else {
                    // Consumir toda a entrada
                    await this.db.run(
                        `DELETE FROM estoque WHERE id = ?`,
                        [entradaId]
                    );
                    qtdRestante -= qtdDisponivel;
                }
            }

            if (qtdRestante > 0) {
                console.error(`Estoque insuficiente para o produto ${produtoId}. Faltaram ${qtdRestante} unidades.`);
                return false;
            }

            return true;
        } catch (e) {
            console.error('Erro ao dar baixa no estoque:', e);
            return false;
        }
    }
    async carregarTodosPedidos(): Promise<Pedido[]> {
        // Obter data atual
        const hoje = new Date();
        const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        const dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);

        const pedidos: Pedido[] = [];

        try {
            const result = await this.db?.query(
                `SELECT * FROM pedidos 
                 WHERE data >= ? AND data < ? 
                 ORDER BY data DESC`,
                [
                    dataInicio.toISOString(),
                    dataFim.toISOString()
                ]
            );

            if (result?.values) {
                for (const row of result.values) {
                    pedidos.push({
                        id: row.id,
                        itens: JSON.parse(row.itens),
                        total: row.total,
                        tipo: row.tipo,
                        status: row.status,
                        data: row.data,
                        forma_pagamento: row.forma_pagamento,
                        cliente_id: row.cliente_id
                    });
                }
            }
        } catch (e) {
            console.error('Erro ao carregar pedidos:', e);
        }

        return pedidos;
    }
    async atualizarCaixa(pedido: Pedido): Promise<boolean> {
        // 1. Verificar se o pedido tem dados necessários
        if (!pedido.forma_pagamento || !pedido.valor_pago) {
            console.error('Pedido sem forma de pagamento ou valor pago');
            return false;
        }

        // 2. Mapear formas de pagamento para colunas do caixa
        const colunasPagamento: Record<FormaPagamento, string> = {
            'dinheiro': 'total_dinheiro',
            'pix': 'total_pix',
            'debito': 'total_debito',
            'credito': 'total_credito'
        };

        const coluna = colunasPagamento[pedido.forma_pagamento];
        if (!coluna) {
            console.error('Forma de pagamento inválida:', pedido.forma_pagamento);
            return false;
        }

        // 3. Obter data atual no formato ISO (YYYY-MM-DD)
        const dataHoje = new Date().toISOString().split('T')[0];

        const valorLiquido = pedido.total - (pedido.desconto || 0);
        try {
            // 4. Atualizar o caixa do dia
            await this.db?.run(
                `UPDATE caixa 
                SET ${coluna} = ${coluna} + ?
                WHERE date(data_abertura) = date(?)
                AND data_fechamento IS NULL
                RETURNING *`,
                [
                    valorLiquido,
                    dataHoje
                ]
            );

            return true;
        } catch (e) {
            console.error('Erro ao atualizar caixa:', e);
            return false;
        }
    }
}
