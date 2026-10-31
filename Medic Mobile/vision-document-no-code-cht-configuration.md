# Vision Document: No-Code CHT Configuration

**Organization:** Medic, steward of the open-source Community Health Toolkit (CHT)
**Event:** AWS Breaking Barriers 2026, November 3 to 5: two build days, then presentations on day 3
**Build tracks:** Open path and Reference path. Each team builds one.
**Companion document:** Technical Environment Document: No-Code CHT Configuration
**Last updated:** October 29, 2026

---

## Executive Summary

No-Code CHT Configuration lets non-technical health ministry teams create and change Community Health Toolkit (CHT) workflows from clinical guidelines, without writing code. The CHT serves 182,000+ community health workers in 24 countries, yet every change waits on a few developers and a full development cycle. The system drafts with Amazon Bedrock, checks the logic automatically, and holds every change for human approval. Deterministic code then compiles the approved logic into standard CHT configuration, and synthetic patients prove the result. The expected outcome is routine changes reaching health workers in days instead of weeks or months, with most routine edits made without a developer.

---

## Business Context

### Problem Statement

The challenge statement agreed with AWS:

> The Community Health Toolkit (CHT) serves 182,000+ community health workers across 24 countries, but configuring it requires specialized fluency in XLSForms, JSON, JavaScript, and CHT-specific conventions. Governments adopting the CHT as their national platform remain dependent on a small pool of developers for every change: a minor update can require a full development cycle.

How a small change moves today:

1. A program officer or district clinician proposes a change.
2. Service designers batch it with other small requests, and the batch is approved in whole or in part.
3. Service designers create mock-ups, and the mock-ups are approved.
4. CHT app developers code the mock-ups.
5. A reviewer checks the XLSForm and approves the pull request.
6. IT updates the app, and health workers' phones pick it up on the next sync.

A large change adds clinician interviews, decision tables and flowcharts as mock-ups, clinician-written test cases, developer tests and clinical testing of the software.

What this costs:

- A label or translation fix is about five minutes of work, yet it waits for the whole cycle.
- Developers are few and backlogs are full, so many changes are never made.
- Service designers spend a lot of time scanning and summarizing national guidelines by hand.
- Developers can misread clinical intent, which leads to rounds of test and repair.
- When a ministry updates a protocol, months can pass before the change reaches a health worker. In Nepal, a mental health program could not adapt its own forms without outside IT contractors. A humanitarian partner needs survey forms adapted within days of a flood.

Changes must also stay safe, because a small logic change can change who receives care. An internal audit of Medic's editor prototype found a bug that dropped a pair of brackets. It would have widened who sees 11 of 24 forms in a national configuration. Every existing check passed; running synthetic contacts through both versions is what exposed it.

### Agreed Solution Statement

> An AI-powered, no-code configuration system using Amazon Bedrock that lets non-technical health ministry teams create CHT workflows from clinical guidelines, automatically validates logic completeness and correctness, and confirms deployed forms faithfully reproduce approved clinical intent through synthetic-patient testing, shifting governments from platform dependence to true ownership.

### Business Drivers

- **Ministry ownership.** Eight governments run the CHT as their national community health platform. They need to adapt it themselves rather than wait on outside developers.
- **Guidance changes faster than development cycles.** Protocol updates, outbreaks and emergencies need changes in days.
- **Developer capacity is the constraint.** Implementers ranked easier configuration among their top platform needs in Medic's 2025 CHT Community Survey.
- **AI makes guideline extraction practical now.** Models can read guidelines and draft logic, provided people approve and deterministic code builds.
- **Foundations exist.** Medic has a no-code editor prototype validated against Nepal's national configuration, an AI assistant prototype, verification research with UC Berkeley, and a cross-organization squad. Medic applied for an AWS Imagine Grant 2026 for this work.

### Target Users and Stakeholders

