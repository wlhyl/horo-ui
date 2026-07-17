# Changelog

All notable changes to this project will be documented in this file.

## [0.29.1] - 2026-07-18

### Added

- 新增中国夏令时检测提示：在用户输入(确认)出生时间后，检测该时间是否处于中国夏令时实施期间(1986-1991)，若时区为中国(UTC+8)且日期在夏令时区间内，弹出 Alert 提示用户确认是否需要勾选夏令时复选框
- `DateTimeComponent` 新增 `dateChange` 输出事件：用户确认日期选择器或点击"现在"图标时触发一次，携带完整日期时间，方便页面在单次确认时执行回调
- 新增 `src/app/utils/dst/dst.ts` 工具函数：硬编码 1986-1991 中国夏令时区间（起始日 02:00 含，结束日 02:00 不含），提供 `isInChineseDST()` 判定函数

### Changed

- `NativePage`、`ProcessPage`、`InputPanelComponent` 接入夏令时检测：仅 tz=8 时检查，通过 AlertController 弹窗提示，不自动勾选 st 复选框。ProcessPage 仅检查本命时间（不检查推运时间），InputPanelComponent 检查本命时间与天象时间（不检查推运时间）

## [0.29.0] - 2026-07-18

### Added

- 新增"每日回归方向弧"功能：以每日回归时间为基准（视为本命时间）计算方向弧，方向弧转时间采用固定 360°=24 小时换算（1°≈4 分钟）。复用主向推运组件，通过 `DirectionMode.DailyDirection` 区分
- 每日回归方向弧支持两种算法：太阳弧风格（弧 = 承诺星黄经 − 显著星黄经）、黄道向运风格（主向推运 SemiArc 算法）
- 每日回归方向弧支持「日返月返」复选框：未勾选时基于本命计算每日回归，勾选后基于日返的月返计算每日回归（先取日返 return_date 作为月返 native_date，再取月返 return_date 作为每日回归 native_date），与每日回归盘行为一致
- 每日回归方向弧在工作台窗口管理中可独立打开，窗口标题为「每日回归方向弧」

### Changed

- 返照盘详情面板复用本命盘 `app-native-detail` 组件，移除旧的 `process/return/detail` 目录。返照盘详情现包含行星力量、接纳、互容、气质、视力点、映点、反映点卡片；恒星卡片因返照盘无 `fixed_stars` 数据显示为空列表。`ReturnHoroscope` 接口新增可选 `fixed_stars?` 字段，相关工具函数与子组件输入类型改为 `Horoscope | ReturnHoroscope | null`

## [0.28.0] - 2026-07-16

### Added

- 每日回归盘新增「日返月返」复选框：未勾选时基于本命计算（原有行为），勾选后基于日返的月返计算每日回归（先取日返 return_date 作为月返 native_date，再取月返 return_date 作为每日回归 native_date）

### Changed

- `getDailyReturnData()` 支持按 `isSolarReturn` 分支：勾选时走 `getLunarDailyReturnData()` 三步链式（日返→月返→每日回归），否则走原有本命逻辑
- `process.page.html` 与 `input-panel.component.html` 中复选框显示条件加入 `DailyReturn`，标签按类型切换（每日回归显示「日返月返」，月返显示「日返月亮」）

## [0.27.0] - 2026-07-15

### Added

