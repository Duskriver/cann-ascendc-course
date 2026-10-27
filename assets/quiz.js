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
      title: '📦 全局存储（GM）—— 设备上的大仓库',
      body: '<strong>本课中的角色：</strong> 保存 NPU 上的输入和输出数据。演示从输入已经放在设备全局存储中开始；主机内存与设备内存之间的传输另有步骤。<br><strong>数据路线：</strong> 本课的向量加法先把输入搬到片上工作台，再计算、写回。存储介质与容量随设备型号而异。'
    },
    mte2: {
      title: '🚚 搬入引擎（MTE2）—— 把原料送到工作台',
      body: '<strong>本课中的角色：</strong> 将输入从全局存储（GM）搬到片上工作台（UB）。<br><strong>对应阶段：</strong> 搬入（CopyIn）。数据搬入完成后，计算才能使用它。'
    },
    ub: {
      title: '🛠️ 统一缓冲区（UB）—— 片上工作台',
      body: '<strong>本课中的角色：</strong> 容量比全局存储小、靠近计算单元的暂存空间。这里先放输入，再存放向量加法的结果。<br><strong>记住区别：</strong> UB 中已经有结果，不代表 GM 中的输出也已更新；还需要写回。具体容量随芯片型号而异。'
    },
    vector: {
      title: '⚡ 向量计算单元（Vector）—— 成批处理数字的工人',
      body: '<strong>本课中的角色：</strong> 对工作台上的多组数字进行同类运算。本例把对应位置的数字相加。<br><strong>对应阶段：</strong> 计算（Compute）。完成后，结果先保存在 UB 中。'
    },
    cube: {
      title: '🧱 矩阵计算单元（Cube）—— 处理矩阵乘法',
      body: '<strong>先认识即可：</strong> 矩阵是一张按行、列排列的数字表。Cube 擅长矩阵乘加运算，具体规格和组织方式随芯片型号而异。<br><strong>本课范围：</strong> 当前示例使用向量加法，暂不涉及矩阵计算的数据路线。'
    },
    scalar: {
      title: '📋 标量单元（Scalar）—— 处理计数与控制',
      body: '<strong>先认识即可：</strong> 处理循环计数、地址计算、条件判断等工作，配合搬运和计算单元执行程序。<br><strong>本课范围：</strong> 先理解数据在哪里、经过哪些步骤；控制代码将在后续课程中介绍。'
    },
    mte3: {
      title: '🚛 写回引擎（MTE3）—— 把结果送回大仓库',
      body: '<strong>本课中的角色：</strong> 将 UB 中算好的结果写入设备全局存储（GM）。<br><strong>对应阶段：</strong> 写回（CopyOut）。这里的写回仍发生在 NPU 一侧，不等同于把结果复制回主机，也不自动释放 UB 缓冲区。'
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
      desc: '<strong>初始状态：</strong> 输入 <code>x = [10, 20, 30, 40]</code> 和 <code>y = [1, 2, 3, 4]</code> 已放在 NPU 的全局存储（GM）中。片上工作台（UB）还没有输入，输出中的 <code>?</code> 表示尚未写入本次结果。',
      gmZoneActive: true,
      ubZoneActive: false,
      mte2Active: false,
      mte3Active: false,
      mte2Text: '🚚 搬入通道：待命',
      mte3Text: '🚛 写回通道：待命',
      xLocalVals: ['--', '--', '--', '--'],
      yLocalVals: ['--', '--', '--', '--'],
      zLocalVals: ['--', '--', '--', '--'],
      zGmVals: ['?', '?', '?', '?'],
      vectorStatus: '⏳ 计算单元：等待工作台准备好输入',
      xLocalHighlight: false,
      zLocalComputed: false,
      zGmComputed: false
    },
    '1': {
      desc: '<strong>第一步：搬入完成后（CopyIn）。</strong> 两组输入已从大仓库（GM）复制到工作台（UB）。此时还没有相加；大仓库里的原始输入仍然保留。图中只展示 4 个数，代码为理解过程的伪代码。',
      gmZoneActive: true,
      ubZoneActive: true,
      mte2Active: true,
      mte3Active: false,
      mte2Text: '🚚 搬入已完成：两组输入已复制到工作台 ↓',
      mte3Text: '🚛 写回通道：待命',
      xLocalVals: ['10', '20', '30', '40'],
      yLocalVals: ['1', '2', '3', '4'],
      zLocalVals: ['--', '--', '--', '--'],
      zGmVals: ['?', '?', '?', '?'],
      vectorStatus: '📦 输入已就位，还没有进行加法',
      xLocalHighlight: true,
      zLocalComputed: false,
      zGmComputed: false
    },
    '2': {
      desc: '<strong>第二步：计算完成后（Compute）。</strong> 向量计算单元把对应位置的数字相加，工作台（UB）中的结果变成 <code>[11, 22, 33, 44]</code>。<strong>大仓库（GM）中的输出还没有更新。</strong> 先找出两处输出的不同，再继续。',
      gmZoneActive: false,
      ubZoneActive: true,
      mte2Active: false,
      mte3Active: false,
      mte2Text: '🚚 搬入通道：空闲',
      mte3Text: '🚛 写回通道：等待写回结果',
      xLocalVals: ['10', '20', '30', '40'],
      yLocalVals: ['1', '2', '3', '4'],
      zLocalVals: ['11', '22', '33', '44'],
      zGmVals: ['?', '?', '?', '?'],
      vectorStatus: '⚡ 计算已完成：工作台上的结果是 [11, 22, 33, 44]',
      xLocalHighlight: false,
      zLocalComputed: true,
      zGmComputed: false
    },
    '3': {
      desc: '<strong>第三步：写回完成后（CopyOut）。</strong> 工作台（UB）中的结果已复制到 NPU 大仓库（GM）的输出位置，那里也变成 <code>[11, 22, 33, 44]</code>。这一步没有把结果复制回主机，也没有自动释放 UB 空间。',
      gmZoneActive: true,
      ubZoneActive: true,
      mte2Active: false,
      mte3Active: true,
      mte2Text: '🚚 搬入通道：空闲',
      mte3Text: '🚛 写回已完成：[11, 22, 33, 44] 已复制到设备大仓库 ↑',
      xLocalVals: ['10', '20', '30', '40'],
      yLocalVals: ['1', '2', '3', '4'],
      zLocalVals: ['11', '22', '33', '44'],
      zGmVals: ['11', '22', '33', '44'],
      vectorStatus: '✅ 三步完成：设备大仓库中的输出已更新',
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
      cb.setAttribute('aria-pressed', active ? 'true' : 'false');
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
      vecEl.classList.toggle('pulse-active', stepStr === '2');
    }

    renderChips('vals-x-local', cfg.xLocalVals);
    renderChips('vals-y-local', cfg.yLocalVals);
    renderChips('vals-z-local', cfg.zLocalVals);
    renderChips('vals-z-gm', cfg.zGmVals);

    // Dynamic Capsule Animation
    triggerSandBoxFlyingCapsules(stepStr);

    if (xRow) xRow.classList.toggle('row-highlight', cfg.xLocalHighlight);
    if (yRow) yRow.classList.toggle('row-highlight', cfg.xLocalHighlight);
    if (zLocalRow) zLocalRow.classList.toggle('row-computed', cfg.zLocalComputed);
    if (zGmRow) zGmRow.classList.toggle('row-computed', cfg.zGmComputed);

    if (statusBox) {
      statusBox.innerHTML = cfg.desc;
    }
  }

  function triggerSandBoxFlyingCapsules(stepStr) {
    const stage = document.querySelector('.chip-stage');
    if (!stage) return;
    let layer = stage.querySelector('.flying-capsule-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'flying-capsule-layer';
      stage.appendChild(layer);
    }
    layer.innerHTML = '';

    if (stepStr === '1') {
      // GM -> UB CopyIn animation
      const gmRow = document.getElementById('sim-gm-zone');
      const ubRow = document.getElementById('sim-ub-zone');
      if (!gmRow || !ubRow) return;
      
      const values = ['[10, 20, 30, 40]', '[1, 2, 3, 4]'];
      values.forEach((v, i) => {
        const cap = document.createElement('div');
        cap.className = 'moving-capsule cap-copyin';
        cap.textContent = v;
        cap.style.top = `${35 + i * 36}px`;
        cap.style.left = '40px';
        layer.appendChild(cap);

        requestAnimationFrame(() => {
          cap.style.opacity = '1';
          cap.style.transform = `translateY(${190 + i * 15}px) scale(1.05)`;
        });

        setTimeout(() => {
          cap.style.opacity = '0';
          setTimeout(() => cap.remove(), 350);
        }, 650);
      });
    } else if (stepStr === '2') {
      // Compute shake animation on UB
      const zLocalRow = document.getElementById('row-z-local');
      if (zLocalRow) {
        zLocalRow.classList.remove('anim-combine');
        void zLocalRow.offsetWidth;
        zLocalRow.classList.add('anim-combine');
      }
    } else if (stepStr === '3') {
      // UB -> GM CopyOut animation
      const cap = document.createElement('div');
      cap.className = 'moving-capsule cap-copyout';
      cap.textContent = '[11, 22, 33, 44]';
      cap.style.top = '280px';
      cap.style.left = '50px';
      layer.appendChild(cap);

      requestAnimationFrame(() => {
        cap.style.opacity = '1';
        cap.style.transform = 'translateY(-175px) scale(1.05)';
      });

      setTimeout(() => {
        cap.style.opacity = '0';
        setTimeout(() => cap.remove(), 350);
      }, 650);
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
    applySimStep('0');

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
      summary: '<strong>串行示意：共 9 拍。</strong> 假设每块数据的搬入、计算、写回各耗时 1 拍，按顺序完成一块后再处理下一块，3 块共需 9 拍。这是一种执行安排，并非错误结果。'
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
      summary: '<strong>理想重叠示意：共 5 拍。</strong> 假设各阶段都耗时 1 拍，缓冲区与同步已安排好，且没有额外资源争用。第 3 拍同时写回块0、计算块1、搬入块2。<strong>同一块仍需先搬入、再计算、后写回。</strong> 5 拍是这些假设下的结果，不会仅因代码分成三个阶段而自动实现；实际收益还取决于各阶段耗时。'
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

  // =========================================================================
  // 7. Optional local learning record (only these four lesson fields)
  // =========================================================================
  const learningFieldNames = ['device-id', 'device-model', 'device-memory', 'reflection'];
  const learningFields = Array.from(document.querySelectorAll('[data-learning-field]'))
    .filter((field) => learningFieldNames.includes(field.getAttribute('data-learning-field')));
  const learningSaveStatus = document.getElementById('learning-save-status');
  const learningStorageKey = 'lesson-0001-learning-record-v1';

  function showLearningSaveStatus(message) {
    if (learningSaveStatus) learningSaveStatus.textContent = message;
  }

  if (learningFields.length > 0) {
    try {
      const saved = localStorage.getItem(learningStorageKey);
      if (saved) {
        const record = JSON.parse(saved);
        if (!record || typeof record !== 'object' || Array.isArray(record)) {
          throw new Error('Invalid learning record');
        }
        learningFields.forEach((field) => {
          const value = record[field.getAttribute('data-learning-field')];
          if (typeof value === 'string') field.value = value;
        });
        showLearningSaveStatus('已恢复本机浏览器中的学习记录，请对照实际输出自行核对。');
      } else {
        showLearningSaveStatus('填写后自动保存在本机浏览器中，请对照实际输出自行核对。');
      }
    } catch {
      showLearningSaveStatus('暂时无法恢复本地记录。可以继续填写，并手工复制内容留存。');
    }

    learningFields.forEach((field) => {
      field.addEventListener('input', () => {
        const record = {};
        learningFields.forEach((entry) => {
          record[entry.getAttribute('data-learning-field')] = entry.value;
        });
        try {
          localStorage.setItem(learningStorageKey, JSON.stringify(record));
          showLearningSaveStatus('已保存在本机浏览器中，请对照实际输出自行核对。');
        } catch {
          showLearningSaveStatus('当前浏览器无法保存记录，请手工复制内容留存。');
        }
      });
    });
  }

  // =========================================================================
  // 8. Interactive Vector Operator Playground (Section 1)
  // =========================================================================
  function initOperatorDemo() {
    const playBtn = document.getElementById('op-play-btn');
    const resetBtn = document.getElementById('op-reset-btn');
    const cellsZ = document.querySelectorAll('.vector-cell.cell-z');
    const cellsX = document.querySelectorAll('.vector-cell.cell-x');
    const cellsY = document.querySelectorAll('.vector-cell.cell-y');
    const statusText = document.getElementById('op-status-text');
    if (!playBtn || cellsZ.length === 0) return;

    const results = ['11', '22', '33', '44'];
    let timer = null;

    function resetDemo() {
      if (timer) clearInterval(timer);
      cellsZ.forEach((c) => {
        c.textContent = '?';
        c.classList.remove('anim-combine');
      });
      cellsX.forEach((c) => c.classList.remove('anim-combine'));
      cellsY.forEach((c) => c.classList.remove('anim-combine'));
      if (statusText) statusText.innerHTML = '点击<strong>“演示相加”</strong>，直观观察 4 对数字如何一对一就地合成。';
      playBtn.removeAttribute('disabled');
    }

    function runDemo() {
      resetDemo();
      playBtn.setAttribute('disabled', 'true');
      let idx = 0;
      if (statusText) statusText.innerHTML = '⚡ 向量计算单元工作中：逐位置并行相加...';

      timer = setInterval(() => {
        if (idx >= 4) {
          clearInterval(timer);
          if (statusText) statusText.innerHTML = '✅ <strong>相加完成：</strong> 对应位置相加生成结果向量 <code>z = [11, 22, 33, 44]</code>。';
          playBtn.removeAttribute('disabled');
          return;
        }
        cellsX[idx].classList.add('anim-combine');
        cellsY[idx].classList.add('anim-combine');
        cellsZ[idx].textContent = results[idx];
        cellsZ[idx].classList.add('anim-combine');
        idx++;
      }, 350);
    }

    playBtn.addEventListener('click', runDemo);
    if (resetBtn) resetBtn.addEventListener('click', resetDemo);
  }
  initOperatorDemo();

  // =========================================================================
  // 9. Host-Device PCIe Interaction (Section 2)
  // =========================================================================
  function initHostDeviceDemo() {
    const triggerBtn = document.getElementById('hd-trigger-btn');
    const packet = document.getElementById('bus-packet-indicator');
    const hostBox = document.getElementById('hd-host-box');
    const deviceBox = document.getElementById('hd-device-box');
    const hdStatus = document.getElementById('hd-status-text');
    if (!triggerBtn || !packet) return;

    triggerBtn.addEventListener('click', () => {
      triggerBtn.setAttribute('disabled', 'true');
      packet.className = 'bus-packet';
      if (hostBox) hostBox.classList.add('active-entity');
      if (deviceBox) deviceBox.classList.remove('active-entity');
      if (hdStatus) hdStatus.innerHTML = '① <strong>Host (CPU)</strong> 组织数据，下达计算任务指令...';

      setTimeout(() => {
        packet.classList.add('fly-forward');
        if (hdStatus) hdStatus.innerHTML = '② 指令与地址信息沿 PCIe 总线高速发送到 <strong>Device</strong>...';
      }, 400);

      setTimeout(() => {
        if (hostBox) hostBox.classList.remove('active-entity');
        if (deviceBox) deviceBox.classList.add('active-entity');
        if (hdStatus) hdStatus.innerHTML = '③ <strong>Device (NPU)</strong> 车间全速运转，专属计算单元并发完成加法...';
      }, 1400);

      setTimeout(() => {
        packet.className = 'bus-packet fly-backward';
        if (hdStatus) hdStatus.innerHTML = '④ 计算完成信号沿总线回弹给 Host。';
      }, 2300);

      setTimeout(() => {
        if (deviceBox) deviceBox.classList.remove('active-entity');
        triggerBtn.removeAttribute('disabled');
        if (hdStatus) hdStatus.innerHTML = '✅ <strong>协同完毕：</strong> Host 统筹调度，Device 高效计算。';
      }, 3100);
    });
  }
  initHostDeviceDemo();

  // =========================================================================
  // 10. Gantt Timeline Playhead Scrubber (Optional C)
  // =========================================================================
  function initGanttPlayhead() {
    const playGanttBtn = document.getElementById('gantt-play-btn');
    const grid = document.querySelector('.gantt-grid');
    if (!playGanttBtn || !grid) return;

    let line = grid.querySelector('.gantt-playhead-line');
    if (!line) {
      line = document.createElement('div');
      line.className = 'gantt-playhead-line';
      grid.appendChild(line);
    }

    let timer = null;
    playGanttBtn.addEventListener('click', () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
        playGanttBtn.textContent = '▶ 动态跑时间轴 (T1~T5)';
        line.style.opacity = '0';
        document.querySelectorAll('.gantt-slot').forEach((s) => s.classList.remove('pulse-slot'));
        return;
      }

      playGanttBtn.textContent = '⏸ 停止时间轴';
      line.style.opacity = '1';
      let beat = 0;
      const totalBeats = 5;

      function highlightBeat(b) {
        document.querySelectorAll('.gantt-slot').forEach((s) => s.classList.remove('pulse-slot'));
        const rows = document.querySelectorAll('.gantt-slots');
        rows.forEach((r) => {
          const slot = r.children[b];
          if (slot && slot.textContent.trim() && slot.textContent.trim() !== '·') {
            slot.classList.add('pulse-slot');
          }
        });
        const pct = (b / (totalBeats - 0.2)) * 80 + 12;
        line.style.left = `${pct}%`;
      }

      highlightBeat(0);
      timer = setInterval(() => {
        beat++;
        if (beat >= totalBeats) {
          clearInterval(timer);
          timer = null;
          playGanttBtn.textContent = '▶ 动态跑时间轴 (T1~T5)';
          setTimeout(() => {
            line.style.opacity = '0';
            document.querySelectorAll('.gantt-slot').forEach((s) => s.classList.remove('pulse-slot'));
          }, 800);
          return;
        }
        highlightBeat(beat);
      }, 900);
    });
  }
  initGanttPlayhead();
});
