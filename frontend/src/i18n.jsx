/**
 * Snitch — internationalization (English / Français / 中文).
 *
 * EN: Tiny homemade i18n layer. Three flat dictionaries (`en` / `fr` / `zh`)
 *     keyed by string. Values can be plain strings or functions for
 *     interpolation, e.g. t('lan_devices', 3) → "3 devices LAN".
 *     `useT()` returns { lang, locale, languages, t, setLang } to any
 *     component. Missing keys fall back to English, then to the key itself.
 * FR: Petite couche i18n maison. Trois dictionnaires plats (`en` / `fr` / `zh`)
 *     indexés par chaîne. Les valeurs peuvent être des chaînes simples ou des
 *     fonctions pour l'interpolation, ex. t('lan_devices', 3).
 *     `useT()` renvoie { lang, locale, languages, t, setLang } à tout composant.
 *     Les clés manquantes retombent sur l'anglais, puis sur la clé elle-même.
 * ZH: 自研轻量 i18n 层。三个扁平字典（`en` / `fr` / `zh`），键为字符串。
 *     值可以是普通字符串，也可以是用于插值的函数，例如 t('lan_devices', 3)。
 *     `useT()` 向任意组件返回 { lang, locale, languages, t, setLang }。
 *     缺失的键依次回退到英文、再回退到键名本身。
 */
import { createContext, useContext, useState, useEffect, useMemo } from 'react'

