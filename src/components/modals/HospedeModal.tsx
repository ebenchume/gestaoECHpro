/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Users, Save, Phone, Mail, MapPin, Building2, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Hospede } from '../../types';

interface HospedeModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospedeToEdit?: Hospede | null;
}

export const HospedeModal: React.FC<HospedeModalProps> = ({
  isOpen,
  onClose,
  hospedeToEdit
}) => {
  const { addOrUpdateHospede } = useApp();

  const [nome, setNome] = useState('');
  const [tipoDoc, setTipoDoc] = useState('BI');
  const [numDoc, setNumDoc] = useState('');
  const [validadeDoc, setValidadeDoc] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [nacionalidade, setNacionalidade] = useState('Moçambicana');
  const [paisOrigem, setPaisOrigem] = useState('Moçambique');
  const [tel1, setTel1] = useState('');
  const [tel2, setTel2] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('Maputo');
  const [bairro, setBairro] = useState('');
  const [nuit, setNuit] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    if (hospedeToEdit) {
      setNome(hospedeToEdit.nome || '');
      setTipoDoc(hospedeToEdit.tipo_documento || 'BI');
      setNumDoc(hospedeToEdit.numero_documento || '');
      setValidadeDoc(hospedeToEdit.validade_documento || '');
      setDataNasc(hospedeToEdit.data_nascimento || '');
      setNacionalidade(hospedeToEdit.nacionalidade || 'Moçambicana');
      setPaisOrigem(hospedeToEdit.pais_origem || 'Moçambique');
      setTel1(hospedeToEdit.telefone1 || '');
      setTel2(hospedeToEdit.telefone2 || '');
      setEmail(hospedeToEdit.email || '');
      setEndereco(hospedeToEdit.endereco || '');
      setCidade(hospedeToEdit.cidade || 'Maputo');
      setBairro(hospedeToEdit.bairro || '');
      setNuit(hospedeToEdit.nuit || '');
      setEmpresa(hospedeToEdit.empresa || '');
      setObservacao(hospedeToEdit.observacao || '');
    } else {
      setNome('');
      setTipoDoc('BI');
      setNumDoc('');
      setValidadeDoc('');
      setDataNasc('');
      setNacionalidade('Moçambicana');
      setPaisOrigem('Moçambique');
      setTel1('');
      setTel2('');
      setEmail('');
      setEndereco('');
      setCidade('Maputo');
      setBairro('');
      setNuit('');
      setEmpresa('');
      setObservacao('');
    }
  }, [hospedeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('O nome do hóspede é obrigatório.');
      return;
    }

    addOrUpdateHospede({
      id: hospedeToEdit ? hospedeToEdit.id : undefined,
      nome,
      tipo_documento: tipoDoc,
      numero_documento: numDoc,
      validade_documento: validadeDoc,
      data_nascimento: dataNasc,
      nacionalidade,
      pais_origem: paisOrigem,
      telefone1: tel1,
      telefone2: tel2,
      email,
      endereco,
      cidade,
      bairro,
      nuit,
      empresa,
      observacao
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {hospedeToEdit ? 'Editar Cadastro de Hóspede' : 'Novo Cadastro de Hóspede'}
              </h2>
              <p className="text-xs text-slate-500">
                Registe os dados pessoais, identificação e contactos oficiais do hóspede.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome Completo *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Ex: Alberto Chissano"
                className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">NUIT</label>
              <input
                type="text"
                value={nuit}
                onChange={e => setNuit(e.target.value)}
                placeholder="Ex: 400123987"
                className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Document & Nationality */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tipo Documento</label>
              <select
                value={tipoDoc}
                onChange={e => setTipoDoc(e.target.value)}
                className="w-full mt-1 px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="BI">BI (Bilhete de Identidade)</option>
                <option value="Passaporte">Passaporte</option>
                <option value="DIRE">DIRE</option>
                <option value="Carta de Condução">Carta de Condução</option>
                <option value="Outro">Outro Documento</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nº do Documento *</label>
              <input
                type="text"
                required
                value={numDoc}
                onChange={e => setNumDoc(e.target.value)}
                placeholder="110293849182B"
                className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Validade Doc</label>
              <input
                type="date"
                value={validadeDoc}
                onChange={e => setValidadeDoc(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nacionalidade</label>
              <select
                value={nacionalidade}
                onChange={e => setNacionalidade(e.target.value)}
                className="w-full mt-1 px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Moçambicana">Moçambicana</option>
                <option value="Sul-Africana">Sul-Africana</option>
                <option value="Portuguesa">Portuguesa</option>
                <option value="Brasileira">Brasileira</option>
                <option value="Chinesa">Chinesa</option>
                <option value="Indiana">Indiana</option>
                <option value="Zimbabuense">Zimbabuense</option>
                <option value="Outra">Outra</option>
              </select>
            </div>
          </div>

          {/* Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-teal-500" />
                Telefone Principal *
              </label>
              <input
                type="text"
                required
                value={tel1}
                onChange={e => setTel1(e.target.value)}
                placeholder="+258 84 123 4567"
                className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Telefone Secundário
              </label>
              <input
                type="text"
                value={tel2}
                onChange={e => setTel2(e.target.value)}
                placeholder="+258 82 987 6543"
                className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="hospede@email.com"
                className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Address & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Cidade / Bairro
              </label>
              <input
                type="text"
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                placeholder="Cidade e Bairro"
                className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Endereço Completo
              </label>
              <input
                type="text"
                value={endereco}
                onChange={e => setEndereco(e.target.value)}
                placeholder="Rua, número, prédio"
                className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-purple-500" />
                Empresa Vinculada
              </label>
              <input
                type="text"
                value={empresa}
                onChange={e => setEmpresa(e.target.value)}
                placeholder="Ex: Empresa de Mineração SA"
                className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Observações & Preferências</label>
            <textarea
              rows={2}
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              placeholder="Preferências de quarto, alergias, restrições alimentares..."
              className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-md transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {hospedeToEdit ? 'Atualizar Hóspede' : 'Salvar Hóspede'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
