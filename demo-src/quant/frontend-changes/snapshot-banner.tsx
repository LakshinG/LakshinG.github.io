"use client";

import { useEffect, useState } from "react";
import { SNAPSHOT, getMeta, SnapshotMeta } from "./snapshot";

const REPO = "https://github.com/LakshinG/Quantitative-Stock-Evaluation-Engine";

export default function SnapshotBanner({ onPick }: { onPick: (ticker: string) => void }) {
  const [meta, setMeta] = useState<SnapshotMeta | null>(null);
  useEffect(() => {
    if (SNAPSHOT) getMeta().then(setMeta);
  }, []);
  if (!SNAPSHOT) return null;

  const captured = meta
    ? new Date(meta.captured + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";

  return (
    <div role="note" className="shrink-0 bg-amber-400 text-black px-6 py-3 border-b-2 border-amber-600">
      <p className="text-sm font-bold">
        Snapshot demo{captured && `, data saved on ${captured}`}. Prices, news, and sentiment here are not live.
      </p>
      <p className="text-sm mt-1">
        This engine runs FinBERT on PyTorch and pulls live market data, which is too heavy for free hosting, so this
        page replays saved results from the real backend. To get live data, download the project and run it on your
        own computer:{" "}
        <a href={REPO} target="_blank" rel="noopener" className="underline font-semibold">
          source code and setup steps on GitHub
        </a>
        . The portfolio optimizer still runs its 6,500 Monte Carlo simulations live in your browser.
      </p>
      {meta && (
        <p className="text-sm mt-2 flex flex-wrap items-center gap-1.5">
          <span>Tickers in this snapshot:</span>
          {meta.tickers.map((t) => (
            <button
              key={t}
              onClick={() => onPick(t)}
              className="px-2 py-0.5 rounded bg-black/10 hover:bg-black/20 font-semibold"
            >
              {t}
            </button>
          ))}
        </p>
      )}
    </div>
  );
}
