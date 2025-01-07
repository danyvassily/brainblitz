import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const answerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function QuestionCard({
  question,
  answers,
  selectedAnswer,
  onAnswerSelect,
  isAnswered,
  correctAnswer,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{question}</CardTitle>
          <CardDescription>
            Choisissez la bonne réponse parmi les propositions suivantes
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {answers.map((answer, index) => (
            <motion.div
              key={index}
              variants={answerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant={
                  isAnswered
                    ? answer === correctAnswer
                      ? "success"
                      : answer === selectedAnswer
                      ? "destructive"
                      : "outline"
                    : selectedAnswer === answer
                    ? "secondary"
                    : "outline"
                }
                className={cn(
                  "w-full justify-start text-left font-normal",
                  isAnswered && "cursor-default"
                )}
                onClick={() => !isAnswered && onAnswerSelect(answer)}
                disabled={isAnswered}
              >
                <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                {answer}
              </Button>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
} 