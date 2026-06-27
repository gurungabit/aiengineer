import json
with open('scripts/sessions.json') as f:
    s = json.load(f)
with open('scripts/speakers.json') as f:
    sp = json.load(f)

print("=== SESSIONS ===")
print(f"Total: {s['totalSessions']}")
print(f"Fields on a session: {list(s['sessions'][0].keys())}")
print(f"\nDays: {sorted(set(x['day'] for x in s['sessions']))}")
print(f"\nTypes: {sorted(set(x.get('type','') for x in s['sessions']))}")
print(f"\nStatuses: {sorted(set(x.get('status','') for x in s['sessions']))}")
print(f"\nSample rooms: {sorted(set(x.get('room','') for x in s['sessions']))[:20]}")
print(f"\nSample tracks: {sorted(set(x.get('track','') for x in s['sessions'] if x.get('track')))[:30]}")
print(f"\nSessions with no description: {sum(1 for x in s['sessions'] if not x.get('description','').strip())}")
print(f"Sessions with 0 speakers: {sum(1 for x in s['sessions'] if not x.get('speakers'))}")
print(f"Sessions with multiple speakers: {sum(1 for x in s['sessions'] if len(x.get('speakers',[]))>1)}")

print("\n=== SPEAKERS ===")
print(f"Total: {sp['totalSpeakers']}")
print(f"Fields on a speaker: {list(sp['speakers'][0].keys())}")
print(f"\nSample photo URLs: {[x.get('photoUrl') for x in sp['speakers'][:3]]}")
print(f"\nSpeakers without photo: {sum(1 for x in sp['speakers'] if not x.get('photoUrl'))}")
print(f"Speakers without bio: {sum(1 for x in sp['speakers'] if not x.get('bio'))}")
print(f"Speakers with linkedin: {sum(1 for x in sp['speakers'] if x.get('linkedin'))}")

# Check if any session has ID
sample = s['sessions'][0]
print(f"\nSample session (full):\n{json.dumps(sample, indent=2)[:1500]}")

# Count speakers per session
from collections import Counter
print("\nSpeaker count distribution:")
counts = Counter(len(x.get('speakers',[])) for x in s['sessions'])
for k,v in sorted(counts.items()):
    print(f"  {k} speakers: {v} sessions")
