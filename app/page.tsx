"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Timer, Trophy, ArrowRight, Lightbulb } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type Difficulty = "easy" | "medium" | "hard";
type Operation = "+" | "-" | "*" | "/";

interface Question {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
}

const QUESTIONS_PER_GAME = 10;

const generateQuestion = (difficulty: Difficulty): Question => {
  const operations: Operation[] = ["+", "-", "*", "/"];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let num1: number, num2: number;

  switch (difficulty) {
    case "easy":
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      break;
    case "medium":
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 25) + 1;
      break;
    case "hard":
      num1 = Math.floor(Math.random() * 100) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      break;
  }

  // Ensure division results in whole numbers
  if (operation === "/") {
    num1 = num2 * (Math.floor(Math.random() * 10) + 1);
  }

  let answer: number;
  switch (operation) {
    case "+":
      answer = num1 + num2;
      break;
    case "-":
      answer = num1 - num2;
      break;
    case "*":
      answer = num1 * num2;
      break;
    case "/":
      answer = num1 / num2;
      break;
  }

  return { num1, num2, operation, answer };
};

const generateMCQOptions = (answer: number): number[] => {
  const options: Set<number> = new Set([answer]);
  let attempts = 0; // Safety limit to avoid infinite loops

  while (options.size < 4 && attempts < 100) {
    let offset = Math.floor(Math.random() * 5) + 1;
    if (Math.random() > 0.5) offset = -offset;

    const option = answer + offset;
    if (option > 0) options.add(option);

    attempts++;
  }

  // Convert Set to Array and shuffle properly
  return [...options].sort(() => 0.5 - Math.random());
};

export default function Home() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [mcqOptions, setMcqOptions] = useState<number[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!gameStartTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - gameStartTime);
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [gameStartTime]);

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setScore(0);
    setQuestionNumber(0);
    setGameStartTime(Date.now());
    setGameComplete(false);
    setGameEndTime(null);
    setShowHint(false);
    generateNewQuestion(selectedDifficulty);
  };

  const generateNewQuestion = (diff: Difficulty) => {
    const newQuestion = generateQuestion(diff);
    setCurrentQuestion(newQuestion);
    setUserAnswer("");
    setQuestionNumber((prev) => prev + 1);
    setShowHint(false);
    setMcqOptions(generateMCQOptions(newQuestion.answer));
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !difficulty) return;

    const numericAnswer = Number(userAnswer);
    if (isNaN(numericAnswer)) {
      console.error("Error: userAnswer is not a valid number", userAnswer);
      return;
    }

    if (numericAnswer === currentQuestion.answer) {
      setScore((prev) => prev + 1);
    }

    if (questionNumber < QUESTIONS_PER_GAME) {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Async wait to prevent UI freeze
      try {
        generateNewQuestion(difficulty);
      } catch (error) {
        console.error("Error generating new question:", error);
      }
    } else {
      setGameComplete(true);
      setGameEndTime(Date.now());
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!difficulty) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300 relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-auto w-[50rem] h-[30rem] bg-gradient-to-r from-primary/20 to-secondary/20 blur-[128px] rounded-full" />
        </div>
        <ThemeToggle />
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-lg p-8 space-y-8 bg-card/50 backdrop-blur-xl border-muted">
            <div className="text-center space-y-4">
              <Brain className="w-16 h-16 mx-auto text-primary animate-pulse" />
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                Number Rush
              </h1>
              <p className="text-muted-foreground">
                Choose your difficulty level to begin
              </p>
            </div>

            <div className="grid gap-4">
              <Button
                onClick={() => startGame("easy")}
                className="h-16 text-lg bg-emerald-500/80 hover:bg-emerald-500 backdrop-blur-sm"
              >
                Easy
              </Button>
              <Button
                onClick={() => startGame("medium")}
                className="h-16 text-lg bg-amber-500/80 hover:bg-amber-500 backdrop-blur-sm"
              >
                Medium
              </Button>
              <Button
                onClick={() => startGame("hard")}
                className="h-16 text-lg bg-rose-500/80 hover:bg-rose-500 backdrop-blur-sm"
              >
                Hard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    const timeTaken =
      gameEndTime && gameStartTime ? gameEndTime - gameStartTime : 0;

    return (
      <div className="min-h-screen bg-background transition-colors duration-300 relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-auto w-[50rem] h-[30rem] bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-[128px] rounded-full" />
        </div>
        <ThemeToggle />
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-lg p-8 space-y-8 bg-card/50 backdrop-blur-xl border-muted">
            <div className="text-center space-y-4">
              <Trophy className="w-16 h-16 mx-auto text-yellow-500 animate-bounce" />
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500">
                Game Complete!
              </h1>
              <div className="space-y-2">
                <p className="text-xl font-semibold">
                  Final Score: {score}/{QUESTIONS_PER_GAME}
                </p>
                <p className="text-muted-foreground">
                  Time taken: {formatTime(timeTaken)}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setDifficulty(null)}
              className="w-full h-12 text-lg bg-primary/80 hover:bg-primary backdrop-blur-sm"
            >
              Play Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 relative">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute inset-auto w-[50rem] h-[30rem] bg-gradient-to-r from-primary/20 to-secondary/20 blur-[128px] rounded-full" />
      </div>
      <ThemeToggle />
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg p-8 space-y-6 bg-card/50 backdrop-blur-xl border-muted">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Question</p>
              <p className="text-xl font-bold">
                {questionNumber}/{QUESTIONS_PER_GAME}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHint(true)}
              className="rounded-full w-10 h-10 hover:bg-primary/10"
              disabled={showHint}
            >
              <Lightbulb
                className={`w-5 h-5 ${
                  showHint ? "text-yellow-500" : "text-muted-foreground"
                }`}
              />
            </Button>
            <div className="space-y-1 text-right">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-xl font-bold">{score}</p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              <span>{currentQuestion?.num1}</span>
              <span>{currentQuestion?.operation}</span>
              <span>{currentQuestion?.num2}</span>
              <span>=</span>
            </div>

            {!showHint ? (
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-32 mx-auto text-center text-2xl p-2 bg-background border-2 border-primary/20 rounded-md focus:border-primary focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {mcqOptions.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      setUserAnswer(option.toString());
                      handleSubmit();
                    }}
                    className="h-12 text-lg bg-primary/10 hover:bg-primary/20 backdrop-blur-sm"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {!showHint && (
            <Button
              onClick={handleSubmit}
              className="w-full h-12 text-lg bg-primary/80 hover:bg-primary backdrop-blur-sm"
              disabled={!userAnswer}
            >
              Next Question <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}

          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Timer className="w-5 h-5" />
            <span>{gameStartTime && formatTime(elapsedTime)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
