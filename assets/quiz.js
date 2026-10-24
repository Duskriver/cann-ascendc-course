/**
 * Shared Interactive Quiz & Feedback Component for CANN Teaching Workspace
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all declarative quizzes
  const questions = document.querySelectorAll('.quiz-question');
  questions.forEach((qEl) => {
    const correctIndex = parseInt(qEl.getAttribute('data-correct'), 10);
    const explainCorrect = qEl.getAttribute('data-explain-correct') || '回答正确！';
    const explainWrong = qEl.getAttribute('data-explain-wrong') || '再想一想：回顾上方的硬件数据流说明。';
    const options = qEl.querySelectorAll('.quiz-option');
    const feedback = qEl.querySelector('.quiz-feedback');

    options.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        // Clear previous state in this question
        options.forEach((b) => {
          b.classList.remove('correct', 'incorrect');
        });
        feedback.classList.remove('show-correct', 'show-incorrect');

        if (idx === correctIndex) {
          btn.classList.add('correct');
          feedback.textContent = '✓ ' + explainCorrect;
          feedback.classList.add('show-correct');
        } else {
          btn.classList.add('incorrect');
          feedback.textContent = '✗ ' + explainWrong;
          feedback.classList.add('show-incorrect');
        }
      });
    });
  });

  // Initialize interactive pipeline steps if present
  const simBtns = document.querySelectorAll('[data-sim-step]');
  if (simBtns.length > 0) {
    const nodes = document.querySelectorAll('[data-node-id]');
    const statusBox = document.getElementById('sim-status-text');

    simBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        simBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const activeNodeId = btn.getAttribute('data-target-node');
        const desc = btn.getAttribute('data-desc');

        nodes.forEach((n) => {
          if (n.getAttribute('data-node-id') === activeNodeId) {
            n.classList.add('active-node');
          } else {
            n.classList.remove('active-node');
          }
        });

        if (statusBox && desc) {
          statusBox.innerHTML = desc;
        }
      });
    });
  }
});
