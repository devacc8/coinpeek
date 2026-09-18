# Chrome Web Store: listing copy

Live listing: https://chromewebstore.google.com/detail/coinpeek-bitcoin-price-ba/konlmcdlofpoegdkbjocdfojejmfkfbo

Published: **1.1.2**. Next: **1.1.3** (four languages, permission cleanup, documentation).

The store shows the listing that matches the user's store language, so each block below is
pasted into a separate listing language in the dashboard. The extension itself follows the
browser UI language through `_locales`, which is a different mechanism: translating the
extension does not translate the page, and the other way round.

## Name (same in every language)

```
CoinPeek
```

## Summary (132 character limit)

English:

```
Real-time BTC and ETH prices on the badge, network fees for both chains, and a converter.
```

Russian:

**RU**

```
Курсы BTC и ETH на значке, комиссии сети для обеих сетей и конвертер валют.
```

Chinese (Simplified):

**ZH**

```
在徽章上实时显示 BTC 与 ETH 价格、两条网络的费率，以及货币换算器。
```

Spanish:

**ES**

```
Precios de BTC y ETH en el icono, comisiones de red de ambas cadenas y conversor.
```

## Description

### English

```
CoinPeek - Your lightweight crypto companion for Chrome

Track Bitcoin and Ethereum prices in real-time without leaving your browser. CoinPeek is designed for traders, developers, and crypto enthusiasts who need quick access to market data.

KEY FEATURES:

Live Price Tracking
- Real-time Bitcoin and Ethereum prices
- 24-hour price change with visual indicators (green/red)
- Price displayed in extension badge for instant visibility

Network Fee Monitoring
- Ethereum gas fees (low, standard, fast)
- Bitcoin transaction fees in sat/vB
- Multiple sources per chain, tried in order, so one provider outage does not blank the row

Quick Converter
- Convert between BTC, ETH, and USD instantly
- Swap currencies with one click
- Precise decimal calculations

PERFORMANCE:
- Updates every 60 seconds automatically
- Smart caching reduces API calls by 70%
- Lightweight design - minimal memory footprint
- Instant popup loading with cached data

PRIVACY-FIRST APPROACH:
- All data stored locally on your device
- No account required
- No personal data collected
- No tracking or analytics
- Open source on GitHub

PERMISSIONS EXPLAINED:
We only request what's absolutely necessary:
- Storage: Save cached prices locally for faster loading
- Alarms: Schedule background price updates

We do NOT access your browsing history, tabs, cookies, or any personal data.

DATA SOURCES:
- CoinGecko: Cryptocurrency prices (public API)
- Owlracle: Ethereum gas fees, with a public RPC node as a fallback
- Mempool.space, blockchain.info and blockchair: Bitcoin fees, tried in order

PERFECT FOR:
- Crypto traders monitoring market movements
- Developers checking gas fees before deploying
- DeFi users optimizing transaction timing
- Anyone interested in cryptocurrency prices

TECH SPECS:
- Built with Manifest V3 (latest Chrome extension standard)
- Vanilla JavaScript - no heavy frameworks
- Service Worker architecture for efficiency
- Responsive modern UI, dark theme
- Available in English, Russian, Chinese and Spanish

Open source and free forever. Check out our GitHub for the full source code.
```

### Russian

**RU**

```
CoinPeek - лёгкий крипто-помощник для Chrome

Курсы биткоина и эфириума в реальном времени, не выходя из браузера. CoinPeek сделан для трейдеров, разработчиков и всех, кому нужен быстрый доступ к данным рынка.

КЛЮЧЕВЫЕ ВОЗМОЖНОСТИ:

Курсы в реальном времени
- Актуальные цены биткоина и эфириума
- Изменение за 24 часа с цветным индикатором (зелёный или красный)
- Цена прямо на значке расширения, видно без открытия попапа

Комиссии сети
- Комиссии Ethereum (низкая, средняя, быстрая)
- Комиссии биткоина в sat/vB
- Несколько источников на каждую сеть, перебираются по очереди, поэтому отказ одного провайдера не оставляет строку пустой

Быстрый конвертер
- Перевод между BTC, ETH и USD мгновенно
- Смена направления одним нажатием
- Точные расчёты с дробями

ПРОИЗВОДИТЕЛЬНОСТЬ:
- Автоматическое обновление раз в 60 секунд
- Умное кэширование сокращает число запросов примерно на 70 процентов
- Лёгкий код, минимум памяти
- Попап открывается мгновенно на кэшированных данных

ПРИВАТНОСТЬ:
- Все данные хранятся локально на вашем устройстве
- Аккаунт не нужен
- Персональные данные не собираются
- Никакой аналитики и отслеживания
- Открытый код на GitHub

РАЗРЕШЕНИЯ:
Мы просим только необходимое:
- Storage: локальное кэширование курсов для быстрой загрузки
- Alarms: планирование фоновых обновлений

Мы НЕ читаем историю браузера, вкладки, cookie и любые персональные данные.

ИСТОЧНИКИ ДАННЫХ:
- CoinGecko: курсы криптовалют (публичный API)
- Owlracle: комиссии Ethereum, резерв это публичный RPC узел
- Mempool.space, blockchain.info и blockchair: комиссии биткоина, перебираются по очереди

ДЛЯ КОГО:
- Трейдеры, следящие за рынком
- Разработчики, проверяющие комиссии перед деплоем
- Пользователи DeFi, выбирающие момент для транзакции
- Все, кому интересны курсы криптовалют

ТЕХНИЧЕСКИ:
- Manifest V3, актуальный стандарт расширений Chrome
- Чистый JavaScript, без тяжёлых фреймворков
- Архитектура на service worker
- Современный адаптивный интерфейс, тёмная тема
- Доступно на английском, русском, китайском и испанском

Открытый код и бесплатно навсегда. Полный исходник на GitHub.
```

