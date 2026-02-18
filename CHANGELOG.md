# Changelog

All notable changes to this project will be documented in this file.

### Planned

- 推运计划增加次限、三限

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
