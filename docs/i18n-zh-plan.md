# Snitch 中文适配方案 / Plan d'adaptation chinoise

> 状态：**已完成实施**（前端 + 后端 + Electron + 文档）
> 目标：在保留 EN / FR 的基础上，新增中文（`zh`），实现三语共存

---

## 一、现状分析

### 1.1 国际化架构（自研，很轻）

核心只有一个文件 `frontend/src/i18n.jsx`：

- 两个**扁平字典** `en` / `fr`，key → 字符串或函数（函数用于插值/复数，如 `lan_devices: n => ...`）
- `I18nProvider` + `useT()` 提供 `{ lang, t, setLang }`
- 语言持久化在 `localStorage.snitch_lang`，默认 `'en'`
- 后端只发**代码 + 结构化参数**（`alert.type` + `alert.details`），文案在前端用 `alertmsg_*` 函数拼装（`AlertPanel.jsx:144`）——对加语言非常友好

### 1.2 涉及语言的耦合点（必须改）

| 位置 | 问题 |
|---|---|
| `i18n.jsx:511` | `lang === 'fr' ? fr : en` — 硬二元判断 |
| `i18n.jsx:506` | 默认 `'en'`，不探测系统语言 |
| `i18n.jsx:154,390` | `timeline_packets` 里 `toLocaleString()` / `toLocaleString('fr-FR')` |
| `App.jsx:729` | 顶栏 `['en','fr'].map(...)` |
| `Settings.jsx:137` | 设置面板 `['en','fr'].map(...)` |
| `Timeline.jsx:40` | `lang === 'fr' ? 'fr-FR' : 'en-US'` |
| `index.html:10,16` | `<html lang="en">`、英法双语 `<title>` |
| `Settings.jsx:22,110`、`AlertPanel.jsx:116` | 硬编码双语 `aria-label="Settings / Réglages"` |
| `SearchBar.jsx:18-26` | `CATEGORY_IDS` 里 `label: 'HTTPS'/'Tracking'/'CDN'/'DNS'` 写死英文 |
| `electron/main.js:272-287` | 托盘菜单英法双语硬编码 |
| `electron/main.js:193,457,474,512,518,579,583` | Npcap/后端启动错误对话框英法双语 |

### 1.3 后端会"漏"到中文界面的英文

1. `backend/detection/anomaly.py:93-103` `SUSPICIOUS_PORTS` 的值（`"Metasploit shell"`、`"Hacker port"`…）通过 `details.reason` 插进 `alertmsg_SUSPICIOUS_PORT`
2. 所有 `Alert.message` 是英文散文（`anomaly.py:400-689`），作为 fallback（`AlertPanel.jsx:148`）
3. `AlertPanel.jsx:176-179` 把 `details` 以 `ip: x · host: y` 原样渲染，键名是英文
4. geo 的 `country` / `city` 来自 DB-IP，是英文

### 1.4 其它

- 无 i18n 一致性测试（前端只有 `scoring/privacy.test.js`）
- 字体栈 `'Inter', system-ui, sans-serif` 没有 CJK 字体
- `Settings.jsx:138` 把 `language` 写进后端 `/settings`，但前端启动时并不读回（既有小 bug）
- README 是 EN/FR 双节，`docs/` 全英文

---

## 二、决策

| 项 | 决定 |
|---|---|
| 形态 | **三语共存** `EN / FR / 中文`，法语保留 |
| 范围 | **全量适配**：前端 + 后端 + Electron + 文档 |
| 语言代码 | `zh`（locale 映射到 `zh-CN`） |
| 文档 | 新增 `README.zh-CN.md`，原 README 不动 |

---

## 三、统一术语表

| EN | FR | 中文 |
|---|---|---|
| host | hôte | 主机 |
| process | processus | 进程 |
| alert | alerte | 告警 |
| warning / critical | warning / critique | 警告 / 严重 |
| tracker / tracking | pistage | 追踪器 / 追踪 |
| beacon | beacon | 心跳 |
| LAN perimeter | périmètre LAN | 局域网边界 |
| whitelist / trusted | confiance | 信任列表 |
| retention | rétention | 保留时长 |
| capture | capture | 抓包 |
| flow / traffic | flux | 流量 |
| geolocation | géolocalisation | 地理位置 |

---

## 四、实施步骤

### 第 1 步 — i18n 内核多语言化

**文件：`frontend/src/i18n.jsx`**

