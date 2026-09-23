// Snapshot mode: when built with NEXT_PUBLIC_SNAPSHOT=1, every API call is answered from
// JSON files captured by capture_snapshot.py instead of the FastAPI backend.
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const SNAPSHOT = process.env.NEXT_PUBLIC_SNAPSHOT === "1";
const BASE = (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/snapshot";

export type SnapshotMeta = { captured: string; tickers: string[] };
let metaPromise: Promise<SnapshotMeta> | null = null;
export function getMeta(): Promise<SnapshotMeta> {
  if (!metaPromise) metaPromise = fetch(`${BASE}/meta.json`).then((r) => r.json());
  return metaPromise;
}

async function load(rel: string) {
  const res = await fetch(`${BASE}/${rel}`);
  if (!res.ok) throw new Error(rel);
  return res.json();
}

function notFound(config: InternalAxiosRequestConfig, detail: string) {
  const response = { data: { detail }, status: 404, statusText: "Not Found", headers: {}, config };
  return new AxiosError(detail, "ERR_BAD_REQUEST", config, null, response as never);
}

async function missing(config: InternalAxiosRequestConfig, ticker: string) {
  const meta = await getMeta();
  return notFound(config, `${ticker} isn't in this snapshot. Try one of: ${meta.tickers.join(", ")}.`);
}

// Same method as portfolio.py: 1 year of daily closes, annualized mean returns and covariance,
// 6,500 random portfolios, pick the highest Sharpe ratio with a 4% risk-free rate.
function optimize(series: Record<string, Map<string, number>>, tickers: string[]) {
  const dates = [...series[tickers[0]].keys()].filter((d) => tickers.every((t) => series[t].has(d))).sort();
  const rets = tickers.map((t) => {
    const c = dates.map((d) => series[t].get(d)!);
    return c.slice(1).map((v, i) => v / c[i] - 1);
  });
  const n = rets[0].length, k = tickers.length;
  const mean = rets.map((r) => (r.reduce((a, b) => a + b, 0) / n) * 252);
  const cov = rets.map((ri, i) =>
    rets.map((rj, j) => {
      let s = 0;
      for (let x = 0; x < n; x++) s += (ri[x] - mean[i] / 252) * (rj[x] - mean[j] / 252);
      return (s / (n - 1)) * 252;
    })
  );
  let best = { sharpe: -Infinity, ret: 0, vol: 0, w: [] as number[] };
  for (let p = 0; p < 6500; p++) {
    const w = Array.from({ length: k }, () => Math.random());
    const sum = w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < k; i++) w[i] /= sum;
    const ret = w.reduce((a, wi, i) => a + wi * mean[i], 0);
    let v = 0;
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) v += w[i] * w[j] * cov[i][j];
    const vol = Math.sqrt(v), sharpe = (ret - 0.04) / vol;
    if (sharpe > best.sharpe) best = { sharpe, ret, vol, w };
  }
  const r2 = (x: number) => Math.round(x * 100) / 100;
  return {
    expected_return_pct: r2(best.ret * 100),
    expected_volatility_pct: r2(best.vol * 100),
    sharpe_ratio: r2(best.sharpe),
    allocations: tickers
      .map((t, i) => ({ ticker: t, weight: r2(best.w[i] * 100) }))
      .filter((a) => a.weight > 0.1)
      .sort((a, b) => b.weight - a.weight),
  };
}

async function answer(config: InternalAxiosRequestConfig) {
  const url = new URL(config.url!, "http://snapshot");
  const path = url.pathname.replace(/^.*\/api\//, "");
  const [kind, arg] = path.split("/");
  const meta = await getMeta();

  if (["stock", "sentiment", "fundamentals"].includes(kind)) {
    const t = arg.toUpperCase();
    if (!meta.tickers.includes(t)) throw await missing(config, t);
    return load(`${kind}/${t}.json`);
  }
  if (kind === "backtest") {
    const t = (url.searchParams.get("ticker") || "").toUpperCase();
    if (!meta.tickers.includes(t)) throw await missing(config, t);
    return load(`backtest/${t}.json`);
  }
  if (kind === "portfolio") {
    const tickers = (url.searchParams.get("tickers") || "")
      .split(",").map((t) => t.trim().toUpperCase()).filter(Boolean);
    if (tickers.length < 2) throw notFound(config, "Please provide at least 2 tickers for optimization.");
    const absent = tickers.filter((t) => !meta.tickers.includes(t));
    if (absent.length) throw await missing(config, absent.join(", "));
    const series: Record<string, Map<string, number>> = {};
    for (const t of tickers) {
      const s = await load(`stock/${t}.json`);
      series[t] = new Map(s.data.map((row: any) => [String(row.Date).slice(0, 10), row.Close]));
    }
    return optimize(series, tickers);
  }
  if (["market-movers", "sectors", "news"].includes(kind)) return load(`${kind}.json`);
  throw notFound(config, "Not available in the snapshot.");
}

if (SNAPSHOT) {
  axios.defaults.adapter = async (config) => ({
    data: await answer(config),
    status: 200,
    statusText: "OK",
    headers: {},
    config,
    request: {},
  });
}
