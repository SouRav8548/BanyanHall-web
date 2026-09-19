import { useState, useEffect } from 'react';

export default function MealCountdownTimer({ deadlineHour = 21 }) { // Default deadline: Rat 9:00 PM (21:00)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isClosed: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(deadlineHour, 0, 0, 0); // Ajker diner deadline set kora holo

      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isClosed: true });
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ hours, minutes, seconds, isClosed: false });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [deadlineHour]);

  if (timeLeft.isClosed) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold shadow-sm">
        <i className="fas fa-lock text-rose-400"></i>
        <span>Meal change window is closed for today!</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold shadow-sm">
      <i className="fas fa-clock animate-pulse text-emerald-500"></i>
      <span>
        Meal window closes in: <strong className="text-slate-900 dark:text-white font-black">{timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</strong>
      </span>
    </div>
  );
}