// ── English dictionary / Dictionnaire anglais ────────────────────────────────
const en = {
  // Navigation
  nav_graph: 'Graph',
  nav_map: 'Map',

  // Status badge / Badge de statut
  status_connected: 'Live',
  status_connecting: 'Connecting…',
  status_disconnected: 'Disconnected',
  status_error: 'Error',
  lan_devices: n => `${n} device${n > 1 ? 's' : ''} LAN`,

  // Legend / Légende
  legend_alert: 'Alert',
  legend_unknown: 'Unknown',
  legend_router: 'Router',
  legend_phone: 'Phone',
  legend_pc: 'PC',
  legend_iot: 'IoT',
  legend_https: 'HTTPS',
  legend_tracking: 'Tracking',
  legend_cdn: 'CDN',
  legend_dns: 'DNS',

  // Sidebar header + stats / En-tête de barre latérale + stats
  app_name: 'SNITCH',
  tagline: 'Track every hidden flow.',
  footer_credit: 'Developed by aiXis',
  stat_lan: 'LAN Devices',
  stat_ext: 'Ext. hosts',
  stat_traffic: 'Traffic',

  // Sidebar sections / Sections de la barre latérale
  section_lan: n => `LAN Devices (${n})`,
  section_ext: (n, total) => total ? `External hosts (${n}/${total})` : `External hosts (${n})`,
  section_packets: 'Recent traffic',

  // Node detail field labels / Étiquettes des champs de détail de nœud
  field_ip: 'IP',
  field_mac: 'MAC',
  field_hostname: 'Hostname',
  field_vendor: 'Vendor',
  field_type: 'Type',
  field_country: 'Country',
  field_city: 'City',
  field_org: 'Org',
  field_category: 'Category',
  field_traffic: 'Traffic',
  field_packets: 'Packets',
  processes: 'Processes',
  online: 'online',
  offline: 'offline',

  // Search / Recherche
  search_placeholder: 'Search host, IP, country…',
  cat_all: 'All',
  cat_unknown: 'Unknown',
  cat_alerted: 'Alerts',
  cat_safe: 'Safe',
  cat_tracking: 'Tracking',
  cat_cdn: 'CDN',
  cat_dns: 'DNS',
  cat_admin: 'Admin',
  cat_local: 'Local',
  cat_lan_device: 'LAN device',
  cat_other: 'Other',

  // EN: Node names + identification hints shown to the user.
  // FR: Noms de nœuds + indices d'identification affichés à l'utilisateur.
  node_local: 'This Device',
  hint_local: 'This is THIS machine — the one running Snitch. Everything it sends or receives radiates from the center of the graph.',
  unidentified: 'unidentified',
  devtype_router: 'Router',
  devtype_phone: 'Phone',
  devtype_pc: 'Computer',
  devtype_tv: 'TV',
  devtype_iot: 'IoT device',
  devtype_unknown: 'Unknown type',
  hint_unidentified: "Not identified yet — its name appears when it announces itself (DNS/mDNS) or its MAC vendor is known. If you don't recognize it, check your router's client list.",
  hint_unresolved: 'Not yet named — the domain appears when a DNS answer or TLS handshake reveals it.',
  hint_private_mac: 'Private (randomized) MAC address — iOS/Android/Windows hide the real one, so the vendor can\'t be identified. This is normal privacy behavior.',
  hint_gateway: 'This is your internet box/router — ALL your traffic physically passes through it, so seeing it communicate is normal and expected.',
  hint_lan_idle: 'Seen on your network via the neighbour table — no data exchanged. A dashed edge means "present", not "talking".',
  hint_lan_active: b => `${b} exchanged — usually automatic announcements (Bonjour/mDNS, file sharing). Watch it if the volume climbs.`,
  ext_empty: "No external connections yet — anything your machine talks to will appear here.",
  legend_edge_solid: 'solid line = traffic',
  legend_edge_dashed: 'dashed = seen, no data',
  legend_ring_safe: 'green ring = identified, safe',
  legend_ring_warn: 'amber ring = suspicious',
  legend_ring_crit: 'red ring = alert',
  legend_ring_none: 'no ring = unidentified, neutral',
  legend_perimeter: 'LAN perimeter',
  perim_lan: 'LOCAL NETWORK',

  // Alert panel / Panneau d'alertes
  alerts_title: 'Alerts',
  alerts_total: 'total',
  alerts_empty: 'No alerts yet',
  alert_NEW_HOST: 'New host',
  alert_SUSPICIOUS_PROCESS: 'Suspicious process',
  alert_SUSPICIOUS_PORT: 'Suspicious port',
  alert_BEACON: 'Beacon C2',
  alert_VOLUME_SPIKE: 'Traffic spike',
  alert_NEW_LAN_DEVICE: 'New device',
  alert_DEVICE_OFFLINE: 'Device offline',
  alert_MEDIA_EXFIL: 'Media exfiltration',
  alert_PORT_SCAN: 'Port scan',
  // EN: Full alert messages built from backend codes + details — the backend
  //     only sends type + params, never prose.
  // FR: Messages d'alerte complets construits depuis les codes + détails du
  //     backend — le backend n'envoie que type + paramètres, jamais de prose.
  alertmsg_NEW_HOST: d => `New host contacted: ${d.host || d.ip}`,
  alertmsg_SUSPICIOUS_PROCESS: d => `Suspicious process: ${d.process} → ${d.host || d.ip}`,
  alertmsg_SUSPICIOUS_PORT: d => `Suspicious port ${d.port} (${d.reason}) → ${d.host || d.ip}`,
  alertmsg_BEACON: d => `Beacon-like regularity: ~${d.interval_s}s interval to ${d.host || d.ip}`,
  alertmsg_VOLUME_SPIKE: d => `Data spike to ${d.host || d.ip}: ${Math.round((d.bytes || 0) / 1024)} KB in ${d.window_s}s`,
  alertmsg_MEDIA_EXFIL: d => `Suspected ${d.device} exfiltration: ${d.process} → ${d.host || d.ip}`,
  alertmsg_NEW_LAN_DEVICE: d => `New device on the network: ${d.host || d.ip}`,
  alertmsg_DEVICE_OFFLINE: d => `Device went offline: ${d.host || d.ip}`,
  alertmsg_PORT_SCAN: d => `Port scan: ${d.source || d.ip} touched ${d.ports}+ ports in ${d.window_s}s`,
  time_just_now: 'just now',
  time_seconds: n => `${n}s ago`,
  time_minutes: n => `${n}min ago`,
  time_hours: n => `${n}h ago`,

  // EN: Localized "reason" for suspicious ports — the backend ships a stable
  //     `reason_code` alongside its English prose.
  // FR: « Raison » localisée des ports suspects — le backend envoie un
  //     `reason_code` stable à côté de sa prose anglaise.
  reason_metasploit_shell: 'Metasploit shell',
  reason_hacker_port: 'Hacker port',
  reason_back_orifice: 'Back Orifice',
  reason_irc_botnet: 'IRC botnet',
  reason_socks_proxy: 'SOCKS proxy',
  reason_tor_relay: 'Tor relay',
  reason_tor_socks: 'Tor SOCKS',

  // EN: Labels for the raw `details` key/value line under each alert.
  // FR: Libellés de la ligne brute `détails` sous chaque alerte.
  detail_ip: 'ip',
  detail_host: 'host',
  detail_hosts: 'hosts',
  detail_port: 'port',
  detail_process: 'process',
  detail_reason: 'reason',
  detail_direction: 'direction',
  detail_source: 'source',
  detail_mac: 'mac',
  detail_vendor: 'vendor',
  detail_country: 'country',
  detail_org: 'org',
  detail_interval_s: 'interval_s',
  detail_cv: 'cv',
  detail_samples: 'samples',
  detail_bytes: 'bytes',
  detail_window_s: 'window_s',
  detail_ports: 'ports',
  detail_device: 'device',
  detail_count: 'count',

  // Privacy score / Score de confidentialité
  privacy_title: 'Privacy Score',
  privacy_critical_label: 'Critical',
  privacy_excellent_label: 'Excellent',
  privacy_risk_factors: n => `${n} risk factor${n !== 1 ? 's' : ''}`,
  privacy_more_factors: n => `+${n} more factor${n > 1 ? 's' : ''}`,
  privacy_label_excellent: 'Excellent',
  privacy_label_good: 'Good',
  privacy_label_average: 'Average',
  privacy_label_weak: 'Weak',
  privacy_label_critical: 'Critical',

  // Timeline
  timeline_title: 'Timeline',
  timeline_packets: (n, locale) => `${Number(n || 0).toLocaleString(locale)} packets`,
  timeline_alerts: n => `${n} alert${n > 1 ? 's' : ''}`,
  timeline_live: 'Live',
  min_short: n => `${n}min`,

  // Capture toggle / Bascule de capture
  capture_stop: 'Stop',
  capture_start: 'Start',
  capture_stopping: 'Stopping…',
  capture_starting: 'Starting…',

  // Port filter / Filtre de ports
  port_filter: 'Ports',
  port_all: 'All ports',
  port_placeholder: 'Add port (e.g. 443)',
  port_invalid: 'Invalid port',
  port_count: n => `${n} port${n > 1 ? 's' : ''}`,

  // Export
  export_btn: 'Export',
  export_graph_json: 'Graph (JSON)',
  export_graph_csv: 'Graph (CSV)',
  export_alerts_json: 'Alerts (JSON)',
  export_alerts_csv: 'Alerts (CSV)',

  // Process filter / Filtre de processus
  process_filter: 'Apps',
  process_filter_hint: 'Click to hide app from graph',
  process_none: 'No processes detected yet',
  process_clear: 'Show all apps',

  // IP whitelist / Liste blanche d'IP
  ip_whitelist: 'Trusted',
  ip_whitelist_hint: 'Trusted IPs are no longer captured or shown',
  ip_placeholder: 'Add IP (e.g. 1.1.1.1)',
  ip_invalid: 'Invalid IP address',
  ip_clear: 'Clear whitelist',
  whitelist_action: 'Mark as trusted',

  // Map / Carte
  map_you: 'You',
  map_located: n => `${n} located host${n !== 1 ? 's' : ''}`,
  map_no_geo: 'no geo',

  // Scoring factor labels / Libellés des facteurs de score
  score_trackers: n => `${n} tracker${n > 1 ? 's' : ''} contacted`,
  score_tracker_traffic: pct => `${pct}% traffic to trackers`,
  score_ad_networks: n => `${n} ad network${n > 1 ? 's' : ''}`,
  score_beacons: n => `${n} beacon behavior${n > 1 ? 's' : ''}`,
  score_susp_proc: n => `${n} suspicious process${n > 1 ? 'es' : ''}`,
  score_susp_ports: n => `${n} dangerous port${n > 1 ? 's' : ''}`,
  score_critical_alerts: n => `${n} critical alert${n > 1 ? 's' : ''}`,
  score_warnings: n => `${n} warnings`,
  score_https_ratio: pct => `${pct}% HTTPS traffic`,
  score_no_trackers: 'No trackers detected',

  // Settings / Réglages
  settings_title: 'Settings',
  settings_saved: 'Saved',
  close: 'Close',
  settings_language: 'Language',
  settings_retention: 'History retention',
  settings_retention_hint: 'How long traffic & alert history is kept',
  geo_title: 'Geolocation database',
  geo_present: dbs => `Installed: ${dbs}`,
  geo_none: 'Not installed — IPs are not geolocated',
  geo_download_btn: 'Download DB-IP Lite (free)',
  geo_consent: 'Downloads ~50 MB from db-ip.com (CC BY 4.0). This is the only outbound call Snitch can make.',
  geo_downloading: 'Downloading…',
  geo_done: n => `Downloaded ${n} database(s)`,
  geo_failed: 'Download failed — check your connection',
  diag_title: 'Diagnostics',
  diag_hint: 'Logs and system info for bug reports',
  diag_open_logs: 'Logs',
  diag_export: 'Export',
  settings_note: 'All settings are stored locally. Snitch never sends data to third parties.',
  nav_apps: 'Apps',
  ignore_alert: 'Ignore this alert type/host',

  // Apps view / Vue applications
  apps_empty: 'No process attributed yet',
  apps_process: 'Process',
  apps_destinations: 'Hosts',
  apps_packets: 'Packets',
  apps_volume: 'Volume',
  apps_top_dest: 'Top destinations',
  apps_history_60m: 'Last hour (bytes/min)',
  alertmsg_NEW_HOSTS: n => `${n} new host${n > 1 ? 's' : ''} contacted`,
  settings_autolaunch: 'Launch at login',
  settings_autolaunch_hint: 'Start Snitch automatically when you sign in',

  // Onboarding / Premier lancement
  onboard_title: 'Welcome to Snitch',
  onboard_sub: 'Real-time network traffic visualizer — private by design.',
  onboard_priv_title: 'Everything stays on this machine',
  onboard_priv_body: 'Traffic metadata, alerts and history are stored in a local SQLite database. No account, no cloud, no telemetry.',
  onboard_capture_title: 'What is captured',
  onboard_capture_body: 'Packet headers only: destination IPs, ports, volumes, process names, DNS names and TLS server names (SNI). Payloads are never read.',
  onboard_out_title: 'What leaves the machine',
  onboard_out_body: 'Nothing by default. The only possible outbound call is the geolocation database download, which you trigger yourself in Settings.',
  onboard_go: 'Got it',

  // Short units + accessibility labels / Unités courtes + libellés a11y
  packet_short: n => `${n} pkt`,
  aria_settings: 'Settings',
  aria_close_alerts: 'Close alerts',
  doc_title: 'Snitch — Track every hidden flow.',
}

