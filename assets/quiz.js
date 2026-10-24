/**
 * Shared Interactive Quiz & Simulator Component for CANN Teaching Workspace
 * Modern Web Best Practices:
 * - Accessible Live Regions (aria-live="polite") for screen reader announcements
 * - ARIA state reflection (aria-current="step", aria-pressed)
 * - Safe event delegation
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize all declarative quizzes
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
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');

      function handleSelect() {
        // Clear previous state in this question
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
      }

      btn.addEventListener('click', handleSelect);
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      });
    });
  });

  // 2. Initialize interactive pipeline steps if present
  const simBtns = document.querySelectorAll('[data-sim-step]');
  if (simBtns.length > 0) {
    const nodes = document.querySelectorAll('[data-node-id]');
    const statusBox = document.getElementById('sim-status-text');
    if (statusBox) {
      statusBox.setAttribute('aria-live', 'polite');
    }

    simBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        simBtns.forEach((b) => {
          b.classList.remove('active');
          b.removeAttribute('aria-current');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-current', 'true');

        const activeNodeId = btn.getAttribute('data-target-node');
        const desc = btn.getAttribute('data-desc');

        nodes.forEach((n) => {
          if (n.getAttribute('data-node-id') === activeNodeId) {
            n.classList.add('active-node');
            n.setAttribute('aria-current', 'step');
          } else {
            n.classList.remove('active-node');
            n.removeAttribute('aria-current');
          }
        });

        if (statusBox && desc) {
          statusBox.innerHTML = desc;
        }
      });
    });
  }
});
