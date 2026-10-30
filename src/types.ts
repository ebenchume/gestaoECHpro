/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuartoStatus = 'disponivel' | 'ocupado' | 'limpeza' | 'manutencao' | 'reservado';

export interface Empresa {
  nome: string;
  endereco: string;
  cidade: string;
  bairro: string;
  nuit: string;
  telefone1: string;
  telefone2: string;
  email: string;
  observacao?: string;
}

export interface Utilizador {
  id: number;
  nome_usuario: string;
  nome_completo: string;
  role: 'admin' | 'recepcionista' | 'gerente';
  activo: number;
  ultimo_login?: string;
  criado_em?: string;
}

export interface Quarto {
  id: number;
  numero: string;
  tipo: string;
  preco_diaria: number;
  capacidade: number;
  status: QuartoStatus;
  observacao?: string;
  activo: number;
}

export interface Hospede {
  id: number;
  nome: string;
  endereco?: string;
  cidade?: string;
  bairro?: string;
  nuit?: string;
  telefone1: string;
  telefone2?: string;
  email?: string;
  tipo_documento: string; // 'BI' | 'Passaporte' | 'DIRE' | 'Carta de Condução' | 'Outro'
  numero_documento: string;
  validade_documento?: string;
  data_nascimento?: string;
  nacionalidade: string;
  pais_origem?: string;
  empresa?: string;
  observacao?: string;
  criado_em: string;
}

export interface CheckinServico {
  id: number;
  checkin_id: number;
  servico_id?: number;
  descricao: string;
  categoria?: string; // 'Bar' | 'Restaurante' | 'Lavandaria' | 'Extra' | 'Outros'
  quantidade: number;
  preco_unitario: number;
  total: number;
  data: string;
}

export interface Parcela {
  id: number;
  checkin_id: number;
  numero_parcela?: string;
  data_parcela?: string;
  valor_parcela: number;
  data_pagamento: string;
  forma_pagamento: string; // 'Dinheiro' | 'Cartão' | 'Transferência' | 'M-Pesa' | 'E-Mola' | 'Cheque'
  referencia?: string;
  outros?: string;
  valor_pago: number;
  saldo_parcela?: number;
}

export type CheckinStatus = 'CHECKIN' | 'CHECKOUT' | 'RESERVADO' | 'CANCELADO';

export interface Checkin {
  id: number;
  hospede_id: number;
  quarto_id: number;
  empresa_referencia?: string;
  data_checkin: string; // ISO string or YYYY-MM-DD HH:mm
  data_checkout?: string;
  nr_adultos: number;
  nr_criancas: number;
  noites: number;
  preco_diaria: number;
  total_quarto: number;
  desconto_noite: number;
  total_desconto: number;
  subtotal: number;
  total_servicos: number;
  total_liquido: number;
  valor_pago: number;
  saldo: number;
  status: CheckinStatus;
  observacao?: string;
  criado_por?: number;
  criado_em: string;
  servicos: CheckinServico[];
  parcelas: Parcela[];
}

export interface ServicoCatalogo {
  id: number;
  nome: string;
  categoria: string;
  preco_unitario: number;
  activo: number;
}

export interface LivroCaixa {
  id: number;
  checkin_id?: number;
  parcela_id?: number;
  tipo: 'Entrada' | 'Saída';
  descricao: string;
  categoria: string;
  valor: number;
  forma_pagamento: string;
  data_movimento: string;
  utilizador: string;
  observacao?: string;
}

export interface AuditLog {
  id: string;
  data: string;
  utilizador: string;
  acao: string;
  detalhe: string;
  modulo: 'Quartos' | 'Hóspedes' | 'Check-in' | 'Pagamentos' | 'Caixa' | 'Configurações' | 'Sistema';
}

export type WidgetType = 
  | 'pro_tips'
  | 'quick_stats'
  | 'occupancy_chart'
  | 'today_flow'
  | 'finance_summary'
  | 'room_map'
  | 'pending_tasks'
  | 'weekly_forecast';

export interface DashboardWidget {
  id: WidgetType;
  title: string;
  enabled: boolean;
  order: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export interface LicencaInfo {
  status: 'activa' | 'trial' | 'expirada';
  dias_restantes: number;
  chave_usada?: string;
  expira_em?: string;
  machine_id: string;
}

export interface AppSettings {
  themeMode: 'auto' | 'dark' | 'light';
  accentColor: 'teal' | 'blue' | 'emerald' | 'amber' | 'purple';
  fontSize: 'normal' | 'compact' | 'spacious';
  pushEnabled: boolean;
  soundAlerts: boolean;
  checkoutReminderHours: number;
  autoCloudBackup: boolean;
  backupService: 'google_drive' | 'dropbox' | 'local';
  autoSyncIntervalSec: number;
}

export interface SearchFilters {
  query: string;
  modulo: 'todos' | 'hospedes' | 'quartos' | 'checkins' | 'caixa';
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  quartoTipo?: string;
  pagamentoStatus?: 'todos' | 'pago' | 'pendente';
  nacionalidade?: string;
}