### Chinese (Simplified)

**ZH**

```
CoinPeek - 轻量的 Chrome 加密货币助手

不必离开浏览器就能跟踪比特币和以太坊的价格。CoinPeek 面向交易者、开发者和所有需要快速查看行情的人。

主要功能：

实时价格
- 比特币和以太坊的实时价格
- 24 小时涨跌幅，带红绿指示
- 价格直接显示在扩展徽章上，不用打开弹窗也能看到

网络费率
- 以太坊费率（低、标准、快）
- 比特币费率，单位 sat/vB
- 每条链都有多个数据源，按顺序依次尝试，某个服务商出问题也不会让这一行变空

快速换算
- 在 BTC、ETH 和 USD 之间即时换算
- 一键交换方向
- 精确的小数计算

性能：
- 每 60 秒自动更新
- 智能缓存把请求量减少约 70%
- 体积小，占用内存少
- 打开弹窗立即显示缓存数据

隐私优先：
- 所有数据都保存在你的设备上
- 不需要账号
- 不收集个人信息
- 没有跟踪和分析
- 代码在 GitHub 上开源

权限说明：
我们只申请必要权限：
- Storage：本地缓存价格，加快加载
- Alarms：安排后台更新

我们不会读取你的浏览历史、标签页、Cookie 或任何个人数据。

数据来源：
- CoinGecko：加密货币价格（公开 API）
- Owlracle：以太坊费率，备用为公共 RPC 节点
- Mempool.space、blockchain.info 与 blockchair：比特币费率，按顺序依次尝试

适合人群：
- 关注行情变化的交易者
- 部署前查看费率的开发者
- 需要挑选交易时机的 DeFi 用户
- 所有关心加密货币价格的人

技术规格：
- 基于 Manifest V3，Chrome 扩展的最新标准
- 纯 JavaScript，不使用重型框架
- service worker 架构，注重效率
- 现代自适应界面，深色主题
- 支持英语、俄语、中文和西班牙语

开源，永久免费。完整源代码在 GitHub。
```

### Spanish

**ES**

```
CoinPeek - tu compañero ligero de criptomonedas para Chrome

Sigue los precios de Bitcoin y Ethereum en tiempo real sin salir del navegador. CoinPeek está pensado para traders, desarrolladores y cualquiera que necesite datos de mercado al instante.

FUNCIONES PRINCIPALES:

Precios en tiempo real
- Precios de Bitcoin y Ethereum al momento
- Variación de 24 horas con indicador de color (verde o rojo)
- El precio en el icono de la extensión, visible sin abrir la ventana

Comisiones de red
- Comisiones de Ethereum (baja, estándar, rápida)
- Comisiones de Bitcoin en sat/vB
- Varias fuentes por cadena, probadas en orden, así la caída de un proveedor no deja la fila vacía

Conversor rápido
- Convierte entre BTC, ETH y USD al instante
- Cambia la dirección con un clic
- Cálculos decimales precisos

RENDIMIENTO:
- Actualización automática cada 60 segundos
- La caché inteligente reduce las llamadas a la API alrededor de un 70 por ciento
- Diseño ligero, consumo mínimo de memoria
- La ventana se abre al instante con los datos en caché

PRIVACIDAD:
- Todos los datos se guardan en tu dispositivo
- No hace falta cuenta
- No se recogen datos personales
- Sin rastreo ni analíticas
- Código abierto en GitHub

PERMISOS:
Solo pedimos lo imprescindible:
- Storage: guardar los precios en caché para cargar más rápido
- Alarms: programar las actualizaciones en segundo plano

NO accedemos a tu historial de navegación, pestañas, cookies ni a ningún dato personal.

FUENTES DE DATOS:
- CoinGecko: precios de criptomonedas (API pública)
- Owlracle: comisiones de Ethereum, con un nodo RPC público como respaldo
- Mempool.space, blockchain.info y blockchair: comisiones de Bitcoin, probadas en orden

PARA QUIÉN:
- Traders que siguen el mercado
- Desarrolladores que revisan comisiones antes de desplegar
- Usuarios de DeFi que eligen el momento de la transacción
- Cualquiera interesado en los precios de las criptomonedas

FICHA TÉCNICA:
- Manifest V3, el estándar actual de las extensiones de Chrome
- JavaScript puro, sin frameworks pesados
- Arquitectura con service worker
- Interfaz moderna y adaptable, tema oscuro
- Disponible en inglés, ruso, chino y español

Código abierto y gratis para siempre. El código completo está en GitHub.
```