- 本命盘详情页新增「行星力量」卡片：展示 7 颗传统行星及福点的先天尊贵(庙/旺/三分/界/面/陷/弱/游离/互容)与后天力量(宫位/顺逆行/快慢/东西方/月相/日光条件/相位/包围)及总分，并计算星盘主星（7 颗传统行星中分数最高者）。三分主星采用 Lily 版本，界采用托勒密界。日光条件阈值：日核 <0°17'、燃烧 0°17'~8°30'、太阳光束下 8°30'~17°。宫位计算采用 5 度规则并在星座边界做调整。福点仅计算先天尊贵与宫位/日光条件/相位等后天力量，不计算运动相关项（顺逆行/快慢/东西方/月相），不算游离星。新增独立组件 `PlanetPowerComponent` 与工具 `src/app/utils/planet-power/planet-power.ts`
- 本命盘详情页新增「气质」卡片：依据传统体液学说收集影响气质的行星与星座（1 宫主星、1 宫内行星、与 ASC 相位行星、月亮及其相位行星、太阳、星盘主星、相关星座），按热/冷/干/湿四性质计次，计算四体液（多血质/粘液质/胆汁质/抑郁质）分数与占比。表格支持编辑四性质后实时重算并提供重置按钮。南北交点与 ASC 形成相位时只计入合相，不计入其他托勒密相位。新增独立组件 `TemperamentComponent` 与工具 `src/app/utils/temperament/temperament.ts`
- 本命盘详情页新增「接纳」与「互融」卡片：接纳指行星 A 与行星 B 有相位且 B 位于 A 的庙/旺/三分/界/面之一；互融指 A 与 B 相互对对方位置有尊贵（不要求相位）。接纳方/互融双方限于七传统行星，被接纳方可为七传统行星、福点、ASC/DSC/MC/IC。显示相位符号、容许度及尊贵种类标签。新增独立组件 `ReceptionComponent` 与工具 `src/app/utils/reception/reception.ts`
- `PlanetName` 枚举添加 `isSuperior()`、`isInferior()`、`isBenefic()`、`isMalefic()` 方法
- 新增 `Result<T, E>` 类型用于函数返回值错误传递

### Changed

- 重构 `planet-power.ts`：提取共享原语 `getDignityLordsAt(zodiac, degree)` 到 `image/zodiac.ts`，`calculatePlanetDignity` 改用该原语，删除内联 term 区间循环与 face 度数判定，行为等价
- 将行星力量卡片与气质卡片从 `DetailComponent` 抽取为独立组件 `PlanetPowerComponent` 与 `TemperamentComponent`
- 月相判定：增光 0°<elongation≤180°，减光 elongation>180°，新月为过渡点；东西方判定：东方 elongation>180°，西方 0°<elongation<180°，合相/对冲为过渡点
- 行星力量与气质模块统一使用 `getPlanetHouse` 判断宫位
- `horo-math.ts` 新增 `angularDistance` 与 `inCircularRange` 工具函数

### Fixed

- 修正 `calculatePlanetDignity` 误含日光条件计算，仅保留先天尊贵判定
- 修正 `test-data-factory.spec.ts` 中 `ReturnHoroscope` 接口 `houses_cusps` → `cusps` 及缺失的 `profection_arc_to_date_method`

## [0.26.4] - 2026-07-07

### Fixed

- 修正托勒密界边界计算错误：界端点 `i * 30 + term.d` 不应加 1。原代码 `term.d !== 30 ? i * 30 + term.d + 1 : i * 30 + term.d` 改为 `i * 30 + term.d`；`getTermRange` 中 `start`/`end` 同步去掉 `+1`。涉及文件：`promittor.ts`（`calculatePtolemyBounds`、`getTermRange`）、`quadrant_process.component.ts`

### Changed

- 主向推运组件默认显示正向弧：`arcDirectionFilter` 初始值与 `resetFilters` 重置值从 `'all'` 改为 `'direct'`

## [0.26.3] - 2026-07-05

### Fixed

- 修复自定义日小限页面标题仍显示为「中世纪小限」的问题：`MedievalProfectionComponent` 在非 embedded 模式下通过路由访问时，`ngOnInit` 只设置了 `mode` 属性，未根据 `mode` 更新 `title` 属性

## [0.26.2] - 2026-07-03

### Fixed

- 修复推运表 promittor/significator 列中星座为白羊座（sign=0）或宫头为第 1 宫（cusp=0）时不显示的问题：模板中 `@if (getSign(...); as signNum)` / `@if (getCusp(...); as cusp)` / `@if (getSignificatorCusp(...); as cusp)` 将 0 视为 falsy 而跳过渲染。改为 `@let` + 显式 `!== null` 判断。涉及组件：DirectionComponent、MedievalProfectionComponent、QuadrantProcessComponent

