# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Planned

- 推运计划增加次限、三限

### Fixed

- 修复 map.component、about.page 组件图标不显示
- 2016 年 8 月 31 日 23:54:29 七政四余行运行星指示线错误
- 七政，1993 年 11 月 27 日 08:15:00 福州，本命，木、水重叠
- [BUG-20250804-1201] 本命星盘，image.component.ts 组件，如果 id!=0，新增记录后，使用浏览器后退按钮返回 native/native.page.ts 作出修改后，再进 image 组件，再更新记录，会修改旧记录

### Added

- about.page 增加"七政四余顶度时间比例"

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
