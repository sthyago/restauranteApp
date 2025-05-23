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

    if (!nome.trim() || !telefone.trim() || !email.trim()) {
      alert('Preencha todos os campos.');
      return;
    }

    const telRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    const emailRegex = /^[^ @]+@[^ @]+\.[^ @]+$/;

    if (!telRegex.test(telefone)) {
      alert('Telefone inválido. Use o formato (99) 99999-9999.');
      return;
    }

    if (!emailRegex.test(email)) {
      alert('Email inválido.');
      return;
    }

    await this.sqliteService.adicionarCliente(nome.trim(), telefone.trim(), email.trim());
    alert('Cliente salvo!');
    this.router.navigateByUrl('/finalizar-pedido');
  }
}