| User Type | Description | Primary Need |
|-----------|-------------|--------------|
| Program officer or service designer | Turns guidelines and field feedback into workflow changes. Excel skills, no code. | Make safe changes without an IT ticket, and spend less time scanning guidelines |
| Program reviewer | A program lead who approves plain wording changes and passes anything with clinical meaning to a clinician | Approve small fixes quickly, and know when a clinician must decide |
| Clinician (chief clinical staff, district clinical team) | Approves anything with clinical meaning. Clinical skills, no code. | Confirm a rule matches the protocol in minutes, with a durable sign-off record |
| National IT or digital health team | Approves deployments and runs the systems | Changes that arrive reviewed, tested and reversible |
| CHT app developer | Handles what the no-code path cannot | Fewer small-change interruptions, and an escape hatch to code that never loses work |
| Community health worker (CHW) | Uses the workflow on every household visit. Never authors. | Correct, short, well-translated forms that update on the next sync |
| Patients and caregivers | Shaped by every clinical decision in the workflow | Care that follows current guidance |
| Ministry of Health leadership | Owns the national platform and its clinical content | Control of their own workflows, with evidence of testing and approval |
| Medic | Stewards the CHT and its community of practice | A path from the hackathon build to a supported CHT capability |

No one person drafts, approves and deploys a clinical change. At the event, the system flags each change that needs a clinician, and Medic makes an example decision in that role. Nothing built at the event is clinically validated.

### Business Constraints

- **Clinical safety first.** No change reaches a health worker without human approval, and clinical changes need a clinician.
- **Model limits.** Models draft and check. They never write the configuration that ships, and they never judge whether a test outcome is correct.
- **No AI at the point of care.** Health worker devices run standard, deterministic CHT configuration that works offline.
- **Ministry ownership.** Output is standard CHT configuration that ministries can read, version, reverse and run without Medic or any single vendor. The model must stay replaceable.
- **Open source.** The CHT and Medic's tools are open source. cht-ui-builder and cht-ai-tools are licensed AGPL-3.0, and test-data-generator GPL-3.0. Contributions must be compatible.
- **Data.** Synthetic data or public guidelines only. No patient data or real credentials at the event. Medic's test data generator supplies synthetic CHT records.
- **Event.** Two build days and no access to Medic's or any ministry's environment. Each team gets an empty AWS sandbox account in US West (Oregon), with every AWS service and Bedrock model enabled and $500 to spend across all of them.

### Success Metrics

Product metrics, after the event, with targets from Medic's grant proposal:

| Metric | Current State | Target State | Measurement Method |
|--------|--------------|--------------|-------------------|
| Time from requested form change to deployed change | Weeks to months; a label fix waits for a full development cycle | Days | Timestamps in the change record, from request to deploy approval |
| Routine form edits completed without a developer | Every change routes through developers | Most routine edits | Change record by author role |
| Changes passing diff review and automated validation before deployment | Manual review only | 100% | Pipeline record per change |

Event metrics, for the MVP demo:

| Metric | Current State | Target State | Measurement Method |
|--------|--------------|--------------|-------------------|
| Pathway branches covered by synthetic patients | Not measured | 100% of branches in the demo pathway | Synthetic-patient report |
| Golden cases that match their expected outcome | Not measured | All match, or each mismatch is shown before approval | Golden-case report |
| Time for one pathway from guideline to approved, tested build | A full development cycle | Minutes, excluding time spent waiting for the approver | Timed demo run, with the time for each step recorded |
| Model cost for one pathway run, from guideline to approved, tested build | Not measured | Recorded and reported in the README | Token counts from the model-call trace, priced at the Region's on-demand rates |
| AWS spend across the event | Not measured | Within the sandbox's $500 | AWS Cost Explorer, filtered by the project tag |

---

## MVP Scope

### Full Scope Vision

The full product, as planned in Medic's grant proposal, has three stages:

- **Editor release, Q1 to Q2 2027.** The no-code editor becomes a supported CHT capability in Nepal's national program and one more deployment. Non-technical staff make form changes.
- **Guideline generation, Q2 to Q3 2027.** Guideline-to-flowchart-to-form generation runs behind the same review gate, benchmarked against expert-built reference configurations.
- **Scale, Q4 2027.** A wider validation suite and synthetic-patient testing, rolled out to more CHT deployments.