// ── Dictionnaire français / French dictionary ────────────────────────────────
const fr = {
  // Navigation
  nav_graph: 'Graphe',
  nav_map: 'Carte',

  // Badge de statut / Status badge
  status_connected: 'Live',
  status_connecting: 'Connexion…',
  status_disconnected: 'Déconnecté',
  status_error: 'Erreur',
  lan_devices: n => `${n} appareil${n > 1 ? 's' : ''} LAN`,

  // Légende / Legend
  legend_alert: 'Alerte',
  legend_unknown: 'Inconnu',
  legend_router: 'Routeur',
  legend_phone: 'Téléphone',
  legend_pc: 'PC',
  legend_iot: 'IoT',
  legend_https: 'HTTPS',
  legend_tracking: 'Pistage',
  legend_cdn: 'CDN',
  legend_dns: 'DNS',

  // En-tête de barre latérale + stats / Sidebar header + stats
  app_name: 'SNITCH',
  tagline: 'Traquez chaque flux masqué.',
  footer_credit: 'Développé par aiXis',
  stat_lan: 'Appareils LAN',
  stat_ext: 'Hôtes ext.',
  stat_traffic: 'Trafic',

  // Sections de la barre latérale / Sidebar sections
  section_lan: n => `Appareils LAN (${n})`,
  section_ext: (n, total) => total ? `Hôtes externes (${n}/${total})` : `Hôtes externes (${n})`,
  section_packets: 'Flux récents',

  // Étiquettes des champs de détail de nœud / Node detail field labels
  field_ip: 'IP',
  field_mac: 'MAC',
  field_hostname: 'Nom d\'hôte',
  field_vendor: 'Fabricant',
  field_type: 'Type',
  field_country: 'Pays',
  field_city: 'Ville',
  field_org: 'Org',
  field_category: 'Catégorie',
  field_traffic: 'Trafic',
  field_packets: 'Paquets',
  processes: 'Processus',
  online: 'en ligne',
  offline: 'hors ligne',

  // Recherche / Search
  search_placeholder: 'Rechercher hôte, IP, pays…',
  cat_all: 'Tout',
  cat_unknown: 'Inconnu',
  cat_alerted: 'Alertes',
  cat_safe: 'Sûr',
  cat_tracking: 'Pistage',
  cat_cdn: 'CDN',
  cat_dns: 'DNS',
  cat_admin: 'Admin',
  cat_local: 'Local',
  cat_lan_device: 'Appareil LAN',
  cat_other: 'Autre',

  // FR: Noms de nœuds + indices d'identification affichés à l'utilisateur.
  // EN: Node names + identification hints shown to the user.
  node_local: 'Cet appareil',
  hint_local: "C'est CETTE machine — celle qui fait tourner Snitch. Tout ce qu'elle envoie ou reçoit rayonne depuis le centre du graphe.",
  unidentified: 'non identifié',
  devtype_router: 'Routeur',
  devtype_phone: 'Téléphone',
  devtype_pc: 'Ordinateur',
  devtype_tv: 'TV',
  devtype_iot: 'Objet connecté',
  devtype_unknown: 'Type inconnu',
  hint_unidentified: "Pas encore identifié — son nom apparaîtra s'il s'annonce (DNS/mDNS) ou si son fabricant est connu. Si vous ne le reconnaissez pas, vérifiez la liste des clients de votre box/routeur.",
  hint_unresolved: "Pas encore nommé — le domaine apparaîtra quand une réponse DNS ou un handshake TLS le révélera.",
  hint_private_mac: "Adresse MAC privée (aléatoire) — iOS/Android/Windows masquent la vraie, le fabricant ne peut pas être identifié. C'est un comportement de confidentialité normal.",
  hint_gateway: "C'est votre box/routeur — TOUT votre trafic internet passe physiquement par elle, donc la voir communiquer est normal et attendu.",
  hint_lan_idle: "Vu sur votre réseau via la table de voisinage — aucune donnée échangée. Une arête en pointillés signifie « présent », pas « en train de communiquer ».",
  hint_lan_active: b => `${b} échangés — le plus souvent des annonces automatiques (Bonjour/mDNS, partage de fichiers). À surveiller si le volume grimpe.`,
  ext_empty: "Aucune connexion externe pour l'instant — tout hôte contacté par votre machine apparaîtra ici.",
  legend_edge_solid: 'trait plein = trafic',
  legend_edge_dashed: 'pointillés = vu, sans données',
  legend_ring_safe: 'anneau vert = identifié, sûr',
  legend_ring_warn: 'anneau orange = suspect',
  legend_ring_crit: 'anneau rouge = alerte',
  legend_ring_none: 'sans anneau = non identifié, neutre',
  legend_perimeter: 'périmètre LAN',
  perim_lan: 'RÉSEAU LOCAL',

  // Panneau d'alertes / Alert panel
  alerts_title: 'Alertes',
  alerts_total: 'total',
  alerts_empty: "Aucune alerte pour l'instant",
  alert_NEW_HOST: 'Nouvel hôte',
  alert_SUSPICIOUS_PROCESS: 'Processus suspect',
  alert_SUSPICIOUS_PORT: 'Port suspect',
  alert_BEACON: 'Beacon C2',
  alert_VOLUME_SPIKE: 'Pic de trafic',
  alert_NEW_LAN_DEVICE: 'Nouvel appareil',
  alert_DEVICE_OFFLINE: 'Appareil hors ligne',
  alert_MEDIA_EXFIL: 'Exfiltration média',
  alert_PORT_SCAN: 'Scan de ports',
  alertmsg_NEW_HOST: d => `Nouvel hôte contacté : ${d.host || d.ip}`,
  alertmsg_SUSPICIOUS_PROCESS: d => `Processus suspect : ${d.process} → ${d.host || d.ip}`,
  alertmsg_SUSPICIOUS_PORT: d => `Port suspect ${d.port} (${d.reason}) → ${d.host || d.ip}`,
  alertmsg_BEACON: d => `Régularité type beacon : intervalle ~${d.interval_s}s vers ${d.host || d.ip}`,
  alertmsg_VOLUME_SPIKE: d => `Pic de données vers ${d.host || d.ip} : ${Math.round((d.bytes || 0) / 1024)} Ko en ${d.window_s}s`,
  alertmsg_PORT_SCAN: d => `Scan de ports : ${d.source || d.ip} a touché ${d.ports}+ ports en ${d.window_s}s`,
  alertmsg_MEDIA_EXFIL: d => `Exfiltration ${d.device === 'camera' ? 'caméra' : 'micro'} suspectée : ${d.process} → ${d.host || d.ip}`,
  alertmsg_NEW_LAN_DEVICE: d => `Nouvel appareil sur le réseau : ${d.host || d.ip}`,
  alertmsg_DEVICE_OFFLINE: d => `Appareil hors ligne : ${d.host || d.ip}`,
  time_just_now: "à l'instant",
  time_seconds: n => `il y a ${n}s`,
  time_minutes: n => `il y a ${n}min`,
  time_hours: n => `il y a ${n}h`,

  // FR: « Raison » localisée des ports suspects / EN: Localized suspicious-port reasons
  reason_metasploit_shell: 'Shell Metasploit',
  reason_hacker_port: 'Port pirate',
  reason_back_orifice: 'Back Orifice',
  reason_irc_botnet: 'Botnet IRC',
  reason_socks_proxy: 'Proxy SOCKS',
  reason_tor_relay: 'Relais Tor',
  reason_tor_socks: 'Tor SOCKS',

  // FR: Libellés de la ligne brute `détails` sous chaque alerte.
  detail_ip: 'ip',
  detail_host: 'hôte',
  detail_hosts: 'hôtes',
  detail_port: 'port',
  detail_process: 'processus',
  detail_reason: 'raison',
  detail_direction: 'sens',
  detail_source: 'source',
  detail_mac: 'mac',
  detail_vendor: 'fabricant',
  detail_country: 'pays',
  detail_org: 'org',
  detail_interval_s: 'intervalle_s',
  detail_cv: 'cv',
  detail_samples: 'échantillons',
  detail_bytes: 'octets',
  detail_window_s: 'fenêtre_s',
  detail_ports: 'ports',
  detail_device: 'appareil',
  detail_count: 'nombre',

  // Score de confidentialité / Privacy score
  privacy_title: 'Score de confidentialité',
  privacy_critical_label: 'Critique',
  privacy_excellent_label: 'Excellent',
  privacy_risk_factors: n => `${n} facteur${n !== 1 ? 's' : ''} de risque`,
  privacy_more_factors: n => `+${n} autre${n > 1 ? 's' : ''} facteur${n > 1 ? 's' : ''}`,
  privacy_label_excellent: 'Excellent',
  privacy_label_good: 'Bon',
  privacy_label_average: 'Moyen',
  privacy_label_weak: 'Faible',
  privacy_label_critical: 'Critique',

  // Timeline
  timeline_title: 'Chronologie',
  timeline_packets: (n, locale) => `${Number(n || 0).toLocaleString(locale)} paquets`,
  timeline_alerts: n => `${n} alerte${n > 1 ? 's' : ''}`,
  timeline_live: 'Direct',
  min_short: n => `${n}min`,

  // Bascule de capture / Capture toggle
  capture_stop: 'Stop',
  capture_start: 'Démarrer',
  capture_stopping: 'Arrêt…',
  capture_starting: 'Démarrage…',

  // Filtre de ports / Port filter
  port_filter: 'Ports',
  port_all: 'Tous les ports',
  port_placeholder: 'Ajouter un port (ex: 443)',
  port_invalid: 'Port invalide',
  port_count: n => `${n} port${n > 1 ? 's' : ''}`,

  // Export
  export_btn: 'Exporter',
  export_graph_json: 'Graphe (JSON)',
  export_graph_csv: 'Graphe (CSV)',
  export_alerts_json: 'Alertes (JSON)',
  export_alerts_csv: 'Alertes (CSV)',

  // Filtre de processus / Process filter
  process_filter: 'Apps',
  process_filter_hint: 'Cliquer pour masquer une app du graphe',
  process_none: 'Aucun processus détecté pour l\'instant',
  process_clear: 'Tout afficher',

  // Liste blanche d'IP / IP whitelist
  ip_whitelist: 'Confiance',
  ip_whitelist_hint: 'Les IP de confiance ne sont plus capturées ni affichées',
  ip_placeholder: 'Ajouter une IP (ex: 1.1.1.1)',
  ip_invalid: 'Adresse IP invalide',
  ip_clear: 'Vider la liste',
  whitelist_action: 'Marquer comme fiable',

  // Carte / Map
  map_you: 'Vous',
  map_located: n => `${n} hôte${n !== 1 ? 's' : ''} localisé${n !== 1 ? 's' : ''}`,
  map_no_geo: 'sans géo',

  // Libellés des facteurs de score / Scoring factor labels
  score_trackers: n => `${n} tracker${n > 1 ? 's' : ''} contacté${n > 1 ? 's' : ''}`,
  score_tracker_traffic: pct => `${pct}% de trafic vers des trackers`,
  score_ad_networks: n => `${n} régie${n > 1 ? 's' : ''} publicitaire${n > 1 ? 's' : ''}`,
  score_beacons: n => `${n} comportement${n > 1 ? 's' : ''} beacon`,
  score_susp_proc: n => `${n} processus suspect${n > 1 ? 's' : ''}`,
  score_susp_ports: n => `${n} port${n > 1 ? 's' : ''} dangereux`,
  score_critical_alerts: n => `${n} alerte${n > 1 ? 's' : ''} critique${n > 1 ? 's' : ''}`,
  score_warnings: n => `${n} alertes`,
  score_https_ratio: pct => `${pct}% de trafic HTTPS`,
  score_no_trackers: 'Aucun tracker détecté',

  // Réglages / Settings
  settings_title: 'Réglages',
  settings_saved: 'Enregistré',
  close: 'Fermer',
  settings_language: 'Langue',
  settings_retention: 'Rétention de l\'historique',
  settings_retention_hint: 'Durée de conservation du trafic et des alertes',
  geo_title: 'Base de géolocalisation',
  geo_present: dbs => `Installée : ${dbs}`,
  geo_none: 'Non installée — les IP ne sont pas géolocalisées',
  geo_download_btn: 'Télécharger DB-IP Lite (gratuit)',
  geo_consent: 'Télécharge ~50 Mo depuis db-ip.com (CC BY 4.0). C\'est le seul appel sortant possible de Snitch.',
  geo_downloading: 'Téléchargement…',
  geo_done: n => `${n} base(s) téléchargée(s)`,
  geo_failed: 'Échec du téléchargement — vérifiez la connexion',
  diag_title: 'Diagnostic',
  diag_hint: 'Logs et infos système pour les rapports de bug',
  diag_open_logs: 'Logs',
  diag_export: 'Exporter',
  settings_note: 'Tous les réglages sont stockés localement. Snitch n\'envoie rien à des tiers.',
  nav_apps: 'Apps',
  ignore_alert: 'Ignorer ce type/cet hôte',

  // Vue applications / Apps view
  apps_empty: 'Aucun processus attribué pour l\'instant',
  apps_process: 'Processus',
  apps_destinations: 'Hôtes',
  apps_packets: 'Paquets',
  apps_volume: 'Volume',
  apps_top_dest: 'Destinations principales',
  apps_history_60m: 'Dernière heure (octets/min)',
  alertmsg_NEW_HOSTS: n => `${n} nouvel${n > 1 ? 'x' : ''} hôte${n > 1 ? 's' : ''} contacté${n > 1 ? 's' : ''}`,
  settings_autolaunch: 'Lancer à la connexion',
  settings_autolaunch_hint: 'Démarrer Snitch automatiquement à l\'ouverture de session',

  // Premier lancement / Onboarding
  onboard_title: 'Bienvenue dans Snitch',
  onboard_sub: 'Visualiseur de trafic réseau en temps réel — privé par conception.',
  onboard_priv_title: 'Tout reste sur cette machine',
  onboard_priv_body: 'Métadonnées de trafic, alertes et historique sont stockés dans une base SQLite locale. Pas de compte, pas de cloud, pas de télémétrie.',
  onboard_capture_title: 'Ce qui est capturé',
  onboard_capture_body: 'Les en-têtes de paquets seulement : IP de destination, ports, volumes, noms de processus, noms DNS et SNI TLS. Les contenus ne sont jamais lus.',
  onboard_out_title: 'Ce qui quitte la machine',
  onboard_out_body: 'Rien par défaut. Le seul appel sortant possible est le téléchargement de la base de géolocalisation, que vous déclenchez vous-même dans les Réglages.',
  onboard_go: 'Compris',

  // Unités courtes + libellés a11y
  packet_short: n => `${n} pkt`,
  aria_settings: 'Réglages',
  aria_close_alerts: 'Fermer les alertes',
  doc_title: 'Snitch — Traquez chaque flux masqué.',
}

