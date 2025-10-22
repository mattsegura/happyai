export const animationPresets = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideInUp: 'animate-slide-in-up',
  slideOutDown: 'animate-slide-out-down',
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
  bounce: 'animate-bounce-in',
  pulse: 'animate-pulse-glow',
};

export const getModalAnimation = (isOpen: boolean) => {
  return isOpen
    ? 'animate-modal-enter'
    : 'animate-modal-exit';
};

export const getBackdropAnimation = (isOpen: boolean) => {
  return isOpen
    ? 'animate-backdrop-enter'
    : 'animate-backdrop-exit';
};

export const getCollapseAnimation = (isCollapsed: boolean) => {
  return isCollapsed
    ? 'animate-collapse'
    : 'animate-expand';
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const animateCounter = (
  start: number,
  end: number,
  duration: number,
  onUpdate: (value: number) => void
) => {
  const startTime = performance.now();
  const diff = end - start;

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    const current = start + diff * easeOutCubic;

    onUpdate(Math.round(current));

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

export const createConfetti = (containerElement: HTMLElement) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D'];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-particle';
    confetti.style.cssText = `
      position: fixed;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background-color: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}%;
      top: -10px;
      opacity: ${Math.random() * 0.7 + 0.3};
      transform: rotate(${Math.random() * 360}deg);
      animation: confetti-fall ${Math.random() * 2 + 2}s linear forwards;
      pointer-events: none;
      z-index: 10000;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;

    containerElement.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 4000);
  }
};

export const flyPointsToTarget = (
  startElement: HTMLElement,
  targetElement: HTMLElement,
  points: number,
  onComplete?: () => void
) => {
  const startRect = startElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();

  const pointsElement = document.createElement('div');
  pointsElement.className = 'flying-points';
  pointsElement.textContent = `+${points}`;
  pointsElement.style.cssText = `
    position: fixed;
    left: ${startRect.left + startRect.width / 2}px;
    top: ${startRect.top + startRect.height / 2}px;
    font-size: 24px;
    font-weight: bold;
    color: #FFD93D;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    pointer-events: none;
    z-index: 10000;
    animation: fly-to-target 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  `;

  const deltaX = targetRect.left + targetRect.width / 2 - (startRect.left + startRect.width / 2);
  const deltaY = targetRect.top + targetRect.height / 2 - (startRect.top + startRect.height / 2);

  pointsElement.style.setProperty('--target-x', `${deltaX}px`);
  pointsElement.style.setProperty('--target-y', `${deltaY}px`);

  document.body.appendChild(pointsElement);

  setTimeout(() => {
    pointsElement.remove();
    if (onComplete) onComplete();
  }, 1000);
};
