# 项目说明

这是一个基于 Ionic/Angular 开发的占星应用的。主要功能包括：

- 本命盘绘制
- 推运盘绘制
  - 法达
  - 小限
  - 日返
  - 月返
  - 比较盘
- 七政四余盘星盘绘制
  - 没实现神煞
  - 没实现化曜
  - 没实现十二长生
  - 没实现纳音
- 行星必然尊贵表
- 案例库

# 此项目的 API 后端

https://github.com/wlhyl/horo-api.git

# 开始使用

## 运行 API

根据 API 后端的 README.md 运行 API

## 安装依赖

```bash
npm install
```

## 启动项目

```bash
ionic serve
```

# Docker 镜像构建

```bash
docker build -t horo/ui .
```

# 许可证
项目使用GPL-3.0 许可证 ([LICENSE](LICENSE))。