// ── 中文字典 / Chinese dictionary ───────────────────────────────────────────
const zh = {
  // 导航
  nav_graph: '关系图',
  nav_map: '地图',

  // 状态徽章
  status_connected: '实时',
  status_connecting: '连接中…',
  status_disconnected: '已断开',
  status_error: '错误',
  lan_devices: n => `${n} 台局域网设备`,

  // 图例
  legend_alert: '告警',
  legend_unknown: '未知',
  legend_router: '路由器',
  legend_phone: '手机',
  legend_pc: '电脑',
  legend_iot: 'IoT',
  legend_https: 'HTTPS',
  legend_tracking: '追踪',
  legend_cdn: 'CDN',
  legend_dns: 'DNS',

  // 侧栏标题 + 统计
  app_name: 'SNITCH',
  tagline: '追踪每一条隐藏的流量。',
  footer_credit: '由 aiXis 开发',
  stat_lan: '局域网设备',
  stat_ext: '外部主机',
  stat_traffic: '流量',

  // 侧栏分区
  section_lan: n => `局域网设备（${n}）`,
  section_ext: (n, total) => total ? `外部主机（${n}/${total}）` : `外部主机（${n}）`,
  section_packets: '最近流量',

  // 节点详情字段
  field_ip: 'IP',
  field_mac: 'MAC',
  field_hostname: '主机名',
  field_vendor: '厂商',
  field_type: '类型',
  field_country: '国家/地区',
  field_city: '城市',
  field_org: '机构',
  field_category: '分类',
  field_traffic: '流量',
  field_packets: '数据包',
  processes: '进程',
  online: '在线',
  offline: '离线',

  // 搜索
  search_placeholder: '搜索主机、IP、国家…',
  cat_all: '全部',
  cat_unknown: '未知',
  cat_alerted: '告警',
  cat_safe: '安全',
  cat_tracking: '追踪',
  cat_cdn: 'CDN',
  cat_dns: 'DNS',
  cat_admin: '管理',
  cat_local: '本地',
  cat_lan_device: '局域网设备',
  cat_other: '其它',

  // 节点名称 + 识别提示
  node_local: '本机',
  hint_local: '这是本机 —— 运行 Snitch 的这台电脑。它发出或接收的一切都从关系图中心向外辐射。',
  unidentified: '未识别',
  devtype_router: '路由器',
  devtype_phone: '手机',
  devtype_pc: '电脑',
  devtype_tv: '电视',
  devtype_iot: 'IoT 设备',
  devtype_unknown: '未知类型',
  hint_unidentified: '尚未识别 —— 当它主动宣告自己（DNS/mDNS）或已知其 MAC 厂商时，名称就会出现。如果不认识它，请查看路由器的客户端列表。',
  hint_unresolved: '尚未命名 —— 当 DNS 应答或 TLS 握手揭示域名时就会显示。',
  hint_private_mac: '私有（随机）MAC 地址 —— iOS/Android/Windows 会隐藏真实地址，因此无法识别厂商。这是正常的隐私保护行为。',
  hint_gateway: '这是你的路由器/光猫 —— 你所有的流量都会物理经过它，所以看到它通信是正常且符合预期的。',
  hint_lan_idle: '通过邻居表在你的网络中发现 —— 没有数据交换。虚线边表示「存在」，而不是「正在通信」。',
  hint_lan_active: b => `已交换 ${b} —— 通常是自动通告（Bonjour/mDNS、文件共享）。若流量持续攀升就值得留意。`,
  ext_empty: '暂无外部连接 —— 本机联系过的任何主机都会出现在这里。',
  legend_edge_solid: '实线 = 有流量',
  legend_edge_dashed: '虚线 = 已发现，无数据',
  legend_ring_safe: '绿环 = 已识别，安全',
  legend_ring_warn: '橙环 = 可疑',
  legend_ring_crit: '红环 = 告警',
  legend_ring_none: '无环 = 未识别，中性',
  legend_perimeter: '局域网边界',
  perim_lan: '局域网',

  // 告警面板
  alerts_title: '告警',
  alerts_total: '总计',
  alerts_empty: '暂无告警',
  alert_NEW_HOST: '新主机',
  alert_SUSPICIOUS_PROCESS: '可疑进程',
  alert_SUSPICIOUS_PORT: '可疑端口',
  alert_BEACON: '心跳回连（C2）',
  alert_VOLUME_SPIKE: '流量激增',
  alert_NEW_LAN_DEVICE: '新设备',
  alert_DEVICE_OFFLINE: '设备离线',
  alert_MEDIA_EXFIL: '媒体外泄',
  alert_PORT_SCAN: '端口扫描',
  alertmsg_NEW_HOST: d => `联系了新主机：${d.host || d.ip}`,
  alertmsg_SUSPICIOUS_PROCESS: d => `可疑进程：${d.process} → ${d.host || d.ip}`,
  alertmsg_SUSPICIOUS_PORT: d => `可疑端口 ${d.port}（${d.reason}）→ ${d.host || d.ip}`,
  alertmsg_BEACON: d => `心跳式规律：约 ${d.interval_s} 秒间隔，目标 ${d.host || d.ip}`,
  alertmsg_VOLUME_SPIKE: d => `数据激增，目标 ${d.host || d.ip}：${d.window_s} 秒内 ${Math.round((d.bytes || 0) / 1024)} KB`,
  alertmsg_MEDIA_EXFIL: d => `疑似${d.device === 'camera' ? '摄像头' : '麦克风'}外泄：${d.process} → ${d.host || d.ip}`,
  alertmsg_NEW_LAN_DEVICE: d => `网络中出现新设备：${d.host || d.ip}`,
  alertmsg_DEVICE_OFFLINE: d => `设备已离线：${d.host || d.ip}`,
  alertmsg_PORT_SCAN: d => `端口扫描：${d.source || d.ip} 在 ${d.window_s} 秒内探测了 ${d.ports}+ 个端口`,
  time_just_now: '刚刚',
  time_seconds: n => `${n} 秒前`,
  time_minutes: n => `${n} 分钟前`,
  time_hours: n => `${n} 小时前`,

  // 可疑端口原因（后端下发 reason_code，前端本地化）
  reason_metasploit_shell: 'Metasploit 反弹 shell',
  reason_hacker_port: '黑客常用端口',
  reason_back_orifice: 'Back Orifice 木马',
  reason_irc_botnet: 'IRC 僵尸网络',
  reason_socks_proxy: 'SOCKS 代理',
  reason_tor_relay: 'Tor 中继',
  reason_tor_socks: 'Tor SOCKS',

  // 告警详情字段
  detail_ip: 'IP',
  detail_host: '主机',
  detail_hosts: '主机',
  detail_port: '端口',
  detail_process: '进程',
  detail_reason: '原因',
  detail_direction: '方向',
  detail_source: '来源',
  detail_mac: 'MAC',
  detail_vendor: '厂商',
  detail_country: '国家/地区',
  detail_org: '机构',
  detail_interval_s: '间隔（秒）',
  detail_cv: '变异系数',
  detail_samples: '样本数',
  detail_bytes: '字节',
  detail_window_s: '时间窗（秒）',
  detail_ports: '端口数',
  detail_device: '设备',
  detail_count: '数量',

  // 隐私评分
  privacy_title: '隐私评分',
  privacy_critical_label: '危险',
  privacy_excellent_label: '优秀',
  privacy_risk_factors: n => `${n} 项风险因素`,
  privacy_more_factors: n => `还有 ${n} 项`,
  privacy_label_excellent: '优秀',
  privacy_label_good: '良好',
  privacy_label_average: '一般',
  privacy_label_weak: '较差',
  privacy_label_critical: '危险',

  // 时间线
  timeline_title: '时间线',
  timeline_packets: (n, locale) => `${Number(n || 0).toLocaleString(locale)} 个数据包`,
  timeline_alerts: n => `${n} 条告警`,
  timeline_live: '实时',
  min_short: n => `${n} 分`,

  // 抓包开关
  capture_stop: '停止',
  capture_start: '开始',
  capture_stopping: '正在停止…',
  capture_starting: '正在启动…',

  // 端口过滤
  port_filter: '端口',
  port_all: '全部端口',
  port_placeholder: '添加端口（如 443）',
  port_invalid: '端口无效',
  port_count: n => `${n} 个端口`,

  // 导出
  export_btn: '导出',
  export_graph_json: '关系图（JSON）',
  export_graph_csv: '关系图（CSV）',
  export_alerts_json: '告警（JSON）',
  export_alerts_csv: '告警（CSV）',

  // 进程过滤
  process_filter: '应用',
  process_filter_hint: '点击可从关系图中隐藏该应用',
  process_none: '尚未检测到进程',
  process_clear: '显示全部应用',

  // IP 信任列表
  ip_whitelist: '信任',
  ip_whitelist_hint: '信任的 IP 不再被抓取或显示',
  ip_placeholder: '添加 IP（如 1.1.1.1）',
  ip_invalid: 'IP 地址无效',
  ip_clear: '清空列表',
  whitelist_action: '标记为信任',

  // 地图
  map_you: '你',
  map_located: n => `${n} 台主机已定位`,
  map_no_geo: '无位置',

  // 评分因素
  score_trackers: n => `联系了 ${n} 个追踪器`,
  score_tracker_traffic: pct => `${pct}% 的流量发往追踪器`,
  score_ad_networks: n => `${n} 个广告网络`,
  score_beacons: n => `${n} 个心跳行为`,
  score_susp_proc: n => `${n} 个可疑进程`,
  score_susp_ports: n => `${n} 个危险端口`,
  score_critical_alerts: n => `${n} 条严重告警`,
  score_warnings: n => `${n} 条警告`,
  score_https_ratio: pct => `${pct}% 的流量为 HTTPS`,
  score_no_trackers: '未检测到追踪器',

  // 设置
  settings_title: '设置',
  settings_saved: '已保存',
  close: '关闭',
  settings_language: '界面语言',
  settings_retention: '历史保留时长',
  settings_retention_hint: '流量与告警历史的保存时间',
  geo_title: '地理位置数据库',
  geo_present: dbs => `已安装：${dbs}`,
  geo_none: '未安装 —— IP 不会被定位',
  geo_download_btn: '下载 DB-IP Lite（免费）',
  geo_consent: '将从 db-ip.com 下载约 50 MB（CC BY 4.0）。这是 Snitch 唯一可能发起的对外请求。',
  geo_downloading: '正在下载…',
  geo_done: n => `已下载 ${n} 个数据库`,
  geo_failed: '下载失败 —— 请检查网络连接',
  diag_title: '诊断',
  diag_hint: '用于问题反馈的日志与系统信息',
  diag_open_logs: '日志',
  diag_export: '导出',
  settings_note: '所有设置都保存在本地。Snitch 从不向第三方发送数据。',
  nav_apps: '应用',
  ignore_alert: '忽略此类告警/此主机',

  // 应用视图
  apps_empty: '尚未归属到任何进程',
  apps_process: '进程',
  apps_destinations: '主机',
  apps_packets: '数据包',
  apps_volume: '流量',
  apps_top_dest: '主要目标',
  apps_history_60m: '最近一小时（字节/分钟）',
  alertmsg_NEW_HOSTS: n => `联系了 ${n} 个新主机`,
  settings_autolaunch: '开机自启',
  settings_autolaunch_hint: '登录时自动启动 Snitch',

  // 首次启动引导
  onboard_title: '欢迎使用 Snitch',
  onboard_sub: '实时网络流量可视化工具 —— 隐私优先。',
  onboard_priv_title: '一切数据都留在这台电脑上',
  onboard_priv_body: '流量元数据、告警与历史都存储在本地 SQLite 数据库中。无需账号、不上云、无遥测。',
  onboard_capture_title: '抓取的内容',
  onboard_capture_body: '仅抓取数据包头部：目标 IP、端口、流量、进程名、DNS 名称和 TLS 服务器名（SNI）。绝不读取载荷内容。',
  onboard_out_title: '会离开本机的内容',
  onboard_out_body: '默认什么都不发送。唯一可能发起的对外请求是地理位置数据库下载，需要你在设置中自行触发。',
  onboard_go: '明白了',

  // 短单位 + 无障碍标签
  packet_short: n => `${n} 包`,
  aria_settings: '设置',
  aria_close_alerts: '关闭告警',
  doc_title: 'Snitch —— 追踪每一条隐藏的流量',
}

