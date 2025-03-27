"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import SupplementaryContent from "@/components/ContentDisplay";

const surveySchema = z.object({
  title: z.string().min(1, "Title is required"),
});

type SurveyFormData = z.infer<typeof surveySchema>;

interface Question {
  id: string;
  text: string;
}

interface Survey {
  id: string;
  title: string;
  questions: Question[];
}

export default function UserDashboard() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
  });

  // Watch the title field so we can control its value
  const titleValue = watch("title");

  const generateQuestions = async (title: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) throw new Error("Failed to generate questions");

      const data = await response.json();
      
      // Ensure we have questions in the response
      if (!data.success || !data.data || !data.data.questions || !Array.isArray(data.data.questions)) {
        throw new Error("Invalid questions data received");
      }
      


      // Create survey with the questions
      const surveyResponse = await fetch("/api/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          questions: data.data.questions,
        }),
      });

      if (!surveyResponse.ok) {
        const errorData = await surveyResponse.json();
        console.error("Survey creation error:", errorData);
        throw new Error("Failed to create survey: " + errorData.message);
      }

      const surveyData = await surveyResponse.json();
     
      
      setCurrentSurvey(surveyData.data);
      setQuestions(surveyData.data.questions);
      setAnswers(new Array(surveyData.data.questions.length).fill(""));
      toast.success("Questions generated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate questions"
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SurveyFormData) => {
    try {
      setIsLoading(true);
      await generateQuestions(data.title);
    } catch (error) {
      toast.error("Failed to create survey");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const submitAnswers = async () => {
    if (!currentSurvey) return;

    try {
      setIsLoading(true);
      
      // Map questions to required format with answers
      const responseData = {
        surveyId: currentSurvey.id,
        answers: answers.map((answer, index) => ({
          questionId: questions[index].id,
          text: answer,
        })),
      };
      
      
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(responseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Response submission error:", errorData);
        throw new Error("Failed to submit answers: " + errorData.message);
      }

      
      toast.success("Answers submitted successfully!");
      setQuestions([]);
      setAnswers([]);
      setCurrentSurvey(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit answers"
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Logout failed");

      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to logout");
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-8 pl-8 py-2">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white text-sm px-2 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
          <SupplementaryContent />
        </div>
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Survey Title
              </label>
              <input
                type="text"
                id="title"
                {...register("title")}
                value={titleValue || ""}
                onChange={(e) => setValue("title", e.target.value.toLowerCase())}
                className="mt-1 block w-full text-black px-2 py-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter your survey title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="flex space-x-4 items-center justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? "Generating..." : "Generate Questions"}
              </button>
            </div>
          </form>

          {questions.length > 0 && (
            <div className="mt-8 space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Questions
              </h2>
              {questions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    {question.text}
                  </p>
                  <textarea
                    value={answers[index]}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="mt-1 block text-black p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter your answer"
                    rows={3}
                  />
                </div>
              ))}
              <div className="flex justify-center">
                <button
                  onClick={submitAnswers}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? "Submitting..." : "Submit Answers"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
