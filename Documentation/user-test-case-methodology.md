# User Test Case Methodology

A structured approach to user testing where Claude Code assists the tester in real time — executing test steps, validating results, diagnosing issues, applying fixes in-flow, and documenting everything.

---

## How It Works

The core loop for each test step:

1. **Execute** — perform the action described in the test step
2. **Validate** — check the result against expected outcome (screenshot, inspect, API check, file check)
3. **Pass** — log result, move to next step
4. **Fail** — log the issue, diagnose root cause, recommend a fix to the user
5. **Confirm** — user approves or modifies the recommended fix
6. **Fix** — apply the code change
7. **Re-validate** — re-run the validation for that step
8. **Log** — record the issue, fix, and re-validation result in test-results.md
9. **Continue** — proceed to the next step

---

## Folder Structure

Create a `test_cases/` directory at the project root. Each test case gets its own subfolder:

```
test_cases/
├── TC-001-descriptive-name/
│   ├── test-plan.md
│   ├── test-results.md
│   └── screenshots/
├── TC-002-descriptive-name/
│   ├── test-plan.md
│   ├── test-results.md
│   └── screenshots/
```

- **test-plan.md** — defines preconditions, steps, and validation criteria (written before testing)
- **test-results.md** — records outcomes, issues, and fixes (written during testing)
- **screenshots/** — validation screenshots referenced by step number (e.g., `step-03.png`)

---

## Test Plan Template

Copy this template for each new test case:

```markdown
# Test Plan: TC-XXX — [Title]

## Objective
[One sentence describing what this test validates end-to-end.]

## Preconditions
[Exact system state required before the test begins.]

- [ ] [Service/server running on port XXXX]
- [ ] [Client running on port XXXX]
- [ ] [Specific data state — e.g., database seeded, files present, feature flags set]
- [ ] [Browser open to specific URL]
- [ ] [Any prior steps completed — e.g., user logged in, prior test case passed]

## Test Steps

### Step 1: [Short description]
- **Action**: [Exactly what the tester does — click, type, navigate, run command]
- **Expected**: [What should happen as a result]
- **Validation**: [How to confirm — screenshot, inspect element for specific text/style, check API response, read file, check console]
- **Result**: _[PASS / FAIL — filled during execution]_
- **Notes**: _[filled during execution]_

### Step 2: [Short description]
- **Action**: [...]
- **Expected**: [...]
- **Validation**: [...]
- **Result**: _[PASS / FAIL]_
- **Notes**: _[...]_

[Continue for all steps...]
```

---

## Test Results Template

Copy this template. It is filled in during test execution:

```markdown
# Test Results: TC-XXX — [Title]

## Reference
- **Test Plan**: ./test-plan.md
- **Execution Date**: [YYYY-MM-DD]
- **Environment**: [OS, browser, node version, any relevant config]
- **Tester**: [Name or role]

## Overall Result: _[PASS / FAIL / PARTIAL]_

## Step Results

| Step | Description | Result | Notes |
|------|-------------|--------|-------|
| 1    | [short desc]| PASS   |       |
| 2    | [short desc]| FAIL   | See Issue #1 |
| 3    | [short desc]| PASS   | After fix |

## Issues Found

### Issue #1: [Short title]
- **Found at**: Step [N]
- **Severity**: [blocker / major / minor / cosmetic]
- **Description**: [What went wrong and why]
- **Root Cause**: [Technical explanation]
- **Recommended Fix**: [What code change to make and where]
- **User Approved**: [yes / no / modified — describe modification]
- **Fix Applied**: [Description of the actual change made]
- **Files Changed**: [list of files modified]
- **Re-validation**: [PASS / FAIL — result after fix applied]
- **Screenshot**: [path to screenshot if applicable]

### Issue #2: [Short title]
[Same structure...]

## Summary
[Brief overview: how many steps passed/failed, how many issues found and fixed, any remaining issues, recommendations for follow-up.]
```

---

## Fix-in-Flow Procedure

These are instructions for Claude Code to follow when an issue is encountered during test execution.

### When a test step fails:

1. **Log immediately** — Add a FAIL entry to the Step Results table in test-results.md with a brief note

2. **Diagnose** — Read relevant source code, check console/server logs, inspect the UI state. Identify the root cause.

3. **Report to user** — Present the issue clearly:
   - What failed (observed vs expected)
   - Why it failed (root cause)
   - Recommended fix (specific files and changes)
   - Severity assessment

4. **Wait for confirmation** — Do not apply any fix until the user explicitly approves. The user may:
   - Approve the fix as-is
   - Modify the approach
   - Defer the fix and continue testing
   - Stop the test

5. **Apply the fix** — Make the code change. Keep changes minimal and focused on the issue.

6. **Re-validate** — Re-run the exact validation for the failed step. If the application needs a restart or reload, do that first.

7. **Update test-results.md** — Fill in the full Issue block (root cause, fix applied, files changed, re-validation result)

8. **Continue** — Move to the next test step

### Important rules:
- Never silently fix issues — always present them to the user first
- Never skip a failed step — either fix it or explicitly mark it as deferred
- If a fix introduces a regression in a previously passed step, note it and re-validate that step too
- If multiple issues are found in one step, log each as a separate issue

---

## Writing Good Test Steps

### Each step should be:
- **Atomic** — one action per step (click one button, not "click button and fill form and submit")
- **Specific** — use exact UI element names, button labels, menu items, URLs
- **Verifiable** — the validation must be objective, not subjective ("button text reads 'Submit'" not "button looks right")
- **Ordered** — steps follow the natural user flow; each step's precondition is the previous step's success

### Validation methods (use the most appropriate):
- **Screenshot** — for visual/layout verification. Note: `screenshots/step-NN.png`
- **Element inspection** — check specific CSS properties, text content, element presence
- **API response** — call an endpoint, check status code and response body
- **File contents** — read a file and check for expected content
- **Console/logs** — check browser console or server logs for errors or expected output
- **State check** — verify application state (e.g., database record exists, file was created)

### Preconditions should capture:
- What services must be running (with ports)
- What data must exist (seed data, prior user actions, file state)
- What the UI should show before step 1 begins
- Any configuration or environment requirements

---

## Procedure: Creating and Running a Test Case

Follow these steps when asked to create and execute a user test case.

### Phase 1: Setup

1. **Create the folder structure**
   ```
   test_cases/TC-XXX-descriptive-name/
   ├── test-plan.md
   ├── test-results.md
   └── screenshots/
   ```

2. **Capture preconditions** — Examine the current system state:
   - What services are running? On what ports?
   - What data exists? (Check databases, JSON files, config files)
   - What is the current UI state? (Take a screenshot if helpful)
   - What features are enabled/disabled?

3. **Write test-plan.md** — Using the template above:
   - Define the objective (what end-to-end flow is being tested)
   - List all preconditions with checkboxes
   - Write each test step with action, expected result, and validation method
   - Number steps sequentially
   - Include enough detail that another person (or Claude instance) could execute the test without additional context

4. **Initialize test-results.md** — Copy the results template, fill in the header fields, leave step results and issues empty

5. **Get user approval** — Present the test plan to the user. Do not begin execution until they approve. They may want to add, remove, or reorder steps.

### Phase 2: Execution

6. **Execute step by step** — For each step:
   - State which step you are executing
   - Perform the action
   - Run the validation
   - Record PASS or FAIL in test-results.md
   - If FAIL: follow the Fix-in-Flow Procedure above
   - If PASS: move to next step

7. **Take screenshots** at validation points where the test plan calls for them. Save as `screenshots/step-NN.png`.

### Phase 3: Completion

8. **Complete test-results.md** — Fill in:
   - Overall result (PASS if all steps pass, FAIL if any blocker remains, PARTIAL if non-blockers remain)
   - Summary section with totals and recommendations

9. **Report to user** — Summarize:
   - Steps passed / failed
   - Issues found and fixed
   - Any remaining issues
   - Recommendations for follow-up test cases if needed

---

## Tips

- **Start small** — A test case with 5-10 focused steps is better than 30 vague ones
- **One flow per test case** — Don't mix unrelated features in one test case
- **Retest after fixes** — When a fix is applied mid-test, re-validate not just the failed step but any subsequent steps that depend on it
- **Test case IDs are sequential** — TC-001, TC-002, etc. Never reuse an ID
- **Keep test plans stable** — Once approved, don't modify test-plan.md during execution. All runtime findings go in test-results.md
- **Screenshots are evidence** — When in doubt, take a screenshot. They're cheap and valuable for review
