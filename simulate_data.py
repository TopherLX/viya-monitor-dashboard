"""Generate 180 days of simulated Viya server disk usage data.

Based on the baseline snapshot in viya_server_usage_all.json, this script
generates hourly collections over 180 days, with realistic random variation
in fsuse_pct.
"""

import json
import random
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INPUT = ROOT / "viya_server_usage_all.json"
OUTPUT = ROOT / "public" / "viya_server_usage.json"

DAYS = 180
HOURS_PER_DAY = 24


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


def simulate_fsuse(base_pct: int | None, day: int, hour: int) -> int | None:
    """Simulate fsuse_pct with random walk and noise.

    Each day can drift by ±0.2, each hour by ±0.1, plus random noise ±1.5.
    Clamped to [1, 99]. Null values stay null.
    """
    if base_pct is None:
        return None
    random.seed(f"{day}-{hour}-{base_pct}")
    drift = day * random.uniform(-0.15, 0.25)
    hourly = hour * random.uniform(-0.1, 0.1)
    noise = random.uniform(-1.5, 1.5)
    pct = round(base_pct + drift + hourly + noise)
    return max(1, min(99, pct))


def generate() -> list[dict]:
    templates = build_device_templates(load_baseline())
    base_date = datetime(2025, 12, 7)  # 180 days before 2026-06-05
    results: list[dict] = []

    for day in range(DAYS):
        date = base_date + timedelta(days=day)
        for hour in range(HOURS_PER_DAY):
            ts = f"{date.strftime('%Y-%m-%d')} {hour:02d}:00:00"
            for tpl in templates:
                rec = dict(tpl)
                rec["fsuse_pct"] = simulate_fsuse(rec["fsuse_pct"], day, hour)
                rec["collected_at"] = ts
                results.append(rec)

    return results


def main() -> None:
    print(f"Generating simulated data: {DAYS} days x {HOURS_PER_DAY} collections/day ...")
    data = generate()
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Done: {len(data)} records written to {OUTPUT}")


if __name__ == "__main__":
    main()
