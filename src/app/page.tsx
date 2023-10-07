"use client";
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import quizAdventure from "@/assets/icons/undraw_adventure_4hum-1.svg";
import winnerImage from "@/assets/icons/undraw_winners_ao2o-2.svg";

interface QuizData {
  question: string;
  choices: string[];
  correctAnswer: string;
  image?: string;
}

const montserrat = Montserrat({
  weight: ["700", "500"],
  subsets: ["cyrillic"],
});

export default function Home() {
  const [quizData, setQuizData] = useState<QuizData>({
    question: "",
    choices: [],
    correctAnswer: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [resultCount, setResultCount] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    generateRandomQuiz();
  }, []);

  const generateRandomQuiz = () => {
    setIsLoading(true);

    const randomQuestionType = Math.floor(Math.random() * 2);

    fetch("https://restcountries.com/v3.1/all?fields=name,flags,capital")
      .then((response) => response.json())
      .then((data) => {
        const randomIndex = Math.floor(Math.random() * data.length);
        const randomCountry = data[randomIndex];

        let formattedQuizData: QuizData = {
          question: "",
          choices: [],
          correctAnswer: "",
        };
        if (randomQuestionType === 0) {
          formattedQuizData = {
            question: `Which country does this flag belong to?`,
            choices: [
              randomCountry.name.common,
              getRandomCountry(data),
              getRandomCountry(data),
              getRandomCountry(data),
            ],
            correctAnswer: randomCountry.name.common,
            image: randomCountry.flags.png,
          };
        } else {
          formattedQuizData = {
            question: `${randomCountry.name.common} is the capital of`,
            choices: [
              randomCountry.capital,
              getRandomCapital(data),
              getRandomCapital(data),
              getRandomCapital(data),
            ],
            correctAnswer: randomCountry.capital,
          };
        }

        formattedQuizData.choices = shuffleArray(formattedQuizData.choices);

        setQuizData(formattedQuizData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("API request failed:", error);
        setIsLoading(false);
      });
  };

  const shuffleArray = (array: string[]) => {
    const shuffledArray = array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  };

  const getRandomCountry = (allCountries: any[]) => {
    const randomIndex = Math.floor(Math.random() * allCountries.length);
    return allCountries[randomIndex].name.common;
  };

  const getRandomCapital = (allCountries: any[]) => {
    const randomIndex = Math.floor(Math.random() * allCountries.length);
    const capitalArray = allCountries[randomIndex].capital;

    if (Array.isArray(capitalArray) && capitalArray.length > 0) {
      return capitalArray[0];
    } else {
      return "There is no capital";
    }
  };

  const handleNextQuestion = () => {
    generateRandomQuiz();
    setIsCorrect(false);
    setShowResult(false);
  };

  const handleAnswerClick = (answer: string) => {
    setIsCorrect(true);
    setSelectedAnswer(answer);
    if (answer === quizData.correctAnswer) {
      setResultCount(resultCount + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleFinishQuiz = () => {
    setShowResult(true);
  };

  const handleTryAgain = () => {
    handleNextQuestion();
    setResultCount(0);
    setIsFinished(false);
  };

  useEffect(() => {
    console.log("Correct Answer:", quizData.correctAnswer);
  }, [quizData]);

  return (
    <main className="h-screen mx-auto max-w-[30rem] flex flex-col justify-center gap-5 px-2">
      <h1 className="uppercase text-2xl font-bold sm:text-4xl text-white">
        Country Quiz
      </h1>

      <section
        className={`animete-custom bg-white text-blue-500 px-8  rounded-3xl`}
      >
        {isLoading ? (
          <div className="animate-pulse h-96 flex flex-col items-center justify-center">
          <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
          {/* Agrega más elementos de esqueleto según sea necesario */}
        </div>
        ) : !showResult ? (
          <div className={`loaded-content pt-12 relative duration-500 `}>
            <Image
              className="absolute right-0 top-0 translate-x-8 -translate-y-[4.583rem]"
              src={quizAdventure}
              alt="quiz-adventure"
              priority={true}
              width={162}
              height={116}
            />
            {quizData.image && (
              <img className="w-24 mb-6" src={quizData.image} alt="Flag" />
            )}
            <p
              className="text-xl sm:text-2xl font-bold mb-8"
              style={{ color: "#2F527B" }}
            >
              {quizData.question}
            </p>
            <ul>
              {quizData.choices.map((choice, index) => (
                <li
                  className={clsx(
                    "cursor-pointer rounded-xl flex gap-9 text-lg px-5 py-2 border-2 border-blue-600 mb-6 ",
                    choice === selectedAnswer
                      ? selectedAnswer === quizData.correctAnswer
                        ? "bg-green-500 text-white border-green-400"
                        : "bg-red-400 text-white border-red-400"
                      : "",
                    !isCorrect &&
                      "hover:bg-orange-400 hover:text-white hover:border-orange-400 active:bg-orange-300 duration-200",
                    isCorrect &&
                      choice == quizData.correctAnswer &&
                      "border-green-400 bg-green-400 text-white"
                  )}
                  key={index}
                  onClick={() => handleAnswerClick(choice)}
                >
                  <span className="text-2xl ">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <p className="">{choice}</p>
                </li>
              ))}
            </ul>
            <div className="flex justify-end pb-8">
              <button
                className={clsx(
                  "text-white bg-yellow-500 px-9 py-3 rounded-xl",
                  !isCorrect && "hidden"
                )}
                onClick={isFinished ? handleFinishQuiz : handleNextQuestion}
              >
                <p className="text-lg font-bold text-white">
                  {isFinished ? "Finish" : "Next"}
                </p>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Image
              src={winnerImage}
              width={238}
              height={136}
              className="mx-auto pt-10"
              alt="winner-svg"
              priority={true}
            />

            <div className="my-16">
              <h1 className="text-5xl text-blue-900 font-bold mb-4">Results</h1>
              <p>
                You got{" "}
                <span className="text-4xl text-green-500 font-bold">
                  {resultCount}
                </span>{" "}
                correct answers
              </p>
            </div>

            <button
              onClick={handleTryAgain}
              className="mb-8 px-14 py-4 text-blue-900 hover:bg-blue-600 hover:text-white rounded-xl duration-200 border-2 border-blue-900 hover:border-blue-600 text-lg font-semibold"
            >
              Try again
            </button>
          </div>
        )}
      </section>
      <footer className={`${montserrat.className} pt-5 text-center text-white`}>
        created by{" "}
        <a
          href="http://Github.com/jcom-dev"
          className="font-bold"
          target="_blank"
        >
          Juan Oscco Mori
        </a>
        - devChallenges.io
      </footer>
    </main>
  );
}
