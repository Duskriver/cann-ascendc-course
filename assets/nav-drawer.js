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
      desc: "<strong>Host</strong> 指主机 CPU 一侧，负责组织任务、准备数据并发起计算；<strong>Device</strong> 指昇腾 NPU 一侧，执行所分配的计算任务。主机内存与设备内存之间的传输，和 NPU 内部 GM 与 UB 之间的搬运是两个层次。"
    },
    {
      term: "CANN",
      en: "Compute Architecture for Neural Networks",
      badge: "软件栈中间件",
      desc: "华为面向昇腾的异构计算软件栈，连接上层 AI 框架与底层硬件，提供编译、运行时、算子库及开发工具。本课先将它理解为组织和执行 NPU 任务的软件支持。"
    },
    {
      term: "AI Core",
      en: "DaVinci Core",
      badge: "硬件执行单元",
      desc: "昇腾 NPU 的计算核心。本课程用 Vector（向量）、Cube（矩阵）和 Scalar（标量）说明计算与控制分工；不同芯片的单元组织方式和存储配置有所不同，具体以目标型号文档为准。"
    },
    {
      term: "Cube 单元",
      en: "Cube Unit",
      badge: "计算部件",
      desc: "用于矩阵乘加的硬件单元。例如将 M × K 的矩阵与 K × N 的矩阵相乘，得到 M × N 的结果。支持的分块形状、数据类型和吞吐能力依芯片型号而定；第一课作为选读。"
    },
    {
      term: "Vector 单元",
      en: "Vector Unit",
      badge: "计算部件",
      desc: "用于对一批数据执行向量计算，可组合实现元素级运算、激活和归一化等算子。本课的向量加法先把输入搬入 UB，再调用计算接口；这不表示只能处理一维形状的张量。"
    },
    {
      term: "Scalar 单元",
      en: "Scalar Unit",
      badge: "控制部件",
      desc: "负责标量计算和流程控制，例如循环计数、地址计算与条件分支。第一课只需认识它承担控制工作，不要求掌握其指令细节。"
    },
    {
      term: "Global Memory (GM)",
      en: "Global Memory / HBM / DDR",
      badge: "片外大容量显存",
      desc: "设备侧的全局内存，位于计算核心之外，用于存放输入输出等数据。物理存储介质可为 HBM 或 DDR，容量依设备型号而定。本课的向量计算接口使用 UB 中的数据，因此先将输入从 GM 搬入 UB。"
    },
    {
      term: "Unified Buffer (UB)",
      en: "Unified Buffer",
      badge: "片上高速暂存空间",
      desc: "用于向量计算的片上高速暂存空间，容量依芯片型号而定。在本课的向量加法中，输入先从 GM 搬入 UB，计算结果也先留在 UB，再写回 GM。它不是主机内存，也不等同于 CPU 自动管理的缓存。"
    },
    {
      term: "L1 / L0",
      en: "L1 / L0 Buffer",
      badge: "片上存储层级 · 选读",
      desc: "矩阵计算相关的片上存储层级，用来暂存输入与中间结果；L0 常按输入或累加结果分为 L0A、L0B、L0C。具体数据通路和容量依芯片型号而定，留待矩阵算子课程展开。"
    },
    {
      term: "MTE (搬运引擎)",
      en: "Memory Transfer Engine",
      badge: "DMA 硬件管线",
      desc: "负责不同存储位置之间数据搬运的硬件引擎。本课用 MTE2 表示 GM → UB 的搬入、MTE3 表示 UB → GM 的写回。搬运与计算可以重叠，但需要正确安排缓冲与同步；具体通路依芯片型号而定。"
    },
    {
      term: "Ascend C",
      en: "Ascend C Language",
      badge: "编程接口规范",
      desc: "用于昇腾算子开发的 C/C++ 编程语言与接口体系。本课程从向量编程范式入门，通过搬运、计算、内存管理与同步接口组织核函数；不把一种范式视为所有设备和算子的唯一写法。"
    },
    {
      term: "Tiling (切片)",
      en: "Tiling Algorithm",
      badge: "Host 侧调度策略",
      desc: "根据数据形状和硬件资源制定切分策略，包括多核任务分配和核内分块。每个核可在一次核函数执行中循环处理多个数据块；第一课先理解“工作台有限，需要分批处理”。"
    },
    {
      term: "TPipe & TQue",
      en: "TPipe & TQue",
      badge: "管道与消息队列",
      desc: "Ascend C 流水编程范式中的资源和队列管理接口。TPipe 管理相关资源，TQue 用于阶段间的数据传递与同步。开发者仍需正确安排入队、出队、缓冲分配与释放；实现重叠还取决于缓冲配置和数据依赖。"
    }
  ];

  const CHEATSHEET_HTML = `
    <div class="drawer-sec">
      <div class="drawer-sec-title">1. 本课向量加法数据流（简化示意）</div>
      <pre style="background:#1a1a1a; color:#eee; padding:0.8rem; border-radius:4px; font-size:0.75rem; overflow-x:auto; line-height:1.45;">
+─────────────────────────────────────────────+
| HOST CPU: 发起算子指令与 Tiling 下发        |
+─────────────────────────────────────────────+
                      │ 任务下发 / 主机与设备间传输
                      ▼
+─────────────────────────────────────────────+
| DEVICE (昇腾 NPU)                           |
|   [ Global Memory (GM) ] 设备侧全局内存     |
|         │ (MTE2 搬入)        ▲ (MTE3 写回)  |
|         ▼                    │              |
|   +─────────────────────────────────────+   |
|   │ AI CORE:                            │   |
|   │   ┌─────────────────────────────┐   │   |
|   │   │ Unified Buffer (UB 暂存空间)│   │   |
|   │   └──────────────┬──────────────┘   │   |
|   │                  ▼ (读写片上数据)   │   |
|   │   ┌──────────────┴──────────────┐   │   |
|   │   │ Vector 向量计算单元         │   │   |
|   │   └─────────────────────────────┘   │   |
|   │   Scalar 标量单元 (循环/指针调度)   │   |
|   +─────────────────────────────────────+   |
+─────────────────────────────────────────────+
      </pre>
      <p style="font-size:0.84rem;">GM ↔ UB 的搬运发生在设备一侧；CopyOut 写回 NPU 的 GM，不代表结果已传回 Host。上图省略矩阵计算通路，具体单元组织和容量依芯片型号而定。</p>
    </div>

    <div class="drawer-sec">
      <div class="drawer-sec-title">2. 典型向量加法的三个阶段</div>
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
            <td style="padding:4px;">GM ➔ UB<br><code>DataCopy(inLocal, inGlobal, size)</code></td>
          </tr>
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:4px;"><strong>2. Compute</strong></td>
            <td style="padding:4px;">Vector</td>
            <td style="padding:4px;">片上就地运算<br><code>Add(outLocal, inLocal1, inLocal2, size)</code></td>
          </tr>
          <tr>
            <td style="padding:4px;"><strong>3. CopyOut</strong></td>
            <td style="padding:4px;">MTE3</td>
            <td style="padding:4px;">UB ➔ GM<br><code>DataCopy(outGlobal, outLocal, size)</code></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="drawer-sec">
      <div class="drawer-sec-title">3. 后续课选读：优化前提</div>
      <ul style="font-size:0.84rem; padding-left:1.2rem; margin:0.3rem 0; line-height:1.6;">
        <li><strong>对齐要求：</strong> 搬运接口常有地址和长度对齐要求（如 32 字节）；应按所用接口、数据类型与目标芯片核对。</li>
        <li><strong>计算搬运重叠：</strong> 双缓冲为不同数据块的搬运与计算提供并行空间，还需正确同步；收益受各阶段耗时与带宽等因素影响。</li>
        <li><strong>定位瓶颈：</strong> 向量加法可能受访存带宽限制；具体瓶颈需要结合数据规模、实现方式与测量结果判断。</li>
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
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dialog.close();
      });
    }

    // Light-dismiss: click on backdrop outside dialog content box closes the drawer
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
