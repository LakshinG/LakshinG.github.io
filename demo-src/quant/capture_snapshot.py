"""Run the real backend functions once and save every response as JSON.

The static demo on the portfolio site reads these files instead of calling the API,
because FinBERT + PyTorch are too heavy for free hosting.
"""
import json
import math
import os
import sys
from datetime import date

import api  # loads FinBERT through sentiment.py

TICKERS = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "JPM", "LLY", "NFLX"]
OUT = sys.argv[1] if len(sys.argv) > 1 else "snapshot"


def clean(o):
    """Replace NaN/inf (invalid JSON) with None and numpy scalars with plain floats."""
    if isinstance(o, dict):
        return {k: clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [clean(v) for v in o]
    if hasattr(o, "item") and not isinstance(o, (str, bytes)):
        o = o.item()
    if isinstance(o, float) and (math.isnan(o) or math.isinf(o)):
        return None
    return o


def save(rel, data):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(clean(data), f, separators=(",", ":"))
    print("saved", rel)


done = []
for t in TICKERS:
    try:
        save(f"stock/{t}.json", api.get_stock_data(t, period="1y"))
        save(f"sentiment/{t}.json", api.get_sentiment(t))
        save(f"backtest/{t}.json", api.get_backtest(t, capital=10000.0, period="2y"))
        save(f"fundamentals/{t}.json", api.api_fundamentals(t))
        done.append(t)
    except Exception as e:
        print("skipped", t, e)

save("market-movers.json", api.api_market_movers())
save("sectors.json", api.api_sectors())
save("news.json", api.api_news())
save("meta.json", {"captured": date.today().isoformat(), "tickers": done})
