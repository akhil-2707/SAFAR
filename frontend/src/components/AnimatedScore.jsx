import React, { useState, useEffect } from 'react';

export default function AnimatedScore({ targetScore = 15, className = "" }) {
  const [displayScore, setDisplayScore] = useState(targetScore);

  useEffect(() => {
    let start = displayScore;
    let end = targetScore;
    if (start === end) return;

    let duration = 600; // ms
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.round(start + (end - start) * progress);
      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetScore]);

  return <span className={className}>{displayScore}</span>;
}
