import { useEffect, useState } from "react";
import { Progress } from "../ui/progress";
import { motion } from "framer-motion";

export function GameTimer({ duration, onTimeUp, isAnswered }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const progress = (timeLeft / duration) * 100;

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    if (isAnswered) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 10));
    }, 10);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp, isAnswered]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span>Temps restant</span>
        <motion.span
          key={timeLeft}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="tabular-nums"
        >
          {(timeLeft / 1000).toFixed(1)}s
        </motion.span>
      </div>
      <Progress
        value={progress}
        className={`h-2 ${
          progress < 30
            ? "bg-destructive/20 [&>div]:bg-destructive"
            : progress < 60
            ? "bg-warning/20 [&>div]:bg-warning"
            : "bg-success/20 [&>div]:bg-success"
        }`}
      />
    </div>
  );
} 