## [0.26.1] - 2026-07-01

### Fixed

- 修复承诺星盘星座下拉列表中星座符号显示为原始字符的问题：`ion-select` 的 popover 渲染在组件 DOM 外，内联 `<span style>` 被剥离。改用 CSS 字体回退机制，通过 `interfaceOptions.cssClass` 给 popover 应用全局字体样式，HamburgSymbols 字体渲染星座字母（'a'→♈ 等），中文自动回退到 sans-serif。涉及文件：`promittor.component.html`（移除 span 包裹、添加 cssClass）、`promittor.component.scss`（ion-select 字体）、`global.scss`（popover 内 ion-radio 字体）
- 修复工作台嵌入组件首次初始化时 `ngOnChanges` 与 `ngOnInit` 生命周期顺序导致的显示错误/重复 fetch 问题：Angular 生命周期 `ngOnChanges`（首次）→ `ngOnInit`，首次 `ngOnChanges` 触发 fetch 时 `inputMode` 等静态输入尚未赋值（在 `ngOnInit` 才处理），导致用默认模式调用 API 或与 `ngOnInit` 重复 fetch。修复方法：在 `ngOnChanges` 顶部添加 `if (!this.initialized) return;` 守卫，首次初始化由 `ngOnInit` 唯一负责 fetch。涉及 6 个组件：DirectionComponent（太阳弧显示为主向推运）、MedievalProfectionComponent（自定义日小限显示为中世纪小限）、ProfectionComponent、FirdariaComponent、QuadrantProcessComponent、PromittorComponent

## [0.26.0] - 2026-07-01

### Added

- 新增太阳弧推运功能：复用主向推运组件，通过路由区分主限法/太阳弧（参照中世纪小限/自定义日小限模式），太阳弧模式下隐藏算法与换算下拉框；同步集成进工作台窗口
- 主向推运新增 Regiomontanus 「极下法（黄道向运）」算法选项（对应后端 `DirectionMethod::ZodiacalUnderPole`），同步将原「极下法」选项显示名调整为「极下法（世俗向运）」
- 新增承诺星盘功能：辅助主向推运、太阳弧论断的参考图，展示承诺星（合相、左右相位、映点、反映点）在星盘中的位置；支持交互式按行星筛选，选中行星后显示其所有承诺星，未选中时显示为外圈色点；新增按托勒密界筛选功能，选中星座后自动切换为该星座五个界主星按钮，点击界主星显示该界区间内的承诺星与本命行星；行星符号与相位符号沿同一条半径分布（左相位：相位符号在内、行星符号在外；其余：行星符号在内、相位符号/ant/co 在外）；颜色区分左相位（蓝）、右相位（红）、对冲（紫）、映点（绿）、反映点（橙）；集成进 Home 页与工作台窗口

### Fixed

- 修复行星避让算法 bug：当所有行星/承诺星挤在狭窄角度范围内时，`n` 默认值为 0 导致不执行任何展开，改为 `n = p.length` 确保在找不到足够远的点时展开全部。涉及文件：`horo.ts`（本命盘）、`compare.ts`（比较盘）、`qizheng.ts`（七政，含向前展开 `n` 与向后展开 `m`）、`promittor.ts`（承诺星盘）

- 修复多个表单页面的布局问题：`ion-row` 脱离 `ion-grid`、左列对齐方式不统一（`left_col` 与 `ion-text-right` 混用）、行内 `style` 散落、部分 `ion-col` 缺少 `size` 属性；统一为 `ion-row` 添加 `align-items: center` 实现左右内容垂直居中；压缩 `ion-input`/`ion-select` 默认垂直内边距消除相邻行间距偏宽。涉及页面：本命盘（native）、推运（process）、七政四余（qizheng）、合盘输入（synastry-input）
- 修正合盘与比较盘说明文字中的错别字：「坚看」改为「竖看」
- 修复本命盘页脚存档、笔记按钮图标与文字未垂直居中对齐的问题：`.button-content` 改为 `flex-direction: row` + `align-items: center`

