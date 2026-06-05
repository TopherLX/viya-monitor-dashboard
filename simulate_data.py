"""Generate 60 days of simulated Viya server disk usage data.

Based on the baseline snapshot in viya_server_usage_all.json, this script
generates 3 collections per day (10:00, 14:00, 20:00) over 60 days, with
realistic random variation in fsuse_pct.
"""

import json
import random
import sys
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INPUT = ROOT / "viya_server_usage_all.json"
OUTPUT = ROOT / "viya_server_usage_simulated.json"

DAYS = 60
TIMES_OF_DAY = ["10:00:00", "14:00:00", "20:00:00"]


def load_baseline() -> list[dict]:
    with open(INPUT, encoding="utf-8") as f:
        return json.load(f)


def build_device_templates(records: list[dict]) -> list[dict]:
    """Extract device templates from baseline: one per unique device."""
    seen: set[tuple[str, str]] = set()
    templates: list[dict] = []
    for r in records:
        key = (r["host_name"], r["device_name"])
        if key not in seen:
            seen.add(key)
            templates.append(dict(r))
    return templates


def simulate_fsuse(base_pct: int | None, day: int, tick: int) -> int | None:
    """Simulate fsuse_pct with random walk and noise.

    Each day can drift by ±0.5, each tick by ±0.3, plus random noise ±2.
    Clamped to [1, 99]. Null values stay null.
    """
    if base_pct is None:
        return None
    random.seed(f"{day}-{tick}-{base_pct}")
    drift = day * random.uniform(-0.3, 0.5)
    intraday = random.uniform(-2, 2)
    noise = random.uniform(-1.5, 1.5)
    pct = round(base_pct + drift + intraday + noise)
    return max(1, min(99, pct))


def generate() -> list[dict]:
    templates = build_device_templates(load_baseline())
    base_date = datetime(2026, 4, 7)  # 60 days before 2026-06-05
    results: list[dict] = []

    for day in range(DAYS):
        date = base_date + timedelta(days=day)
        for tick, tod in enumerate(TIMES_OF_DAY):
            ts = f"{date.strftime('%Y-%m-%d')} {tod}"
            for tpl in templates:
                rec = dict(tpl)
                rec["fsuse_pct"] = simulate_fsuse(rec["fsuse_pct"], day, tick)
                rec["collected_at"] = ts
                results.append(rec)

    return results


def main() -> None:
    print(f"Generating simulated data: {DAYS} days x {len(TIMES_OF_DAY)} collections/day ...")
    data = generate()
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Done: {len(data)} records written to {OUTPUT}")


if __name__ == "__main__":
    main()