The full product covers many pathways, translations, targets, release through each implementer's CI/CD pipeline, and production CHT instances. The MVP proves the core loop on one pathway.

### Build Tracks

Every team works toward the same objective and holds the same rules. Each team takes one track and picks its own public guideline and pathway.

| Track | What the team builds | What Medic keeps |
|-------|----------------------|------------------|
| Open path | Guideline straight to a cht-conf project, with no form editor in the loop. The team designs the approver experience: a visual review, a chat with an agent, or both. It also chooses its inputs, tools and AWS services, within the same rules. | Evidence for the approach, and parts worth reusing |
| Reference path | AI-assisted build and edit inside cht-ui-builder, Medic's open-source editor. Edits are routed by risk to the right reviewer. | A working branch of cht-ui-builder to keep building |

### MVP Objective

Prove on one bounded clinical pathway that a public guideline, or an edit to an existing form, can become CHT configuration that builds and passes synthetic-patient tests. A human approval sits in between, and the system cannot skip it.

### MVP Success Criteria

- [ ] One pathway from a public guideline produces a draft that a non-developer can review without reading XLSForm, XPath or JavaScript.
- [ ] Every ambiguity the system finds is shown with its source passage; none is resolved silently.
- [ ] Logic checks flag missing branches, overlapping conditions and unreachable questions before approval.
- [ ] Nothing reaches the release build until a reviewer approves, and the approval is recorded against an exact version. A sandboxed preview build may run first to give the reviewer evidence; it can never be deployed.
- [ ] The approved logic compiles into CHT configuration that CHT's own build tooling accepts.
- [ ] Synthetic patients cover every branch, and each produces the outcome the approved logic predicts.
- [ ] Every golden case gives its expected outcome, or the mismatch is shown to the reviewer before approval.
- [ ] Reference path only: a logic edit shows before and after outcomes for the same synthetic patients, and a wording edit shows that none changed.

### Well-Architected Targets for the Deliverable

Each team's deliverable targets all six pillars of the AWS Well-Architected Framework. Every target below restates a constraint, success criterion or metric from this document; the Technical Environment Document lists the technical evidence for each.

| Pillar | Target for the deliverable | Evidence at the day 3 demo |
|--------|----------------------------|----------------------------|
| Operational excellence | Medic can deploy, run and remove the build from its README without the team, and can trace any change from request to deploy | A deploy into a fresh account from the README, or a walk-through of the deploy code if time is short; one change's record, end to end |
| Security | No personal data or real credentials enter the system, nothing is reachable without sign-in, and no single person can draft, approve and deploy a clinical change | The access model, input screening, and approvals bound to an exact version |
| Reliability | A pending approval survives a restart, configuration that fails CHT's own build never ships, and every change can be reversed | A restart during an approval wait; the logic checks flagging a gap before approval; a rollback to the previous version |
| Performance efficiency | One pathway goes from guideline to an approved, tested build in minutes, with models used only for drafting and cross-checking | The timed demo run (Success Metrics) |
| Cost optimization | The build stays within its sandbox's $500, the model cost of one pathway run is known, the model can be swapped without code changes, and nothing keeps running after the event | Spend to date and the cost per run in the README (Success Metrics), and the teardown command |
| Sustainability | Compute runs only while building or testing, no model is trained, and health workers' phones gain no AI and no extra load | Instances stopped outside build hours; output that is standard, offline CHT configuration |

### Features In Scope (MVP)