// ── Registry / Registre ──────────────────────────────────────────────────────

/** EN: All dictionaries, keyed by language code. / FR: Tous les dictionnaires. */
export const DICTS = { en, fr, zh }

/** EN: BCP-47 locale per language (number/date formatting).
 *  FR: Locale BCP-47 par langue (formatage nombres/dates). */
export const LOCALES = { en: 'en-US', fr: 'fr-FR', zh: 'zh-CN' }

/** EN: Selectable languages, in toolbar order.
 *  FR: Langues sélectionnables, dans l'ordre de la barre d'outils. */
export const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'zh', label: '中文' },
]

export const DEFAULT_LANG = 'en'

/**
 * EN: Resolve the startup language: persisted choice → browser preference →
 *     English. The browser check accepts both exact codes ("zh") and regional
 *     tags ("zh-CN", "fr-CA").
 * FR: Résoudre la langue au démarrage : choix persisté → préférence du
 *     navigateur → anglais. La détection accepte les codes exacts (« zh »)
 *     comme les balises régionales (« zh-CN », « fr-CA »).
 */
export function detectLang() {
  try {
    const saved = localStorage.getItem('snitch_lang')
    if (saved && DICTS[saved]) return saved
  } catch { /* EN: no localStorage (SSR/tests) / FR: pas de localStorage */ }
  const nav = (typeof navigator !== 'undefined' && navigator.language || '').toLowerCase()
  const hit = LANGUAGES.find(l => nav === l.code || nav.startsWith(l.code + '-'))
  return hit ? hit.code : DEFAULT_LANG
}

