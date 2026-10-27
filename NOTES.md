# Teaching Notes

- **Learner Profile**: 异构计算零基础（No prior CUDA/heterogeneous computing background），具备数组、函数和循环的基础概念；尚无编程基础时先完成简短准备。
- **Target Goal**: 使用 Ascend C 开发自定义算子并优化算子性能。
- **Hardware Access**: 拥有昇腾硬件环境（可随时上机实操）。
- **Pedagogical Reminders**:
  - 每次只教一个紧密围绕 Mission 的核心概念，严控认知负荷（Working Memory）。
  - 从四个数相加的具体任务出发，用仓库、工作台与搬运的类比解释数据流，再逐步引入英文术语。
  - 第一课必达目标只有三个：说明 CPU/NPU 分工；解释一次加法的搬入、计算、写回；识别真实设备的型号与显存信息。
  - CANN 分层、Scalar/Cube、L1/L0 和流水线优化放在选读或后续课；解释流水线重叠时写清缓冲、同步与耗时假设。
  - 每段先预测再验证，以“Compute 后结果在哪里”等问题和口述数据路线检查理解。
  - 使用“先建立直观认识”等平实话术，不用“30 秒彻底明白”或“顿悟”给学习速度设限。
  - Quiz 选项必须保持**字数/字符数严格一致**，避免通过长度泄露正确答案，且正确选项位置需随机交错。