| Feature | Description | Priority | Rationale for Inclusion |
|---------|-------------|----------|------------------------|
| Guideline intake and extraction (both tracks) | Read the public guideline the team picked and draft one pathway's questions, decision rules and follow-up schedule. On the Open path, the guideline's format and the tools that read it are the team's choice. | Must Have | The agreed solution starts from clinical guidelines |
| Source tracing and ambiguity flags (both tracks) | Link each rule to the guideline passage it came from; flag gaps and contradictions for a person | Must Have | Reviewers need sources to approve quickly, and real guidelines carry ambiguities |
| Logic checks (both tracks) | Check that branches are complete, exclusive and reachable, and that every decision table closes with a catch-all | Must Have | The agreed solution requires automatic validation of completeness and correctness |
| Golden-case check (both tracks) | Run about a dozen golden cases through the drafted logic and show any mismatch before approval. The team writes the cases from its guideline's worked examples and decision tables, and Medic confirms them in the clinician's role. | Must Have | Tests the logic against the guideline, which synthetic patients alone cannot do |
| Independent cross-check (both tracks) | A second, independently prompted pass re-extracts the logic, and disagreements are flagged | Should Have | Catches extraction errors; the first item to drop if day 1 runs long |
| Content approval (both tracks) | A reviewer approves, or rejects with notes; approval binds to one exact, versioned snapshot of the logic | Must Have | Nothing may reach the release build without a person |
| Deterministic compile (both tracks) | Code, not a model, turns approved logic into standard CHT configuration: forms, plus tasks where the pathway needs follow-up | Must Have | What the reviewer approved must be exactly what is built |
| Synthetic-patient verification (both tracks) | Generate patients for every branch; compute expected outcomes from the approved logic; run them through the built form and report matches | Must Have | The agreed solution requires proof that forms reproduce approved clinical intent |
| Deploy approval and change record (both tracks) | Show the diff and test report for a second approval; record who drafted, approved and tested each version; keep every version reversible | Must Have | Completes the two-approval model. Uploading to a CHT test instance is a stretch goal |
| Approver experience (Open path) | A visual review (flowchart or decision table), an agent chat (questions and change requests), or both; the team chooses | Must Have (at least one) | Medic wants to learn which works better for clinicians |
| New from guideline in the editor (Reference path) | After clinical approval, the draft compiles into cht-ui-builder's form model and opens as an ordinary editable form. Later edits follow the edit route. | Must Have | Pairs AI drafting with visual fine-tuning |
| Plain-language edit requests (Reference path) | A request becomes a proposed change in the editor's structured terms, which the editor's own code applies and shows as a diff before saving | Must Have | Most real work is editing existing forms |
| Risk routing (Reference path) | Changes to relevance, calculations, constraints, task conditions or schedules always go to a clinician, as does clinical wording such as danger-sign or rationale text. Plain wording goes to a program reviewer, who escalates anything with clinical meaning. Renaming a field on a deployed form is blocked. | Must Have | Keeps small fixes fast without skipping clinical review |
| Before and after check (Reference path) | In a sandboxed preview build that can never be deployed, run the same synthetic patients through the old and new versions and list every changed outcome before the reviewer decides | Must Have | Shows the clinician exactly what an edit changes |
| Approval screen (Reference path) | Grow the editor's read-only decision tables and logic graph into a screen with approve, reject and a recorded sign-off | Must Have | The editor has no approve action today |

### Features Explicitly Out of Scope (MVP)

| Feature | Reason for Deferral | Target Phase |
|---------|-------------------|--------------|
| Production deployment to a ministry or Medic instance | Needs Medic's environment and release process | After the event, if a Medic build wins its site |
| Real patient data or real CHT credentials | Event data rules | Not at the event |
| AI on health worker devices or at the point of care | Clinical safety; runtime stays deterministic and offline | Not planned |
| More than one pathway, or a whole guideline | Two build days; prove one pathway end to end first | Phase 2 |
| Targets and dashboards | No structured model for targets yet | Phase 2 |
| Contact hierarchy, user roles and permissions setup | Existing templates cover the demo | Phase 2 |
| Translation workflows beyond the demo language | Adds review steps without testing the core idea | Phase 2 |
| Editing hand-written task logic or helper functions in existing configurations | Not yet safe in cht-ui-builder | Phase 2 |
| Live form preview on a simulated device | Not built in cht-ui-builder yet | Phase 2, or a Reference path stretch goal |
| Formal theorem proving of decision tables | Needs UC Berkeley's clinical logic format and synthetic-patient harness, which are not available at the event; logic checks cover the MVP | Phase 2 |
| Multi-user accounts and single sign-on for the tool | Not needed to prove the core idea | Phase 2 |
| Changes to cht-core or cht-conf themselves | Teams use them as they are | Not planned |

