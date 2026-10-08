"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  target: Date;
  className?: string;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function Countdown({ target, className = "" }: CountdownProps) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    const update = () => {
      setRemaining(Math.max(0, target.getTime() - Date.now()));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);

  const isUrgent = remaining > 0 && remaining < 60 * 60 * 1000; // < 1 hour

  return (
    <span
      className={`font-mono tabular-nums ${isUrgent ? "countdown-urgent" : ""} ${className}`}
      style={{ color: isUrgent ? "var(--red)" : "inherit" }}
    >
      {formatCountdown(remaining)}
    </span>
  );
}