## What's new

### 1.1.4

English:

```
Bitcoin fee estimates no longer overstate a quiet mempool. Fees below 1 sat/vB were thrown away, so the extension fell back to a built-in number and could suggest paying ten times more than needed. It now shows the real fees below 1 sat/vB that the network accepts. Scrollbars and native controls follow the dark popup now instead of rendering light.
```

Russian:

```
Оценка комиссий Биткоина больше не завышает в тихом мемпуле. Комиссии ниже 1 sat/vB отбрасывались, и расширение подставляло встроенное число, то есть могло предложить заплатить в десять раз больше, чем нужно. Теперь показываются реальные комиссии ниже 1 sat/vB, которые принимает сеть. Полосы прокрутки и системные элементы в попапе теперь тёмные, как и сам попап.
```

Chinese (Simplified):

```
比特币手续费估算不再在内存池空闲时高估。低于 1 sat/vB 的费率此前会被丢弃，扩展改用内置数值，可能建议支付十倍于实际所需的费用。现在会显示网络真正接受的、低于 1 sat/vB 的费率。弹出窗口的滚动条与原生控件现在跟随深色界面，不再显示为浅色。
```

Spanish:

```
La estimación de comisiones de Bitcoin ya no exagera cuando el mempool está tranquilo. Las comisiones por debajo de 1 sat/vB se descartaban, así que la extensión usaba un valor interno y podía sugerir pagar diez veces más de lo necesario. Ahora muestra las comisiones reales por debajo de 1 sat/vB que la red acepta. Las barras de desplazamiento y los controles nativos acompañan ahora la superficie oscura del popup.
```

### 1.1.3

English:

```
Network fees are back. The gas service this used shut down in June 2026, so the Ethereum fee row could not load; it now reads from a different source, with a backup. An unused permission is gone, and the extension now speaks English, Russian, Chinese and Spanish, following the browser language.
```

Russian:

**RU**

```
Комиссии сети снова работают. Сервис, из которого брались комиссии Ethereum, закрылся в июне 2026 года, и строка перестала загружаться; теперь источник другой, с резервом. Убрано неиспользуемое разрешение, и расширение говорит на английском, русском, китайском и испанском, следуя языку браузера.
```

Chinese (Simplified):

**ZH**

```
网络费率恢复了。原先用于以太坊费率的数据服务在 2026 年 6 月关停，导致这一行无法加载；现在改用新的数据源，并配有备用来源。同时移除了一个未使用的权限，扩展现在支持英语、俄语、中文和西班牙语，并跟随浏览器语言。
```

Spanish:

**ES**

```
Las comisiones de red vuelven a funcionar. El servicio que se usaba para las comisiones de Ethereum cerró en junio de 2026 y la fila dejó de cargar; ahora lee de otra fuente, con un respaldo. Se ha eliminado un permiso que no se usaba, y la extensión habla inglés, ruso, chino y español siguiendo el idioma del navegador.
```

## Assets

| File | Where it is used |
|---|---|
| `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png` | the extension icons, shipped inside the package; regenerate them with `dev-tools/create-icons.html` |
| `images/1.png` | the screenshot the README shows |
| `images/2.png`, `images/3.png` | the Chrome Web Store listing screenshots; they are not part of the built package |

`build.js` packs an include list, so only the icons travel with the extension. Store screenshots live in the repository as the source for the listing, and the store keeps its own copy of whatever was uploaded.
