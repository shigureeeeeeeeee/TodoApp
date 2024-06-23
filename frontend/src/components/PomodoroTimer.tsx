import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TodoPomodoroTimerProps {
  todoId: string;
  initialWorkTime: number;
  initialBreakTime: number;
  isBreak: boolean;
  onTimerUpdate: (todoId: string, workTime: number, breakTime: number, currentTime: number, isBreak: boolean) => void;
}

const TodoPomodoroTimer: React.FC<TodoPomodoroTimerProps> = ({
  todoId,
  initialWorkTime,
  initialBreakTime,
  isBreak: initialIsBreak,
  onTimerUpdate
}) => {
  const [workTime, setWorkTime] = useState(initialWorkTime);
  const [breakTime, setBreakTime] = useState(initialBreakTime);
  const [timeLeft, setTimeLeft] = useState(initialIsBreak ? initialBreakTime : initialWorkTime);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(initialIsBreak);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          onTimerUpdate(todoId, workTime, breakTime, newTime, isBreak);
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsBreak(!isBreak);
      setTimeLeft(isBreak ? workTime : breakTime);
      onTimerUpdate(todoId, workTime, breakTime, isBreak ? workTime : breakTime, !isBreak);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isBreak, todoId, onTimerUpdate, workTime, breakTime]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(workTime);
    setIsBreak(false);
    onTimerUpdate(todoId, workTime, breakTime, workTime, false);
  };

  const handleWorkTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWorkTime = parseInt(e.target.value) * 60;
    setWorkTime(newWorkTime);
    if (!isBreak) {
      setTimeLeft(newWorkTime);
      onTimerUpdate(todoId, newWorkTime, breakTime, newWorkTime, isBreak);
    }
  };

  const handleBreakTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBreakTime = parseInt(e.target.value) * 60;
    setBreakTime(newBreakTime);
    if (isBreak) {
      setTimeLeft(newBreakTime);
      onTimerUpdate(todoId, workTime, newBreakTime, newBreakTime, isBreak);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="text-sm font-semibold">
          {isBreak ? 'Break: ' : 'Work: '}
          {formatTime(timeLeft)}
        </div>
        <Button size="sm" onClick={toggleTimer}>
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button size="sm" variant="outline" onClick={resetTimer}>
          Reset
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Label htmlFor="workTime">Work Time (min):</Label>
        <Input
          id="workTime"
          type="number"
          value={workTime / 60}
          onChange={handleWorkTimeChange}
          className="w-20"
          min="1"
        />
        <Label htmlFor="breakTime">Break Time (min):</Label>
        <Input
          id="breakTime"
          type="number"
          value={breakTime / 60}
          onChange={handleBreakTimeChange}
          className="w-20"
          min="1"
        />
      </div>
    </div>
  );
};

export default TodoPomodoroTimer;;