### Changed

- 清理表单页面冗余样式：移除注释掉的死代码、删除误导性的 `left_col` 类名（实际为右对齐）、将行内 `style` 抽离为 `.sex-radio`/`.geo-input`/`.aspect-hint` 等类；清理推运比较盘与返照盘组件的冗余注释代码（`compare.component.scss` 和 `return.component.scss` 中被注释的 toggle 样式试验代码）
- 清理工作台嵌入式组件的冗余代码：移除 `ngOnChanges` 中对静态绑定输入（`inputMode`、`inputProcessName`）的变更检测处理，涉及组件 DirectionComponent、MedievalProfectionComponent、ImageComponent、CompareComponent、ReturnComponent

## [0.25.2] - 2026-06-26

### Fixed

- 修复古代星盘相位表显示错位的问题：部分相位符号未落在正确格子内，与其它相位符号重叠或显示在横排行星上方。根因是后端 `historical_horoscope.rs` 按用户录入的行星顺序计算相位，而 `p0`/`p1` 的相对位置依赖该顺序；当录入顺序与前端 `config.horoPlanets` 规范顺序不一致时，`indexOf(p0) > indexOf(p1)` 会使相位符号落到对角线上方。`horo.ts` 的 `calculateAspectText` 改用 `Math.min`/`Math.max` 保证相位符号始终位于左下三角区域，与本命盘绘制逻辑一致；同时跳过行星不在网格列表中的相位，避免错位绘制到空白区

## [0.25.1] - 2026-06-26

### Changed

- 调整 `angular.json` 中 `anyComponentStyle` 预算限制：警告阈值从 2kb 提升至 4kb，错误阈值从 4kb 提升至 8kb，适应工作台等组件日益增长的样式需求

## [0.25.0] - 2026-06-26

### Added

- 新增工作台窗口快速切换功能：在 header 窗口数徽章处加下拉窗口列表，列出所有打开的窗口（按 z-index 降序排列），点击即置顶/恢复，解决多窗口重叠时难以找到下层星盘的问题
- 新增工作台 header 输入面板显隐开关按钮：与窗口列表按钮并列，点击切换侧边输入面板的显示/隐藏，面板可见时按钮呈含蓄的高亮态

### Removed

- 移除工作台底部任务栏：最小化/隐藏窗口现在通过 header 顶部下拉窗口列表恢复，简化界面布局

### Fixed

- 修复工作台输入面板折叠状态丢失的问题：隐藏侧边栏后再次显示时，出生数据、天象数据、推运数据各分区的折叠状态会被重置。将 `workbench.page.html` 中包裹 `app-input-panel` 的 `@if (!sidebarCollapsed)` 改为 `[style.display]` 绑定，避免组件被销毁重建导致内部状态丢失
- 修复工作台窗口最大化→最小化→恢复后无法还原为正常大小的问题：`WindowService.restoreWindow` 原先仅处理 `Maximized` 状态，对从 `Minimized`/`Hidden` 恢复时若存在 `prevRect`（说明之前为最大化状态）会直接置为 `Normal` 并保留最大化 rect，导致后续点击最大化按钮无法还原。现改为恢复时保持 `Maximized` 状态并保留 `prevRect`，与常见桌面 OS 行为一致
- 修复工作台 header 窗口下拉列表点击外部区域不关闭的问题：原 `.window-list-backdrop`（`position: fixed; inset: 0`）受 Ionic `ion-buttons` 的 `transform: translateZ(0)` 影响被限制在 header 内，无法覆盖工作区。改用 `@HostListener('document:click')` + 容器 `contains` 判定，移除 backdrop，点击列表外任意区域均可关闭

## [0.24.0] - 2026-06-24

### Changed