```js
const DICTS = { en, fr, zh }
const LOCALES = { en: 'en-US', fr: 'fr-FR', zh: 'zh-CN' }
export const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'zh', label: '中文' },
]
```

改动点：

1. `i18n.jsx:511` 改为 `const dict = DICTS[lang] || DICTS.en`
2. `i18n.jsx:506` 初始语言：`localStorage.snitch_lang` → `navigator.language` 前缀匹配 `LANGUAGES` → 兜底 `'en'`
3. `t()` 加 **fallback 链**：`DICTS[lang]` → `DICTS.en` → key
4. context 增加 `locale` 与 `languages`
5. 导出 `fmtNum(n)` 供 `timeline_packets` 用

> 顺带修复：启动时以 `GET /settings` 的 `language` 为准、`localStorage` 为兜底。

### 第 2 步 — 新增 `zh` 字典（约 200 个 key）

三条硬规则：

- **取消复数分支**：`lan_devices: n => \`${n} 台设备\``
- **函数签名必须与 en/fr 一致**（参数个数相同）
- **全角标点**，中英混排加半角空格

### 第 3 步 — 语言选择器统一

- 新建 `frontend/src/components/LangToggle.jsx`，读 context 的 `languages`
- `App.jsx:722-743` 删除内联 `LangToggle`，改用新组件
- `Settings.jsx:137` 同样改为 `languages.map(...)`

### 第 4 步 — 日期数字与国家名本地化

| 文件 | 改动 |
|---|---|
| `Timeline.jsx:40` | 改用 `locale` |
| `i18n.jsx:154,390` | `timeline_packets` 用 `fmtNum(n)` |
| `api/main.py:526,661` | 响应补 `"country_code"` |
| `MapView.jsx:445`、`Sidebar.jsx:284` | 用 `Intl.DisplayNames` 显示本地化国家名 |
| `Sidebar.jsx:78-82`、`ForceGraph.jsx:539` | 搜索同时命中本地化国家名 |

### 第 5 步 — 后端英文残留

| 文件 | 改动 |
|---|---|
| `anomaly.py:93-103` | 新增 `SUSPICIOUS_PORT_REASONS` 映射（英文名 → code） |
| `anomaly.py:482-488` | `details` 增加 `"reason_code"` |
| `i18n.jsx` | 新增 `reason_*` key |
| `AlertPanel.jsx:176-179` | details 键名走 `field_*` 映射 |

### 第 6 步 — 外围

| 位置 | 改动 |
|---|---|
| `index.html:10,16` | `<html lang>` 动态设置；`document.title` 多语言化 |
| `index.html:21` | 字体栈补 CJK |
| `Settings.jsx:22,110`、`AlertPanel.jsx:116` | `aria-label` 走 `t()` |
| `SearchBar.jsx:18-26` | 删掉写死的 `label`，走 `cat_*` key |
| `electron/main.js:272-287` | 托盘菜单三段 |
| `electron/main.js` 各处对话框 | 错误对话框加中文行 |
| `electron/splash.html:11,68` | `<html lang>` + 标语加中文 |
| `README.zh-CN.md` | 新建 |

### 第 7 步 — 测试与验证

**新增 `frontend/src/i18n.test.js`**：

```
- 断言 en/fr/zh 三者的 key 集合完全一致（差集为空）
- 断言函数型 key 的参数个数三者一致
- 断言 LANGUAGES 的每个 code 都能在 DICTS 里命中
```

**手工验证清单**：

1. `cd frontend && npm test` 通过
2. `npm run dev` 三语切换，检查长文本是否溢出
3. `SNITCH_DEMO=1` 确认告警无英文残留
4. 地图/侧栏国家名为中文且搜索可命中
5. Electron：托盘菜单、`<html lang>`、splash

---

## 五、风险与注意点

1. **布局溢出**：`hint_*` 这类长句在 `Sidebar` 固定宽度卡片里可能换行增多，需目视检查。
2. **`t()` fallback 链**：这是最容易被忽略但最影响观感的一条，务必先做。
3. **术语一致性**：第 2 步开始前先按术语表定稿。
4. **后端改动很小**：只加 code 映射与 `country_code` 字段，不影响现有逻辑和测试。

---

## 六、实施记录

### 已完成改动

