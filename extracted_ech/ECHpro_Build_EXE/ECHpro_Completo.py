#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════════════════╗
║  ECHpro v2.2 — FICHEIRO ÚNICO COMPLETO E ROBUSTO                         ║
║  Sistema de Gestão de Hóspedes Profissional                              ║
║  Compatível com Windows 10 / 11                                          ║
║                                                                          ║
║  Login padrão:  admin  /  admin123                                       ║
║                                                                          ║
║  Apoio ao Cliente:                                                       ║
║    Tel:  +258 82 747 3434                                                ║
║    Email: ebenchume@sapo.mz                                              ║
║                                                                          ║
║  Dependências:  pip install customtkinter bcrypt sqlalchemy pillow       ║
║                 openpyxl                                                 ║
║                                                                          ║
║  Executar:      python ECHpro_Completo.py                                ║
╚══════════════════════════════════════════════════════════════════════════╝
"""

import os
import sys
from pathlib import Path
from datetime import datetime, date, timedelta
from tkinter import messagebox, filedialog

# ── Dependências ──────────────────────────────────────────────────────────
try:
    import customtkinter as ctk
except ImportError:
    print("ERRO: customtkinter não instalado.\nExecute:  pip install customtkinter")
    input("Pressione Enter para sair...")
    sys.exit(1)

try:
    import bcrypt
except ImportError:
    print("ERRO: bcrypt não instalado.\nExecute:  pip install bcrypt")
    input("Pressione Enter para sair...")
    sys.exit(1)

try:
    from sqlalchemy import (
        create_engine, Column, Integer, String, Float, DateTime, Date,
        ForeignKey, Text, event
    )
    from sqlalchemy.orm import sessionmaker, declarative_base, relationship
    from sqlalchemy.pool import StaticPool
except ImportError:
    print("ERRO: sqlalchemy não instalado.\nExecute:  pip install sqlalchemy")
    input("Pressione Enter para sair...")
    sys.exit(1)

# ══════════════════════════════════════════════════════════════════════════
#  CONFIGURAÇÃO / TEMA
# ══════════════════════════════════════════════════════════════════════════

COLORS = {
    "primary": "#0f766e",          # Teal profundo
    "primary_hover": "#14b8a6",    # Teal vivo
    "secondary": "#2dd4bf",        # Turquesa
    "accent": "#f59e0b",           # Âmbar dourado
    "success": "#10b981",          # Verde esmeralda
    "warning": "#f59e0b",          # Âmbar
    "danger": "#ef4444",           # Vermelho moderno
    "bg_dark": "#0f172a",          # Slate quase preto
    "bg_card": "#1e293b",          # Slate escuro
    "bg_input": "#334155",         # Slate médio
    "text": "#f1f5f9",             # Quase branco
    "text_muted": "#94a3b8",       # Cinza azulado
    "border": "#475569",           # Borda suave
}

FONTS = {
    "title": ("Segoe UI", 24, "bold"),
    "heading": ("Segoe UI", 16, "bold"),
    "body": ("Segoe UI", 13),
    "small": ("Segoe UI", 11),
    "button": ("Segoe UI", 13, "bold"),
}


# ── Logotipo Eben Chume (embutido no código — não precisa de ficheiros externos) ──
LOGO_FULL_B64 = (
    "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"
    "IYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEII"
    "IYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEII"
    "IYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEII"
    "IYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEII"
    "IYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEII"
    "IYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEII"
    "IYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIeQExegUEHIk/CIzEyIr"
    "K/Ow/3fLlmJVUDDZBqDoXBFyjAJSdna2/uCDU446kK1bVwhgnR0IBOTRvE9eXh4HsrTvqii++7OjiovnqMmT27YimTp1rdEqVaI/"
    "y2KMHe335Lm5k8TojHPZOhR+71+cP/9ZmZ+fbzfnWmTBr33zfadNm6MKCiZb7TIM+f0iM9Mv/vrXH5tSfv+pF0Lg2mv/ZACFTjAY"
    "dNryvvX78/Rv/jAxsVhNntz88+z3+w3g2/dPMBiwWum+4Lm5k0RG5R5W+K3PgA00rw7Iy8vjhYXQDv5ZJoD5JZD5+QG7Nc5vnj9P"
    "R2bWd/6FYDCIwsKg2ZI3z82dpGdkJH5nHVpYuK7Vzn1T+W1O/Xj4ShN4dv49zaoPKENqISE0/N//PatPnjzeASDpjBDAL/Ly/CIQ"
    "GNtU6fTq1unMKzt07Cp8vlgkxCfAsS1UVVfJ+rpavmnrhm3V1RvfBQDGgOuvzzOCwYBN5Yl8MzhTmWidgMQByJ7dzr7hkYdf6JCe"
    "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"
    "gSoUqmOIjm07MTGJ52YPOfeBwJRxc48kS2pvsrNz9Wdn/SJy1WV3n3/eiCv+2b//QFcoVOswBl3TNDiOA7fH4zBwUVZWgpKSYlRV"
    "l6Fr1x5zKyorutim1TcxMQWdOnWFzxuDhnC9VEpxwzAQCtW54uMTwxePvjZr795dj4waxS6+776neX5+vgN6XqndijYCOIYNO9c8"
    "Y+jVdyxdbrz6fRMy/H5owWDAvP6aX73OGGOOtJuayMfhu0sYhlvt3r2dlZeXrjqt36AVtnSE9h2ZkoSEacbK6qoyrhg2RDPIxDab"
    "+n3UASnauvZaywoWi2cn3T8eQHFz3yMQYLI1C4thuFVJSTF7blLep0DNLw+bQvcd9XDunb+77vShw/s2NIRUtMvFgdvlVRecf/nO"
    "h/8O9zPP/NyeOPH+Vi/Muq7b23dsNX7z+8t+3JL3OKqsTSpbRVvWrDFjVbEx8Wzlqq+qNmxczX7/4GPx0TSKs1CoVnTt0t3+0dW3"
    "xX25ZN7IjOTuS9rLTLkj4xc9e/q0DWs7j+zXd8gr3bv2Sg2HG2wAGmMctm0jNjberKgoN7ZsWbdqy7ailV98OU/fvGnt5urazU8D"
    "GNSzy9k/PS1riMzOPje5Y3rnMf37n84lHDsSDmuapqO6usLo2LGzdfWVN/XYunXN9c8998CbrTfJgRzzCh2qcdiHwdANIytz2EtL"
    "lz/08vc1AadOzXK83h5nXnn5jfvcbm+64zQ99njsY5KUUsXExKp161awvz/+k1cAPNnc92jLZwq1VjpI5vX6cNVl93f9pf8XlbVm"
    "OY81kr+70uwObJu/DZ8WPme1xQOESilomo5OHXrH3zn+CXdh4ZeuzMyzIklJnZS9bSV/4Em/yRj7U37+4JU9e50W9Hrdpm07BsCg"
    "GFh5ZWnHxPhetwgh/ofovHanlb8fMwwDf/3j1B4jep9RXFohWGqS870t5m0Atm172Tz6LkQlvpGtKSkl69y5255pn76xo2D5F8PP"
    "Hp4TV1lZxhjjnAnmxMQkjBhy+vA/BKaMu/iKK/K806adHFlS7hWZrsnBQP2o829/5Iwzcjr4fDFmbW2VIYTWGIzizF27dxhzZn+w"
    "6oVX/nYbEFq9/8bRNCgp87fs/CJ/y84v8MmM/7guvWj8AxHTGte7d2Yfj8ftmKYphNB4XV21k5LSsdvoC/3jVq6Z805mph9AsEUz"
    "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"
    "7Ggvz7MUFc2ITJ++2VixZtqdDaHaZZZlCyE0GX0+TOqOY6punXo+cMlF9/1eKXia9u36vrIcfeA1Ofay63765x7d+11ZF6q2Oeea"
    "Ugoej4fv2bMDH378mgfI0d5+e8IpUTFt2zYfAOSSJfPcFRVl0DW9aT19vaGh3kyIT76lR7cOf3UcR3/nnXed6CLCB59XxfLyFJ85"
    "898RAL47/+/Xqeeee4FZU1slor0aErruYrW11fXrN6zdzBjDl6+/fcwykIKCAmvB528MKd67m3s9MczrjWVebwzzemOYxxPDAK6v"
    "XPPFKx/NebGmsXI5YbIjzr+7fjx8GW/7OrvVMgDHsbGhcHWo8QGr47+4qpIIherMxu8TZmzKt/o3gA6pV1ziP33QwDNVONzAODvQ"
    "bedIaZdWlK5ljCEmJqPVC5GUEl8t+KyOsZ8pAOpEnqVWWTlHAn7xv/89pv3omjt2DhwwOK26ulIJwVkkEpbp6Z3EHbf+4pxZs9+f"
    "n9l/YNMspBO+snzmmYnIzc3VZ8wM7klITDE7duwiQqFacM5RXx9y9ezVO1QfPv/PTD2minftevOjmU+XMcbKv+Ptki+55K6Uvr1O"
    "+/nggWffnZyc0lBbW+XhXEApJTXN4Nu3bar+8INXvlRqp5OVlXVK9E58+eXbijGGxYtnbTkj+/zaTp06e+ob6pUQgtXVVRuZmQOd"
    "IVvOvn/7zq2716+f/VwgEAgBARxcfAIBqDh0Trrkmhv+EJ+Q/Cuv1xuprq5yRbMtYUMxTdP550u+nHqvUoozxo7peIjfn2csWDB9"
    "bYcOnTQRHTeCVAqa0JwNG1aLRV9MzWWM2TiO070PbahHJ4FUVpdGvqd+PC5abZZdbGw8bh13X/8Lc66RjmNyIYzv7JjWdaUs7mY7"
    "dqzZe+edI2pbe1C/sdWEXj37p9x8w8Q+5XXlRnJMsgkA9U4d83pj1J7tRUmlleX/6NSlx0hN12zbtozGSlQppVh9Xc2+oq8X5Myb"
    "p7RRo1ir7xjrdntw812/HfDbDs+WWBaYrn93QY0ggpSUzvjv0xNCL74VKMExeh7p0Cxpkj55cnBmenrHW9etWzO/Z8/eDaFQjcdx"
    "bBYTE8sys4b0nDZ96p8t24GUUhNCNB3scVle/0jMmPGM2dgAuXPQoLP6JCennWEYhrQsi2uahoqKMl/PHr3sThmd8xYtmpcnXPdP"
    "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"
    "Qgghzfb/Inu/wLJZyGsAAAAASUVORK5CYII="
)
LOGO_MARK_B64 = (
    "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"
    "AAAAAElFTkSuQmCC"
)
LOGO_FULL_SIZE = (420, 661)
LOGO_MARK_SIZE = (240, 265)

_LOGO_CACHE = {}


def get_logo(kind="full", width=140):
    """Devolve o logotipo como CTkImage (kind: 'full' = símbolo + nome, 'mark' = só símbolo).
    Retorna None se falhar, para nunca impedir o arranque da aplicação."""
    key = (kind, width)
    if key in _LOGO_CACHE:
        return _LOGO_CACHE[key]
    try:
        import io as _io
        from PIL import Image
        b64 = LOGO_FULL_B64 if kind == "full" else LOGO_MARK_B64
        w0, h0 = LOGO_FULL_SIZE if kind == "full" else LOGO_MARK_SIZE
        img = Image.open(_io.BytesIO(base64.b64decode(b64))).convert("RGBA")
        height = int(h0 * width / w0)
        ctk_img = ctk.CTkImage(light_image=img, dark_image=img, size=(width, height))
        _LOGO_CACHE[key] = ctk_img
        return ctk_img
    except Exception as e:
        print(f"[AVISO] Logotipo não carregado: {e}")
        return None


def setup_theme():
    ctk.set_appearance_mode("dark")
    ctk.set_default_color_theme("dark-blue")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False


def safe_float(value, default=0.0) -> float:
    """Converte string para float de forma segura (aceita vírgula ou ponto)."""
    if value is None:
        return default
    try:
        s = str(value).strip().replace(",", ".")
        if not s:
            return default
        return float(s)
    except (ValueError, TypeError):
        return default


def safe_int(value, default=0) -> int:
    """Converte string para int de forma segura."""
    try:
        return int(str(value).strip() or default)
    except (ValueError, TypeError):
        return default


def parse_date(s: str):
    """Parse data no formato DD/MM/AAAA. Retorna date ou None."""
    try:
        return datetime.strptime(s.strip(), "%d/%m/%Y").date()
    except (ValueError, AttributeError):
        return None


# ══════════════════════════════════════════════════════════════════════════
#  SISTEMA DE LICENÇA / ACTIVACÃO
# ══════════════════════════════════════════════════════════════════════════

import hashlib
import hmac
import base64
import json
import uuid
import platform

# Segredo interno (não partilhar publicamente)
_LICENSE_SECRET = b"ECHpro-v2.2-2026-EBenchume-MZ-SecretKey!@#$%^&*"
_LICENSE_PREFIX = "ECHP"
_TRIAL_DAYS = 15  # Dias de avaliação gratuita


def get_app_data_dir() -> Path:
    if sys.platform == "win32":
        base = Path(os.environ.get("LOCALAPPDATA", Path.home() / "AppData" / "Local"))
    else:
        base = Path.home() / ".local" / "share"
    app_dir = base / "ECHpro"
    app_dir.mkdir(parents=True, exist_ok=True)
    return app_dir


def _get_machine_id() -> str:
    """Identificador único da máquina (para licença vinculada)."""
    try:
        node = str(uuid.getnode())
        name = platform.node() or "unknown"
        system = platform.system() or ""
        raw = f"{node}-{name}-{system}-ECHpro"
        return hashlib.sha256(raw.encode()).hexdigest()[:16].upper()
    except Exception:
        return "UNKNOWN-MACHINE"


def _normalize_key(key: str) -> str:
    """Remove espaços e hífens e coloca em maiúsculas."""
    return "".join(c for c in key.upper() if c.isalnum())


def _key_checksum(body: str) -> str:
    """Gera 4 caracteres de verificação a partir do corpo da chave."""
    dig = hmac.new(_LICENSE_SECRET, body.encode(), hashlib.sha256).hexdigest()
    return dig[:4].upper()


def generate_activation_key(seed: int | str = None) -> str:
    """Gera uma chave de activação válida no formato ECHP-XXXX-XXXX-XXXX-XXXX."""
    if seed is None:
        seed = str(uuid.uuid4().int % 10**12)
    seed = str(seed)
    raw = hmac.new(_LICENSE_SECRET, f"ECHP-KEY-{seed}".encode(), hashlib.sha256).hexdigest().upper()
    body = raw[:12]          # 12 caracteres
    check = _key_checksum(body)  # 4 caracteres
    p1, p2, p3, p4 = body[0:4], body[4:8], body[8:12], check
    return f"{_LICENSE_PREFIX}-{p1}-{p2}-{p3}-{p4}"


def validate_activation_key(key: str) -> bool:
    """Verifica se a chave tem formato e checksum válidos."""
    norm = _normalize_key(key)
    # Esperado: ECHP + 12 body + 4 check = 20 caracteres
    if len(norm) < 20:
        return False
    if norm.startswith(_LICENSE_PREFIX):
        body = norm[4:16]
        check = norm[16:20]
    else:
        body = norm[:12]
        check = norm[12:16]
    if len(body) != 12 or len(check) != 4:
        return False
    return hmac.compare_digest(_key_checksum(body), check)


def _license_path() -> Path:
    return get_app_data_dir() / "license.dat"


def _trial_path() -> Path:
    return get_app_data_dir() / "trial.dat"


def is_licensed() -> bool:
    """Retorna True se existir uma licença válida activada nesta máquina."""
    path = _license_path()
    if not path.exists():
        return False
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        key = data.get("key", "")
        stored_machine = data.get("machine", "")
        if not validate_activation_key(key):
            return False
        # Opcional: verificar se está na mesma máquina
        current = _get_machine_id()
        if stored_machine and stored_machine != current:
            # Permitir em outra máquina apenas se o utilizador reactivar
            return False
        return True
    except Exception:
        return False


def get_license_info() -> dict:
    """Informação da licença actual (ou vazio)."""
    path = _license_path()
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def activate_license(key: str) -> tuple[bool, str]:
    """
    Tenta activar a chave.
    Retorna (sucesso, mensagem).
    """
    key = key.strip().upper()
    if not validate_activation_key(key):
        return False, "Chave de activação inválida.\nVerifique se digitou correctamente."
    try:
        data = {
            "key": key,
            "machine": _get_machine_id(),
            "activated_at": datetime.utcnow().isoformat() + "Z",
            "app_version": "2.2.0",
        }
        _license_path().write_text(json.dumps(data, indent=2), encoding="utf-8")
        return True, "Aplicação activada com sucesso!\nObrigado por adquirir o ECHpro."
    except Exception as e:
        return False, f"Erro ao guardar licença:\n{e}"


def get_trial_status() -> tuple[bool, int]:
    """
    Retorna (em_trial, dias_restantes).
    Se o ficheiro de trial não existir, cria-o com a data actual.
    """
    path = _trial_path()
    today = date.today()
    try:
        if not path.exists():
            path.write_text(today.isoformat(), encoding="utf-8")
            return True, _TRIAL_DAYS
        start = date.fromisoformat(path.read_text(encoding="utf-8").strip())
        used = (today - start).days
        remaining = max(_TRIAL_DAYS - used, 0)
        return remaining > 0, remaining
    except Exception:
        return False, 0


def can_run() -> tuple[bool, str]:
    """
    Verifica se a aplicação pode ser executada.
    Retorna (pode_correr, mensagem).
    """
    if is_licensed():
        info = get_license_info()
        key = info.get("key", "")
        masked = key[:9] + "****" + key[-4:] if len(key) > 13 else "********"
        return True, f"Licença activa ({masked})"
    in_trial, days = get_trial_status()
    if in_trial:
        return True, f"Período de avaliação — {days} dia(s) restante(s)"
    return False, "Período de avaliação terminou. Active o produto com uma chave válida."


# ══════════════════════════════════════════════════════════════════════════
#  BASE DE DADOS
# ══════════════════════════════════════════════════════════════════════════


DB_PATH = get_app_data_dir() / "echpro.db"
engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False,
)


@event.listens_for(engine, "connect")
def _set_pragma(dbapi_conn, _):
    cur = dbapi_conn.cursor()
    cur.execute("PRAGMA foreign_keys=ON")
    cur.execute("PRAGMA journal_mode=WAL")
    cur.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_session():
    return SessionLocal()


# ── Modelos ───────────────────────────────────────────────────────────────

class Empresa(Base):
    __tablename__ = "empresa"
    id = Column(Integer, primary_key=True)
    nome = Column(String(255), nullable=False)
    endereco = Column(String(255))
    cidade = Column(String(100))
    bairro = Column(String(100))
    nuit = Column(String(50), unique=True)
    telefone1 = Column(String(50))
    telefone2 = Column(String(50))
    email = Column(String(150))
    observacao = Column(Text)
    criado_em = Column(DateTime, default=datetime.utcnow)


class Utilizador(Base):
    __tablename__ = "utilizadores"
    id = Column(Integer, primary_key=True)
    nome_usuario = Column(String(100), unique=True, nullable=False)
    nome_completo = Column(String(200))
    senha_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="recepcionista")
    activo = Column(Integer, default=1)
    ultimo_login = Column(DateTime)
    criado_em = Column(DateTime, default=datetime.utcnow)


class Nacionalidade(Base):
    __tablename__ = "nacionalidades"
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), unique=True, nullable=False)


class TipoDocumento(Base):
    __tablename__ = "tipos_documento"
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), unique=True, nullable=False)


class FormaPagamento(Base):
    __tablename__ = "formas_pagamento"
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), unique=True, nullable=False)


class CategoriaServico(Base):
    __tablename__ = "categorias_servico"
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), unique=True, nullable=False)


class Quarto(Base):
    __tablename__ = "quartos"
    id = Column(Integer, primary_key=True)
    numero = Column(String(50), unique=True, nullable=False)
    tipo = Column(String(100), nullable=False)
    preco_diaria = Column(Float, default=0)
    capacidade = Column(Integer, default=2)
    status = Column(String(30), default="disponivel")
    observacao = Column(Text)
    activo = Column(Integer, default=1)
    checkins = relationship("Checkin", back_populates="quarto")


class Servico(Base):
    __tablename__ = "servicos"
    id = Column(Integer, primary_key=True)
    categoria_id = Column(Integer, ForeignKey("categorias_servico.id"))
    nome = Column(String(200), nullable=False)
    preco_unitario = Column(Float, default=0)
    activo = Column(Integer, default=1)
    categoria = relationship("CategoriaServico")


class Hospede(Base):
    __tablename__ = "hospedes"
    id = Column(Integer, primary_key=True)
    nome = Column(String(255), nullable=False)
    endereco = Column(String(255))
    cidade = Column(String(100))
    bairro = Column(String(100))
    nuit = Column(String(50))
    telefone1 = Column(String(50))
    telefone2 = Column(String(50))
    email = Column(String(150))
    tipo_documento_id = Column(Integer, ForeignKey("tipos_documento.id"))
    numero_documento = Column(String(100))
    validade_documento = Column(Date)
    data_nascimento = Column(Date)
    nacionalidade_id = Column(Integer, ForeignKey("nacionalidades.id"))
    pais_origem = Column(String(100))
    empresa = Column(String(200))
    observacao = Column(Text)
    criado_em = Column(DateTime, default=datetime.utcnow)
    tipo_documento = relationship("TipoDocumento")
    nacionalidade = relationship("Nacionalidade")
    checkins = relationship("Checkin", back_populates="hospede")


class Checkin(Base):
    __tablename__ = "checkins"
    id = Column(Integer, primary_key=True)
    hospede_id = Column(Integer, ForeignKey("hospedes.id"), nullable=False)
    quarto_id = Column(Integer, ForeignKey("quartos.id"), nullable=False)
    empresa_referencia = Column(String(200))
    data_checkin = Column(DateTime, nullable=False)
    data_checkout = Column(DateTime)
    nr_adultos = Column(Integer, default=1)
    nr_criancas = Column(Integer, default=0)
    noites = Column(Float, default=0)
    preco_diaria = Column(Float, nullable=False)
    total_quarto = Column(Float, default=0)
    desconto_noite = Column(Float, default=0)
    total_desconto = Column(Float, default=0)
    subtotal = Column(Float, default=0)
    total_servicos = Column(Float, default=0)
    total_liquido = Column(Float, default=0)
    valor_pago = Column(Float, default=0)
    saldo = Column(Float, default=0)
    status = Column(String(30), default="CHECKIN")
    observacao = Column(Text)
    criado_por = Column(Integer, ForeignKey("utilizadores.id"))
    criado_em = Column(DateTime, default=datetime.utcnow)
    hospede = relationship("Hospede", back_populates="checkins")
    quarto = relationship("Quarto", back_populates="checkins")
    servicos = relationship("CheckinServico", back_populates="checkin", cascade="all, delete-orphan")
    parcelas = relationship("Parcela", back_populates="checkin", cascade="all, delete-orphan")


class CheckinServico(Base):
    __tablename__ = "checkin_servicos"
    id = Column(Integer, primary_key=True)
    checkin_id = Column(Integer, ForeignKey("checkins.id", ondelete="CASCADE"), nullable=False)
    servico_id = Column(Integer, ForeignKey("servicos.id"))
    descricao = Column(String(255), nullable=False)
    quantidade = Column(Float, default=1)
    preco_unitario = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    data = Column(DateTime, default=datetime.utcnow)
    checkin = relationship("Checkin", back_populates="servicos")
    servico = relationship("Servico")


class Parcela(Base):
    __tablename__ = "parcelas"
    id = Column(Integer, primary_key=True)
    checkin_id = Column(Integer, ForeignKey("checkins.id", ondelete="CASCADE"), nullable=False)
    numero_parcela = Column(String(50))
    data_parcela = Column(Date)
    valor_parcela = Column(Float, default=0)
    data_pagamento = Column(Date)
    forma_pagamento_id = Column(Integer, ForeignKey("formas_pagamento.id"))
    referencia = Column(String(100))
    outros = Column(String(255))
    valor_pago = Column(Float, default=0)
    saldo_parcela = Column(Float, default=0)
    checkin = relationship("Checkin", back_populates="parcelas")
    forma_pagamento = relationship("FormaPagamento")


class LivroCaixa(Base):
    __tablename__ = "livro_caixa"
    id = Column(Integer, primary_key=True)
    checkin_id = Column(Integer, ForeignKey("checkins.id"))
    parcela_id = Column(Integer, ForeignKey("parcelas.id"))
    tipo = Column(String(20), nullable=False)
    descricao = Column(String(255), nullable=False)
    valor = Column(Float, nullable=False)
    forma_pagamento_id = Column(Integer, ForeignKey("formas_pagamento.id"))
    data_movimento = Column(DateTime, default=datetime.utcnow)
    utilizador_id = Column(Integer, ForeignKey("utilizadores.id"))
    observacao = Column(Text)


def init_db():
    Base.metadata.create_all(bind=engine)
    session = get_session()
    try:
        if session.query(Utilizador).count() == 0:
            session.add(Utilizador(
                nome_usuario="admin",
                nome_completo="Administrador do Sistema",
                senha_hash=hash_password("admin123"),
                role="admin",
            ))
            for n in ["Dinheiro", "Cartão", "Transferência", "M-Pesa", "Cheque"]:
                session.add(FormaPagamento(nome=n))
            for n in ["BI", "Passaporte", "Carta de Condução", "DIRE", "Outro"]:
                session.add(TipoDocumento(nome=n))
            for n in ["Moçambicana", "Sul-Africana", "Portuguesa", "Brasileira",
                      "Chinesa", "Indiana", "Zimbabuense", "Outra"]:
                session.add(Nacionalidade(nome=n))
            for n in ["Bar", "Restaurante", "Lavandaria", "Extra", "Outros"]:
                session.add(CategoriaServico(nome=n))
            # Quartos de exemplo (baseados no original)
            exemplos = [
                ("Q 111", "CASAL", 3500), ("Q 112", "CASAL", 3500),
                ("Q 113", "CASAL", 3500), ("Q 114", "KING", 3500),
                ("Q 115", "KING", 3500), ("Q 116", "KING", 3500),
                ("Q 117", "ARMAZEM", 3500), ("Q122", "SOLTEIRO 2 CAMAS", 3500),
                ("Q123", "KING", 3500), ("Q 05", "KING", 3500),
                ("Q 21", "KING", 3500), ("Q 22", "KING", 3500),
            ]
            for num, tipo, preco in exemplos:
                session.add(Quarto(numero=num, tipo=tipo, preco_diaria=preco))
            session.commit()
            print("[OK] Base de dados inicializada.")
    except Exception as e:
        session.rollback()
        print(f"[ERRO] Init BD: {e}")
        raise
    finally:
        session.close()


# ══════════════════════════════════════════════════════════════════════════
#  ACTIVACÃO / LICENÇA
# ══════════════════════════════════════════════════════════════════════════

class ActivationWindow(ctk.CTk):
    def __init__(self, on_success):
        super().__init__()
        setup_theme()
        self.on_success = on_success
        self.title("ECHpro — Activação")
        self.geometry("480x620")
        self.resizable(False, False)
        self.configure(fg_color=COLORS["bg_dark"])
        self.update_idletasks()
        x = (self.winfo_screenwidth() // 2) - 240
        y = (self.winfo_screenheight() // 2) - 310
        self.geometry(f"+{x}+{y}")
        self._build()

    def _build(self):
        header = ctk.CTkFrame(self, fg_color=COLORS["primary"], corner_radius=0, height=100)
        header.pack(fill="x")
        header.pack_propagate(False)
        ctk.CTkLabel(header, text="🔑  Activação do ECHpro",
                     font=("Segoe UI", 20, "bold"), text_color="white").pack(pady=(25, 4))
        ctk.CTkLabel(header, text="Introduza a chave de activação",
                     font=FONTS["small"], text_color="#5eead4").pack()

        card = ctk.CTkFrame(self, fg_color=COLORS["bg_card"], corner_radius=12)
        card.pack(padx=30, pady=25, fill="both", expand=True)

        can, msg = can_run()
        status_color = COLORS["success"] if can else COLORS["danger"]
        ctk.CTkLabel(card, text=msg, font=FONTS["body"],
                     text_color=status_color).pack(pady=(20, 15), padx=20)

        ctk.CTkLabel(card, text="Chave de Activação", font=FONTS["small"],
                     text_color=COLORS["text_muted"], anchor="w").pack(fill="x", padx=30)
        self.entry_key = ctk.CTkEntry(
            card, placeholder_text="ECHP-XXXX-XXXX-XXXX-XXXX",
            height=42, font=("Consolas", 14),
            fg_color=COLORS["bg_input"], border_color=COLORS["border"]
        )
        self.entry_key.pack(fill="x", padx=30, pady=(5, 8))
        self.entry_key.bind("<Return>", lambda e: self._activar())

        ctk.CTkButton(card, text="ACTIVAR AGORA", height=42, font=FONTS["button"],
                      fg_color=COLORS["primary"], hover_color=COLORS["primary_hover"],
                      command=self._activar).pack(fill="x", padx=30, pady=(10, 8))

        if can:
            ctk.CTkButton(card, text="Continuar em modo avaliação / licença", height=36,
                          font=FONTS["small"], fg_color="transparent",
                          border_width=1, border_color=COLORS["border"],
                          text_color=COLORS["text"],
                          command=self._continuar).pack(fill="x", padx=30, pady=(5, 10))
        else:
            ctk.CTkLabel(card, text="O período de avaliação terminou.\nContacte o suporte para adquirir uma chave.",
                         font=FONTS["small"], text_color=COLORS["text_muted"]).pack(pady=10)

        _logo_act = get_logo("full", 70)
        if _logo_act:
            ctk.CTkLabel(card, text="", image=_logo_act).pack(pady=(10, 0))
        ctk.CTkLabel(card, text="Apoio: +258 82 747 3434  |  ebenchume@sapo.mz",
                     font=("Segoe UI", 11), text_color=COLORS["accent"]).pack(pady=(8, 15))
        self.entry_key.focus()

    def _activar(self):
        key = self.entry_key.get().strip()
        if not key:
            messagebox.showwarning("Atenção", "Introduza a chave de activação.")
            return
        ok, msg = activate_license(key)
        if ok:
            messagebox.showinfo("Activado", msg)
            self.destroy()
            self.on_success()
        else:
            messagebox.showerror("Chave inválida", msg)

    def _continuar(self):
        self.destroy()
        self.on_success()


# ══════════════════════════════════════════════════════════════════════════
#  LOGIN
# ══════════════════════════════════════════════════════════════════════════

class LoginWindow(ctk.CTk):
    def __init__(self, on_success):
        super().__init__()
        setup_theme()
        self.on_success = on_success
        self.title("ECHpro — Login")
        self.geometry("420x520")
        self.resizable(False, False)
        self.configure(fg_color=COLORS["bg_dark"])
        self.update_idletasks()
        x = (self.winfo_screenwidth() // 2) - 210
        y = (self.winfo_screenheight() // 2) - 260
        self.geometry(f"+{x}+{y}")
        self._build()

    def _build(self):
        header = ctk.CTkFrame(self, fg_color=COLORS["primary"], corner_radius=0, height=120)
        header.pack(fill="x")
        header.pack_propagate(False)
        ctk.CTkLabel(header, text="🏨  ECHpro",
                     font=("Segoe UI", 22, "bold"), text_color="white").pack(pady=(30, 5))
        ctk.CTkLabel(header, text="Sistema de Gestão de Hóspedes",
                     font=FONTS["small"], text_color="#5eead4").pack()

        card = ctk.CTkFrame(self, fg_color=COLORS["bg_card"], corner_radius=12)
        card.pack(padx=30, pady=30, fill="both", expand=True)

        ctk.CTkLabel(card, text="Iniciar Sessão", font=FONTS["heading"],
                     text_color=COLORS["text"]).pack(pady=(25, 20))

        ctk.CTkLabel(card, text="Utilizador", font=FONTS["small"],
                     text_color=COLORS["text_muted"], anchor="w").pack(fill="x", padx=30)
        self.entry_user = ctk.CTkEntry(card, placeholder_text="nome de utilizador",
                                       height=40, font=FONTS["body"],
                                       fg_color=COLORS["bg_input"], border_color=COLORS["border"])
        self.entry_user.pack(fill="x", padx=30, pady=(5, 15))
        self.entry_user.insert(0, "admin")

        ctk.CTkLabel(card, text="Senha", font=FONTS["small"],
                     text_color=COLORS["text_muted"], anchor="w").pack(fill="x", padx=30)
        self.entry_pass = ctk.CTkEntry(card, placeholder_text="••••••••", show="•",
                                       height=40, font=FONTS["body"],
                                       fg_color=COLORS["bg_input"], border_color=COLORS["border"])
        self.entry_pass.pack(fill="x", padx=30, pady=(5, 10))
        self.entry_pass.bind("<Return>", lambda e: self._login())

        ctk.CTkButton(card, text="ENTRAR", height=42, font=FONTS["button"],
                      fg_color=COLORS["primary"], hover_color=COLORS["primary_hover"],
                      command=self._login).pack(fill="x", padx=30, pady=(20, 8))

        ctk.CTkLabel(card, text="Versão 2.2  •  Windows 10/11  •  Ficheiro Único",
                     font=("Segoe UI", 10), text_color=COLORS["text_muted"]).pack(pady=(8, 4))
        ctk.CTkLabel(card, text="Apoio: +258 82 747 3434  |  ebenchume@sapo.mz",
                     font=("Segoe UI", 10), text_color=COLORS["accent"]).pack(pady=(0, 15))
        self.entry_pass.focus()

    def _login(self):
        user = self.entry_user.get().strip()
        pwd = self.entry_pass.get()
        if not user or not pwd:
            messagebox.showwarning("Atenção", "Preencha utilizador e senha.")
            return
        session = get_session()
        try:
            util = session.query(Utilizador).filter_by(nome_usuario=user, activo=1).first()
            if util and verify_password(pwd, util.senha_hash):
                util.ultimo_login = datetime.utcnow()
                session.commit()
                # Detach para usar fora da sessão
                uid, unome, urole, unome_c = util.id, util.nome_usuario, util.role, util.nome_completo
                self.destroy()
                # Recriar objecto simples
                class U:
                    pass
                u = U()
                u.id, u.nome_usuario, u.role, u.nome_completo = uid, unome, urole, unome_c
                self.on_success(u)
            else:
                messagebox.showerror("Erro", "Utilizador ou senha incorrectos.")
                self.entry_pass.delete(0, "end")
        except Exception as e:
            messagebox.showerror("Erro", f"Falha ao autenticar:\n{e}")
        finally:
            session.close()


# ══════════════════════════════════════════════════════════════════════════
#  JANELA PRINCIPAL
# ══════════════════════════════════════════════════════════════════════════

class MainWindow(ctk.CTk):
    def __init__(self, utilizador):
        super().__init__()
        setup_theme()
        self.utilizador = utilizador
        self.title(f"ECHpro — {utilizador.nome_completo or utilizador.nome_usuario}")
        self.geometry("1280x780")
        self.minsize(1100, 700)
        self.configure(fg_color=COLORS["bg_dark"])
        self._build_layout()
        self._show_dashboard()

    def _build_layout(self):
        self.sidebar = ctk.CTkFrame(self, width=220, fg_color=COLORS["bg_card"], corner_radius=0)
        self.sidebar.pack(side="left", fill="y")
        self.sidebar.pack_propagate(False)

        ctk.CTkLabel(self.sidebar, text="🏨 ECHpro",
                     font=("Segoe UI", 18, "bold"), text_color=COLORS["secondary"]).pack(pady=(25, 5), padx=15)
        ctk.CTkLabel(self.sidebar, text=f"{self.utilizador.nome_usuario}  ({self.utilizador.role})",
                     font=FONTS["small"], text_color=COLORS["text_muted"]).pack(pady=(0, 20))

        menu = [
            ("📊  Dashboard", self._show_dashboard),
            ("🛏️  Quartos", self._show_quartos),
            ("👤  Hóspedes", self._show_hospedes),
            ("🔑  Check-in / Out", self._show_checkins),
            ("🍹  Serviços", self._show_servicos),
            ("💰  Pagamentos", self._show_pagamentos),
            ("📒  Livro de Caixa", self._show_caixa),
            ("📈  Relatórios", self._show_relatorios),
            ("⚙️  Configurações", self._show_config),
        ]
        for text, cmd in menu:
            ctk.CTkButton(self.sidebar, text=text, anchor="w", height=38,
                          font=FONTS["body"], fg_color="transparent",
                          hover_color=COLORS["primary"], text_color=COLORS["text"],
                          command=cmd).pack(fill="x", padx=10, pady=2)

        # Rodapé com contactos de apoio
        footer = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        footer.pack(side="bottom", fill="x", padx=10, pady=(0, 8))
        _logo_side = get_logo("full", 110)
        if _logo_side:
            ctk.CTkLabel(footer, text="", image=_logo_side).pack(pady=(0, 6))
        ctk.CTkLabel(footer, text="Apoio: +258 82 747 3434",
                     font=("Segoe UI", 10), text_color=COLORS["text_muted"]).pack()
        ctk.CTkLabel(footer, text="ebenchume@sapo.mz",
                     font=("Segoe UI", 10), text_color=COLORS["text_muted"]).pack()
        ctk.CTkLabel(footer, text="v2.2.0",
                     font=("Segoe UI", 9), text_color=COLORS["border"]).pack(pady=(2, 0))

        ctk.CTkButton(self.sidebar, text="🚪  Sair", height=38, font=FONTS["body"],
                      fg_color=COLORS["danger"], hover_color="#c0392b",
                      command=self._logout).pack(side="bottom", fill="x", padx=15, pady=(5, 10))

        self.content = ctk.CTkFrame(self, fg_color=COLORS["bg_dark"], corner_radius=0)
        self.content.pack(side="right", fill="both", expand=True)

    def _clear(self):
        for w in self.content.winfo_children():
            w.destroy()

    def _logout(self):
        if messagebox.askyesno("Sair", "Deseja terminar a sessão?"):
            self.destroy()
            def restart(u):
                MainWindow(u).mainloop()
            LoginWindow(restart).mainloop()

    # ── Dashboard ─────────────────────────────────────────────────────────
    def _show_dashboard(self):
        self._clear()
        ctk.CTkLabel(self.content, text="Dashboard", font=FONTS["title"],
                     text_color=COLORS["text"]).pack(anchor="w", padx=30, pady=(25, 15))

        cards_frame = ctk.CTkFrame(self.content, fg_color="transparent")
        cards_frame.pack(fill="x", padx=30)

        session = get_session()
        try:
            total_q = session.query(Quarto).filter_by(activo=1).count()
            ocup = session.query(Quarto).filter_by(status="ocupado", activo=1).count()
            disp = session.query(Quarto).filter_by(status="disponivel", activo=1).count()
            activos = session.query(Checkin).filter_by(status="CHECKIN").count()
            hosp = session.query(Hospede).count()
        finally:
            session.close()

        stats = [
            ("Quartos Totais", str(total_q), COLORS["primary"]),
            ("Disponíveis", str(disp), COLORS["success"]),
            ("Ocupados", str(ocup), COLORS["warning"]),
            ("Check-ins Activos", str(activos), COLORS["secondary"]),
            ("Hóspedes", str(hosp), COLORS["accent"]),
        ]
        for i, (title, value, color) in enumerate(stats):
            card = ctk.CTkFrame(cards_frame, fg_color=COLORS["bg_card"], corner_radius=10, width=180, height=110)
            card.grid(row=0, column=i, padx=8, pady=5, sticky="nsew")
            card.grid_propagate(False)
            cards_frame.columnconfigure(i, weight=1)
            ctk.CTkLabel(card, text=title, font=FONTS["small"],
                         text_color=COLORS["text_muted"]).pack(pady=(18, 5))
            ctk.CTkLabel(card, text=value, font=("Segoe UI", 28, "bold"),
                         text_color=color).pack()

        ctk.CTkLabel(self.content, text="Check-ins Activos", font=FONTS["heading"],
                     text_color=COLORS["text"]).pack(anchor="w", padx=30, pady=(30, 10))

        table = ctk.CTkScrollableFrame(self.content, fg_color=COLORS["bg_card"], corner_radius=10)
        table.pack(fill="both", expand=True, padx=30, pady=(0, 20))

        headers = ["ID", "Hóspede", "Quarto", "Check-in", "Check-out", "Saldo", "Status"]
        hr = ctk.CTkFrame(table, fg_color=COLORS["primary"], height=36)
        hr.pack(fill="x", pady=(0, 2))
        for h in headers:
            ctk.CTkLabel(hr, text=h, font=FONTS["small"], text_color="white", width=120).pack(side="left", padx=5, pady=5)

        session = get_session()
        try:
            for c in session.query(Checkin).filter_by(status="CHECKIN").order_by(Checkin.data_checkin.desc()).limit(30).all():
                row = ctk.CTkFrame(table, fg_color="transparent")
                row.pack(fill="x", pady=1)
                nome = c.hospede.nome if c.hospede else "—"
                if len(nome) > 22:
                    nome = nome[:22] + "…"
                vals = [
                    str(c.id), nome,
                    c.quarto.numero if c.quarto else "—",
                    c.data_checkin.strftime("%d/%m/%Y") if c.data_checkin else "—",
                    c.data_checkout.strftime("%d/%m/%Y") if c.data_checkout else "—",
                    f"{c.saldo:,.2f}", c.status,
                ]
                for v in vals:
                    ctk.CTkLabel(row, text=v, font=FONTS["small"], text_color=COLORS["text"],
                                 width=120).pack(side="left", padx=5)
        finally:
            session.close()

    # ── Quartos ───────────────────────────────────────────────────────────
    def _show_quartos(self):
        self._clear()
        top = ctk.CTkFrame(self.content, fg_color="transparent")
        top.pack(fill="x", padx=30, pady=(20, 10))
        ctk.CTkLabel(top, text="Gestão de Quartos", font=FONTS["title"],
                     text_color=COLORS["text"]).pack(side="left")
        ctk.CTkButton(top, text="+ Novo Quarto", height=36, font=FONTS["button"],
                      fg_color=COLORS["primary"], hover_color=COLORS["primary_hover"],
                      command=lambda: self._form_quarto()).pack(side="right")

        self._q_table = ctk.CTkScrollableFrame(self.content, fg_color=COLORS["bg_card"], corner_radius=10)
        self._q_table.pack(fill="both", expand=True, padx=30, pady=(0, 20))
        self._load_quartos()

    def _load_quartos(self):
        for w in self._q_table.winfo_children():
            w.destroy()
        headers = ["Nº", "Tipo", "Preço Diária", "Capacidade", "Status", "Acções"]
        hr = ctk.CTkFrame(self._q_table, fg_color=COLORS["primary"], height=36)
        hr.pack(fill="x")
        for h in headers:
            ctk.CTkLabel(hr, text=h, font=FONTS["small"], text_color="white", width=140).pack(side="left", padx=8, pady=6)

        session = get_session()
        try:
            for q in session.query(Quarto).filter_by(activo=1).order_by(Quarto.numero).all():
                row = ctk.CTkFrame(self._q_table, fg_color="transparent")
                row.pack(fill="x", pady=1)
                sc = {"disponivel": COLORS["success"], "ocupado": COLORS["warning"],
                      "manutencao": COLORS["danger"]}.get(q.status, COLORS["text"])
                for i, v in enumerate([q.numero, q.tipo, f"{q.preco_diaria:,.2f}", str(q.capacidade), q.status.upper()]):
                    ctk.CTkLabel(row, text=v, font=FONTS["small"],
                                 text_color=sc if i == 4 else COLORS["text"], width=140).pack(side="left", padx=8)
                act = ctk.CTkFrame(row, fg_color="transparent", width=140)
                act.pack(side="left", padx=8)
                ctk.CTkButton(act, text="Editar", width=60, height=26, font=FONTS["small"],
                              fg_color=COLORS["primary"],
                              command=lambda qid=q.id: self._form_quarto(qid)).pack(side="left", padx=2)
                ctk.CTkButton(act, text="×", width=30, height=26, font=FONTS["small"],
                              fg_color=COLORS["danger"],
                              command=lambda qid=q.id: self._del_quarto(qid)).pack(side="left")
        finally:
            session.close()

    def _form_quarto(self, qid=None):
        win = ctk.CTkToplevel(self)
        win.title("Novo Quarto" if not qid else "Editar Quarto")
        win.geometry("400x420")
        win.configure(fg_color=COLORS["bg_dark"])
        win.grab_set()

        q = None
        if qid:
            session = get_session()
            q = session.query(Quarto).get(qid)
            session.close()

        ctk.CTkLabel(win, text="Nº do Quarto", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30, pady=(20, 2))
        e_num = ctk.CTkEntry(win, height=36)
        e_num.pack(fill="x", padx=30)
        if q:
            e_num.insert(0, q.numero)

        ctk.CTkLabel(win, text="Tipo", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30, pady=(12, 2))
        e_tipo = ctk.CTkComboBox(win, values=["CASAL", "KING", "SOLTEIRO", "SOLTEIRO 2 CAMAS",
                                               "FAMÍLIA", "SUITE", "ARMAZEM"], height=36)
        e_tipo.pack(fill="x", padx=30)
        if q:
            e_tipo.set(q.tipo)

        ctk.CTkLabel(win, text="Preço Diária", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30, pady=(12, 2))
        e_preco = ctk.CTkEntry(win, height=36)
        e_preco.pack(fill="x", padx=30)
        e_preco.insert(0, str(q.preco_diaria) if q else "3500")

        ctk.CTkLabel(win, text="Capacidade", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30, pady=(12, 2))
        e_cap = ctk.CTkEntry(win, height=36)
        e_cap.pack(fill="x", padx=30)
        e_cap.insert(0, str(q.capacidade) if q else "2")

        def salvar():
            num = e_num.get().strip()
            tipo = e_tipo.get().strip()
            preco = safe_float(e_preco.get(), -1)
            cap = safe_int(e_cap.get(), 0)
            if preco < 0 or cap < 1:
                messagebox.showerror("Erro", "Preço ou capacidade inválidos.")
                return
            if not num or not tipo:
                messagebox.showwarning("Atenção", "Preencha número e tipo.")
                return
            session = get_session()
            try:
                if qid:
                    qq = session.query(Quarto).get(qid)
                    if not qq:
                        messagebox.showerror("Erro", "Quarto não encontrado.")
                        return
                    qq.numero, qq.tipo, qq.preco_diaria, qq.capacidade = num, tipo, preco, cap
                else:
                    session.add(Quarto(numero=num, tipo=tipo, preco_diaria=preco, capacidade=cap))
                session.commit()
                win.destroy()
                self._load_quartos()
            except Exception as e:
                session.rollback()
                messagebox.showerror("Erro", str(e))
            finally:
                session.close()

        ctk.CTkButton(win, text="Guardar", height=40, font=FONTS["button"],
                      fg_color=COLORS["primary"], command=salvar).pack(fill="x", padx=30, pady=25)

    def _del_quarto(self, qid):
        if not messagebox.askyesno("Confirmar", "Desactivar este quarto?"):
            return
        session = get_session()
        try:
            q = session.query(Quarto).get(qid)
            if q:
                q.activo = 0
                session.commit()
                self._load_quartos()
        finally:
            session.close()

    # ── Hóspedes ──────────────────────────────────────────────────────────
    def _show_hospedes(self):
        self._clear()
        top = ctk.CTkFrame(self.content, fg_color="transparent")
        top.pack(fill="x", padx=30, pady=(20, 10))
        ctk.CTkLabel(top, text="Cadastro de Hóspedes", font=FONTS["title"],
                     text_color=COLORS["text"]).pack(side="left")
        ctk.CTkButton(top, text="+ Novo Hóspede", height=36, font=FONTS["button"],
                      fg_color=COLORS["primary"], command=lambda: self._form_hospede()).pack(side="right")

        sf = ctk.CTkFrame(self.content, fg_color="transparent")
        sf.pack(fill="x", padx=30, pady=(0, 10))
        self._h_search = ctk.CTkEntry(sf, placeholder_text="Pesquisar por nome ou documento…", height=36)
        self._h_search.pack(side="left", fill="x", expand=True)
        self._h_search.bind("<KeyRelease>", lambda e: self._load_hospedes())
        ctk.CTkButton(sf, text="Buscar", width=80, height=36, command=self._load_hospedes).pack(side="left", padx=(8, 0))

        self._h_table = ctk.CTkScrollableFrame(self.content, fg_color=COLORS["bg_card"], corner_radius=10)
        self._h_table.pack(fill="both", expand=True, padx=30, pady=(0, 20))
        self._load_hospedes()

    def _load_hospedes(self):
        for w in self._h_table.winfo_children():
            w.destroy()
        headers = ["Nome", "Documento", "Telefone", "Nacionalidade", "Empresa", "Acções"]
        hr = ctk.CTkFrame(self._h_table, fg_color=COLORS["primary"], height=36)
        hr.pack(fill="x")
        for h in headers:
            ctk.CTkLabel(hr, text=h, font=FONTS["small"], text_color="white", width=150).pack(side="left", padx=6, pady=6)

        termo = self._h_search.get().strip().lower() if hasattr(self, "_h_search") else ""
        session = get_session()
        try:
            q = session.query(Hospede)
            if termo:
                q = q.filter((Hospede.nome.ilike(f"%{termo}%")) | (Hospede.numero_documento.ilike(f"%{termo}%")))
            for h in q.order_by(Hospede.nome).limit(200).all():
                row = ctk.CTkFrame(self._h_table, fg_color="transparent")
                row.pack(fill="x", pady=1)
                nome = h.nome[:28] + "…" if len(h.nome) > 28 else h.nome
                nac = h.nacionalidade.nome if h.nacionalidade else "—"
                emp = (h.empresa[:18] + "…") if h.empresa and len(h.empresa) > 18 else (h.empresa or "—")
                for v in [nome, h.numero_documento or "—", h.telefone1 or "—", nac, emp]:
                    ctk.CTkLabel(row, text=v, font=FONTS["small"], text_color=COLORS["text"],
                                 width=150).pack(side="left", padx=6)
                act = ctk.CTkFrame(row, fg_color="transparent", width=150)
                act.pack(side="left", padx=6)
                ctk.CTkButton(act, text="Editar", width=60, height=26, font=FONTS["small"],
                              fg_color=COLORS["primary"],
                              command=lambda hid=h.id: self._form_hospede(hid)).pack(side="left", padx=2)
        finally:
            session.close()

    def _form_hospede(self, hid=None):
        win = ctk.CTkToplevel(self)
        win.title("Novo Hóspede" if not hid else "Editar Hóspede")
        win.geometry("520x580")
        win.configure(fg_color=COLORS["bg_dark"])
        win.grab_set()

        h = None
        if hid:
            session = get_session()
            h = session.query(Hospede).get(hid)
            session.close()

        form = ctk.CTkScrollableFrame(win, fg_color="transparent")
        form.pack(fill="both", expand=True, padx=20, pady=15)

        fields = {}
        for key, label in [
            ("nome", "Nome Completo *"), ("telefone1", "Telefone"), ("email", "Email"),
            ("numero_documento", "Nº Documento"), ("empresa", "Empresa / Referência"),
            ("endereco", "Endereço"), ("cidade", "Cidade"), ("pais_origem", "País de Origem"),
            ("observacao", "Observação"),
        ]:
            ctk.CTkLabel(form, text=label, font=FONTS["small"],
                         text_color=COLORS["text_muted"]).pack(anchor="w", pady=(8, 2))
            e = ctk.CTkEntry(form, height=34)
            e.pack(fill="x")
            if h and getattr(h, key, None):
                e.insert(0, str(getattr(h, key)))
            fields[key] = e

        session = get_session()
        nacs = [n.nome for n in session.query(Nacionalidade).order_by(Nacionalidade.nome).all()]
        session.close()
        ctk.CTkLabel(form, text="Nacionalidade", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", pady=(8, 2))
        e_nac = ctk.CTkComboBox(form, values=nacs or ["Moçambicana"], height=34)
        e_nac.pack(fill="x")
        if h and h.nacionalidade:
            e_nac.set(h.nacionalidade.nome)

        def salvar():
            nome = fields["nome"].get().strip()
            if not nome:
                messagebox.showwarning("Atenção", "O nome é obrigatório.")
                return
            session = get_session()
            try:
                nac = session.query(Nacionalidade).filter_by(nome=e_nac.get()).first()
                if hid:
                    hh = session.query(Hospede).get(hid)
                else:
                    hh = Hospede()
                    session.add(hh)
                hh.nome = nome
                for k in ["telefone1", "email", "numero_documento", "empresa",
                          "endereco", "cidade", "pais_origem", "observacao"]:
                    setattr(hh, k, fields[k].get().strip() or None)
                hh.nacionalidade_id = nac.id if nac else None
                session.commit()
                win.destroy()
                self._load_hospedes()
            except Exception as e:
                session.rollback()
                messagebox.showerror("Erro", str(e))
            finally:
                session.close()

        ctk.CTkButton(win, text="Guardar Hóspede", height=40, font=FONTS["button"],
                      fg_color=COLORS["primary"], command=salvar).pack(fill="x", padx=30, pady=15)

    # ── Check-in / Out ────────────────────────────────────────────────────
    def _show_checkins(self):
        self._clear()
        top = ctk.CTkFrame(self.content, fg_color="transparent")
        top.pack(fill="x", padx=30, pady=(20, 10))
        ctk.CTkLabel(top, text="Check-in / Check-out", font=FONTS["title"],
                     text_color=COLORS["text"]).pack(side="left")
        ctk.CTkButton(top, text="+ Novo Check-in", height=36, font=FONTS["button"],
                      fg_color=COLORS["success"], hover_color="#27ae60",
                      command=self._novo_checkin).pack(side="right", padx=(8, 0))
        self._c_filtro = ctk.CTkSegmentedButton(top, values=["Activos", "Todos", "Checkout"],
                                                 command=lambda _: self._load_checkins())
        self._c_filtro.set("Activos")
        self._c_filtro.pack(side="right", padx=10)

        self._c_table = ctk.CTkScrollableFrame(self.content, fg_color=COLORS["bg_card"], corner_radius=10)
        self._c_table.pack(fill="both", expand=True, padx=30, pady=(0, 20))
        self._load_checkins()

    def _load_checkins(self):
        for w in self._c_table.winfo_children():
            w.destroy()
        headers = ["ID", "Hóspede", "Quarto", "Check-in", "Check-out", "Total", "Pago", "Saldo", "Status", "Acções"]
        widths = [50, 160, 70, 90, 90, 80, 80, 80, 90, 120]
        hr = ctk.CTkFrame(self._c_table, fg_color=COLORS["primary"], height=36)
        hr.pack(fill="x")
        for h, w in zip(headers, widths):
            ctk.CTkLabel(hr, text=h, font=FONTS["small"], text_color="white", width=w).pack(side="left", padx=3, pady=6)

        session = get_session()
        try:
            q = session.query(Checkin).order_by(Checkin.data_checkin.desc())
            f = self._c_filtro.get()
            if f == "Activos":
                q = q.filter_by(status="CHECKIN")
            elif f == "Checkout":
                q = q.filter_by(status="CHECKOUT")
            for c in q.limit(150).all():
                row = ctk.CTkFrame(self._c_table, fg_color="transparent")
                row.pack(fill="x", pady=1)
                nome = c.hospede.nome if c.hospede else "—"
                if len(nome) > 20:
                    nome = nome[:20] + "…"
                vals = [
                    str(c.id), nome,
                    c.quarto.numero if c.quarto else "—",
                    c.data_checkin.strftime("%d/%m/%y") if c.data_checkin else "—",
                    c.data_checkout.strftime("%d/%m/%y") if c.data_checkout else "—",
                    f"{c.total_liquido:,.0f}", f"{c.valor_pago:,.0f}", f"{c.saldo:,.0f}", c.status,
                ]
                for v, w in zip(vals, widths[:-1]):
                    color = COLORS["success"] if c.status == "CHECKIN" and v == c.status else COLORS["text"]
                    ctk.CTkLabel(row, text=v, font=FONTS["small"], text_color=color, width=w).pack(side="left", padx=3)
                act = ctk.CTkFrame(row, fg_color="transparent", width=120)
                act.pack(side="left", padx=3)
                if c.status == "CHECKIN":
                    ctk.CTkButton(act, text="Checkout", width=75, height=26, font=FONTS["small"],
                                  fg_color=COLORS["warning"],
                                  command=lambda cid=c.id: self._do_checkout(cid)).pack(side="left", padx=2)
        finally:
            session.close()

    def _novo_checkin(self):
        win = ctk.CTkToplevel(self)
        win.title("Novo Check-in")
        win.geometry("480x580")
        win.configure(fg_color=COLORS["bg_dark"])
        win.grab_set()

        form = ctk.CTkFrame(win, fg_color="transparent")
        form.pack(fill="both", expand=True, padx=25, pady=20)

        session = get_session()
        hospedes = session.query(Hospede).order_by(Hospede.nome).all()
        quartos = session.query(Quarto).filter_by(status="disponivel", activo=1).order_by(Quarto.numero).all()
        session.close()

        ctk.CTkLabel(form, text="Hóspede *", font=FONTS["small"], text_color=COLORS["text_muted"]).pack(anchor="w")
        e_h = ctk.CTkComboBox(form, values=[f"{h.id} - {h.nome}" for h in hospedes] or ["(cadastre hóspedes)"], height=36)
        e_h.pack(fill="x", pady=(2, 12))

        ctk.CTkLabel(form, text="Quarto *", font=FONTS["small"], text_color=COLORS["text_muted"]).pack(anchor="w")
        e_q = ctk.CTkComboBox(form, values=[f"{q.id} - {q.numero} ({q.tipo}) - {q.preco_diaria:,.0f}" for q in quartos] or ["(sem quartos)"], height=36)
        e_q.pack(fill="x", pady=(2, 12))

        ctk.CTkLabel(form, text="Data Check-in", font=FONTS["small"], text_color=COLORS["text_muted"]).pack(anchor="w")
        e_cin = ctk.CTkEntry(form, height=36)
        e_cin.insert(0, date.today().strftime("%d/%m/%Y"))
        e_cin.pack(fill="x", pady=(2, 12))

        ctk.CTkLabel(form, text="Data Check-out (prevista)", font=FONTS["small"], text_color=COLORS["text_muted"]).pack(anchor="w")
        e_cout = ctk.CTkEntry(form, height=36)
        e_cout.insert(0, (date.today() + timedelta(days=1)).strftime("%d/%m/%Y"))
        e_cout.pack(fill="x", pady=(2, 12))

        ctk.CTkLabel(form, text="Nº Adultos", font=FONTS["small"], text_color=COLORS["text_muted"]).pack(anchor="w")
        e_ad = ctk.CTkEntry(form, height=36)
        e_ad.insert(0, "1")
        e_ad.pack(fill="x", pady=(2, 12))

        ctk.CTkLabel(form, text="Empresa / Referência", font=FONTS["small"], text_color=COLORS["text_muted"]).pack(anchor="w")
        e_emp = ctk.CTkEntry(form, height=36)
        e_emp.pack(fill="x", pady=(2, 10))

        ctk.CTkLabel(form, text="Desconto (valor total)", font=FONTS["small"], text_color=COLORS["text_muted"]).pack(anchor="w")
        e_desc = ctk.CTkEntry(form, height=36, placeholder_text="0.00")
        e_desc.insert(0, "0")
        e_desc.pack(fill="x", pady=(2, 12))

        def salvar():
            try:
                parts_h = e_h.get().split(" - ")
                parts_q = e_q.get().split(" - ")
                hid = int(parts_h[0])
                qid = int(parts_q[0])
            except (ValueError, IndexError):
                messagebox.showerror("Erro", "Seleccione hóspede e quarto válidos.")
                return
            d_cin_date = parse_date(e_cin.get())
            d_cout_date = parse_date(e_cout.get())
            if not d_cin_date or not d_cout_date:
                messagebox.showerror("Erro", "Datas no formato DD/MM/AAAA.")
                return
            if d_cout_date < d_cin_date:
                messagebox.showerror("Erro", "Data de check-out não pode ser anterior ao check-in.")
                return
            desconto = safe_float(e_desc.get(), 0)
            if desconto < 0:
                desconto = 0
            noites = max((d_cout_date - d_cin_date).days, 1)
            nr_adultos = max(safe_int(e_ad.get(), 1), 1)
            session = get_session()
            try:
                quarto = session.query(Quarto).get(qid)
                if not quarto or quarto.status != "disponivel" or not quarto.activo:
                    messagebox.showerror("Erro", "Quarto não disponível ou inactivo.")
                    return
                # Verificar se hóspede existe
                if not session.query(Hospede).get(hid):
                    messagebox.showerror("Erro", "Hóspede não encontrado.")
                    return
                total = noites * (quarto.preco_diaria or 0)
                total_liq = max(total - desconto, 0)
                chk = Checkin(
                    hospede_id=hid, quarto_id=qid,
                    empresa_referencia=e_emp.get().strip() or None,
                    data_checkin=datetime.combine(d_cin_date, datetime.min.time()),
                    data_checkout=datetime.combine(d_cout_date, datetime.min.time()),
                    nr_adultos=nr_adultos, noites=noites,
                    preco_diaria=quarto.preco_diaria or 0, total_quarto=total,
                    total_desconto=desconto, subtotal=total,
                    total_liquido=total_liq, saldo=total_liq,
                    status="CHECKIN", criado_por=self.utilizador.id,
                )
                session.add(chk)
                quarto.status = "ocupado"
                session.commit()
                win.destroy()
                self._load_checkins()
                msg = f"Check-in #{chk.id} registado com sucesso.\nNoites: {noites}  |  Total: {total_liq:,.2f}"
                if desconto > 0:
                    msg += f"\nDesconto aplicado: {desconto:,.2f}"
                messagebox.showinfo("Sucesso", msg)
            except Exception as e:
                session.rollback()
                messagebox.showerror("Erro", f"Falha ao registar check-in:\n{e}")
            finally:
                session.close()

        ctk.CTkButton(form, text="Confirmar Check-in", height=42, font=FONTS["button"],
                      fg_color=COLORS["success"], hover_color=COLORS["primary_hover"],
                      command=salvar).pack(fill="x", pady=15)

    def _do_checkout(self, cid):
        if not messagebox.askyesno("Checkout", "Confirmar check-out?"):
            return
        session = get_session()
        try:
            c = session.query(Checkin).get(cid)
            if not c or c.status != "CHECKIN":
                return
            c.status = "CHECKOUT"
            c.data_checkout = datetime.utcnow()
            if c.quarto:
                c.quarto.status = "disponivel"
            if c.data_checkin:
                c.noites = max((date.today() - c.data_checkin.date()).days, 1)
                c.total_quarto = c.noites * c.preco_diaria
                c.total_liquido = c.total_quarto + (c.total_servicos or 0) - (c.total_desconto or 0)
                c.saldo = c.total_liquido - (c.valor_pago or 0)
            session.commit()
            self._load_checkins()
            messagebox.showinfo("Checkout", f"Check-out realizado.\nSaldo residual: {c.saldo:,.2f}")
        except Exception as e:
            session.rollback()
            messagebox.showerror("Erro", str(e))
        finally:
            session.close()

    # ── Serviços ──────────────────────────────────────────────────────────
    def _show_servicos(self):
        self._clear()
        top = ctk.CTkFrame(self.content, fg_color="transparent")
        top.pack(fill="x", padx=30, pady=(20, 10))
        ctk.CTkLabel(top, text="Cadastro de Serviços", font=FONTS["title"],
                     text_color=COLORS["text"]).pack(side="left")
        ctk.CTkButton(top, text="+ Novo Serviço", height=36, font=FONTS["button"],
                      fg_color=COLORS["primary"], command=lambda: self._form_servico()).pack(side="right")

        self._s_table = ctk.CTkScrollableFrame(self.content, fg_color=COLORS["bg_card"], corner_radius=10)
        self._s_table.pack(fill="both", expand=True, padx=30, pady=(0, 20))
        self._load_servicos()

    def _load_servicos(self):
        for w in self._s_table.winfo_children():
            w.destroy()
        headers = ["Categoria", "Serviço", "Preço Unitário", "Estado", "Acções"]
        hr = ctk.CTkFrame(self._s_table, fg_color=COLORS["primary"], height=36)
        hr.pack(fill="x")
        for h in headers:
            ctk.CTkLabel(hr, text=h, font=FONTS["small"], text_color="white", width=160).pack(side="left", padx=8, pady=6)

        session = get_session()
        try:
            for s in session.query(Servico).order_by(Servico.nome).all():
                row = ctk.CTkFrame(self._s_table, fg_color="transparent")
                row.pack(fill="x", pady=1)
                cat = s.categoria.nome if s.categoria else "—"
                est = "Activo" if s.activo else "Inactivo"
                ec = COLORS["success"] if s.activo else COLORS["danger"]
                for i, v in enumerate([cat, s.nome, f"{s.preco_unitario:,.2f}", est]):
                    ctk.CTkLabel(row, text=v, font=FONTS["small"],
                                 text_color=ec if i == 3 else COLORS["text"], width=160).pack(side="left", padx=8)
                act = ctk.CTkFrame(row, fg_color="transparent", width=160)
                act.pack(side="left", padx=8)
                ctk.CTkButton(act, text="Editar", width=60, height=26, font=FONTS["small"],
                              fg_color=COLORS["primary"],
                              command=lambda sid=s.id: self._form_servico(sid)).pack(side="left", padx=2)
        finally:
            session.close()

    def _form_servico(self, sid=None):
        win = ctk.CTkToplevel(self)
        win.title("Novo Serviço" if not sid else "Editar Serviço")
        win.geometry("420x380")
        win.configure(fg_color=COLORS["bg_dark"])
        win.grab_set()

        s = None
        if sid:
            session = get_session()
            s = session.query(Servico).get(sid)
            session.close()

        session = get_session()
        cats = [c.nome for c in session.query(CategoriaServico).order_by(CategoriaServico.nome).all()]
        session.close()

        ctk.CTkLabel(win, text="Categoria", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30, pady=(20, 2))
        e_cat = ctk.CTkComboBox(win, values=cats or ["Bar"], height=36)
        e_cat.pack(fill="x", padx=30)
        if s and s.categoria:
            e_cat.set(s.categoria.nome)

        ctk.CTkLabel(win, text="Nome do Serviço *", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30, pady=(12, 2))
        e_nome = ctk.CTkEntry(win, height=36)
        e_nome.pack(fill="x", padx=30)
        if s:
            e_nome.insert(0, s.nome)

        ctk.CTkLabel(win, text="Preço Unitário *", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30, pady=(12, 2))
        e_preco = ctk.CTkEntry(win, height=36)
        e_preco.pack(fill="x", padx=30)
        e_preco.insert(0, str(s.preco_unitario) if s else "0")

        def salvar():
            nome = e_nome.get().strip()
            if not nome:
                messagebox.showwarning("Atenção", "Nome obrigatório.")
                return
            preco = safe_float(e_preco.get(), -1)
            if preco < 0:
                messagebox.showerror("Erro", "Preço inválido.")
                return
            session = get_session()
            try:
                cat = session.query(CategoriaServico).filter_by(nome=e_cat.get()).first()
                if not cat:
                    cat = CategoriaServico(nome=e_cat.get() or "Outros")
                    session.add(cat)
                    session.flush()
                if sid:
                    ss = session.query(Servico).get(sid)
                    if not ss:
                        messagebox.showerror("Erro", "Serviço não encontrado.")
                        return
                    ss.nome, ss.preco_unitario, ss.categoria_id, ss.activo = nome, preco, cat.id, 1
                else:
                    session.add(Servico(nome=nome, preco_unitario=preco, categoria_id=cat.id, activo=1))
                session.commit()
                win.destroy()
                self._load_servicos()
            except Exception as e:
                session.rollback()
                messagebox.showerror("Erro", str(e))
            finally:
                session.close()

        ctk.CTkButton(win, text="Guardar", height=40, font=FONTS["button"],
                      fg_color=COLORS["primary"], command=salvar).pack(fill="x", padx=30, pady=25)

    # ── Pagamentos ────────────────────────────────────────────────────────
    def _show_pagamentos(self):
        self._clear()
        top = ctk.CTkFrame(self.content, fg_color="transparent")
        top.pack(fill="x", padx=30, pady=(20, 10))
        ctk.CTkLabel(top, text="Pagamentos e Parcelas", font=FONTS["title"],
                     text_color=COLORS["text"]).pack(side="left")
        ctk.CTkButton(top, text="+ Registar Pagamento", height=36, font=FONTS["button"],
                      fg_color=COLORS["success"], command=self._novo_pagamento).pack(side="right")

        ctk.CTkLabel(self.content, text="Estadias com saldo em aberto",
                     font=FONTS["heading"], text_color=COLORS["text"]).pack(anchor="w", padx=30, pady=(10, 5))

        self._p_table = ctk.CTkScrollableFrame(self.content, fg_color=COLORS["bg_card"], corner_radius=10)
        self._p_table.pack(fill="both", expand=True, padx=30, pady=(0, 20))
        self._load_pagamentos()

    def _load_pagamentos(self):
        for w in self._p_table.winfo_children():
            w.destroy()
        headers = ["ID", "Hóspede", "Quarto", "Total", "Pago", "Saldo", "Status", "Acções"]
        widths = [50, 180, 80, 90, 90, 90, 90, 120]
        hr = ctk.CTkFrame(self._p_table, fg_color=COLORS["primary"], height=36)
        hr.pack(fill="x")
        for h, w in zip(headers, widths):
            ctk.CTkLabel(hr, text=h, font=FONTS["small"], text_color="white", width=w).pack(side="left", padx=4, pady=6)

        session = get_session()
        try:
            for c in session.query(Checkin).filter(Checkin.saldo > 0).order_by(Checkin.data_checkin.desc()).limit(100).all():
                row = ctk.CTkFrame(self._p_table, fg_color="transparent")
                row.pack(fill="x", pady=1)
                nome = c.hospede.nome if c.hospede else "—"
                if len(nome) > 24:
                    nome = nome[:24] + "…"
                vals = [str(c.id), nome, c.quarto.numero if c.quarto else "—",
                        f"{c.total_liquido:,.0f}", f"{c.valor_pago:,.0f}", f"{c.saldo:,.0f}", c.status]
                for v, w in zip(vals, widths[:-1]):
                    color = COLORS["danger"] if v == f"{c.saldo:,.0f}" else COLORS["text"]
                    ctk.CTkLabel(row, text=v, font=FONTS["small"], text_color=color, width=w).pack(side="left", padx=4)
                act = ctk.CTkFrame(row, fg_color="transparent", width=120)
                act.pack(side="left", padx=4)
                ctk.CTkButton(act, text="Pagar", width=70, height=26, font=FONTS["small"],
                              fg_color=COLORS["success"],
                              command=lambda cid=c.id: self._pagar(cid)).pack(side="left")
        finally:
            session.close()

    def _novo_pagamento(self):
        session = get_session()
        try:
            checkins = session.query(Checkin).filter(Checkin.saldo > 0).order_by(Checkin.id.desc()).limit(50).all()
            if not checkins:
                messagebox.showinfo("Info", "Não existem estadias com saldo em aberto.")
                return
            opcoes = [f"{c.id} - {c.hospede.nome if c.hospede else '?'} (Saldo: {c.saldo:,.0f})" for c in checkins]
        finally:
            session.close()

        win = ctk.CTkToplevel(self)
        win.title("Seleccionar Estadia")
        win.geometry("480x200")
        win.configure(fg_color=COLORS["bg_dark"])
        win.grab_set()
        ctk.CTkLabel(win, text="Escolha a estadia:", font=FONTS["body"],
                     text_color=COLORS["text"]).pack(pady=(20, 8), padx=20)
        combo = ctk.CTkComboBox(win, values=opcoes, height=36, width=400)
        combo.pack(padx=20)
        if opcoes:
            combo.set(opcoes[0])

        def conf():
            try:
                cid = int(combo.get().split(" - ")[0])
                win.destroy()
                self._pagar(cid)
            except Exception:
                messagebox.showerror("Erro", "Selecção inválida.")

        ctk.CTkButton(win, text="Continuar", height=36, font=FONTS["button"],
                      fg_color=COLORS["primary"], command=conf).pack(pady=20)

    def _pagar(self, cid):
        session = get_session()
        try:
            c = session.query(Checkin).get(cid)
            if not c:
                return
            formas = [f.nome for f in session.query(FormaPagamento).order_by(FormaPagamento.nome).all()]
            saldo = c.saldo or 0
            total_liq = c.total_liquido or 0
            desconto_atual = c.total_desconto or 0
            valor_pago = c.valor_pago or 0
            hnome = c.hospede.nome if c.hospede else ""
        finally:
            session.close()

        win = ctk.CTkToplevel(self)
        win.title(f"Pagamento / Desconto — Check-in #{cid}")
        win.geometry("460x560")
        win.configure(fg_color=COLORS["bg_dark"])
        win.grab_set()

        ctk.CTkLabel(win, text=f"Hóspede: {hnome}", font=FONTS["heading"],
                     text_color=COLORS["text"]).pack(pady=(18, 4), padx=20)
        info = ctk.CTkFrame(win, fg_color=COLORS["bg_card"], corner_radius=8)
        info.pack(fill="x", padx=25, pady=(0, 12))
        ctk.CTkLabel(info, text=f"Total líquido: {total_liq:,.2f}   |   Já pago: {valor_pago:,.2f}   |   Desconto: {desconto_atual:,.2f}",
                     font=FONTS["small"], text_color=COLORS["text_muted"]).pack(pady=8, padx=10)
        lbl_saldo = ctk.CTkLabel(info, text=f"Saldo em aberto: {saldo:,.2f}", font=FONTS["body"],
                                 text_color=COLORS["warning"])
        lbl_saldo.pack(pady=(0, 8))

        # Desconto editável
        ctk.CTkLabel(win, text="Desconto a aplicar (opcional)", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30)
        e_desconto = ctk.CTkEntry(win, height=36, placeholder_text="0.00")
        e_desconto.insert(0, "0")
        e_desconto.pack(fill="x", padx=30, pady=(2, 8))

        ctk.CTkLabel(win, text="Valor a pagar *", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30)
        e_valor = ctk.CTkEntry(win, height=36)
        e_valor.insert(0, f"{saldo:.2f}")
        e_valor.pack(fill="x", padx=30, pady=(2, 8))

        def atualizar_saldo_preview(*_):
            d = safe_float(e_desconto.get(), 0)
            if d < 0:
                d = 0
            novo_saldo = max(saldo - d, 0)
            e_valor.delete(0, "end")
            e_valor.insert(0, f"{novo_saldo:.2f}")
            lbl_saldo.configure(text=f"Saldo após desconto: {novo_saldo:,.2f}")

        e_desconto.bind("<KeyRelease>", atualizar_saldo_preview)

        ctk.CTkLabel(win, text="Forma de Pagamento", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30)
        e_forma = ctk.CTkComboBox(win, values=formas or ["Dinheiro"], height=36)
        e_forma.pack(fill="x", padx=30, pady=(2, 8))
        if formas:
            e_forma.set(formas[0])

        ctk.CTkLabel(win, text="Referência / Nº Documento", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30)
        e_ref = ctk.CTkEntry(win, height=36)
        e_ref.pack(fill="x", padx=30, pady=(2, 8))

        ctk.CTkLabel(win, text="Observação", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30)
        e_obs = ctk.CTkEntry(win, height=36)
        e_obs.pack(fill="x", padx=30, pady=(2, 12))

        def confirmar():
            valor = safe_float(e_valor.get(), 0)
            desconto = safe_float(e_desconto.get(), 0)
            if desconto < 0:
                desconto = 0
            if valor < 0:
                messagebox.showerror("Erro", "Valor não pode ser negativo.")
                return
            if valor == 0 and desconto == 0:
                messagebox.showerror("Erro", "Indique um valor a pagar ou um desconto.")
                return
            session = get_session()
            try:
                c = session.query(Checkin).get(cid)
                if not c:
                    return
                forma = session.query(FormaPagamento).filter_by(nome=e_forma.get()).first()

                # Aplicar desconto ao check-in
                if desconto > 0:
                    c.total_desconto = (c.total_desconto or 0) + desconto
                    c.total_liquido = max(
                        (c.total_quarto or 0) + (c.total_servicos or 0) - (c.total_desconto or 0), 0
                    )
                    session.add(LivroCaixa(
                        checkin_id=cid, tipo="saida",
                        descricao=f"Desconto Check-in #{cid} — {hnome}",
                        valor=desconto, forma_pagamento_id=None,
                        utilizador_id=self.utilizador.id,
                        observacao=e_obs.get().strip() or "Desconto aplicado no pagamento",
                    ))

                # Registar pagamento se houver valor
                if valor > 0:
                    session.add(Parcela(
                        checkin_id=cid, numero_parcela=f"P{datetime.now().strftime('%y%m%d%H%M')}",
                        data_parcela=date.today(), valor_parcela=valor, data_pagamento=date.today(),
                        forma_pagamento_id=forma.id if forma else None,
                        referencia=e_ref.get().strip() or None, outros=e_obs.get().strip() or None,
                        valor_pago=valor, saldo_parcela=0,
                    ))
                    c.valor_pago = (c.valor_pago or 0) + valor
                    session.add(LivroCaixa(
                        checkin_id=cid, tipo="entrada",
                        descricao=f"Pagamento Check-in #{cid} — {hnome}",
                        valor=valor, forma_pagamento_id=forma.id if forma else None,
                        utilizador_id=self.utilizador.id, observacao=e_obs.get().strip() or None,
                    ))

                c.saldo = max((c.total_liquido or 0) - (c.valor_pago or 0), 0)
                session.commit()
                win.destroy()
                self._load_pagamentos()
                msg = []
                if desconto > 0:
                    msg.append(f"Desconto de {desconto:,.2f} aplicado.")
                if valor > 0:
                    msg.append(f"Pagamento de {valor:,.2f} registado.")
                msg.append(f"Novo saldo: {c.saldo:,.2f}")
                messagebox.showinfo("Sucesso", "\n".join(msg))
            except Exception as e:
                session.rollback()
                messagebox.showerror("Erro", str(e))
            finally:
                session.close()

        ctk.CTkButton(win, text="Confirmar Pagamento / Desconto", height=42, font=FONTS["button"],
                      fg_color=COLORS["success"], hover_color=COLORS["primary_hover"],
                      command=confirmar).pack(fill="x", padx=30, pady=16)

    # ── Livro de Caixa ────────────────────────────────────────────────────
    def _show_caixa(self):
        self._clear()
        top = ctk.CTkFrame(self.content, fg_color="transparent")
        top.pack(fill="x", padx=30, pady=(20, 10))
        ctk.CTkLabel(top, text="Livro de Caixa", font=FONTS["title"],
                     text_color=COLORS["text"]).pack(side="left")
        ctk.CTkButton(top, text="+ Movimento Manual", height=36, font=FONTS["button"],
                      fg_color=COLORS["primary"], command=self._novo_movimento).pack(side="right")

        filtro = ctk.CTkFrame(self.content, fg_color="transparent")
        filtro.pack(fill="x", padx=30, pady=(0, 10))
        ctk.CTkLabel(filtro, text="De:", font=FONTS["small"], text_color=COLORS["text_muted"]).pack(side="left")
        self._cx_de = ctk.CTkEntry(filtro, width=110, height=32)
        self._cx_de.insert(0, (date.today() - timedelta(days=30)).strftime("%d/%m/%Y"))
        self._cx_de.pack(side="left", padx=(5, 15))
        ctk.CTkLabel(filtro, text="Até:", font=FONTS["small"], text_color=COLORS["text_muted"]).pack(side="left")
        self._cx_ate = ctk.CTkEntry(filtro, width=110, height=32)
        self._cx_ate.insert(0, date.today().strftime("%d/%m/%Y"))
        self._cx_ate.pack(side="left", padx=(5, 15))
        ctk.CTkButton(filtro, text="Filtrar", width=80, height=32, command=self._load_caixa).pack(side="left")

        self._cx_resumo = ctk.CTkFrame(self.content, fg_color=COLORS["bg_card"], corner_radius=10, height=70)
        self._cx_resumo.pack(fill="x", padx=30, pady=(0, 10))
        self._cx_resumo.pack_propagate(False)

        self._cx_table = ctk.CTkScrollableFrame(self.content, fg_color=COLORS["bg_card"], corner_radius=10)
        self._cx_table.pack(fill="both", expand=True, padx=30, pady=(0, 20))
        self._load_caixa()

    def _parse_d(self, s):
        try:
            return datetime.strptime(s.strip(), "%d/%m/%Y").date()
        except Exception:
            return None

    def _load_caixa(self):
        for w in self._cx_table.winfo_children():
            w.destroy()
        for w in self._cx_resumo.winfo_children():
            w.destroy()

        d_de = self._parse_d(self._cx_de.get()) or (date.today() - timedelta(days=30))
        d_ate = self._parse_d(self._cx_ate.get()) or date.today()

        headers = ["Data", "Tipo", "Descrição", "Valor", "Forma Pgto", "Utilizador"]
        widths = [110, 80, 280, 100, 120, 120]
        hr = ctk.CTkFrame(self._cx_table, fg_color=COLORS["primary"], height=36)
        hr.pack(fill="x")
        for h, w in zip(headers, widths):
            ctk.CTkLabel(hr, text=h, font=FONTS["small"], text_color="white", width=w).pack(side="left", padx=5, pady=6)

        session = get_session()
        try:
            movs = session.query(LivroCaixa).filter(
                LivroCaixa.data_movimento >= datetime.combine(d_de, datetime.min.time()),
                LivroCaixa.data_movimento <= datetime.combine(d_ate, datetime.max.time()),
            ).order_by(LivroCaixa.data_movimento.desc()).all()

            te, ts = 0.0, 0.0
            for m in movs:
                row = ctk.CTkFrame(self._cx_table, fg_color="transparent")
                row.pack(fill="x", pady=1)
                if m.tipo == "entrada":
                    te += m.valor
                    tc = COLORS["success"]
                else:
                    ts += m.valor
                    tc = COLORS["danger"]
                forma = "—"
                if m.forma_pagamento_id:
                    fp = session.query(FormaPagamento).get(m.forma_pagamento_id)
                    forma = fp.nome if fp else "—"
                user = "—"
                if m.utilizador_id:
                    u = session.query(Utilizador).get(m.utilizador_id)
                    user = u.nome_usuario if u else "—"
                desc = m.descricao[:40] + "…" if len(m.descricao) > 40 else m.descricao
                vals = [
                    m.data_movimento.strftime("%d/%m/%Y %H:%M") if m.data_movimento else "—",
                    m.tipo.upper(), desc, f"{m.valor:,.2f}", forma, user,
                ]
                for i, (v, w) in enumerate(zip(vals, widths)):
                    ctk.CTkLabel(row, text=v, font=FONTS["small"],
                                 text_color=tc if i == 1 else COLORS["text"], width=w).pack(side="left", padx=5)

            saldo = te - ts
            ctk.CTkLabel(self._cx_resumo, text=f"Entradas: {te:,.2f}",
                         font=FONTS["heading"], text_color=COLORS["success"]).pack(side="left", padx=30, pady=15)
            ctk.CTkLabel(self._cx_resumo, text=f"Saídas: {ts:,.2f}",
                         font=FONTS["heading"], text_color=COLORS["danger"]).pack(side="left", padx=30, pady=15)
            ctk.CTkLabel(self._cx_resumo, text=f"Saldo: {saldo:,.2f}",
                         font=FONTS["heading"], text_color=COLORS["secondary"]).pack(side="left", padx=30, pady=15)
        finally:
            session.close()

    def _novo_movimento(self):
        win = ctk.CTkToplevel(self)
        win.title("Novo Movimento de Caixa")
        win.geometry("420x400")
        win.configure(fg_color=COLORS["bg_dark"])
        win.grab_set()

        session = get_session()
        formas = [f.nome for f in session.query(FormaPagamento).order_by(FormaPagamento.nome).all()]
        session.close()

        ctk.CTkLabel(win, text="Tipo", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30, pady=(20, 2))
        e_tipo = ctk.CTkSegmentedButton(win, values=["entrada", "saida"])
        e_tipo.set("entrada")
        e_tipo.pack(fill="x", padx=30, pady=(0, 12))

        ctk.CTkLabel(win, text="Descrição *", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30)
        e_desc = ctk.CTkEntry(win, height=36)
        e_desc.pack(fill="x", padx=30, pady=(2, 12))

        ctk.CTkLabel(win, text="Valor *", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30)
        e_valor = ctk.CTkEntry(win, height=36)
        e_valor.pack(fill="x", padx=30, pady=(2, 12))

        ctk.CTkLabel(win, text="Forma de Pagamento", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=30)
        e_forma = ctk.CTkComboBox(win, values=formas or ["Dinheiro"], height=36)
        e_forma.pack(fill="x", padx=30, pady=(2, 12))

        def salvar():
            desc = e_desc.get().strip()
            if not desc:
                messagebox.showwarning("Atenção", "Descrição obrigatória.")
                return
            valor = safe_float(e_valor.get(), 0)
            if valor <= 0:
                messagebox.showerror("Erro", "Valor inválido (deve ser positivo).")
                return
            session = get_session()
            try:
                forma = session.query(FormaPagamento).filter_by(nome=e_forma.get()).first()
                session.add(LivroCaixa(
                    tipo=e_tipo.get(), descricao=desc, valor=valor,
                    forma_pagamento_id=forma.id if forma else None,
                    utilizador_id=self.utilizador.id,
                ))
                session.commit()
                win.destroy()
                self._load_caixa()
            except Exception as e:
                session.rollback()
                messagebox.showerror("Erro", str(e))
            finally:
                session.close()

        ctk.CTkButton(win, text="Guardar", height=40, font=FONTS["button"],
                      fg_color=COLORS["primary"], command=salvar).pack(fill="x", padx=30, pady=20)

    # ── Relatórios ────────────────────────────────────────────────────────
    def _show_relatorios(self):
        self._clear()
        ctk.CTkLabel(self.content, text="Relatórios", font=FONTS["title"],
                     text_color=COLORS["text"]).pack(anchor="w", padx=30, pady=(25, 15))

        grid = ctk.CTkFrame(self.content, fg_color="transparent")
        grid.pack(fill="x", padx=30, pady=10)

        items = [
            ("📊 Ocupação Actual", "Quartos e taxa de ocupação", self._rel_ocupacao),
            ("💰 Receitas do Período", "Total de entradas no caixa", self._rel_receitas),
            ("🛏️ Estadias Recentes", "Últimas 50 estadias", self._rel_estadias),
            ("👤 Exportar Hóspedes", "Lista completa para Excel", self._rel_exp_hosp),
            ("📒 Exportar Caixa", "Livro de caixa para Excel", self._rel_exp_caixa),
            ("📈 Resumo Diário", "Resumo do dia de hoje", self._rel_diario),
        ]
        for i, (titulo, desc, cmd) in enumerate(items):
            card = ctk.CTkFrame(grid, fg_color=COLORS["bg_card"], corner_radius=12, width=320, height=120)
            card.grid(row=i // 3, column=i % 3, padx=10, pady=10, sticky="nsew")
            card.grid_propagate(False)
            grid.columnconfigure(i % 3, weight=1)
            ctk.CTkLabel(card, text=titulo, font=FONTS["heading"],
                         text_color=COLORS["secondary"]).pack(anchor="w", padx=20, pady=(15, 3))
            ctk.CTkLabel(card, text=desc, font=FONTS["small"],
                         text_color=COLORS["text_muted"]).pack(anchor="w", padx=20)
            ctk.CTkButton(card, text="Gerar", width=100, height=28, font=FONTS["small"],
                          fg_color=COLORS["primary"], command=cmd).pack(anchor="e", padx=20, pady=(8, 0))

        self._rel_txt = ctk.CTkTextbox(self.content, fg_color=COLORS["bg_card"], text_color=COLORS["text"],
                                       font=("Consolas", 12), height=250, corner_radius=10)
        self._rel_txt.pack(fill="x", padx=30, pady=(10, 20))

    def _rel_show(self, texto):
        self._rel_txt.delete("1.0", "end")
        self._rel_txt.insert("1.0", texto)

    def _rel_ocupacao(self):
        session = get_session()
        try:
            total = session.query(Quarto).filter_by(activo=1).count()
            disp = session.query(Quarto).filter_by(status="disponivel", activo=1).count()
            ocup = session.query(Quarto).filter_by(status="ocupado", activo=1).count()
            manut = session.query(Quarto).filter_by(status="manutencao", activo=1).count()
            taxa = (ocup / total * 100) if total else 0
            linhas = [
                "=" * 55, "  RELATÓRIO DE OCUPAÇÃO",
                f"  Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}", "=" * 55,
                f"  Total de Quartos Activos : {total}",
                f"  Disponíveis              : {disp}",
                f"  Ocupados                 : {ocup}",
                f"  Em Manutenção            : {manut}",
                f"  Taxa de Ocupação         : {taxa:.1f}%", "=" * 55,
            ]
            checkins_activos = session.query(Checkin).filter_by(status="CHECKIN").all()
            if checkins_activos:
                linhas.append("\n  QUARTOS OCUPADOS:")
                linhas.append("-" * 55)
                for c in checkins_activos:
                    nome = c.hospede.nome if c.hospede else "?"
                    quarto = c.quarto.numero if c.quarto else "?"
                    cin = c.data_checkin.strftime("%d/%m/%Y") if c.data_checkin else "?"
                    saldo = f"{c.saldo:,.2f}" if c.saldo else "0.00"
                    linhas.append(f"  {quarto:8} | {nome[:25]:25} | desde {cin} | Saldo: {saldo}")
            self._rel_show("\n".join(linhas))
        except Exception as e:
            self._rel_show(f"Erro ao gerar relatório: {e}")
        finally:
            session.close()

    def _rel_receitas(self):
        win = ctk.CTkInputDialog(text="Dias a trás (ex: 30):", title="Período")
        try:
            dias = int(win.get_input() or "30")
        except Exception:
            dias = 30
        d_de = date.today() - timedelta(days=dias)
        session = get_session()
        try:
            movs = session.query(LivroCaixa).filter(
                LivroCaixa.tipo == "entrada",
                LivroCaixa.data_movimento >= datetime.combine(d_de, datetime.min.time()),
            ).all()
            total = sum(m.valor for m in movs)
            self._rel_show("\n".join([
                "=" * 50, f"  RECEITAS — Últimos {dias} dias",
                f"  De {d_de.strftime('%d/%m/%Y')} a {date.today().strftime('%d/%m/%Y')}",
                "=" * 50, f"  Total de entradas : {total:,.2f}",
                f"  Nº de movimentos  : {len(movs)}", "=" * 50,
            ]))
        finally:
            session.close()

    def _rel_estadias(self):
        session = get_session()
        try:
            linhas = ["=" * 70, "  ÚLTIMAS 50 ESTADIAS", "=" * 70,
                      f"  {'ID':>5} | {'Hóspede':30} | {'Quarto':8} | {'Check-in':10} | {'Status':10}",
                      "-" * 70]
            for c in session.query(Checkin).order_by(Checkin.data_checkin.desc()).limit(50).all():
                nome = (c.hospede.nome[:28] if c.hospede else "?")
                quarto = c.quarto.numero if c.quarto else "?"
                cin = c.data_checkin.strftime("%d/%m/%Y") if c.data_checkin else "?"
                linhas.append(f"  {c.id:>5} | {nome:30} | {quarto:8} | {cin:10} | {c.status:10}")
            linhas.append("=" * 70)
            self._rel_show("\n".join(linhas))
        finally:
            session.close()

    def _rel_exp_hosp(self):
        try:
            from openpyxl import Workbook
        except ImportError:
            messagebox.showerror("Erro", "openpyxl não instalado.\npip install openpyxl")
            return
        path = filedialog.asksaveasfilename(defaultextension=".xlsx", filetypes=[("Excel", "*.xlsx")],
                                            initialfile=f"hospedes_{date.today().strftime('%Y%m%d')}.xlsx")
        if not path:
            return
        session = get_session()
        try:
            wb = Workbook()
            ws = wb.active
            ws.title = "Hóspedes"
            ws.append(["ID", "Nome", "Telefone", "Email", "Documento", "Empresa", "Cidade", "Nacionalidade"])
            for h in session.query(Hospede).order_by(Hospede.nome).all():
                ws.append([h.id, h.nome, h.telefone1, h.email, h.numero_documento, h.empresa, h.cidade,
                           h.nacionalidade.nome if h.nacionalidade else ""])
            wb.save(path)
            messagebox.showinfo("Exportado", f"Guardado:\n{path}")
        except Exception as e:
            messagebox.showerror("Erro", str(e))
        finally:
            session.close()

    def _rel_exp_caixa(self):
        try:
            from openpyxl import Workbook
        except ImportError:
            messagebox.showerror("Erro", "openpyxl não instalado.\npip install openpyxl")
            return
        path = filedialog.asksaveasfilename(defaultextension=".xlsx", filetypes=[("Excel", "*.xlsx")],
                                            initialfile=f"caixa_{date.today().strftime('%Y%m%d')}.xlsx")
        if not path:
            return
        session = get_session()
        try:
            wb = Workbook()
            ws = wb.active
            ws.title = "Livro de Caixa"
            ws.append(["ID", "Data", "Tipo", "Descrição", "Valor", "Forma Pgto", "Observação"])
            for m in session.query(LivroCaixa).order_by(LivroCaixa.data_movimento.desc()).all():
                forma = ""
                if m.forma_pagamento_id:
                    fp = session.query(FormaPagamento).get(m.forma_pagamento_id)
                    forma = fp.nome if fp else ""
                ws.append([m.id, m.data_movimento.strftime("%d/%m/%Y %H:%M") if m.data_movimento else "",
                           m.tipo, m.descricao, m.valor, forma, m.observacao or ""])
            wb.save(path)
            messagebox.showinfo("Exportado", f"Guardado:\n{path}")
        except Exception as e:
            messagebox.showerror("Erro", str(e))
        finally:
            session.close()

    def _rel_diario(self):
        hoje = date.today()
        session = get_session()
        try:
            cin = session.query(Checkin).filter(
                Checkin.data_checkin >= datetime.combine(hoje, datetime.min.time()),
                Checkin.data_checkin <= datetime.combine(hoje, datetime.max.time()),
            ).count()
            cout = session.query(Checkin).filter(
                Checkin.status == "CHECKOUT",
                Checkin.data_checkout >= datetime.combine(hoje, datetime.min.time()),
            ).count()
            activos = session.query(Checkin).filter_by(status="CHECKIN").count()
            entradas = session.query(LivroCaixa).filter(
                LivroCaixa.tipo == "entrada",
                LivroCaixa.data_movimento >= datetime.combine(hoje, datetime.min.time()),
            ).all()
            total = sum(m.valor for m in entradas)
            self._rel_show("\n".join([
                "=" * 50, f"  RESUMO DIÁRIO — {hoje.strftime('%d/%m/%Y')}", "=" * 50,
                f"  Check-ins hoje     : {cin}",
                f"  Check-outs hoje    : {cout}",
                f"  Hóspedes no hotel  : {activos}",
                f"  Receita de hoje    : {total:,.2f}",
                f"  Nº pagamentos      : {len(entradas)}", "=" * 50,
            ]))
        finally:
            session.close()

    # ── Configurações ─────────────────────────────────────────────────────
    def _show_config(self):
        self._clear()
        ctk.CTkLabel(self.content, text="Configurações", font=FONTS["title"],
                     text_color=COLORS["text"]).pack(anchor="w", padx=30, pady=(25, 15))

        tabs = ctk.CTkTabview(self.content, fg_color=COLORS["bg_card"],
                              segmented_button_selected_color=COLORS["primary"])
        tabs.pack(fill="both", expand=True, padx=30, pady=(0, 20))
        tabs.add("Alterar Senha")
        tabs.add("Utilizadores")
        tabs.add("Empresa")
        tabs.add("Sistema")
        tabs.add("Sobre")

        # Senha
        tab = tabs.tab("Alterar Senha")
        ctk.CTkLabel(tab, text="Alterar a sua senha", font=FONTS["heading"],
                     text_color=COLORS["text"]).pack(anchor="w", padx=20, pady=(20, 15))
        ctk.CTkLabel(tab, text="Senha actual", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=20)
        e_act = ctk.CTkEntry(tab, show="•", height=36, width=300)
        e_act.pack(anchor="w", padx=20, pady=(2, 12))
        ctk.CTkLabel(tab, text="Nova senha", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=20)
        e_nova = ctk.CTkEntry(tab, show="•", height=36, width=300)
        e_nova.pack(anchor="w", padx=20, pady=(2, 12))
        ctk.CTkLabel(tab, text="Confirmar nova senha", font=FONTS["small"],
                     text_color=COLORS["text_muted"]).pack(anchor="w", padx=20)
        e_conf = ctk.CTkEntry(tab, show="•", height=36, width=300)
        e_conf.pack(anchor="w", padx=20, pady=(2, 12))

        def alt_senha():
            if not e_act.get() or not e_nova.get():
                messagebox.showwarning("Atenção", "Preencha todos os campos.")
                return
            if e_nova.get() != e_conf.get():
                messagebox.showerror("Erro", "As novas senhas não coincidem.")
                return
            if len(e_nova.get()) < 4:
                messagebox.showwarning("Atenção", "Mínimo 4 caracteres.")
                return
            session = get_session()
            try:
                u = session.query(Utilizador).get(self.utilizador.id)
                if not u or not verify_password(e_act.get(), u.senha_hash):
                    messagebox.showerror("Erro", "Senha actual incorrecta.")
                    return
                u.senha_hash = hash_password(e_nova.get())
                session.commit()
                e_act.delete(0, "end")
                e_nova.delete(0, "end")
                e_conf.delete(0, "end")
                messagebox.showinfo("Sucesso", "Senha alterada.")
            except Exception as e:
                session.rollback()
                messagebox.showerror("Erro", str(e))
            finally:
                session.close()

        ctk.CTkButton(tab, text="Guardar Nova Senha", height=38, font=FONTS["button"],
                      fg_color=COLORS["primary"], command=alt_senha, width=200).pack(anchor="w", padx=20, pady=15)

        # Utilizadores
        tab2 = tabs.tab("Utilizadores")
        if self.utilizador.role not in ("admin", "gerente"):
            ctk.CTkLabel(tab2, text="Acesso restrito a Administradores e Gerentes.",
                         font=FONTS["body"], text_color=COLORS["text_muted"]).pack(pady=40)
        else:
            top = ctk.CTkFrame(tab2, fg_color="transparent")
            top.pack(fill="x", padx=15, pady=10)
            ctk.CTkLabel(top, text="Gestão de Utilizadores", font=FONTS["heading"],
                         text_color=COLORS["text"]).pack(side="left")

            def novo_user():
                w = ctk.CTkToplevel(self)
                w.title("Novo Utilizador")
                w.geometry("400x380")
                w.configure(fg_color=COLORS["bg_dark"])
                w.grab_set()
                ctk.CTkLabel(w, text="Nome de utilizador *", font=FONTS["small"],
                             text_color=COLORS["text_muted"]).pack(anchor="w", padx=30, pady=(20, 2))
                eu = ctk.CTkEntry(w, height=36)
                eu.pack(fill="x", padx=30)
                ctk.CTkLabel(w, text="Nome completo", font=FONTS["small"],
                             text_color=COLORS["text_muted"]).pack(anchor="w", padx=30, pady=(10, 2))
                en = ctk.CTkEntry(w, height=36)
                en.pack(fill="x", padx=30)
                ctk.CTkLabel(w, text="Senha *", font=FONTS["small"],
                             text_color=COLORS["text_muted"]).pack(anchor="w", padx=30, pady=(10, 2))
                ep = ctk.CTkEntry(w, show="•", height=36)
                ep.pack(fill="x", padx=30)
                ctk.CTkLabel(w, text="Role", font=FONTS["small"],
                             text_color=COLORS["text_muted"]).pack(anchor="w", padx=30, pady=(10, 2))
                er = ctk.CTkComboBox(w, values=["admin", "gerente", "recepcionista", "caixa"], height=36)
                er.set("recepcionista")
                er.pack(fill="x", padx=30)

                def sv():
                    if not eu.get().strip() or not ep.get():
                        messagebox.showwarning("Atenção", "Utilizador e senha obrigatórios.")
                        return
                    session = get_session()
                    try:
                        if session.query(Utilizador).filter_by(nome_usuario=eu.get().strip()).first():
                            messagebox.showerror("Erro", "Utilizador já existe.")
                            return
                        session.add(Utilizador(
                            nome_usuario=eu.get().strip(),
                            nome_completo=en.get().strip() or None,
                            senha_hash=hash_password(ep.get()), role=er.get(),
                        ))
                        session.commit()
                        w.destroy()
                        messagebox.showinfo("Sucesso", f"Utilizador '{eu.get().strip()}' criado.")
                        self._show_config()
                    except Exception as ex:
                        session.rollback()
                        messagebox.showerror("Erro", str(ex))
                    finally:
                        session.close()

                ctk.CTkButton(w, text="Criar", height=40, font=FONTS["button"],
                              fg_color=COLORS["primary"], command=sv).pack(fill="x", padx=30, pady=20)

            ctk.CTkButton(top, text="+ Novo", width=90, height=32, font=FONTS["small"],
                          fg_color=COLORS["primary"], command=novo_user).pack(side="right")

            ut = ctk.CTkScrollableFrame(tab2, fg_color="transparent")
            ut.pack(fill="both", expand=True, padx=10, pady=5)
            hr = ctk.CTkFrame(ut, fg_color=COLORS["primary"], height=32)
            hr.pack(fill="x")
            for h in ["Utilizador", "Nome Completo", "Role", "Estado"]:
                ctk.CTkLabel(hr, text=h, font=FONTS["small"], text_color="white", width=140).pack(side="left", padx=5, pady=4)
            session = get_session()
            try:
                for u in session.query(Utilizador).order_by(Utilizador.nome_usuario).all():
                    row = ctk.CTkFrame(ut, fg_color="transparent")
                    row.pack(fill="x", pady=1)
                    for v in [u.nome_usuario, u.nome_completo or "—", u.role, "Activo" if u.activo else "Inactivo"]:
                        ctk.CTkLabel(row, text=v, font=FONTS["small"], text_color=COLORS["text"],
                                     width=140).pack(side="left", padx=5)
            finally:
                session.close()

        # Empresa
        tab3 = tabs.tab("Empresa")
        ctk.CTkLabel(tab3, text="Dados do Estabelecimento", font=FONTS["heading"],
                     text_color=COLORS["text"]).pack(anchor="w", padx=20, pady=(20, 15))
        session = get_session()
        emp = session.query(Empresa).first()
        session.close()
        efields = {}
        for key, label in [("nome", "Nome da Empresa / Hotel *"), ("nuit", "NUIT"),
                           ("endereco", "Endereço"), ("cidade", "Cidade"),
                           ("telefone1", "Telefone"), ("email", "Email")]:
            ctk.CTkLabel(tab3, text=label, font=FONTS["small"],
                         text_color=COLORS["text_muted"]).pack(anchor="w", padx=20, pady=(6, 1))
            e = ctk.CTkEntry(tab3, height=34, width=400)
            e.pack(anchor="w", padx=20)
            if emp and getattr(emp, key, None):
                e.insert(0, str(getattr(emp, key)))
            efields[key] = e

        def salvar_emp():
            if not efields["nome"].get().strip():
                messagebox.showwarning("Atenção", "Nome obrigatório.")
                return
            session = get_session()
            try:
                em = session.query(Empresa).first()
                if not em:
                    em = Empresa(nome=efields["nome"].get().strip())
                    session.add(em)
                for k, e in efields.items():
                    setattr(em, k, e.get().strip() or None)
                session.commit()
                messagebox.showinfo("Sucesso", "Dados da empresa guardados.")
            except Exception as e:
                session.rollback()
                messagebox.showerror("Erro", str(e))
            finally:
                session.close()

        ctk.CTkButton(tab3, text="Guardar Dados da Empresa", height=38, font=FONTS["button"],
                      fg_color=COLORS["primary"], command=salvar_emp, width=250).pack(anchor="w", padx=20, pady=20)

        # Sistema (Backup e utilitários)
        tab_sis = tabs.tab("Sistema")
        ctk.CTkLabel(tab_sis, text="Ferramentas do Sistema", font=FONTS["heading"],
                     text_color=COLORS["text"]).pack(anchor="w", padx=20, pady=(20, 15))
        ctk.CTkLabel(tab_sis, text=f"Base de dados: {DB_PATH}",
                     font=FONTS["small"], text_color=COLORS["text_muted"]).pack(anchor="w", padx=20, pady=(0, 10))

        def fazer_backup():
            try:
                destino = filedialog.asksaveasfilename(
                    title="Guardar cópia de segurança",
                    defaultextension=".db",
                    filetypes=[("Base de dados SQLite", "*.db"), ("Todos os ficheiros", "*.*")],
                    initialfile=f"ECHpro_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
                )
                if not destino:
                    return
                import shutil
                shutil.copy2(DB_PATH, destino)
                messagebox.showinfo("Backup", f"Cópia de segurança criada com sucesso:\n{destino}")
            except Exception as e:
                messagebox.showerror("Erro", f"Falha ao criar backup:\n{e}")

        def restaurar_backup():
            if not messagebox.askyesno("Restaurar",
                    "ATENÇÃO: A restauração substitui todos os dados actuais.\n"
                    "Tem a certeza que deseja continuar?"):
                return
            try:
                origem = filedialog.askopenfilename(
                    title="Seleccionar ficheiro de backup",
                    filetypes=[("Base de dados SQLite", "*.db"), ("Todos os ficheiros", "*.*")]
                )
                if not origem:
                    return
                import shutil
                # Fechar engine connections roughly
                engine.dispose()
                shutil.copy2(origem, DB_PATH)
                messagebox.showinfo("Restaurado",
                    "Base de dados restaurada.\nReinicie a aplicação para aplicar as alterações.")
            except Exception as e:
                messagebox.showerror("Erro", f"Falha ao restaurar:\n{e}")

        ctk.CTkButton(tab_sis, text="💾  Criar Cópia de Segurança (Backup)", height=40,
                      font=FONTS["button"], fg_color=COLORS["primary"],
                      command=fazer_backup, width=320).pack(anchor="w", padx=20, pady=10)
        ctk.CTkButton(tab_sis, text="📂  Restaurar a partir de Backup", height=40,
                      font=FONTS["button"], fg_color=COLORS["warning"],
                      command=restaurar_backup, width=320).pack(anchor="w", padx=20, pady=5)
        ctk.CTkLabel(tab_sis, text="Recomenda-se fazer backup regularmente.\n"
                     "O ficheiro .db contém todos os dados do sistema.",
                     font=FONTS["small"], text_color=COLORS["text_muted"]).pack(anchor="w", padx=20, pady=15)

        # Sobre
        tab4 = tabs.tab("Sobre")
        ctk.CTkLabel(tab4, text="🏨  ECHpro", font=("Segoe UI", 26, "bold"),
                     text_color=COLORS["secondary"]).pack(pady=(30, 5))
        ctk.CTkLabel(tab4, text="Versão 2.2.0 — Ficheiro Único Completo e Robusto",
                     font=FONTS["body"], text_color=COLORS["text"]).pack()
        ctk.CTkLabel(tab4, text="Sistema de Gestão de Hóspedes Profissional\n"
                     "Compatível com Windows 10 e Windows 11",
                     font=FONTS["small"], text_color=COLORS["text_muted"]).pack(pady=8)

        # Contactos de Apoio
        suporte = ctk.CTkFrame(tab4, fg_color=COLORS["bg_input"], corner_radius=10)
        suporte.pack(fill="x", padx=40, pady=20)
        _logo_sup = get_logo("full", 150)
        if _logo_sup:
            ctk.CTkLabel(suporte, text="", image=_logo_sup).pack(pady=(18, 4))
        ctk.CTkLabel(suporte, text="📞  APOIO AO CLIENTE", font=FONTS["heading"],
                     text_color=COLORS["accent"]).pack(pady=(10, 8))
        ctk.CTkLabel(suporte, text="Telefone / WhatsApp:  +258 82 747 3434",
                     font=FONTS["body"], text_color=COLORS["text"]).pack(pady=2)
        ctk.CTkLabel(suporte, text="Email:  ebenchume@sapo.mz",
                     font=FONTS["body"], text_color=COLORS["text"]).pack(pady=2)
        ctk.CTkLabel(suporte, text="Horário de apoio: Segunda a Sexta, 08h–17h",
                     font=FONTS["small"], text_color=COLORS["text_muted"]).pack(pady=(5, 15))

        # Estado da licença
        can, status = can_run()
        lic_color = COLORS["success"] if is_licensed() else COLORS["warning"]
        ctk.CTkLabel(tab4, text=f"Estado da licença: {status}",
                     font=FONTS["body"], text_color=lic_color).pack(pady=(10, 4))
        if not is_licensed():
            def abrir_activacao():
                win = ActivationWindow(lambda: None)
                win.grab_set()
            ctk.CTkButton(tab4, text="Activar produto…", width=180, height=32,
                          font=FONTS["small"], fg_color=COLORS["primary"],
                          command=abrir_activacao).pack(pady=6)

        ctk.CTkLabel(tab4, text="Login padrão: admin / admin123",
                     font=FONTS["body"], text_color=COLORS["warning"]).pack(pady=8)
        ctk.CTkLabel(tab4, text="Desenvolvido para gestão profissional de alojamento.\n"
                     "Todos os direitos reservados © 2025-2026",
                     font=FONTS["small"], text_color=COLORS["text_muted"]).pack(pady=8)


# ══════════════════════════════════════════════════════════════════════════
#  ENTRADA PRINCIPAL
# ══════════════════════════════════════════════════════════════════════════

def main():
    print("=" * 55)
    print("  ECHpro v2.2 — Ficheiro Único Completo e Robusto")
    print("  Sistema de Gestão de Hóspedes Profissional")
    print("  Apoio: +258 82 747 3434 | ebenchume@sapo.mz")
    print("=" * 55)

    # Verificar licença / trial
    can, status_msg = can_run()
    print(f"  Estado: {status_msg}")
    print("=" * 55)

    try:
        init_db()
    except Exception as e:
        print(f"Erro ao inicializar BD: {e}")
        input("Pressione Enter para sair...")
        sys.exit(1)

    def start_login():
        def on_login(utilizador):
            MainWindow(utilizador).mainloop()
        LoginWindow(on_login).mainloop()

    # Se não puder correr (trial expirado e sem licença), força activação
    if not can:
        ActivationWindow(start_login).mainloop()
    else:
        # Mesmo com trial/licença, permite activar se o utilizador quiser
        # (mostra a janela de activação apenas se não estiver licenciado)
        if not is_licensed():
            ActivationWindow(start_login).mainloop()
        else:
            start_login()


if __name__ == "__main__":
    main()