- 嵌入式模式下 canvas 根据容器实际宽度自适应缩放：当窗口宽度小于默认 canvas 尺寸（700px）时自动缩小以适应窗口，窗口放大时 canvas 跟随放大（最大不超过默认尺寸）
- `zoomImage` 新增可选参数 `maxWidth`，支持自定义参考宽度，向后兼容现有调用方
- `zoomImage` 新增可选参数 `originalSize`，支持基于原始尺寸直接计算目标尺寸，避免 resize 时先重置再缩放导致的闪烁
- 新增 `CanvasResizeHelper` 辅助类，封装 ResizeObserver 监听、防抖重算、基于原始尺寸缩放等逻辑，消除 5 个 canvas 组件（ImageComponent、ReturnComponent、CompareComponent、MedievalProfectionComponent、QuadrantProcessComponent）中的重复代码
- 上述 5 个组件统一通过 `CanvasResizeHelper` 管理 canvas 自适应缩放，调整窗口大小时防抖 150ms 后单次重算，消除闪烁

## [0.23.0] - 2026-06-23

### Changed

- 推运模块（ProcessPage、ProfectionComponent、MedievalProfectionComponent、FirdariaComponent、DirectionComponent、QuadrantProcessComponent）从 NgModule 模式迁移为 standalone 独立组件
- 推运路由从 `loadChildren` 改为指向独立组件导出的 `routes` 懒加载
- WindowFrameComponent 直接导入各独立推运组件替代原 ProcessPageModule
- 移除 `ProcessPageModule` 和 `ProcessPageRoutingModule`
- ReturnComponent 重构为重叠标签页（与 ImageComponent 相同模式）
- ReturnDetailComponent 改为通过 `@Input() returnData` 接收数据，不再通过 router state 传递
- CompareComponent 重构为重叠标签页（与 ImageComponent 相同模式）
- CompareDetailComponent 改为通过 `@Input() compareData` 接收数据，不再通过 router state 传递
- ImageComponent 重构为重叠标签页：详情不再通过路由跳转，而是与星盘放在同一组件内的不同标签页中，默认显示星盘，点击详情标签切换到详细，此操作模式同时适用于非嵌入式和嵌入式模式
- DetailComponent 改为通过 `@Input() horoscopeData` 接收数据，不再通过 router state 传递
- WindowManagerComponent 和 WindowFrameComponent 的 `@Input() + !` 迁移为 `input.required()` signal
- 工作台组件（WorkbenchPage、InputPanelComponent、WindowManagerComponent、WindowFrameComponent）从 NgModule 模式迁移为 standalone 独立组件
- 工作台路由从 `loadChildren` 改为 `loadComponent` 懒加载
- 移除 `WorkbenchPageModule` 和 `WorkbenchPageRoutingModule`
- 本命/天象模块（NativePage、ImageComponent、DetailComponent、NoteComponent、KnowledgeComponent）从 NgModule 模式迁移为 standalone 独立组件
- 本命/天象路由从 `loadChildren` 改为指向独立组件导出的 `routes` 懒加载
- WindowFrameComponent 直接导入 ImageComponent 替代原 NativePageModule
- 移除 `NativePageModule` 和 `NativePageRoutingModule`

## [0.22.0] - 2026-06-19

### Added

- 新增"工作台"功能：在同一个页面集成本命盘、天象盘及推运下的 16 种功能，方便星盘论断
- 工作台支持桌面式浮窗管理：窗口可自由拖动、重叠、最大化、最小化、关闭，并通过 z-index 层叠切换
- 工作台输入面板：提供出生数据和推运数据输入，数据变更实时同步到所有已打开的星盘窗口
- 工作台窗口管理服务（WindowService）：维护窗口列表、z-index 层叠、级联偏移与默认尺寸
- 首页"工作台"入口在移动端（768px 以下）隐藏

### Changed

