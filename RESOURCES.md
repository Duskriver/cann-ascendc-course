# 华为 CANN 与 Ascend C 学习资源 (Resources)

## Knowledge

- [昇腾社区官方文档中心：CANN 商业版/社区版文档](https://www.hiascend.com/document)
  华为昇腾最权威的一手技术文档。用于：查阅 CANN 架构总览、Ascend C 算子开发指南、API 参考手册（基础 API 与高阶 API）及 Profiling 工具指南。
- [昇腾官方代码仓：Ascend Samples (`gitee.com/ascend/samples`)](https://gitee.com/ascend/samples/tree/master/operator/ascendc)
  官方维护的端到端算子与推理样例库，其中 `operator/ascendc` 目录包含 `AddCustom`、`MatMul` 等标准算子工程模板。用于：对照标准工程目录结构、CMake 编译脚本与核函数写法。
- [昇腾社区在线课程：Ascend C 算子开发系列课](https://www.hiascend.com/edu/courses)
  官方出品的结构化视频与实验课（含华为云 ModelArts CodeLab 实操）。用于：辅助理解达芬奇架构流水线、Tiling 切分与孪生调试流程。
- [Gitee 开源算子库：`cann-ops-adv` 昇腾进阶算子库](https://gitee.com/ascend/cann-ops-adv)
  华为开源的生产级高性能算子实现代码库。用于：在中后期学习工业级算子如何做极致 Tiling 与指令级流水优化。

## Wisdom (Communities)

- [昇腾论坛 - CANN & 算子开发版块 (`hiascend.com/forum`)](https://www.hiascend.com/forum)
  华为官方技术团队常驻答疑的高信噪比社区。用于：检索真实报错码（如 `ACL_ERROR`、核函数异常）、提问算子精度对齐与性能调优实战问题。
- [Gitee Ascend Issues 讨论区 (`gitee.com/ascend/samples/issues`)](https://gitee.com/ascend/samples/issues)
  开发者提交真实工程 Bug 与环境适配问题的地方。用于：排查特定 CANN 版本下的编译配置与上板运行问题。
