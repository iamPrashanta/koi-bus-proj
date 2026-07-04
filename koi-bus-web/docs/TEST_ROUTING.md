# Routing Test Cases

## Goal
Ensure the Strategy engine correctly traverses the mocked Corridors.

### Corridor Setup
- C1 (SBSTC): Durgapur -> Panagarh -> Burdwan -> Dankuni -> Howrah -> Esplanade
- C2 (NBSTC): Bankura -> Sonamukhi -> Durgapur
- C3 (WBTC): Salt Lake -> Karunamoyee -> Esplanade -> Howrah
- C4 (CSTC): Asansol -> Raniganj -> Durgapur

---

## Case 1: Direct Route
**Input**: `from=Panagarh`, `to=Burdwan`
**Expected**:
- Strategy: `DirectRouteStrategy`
- Route: C1 (SBSTC)
- Transfers: 0
- Path: Panagarh -> Burdwan

## Case 2: 1-Transfer Route
**Input**: `from=Sonamukhi`, `to=Panagarh`
**Expected**:
- Strategy: `TransferRouteStrategy`
- Route 1: C2 (Sonamukhi -> Durgapur)
- Transfer at: Durgapur
- Route 2: C1 (Durgapur -> Panagarh)
- Transfers: 1

## Case 3: 2-Transfer Route (Multi-Transfer)
**Input**: `from=Sonamukhi`, `to=Salt Lake`
**Expected**:
- Strategy: `DijkstraStrategy` (Future implementation, `TransferRouteStrategy` will fail natively here as it handles max 1 transfer).
- Route 1: C2 (Sonamukhi -> Durgapur)
- Transfer at: Durgapur
- Route 2: C1 (Durgapur -> Esplanade)
- Transfer at: Esplanade
- Route 3: C3 (Esplanade -> Salt Lake)
- Transfers: 2

## Case 4: Circular / Disconnected Route
**Input**: `from=Bankura`, `to=Asansol`
**Expected**:
- No physical edges exist to travel efficiently backwards without hitting Durgapur and traversing reverse edges.
- If only FORWARD edges are seeded, the system should gracefully return `Not Available`.
