<div align="center">

# Snitch

**追踪每一条隐藏的流量。**

[English](README.md) | [Français](README.md#français) | **中文**

⭐ **如果 Snitch 对你有帮助，点个 Star 意义重大！** ⭐

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)
[![Platform: macOS](https://img.shields.io/badge/Platform-macOS-blue.svg)]()
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%2F11-blue.svg)]()
[![Platform: Linux](https://img.shields.io/badge/Platform-Linux%20(Docker)-blue.svg)]()
[![Version](https://img.shields.io/badge/Version-1.0.4-green.svg)]()
[![GitHub release](https://img.shields.io/github/v/release/aixisstudio/Snitch?include_prereleases&label=release)](https://github.com/aixisstudio/Snitch/releases/latest)

![Snitch 实时关系图 —— 局域网边界、已定位主机、告警](docs/assets/demo.gif)

</div>

---

**Snitch** 是一个实时网络流量可视化工具。

看清你的电脑建立的每一条连接 —— 它在和谁通信、对方在哪里、由哪个应用发起。

界面支持 **英语、法语和中文**：使用右上角工具栏的 `EN / FR / 中文` 切换器即可。

## 为什么选择 Snitch？

- **对比 Little Snitch / Lulu** —— 它们是 macOS 防火墙，负责*阻断*连接；Snitch 则*可视化并解释*流量，跨平台、免费且开源。
- **对比 GlassWire** —— Snitch 免费、开源（AGPL）、无需账号，并且**零对外请求**；连地理位置查询都是离线的。
- **对比 Wireshark** —— Snitch 提供任何人都能看懂的实时高层概览，而不是原始数据包解析。
- **对比云端监控** —— 一切都在 `127.0.0.1` 上、token 之后运行；你的流量数据永不离开本机。

## 功能

| 功能 | 说明 |
|---|---|
| 力导向关系图 | 实时节点图 —— 你的电脑位于中心，每条连接都是一个节点 |
| 世界地图 | 已定位的 IP，在可交互地球仪上以动画弧线呈现 |
| 15/30/60 分钟时间线 | 本地 SQLite 中保存的滑动历史（默认保留 24 小时） |
| 异常检测 | 标记端口扫描、心跳回连、潜在数据外泄 |
| 进程归属 | 知道哪个应用产生了哪些流量（每条连接前 5 个进程） |
| 局域网扫描 | 通过系统 ARP 表被动发现（不做广播扫描） |
| 隐私评分 | 实时评估你的出站流量暴露程度 |
| 按应用查看 | 每个进程的目标、流量和 60 分钟历史 |
| 告警抑制 | 持久化的「忽略此主机/类型」规则，可在界面中管理 |
| 设置面板 | 界面语言、保留时长、过滤器、需同意的 GeoIP 下载、诊断 |
| 追踪器检测 | 后缀匹配的域名列表，以可编辑数据文件形式提供（`backend/classifier/lists/`） |
| 带宽监视 | 实时 MB/s 迷你折线图 |
| 三语界面 | EN / FR / 中文，一键切换 |

## 下载

| 平台 | 安装包 |
|---|---|
| **macOS（Apple Silicon）** | `brew install --cask aixisstudio/tap/snitch` —— 或 [Snitch-1.0.4-macos-arm64.zip](https://github.com/aixisstudio/Snitch/releases/download/v1.0.4/Snitch-1.0.4-macos-arm64.zip) |
| **Linux** | `sudo docker compose up --build` —— 见 [Docker（Linux）](#dockerlinux) |
| **Windows** | 从源码构建 —— 见[构建安装包](#构建安装包) |

或者直接获取最新 release：**[github.com/aixisstudio/Snitch/releases](https://github.com/aixisstudio/Snitch/releases)**

> **macOS 首次运行** —— Snitch 采用 ad-hoc 签名，未做公证（没有付费的 Apple Developer ID）。上面的 `brew install --cask` 会替你移除隔离标记。如果使用手动下载的 zip：右键 → **打开**，或执行 `xattr -dr com.apple.quarantine /Applications/Snitch.app`。首次启动时 Snitch 会**请求一次**管理员密码 —— 抓包需要该权限，与 tcpdump/Wireshark 相同；界面本身保持非特权运行。

## 技术栈

| 层 | 技术 |
|---|---|
| 抓包 | ctypes → libpcap —— Npcap（Windows）/ libpcap（Linux/macOS）—— 自研解析器（IPv4/IPv6/TCP/UDP/DNS/TLS-SNI） |
| 后端 API | FastAPI —— WebSockets —— SQLite |
| 前端 | React 18 —— Vite —— D3.js v7 —— TopoJSON |
| 桌面外壳 | Electron 44 |
| 地理位置 | **仅离线** —— DB-IP Lite（CC BY 4.0）以 gzip 形式随包提供于 `backend/data/geo/`，首次运行时解压；同时支持 MaxMind GeoLite2 `.mmdb` |

## 安全与隐私

- **API token** —— 每个 REST 接口和 WebSocket 都需要 token。Electron 每次启动时生成；在 Docker/浏览器模式下，它会在后端日志中打印一次，并保存到 `data/api_token.txt`。用 `http://localhost:8000/?token=<TOKEN>` 打开界面（或在提示时输入）。
- **默认仅监听回环地址** —— 所有模式下 API 都绑定 `127.0.0.1`。只有在你明确需要局域网访问时才设置 `SNITCH_BIND=0.0.0.0`（token 鉴权依然生效）。
- **CORS/WebSocket 来源白名单** —— 只允许 `localhost:5173`、后端自身来源以及 Electron 的 `file://` 页面连接。
- **地理位置完全离线** —— *没有*任何在线查询。DB-IP Lite（[CC BY 4.0](https://db-ip.com/db/lite.php)）以 gzip 形式随包提供于 `backend/data/geo/`，首次启动时自动解压到 `<data_dir>/geo/` —— 开箱即用，零网络请求。你也可以把更新的 `GeoLite2-City.mmdb`/`GeoLite2-ASN.mmdb`（MaxMind）放入 `<data_dir>/geo/`，或从设置面板下载最新的 DB-IP Lite（需明确同意，这是唯一可能的对外请求）。
- **所有数据留在本地** —— `snitch.db`（24 小时滑动窗口，可通过 `retention_hours` 设置调整）和 `data/logs/snitch.log` 永不离开本机。没有遥测。**唯一**可能的对外请求是需要手动点击的 DB-IP Lite 下载（设置 →「下载 DB-IP Lite」）。
- **设置会持久化** —— 端口过滤、排除的进程、IP 信任列表、语言和保留时长都保存在 SQLite 中，重启后恢复。
- **告警抑制** —— 每条告警都有「忽略此类型/此主机」操作；抑制规则会被持久化（`alert_suppressions` 表），在告警产生或记录之前应用，并通过 `POST /alerts/ignore` / `DELETE /alerts/ignore` / `GET /alerts/ignore` 管理，重启后依然有效。
- **历史记录** —— 按分钟、按主机和按进程的字节/数据包聚合保存在 SQLite（`host_history`、`process_history`）中，覆盖整个保留窗口，为按应用视图以及 `GET /history/host/{ip}` / `GET /history/process/{name}` 提供数据。
- **诊断** —— `GET /diagnostics` 返回运行时的 JSON 快照（抓包状态、地理位置数据库状态、网卡、版本、路径），不含任何机密；设置面板可以导出它，或打开日志目录（Electron）。
- **局域网设备** 通过系统 ARP 表被动发现 —— 不做主动广播扫描。设备名称来自设备自身的广播：mDNS `*.local`（Apple/Linux）、LLMNR 与 NetBIOS 名称（Windows）、DHCP hostname 选项，再加上完整的离线 IEEE OUI 厂商表；你的网关会被自动识别为路由器。
- 完整威胁模型见 [docs/threat-model.md](docs/threat-model.md)。

## 中文界面说明

界面支持三种语言：**英语（EN）、法语（FR）、中文（中文）**。

- 切换入口：右上角工具栏的语言切换器，或「设置」面板中的「界面语言」。
- 首次启动时会自动匹配浏览器语言；若系统语言是中文，界面直接以中文显示。
- 选择会被记住（`localStorage`），并在后端设置中留档。
- 界面内的国家/地区名称会根据语言本地化（例如 `US` 显示为「美国」），搜索也支持用中文国家名匹配。
- 告警原因（如可疑端口说明）已本地化，不会出现英文残留。

> 新增语言只需在 `frontend/src/i18n.jsx` 的字典注册表中添加一份词条，并在 `LANGUAGES` 中登记 —— 一致性由 `frontend/src/i18n.test.js` 自动校验（各语言键集合与函数参数个数必须完全一致）。

## Docker（Linux）

Docker 部署面向希望除 Docker 外不安装任何东西的 Linux 用户。
抓包通过 `network_mode: host` 工作 —— 容器能看到真实的主机流量。

> **注意：** Mac/Windows 上的 Docker Desktop 运行在虚拟机中，无法抓取宿主机流量。在这些平台上请使用 Electron 应用。

```bash
# 克隆并进入仓库
git clone <your-repo-url> snitch
cd snitch

# 可选：把你的 MaxMind GeoLite2-City.mmdb 放入 data/ 以启用离线地理位置
mkdir -p data

# 构建并运行（需要 Docker + root/sudo 以进行原始套接字抓包）
sudo docker compose up --build
```

获取 API token（启动时打印一次，或 `cat data/api_token.txt`），然后在浏览器中打开 **http://localhost:8000/?token=TOKEN**。

后台运行：`sudo docker compose up -d --build`

Docker 限制：

- 进程归属仅限容器内进程（默认不共享宿主机 PID）
- 部分网络配置下局域网扫描可能不可用

## 开发

环境要求：

- Python 3.11+
- Node.js 18+
- 已安装 [Npcap](https://npcap.com/)（仅 Windows）
- 后端需要管理员/root 终端（原始抓包）

> **演示模式** —— 用 `SNITCH_DEMO=1` 启动后端，可向真实管道注入合成流量：
> 无需 root、无需 libpcap、不触碰任何真实数据包。适合截图、测试和预览。

```bash
# 后端（管理员终端）—— API 位于 http://127.0.0.1:8000
cd backend
pip install -r requirements.txt
python run_backend.py   # 会打印一次 API token

# 前端（另一个终端）—— 界面位于 http://localhost:5173/?token=TOKEN
cd frontend
npm install
npm run dev

# Electron（可选，管理员终端）—— token 会自动注入
cd electron
npm install
set VITE_DEV=1   # Windows
# VITE_DEV=1     # macOS/Linux shell
npx electron .
```

测试：

```bash
cd backend && pip install -r requirements-dev.txt && python -m pytest tests/ -v
cd frontend && npm test
```

## 构建安装包

```bash
# 1 —— 编译后端（PyInstaller）
cd backend
pip install pyinstaller
pyinstaller backend.spec --distpath ../dist/backend

# 2 —— 构建前端
cd frontend
npm run build

# 3 —— 构建 Electron 安装包
cd electron
npm run build:dir
```

## 项目结构

```
snitch/
├── backend/       Python FastAPI + libpcap 抓包引擎（ctypes，自研解析器）
├── frontend/      React + D3.js 界面（EN/FR/中文）
├── electron/      Electron 外壳（main、splash、preload）
├── data/          运行时数据（SQLite 数据库，geo/ 中的 .mmdb 地理位置库）
└── dist/          编译产物（后端 exe、安装包）
```

---

## 许可

AGPL v3 —— 见 [LICENSE](LICENSE)。

可自由使用、研究和修改。衍生作品必须以 AGPL v3 保持开源。
