#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ECHpro — Gerador de Chaves de Activação
=======================================
Execute este script para gerar novas chaves válidas.

Uso:
  python GERAR_CHAVES.py              → gera 10 chaves aleatórias
  python GERAR_CHAVES.py 5            → gera 5 chaves
  python GERAR_CHAVES.py --seed 100   → gera a partir do seed 100
"""

import hashlib
import hmac
import uuid
import sys

_LICENSE_SECRET = b"ECHpro-v2.2-2026-EBenchume-MZ-SecretKey!@#$%^&*"
_LICENSE_PREFIX = "ECHP"


def _key_checksum(body: str) -> str:
    dig = hmac.new(_LICENSE_SECRET, body.encode(), hashlib.sha256).hexdigest()
    return dig[:4].upper()


def generate_activation_key(seed=None) -> str:
    if seed is None:
        seed = str(uuid.uuid4().int % 10**12)
    seed = str(seed)
    raw = hmac.new(_LICENSE_SECRET, f"ECHP-KEY-{seed}".encode(), hashlib.sha256).hexdigest().upper()
    body = raw[:12]
    check = _key_checksum(body)
    p1, p2, p3, p4 = body[0:4], body[4:8], body[8:12], check
    return f"{_LICENSE_PREFIX}-{p1}-{p2}-{p3}-{p4}"


def validate_activation_key(key: str) -> bool:
    norm = "".join(c for c in key.upper() if c.isalnum())
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


if __name__ == "__main__":
    print("=" * 55)
    print("  ECHpro — Gerador de Chaves de Activação")
    print("=" * 55)
    print()

    count = 10
    seed_start = None

    args = sys.argv[1:]
    if args:
        if args[0] == "--seed" and len(args) > 1:
            seed_start = int(args[1])
            count = 10
        else:
            try:
                count = int(args[0])
            except ValueError:
                count = 10

    if seed_start is not None:
        print(f"A gerar {count} chaves a partir do seed {seed_start}:\n")
        for i in range(seed_start, seed_start + count):
            k = generate_activation_key(i)
            print(f"  {k}")
    else:
        print(f"A gerar {count} chaves aleatórias:\n")
        for i in range(count):
            k = generate_activation_key()
            print(f"  {k}")

    print()
    print("Estas chaves são válidas e podem ser distribuídas aos clientes.")
    print("Cada chave pode ser usada numa máquina.")
    print()
