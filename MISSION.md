# Mission: 华为 CANN 异构计算与 Ascend C 算子开发

## Why
从异构计算零基础出发，掌握华为昇腾（Ascend）NPU 的底层软硬件协同机制，能够在实际昇腾硬件环境上使用 **Ascend C** 独立编写、孪生调试并优化高性能自定义算子，突破 AI 模型在昇腾硬件上的算子缺失与性能瓶颈。

## Success looks like
- 能够在昇腾硬件环境上查看设备状态，并准确绘制 CANN 软硬件分层与达芬奇 AI Core 内部存储/计算单元数据流图。
- 能够使用 Ascend C 遵循 `CopyIn -> Compute -> CopyOut` 流水线范式，独立完成 Vector 算子（如 `AddCustom` / `SinhCustom`）的核函数（Kernel）与 Host 侧 Tiling 编写，并在 NPU 上编译跑通。
- 能够利用双缓冲（Double Buffer）与流水线并行机制优化算子搬运与计算重叠，并使用 Profiling 工具定位算子性能瓶颈（Memory Bound vs. Compute Bound）。

## Constraints
- **起点**：异构计算零基础（不预设 CUDA / GPU 编程经验，所有软硬件概念需从第一性原理与直观类比讲起）。
- **环境**：手头具备可随时实操的昇腾硬件环境（支持直接运行 `npu-smi`、CANN 编译器与上板验证）。

## Out of scope
- 暂不深入研究上层 AI 框架（MindSpore / PyTorch Ascend 插件）的内部图编译源码（GE 图引擎细节仅在算子接入需要时按需涉及）。
- 暂不涉及多机多卡分布式通信（HCCL）底层开发，聚焦单卡/单核及多 AI Core 算子开发与性能调优。
