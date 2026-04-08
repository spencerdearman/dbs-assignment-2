"use client";

import { useParams } from "next/navigation";

export default function QuizPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Quiz: <span className="text-blue-500">{slug}</span>
      </h1>
      <div className="glass p-8">
        <p className="text-white/50">Flashcard quiz coming soon...</p>
      </div>
    </div>
  );
}
