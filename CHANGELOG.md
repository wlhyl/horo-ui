# Changelog

All notable changes to this project will be documented in this file.

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