| 文件 | 改动 |
|---|---|
| `frontend/src/i18n.jsx` | 重写：新增 `zh` 字典（约 240 键）；`DICTS`/`LOCALES`/`LANGUAGES` 注册表；`detectLang()` 支持浏览器语言探测；`t()` 增加「当前语言 → 英文 → 键名」fallback 链；`regionName()` 国家名本地化；`fmtNum()`；context 新增 `locale`/`languages`；`<html lang>` 与 `document.title` 自动同步 |
| `frontend/src/components/LangToggle.jsx` | **新增**：统一语言选择器（`toolbar` / `settings` 两种形态），从 `LANGUAGES` 渲染 |
| `frontend/src/App.jsx` | 删除内联 `LangToggle`；改用新组件；`port_count` 本地化；`matchesFilter` 传入 `locale` |
| `frontend/src/components/Settings.jsx` | 语言选择改用 `LangToggle`；`aria-label` 走 `t()`；props 精简为 `{ onClose }` |
| `frontend/src/components/Timeline.jsx` | 用 `locale` 格式化时间与数字；标题 `Timeline` 走 `t('timeline_title')`；`min_short` |
| `frontend/src/components/SearchBar.jsx` | 删除写死的 `HTTPS`/`Tracking`/`CDN`/`DNS`，全部走 `cat_*` |
| `frontend/src/components/AlertPanel.jsx` | `aria-label` 走 `t()`；新增 `DETAIL_KEYS` 映射（details 字段名本地化）；新增 `localizeDetails()`（`reason_code` → 本地化原因） |
| `frontend/src/components/Sidebar.jsx` | `matchesFilter` 新增 `locale` 参数并匹配本地化国家名；节点行/详情卡片国家名本地化；`pkt` → `packet_short` |
| `frontend/src/graph/ForceGraph.jsx` | tooltip 国家名与包数本地化；过滤匹配支持本地化国家名 |
| `frontend/src/map/MapView.jsx` | tooltip 国家名本地化；category 与包数走 `t()`；`lang` → `locale` |
| `frontend/index.html` | 字体栈补 CJK（PingFang SC / Microsoft YaHei / Noto Sans SC） |
| `backend/detection/anomaly.py` | 新增 `SUSPICIOUS_PORT_REASONS`；`details` 增加 `reason_code` |
| `backend/tests/test_anomaly.py` | 断言 `reason_code` 存在；断言两个字典键集合一致 |
| `electron/main.js` | 托盘菜单、Npcap 提示、后端错误对话框全部加中文 |
| `electron/splash.html` | 启动标语加中文，调整字距/行高 |
| `frontend/src/i18n.test.js` | **新增**：键集合一致性、函数参数个数一致性、`reason_*` 覆盖、告警类型覆盖、`regionName`/`fmtNum` |
| `README.zh-CN.md` | **新增**：中文 README |

### 与原始方案的差异

- **后端无需暴露 `country_code`**：`backend/api/main.py:526-527, 661-662` 原本就已经在节点对象里带上了该字段，因此第 4 步的「补字段」工作量为零。
- **语言持久化以 `localStorage` 为准**：方案中提到「启动时以 `GET /settings` 的 `language` 为准」，实测该做法会引入异步竞态（先渲染英文再切中文，出现闪烁）。因此保留 `localStorage` 为权威来源，后端 `settings.language` 作为留档镜像。写入路径未变。
- **新增 key 超出原字典**：`timeline_title`、`port_count`、`packet_short`、`min_short`、`aria_settings`、`aria_close_alerts`、`doc_title`、`detail_*`（20 个）、`reason_*`（7 个）—— 这些原本是硬编码文本，已一并收编。

### 验证结果

```
cd frontend && npm test
  Test Files  2 passed (2)
       Tests  15 passed (15)

cd frontend && npm run build
  ✓ 2495 modules transformed
  ✓ built in 2.13s

cd backend && python -m pytest tests/ -v
  76 passed, 11 warnings in 0.57s
```

后端使用 Python 3.15.0 + pytest 9.1.1 实测。11 条 warning 是 starlette/fastapi 在 3.15 上的既有弃用提示（`asyncio.iscoroutinefunction`、`anyio.abc.BlockingPortal`），与本次改动无关。

> 环境备注：Python 3.15 尚无部分依赖的预编译 wheel。`pip install -r requirements.txt -r requirements-dev.txt` 会因 `pyyaml`（由 `uvicorn[standard]` 引入）需要 MSVC 而中断。本次验证按需安装：`pytest`、`psutil`、`fastapi==0.115.0`、`httpx==0.27.2`。跑测试时须在 `backend/` 目录下用 `python -m pytest`（靠 CWD 提供 `capture`/`detection` 等顶层模块的导入路径）。

