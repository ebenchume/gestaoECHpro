/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Empresa, Quarto, Hospede, Checkin, ServicoCatalogo, LivroCaixa, Utilizador, AuditLog, LicencaInfo } from '../types';

export const INITIAL_EMPRESA: Empresa = {
  nome: "Pousada & Hotel Bela Vista",
  endereco: "Av. Julius Nyerere, nº 1420",
  cidade: "Maputo",
  bairro: "Polana Cimento",
  nuit: "400192837",
  telefone1: "+258 82 747 3434",
  telefone2: "+258 84 391 2200",
  email: "ebenchume@sapo.mz",
  observacao: "Sistema Oficial ECHpro v2.5 — Hotelaria e Alojamento"
};

export const INITIAL_UTILIZADORES: Utilizador[] = [
  {
    id: 1,
    nome_usuario: "admin",
    nome_completo: "Administrador do Sistema",
    role: "admin",
    activo: 1,
    ultimo_login: new Date().toISOString()
  },
  {
    id: 2,
    nome_usuario: "recepcao",
    nome_completo: "Ana Paula Mabote",
    role: "recepcionista",
    activo: 1,
    ultimo_login: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

export const INITIAL_QUARTOS: Quarto[] = [
  { id: 1, numero: "Q 111", tipo: "CASAL", preco_diaria: 3500, capacidade: 2, status: "ocupado", activo: 1, observacao: "Cama Queen, AC, Frigobar, Vista Jardim" },
  { id: 2, numero: "Q 112", tipo: "CASAL", preco_diaria: 3500, capacidade: 2, status: "disponivel", activo: 1, observacao: "Cama Queen, AC, Smart TV" },
  { id: 3, numero: "Q 113", tipo: "CASAL", preco_diaria: 3500, capacidade: 2, status: "limpeza", activo: 1, observacao: "Em higienização pós checkout" },
  { id: 4, numero: "Q 114", tipo: "KING", preco_diaria: 4500, capacidade: 2, status: "ocupado", activo: 1, observacao: "Cama King Size, Banheira de Hidro" },
  { id: 5, numero: "Q 115", tipo: "KING", preco_diaria: 4500, capacidade: 2, status: "disponivel", activo: 1, observacao: "Andar Superior, Varanda Panorâmica" },
  { id: 6, numero: "Q 116", tipo: "KING", preco_diaria: 4500, capacidade: 2, status: "reservado", activo: 1, observacao: "Reserva confirmada para hoje à tarde" },
  { id: 7, numero: "Q 117", tipo: "ARMAZEM", preco_diaria: 2500, capacidade: 1, status: "disponivel", activo: 1, observacao: "Suíte executiva compacta" },
  { id: 8, numero: "Q 122", tipo: "SOLTEIRO 2 CAMAS", preco_diaria: 3800, capacidade: 2, status: "ocupado", activo: 1, observacao: "Duas camas solteiro box, Wi-Fi 6" },
  { id: 9, numero: "Q 123", tipo: "KING", preco_diaria: 4500, capacidade: 2, status: "disponivel", activo: 1, observacao: "Mesa de trabalho e cofre digital" },
  { id: 10, numero: "Q 05", tipo: "KING", preco_diaria: 5000, capacidade: 3, status: "disponivel", activo: 1, observacao: "Térreo, acessibilidade total" },
  { id: 11, numero: "Q 21", tipo: "SUITE MASTER", preco_diaria: 6500, capacidade: 4, status: "manutencao", activo: 1, observacao: "Ajuste no sistema de climatização" },
  { id: 12, numero: "Q 22", tipo: "KING", preco_diaria: 4500, capacidade: 2, status: "disponivel", activo: 1, observacao: "Cama King com roupa de cama egípcia" },
];

export const INITIAL_SERVICOS_CATALOGO: ServicoCatalogo[] = [
  { id: 1, nome: "Água Mineral 500ml", categoria: "Bar", preco_unitario: 80, activo: 1 },
  { id: 2, nome: "Cerveja 2M / Laurentina", categoria: "Bar", preco_unitario: 150, activo: 1 },
  { id: 3, nome: "Refrigerante Lata", categoria: "Bar", preco_unitario: 100, activo: 1 },
  { id: 4, nome: "Prato do Dia / Almoço Executivo", categoria: "Restaurante", preco_unitario: 650, activo: 1 },
  { id: 5, nome: "Pequeno Almoço Buffet Completo", categoria: "Restaurante", preco_unitario: 450, activo: 1 },
  { id: 6, nome: "Lavandaria (Peça Simples)", categoria: "Lavandaria", preco_unitario: 180, activo: 1 },
  { id: 7, nome: "Lavagem & Engomagem Terno/Vestido", categoria: "Lavandaria", preco_unitario: 450, activo: 1 },
  { id: 8, nome: "Transfer Aeroporto / Cidade", categoria: "Extra", preco_unitario: 1200, activo: 1 },
  { id: 9, nome: "Late Check-out (até 16h)", categoria: "Extra", preco_unitario: 1500, activo: 1 }
];

export const INITIAL_HOSPEDES: Hospede[] = [
  {
    id: 1,
    nome: "Carlos Eduardo Sitoe",
    endereco: "Rua dos Desportistas, 88",
    cidade: "Maputo",
    bairro: "Sommerschield",
    nuit: "102938475",
    telefone1: "+258 84 123 4567",
    email: "carlos.sitoe@empresa.co.mz",
    tipo_documento: "BI",
    numero_documento: "110293849182B",
    validade_documento: "2029-08-15",
    data_nascimento: "1985-04-12",
    nacionalidade: "Moçambicana",
    pais_origem: "Moçambique",
    empresa: "Logística Moçambique Lda",
    criado_em: "2026-10-20T10:00:00Z"
  },
  {
    id: 2,
    nome: "Graça Maria Cossa",
    endereco: "Av. 24 de Julho, 300",
    cidade: "Matola",
    bairro: "Fomento",
    nuit: "203948571",
    telefone1: "+258 82 987 6543",
    email: "graca.cossa@gmail.com",
    tipo_documento: "Passaporte",
    numero_documento: "MZ938201",
    validade_documento: "2028-11-20",
    data_nascimento: "1990-11-03",
    nacionalidade: "Moçambicana",
    pais_origem: "Moçambique",
    empresa: "Consultoria Global",
    criado_em: "2026-10-22T14:30:00Z"
  },
  {
    id: 3,
    nome: "David van der Merwe",
    endereco: "Sandton City, Block C",
    cidade: "Johannesburg",
    bairro: "Sandton",
    nuit: "948271630",
    telefone1: "+27 82 555 4321",
    email: "david.vdm@africanmining.co.za",
    tipo_documento: "Passaporte",
    numero_documento: "ZA8819203",
    validade_documento: "2030-03-10",
    data_nascimento: "1978-07-22",
    nacionalidade: "Sul-Africana",
    pais_origem: "África do Sul",
    empresa: "Southern Mining Partners",
    criado_em: "2026-10-24T09:15:00Z"
  },
  {
    id: 4,
    nome: "Inês Ferreira de Almeida",
    endereco: "Avenida da Liberdade, 45",
    cidade: "Lisboa",
    bairro: "Baixa",
    telefone1: "+351 91 876 5432",
    email: "ines.almeida@turismo.pt",
    tipo_documento: "Passaporte",
    numero_documento: "PT1928374",
    validade_documento: "2029-01-30",
    data_nascimento: "1992-09-18",
    nacionalidade: "Portuguesa",
    pais_origem: "Portugal",
    empresa: "Agência Viagens Mundo",
    criado_em: "2026-10-25T11:45:00Z"
  }
];

export const INITIAL_CHECKINS: Checkin[] = [
  {
    id: 101,
    hospede_id: 1,
    quarto_id: 1,
    empresa_referencia: "Logística Moçambique Lda",
    data_checkin: "2026-10-26T14:00:00",
    data_checkout: "2026-10-29T11:00:00",
    nr_adultos: 2,
    nr_criancas: 0,
    noites: 3,
    preco_diaria: 3500,
    total_quarto: 10500,
    desconto_noite: 0,
    total_desconto: 0,
    subtotal: 10500,
    total_servicos: 560,
    total_liquido: 11060,
    valor_pago: 7000,
    saldo: 4060,
    status: "CHECKIN",
    observacao: "Check-in efetuado com pagamento de 2 diárias adiantadas",
    criado_por: 1,
    criado_em: "2026-10-26T14:05:00Z",
    servicos: [
      { id: 1, checkin_id: 101, descricao: "Água Mineral 500ml (x2)", categoria: "Bar", quantidade: 2, preco_unitario: 80, total: 160, data: "2026-10-26T16:00:00" },
      { id: 2, checkin_id: 101, descricao: "Cerveja 2M (x2)", categoria: "Bar", quantidade: 2, preco_unitario: 150, total: 300, data: "2026-10-26T20:30:00" },
      { id: 3, checkin_id: 101, descricao: "Refrigerante Lata", categoria: "Bar", quantidade: 1, preco_unitario: 100, total: 100, data: "2026-10-27T12:15:00" },
    ],
    parcelas: [
      { id: 1, checkin_id: 101, numero_parcela: "1/2", data_parcela: "2026-10-26", valor_parcela: 7000, data_pagamento: "2026-10-26", forma_pagamento: "M-Pesa", referencia: "MP-984210", valor_pago: 7000, saldo_parcela: 0 }
    ]
  },
  {
    id: 102,
    hospede_id: 3,
    quarto_id: 4,
    empresa_referencia: "Southern Mining Partners",
    data_checkin: "2026-10-25T16:30:00",
    data_checkout: "2026-10-28T12:00:00",
    nr_adultos: 1,
    nr_criancas: 0,
    noites: 3,
    preco_diaria: 4500,
    total_quarto: 13500,
    desconto_noite: 500,
    total_desconto: 1500,
    subtotal: 12000,
    total_servicos: 1850,
    total_liquido: 13850,
    valor_pago: 13850,
    saldo: 0,
    status: "CHECKIN",
    observacao: "Checkout programado para hoje; conta totalmente liquidada",
    criado_por: 1,
    criado_em: "2026-10-25T16:35:00Z",
    servicos: [
      { id: 4, checkin_id: 102, descricao: "Transfer Aeroporto / Cidade", categoria: "Extra", quantidade: 1, preco_unitario: 1200, total: 1200, data: "2026-10-25T17:00:00" },
      { id: 5, checkin_id: 102, descricao: "Prato do Dia / Almoço Executivo", categoria: "Restaurante", quantidade: 1, preco_unitario: 650, total: 650, data: "2026-10-26T13:00:00" }
    ],
    parcelas: [
      { id: 2, checkin_id: 102, numero_parcela: "1/1", data_parcela: "2026-10-25", valor_parcela: 13850, data_pagamento: "2026-10-25", forma_pagamento: "Cartão", referencia: "POS-VISA-5421", valor_pago: 13850, saldo_parcela: 0 }
    ]
  },
  {
    id: 103,
    hospede_id: 2,
    quarto_id: 8,
    data_checkin: "2026-10-27T11:00:00",
    data_checkout: "2026-10-30T10:00:00",
    nr_adultos: 2,
    nr_criancas: 0,
    noites: 3,
    preco_diaria: 3800,
    total_quarto: 11400,
    desconto_noite: 0,
    total_desconto: 0,
    subtotal: 11400,
    total_servicos: 450,
    total_liquido: 11850,
    valor_pago: 5000,
    saldo: 6850,
    status: "CHECKIN",
    observacao: "Entrada com adiantamento em dinheiro",
    criado_por: 2,
    criado_em: "2026-10-27T11:05:00Z",
    servicos: [
      { id: 6, checkin_id: 103, descricao: "Pequeno Almoço Buffet Completo", categoria: "Restaurante", quantidade: 1, preco_unitario: 450, total: 450, data: "2026-10-28T08:00:00" }
    ],
    parcelas: [
      { id: 3, checkin_id: 103, numero_parcela: "1/2", data_parcela: "2026-10-27", valor_parcela: 5000, data_pagamento: "2026-10-27", forma_pagamento: "Dinheiro", referencia: "REC-0089", valor_pago: 5000, saldo_parcela: 0 }
    ]
  },
  {
    id: 104,
    hospede_id: 4,
    quarto_id: 6,
    data_checkin: "2026-10-28T15:00:00",
    data_checkout: "2026-11-01T11:00:00",
    nr_adultos: 1,
    nr_criancas: 0,
    noites: 4,
    preco_diaria: 4500,
    total_quarto: 18000,
    desconto_noite: 0,
    total_desconto: 0,
    subtotal: 18000,
    total_servicos: 0,
    total_liquido: 18000,
    valor_pago: 4500,
    saldo: 13500,
    status: "RESERVADO",
    observacao: "Reserva confirmada; sinal de 1 diária pago via Transferência Bancária",
    criado_por: 1,
    criado_em: "2026-10-27T16:00:00Z",
    servicos: [],
    parcelas: [
      { id: 4, checkin_id: 104, numero_parcela: "Sinal", data_parcela: "2026-10-27", valor_parcela: 4500, data_pagamento: "2026-10-27", forma_pagamento: "Transferência", referencia: "BIM-TR-998811", valor_pago: 4500, saldo_parcela: 0 }
    ]
  }
];

export const INITIAL_LIVRO_CAIXA: LivroCaixa[] = [
  { id: 1, checkin_id: 102, tipo: "Entrada", descricao: "Pagamento Total Check-in Q 114 (David v.d. Merwe)", categoria: "Hospedagem", valor: 13850, forma_pagamento: "Cartão", data_movimento: "2026-10-25T16:40:00Z", utilizador: "admin" },
  { id: 2, checkin_id: 101, tipo: "Entrada", descricao: "Adiantamento Diárias Q 111 (Carlos Sitoe)", categoria: "Hospedagem", valor: 7000, forma_pagamento: "M-Pesa", data_movimento: "2026-10-26T14:10:00Z", utilizador: "admin" },
  { id: 3, tipo: "Saída", descricao: "Compra de Bebidas e Insumos para Frigobar e Bar", categoria: "Suprimentos", valor: 3200, forma_pagamento: "Dinheiro", data_movimento: "2026-10-27T09:30:00Z", utilizador: "admin", observacao: "Talão Supermercado Recheio" },
  { id: 4, checkin_id: 103, tipo: "Entrada", descricao: "Sinal Check-in Q 122 (Graça Cossa)", categoria: "Hospedagem", valor: 5000, forma_pagamento: "Dinheiro", data_movimento: "2026-10-27T11:10:00Z", utilizador: "recepcao" },
  { id: 5, checkin_id: 104, tipo: "Entrada", descricao: "Sinal de Reserva Q 116 (Inês Almeida)", categoria: "Reserva", valor: 4500, forma_pagamento: "Transferência", data_movimento: "2026-10-27T16:15:00Z", utilizador: "admin" },
  { id: 6, tipo: "Saída", descricao: "Pagamento de Manutenção Elétrica dos Quartos", categoria: "Manutenção", valor: 1800, forma_pagamento: "M-Pesa", data_movimento: "2026-10-28T08:20:00Z", utilizador: "admin" },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: "log-1", data: "2026-10-25T16:35:00Z", utilizador: "admin", acao: "Check-in Registrado", detalhe: "Check-in #102 para David van der Merwe no Q 114", modulo: "Check-in" },
  { id: "log-2", data: "2026-10-26T14:05:00Z", utilizador: "admin", acao: "Check-in Registrado", detalhe: "Check-in #101 para Carlos Eduardo Sitoe no Q 111", modulo: "Check-in" },
  { id: "log-3", data: "2026-10-27T11:05:00Z", utilizador: "recepcao", acao: "Check-in Registrado", detalhe: "Check-in #103 para Graça Maria Cossa no Q 122", modulo: "Check-in" },
  { id: "log-4", data: "2026-10-27T16:00:00Z", utilizador: "admin", acao: "Reserva Confirmada", detalhe: "Reserva #104 para Inês Ferreira de Almeida no Q 116", modulo: "Check-in" },
  { id: "log-5", data: "2026-10-28T07:15:00Z", utilizador: "admin", acao: "Quarto para Manutenção", detalhe: "Alteração de status do Q 21 para 'manutencao'", modulo: "Quartos" },
  { id: "log-6", data: "2026-10-28T08:30:00Z", utilizador: "recepcao", acao: "Quarto para Limpeza", detalhe: "Alteração de status do Q 113 para 'limpeza'", modulo: "Quartos" },
];

export const INITIAL_LICENCA: LicencaInfo = {
  status: "activa",
  dias_restantes: 365,
  chave_usada: "ECHP-8492-3104-9921-7764",
  expira_em: "2027-10-28",
  machine_id: "ECHP-WEB-APP-616194790143"
};
