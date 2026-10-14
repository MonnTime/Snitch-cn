"""
Snitch — external command helper.

EN: One place to run a console command and get its stdout as text, decoded with
    the REAL locale encoding.

    Why this module exists: Python 3.15+ enables UTF-8 mode by default
    (PEP 686), so `subprocess.run(..., text=True)` alone decodes child output as
    UTF-8. On Windows the console code page is NOT UTF-8 (cp936 on Chinese
    systems, cp850 elsewhere), so `arp -a` / `route print` output fails to
    decode. That failure is nastier than it looks:

      * the UnicodeDecodeError is raised inside subprocess' internal reader
        thread, NOT at the `subprocess.run()` call site;
      * the same thread then dies leaving `proc.stdout` as None, so the caller
        blows up with `AttributeError: 'NoneType' object has no attribute
        'splitlines'` instead of a decode error.

    Net effect on a Chinese Windows box: gateway detection raised on every
    packet batch, so `_process_batch()` never completed and the UI stayed empty.

    `locale.getencoding()` deliberately ignores UTF-8 mode and returns the true
    locale encoding, which is the right codec for these tools.

FR: Un seul endroit pour lancer une commande console et récupérer sa sortie
    texte, décodée avec le VRAI encodage local.

    Pourquoi ce module existe : Python 3.15+ active le mode UTF-8 par défaut
    (PEP 686), donc `subprocess.run(..., text=True)` seul décode la sortie en
    UTF-8. Sous Windows la page de code console n'est PAS de l'UTF-8 (cp936 sur
    les systèmes chinois, cp850 ailleurs), donc la sortie de `arp -a` /
    `route print` ne se décode pas. Cet échec est plus vicieux qu'il n'y paraît :

      * la UnicodeDecodeError est levée dans le thread lecteur interne de
        subprocess, PAS au niveau de l'appel `subprocess.run()` ;
      * ce thread meurt ensuite en laissant `proc.stdout` à None, si bien que
        l'appelant casse sur `AttributeError: 'NoneType' object has no attribute
        'splitlines'` au lieu d'une erreur de décodage.

    Effet net sur une machine Windows chinoise : la détection de passerelle
    levait à chaque lot de paquets, donc `_process_batch()` ne se terminait
    jamais et l'UI restait vide.

    `locale.getencoding()` ignore volontairement le mode UTF-8 et renvoie le
    véritable encodage local, le bon codec pour ces outils.
"""

import locale
import logging
import subprocess
from typing import Optional, Sequence

logger = logging.getLogger("snitch.oscmd")

# EN: The real locale encoding — cp936 on Chinese Windows, UTF-8 on Linux/macOS.
# FR: Le véritable encodage local — cp936 sous Windows chinois, UTF-8 ailleurs.
LOCALE_ENCODING = locale.getencoding()


def run_text(args: Sequence[str], timeout: float = 10.0) -> Optional[str]:
    """
    EN: Run `args` and return its stdout as text, or None if the command could
        not be run.

        Never raises for a missing binary, a timeout, or an odd byte: bytes
        outside the locale encoding become U+FFFD instead of killing the caller.
        The parts we actually parse — IPs, MACs, digits — are pure ASCII, so
        they always survive a lossy decode.

    FR: Exécuter `args` et renvoyer sa sortie texte, ou None si la commande n'a
        pas pu être lancée.

        Ne lève jamais pour un binaire absent, un timeout ou un octet étrange :
        les octets hors encodage local deviennent U+FFFD au lieu de tuer
        l'appelant. Les parties réellement analysées — IP, MAC, chiffres — sont
        de l'ASCII pur : elles survivent toujours à un décodage avec pertes.
    """
    try:
        proc = subprocess.run(args, capture_output=True, text=True,
                              encoding=LOCALE_ENCODING, errors="replace",
                              timeout=timeout)
    except (OSError, subprocess.TimeoutExpired) as exc:
        logger.debug("%s failed: %s", args[0], exc)
        return None
    return proc.stdout or ""
