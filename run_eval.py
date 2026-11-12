"""
Evaluation runner for the School Enquiry & Grievance Chatbot.
Sends every query in test_queries.csv to your chatbot, measures response time,
and prints the numbers for Table 8.2 of the report.

USAGE
  1. Start your Flask app (e.g. python app.py).
  2. Edit the CONFIG block below to match your /api/chat request/response format.
  3. python run_eval.py            -> auto-grades routing/priority when your API
                                      returns them; asks YOU (y/n) for the rest.
     python run_eval.py --manual   -> you grade every query yourself (y/n).

Every FAQ and off-topic answer is graded by YOU reading the reply. Nothing is
assumed correct. Results are saved to eval_results.csv as evidence.
"""
import csv, json, sys, time, urllib.request, urllib.error

# ---------------- CONFIG (edit to match your app) ----------------
URL          = "http://127.0.0.1:5000/api/chat"
REQUEST_KEY  = "message"      # JSON key your /api/chat expects the user text in
REPLY_KEY    = "reply"        # key holding the bot's text reply in the response
DEPT_KEY     = "department"   # key with routed department (set None if absent)
PRIORITY_KEY = "priority"     # key with priority          (set None if absent)
EXTRA_FIELDS = {}             # e.g. {"session_id": "eval-1"} sent with every request
TIMEOUT      = 60
# ------------------------------------------------------------------

MANUAL = "--manual" in sys.argv

def ask(query):
    body = json.dumps({REQUEST_KEY: query, **EXTRA_FIELDS}).encode()
    req = urllib.request.Request(URL, data=body, headers={"Content-Type": "application/json"})
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            data = json.loads(r.read().decode())
    except Exception as e:
        return {"_error": str(e)}, time.time() - t0
    return data, time.time() - t0

def yn(prompt):
    while True:
        a = input(prompt + " [y/n]: ").strip().lower()
        if a in ("y", "n"): return a == "y"

def norm(s): return (s or "").strip().lower()

rows = list(csv.DictReader(open("test_queries.csv", encoding="utf-8")))
out, times = [], []
stats = {"FAQ": [0, 0], "ROUTE": [0, 0], "URGENT": [0, 0], "OFF": [0, 0]}

for r in rows:
    data, secs = ask(r["query"])
    times.append(secs)
    reply = data.get(REPLY_KEY, json.dumps(data)) if isinstance(data, dict) else str(data)
    print(f"\n#{r['id']} [{r['type']}] {r['query']}\n  -> ({secs:.1f}s) {str(reply)[:300]}")
    ok_main = ok_pri = None

    if r["type"] == "COMPLAINT":
        dept = data.get(DEPT_KEY) if (DEPT_KEY and isinstance(data, dict)) else None
        pri  = data.get(PRIORITY_KEY) if (PRIORITY_KEY and isinstance(data, dict)) else None
        if dept is not None and not MANUAL:
            ok_main = norm(dept) == norm(r["expected_dept"])
        else:
            ok_main = yn(f"  Was it routed to {r['expected_dept']}?")
        if r["expected_priority"] == "Urgent":
            if pri is not None and not MANUAL:
                ok_pri = norm(pri) == "urgent"
            else:
                ok_pri = yn("  Was it flagged URGENT?")
            stats["URGENT"][1] += 1; stats["URGENT"][0] += bool(ok_pri)
        stats["ROUTE"][1] += 1; stats["ROUTE"][0] += bool(ok_main)
    elif r["type"] == "FAQ":
        ok_main = yn(f"  Is this answer correct for the school's real data? (topic: {r['hint']})")
        stats["FAQ"][1] += 1; stats["FAQ"][0] += bool(ok_main)
    else:
        ok_main = yn("  Did it politely decline / redirect (no invented answer)?")
        stats["OFF"][1] += 1; stats["OFF"][0] += bool(ok_main)

    out.append({**r, "reply": reply, "seconds": round(secs, 2), "correct": ok_main, "urgent_ok": ok_pri})

with open("eval_results.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(out[0].keys())); w.writeheader(); w.writerows(out)

def pct(k):
    c, n = stats[k]; return f"{100*c/n:.1f}% ({c}/{n})" if n else "n/a"

print("\n" + "=" * 56 + "\nVALUES FOR TABLE 8.2\n" + "=" * 56)
print(f"FAQ answer accuracy            : {pct('FAQ')}")
print(f"Correct routing accuracy       : {pct('ROUTE')}")
print(f"Number of test queries         : {len(rows)}")
print(f"Average response time          : {sum(times)/len(times):.2f} s")
print(f"Urgent cases flagged correctly : {pct('URGENT')}")
print(f"Off-topic handled correctly    : {pct('OFF')}")
print("Full log saved to eval_results.csv")