- 重构本命盘、合盘、日返/月返/每日回、小限、中世纪小限、法达、主向推运、象限推运等星盘组件，新增 `embedded` 模式：通过 `@Input` 接收 `horoData`/`processData`，并使用动态 `canvasId` 避免多窗口 canvas 冲突
- 嵌入式模式下隐藏 `ion-header`，并实现 `OnChanges` 响应输入变化自动重新拉取数据
- 非嵌入式模式保持原有路由行为，向后兼容
- 推运组件下"每日回"更名为"每日回归"

## [0.21.1] - 2026-06-06

### Added

- 古代星盘行星逆行标识：`HistoricalPlanetPosition` 接口新增 `is_retrograde` 字段，适配器根据该字段在星盘图上绘制逆行符号

## [0.21.0] - 2026-06-05

### Added

- 新增古代星盘绘制功能
- 新增 `adaptHistoricalToHoroscope` 数据适配工具，将古代星盘计算结果转换为现有绘图函数所需格式
- ApiService 新增古代星盘相关 API 方法
- HoroStorageService 新增 `historicalData` 缓存属性

## [0.20.0] - 2026-06-04

### Added

- 新增每日回归盘功能
- 新增每日回比本命、本命比每日回比较盘功能

## [0.19.1] - 2026-05-30

### Fixed

- 修复天象盘模式下无法更新记录的问题：新增记录成功后会同步更新组件状态，使"更新记录"选项正确显示
- 修复 changeStep 修改的日期不会保存到档案的问题：存档接口现在使用 currentHoroData 而非初始化时的快照，包含用户通过时间推移功能做的修改
- 修复更新记录后浏览器后退显示旧数据的问题：updateRecord 成功后同步更新 storage

### Changed

- 优化错误处理：使用公共函数 getApiErrorMessage 替代组件内冗余的 handleError 方法

## [0.19.0] - 2026-05-29

### Added

- 中世纪小限和自定义日小限的象征星增加宫头（Cusp）支持，Significator 类型扩展为 `{ planet: PlanetName } | { cusp: number }`
- 中世纪小限方向表增加宫头象征星筛选器

## [0.18.1] - 2026-05-28

### Changed

- 小限 API 路径调整：三种小限统一到 `/api/process/profection` 下
  - 基础小限：`/process/profection` → `/process/profection/general`
  - 中世纪小限：`/process/medieval-profection` → `/process/profection/medieval/year`
  - 自定义日小限：`/process/custom/day` → `/process/profection/custom/day`

## [0.18.0] - 2026-05-28

### Added

- 新增自定义日小限功能，复用中世纪小限组件，支持星盘图和方向推运表

## [0.17.0] - 2026-05-27

### Added

- 新增天象盘功能，数据与本命星盘互不影响

## [0.16.2] - 2026-05-23

### Added

- 世纪小限方向弧增加宫头
- 中世纪小限方向推运支持显示星座承诺星
- Promittor 增加 Sign（星座）类型

## [0.16.1] - 2026-05-22

### Added

- 七政四余合盘增加"交点"选项

### Changed

- 提取 swapNodeNames 为公共函数（qizheng-utils）

## [0.16.0] - 2026-05-22

### Added

- 七政四余增加"交点"选项（南罗北计/南计北罗），选择南计北罗时星图中罗喉与计都名称互换

## [0.15.0] - 2026-05-21

### Added

- 增加中世纪小限
- 为主向推运增加承诺星过滤

### Changed

- 象限推运条目优化默认显示数量
- 主向推运、象限推运、中世纪小限用到的公共函数提取到独立模块

## [0.14.3] - 2026-05-19

### Added

- 主向推运新增方向弧转日期换算方式（ArcToDateMethod）选择，支持"1天=1年"和"1度=1年"两种换算方式

## [0.14.2] - 2026-05-16

### Added

- 增加时小限

##### [0.14.1] - 2026-05-16

### Fixed

- 修复日返/月返无法显示星盘的问题（ReturnHoroscope 接口字段名由 houses_cusps 改为 cusps，与后端返回一致）

## [0.14.0] - 2026-05-16

### Added

