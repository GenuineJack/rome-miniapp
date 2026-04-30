"use client";

import { useEffect, useMemo, useState } from "react";
import { shareToFarcaster, openExternalUrl } from "@/features/rome/utils/share";
import { buildCastUrl } from "@/lib/farcaster-urls";

type DispatchPayload = {
  masthead: { date: string; localTime: string; weather: string };
  intro: string;
  latestFromFarcon: Array<{ castHash: string; author: string; text: string; commentary: string }>;
  todayInRome: string;
  buildersBuilding: Array<{ castHash: string; author: string; text: string; whatTheyreBuilding: string }>;
  poll: { question: string; options: [string, string, string, string] };
  triviaQuestion: string;
  triviaAnswer: string;
  placeOfTheDay: { name: string; spotId: string; teaser: string };
  phraseOfTheDay: { italian: string; english: string; phonetic: string; usedInSentence: string };
  untilTomorrow: string;
};

type PollResults = Record<string, number>;

type DispatchTabProps = {
  onOpenSpot?: (spotId: string) => void;
};

export function DispatchTab({ onOpenSpot }: DispatchTabProps) {
  const [dispatch, setDispatch] = useState<DispatchPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTriviaAnswer, setShowTriviaAnswer] = useState(false);
  const [pollResults, setPollResults] = useState<PollResults>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/rome-dispatch")
      .then((response) => response.json())
      .then((data) => {
        setDispatch((data.dispatch ?? null) as DispatchPayload | null);
        setPollResults((data.pollResults ?? {}) as PollResults);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalVotes = useMemo(
    () => Object.values(pollResults).reduce((sum, value) => sum + value, 0),
    [pollResults],
  );

  async function vote(option: string) {
    if (!dispatch || selectedOption) return;
    setSelectedOption(option);

    const response = await fetch("/api/rome-dispatch/poll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dispatch.masthead.date, option }),
    });

    const data = await response.json();
    setPollResults((data.results ?? {}) as PollResults);
  }

  if (loading) {
    return (
      <div className="p-4 flex flex-col gap-3">
        <div className="animate-pulse h-20 rounded-sm bg-boston-gray-100" />
        <div className="animate-pulse h-24 rounded-sm bg-boston-gray-100" />
        <div className="animate-pulse h-24 rounded-sm bg-boston-gray-100" />
      </div>
    );
  }

  if (!dispatch) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest t-sans-navy">The Dispatch drops at 7am Rome time. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-6">
      <section className="px-4 py-4 bg-navy-bar border-b border-boston-gray-100">
        <h2 className="text-lg font-black uppercase tracking-wide t-sans-white">The Dispatch Rome</h2>
        <p className="text-xs italic t-serif-white opacity-80 mt-1">
          {dispatch.masthead.date} · {dispatch.masthead.localTime} · {dispatch.masthead.weather}
        </p>
      </section>

      <section className="px-4 py-4 border-b border-boston-gray-100">
        <p className="text-sm italic t-serif-body">{dispatch.intro}</p>
      </section>

      <section className="px-4 py-4 border-b border-boston-gray-100">
        <h3 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-3">Latest From Farcon</h3>
        <div className="flex flex-col gap-2">
          {dispatch.latestFromFarcon.map((item) => {
            const castUrl = buildCastUrl({ hash: item.castHash, author: item.author });
            return (
              <article key={item.castHash} className="bg-white border border-boston-gray-100 rounded-sm p-3">
                <p className="text-xs font-bold uppercase tracking-widest t-sans-blue">{item.author}</p>
                <p className="text-sm t-serif-body mt-1">{item.text}</p>
                <p className="text-xs italic t-serif-gray mt-1">{item.commentary}</p>
                {castUrl && (
                  <a
                    href={castUrl}
                    onClick={(e) => { e.preventDefault(); openExternalUrl(castUrl); }}
                    className="inline-block mt-2 text-xs uppercase tracking-widest t-sans-blue underline cursor-pointer"
                  >
                    View Cast
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-4 border-b border-boston-gray-100">
        <h3 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-2">Today in Rome</h3>
        <p className="text-sm italic t-serif-body">{dispatch.todayInRome}</p>
      </section>

      <section className="px-4 py-4 border-b border-boston-gray-100">
        <h3 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-3">Builders Building</h3>
        <div className="flex flex-col gap-2">
          {dispatch.buildersBuilding.map((item) => (
            <article key={item.castHash} className="bg-white border border-boston-gray-100 rounded-sm p-3">
              <p className="text-xs font-bold uppercase tracking-widest t-sans-blue">{item.author}</p>
              <p className="text-sm t-serif-body mt-1">{item.text}</p>
              <p className="text-xs italic t-serif-gray mt-1">{item.whatTheyreBuilding}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-4 border-b border-boston-gray-100">
        <h3 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-3">Daily Games</h3>
        <article className="bg-white border border-boston-gray-100 rounded-sm p-3 mb-3">
          <p className="text-xs font-bold uppercase tracking-widest t-sans-blue">Poll</p>
          <p className="text-sm t-sans-navy mt-1">{dispatch.poll.question}</p>
          <div className="flex flex-col gap-2 mt-3">
            {dispatch.poll.options.map((option) => {
              const count = pollResults[option] ?? 0;
              const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => vote(option)}
                  disabled={!!selectedOption}
                  className="text-left border border-boston-gray-100 rounded-sm px-3 py-2"
                >
                  <span className="text-xs font-bold uppercase tracking-widest t-sans-navy">{option}</span>
                  {(selectedOption || totalVotes > 0) && (
                    <span className="ml-2 text-xs uppercase tracking-widest t-sans-blue">{percentage}%</span>
                  )}
                </button>
              );
            })}
          </div>
        </article>

        <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
          <p className="text-xs font-bold uppercase tracking-widest t-sans-blue">Trivia</p>
          <p className="text-sm t-sans-navy mt-1">{dispatch.triviaQuestion}</p>
          <button
            type="button"
            onClick={() => setShowTriviaAnswer((prev) => !prev)}
            className="mt-3 px-3 py-2 rounded-sm border border-boston-gray-100 text-xs font-bold uppercase tracking-widest t-sans-navy"
          >
            {showTriviaAnswer ? "Hide Answer" : "Reveal Answer"}
          </button>
          {showTriviaAnswer && <p className="text-xs italic t-serif-body mt-2">{dispatch.triviaAnswer}</p>}
        </article>
      </section>

      <section className="px-4 py-4 border-b border-boston-gray-100">
        <h3 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-2">Place of the Day</h3>
        <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
          <p className="text-sm font-black uppercase tracking-wide t-sans-navy">{dispatch.placeOfTheDay.name}</p>
          <p className="text-xs italic t-serif-body mt-1">{dispatch.placeOfTheDay.teaser}</p>
          <button
            type="button"
            onClick={() => onOpenSpot?.(dispatch.placeOfTheDay.spotId)}
            className="mt-3 px-3 py-2 rounded-sm bg-boston-blue text-white text-xs font-bold uppercase tracking-widest"
          >
            See in Explore
          </button>
        </article>
      </section>

      <section className="px-4 py-4 border-b border-boston-gray-100">
        <h3 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-2">Phrase of the Day</h3>
        <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
          <p className="text-sm font-black t-sans-navy">{dispatch.phraseOfTheDay.italian}</p>
          <p className="text-xs italic t-serif-body mt-1">{dispatch.phraseOfTheDay.english}</p>
          <p className="text-xs t-sans-gray mt-2">{dispatch.phraseOfTheDay.phonetic}</p>
          <p className="text-xs italic t-serif-gray mt-1">{dispatch.phraseOfTheDay.usedInSentence}</p>
        </article>
      </section>

      <section className="px-4 py-4">
        <p className="text-sm italic t-serif-body">{dispatch.untilTomorrow}</p>
        <button
          type="button"
          onClick={() =>
            shareToFarcaster(
              `The Dispatch Rome is live for ${dispatch.masthead.date}. Check it in the Rome Miniapp #FarconRome`,
            )
          }
          className="mt-3 w-full py-2.5 rounded-sm bg-navy text-white text-xs font-bold uppercase tracking-widest"
        >
          Share today&apos;s dispatch
        </button>
      </section>
    </div>
  );
}
