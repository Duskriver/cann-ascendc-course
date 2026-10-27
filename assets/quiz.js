/**
 * Shared Interactive Components, Animations & Quiz Engine for CANN Teaching Workspace
 * Modern Web Best Practices:
 * - Native <button> semantics without redundant role="button"
 * - Accessible Live Regions (aria-live="polite") for screen reader announcements
 * - Custom SVG widget keyboard handlers (Enter on keydown, Space on keyup)
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Declarative Active Recall Quizzes
  // =========================================================================
  const questions = document.querySelectorAll('.quiz-question');
  questions.forEach((qEl) => {
    const correctIndex = parseInt(qEl.getAttribute('data-correct'), 10);
    const explainCorrect = qEl.getAttribute('data-explain-correct') || '回答正确！';
    const explainWrong = qEl.getAttribute('data-explain-wrong') || '再想一想：回顾上方的硬件数据流说明。';
    const options = qEl.querySelectorAll('.quiz-option');
    const feedback = qEl.querySelector('.quiz-feedback');

    if (feedback) {
      feedback.setAttribute('aria-live', 'polite');
      feedback.setAttribute('role', 'status');
    }

    options.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        options.forEach((b) => {
          b.classList.remove('correct', 'incorrect');
          b.removeAttribute('aria-pressed');
        });
        if (feedback) {
          feedback.classList.remove('show-correct', 'show-incorrect');
        }

        btn.setAttribute('aria-pressed', 'true');

        if (idx === correctIndex) {
          btn.classList.add('correct');
          if (feedback) {
            feedback.textContent = '✓ ' + explainCorrect;
            feedback.classList.add('show-correct');
          }
        } else {
          btn.classList.add('incorrect');
          if (feedback) {
            feedback.textContent = '✗ ' + explainWrong;
            feedback.classList.add('show-incorrect');
          }
        }
      });
    });
  });

  // =========================================================================
  // 2. CANN Software Stack Interactive Bridge
  // =========================================================================
  const stackBtns = document.querySelectorAll('[data-stack-detail]');
  const stackDetailBox = document.getElementById('cann-stack-detail');
  if (stackBtns.length > 0 && stackDetailBox) {
    stackBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        stackBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        stackDetailBox.innerHTML = btn.getAttribute('data-stack-detail');
      });
    });
  }

  // =========================================================================
  // 3. Interactive SVG AI Core Architecture Explorer
  // =========================================================================
  const hwData = {
    gm: {
      title: '📦 Global Memory (GM / HBM) —— 片外远郊万吨大仓库',
      body: '<strong>0基础直觉：</strong> 位于 AI Core 车间外面的超大显存（16GB ~ 64GB）。PyTorch 创建的输入张量 <code>x</code> 和 <code>y</code> 一开始就存放在这里。<br><strong>物理限制：</strong> 空间极大但距离计算核心很远（访问延迟数百周期）。<strong>Vector 和 Cube 计算工人绝不能直接伸手到这里做算术！</strong>'
    },
    mte2: {
      title: '🚚 MTE2 搬运引擎 —— 进货专线运输车队 (GM ➔ 片上)',
      body: '<strong>0基础直觉：</strong> 专门负责把原材料从片外大仓库（GM）拉到车间内工作台（UB 或 L1）的自动化物流车队。<br><strong>代码对应：</strong> 在 Ascend C 的 <code>CopyIn()</code> 阶段调用 <code>DataCopy(xLocal, xGm, count)</code> 时，本质上就是给 MTE2 下达拉货指令。'
    },
    ub: {
      title: '🛠️ Unified Buffer (UB) —— 工人手边的超高速工作台',
      body: '<strong>0基础直觉：</strong> 建在 AI Core 车间内部的黄金工作台（SRAM 高速缓存）。虽然只有大约 <strong>192KB ~ 256KB</strong> 大小，但读写速度极快（单周期吞吐）。<br><strong>核心铁律：</strong> 所有要给 Vector 单元计算的数据，必须先摆在 UB 工作台上；算完的结果也先放在 UB 上，再由 MTE3 运走。'
    },
    vector: {
      title: '⚡ Vector 向量计算单元 —— 一排数据同时算的流水线工人',
      body: '<strong>0基础直觉：</strong> 站在 UB 工作台旁边的超级工人。CPU 一次只算 1 对数，而 Vector 单条指令就能把 UB 里一整排（如 64 或 128 个数）同时相加、相乘、求指数（Exp）或做 ReLU 激活。<br><strong>代码对应：</strong> <code>Compute()</code> 阶段里的 <code>Add(zLocal, xLocal, yLocal, count)</code>。'
    },
    cube: {
      title: '🧱 Cube 矩阵乘单元 —— 专攻大模型的重型矩阵压铸机',
      body: '<strong>0基础直觉：</strong> 专门为深度学习矩阵乘法（<em>A</em> × <em>B</em> + <em>C</em>）定制的硬核巨兽。一锤子砸下去，1 个时钟周期就能完成 16 × 16 × 16（4096 次乘加）运算！大语言模型里 80% 以上的算力由它提供。'
    },
    scalar: {
      title: '📋 Scalar 标量单元 —— 拿着计数器喊口令的车间调度员',
      body: '<strong>0基础直觉：</strong> 相当于嵌在 AI Core 里的迷你 CPU。它不干重体力活，专门负责算 <code>for (int i = 0; i &lt; tileNum; i++)</code> 的循环计数、计算下一块数据的内存偏移地址，并指挥 MTE、Vector 和 Cube 协同干活。'
    },
    mte3: {
      title: '🚛 MTE3 搬运引擎 —— 出货专线运输车队 (UB ➔ GM)',
      body: '<strong>0基础直觉：</strong> 当 Vector 工人在 UB 工作台上把结果 <code>zLocal</code> 算好后，必须把工作台腾出来给下一批货用。MTE3 就负责把成品从 UB 运回片外大仓库（GM）。<br><strong>代码对应：</strong> 在 <code>CopyOut()</code> 阶段调用 <code>DataCopy(zGm, zLocal, count)</code>。'
    }
  };

  const hwBtns = document.querySelectorAll('[data-hw-target]');
  const svgGroups = document.querySelectorAll('.svg-hw-group[data-hw-id]');
  const archTitle = document.getElementById('arch-detail-title');
  const archBody = document.getElementById('arch-detail-body');

  function selectHardwareNode(hwId) {
    const info = hwData[hwId];
    if (!info) return;

    hwBtns.forEach((b) => {
      const matched = b.getAttribute('data-hw-target') === hwId;
      b.classList.toggle('active', matched);
      b.setAttribute('aria-pressed', matched ? 'true' : 'false');
    });

    svgGroups.forEach((g) => {
      const matched = g.getAttribute('data-hw-id') === hwId;
      g.classList.toggle('active-hw', matched);
    });

    if (archTitle) archTitle.innerHTML = info.title;
    if (archBody) archBody.innerHTML = info.body;
  }

  hwBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      selectHardwareNode(btn.getAttribute('data-hw-target'));
    });
  });

  svgGroups.forEach((g) => {
    const hwId = g.getAttribute('data-hw-id');
    g.addEventListener('click', () => selectHardwareNode(hwId));
    // Standard custom button keyboard handling: Enter on keydown, Space on keyup
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        selectHardwareNode(hwId);
      }
      if (e.key === ' ') {
        e.preventDefault();
      }
    });
    g.addEventListener('keyup', (e) => {
      if (e.key === ' ') {
        selectHardwareNode(hwId);
      }
    });
  });

  // =========================================================================
  // 4. Animated Dataflow & Code Synchronizer Workbench (CopyIn -> Compute -> CopyOut)
  // =========================================================================
  const simBtns = document.querySelectorAll('[data-sim-step]');
  const playBtn = document.getElementById('sim-autoplay-btn');
  const codeBlocks = document.querySelectorAll('.sync-code-block[data-code-step]');
  let autoPlayTimer = null;

  const stepConfigs = {
    '0': {
      desc: '<strong>初始状态（待命）：</strong> 输入数据 <code>x = [10, 20, 30, 40]</code> 和 <code>y = [1, 2, 3, 4]</code> 静静躺在片外大仓库 <strong>Global Memory (GM)</strong> 中。片内 <strong>UB 工作台</strong> 空空如也，Vector 工人等待原料。',
      gmZoneActive: true,
      ubZoneActive: false,
      mte2Active: false,
      mte3Active: false,
      mte2Text: '🚚 MTE2 进货通道 (待命)',
      mte3Text: '🚛 MTE3 出货通道 (待命)',
      xLocalVals: ['--', '--', '--', '--'],
      yLocalVals: ['--', '--', '--', '--'],
      zLocalVals: ['--', '--', '--', '--'],
      zGmVals: ['?', '?', '?', '?'],
      vectorStatus: '⏳ Vector 向量单元：等待 UB 准备好数据...',
      xLocalHighlight: false,
      zLocalComputed: false,
      zGmComputed: false
    },
    '1': {
      desc: '<strong>第一步 Stage 1 (CopyIn 搬入片上)：</strong> <strong>MTE2 搬运引擎</strong>启动！执行 <code>DataCopy</code>，将 <code>x</code> 和 <code>y</code> 的 4 个元素从片外 GM 异步拉进片上高速缓存 <strong>UB</strong> 的 <code>xLocal</code> 与 <code>yLocal</code> 槽位。',
      gmZoneActive: true,
      ubZoneActive: true,
      mte2Active: true,
      mte3Active: false,
      mte2Text: '🚚 MTE2 正在搬入：[10,20,30,40] & [1,2,3,4] ⬇',
      mte3Text: '🚛 MTE3 出货通道 (待命)',
      xLocalVals: ['10', '20', '30', '40'],
      yLocalVals: ['1', '2', '3', '4'],
      zLocalVals: ['--', '--', '--', '--'],
      zGmVals: ['?', '?', '?', '?'],
      vectorStatus: '📦 原料已就位！Vector 准备启动并行加法...',
      xLocalHighlight: true,
      zLocalComputed: false,
      zGmComputed: false
    },
    '2': {
      desc: '<strong>第二步 Stage 2 (Compute 片上计算)：</strong> <strong>Vector 向量单元</strong>发威！单条 <code>Add</code> 指令同时对 UB 内的 4 对数字做并行加法（<code>10+1, 20+2, 30+3, 40+4</code>），瞬间在 UB 内算出 <code>zLocal = [11, 22, 33, 44]</code>！注意此时片外 GM 的 <code>zGm</code> 还没变。',
      gmZoneActive: false,
      ubZoneActive: true,
      mte2Active: false,
      mte3Active: false,
      mte2Text: '🚚 MTE2 进货通道 (空闲)',
      mte3Text: '🚛 MTE3 出货通道 (准备出货)',
      xLocalVals: ['10', '20', '30', '40'],
      yLocalVals: ['1', '2', '3', '4'],
      zLocalVals: ['11', '22', '33', '44'],
      zGmVals: ['?', '?', '?', '?'],
      vectorStatus: '⚡ Vector 并行计算中：[10+1, 20+2, 30+3, 40+4] ➔ [11, 22, 33, 44]',
      xLocalHighlight: false,
      zLocalComputed: true,
      zGmComputed: false
    },
    '3': {
      desc: '<strong>第三步 Stage 3 (CopyOut 写回显存)：</strong> <strong>MTE3 搬运引擎</strong>启动！执行 <code>DataCopy</code>，将片上 UB 算好的 <code>zLocal = [11, 22, 33, 44]</code> 写回片外大仓库 GM 的 <code>zGm</code>，腾出宝贵的 UB 空间给下一批数据使用！',
      gmZoneActive: true,
      ubZoneActive: true,
      mte2Active: false,
      mte3Active: true,
      mte2Text: '🚚 MTE2 进货通道 (空闲)',
      mte3Text: '🚛 MTE3 正在写回：[11, 22, 33, 44] ⬆',
      xLocalVals: ['10', '20', '30', '40'],
      yLocalVals: ['1', '2', '3', '4'],
      zLocalVals: ['11', '22', '33', '44'],
      zGmVals: ['11', '22', '33', '44'],
      vectorStatus: '✅ 本批次完成！UB 缓冲区即将释放，准备迎接下一块 Tile',
      xLocalHighlight: false,
      zLocalComputed: true,
      zGmComputed: true
    }
  };

  function renderChips(containerId, values) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = values.map((v) => `<span class="val-chip">${v}</span>`).join('');
  }

  function applySimStep(stepStr) {
    const cfg = stepConfigs[stepStr];
    if (!cfg) return;

    simBtns.forEach((b) => {
      const active = b.getAttribute('data-sim-step') === stepStr;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    codeBlocks.forEach((cb) => {
      const active = cb.getAttribute('data-code-step') === stepStr;
      cb.classList.toggle('code-active', active);
    });

    const gmZone = document.getElementById('sim-gm-zone');
    const ubZone = document.getElementById('sim-ub-zone');
    const mte2El = document.getElementById('sim-mte2-channel');
    const mte3El = document.getElementById('sim-mte3-channel');
    const vecEl = document.getElementById('sim-vector-banner');
    const xRow = document.getElementById('row-x-local');
    const yRow = document.getElementById('row-y-local');
    const zLocalRow = document.getElementById('row-z-local');
    const zGmRow = document.getElementById('row-z-gm');
    const statusBox = document.getElementById('sim-status-text');

    if (gmZone) gmZone.classList.toggle('zone-active', cfg.gmZoneActive);
    if (ubZone) ubZone.classList.toggle('zone-active', cfg.ubZoneActive);
    if (mte2El) {
      mte2El.classList.toggle('channel-active', cfg.mte2Active);
      mte2El.textContent = cfg.mte2Text;
    }
    if (mte3El) {
      mte3El.classList.toggle('channel-active', cfg.mte3Active);
      mte3El.textContent = cfg.mte3Text;
    }
    if (vecEl) {
      vecEl.textContent = cfg.vectorStatus;
      vecEl.classList.toggle('row-computed', stepStr === '2');
    }

    renderChips('vals-x-local', cfg.xLocalVals);
    renderChips('vals-y-local', cfg.yLocalVals);
    renderChips('vals-z-local', cfg.zLocalVals);
    renderChips('vals-z-gm', cfg.zGmVals);

    if (xRow) xRow.classList.toggle('row-highlight', cfg.xLocalHighlight);
    if (yRow) yRow.classList.toggle('row-highlight', cfg.xLocalHighlight);
    if (zLocalRow) zLocalRow.classList.toggle('row-computed', cfg.zLocalComputed);
    if (zGmRow) zGmRow.classList.toggle('row-computed', cfg.zGmComputed);

    if (statusBox) {
      statusBox.innerHTML = cfg.desc;
    }
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
    if (playBtn) {
      playBtn.textContent = '▶ 自动演示全流程';
      playBtn.setAttribute('aria-pressed', 'false');
    }
  }

  if (simBtns.length > 0) {
    simBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        stopAutoPlay();
        applySimStep(btn.getAttribute('data-sim-step'));
      });
    });

    codeBlocks.forEach((cb) => {
      cb.addEventListener('click', () => {
        stopAutoPlay();
        applySimStep(cb.getAttribute('data-code-step'));
      });
    });

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (autoPlayTimer) {
          stopAutoPlay();
          return;
        }
        const steps = ['0', '1', '2', '3'];
        let idx = 0;
        playBtn.textContent = '⏸ 停止自动演示';
        playBtn.setAttribute('aria-pressed', 'true');
        applySimStep(steps[idx]);

        autoPlayTimer = setInterval(() => {
          idx += 1;
          if (idx >= steps.length) {
            stopAutoPlay();
            return;
          }
          applySimStep(steps[idx]);
        }, 1600);
      });
    }
  }

  // =========================================================================
  // 5. Tiling & Pipeline Overlap Gantt Visualizer
  // =========================================================================
  const ganttBtns = document.querySelectorAll('[data-gantt-mode]');
  const ganttMte2 = document.getElementById('gantt-row-mte2');
  const ganttVec = document.getElementById('gantt-row-vec');
  const ganttMte3 = document.getElementById('gantt-row-mte3');
  const ganttSummary = document.getElementById('gantt-summary-text');

  const ganttModes = {
    serial: {
      mte2: [
        { cls: 'tile-0', text: '块0 搬入' },
        { cls: '', text: '闲置' },
        { cls: '', text: '闲置' },
        { cls: 'tile-1', text: '块1 搬入' },
        { cls: '', text: '闲置' },
        { cls: '', text: '闲置' },
        { cls: 'tile-2', text: '块2 搬入' },
        { cls: '', text: '闲置' },
        { cls: '', text: '闲置' }
      ],
      vec: [
        { cls: '', text: '闲置' },
        { cls: 'tile-0', text: '块0 计算' },
        { cls: '', text: '闲置' },
        { cls: '', text: '闲置' },
        { cls: 'tile-1', text: '块1 计算' },
        { cls: '', text: '闲置' },
        { cls: '', text: '闲置' },
        { cls: 'tile-2', text: '块2 计算' },
        { cls: '', text: '闲置' }
      ],
      mte3: [
        { cls: '', text: '闲置' },
        { cls: '', text: '闲置' },
        { cls: 'tile-0', text: '块0 写回' },
        { cls: '', text: '闲置' },
        { cls: '', text: '闲置' },
        { cls: 'tile-1', text: '块1 写回' },
        { cls: '', text: '闲置' },
        { cls: '', text: '闲置' },
        { cls: 'tile-2', text: '块2 写回' }
      ],
      summary: '🐢 <strong>串行死等模式（耗时 9 拍，硬件利用率仅 33%）：</strong> 每次只处理一整块，MTE2 搬货时 Vector 干瞪眼，Vector 算题时 MTE2 和 MTE3 又在睡大觉。这就像餐厅里服务员端完菜、厨师才开始炒下一道菜！'
    },
    pipeline: {
      mte2: [
        { cls: 'tile-0', text: '块0 搬入' },
        { cls: 'tile-1', text: '块1 搬入' },
        { cls: 'tile-2', text: '块2 搬入' },
        { cls: '', text: '完成' },
        { cls: '', text: '完成' },
        { cls: '', text: '' },
        { cls: '', text: '' },
        { cls: '', text: '' },
        { cls: '', text: '' }
      ],
      vec: [
        { cls: '', text: '等待块0' },
        { cls: 'tile-0', text: '块0 计算' },
        { cls: 'tile-1', text: '块1 计算' },
        { cls: 'tile-2', text: '块2 计算' },
        { cls: '', text: '完成' },
        { cls: '', text: '' },
        { cls: '', text: '' },
        { cls: '', text: '' },
        { cls: '', text: '' }
      ],
      mte3: [
        { cls: '', text: '' },
        { cls: '', text: '等待块0' },
        { cls: 'tile-0', text: '块0 写回' },
        { cls: 'tile-1', text: '块1 写回' },
        { cls: 'tile-2', text: '块2 写回' },
        { cls: '', text: '' },
        { cls: '', text: '' },
        { cls: '', text: '' },
        { cls: '', text: '' }
      ],
      summary: '⚡ <strong>达芬奇流水线并行模式（耗时缩短至 5 拍，第 3 拍三大硬件 100% 同频满载！）：</strong> 因为 MTE2、Vector、MTE3 是<strong>三套独立的硬件单元</strong>！看<strong>第 3 拍（T3）</strong>：MTE3 正在写回<code>块0</code>、Vector 正在算<code>块1</code>、MTE2 正在搬入<code>块2</code>——搬运耗时被计算完美掩盖！这就是为什么要分成 <code>CopyIn ➔ Compute ➔ CopyOut</code> 三阶段的核心原因！'
    }
  };

  function renderGanttRow(container, slots) {
    if (!container) return;
    container.innerHTML = slots
      .map((s, i) => `<div class="gantt-slot ${s.cls}" title="时间拍 T${i + 1}">${s.text || '·'}</div>`)
      .join('');
  }

  if (ganttBtns.length > 0) {
    ganttBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-gantt-mode');
        const cfg = ganttModes[mode];
        if (!cfg) return;

        ganttBtns.forEach((b) => {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        renderGanttRow(ganttMte2, cfg.mte2);
        renderGanttRow(ganttVec, cfg.vec);
        renderGanttRow(ganttMte3, cfg.mte3);
        if (ganttSummary) ganttSummary.innerHTML = cfg.summary;
      });
    });
  }

  // =========================================================================
  // 6. Interactive npu-smi info Terminal Hotspots
  // =========================================================================
  const termHotspots = document.querySelectorAll('.term-hotspot[data-term-explain]');
  const termInspector = document.getElementById('term-inspector-box');
  if (termHotspots.length > 0 && termInspector) {
    termHotspots.forEach((hs) => {
      hs.addEventListener('click', () => {
        termHotspots.forEach((h) => {
          h.classList.remove('active');
          h.setAttribute('aria-pressed', 'false');
        });
        hs.classList.add('active');
        hs.setAttribute('aria-pressed', 'true');
        termInspector.innerHTML = hs.getAttribute('data-term-explain');
      });
    });
  }
});