/** EN: Localized number formatting. / FR: Formatage localisé des nombres. */
export function fmtNum(n, locale = 'en-US') {
  return Number(n || 0).toLocaleString(locale)
}

/**
 * EN: Localized region name from an ISO-3166 country code — US → "United
 *     States" / "États-Unis" / "美国". Falls back to the backend's English
 *     `country` name when the code is missing or Intl has no entry.
 * FR: Nom de région localisé depuis un code ISO-3166 — US → « États-Unis ».
 *     Retombe sur le nom anglais du backend si le code manque.
 * ZH: 由 ISO-3166 国家代码得到本地化国家名 —— US →「美国」。代码缺失或
 *     Intl 无对应项时回退到后端的英文名。
 */
export function regionName(code, locale = 'en-US', fallback = '') {
  if (!code) return fallback
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) || fallback
  } catch {
    return fallback
  }
}

// ── Context / Contexte ───────────────────────────────────────────────────────
const I18nContext = createContext(null)

/**
 * EN: Provides { lang, locale, languages, t, setLang } to the whole tree.
 *     `t(key, ...args)` resolves a dictionary entry — functions are called
 *     with args, strings returned as-is. Missing keys fall back to English,
 *     then to the key itself.
 * FR: Fournit { lang, locale, languages, t, setLang } à tout l'arbre.
 *     `t(key, ...args)` résout une entrée du dictionnaire — les fonctions sont
 *     appelées avec args, les chaînes renvoyées telles quelles. Les clés
 *     manquantes retombent sur l'anglais, puis sur la clé.
 * ZH: 向整棵树提供 { lang, locale, languages, t, setLang }。
 *     `t(key, ...args)` 解析字典条目 —— 函数以参数调用，字符串原样返回。
 *     缺失的键回退到英文，再回退到键名本身。
 */