### MVP User Journeys

#### Journey 1: New pathway from a guideline (both tracks)
1. A program officer uploads a public guideline and picks one pathway, such as child cough and fast breathing.
2. The system drafts the pathway's questions, decision rules and follow-up schedule, each linked to its source passage.
3. Logic checks and the golden cases run. The officer sees flagged gaps, ambiguities and mismatches, and resolves them or passes them to a clinician.
4. A clinician reviews the logic in clinical terms, sends it back once with a note, then approves the revision.
5. The approved version compiles into CHT configuration and goes through the release build.
6. Synthetic patients walk every branch; the report shows predicted and actual outcomes side by side.
7. The national IT lead sees the diff and the test report and approves the deploy.

**Outcome**: An approved, tested CHT configuration for one pathway, with a record of who drafted, approved and tested each version.
**Limitation vs Full Vision**: One pathway in one language. The deploy reaches the team's own CHT test instance at most, roles are role-played (Medic makes the clinician's example decisions), and there is no translation or release workflow.

#### Journey 2: Questioning the draft in conversation (Open path, if the team builds chat)
1. A clinician asks the agent what happens for a child under two months.
2. The agent answers from the drafted logic and the guideline, citing both.
3. The clinician asks for a change. The system re-checks the logic and shows the updated version.
4. The clinician approves. The approval binds to that exact snapshot, not to the conversation.

**Outcome**: The clinician reviews by asking questions instead of reading tables, and the approval still points at exactly what will be built.
**Limitation vs Full Vision**: One pathway, no conversation history across sessions, and one language.

#### Journey 3: Editing logic in an existing form (Reference path)
1. A program officer opens a form built in cht-ui-builder and asks, in plain words, to add a danger sign that triggers referral.
2. The system proposes a structured change and shows the diff before saving.
3. A sandboxed preview build runs the same synthetic patients through the old and new versions.
4. Because the change touches logic, it goes to a clinician, who sees the changed branches highlighted with the before and after outcomes.
5. The clinician approves. The release build, the full synthetic-patient tests and the deploy approval follow.

**Outcome**: A logic change reviewed by the right person, with evidence of exactly what it changes.
**Limitation vs Full Vision**: Only forms built by cht-ui-builder or its templates; no hand-written task logic; no live preview.

#### Journey 4: Fixing wording (Reference path)
1. A program officer corrects a label or translation.
2. A program reviewer confirms it carries no clinical meaning, or sends it to a clinician.
3. An automatic check confirms synthetic-patient outcomes are unchanged. The release build and deploy approval follow.

**Outcome**: A small fix moves without a developer or a development cycle.
**Limitation vs Full Vision**: Deploys to a test instance at most; no translation management.

### MVP Constraints and Assumptions

- **Assumption**: One pathway from a public guideline can be extracted, checked and built in two build days. - **Risk if wrong**: The demo stops before build and test. Teams pick a bounded pathway from a well-structured guideline; Medic suggests examples such as child cough and fast breathing, diarrhoea, fever in a malaria area, or malnutrition danger signs.
- **Assumption**: The $500 in each sandbox covers three days of models, compute and storage, including coding assistants that run on Bedrock. - **Risk if wrong**: A team runs out before the demo. Teams set a budget alert, use the smallest model that does each job, and stop instances when idle (see the Technical Environment Document).
- **Assumption**: Each team sets up its own CHT instance, cht-conf and dependencies in its sandbox on the morning of day 1; teams cannot set up before the event. - **Risk if wrong**: Setup runs into the first build afternoon. Medic's setup path links the CHT's own guides step by step (a CHT instance, the reference configuration, a first form and synthetic test data) and ends with a warm-up on one existing workflow. Medic's published development image covers the build tools, and Medic staff are on site to help (see the Technical Environment Document).

