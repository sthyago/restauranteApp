import { Component } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastrar-cliente',
  templateUrl: './cadastrar-cliente.page.html',
  styleUrls: ['./cadastrar-cliente.page.scss'],
  standalone: false
})

export class CadastrarClientePage {

  cliente = {
    nome: '',
    telefone: '',
    email: ''
  };

  constructor(private sqliteService: SqliteService, private router: Router) { }

  async salvarCliente() {
    const { nome, telefone, email } = this.cliente;

    if (!nome.trim()) {
      alert('Preencha o nome do cliente.');
      return;
    }

    // Validação de telefone
    const telLimpo = telefone.replace(/\D/g, '');
    if (telLimpo.length !== 10 && telLimpo.length !== 11) {
      alert('Telefone inválido! Deve ter 10 ou 11 dígitos (DDD + número).');
      return;
    }

    // Validação de email mais robusta
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      alert('Email inválido! Use o formato: nome@exemplo.com');
      return;
    }

    await this.sqliteService.adicionarCliente(nome.trim(), telefone, email.trim());
    alert('Cliente salvo com sucesso!');
    this.router.navigateByUrl('/tabs/listar-clientes');
  }
}