export function I18nProvider({ children }) {
  // EN: Persisted language — survives restarts (localStorage, not just RAM).
  // FR: Langue persistée — survit aux redémarrages (localStorage, pas juste la RAM).
  const [lang, setLangState] = useState(detectLang)

  const setLang = (l) => {
    if (!DICTS[l]) return
    try { localStorage.setItem('snitch_lang', l) } catch { /* ignore */ }
    setLangState(l)
  }

  const locale = LOCALES[lang] || LOCALES[DEFAULT_LANG]

  const t = useMemo(() => {
    const dict = DICTS[lang] || DICTS.en
    return function t(key, ...args) {
      // EN: Own-property check — without it, keys like "constructor" would
      //     resolve to inherited Object members (which are callable).
      // FR: Vérification de propriété propre — sans elle, des clés comme
      //     « constructor » résoudraient vers les membres hérités d'Object.
      const val = Object.hasOwn(dict, key) ? dict[key]
                : Object.hasOwn(en, key) ? en[key]
                : undefined
      if (val === undefined) return key
      return typeof val === 'function' ? val(...args) : val
    }
  }, [lang])

  // EN: Keep <html lang> and the document title in sync with the UI language.
  // FR: Garder <html lang> et le titre du document synchronisés avec la langue.
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t('doc_title')
  }, [lang, t])

  return (
    <I18nContext.Provider value={{ lang, locale, languages: LANGUAGES, t, setLang }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useT = () => useContext(I18nContext)
