"""Recapture the two endpoints that hit bugs in the repo code with current yfinance."""
import json, os, yfinance as yf

OUT = "snapshot"
meta = json.load(open(f"{OUT}/meta.json"))

# 1. dividendYield is already a percent in current yfinance; the API multiplies by 100 again.
for t in meta["tickers"]:
    p = f"{OUT}/fundamentals/{t}.json"
    f = json.load(open(p))
    dy = yf.Ticker(t).info.get("dividendYield")
    f["dividend_yield"] = f"{round(dy, 2)}%" if dy else "N/A"
    json.dump(f, open(p, "w"), separators=(",", ":"))
    print(t, f["dividend_yield"])

# 2. get_general_news crashes when clickThroughUrl is null. Same fields, null-safe.
news = []
for item in (yf.Ticker("SPY").news or [])[:10]:
    c = item.get("content") or {}
    link = (c.get("clickThroughUrl") or {}).get("url") or (c.get("canonicalUrl") or {}).get("url") or item.get("link", "#")
    news.append({"title": c.get("title") or item.get("title", "Market News"),
                 "date": c.get("pubDate") or item.get("providerPublishTime", ""),
                 "url": link})
json.dump({"news": news}, open(f"{OUT}/news.json", "w"), separators=(",", ":"))
print("news items:", len(news))
