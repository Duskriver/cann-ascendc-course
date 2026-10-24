/**
 * Navigation Drawer & Smart Theme Manager for CANN Teaching Workspace
 * Modern Web Best Practices:
 * - Native HTML5 <dialog> & Top Layer (Focus Trap, ESC dismiss, zero z-index conflicts)
 * - @starting-style & transition-behavior: allow-discrete for smooth top-layer animations
 * - Declarative closedby="any" with boundary coordinate fallback
 * - Modern dark-mode-toggle with tri-state persistence & system divergence alignment
 */

(function () {
  // Determine relative root path from current page location
  const isSubdir = window.location.pathname.includes('/lessons/') || window.location.pathname.includes('/reference/');
  const rootPrefix = isSubdir ? '../' : './';

  // Core Glossary Data
  const GLOSSARY_DATA = [
    {
      term: "Host 与 Device",
      en: "Host & Device",
      badge: "系统异构拓扑",
      desc: "<strong>Host</strong> 指运行通用操作系统 (Linux) 的主机 CPU，负责任务分发与流程控制；<strong>Device</strong> 指昇腾 NPU 硬件加速器，负责执行高密度并行计算。"
    },
    {
      term: "CANN",
      en: "Compute Architecture for Neural Networks",
      badge: "软件栈中间件",
      desc: "华为异构计算架构，向下屏蔽昇腾芯片硬件细节，向上支撑主流 AI 框架，提供驱动、Runtime、图引擎 (GE) 与统一算子库。"
    },
    {
      term: "AI Core",
      en: "DaVinci Core",
      badge: "硬件执行单元",
      desc: "昇腾 NPU 的核心计算引擎，内部集成了 Cube（矩阵）、Vector（向量）、Scalar（标量）三大计算单元及多级片上高速缓存。"
    },
    {
      term: "Cube 单元",
      en: "Cube Unit",
      badge: "计算部件",
      desc: "专用于大颗粒度矩阵乘法（M × K × N）硬件加速，单指令完成立方矩阵乘加运算，是大模型 Attention 和 MatMul 的核心主力。"
    },
    {
      term: "Vector 单元",
      en: "Vector Unit",
      badge: "计算部件",
      desc: "专用于一维向量/张量的并行运算，负责元素级加减乘除、激活函数（ReLU/GeLU）、归一化（LayerNorm/Softmax）等操作。"
    },
    {
      term: "Scalar 单元",
      en: "Scalar Unit",
      badge: "控制部件",
      desc: "执行常规标量计算与流程控制（循环计数、地址计算、分支跳转），扮演 AI Core 内部的微型调度大脑。"
    },
    {
      term: "Global Memory (GM)",
      en: "Global Memory / HBM",
      badge: "片外大容量显存",
      desc: "位于 AI Core 之外的高容量显存（数十 GB）。容量大但延迟高，AI Core 的计算单元<strong>无法直接在此处发起数学运算</strong>。"
    },
    {
      term: "Unified Buffer (UB)",
      en: "Unified Buffer",
      badge: "片上高速缓存",
      desc: "AI Core 内部专供 Vector 单元读写的片上高速暂存区（数百 KB）。数据必须由 GM 搬入 UB 才能被 Vector 单元直接计算。"
    },
    {
      term: "MTE (搬运引擎)",
      en: "Memory Transfer Engine",
      badge: "DMA 硬件管线",
      desc: "负责片外与片内（如 GM ↔ UB、GM ↔ L1/L0）异步数据搬运的专用硬件引擎，实现搬运与计算的流水线重叠。"
    },
    {
      term: "Ascend C",
      en: "Ascend C Language",
      badge: "编程接口规范",
      desc: "原生 C/C++ 风格的高性能算子开发语言，采用 SPMD（单程序多数据）编程模型，提供自动流水调度与 Tensor API。"
    },
    {
      term: "Tiling (切片)",
      en: "Tiling Algorithm",
      badge: "Host 侧调度策略",
      desc: "将全局显存中远超片上缓存容量的超大 Tensor，切分为若干适合单次核函数与单块 UB 缓存处理的数据块（Tile）的数学算法。"
    },
    {
      term: "TPipe & TQue",
      en: "TPipe & TQue",
      badge: "管道与消息队列",
      desc: "Ascend C 提供的片上数据流管理机制。通过队列在 CopyIn、Compute、CopyOut 之间传递临时缓存指针，硬件自动完成异步同步。"
    }
  ];

  const CHEATSHEET_HTML = `
    <div class="drawer-sec">
      <div class="drawer-sec-title">1. 达芬奇 AI Core 拓扑图</div>
      <pre style="background:#1a1a1a; color:#eee; padding:0.8rem; border-radius:4px; font-size:0.75rem; overflow-x:auto; line-height:1.45;">
+─────────────────────────────────────────────+
| HOST CPU: 发起算子指令与 Tiling 下发          |
+─────────────────────────────────────────────+
                      │ PCIe / HCCS
                      ▼
+─────────────────────────────────────────────+
| DEVICE (昇腾 NPU)                           |
|   [ Global Memory (GM) ] 片外大显存          |
|         │ (MTE2 搬入)        ▲ (MTE3 写回)  |
|         ▼                    │              |
|   +─────────────────────────────────────+   |
|   │ AI CORE:                            │   |
|   │   ┌─────────────────────────────┐   │   |
|   │   │ Unified Buffer (UB 片上缓存)│   │   |
|   │   └──────────────┬──────────────┘   │   |
|   │                  ▼ (单周期读写)     │   |
|   │   ┌──────────────┴──────────────┐   │   |
|   │   │ Vector (向量) / Cube (矩阵) │   │   |
|   │   └─────────────────────────────┘   │   |
|   │   Scalar 标量单元 (循环/指针调度)   │   |
|   +─────────────────────────────────────+   |
+─────────────────────────────────────────────+
      </pre>
    </div>

    <div class="drawer-sec">
      <div class="drawer-sec-title">2. Vector 三阶段流水线</div>
      <table style="font-size:0.82rem; width:100%; margin:0.5rem 0; border-collapse:collapse;">
        <caption>典型三阶段流水线调度表</caption>
        <thead>
          <tr style="border-bottom:1px solid var(--border);">
            <th scope="col" style="text-align:left; padding:4px;">阶段</th>
            <th scope="col" style="text-align:left; padding:4px;">单元</th>
            <th scope="col" style="text-align:left; padding:4px;">动作与典型 API</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:4px;"><strong>1. CopyIn</strong></td>
            <td style="padding:4px;">MTE2</td>
            <td style="padding:4px;">GM ➔ UB<br><code>DataCopy(inLocal, inGlobal)</code></td>
          </tr>
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:4px;"><strong>2. Compute</strong></td>
            <td style="padding:4px;">Vector</td>
            <td style="padding:4px;">片上就地运算<br><code>Add(outLocal, inL1, inL2)</code></td>
          </tr>
          <tr>
            <td style="padding:4px;"><strong>3. CopyOut</strong></td>
            <td style="padding:4px;">MTE3</td>
            <td style="padding:4px;">UB ➔ GM<br><code>DataCopy(outGlobal, outLocal)</code></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="drawer-sec">
      <div class="drawer-sec-title">3. 核心准则备忘</div>
      <ul style="font-size:0.84rem; padding-left:1.2rem; margin:0.3rem 0; line-height:1.6;">
        <li><strong>32 字节对齐：</strong> 搬运地址与数据切分尽量保持 32 字节整数倍。</li>
        <li><strong>计算搬运重叠：</strong> 采用 Double Buffer（双缓冲）实现流水掩盖。</li>
        <li><strong>Vector 算子瓶颈：</strong> 大多为 Memory Bound，受限于 GM ↔ UB 带宽。</li>
      </ul>
    </div>
  `;

  // =========================================================================
  // Theme Manager: System-aware tri-state dark mode toggle
  // =========================================================================
  function initTheme() {
    let metaEl = document.querySelector('meta[name="color-scheme"]');
    if (!metaEl) {
      metaEl = document.createElement('meta');
      metaEl.name = 'color-scheme';
      metaEl.content = 'light dark';
      document.head.appendChild(metaEl);
    }

    function getSystemTheme() {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function getEffectiveTheme() {
      const stored = localStorage.getItem('site-theme');
      if (stored === 'dark' || stored === 'light') return stored;
      return getSystemTheme();
    }

    function applyTheme(theme) {
      if (theme === 'dark' || theme === 'light') {
        document.documentElement.setAttribute('data-theme', theme);
        metaEl.content = theme;
      } else {
        document.documentElement.removeAttribute('data-theme');
        metaEl.content = 'light dark';
      }
      updateToggleButtons();
    }

    function toggleTheme() {
      const effective = getEffectiveTheme();
      const system = getSystemTheme();
      // Target is opposite of currently rendered scheme
      const target = effective === 'dark' ? 'light' : 'dark';

      // If user toggles to match system, undo override and clear storage
      if (target === system) {
        localStorage.removeItem('site-theme');
        applyTheme(null);
      } else {
        localStorage.setItem('site-theme', target);
        applyTheme(target);
      }
    }

    function updateToggleButtons() {
      const btns = document.querySelectorAll('.theme-toggle-btn');
      const effective = getEffectiveTheme();
      const isManual = localStorage.getItem('site-theme') !== null;
      btns.forEach((btn) => {
        btn.innerHTML = effective === 'dark' ? '🌙 暗色' : '☀️ 浅色';
        btn.title = `当前主题: ${effective}${isManual ? ' (已锁定)' : ' (跟随系统)'}，点击切换`;
        btn.setAttribute('aria-label', `切换主题，当前为${effective === 'dark' ? '深色' : '浅色'}`);
      });
    }

    // React to OS system changes if not manually overridden
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (localStorage.getItem('site-theme') === null) {
        applyTheme(null);
      }
    });

    // Apply stored on load
    applyTheme(localStorage.getItem('site-theme'));

    // Bind click events on any theme toggle button
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-toggle-btn');
      if (btn) {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  // =========================================================================
  // Native <dialog> Side Drawer Implementation
  // =========================================================================
  function initDrawer() {
    let dialog = document.getElementById('site-drawer-container');
    if (dialog) return dialog;

    dialog = document.createElement('dialog');
    dialog.id = 'site-drawer-container';
    dialog.className = 'drawer-dialog';
    dialog.setAttribute('closedby', 'any');
    dialog.setAttribute('aria-label', '全局辅助参考抽屉');

    dialog.innerHTML = `
      <header class="drawer-header">
        <div class="drawer-tabs">
          <button class="drawer-tab active" data-tab="glossary">📖 核心术语表</button>
          <button class="drawer-tab" data-tab="architecture">🗺️ 架构速查图</button>
        </div>
        <div class="drawer-actions">
          <a href="${rootPrefix}reference/glossary.html" class="drawer-external-link" id="drawer-standalone-link" title="全屏打开此参考页面" target="_blank" rel="noopener">全屏 ↗</a>
          <button class="drawer-close-btn" id="drawer-close-btn" title="关闭抽屉 (Esc)" aria-label="关闭抽屉">✕</button>
        </div>
      </header>

      <div class="drawer-search-bar" id="drawer-search-wrap">
        <input type="text" id="drawer-search-input" placeholder="🔍 快速过滤术语 (如 UB, GM, Vector...)" aria-label="搜索术语" />
      </div>

      <div class="drawer-body">
        <div class="drawer-tab-pane active" id="pane-glossary">
          <div class="drawer-term-list" id="drawer-term-list"></div>
        </div>
        <div class="drawer-tab-pane" id="pane-architecture">
          ${CHEATSHEET_HTML}
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Populate glossary
    renderGlossaryTerms('');

    // Search event
    const searchInput = dialog.querySelector('#drawer-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderGlossaryTerms(e.target.value);
      });
    }

    // Tab switching
    const tabs = dialog.querySelectorAll('.drawer-tab');
    const panes = dialog.querySelectorAll('.drawer-tab-pane');
    const standaloneLink = dialog.querySelector('#drawer-standalone-link');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        tabs.forEach((t) => t.classList.remove('active'));
        panes.forEach((p) => p.classList.remove('active'));

        tab.classList.add('active');
        const targetPane = dialog.querySelector(`#pane-${targetTab}`);
        if (targetPane) targetPane.classList.add('active');

        const searchWrap = dialog.querySelector('#drawer-search-wrap');
        if (targetTab === 'glossary') {
          if (searchWrap) searchWrap.style.display = 'block';
          if (standaloneLink) {
            standaloneLink.href = `${rootPrefix}reference/glossary.html`;
            standaloneLink.textContent = '全屏 ↗';
          }
        } else {
          if (searchWrap) searchWrap.style.display = 'none';
          if (standaloneLink) {
            standaloneLink.href = `${rootPrefix}reference/architecture-cheatsheet.html`;
            standaloneLink.textContent = '全屏 ↗';
          }
        }
      });
    });

    // Close button
    const closeBtn = dialog.querySelector('#drawer-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => dialog.close());
    }

    // Fallback light-dismiss for browsers without native <dialog closedby="any">
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isInside = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isInside) {
          dialog.close();
        }
      });
    }

    return dialog;
  }

  function renderGlossaryTerms(filterKeyword) {
    const termListEl = document.getElementById('drawer-term-list');
    if (!termListEl) return;

    const kw = (filterKeyword || '').trim().toLowerCase();
    const filtered = GLOSSARY_DATA.filter((item) => {
      if (!kw) return true;
      return (
        item.term.toLowerCase().includes(kw) ||
        item.en.toLowerCase().includes(kw) ||
        item.badge.toLowerCase().includes(kw) ||
        item.desc.toLowerCase().includes(kw)
      );
    });

    if (filtered.length === 0) {
      termListEl.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--ink-muted); font-size:0.85rem;">未找到与 "${filterKeyword}" 匹配的术语</div>`;
      return;
    }

    termListEl.innerHTML = filtered.map((item) => `
      <div class="drawer-term-item">
        <div class="drawer-term-header">
          <span class="drawer-term-title">${item.term}</span>
          <span class="drawer-term-badge">${item.badge}</span>
        </div>
        <div class="drawer-term-en">${item.en}</div>
        <div class="drawer-term-desc">${item.desc}</div>
      </div>
    `).join('');
  }

  function openDrawer(tabName, termToHighlight) {
    const dialog = initDrawer();
    if (!dialog) return;

    if (!dialog.open) {
      // Use native Top Layer modal
      dialog.showModal();
    }

    // Switch tab if specified
    if (tabName) {
      const tabBtn = dialog.querySelector(`.drawer-tab[data-tab="${tabName}"]`);
      if (tabBtn) tabBtn.click();
    }

    // Filter term if specified
    if (termToHighlight) {
      const searchInput = dialog.querySelector('#drawer-search-input');
      if (searchInput) {
        searchInput.value = termToHighlight;
        renderGlossaryTerms(termToHighlight);
      }
    }
  }

  function closeDrawer() {
    const dialog = document.getElementById('site-drawer-container');
    if (dialog && dialog.open) {
      dialog.close();
    }
  }

  // Intercept navigation links with drawer triggers
  function bindDrawerTriggers() {
    document.addEventListener('click', (e) => {
      // 1. Explicit data-drawer trigger
      const trigger = e.target.closest('[data-drawer]');
      if (trigger) {
        e.preventDefault();
        const tab = trigger.getAttribute('data-drawer');
        const term = trigger.getAttribute('data-term');
        openDrawer(tab, term);
        return;
      }

      // 2. Term chip click
      const termChip = e.target.closest('.term-chip');
      if (termChip) {
        e.preventDefault();
        const term = termChip.getAttribute('data-term') || termChip.textContent.trim();
        openDrawer('glossary', term);
        return;
      }

      // 3. Smart back button
      const smartBack = e.target.closest('[data-smart-back]');
      if (smartBack) {
        e.preventDefault();
        if (window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
          window.history.back();
        } else {
          window.location.href = smartBack.getAttribute('href') || `${rootPrefix}index.html`;
        }
      }
    });
  }

  // Auto initialize on DOM ready
  function initAll() {
    initTheme();
    bindDrawerTriggers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Expose global controller
  window.CourseDrawer = {
    open: openDrawer,
    close: closeDrawer
  };
})();
