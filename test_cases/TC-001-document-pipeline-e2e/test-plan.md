# Test Plan: TC-001 — Document Pipeline End-to-End

## Objective
Validate the full document generation pipeline from rationale doc curation through final document assembly. The plan-of-plan stage is already complete — this test begins at the rationale stage and verifies every subsequent stage works correctly.

## Preconditions

- [ ] Server running on port 3001 (`npm run dev` from project root)
- [ ] Client running on port 5173 (Vite dev server, started by same command)
- [ ] Browser open to `http://localhost:5173`
- [ ] Pipeline state: `stage: "rationale"`, plan-of-plan approved
- [ ] 5 rationale docs exist in pipeline: Conceptual Architecture (status: ready), Tension Navigation Strategy (empty), Evidence Grounding Approach (empty), Reader Journey Design (empty), Resolution Framework Strategy (empty)
- [ ] Graph contains objects and edges (at least several concepts, tensions, questions with connections)
- [ ] Document tray visible at bottom of screen (click "Docs" in toolbar if not)

---

## Test Steps

### Step 1: Verify document tray shows correct initial state
- **Action**: Click "Docs" button in toolbar to open the document tray
- **Expected**: Tray shows: Plan of Plan (approved/checkmark), 5 rationale doc icons (1 bright/ready, 4 greyed/empty), Plan (locked), Generation Plan (locked), Final (locked)
- **Validation**: Screenshot of document tray showing all icons with correct status styling
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 2: Verify progress bar reflects current state
- **Action**: Observe the pipeline progress bar above the document tray
- **Expected**: Progress bar shows segments for each document. Plan of Plan segment is green (approved). Conceptual Architecture segment is bright (ready). Remaining rationale segments are dim. Downstream segments are locked.
- **Validation**: Screenshot of progress bar
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 3: Open the ready rationale doc (Conceptual Architecture)
- **Action**: Click the "Conceptual Architecture" icon in the document tray
- **Expected**: Markdown editor panel opens on the right side showing the existing content. Header shows "Rationale: Conceptual Architecture". Three buttons visible: "+ Object", "Generate", "Approve"
- **Validation**: Screenshot showing editor with correct title and buttons
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 4: Approve Conceptual Architecture
- **Action**: Click the "Approve" button in the editor header
- **Expected**: Document status changes to "approved". Tray icon updates to show checkmark/approved styling. Editor remains open.
- **Validation**: Check pipeline.json — `rationale:conceptual-architecture` status should be `"approved"`. Screenshot of tray showing updated icon.
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 5: Open an empty rationale doc (Tension Navigation Strategy)
- **Action**: Click "Tension Navigation Strategy" icon in the document tray
- **Expected**: Editor opens with empty content. Header shows "Rationale: Tension Navigation Strategy". Buttons visible: "+ Object", "Generate", "Approve"
- **Validation**: Screenshot of empty editor with correct title and buttons
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 6: Insert a graph object into the rationale doc
- **Action**: Click "+ Object" button in editor header
- **Expected**: Object picker dropdown appears below the header. Shows searchable list of graph objects with type badges, labels, summaries, and connection counts.
- **Validation**: Screenshot of object picker open with objects listed
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 7: Select an object from the picker
- **Action**: Click on any object in the picker (e.g., a concept or tension)
- **Expected**: Formatted markdown block is inserted into the editor content. Block includes object type, label, summary, and connections. Picker closes.
- **Validation**: Screenshot of editor showing the inserted object markdown block. Verify block contains `**[TYPE] Label**`, summary text, and connections list.
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 8: Insert a second object
- **Action**: Click "+ Object" again, search for a different object using the search field, click to insert
- **Expected**: Second markdown block appended to the document content below the first. Search filtering works (list narrows as you type).
- **Validation**: Screenshot of editor showing two object blocks. Verify search filtering worked.
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 9: Generate supplementary content
- **Action**: Click "Generate" button in editor header
- **Expected**: Button text changes to "Generating..." and becomes disabled. After generation completes, editor content updates with Claude-generated prose woven around the inserted object blocks. Document status updates to "ready".
- **Validation**: Screenshot of editor showing generated content around the object blocks. Check pipeline.json — status should be `"ready"`.
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 10: Approve the rationale doc
- **Action**: Click "Approve" button
- **Expected**: Status changes to "approved". Tray icon updates to approved styling.
- **Validation**: Check pipeline.json — `rationale:tension-navigation-strategy` status is `"approved"`. Screenshot of tray.
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 11: Complete remaining rationale docs (Evidence Grounding Approach)
- **Action**: Open Evidence Grounding Approach, insert 1-2 objects, click Generate, then Approve
- **Expected**: Same flow as Steps 5-10. Document generates successfully and is approved.
- **Validation**: Check pipeline.json — status is `"approved"`
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 12: Complete remaining rationale docs (Reader Journey Design)
- **Action**: Open Reader Journey Design, insert 1-2 objects, click Generate, then Approve
- **Expected**: Same flow. Document generates successfully and is approved.
- **Validation**: Check pipeline.json — status is `"approved"`
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 13: Complete remaining rationale docs (Resolution Framework Strategy)
- **Action**: Open Resolution Framework Strategy, insert 1-2 objects, click Generate, then Approve
- **Expected**: Same flow. Document generates successfully and is approved. This is the last rationale doc.
- **Validation**: Check pipeline.json — status is `"approved"`. All 5 rationale docs now approved.
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 14: Verify Plan stage unlocks
- **Action**: Observe document tray after all rationale docs are approved
- **Expected**: "Plan" icon transitions from locked to empty (clickable). Pipeline stage should advance.
- **Validation**: Check pipeline.json — `plan` status should be `"empty"`, stage should advance past `"rationale"`. Screenshot of tray showing Plan unlocked.
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 15: Generate Plan document
- **Action**: Click the "Plan" icon in the document tray
- **Expected**: Generation starts automatically (since it's a non-rationale empty doc). Claude generates a 3-level outline (H1/H2/H3) incorporating all rationale docs and graph objects. Editor opens showing the generated plan.
- **Validation**: Screenshot of plan document in editor. Verify it has H1/H2/H3 structure. Check pipeline.json — `plan` status should be `"ready"`.
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 16: Approve Plan document
- **Action**: Click "Approve" in the editor
- **Expected**: Plan status changes to "approved". Generation Plan icon unlocks.
- **Validation**: Check pipeline.json — `plan` status is `"approved"`, `generation-plan` status is `"empty"`.
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 17: Generate Generation Plan
- **Action**: Click the "Generation Plan" icon in the tray
- **Expected**: Generation starts. Claude reads the plan and determines how sections batch into doc parts. Editor opens showing the batching plan.
- **Validation**: Screenshot of generation plan in editor. Check pipeline.json — `generation-plan` status should be `"ready"`.
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 18: Approve Generation Plan
- **Action**: Click "Approve" in the editor
- **Expected**: Generation Plan status changes to "approved". Doc part generation should begin or Final icon should unlock.
- **Validation**: Check pipeline.json — `generation-plan` status is `"approved"`.
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 19: Verify doc parts generation and final assembly
- **Action**: Observe pipeline progression after Generation Plan approval
- **Expected**: Doc parts are generated (if the pipeline supports this stage), then final document is assembled. Final icon becomes ready/approved.
- **Validation**: Check pipeline.json for final status. Check that `data/documents/final.md` exists and contains assembled content. Screenshot of final document in editor.
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_

### Step 20: Verify final document content quality
- **Action**: Read through the final assembled document in the editor
- **Expected**: Document contains coherent prose organized by the plan's outline structure. All rationale themes are represented. Object references from the graph are woven into the content.
- **Validation**: Screenshot of final document. Skim for structural coherence and presence of key themes.
- **Result**: _[PASS / FAIL]_
- **Notes**: _[]_
