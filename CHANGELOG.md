# Changelog

All notable changes to this project will be documented in this file.

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