- 主向推运增加弧度方向过滤功能，可选择显示正向弧、反向弧或全部
- 主向推运增加promissor过滤功能
- 增加极下的主向推运

### Fixed

- HoroStorageService 初始化数据时改用 deepFreeze，确保嵌套属性也被冻结

## Changed

- date-time 组件 增加年份范围，从 1900 到 2199

## [0.13.1] - 2026-04-28

### Added

- Promittor 增加 cusp（宫头）信息

### Fixed

- 修复象限推运过滤条件中，开始时间设置为出生时间时不显示第1宫的问题（浮点精度判断）

## [0.13.0] - 2026-04-27

### Added

- 新增象限推运功能

## [0.12.0] - 2026-04-05

### Added

- 新增主向推运（Direction）功能

## [0.11.1] - 2026-02-18

### Changed

- 修改 native 和 qizheng 模块中 knowledge 组件的 selector，避免重名
- 为 qizheng 模块添加知识页面入口

## [0.11.0] - 2026-01-28

## Added

- 加七政四余合盘

## [0.10.0] - 2026-01-28

## Added

- 增加：北河三、氐宿四
- 恒星增加描述信息

## [0.9.2] - 2026-01-19

## Added

- 为 native、process、qizheng 添加 从档案库加载数据的功能

## [0.9.1] - 2026-01-18

## Changed

- 将合盘组件的天宫图、相位图的宽、高属性设置为独立参数
- 将 archive-selection-modal 放到 horo-common 中成为一个独立的组件

## [0.9.0] - 2026-01-16

### Added

- 新增合盘（Synastry）功能，支持两个星盘的对比分析
- HoroStorageService 新增 synastryData 存储功能

## [0.8.0] - 2026-01-04

### Added

- 本命盘增加恒星

## [0.7.2] - 2026-01-03

### Changed

- 升级升级 ionice、fabricjs
- 修正因升级 fabricjs 导致的 fabricjs 代码不兼容

## [0.7.1] - 2025-11-19

### Changed

- 根据 Lily《基督教占星学》双子座 21 度托勒密界改回金星

## [0.7.0] - 2025-11-3

### Added

- 新增"视力点"

## [0.6.0] - 2025-10-16

### Changed

- 根据 Lily《基督教占星学》修订托勒密界度数分配

## [0.5.0] - 2025-10-08

### Added

- 为 src/app/native 添加星座知识组件
- 新增"福点"

## [0.4.0] - 2025-10-08

### Added

- 因 horoscopes 表添加 lock 字段，UI 组件作相应变更

## [0.3.0] - 2025-09-19

### Added

- 新增七政知识组件
- 七政行星增加力量
- 增加星辰格局
- 增加“天厨”神煞

### Fixed

- 修复`档案库`组件不能加载更多数据

## [0.2.0] - 2025-08-05

### Fixed

- 修复 map.component、about.page 组件图标不显示
- 2016 年 8 月 31 日 23:54:29 七政四余行运行星指示线错误
- 七政，1993 年 11 月 27 日 08:15:00，本命，木、水重叠
- [BUG-20250804-1201] 本命星盘，image.component.ts 组件，如果 id!=0，新增记录后，使用浏览器后退按钮返回 native/native.page.ts 作出修改后，再进 image 组件，再更新记录，会修改旧记录

### Added

- about.page 增加"七政四余顶度时间比例"

### Changed

- 经纬查询改为从 api 根据地名查询

## [0.1.0] - 2025-07-03

### Added

- 增加十干化曜功能

### Changed

- Upgraded Angular to v20.0.5
- Upgraded fabric to v6.7.0
- Upgraded ionicons to v8.0.9
- archive 组件 的 edit 子组件中姓名字段长度调整到 30 个字符

### Fixed

- 重构 horostorage.service，以修复 image 组件保存 Note 时的错误
- 修复 auth 组件不因 horo-storage-ui 注销后仍然是登录状态的问题
- 修复 qizheng 天宫图中多颗行星相距太近指示线错乱