### MVP Definition of Done

- [ ] All "Must Have" features for the team's track are implemented, tested and shown end to end on one pathway.
- [ ] Every design rule in the Technical Environment Document holds in the demo.
- [ ] The synthetic-patient report covers every branch, and every outcome matches.
- [ ] Every golden case matches, or its mismatch was shown before approval.
- [ ] Code sits in a repository shared with Medic, with infrastructure as code and a README that deploys it into a fresh AWS account.
- [ ] The README maps the build to each Well-Architected target above, linking each to its evidence, reports the model cost of one pathway run, and shows total spend within the sandbox's $500.
- [ ] Reference path: changes sit on a branch of cht-ui-builder with its existing tests passing and a short handoff note in the repository's docs.
- [ ] A Medic representative confirms the demo against these criteria.

---

## Risks and Dependencies

### Key Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Setting up CHT's build and test tooling and a CHT test instance takes most of the first build day, since each team sets up its own on day 1 and cannot start before the event | Medium | High | Medic's setup path links the CHT's own guides, which are written for technical users, step by step, and ends with a warm-up workflow. Teams set up on EC2, where downloads are fast. Medic's published development image covers the build tools, and Medic staff are on site to help |
| Team environments drift apart, so a build works for one team but not another, or not for Medic after handover | Medium | Medium | Teams pin tool versions in a build image made from a Dockerfile, and run the reference configuration's tests during setup to prove the toolchain |
| Extraction from a full guideline is unreliable | Medium | High | One bounded pathway, source tracing, ambiguity flags, golden cases and human approval |
| Teams lack CHT knowledge | High | Medium | Five explainer films, the setup path's warm-up on one reference workflow, Medic's CHT skills for coding assistants, the CHT documentation assistant (hosted, or Ask AI on the documentation site), and Medic staff on site |
| The hosted documentation assistant's request limit stops teams mid-task; everyone on the venue network shares it | High | Low | Teams learn the limit and the fallbacks during setup: Ask AI on the documentation site, or a local copy of the documentation in their coding assistant |
| The approval view disagrees with what is built | Medium | High | Generate the view from the same model the compiler uses, and test it |
| A model ends up judging test results | Medium | High | Compute expected outcomes from approved logic; review each team's design on day 1 |
| Scope grows into more pathways or production features | Medium | Medium | Hold to the in-scope list; finish one pathway end to end first |
| Reference path edits damage existing forms | Medium | High | Start from tool-built forms; keep cht-ui-builder's round-trip tests passing |
| A team spends its $500 before the demo, most likely on large models or on coding assistants running on Bedrock | Medium | High | A budget alert, the smallest model that does each job, prompt caching, and instances stopped when idle (Technical Environment Document) |

### External Dependencies

- AWS sandbox accounts in US West (Oregon), with every AWS service and Bedrock model enabled and $500 each - AWS - Confirmed
- A public guideline and pathway for each team - Teams - Chosen at the event, from Medic's examples or their own
- About a dozen golden cases for each pathway - Teams, confirmed by Medic in the clinician's role - Written at the event
- Example decisions in the clinician's role, and setup help on site - Medic - Confirmed
- Medic's setup path for teams: step-by-step links to the CHT's own setup guides, test data steps and a warm-up workflow - Medic - Ready, in the Technical Environment Document
- Medic's published development image with CHT's build tools (cht-app-ide) - Medic - Available
- Medic's open-source tools: cht-ui-builder, cht-ai-tools, test-data-generator, and the CHT build and test tools - Medic - Available
- Hosted CHT documentation assistant, at its standard request limits - Medic - Available; limits will not be raised for the event

### Open Questions

Each team answers these at its day 1 design review:

- [ ] Which track is the team taking, and which public guideline and pathway will it build?
- [ ] Which dozen or so golden cases, taken from the guideline's worked examples and decision tables, will test the logic?
- [ ] Open path: will the approver review a visual (a flowchart or decision table), chat with an agent, or both?
- [ ] Reference path: which form, built by cht-ui-builder or its templates, will the edit journeys start from?
