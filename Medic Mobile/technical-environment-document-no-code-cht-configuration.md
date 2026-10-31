# Technical Environment Document: No-Code CHT Configuration

**Organization:** Medic, steward of the open-source Community Health Toolkit (CHT)
**Event:** AWS Breaking Barriers 2026, November 3 to 5: two build days, then presentations on day 3
**Companion document:** Vision Document: No-Code CHT Configuration
**Last updated:** October 29, 2026

---

## Project Technical Summary

- **Project Name**: No-Code CHT Configuration (Medic, AWS Breaking Barriers 2026)
- **Primary Runtime Environment**: Cloud. AWS sandbox accounts during the event, and Medic's AWS account if a Medic build moves forward afterwards.
- **Cloud Provider**: AWS
- **Target Deployment Model**: Containers on Amazon EC2. Every service runs as a container on EC2 instances, including the team's build-and-test container, based on Medic's published `medicmobile/cht-app-ide` image, and a CHT test instance started with the CHT Docker Helper. Managed AWS services handle models, document extraction and storage.
- **Customer Team Experience**: Medic's engineers build in TypeScript on Node.js (cht-conf, cht-ui-builder and cht-agent are Node.js tools), with Python for form tooling. They configure the CHT with XLSForm, JavaScript and JSON, and run applied AI on AWS (Amazon Bedrock, Lambda, API Gateway, S3, SQS). Medic builds AI tooling for Claude Code and OpenCode (cht-ai-tools). Medic manages infrastructure with Terraform and does not use AWS CDK today. The CHT itself ships as Docker images.

---

## Programming Languages

### Required Languages

| Language | Version | Purpose | Rationale |
|----------|---------|---------|-----------|
| TypeScript | 5.x | Services, AWS CDK code when a team chooses CDK, and any work inside cht-ui-builder | Medic's Node.js repositories are TypeScript; one language eases handover |
| JavaScript on Node.js | Node.js 22 | Runtime for cht-conf, test-data-generator designs and generated CHT logic such as `tasks.js` | CHT configuration logic runs as JavaScript. cht-ui-builder's hosted mode and the CHT's own setup guide use Node.js 22. cht-conf needs Node.js 20 or later, which Medic's cht-app-ide image ships |
| XLSForm | As accepted by cht-conf | Form definitions produced by the compiler | The CHT's native form source format |

### Permitted Languages

| Language | Conditions for Use |
|----------|-------------------|
| Python 3.10 or later | Scripts such as the cht-ai-tools XLSForm scripts and cht-form-builder's generator. Also isolated services where a Python library is clearly better, such as PDF processing. cht-conf's form conversion already needs Python 3.10 or later. |
| HCL (Terraform) | Infrastructure as code, when a team chooses Terraform, Medic's current standard |
| Bash | Container entrypoints and short glue scripts. Anything longer belongs in TypeScript or Python. |

### Prohibited Languages

| Language | Reason |
|----------|--------|
| Any language outside the two lists above, such as Java, C#, Go, PHP or Ruby | Medic maintains TypeScript, JavaScript, Python and Terraform; anything else blocks handover |

---

## Frameworks and Libraries

### Required Frameworks

| Framework/Library | Version | Domain | Rationale |
|-------------------|---------|--------|-----------|
| Terraform with the AWS provider, or AWS CDK in TypeScript | Terraform 1.x; CDK 2.x | Infrastructure as code | Medic manages infrastructure with Terraform and does not use CDK today. Teams may use either: Medic will port a CDK build to Terraform, or adopt CDK. |
| Docker and Docker Compose | Docker Engine with Compose v2 | Containers on EC2 | Medic uses containers wherever possible, the CHT itself ships as Docker images, and the CHT Docker Helper needs Compose v2 |
| AWS SDK for JavaScript | v3 | Calls to Bedrock, Textract, S3 and DynamoDB | Standard for TypeScript on AWS. Python code uses boto3. |
| cht-conf | The version the target configuration pins; cht-ui-builder bundles ^6.5.0, and the current release is 6.6.1 | Validate, convert, compile and upload CHT configuration | The only supported CHT build path |
| cht-conf-test-harness | The version the target configuration pins; cht-core's reference configuration uses ^5.0.4 | Synthetic-patient tests through the real forms and tasks | Tests the built configuration, not a model of it |
| cht-ui-builder's stack (Reference path only) | React 18, Vite 6, Zustand 5, React Flow 11, Fastify 5, ExcelJS 4, pnpm, `node --test`, Playwright | Editor UI, server and shared form model | Staying inside the repository's stack lets Medic merge the branch |

### Preferred Libraries

| Library | Purpose | Use When |
|---------|---------|----------|
| Zod or Ajv | Validate every model output against a schema before use | Any model response that drives the next step |
| ExcelJS (TypeScript) or openpyxl (Python) | Read and edit XLSForm cells | Changing an existing `.xlsx` form. The cht-ai-tools scripts use openpyxl. |
| cht-form-builder's `generate-xlsform.py`, from the cht-ai-tools branch `feat/add-cht-form-builder` | Writes a complete XLSForm from structured JSON, deterministically | A new form on the Open path, as the last step of the compiler |
| LangGraph.js | Agent orchestration inside a service | A team wants an agent graph in its orchestrator; Medic's cht-agent uses it |
| Amazon CloudWatch, or Langfuse self-hosted in a container in the account | Tracing model calls | Always. Langfuse Cloud would send traces outside the account |
| medic/test-data-generator | Synthetic places, contacts, users and reports | Seeding a CHT test instance |

### Prohibited Libraries

| Library | Reason | Alternative |
|---------|--------|-------------|
| Model clients that bypass Amazon Bedrock, such as direct calls to other model providers or model routers | Model calls stay inside the AWS account, and the agreed solution names Amazon Bedrock | Bedrock Runtime through the AWS SDK. Coding assistants can use Bedrock too: Claude Code with `CLAUDE_CODE_USE_BEDROCK=1`, or OpenCode's Amazon Bedrock provider. |
| Model-as-judge evaluators in the test path | A model must never judge whether an outcome is correct | Deterministic checks: outcomes computed from approved logic, assertions on compiled forms |
| Tools that regenerate an existing workbook wholesale, such as rewriting it from a dataframe | They drop columns, formulas and formatting that existing CHT forms rely on | Cell edits with ExcelJS or openpyxl. New forms come from a deterministic writer such as cht-ui-builder's `serializeXlsForm` or cht-form-builder's generator. |

---

## Cloud Environment

### Cloud Provider

- **Primary Provider**: AWS
- **Account Structure**: One empty sandbox account per team during the event, with every AWS service and Bedrock model enabled. Each team runs its own CHT instance, cht-conf, dependencies and other tools in it. If a Medic build wins its site, it moves into Medic's account from the same infrastructure code.
- **Regions**: US West (Oregon), `us-west-2`. Claude models are called through US cross-region inference profiles (the `us.` model IDs). No disaster recovery region at the event.
- **Budget**: $500 per sandbox, for any AWS service. It covers model calls, including coding assistants that run on Bedrock, as well as compute and storage. Model calls are the main cost; three days of EC2 for a team's instances is a small share. Set AWS Budgets alerts at $250 and $400, use the smallest model that does each job, cache guideline text that calls repeat, stop instances outside build hours, and tag every resource so Cost Explorer shows spend by component.

### Services in the Reference Architecture

| Service | Role |
|---------|------|
| Amazon EC2 | Runs every container: one instance for the team's services, its build-and-test container and, if the team develops in the cloud, a development workspace; and one more for the team's own CHT test instance, started with the CHT Docker Helper. Suggested sizes: a t3.xlarge for the services and a t3.large for the CHT test instance, both running Ubuntu. Use x86_64 instance types: the cht-app-ide image is published for amd64 only, and the harness downloads an x86_64 Chromium. The CHT asks for at least 4 GB of memory, 2 CPUs and 8 GB of disk for each developer instance. |
| Amazon ECR | The team's container images, including its build-and-test image |
| Amazon ECS with EC2 capacity | Optional: managed restarts, scheduling and a separate IAM role per container, on the same EC2 instances |
| Amazon Bedrock | Drafts and cross-checks the logic. Guardrails screen inputs for personal data; a Knowledge Base over public CHT documentation grounds the drafts in CHT conventions |
| Amazon Textract | One way to pull text and tables from guideline PDFs. Open path teams may choose another. |
| Amazon S3 | Versioned guidelines, logic snapshots, build artifacts and reports |
| Amazon DynamoDB | Pipeline state, pending approvals and the audit index |
| AWS Systems Manager | Session Manager for shell access and port forwarding, including to the CHT test instance, so no SSH port is open |
| AWS Secrets Manager | Credentials for the CHT test instance |
| Amazon CloudWatch | Logs from every container through Docker's `awslogs` driver, plus metrics and alarms |
| Application Load Balancer with Amazon Cognito | Optional: a signed-in HTTPS entry to the review or editor UI. At the event, Session Manager port forwarding can stand in. |
| AWS Step Functions | Optional: managed approval waits, using task tokens that the orchestrator completes |
| AWS Lambda | Optional, for small event glue only, such as reacting to a guideline upload |

### Service Disallow List

| Service | Reason | Alternative |
|---------|--------|-------------|
| AWS Fargate | Medic's direction for this project is containers on EC2 | Docker on EC2, or Amazon ECS with EC2 capacity |
| AWS Lambda for application logic | Application logic runs in containers on EC2 | A container on EC2. Lambda stays allowed for small event glue. |
| AWS Elastic Beanstalk | Its platform layer hides the instances and containers Medic would run | EC2 and containers defined in Terraform or CDK |
| Amazon SageMaker for training or hosting models | No model training is in scope | Managed models on Amazon Bedrock |
| Model endpoints outside AWS | Data stays inside the account | Amazon Bedrock |
| Amazon RDS and Amazon Aurora | The design holds no relational data | DynamoDB and S3 |
| Amazon Kinesis and Amazon MSK | More than the workload needs | EventBridge or SQS |
| Public S3 buckets, unauthenticated endpoints, or instances with open SSH or admin ports | Security | Private buckets; Session Manager for shell access; Cognito sign-in on any public endpoint |

---

## Preferred Technologies and Patterns

### Architecture Patterns

| Pattern | When to Use | When Not to Use |
|---------|-------------|-----------------|
| Containers on EC2, defined in code | Every service: the team's orchestrator, review UI and API, its build-and-test container and the CHT test instance. Each service the team builds has a Dockerfile in the repository, and Docker Compose brings a team's services up on its instance. The CHT test instance comes from CHT's published images through the Docker Helper. | Never install tools on an instance by hand; build them into an image |
| Amazon ECS with EC2 capacity | A team wants managed restarts, scheduling, or a separate IAM role per container | Not needed for a single-instance demo |
| Orchestrator with durable state | Pipeline steps and both approval waits. State lives in DynamoDB, so a restarted container resumes where it stopped. | Never hold a pending approval only in memory |
| One-off build containers | Each release or preview build runs in a fresh container from the team's build-and-test image, with the snapshot mounted read-only and a new output folder | Never reuse a build container between snapshots |
| Recorded human approval | Every approval: the pipeline resumes only from a decision recorded against a snapshot, in DynamoDB or through a Step Functions task token | Never skip an approval for speed |
| Deterministic compiler | Turning approved logic into CHT configuration | Never replace it with a model call |
| Structured edit proposals | Any model-proposed change: the model emits schema-checked JSON, and code applies it | Never let a model write `.xlsx` files or CHT JavaScript directly |
| Sandboxed preview builds | Producing before and after evidence for a reviewer | Never deploy a preview build |
| Append-only audit records | Every prompt, logic snapshot, approval and test report, kept in versioned S3 and indexed in DynamoDB | Never overwrite a record in place |
| Modular monolith | The Reference path: cht-ui-builder is one pnpm monorepo | Splitting the editor into services during the event |
| Event-driven messaging (EventBridge or SQS) | Notifications and asynchronous test runs | Simple request and response calls |

### Reference Flow

This is the grant architecture, scoped for two build days and moved onto containers on EC2. The Reference path follows it. On the Open path it is one example among many (see Choosing Tools on the Open Path, below).

1. A guideline PDF lands in a versioned S3 bucket.
2. Textract extracts its text and tables.
3. Bedrock drafts one pathway into a structured logic model, validated against a JSON schema. A second, independently prompted call cross-checks it.
4. Deterministic validators in the orchestrator check completeness, exclusivity, reachability and closed decision tables, and run the golden cases through the logic.
5. The pipeline waits for content approval in the review UI.
6. A deterministic compiler turns the approved snapshot into an XLSForm, plus `tasks.js` where the pathway needs follow-up. On the Reference path it compiles into cht-ui-builder's form model, and the editor's serializer writes the files.
7. A one-off container from the team's build-and-test image runs the release build: cht-conf conversion, then synthetic patients through cht-conf-test-harness, then a report.
8. The pipeline waits for deploy approval of the diff and the report.
9. Stretch goal: cht-conf uploads to the team's CHT test instance, and test-data-generator seeds it with synthetic households and users. A deterministic check then confirms that the app settings the instance serves match the build.

**Where it runs**: The team's orchestrator, review UI and API run as containers on the team's EC2 instance, beside its build-and-test container. The CHT test instance runs on its own instance, started with the CHT Docker Helper from CHT's published images. Bedrock, Textract, S3 and DynamoDB are managed services that the containers call.

**Reference path edits** start in the editor. A sandboxed preview build runs the same synthetic patients through the old and new versions. Logic edits then go to a clinician at step 5, with those before and after outcomes; plain wording goes to a program reviewer. Every edit continues through steps 7 and 8.

### Choosing Tools on the Open Path

Open path teams choose their own inputs, tools and AWS services for every step. A few things stay fixed: the design rules below, model calls through Amazon Bedrock, compute in containers on EC2, synthetic or public data, and output that builds with cht-conf.

- **Inputs**: A guideline PDF is one option. Teams may also start from a web page, a photo of a flowchart, a conversation with a clinician, or the decision-support logic spreadsheets in WHO SMART Guidelines digital adaptation kits.
- **Reading the guideline**: Claude models on Bedrock read PDFs directly, including charts and tables, through the Converse and InvokeModel APIs. Amazon Bedrock Data Automation, Amazon Textract and open-source parsers in a container are other options.
- **Agents and orchestration**: Any framework that runs in a container, such as LangGraph.js.
- **Other AWS services and tools**: Welcome, unless they appear on the disallow list or among the prohibited libraries. Open-source tools need licenses compatible with Medic's (AGPL-3.0).
- **Record the choices**: The README lists each tool and service and why it was chosen, so Medic can plan the handover.

### Design Rules Every Team Holds

1. Models never write compiled configuration. Deterministic code compiles approved logic, and model-proposed edits are structured proposals that code applies.
2. Every change gets two human approvals: content before the release build, and deploy before upload. Clinical changes need a clinician.
3. AI drafts and hand edits take the same path and the same checks.
4. Approval binds to one exact, versioned snapshot of the logic, never to a conversation.
5. The approver's view comes from the same model the compiler uses.
6. Expected outcomes come from the approved logic. A model never judges a test.
7. Ambiguity is flagged for a person, never resolved silently.
8. Synthetic data only: no personal data in prompts and no real CHT credentials.
9. Nothing generative runs on a health worker's phone.
10. Output is standard CHT configuration that builds with cht-conf, and every change is reversible.

---

## Medic Tools for a Faster Start

All of these are open source or publicly hosted, so teams can use them without access to Medic's environment. Each team sets up its own environment by following the setup path below.

### Setup path for teams

Each team runs its own CHT instance, cht-conf and dependencies in its sandbox, and sets them up on the morning of day 1; there is no setup before the event. The CHT's guides are written for technical users, and Medic staff are on site to help. Set up on an Ubuntu EC2 instance rather than over the shared venue network: the CHT's images are large downloads, and the guides' Linux commands work as written on Ubuntu.

1. **Install the tools.** Follow [Getting Started Building a CHT App](https://docs.communityhealthtoolkit.org/building/local-setup/) for Docker with Compose v2, git, Node.js 22 and `xsltproc`, then run `npm install -g cht-conf`. cht-conf also needs Python 3.10 or later to convert forms. The same guide offers Medic's `cht-app-ide` image as a VS Code Dev Container, for anyone who would rather not install the tools. The [hosting requirements](https://docs.communityhealthtoolkit.org/hosting/cht/requirements/) ask for at least 4 GB of memory, 2 CPUs and 8 GB of disk for each CHT instance.

2. **Start a CHT instance with the [CHT Docker Helper](https://docs.communityhealthtoolkit.org/hosting/cht/app-developer/#cht-docker-helper).**

   ```shell
   mkdir -p ~/cht-hackathon && cd ~/cht-hackathon
   curl -s -O https://raw.githubusercontent.com/medic/cht-core/master/scripts/docker-helper/cht-docker-compose.sh
   chmod +x cht-docker-compose.sh
   ./cht-docker-compose.sh
   ```

   Answer `y` to create a project, and name it. The helper downloads CHT's images, picks a free port, installs a valid `local-ip.medicmobile.org` certificate, and prints the instance's address, such as `https://127-0-0-1.local-ip.medicmobile.org:10444`, with the login `medic` / `password`. Always run it from its own folder. `./cht-docker-compose.sh <project>.env` starts the project again; add `stop` to stop it, or `destroy` to delete it and all its data without asking.

   On EC2, the address uses the instance's private IP. Forward the port to your laptop with Session Manager, then open `https://127-0-0-1.local-ip.medicmobile.org:<port>`:

   ```shell
   aws ssm start-session --target <instance-id> \
     --document-name AWS-StartPortForwardingSession \
     --parameters '{"portNumber":["<port>"],"localPortNumber":["<port>"]}'
   ```

3. **Build and deploy the sample configuration.** A new instance already runs the [Maternal and Newborn Health reference app](https://docs.communityhealthtoolkit.org/reference-apps/maternal-newborn/), whose source is `config/default` in cht-core. Building it from source proves your toolchain, and the second `cht` command loads its demo places and people ([Upload Test Data](https://docs.communityhealthtoolkit.org/building/local-setup/#upload-test-data)):

   ```shell
   cd ~/cht-hackathon
   git clone --depth 1 https://github.com/medic/cht-core.git
   cd cht-core/config/default
   # The configuration's lint and test packages live at the cht-core root; install only these
   npm install --no-save moment @medic/eslint-config eslint-plugin-json \
     cht-conf-test-harness@^5.0.4 chai chai-like chai-things sinon mocha
   export CHT_URL=https://medic:password@127-0-0-1.local-ip.medicmobile.org:10444   # the address the helper printed
   cht --url="$CHT_URL"
   cht --url="$CHT_URL" csv-to-docs upload-docs
   ```

   Without those packages, the build stops with "Webpack errors when building contact-summary".

4. **Change a form, then write one.** Make a small change to a reference form, such as adding a question (the configuration's [cookbook](https://github.com/medic/cht-core/blob/master/config/default/GUIDE.md) shows how), redeploy with `cht --url="$CHT_URL"`, and find the change in the app. Then follow [Building App Forms](https://docs.communityhealthtoolkit.org/building/tutorials/app-forms/) to write a form from scratch, in a second Docker Helper project or after the warm-up: uploading the tutorial's blank project replaces the reference app. [Building a Simple Task](https://docs.communityhealthtoolkit.org/building/tasks/simple-tasks/) and [Contact and User Management](https://docs.communityhealthtoolkit.org/building/contact-management/contact-and-users-1/) follow on from it.

5. **Generate test data.** Run [test-data-generator](https://docs.communityhealthtoolkit.org/community/contributing/code/test-data/test-data-generator/) with its `easy-mode.js` design, which touches most workflows in the reference configuration. It adds about 15,000 documents, including CHW users with about 300 documents each.

   ```shell
   cd ~/cht-hackathon
   git clone --depth 1 https://github.com/medic/test-data-generator.git
   cd test-data-generator && npm ci
   npm run generate sample-designs/easy-mode.js "$CHT_URL"
   ```

   After the warm-up, write a small design of your own that creates the contacts and reports your chosen workflow needs.

6. **Set up a coding assistant on Bedrock** (optional). For Claude Code, set `CLAUDE_CODE_USE_BEDROCK=1` and `AWS_REGION=us-west-2`, or run `/setup-bedrock`; OpenCode uses its Amazon Bedrock provider. Every Bedrock model is enabled in the sandboxes, and assistant usage counts against the $500. Then add Medic's CHT skills and the cht-docs MCP server, minding its limits (both described below).

### Warm-up: one workflow from service design to configuration

Each team runs this once, together, after the setup path and before designing its build. It takes about an hour and traces how a service design becomes CHT configuration, which is the path every team's build automates.

1. **Pick the workflow.** Start with the pregnancy danger sign workflow, which has the same shape as the pathways teams will build: a danger sign leads to a referral and a follow-up. The test data from step 5 already holds danger sign reports. Log in as one of the seeded CHW users (password `password`; usernames are on the Users page of App Management) and find their danger sign follow-up tasks.
2. **Read its service design.** The [Maternal and Newborn Health](https://docs.communityhealthtoolkit.org/reference-apps/maternal-newborn/#workflows) page sets out each workflow as a condition, a task and a resolution, with links to the form designs and task schedules behind them.
3. **Find each part of the design in the configuration** (`cht-core/config/default`):

   | Service design | Configuration |
   |----------------|---------------|
   | The CHW submits a Danger Sign Form and refers the woman | `forms/app/pregnancy_danger_sign.xlsx`, with `pregnancy_danger_sign.properties.json` controlling where the form appears |
   | The follow-up is due 3 days later | A calculation inside that form: `t_danger_signs_referral_follow_up_date` is today plus 3 days |
   | The task appears at once and stays open 7 days after it is due | `tasks.js`, task `anc.pregnancy_danger_sign_followup`: its event window (`start: 3`, `end: 7`) and the four report types that can raise it |
   | The CHW submits a Danger Sign Follow-Up Form; if the woman still needs follow-up, another task appears | `forms/app/pregnancy_danger_sign_follow_up.xlsx`, which can raise the same task again; the task's `resolvedIf` closes the current one |
   | Danger signs show on the woman's profile | `contact-summary.templated.js` and `contact-summary-extras.js` |
   | The task's title on the CHW's phone | `translations/messages-en.properties` |
   | Tests | `test/tasks/pregnancy_danger_signs.spec.js` and `test/forms/pregnancy_danger_sign_follow_up.spec.js`, run by cht-conf-test-harness |

4. **Run the tests, then change the rule.** From `cht-core/config/default`:

   ```shell
   TZ=Africa/Nairobi npx mocha test/tasks/pregnancy_danger_signs.spec.js \
     test/forms/pregnancy_danger_sign_follow_up.spec.js --timeout 60000
   ```

   Run them as a normal user: the harness's headless Chromium refuses to start as root. The first run downloads Chromium. Then shorten the follow-up window in `tasks.js`, rebuild with `cht --no-check compile-app-settings` (the harness reads the compiled `app_settings.json`, not `tasks.js`), rerun the tests, and redeploy. Do the tests notice? Does the task change in the app?

5. **Decide what you would improve.** Bring written answers to the day 1 design review:
   - One rule from the design ("follow up in 3 days, keep the task open for 7 more") lives partly in a spreadsheet calculation and partly in JavaScript. How would your approver see it as one rule, and how would your compiler keep both parts in step?
   - Which parts of this workflow could a program officer change today without a developer? Which could they change safely with your build?
   - What would a clinician need to see to approve a shorter follow-up window, and which synthetic patients would prove the change?
   - Search the configuration for every form name it refers to. Does each one exist, and would any existing check tell you if one did not?

### Build-and-test image

The pipeline's build-and-test step runs in a container the team builds. Start from Medic's published [`medicmobile/cht-app-ide`](https://hub.docker.com/r/medicmobile/cht-app-ide) image, which the cht-conf repository builds for each cht-conf release.

- **Contents**: Node.js 20, cht-conf, Python 3, `xsltproc`, git, and the system libraries headless Chromium needs. It runs as the non-root `node` user, with `cht` as its entrypoint.
- **Pin a release tag**, such as `v6.6.1`, rather than `latest`.
- **amd64 only**: Run it on x86_64 EC2 instances. On Apple silicon laptops it runs under emulation, more slowly.
- **Bake in the test dependencies**: When building the image, install the configuration's npm packages, including cht-conf-test-harness, and run the harness once so it downloads its Chromium. A build container then needs no network.
- **Chromium's sandbox**: The image's [dev container configuration](https://github.com/medic/cht-conf/tree/main/devcontainer.cht-app-ide) adds the `SYS_ADMIN` capability so Puppeteer can start Chromium. Add only that capability.
- **Development**: The same image works as a VS Code Dev Container (setup path, step 1). Coding assistants and their AWS credentials stay out of the build image.

### cht-ai-tools: Medic's CHT skills for coding assistants

- **What it is**: [medic/cht-ai-tools](https://github.com/medic/cht-ai-tools), Medic's open-source (AGPL-3.0) skills, slash commands, hooks and docs MCP configuration for Claude Code and OpenCode.
- **Skills**:
  - `cht-specialist`: CHT architecture and data model, app settings, tasks, targets, contact summaries, XLSForm, cht-conf, hosting and the API, with a reference file for each.
  - `create-cht-task`: reads the project's forms, asks what follow-up is needed, generates the `tasks.js` code, and can add a calculate row to a form.
  - `create-cht-target`: targets, with counting modes, aggregation and goals.
  - `cht-pr-review`: checks a pull request against its linked issue and its own description.
- **Commands**, installed by the CLI: `/cht-specialist`, `/cht-task`, `/cht-target` and `/cht-pr-review`.
- **Hooks (Claude Code only)**: Both act only in a folder whose `package.json` names cht-conf.
  - `validate-cht` runs `node --check` on `tasks.js`, `targets.js`, `contact-summary.templated.js` and `purge.js` before shell commands. It only warns and never blocks.
  - `format-cht` runs the project's own ESLint fix on those files after the Write tool, and needs `jq`.
- **Scripts**: `read-xlsform.py` lists a form's fields, choices and settings, with relevance and calculations; `--json` gives the full output. `add-xlsform-calculation.py` inserts a calculate row. `detect-cht-project.sh` checks whether a folder is a CHT project and lists its forms and existing tasks. The Python scripts use openpyxl.
- **Install**:
  - Claude Code plugins: `/plugin marketplace add medic/cht-ai-tools`, then `/plugin install` for `cht-specialist`, `create-cht-task`, `create-cht-target`, `cht-pr-review`, `cht-docs-mcp` and `cht-dev-hooks`, each with the suffix `@medic-cht-ai-tools`.
  - CLI: the README's `npx @medic/cht-ai-tools install` fails, because the package is not on npm. From a clone, run `npm ci && npm run build`, then `node dist/index.js install --all --target claude-code`, or `--target opencode`, which skips the hooks. It needs Node.js 18 or later.
- **cht-form-builder**, on the unmerged branch `feat/add-cht-form-builder`, turns an Excel design sheet or a conversation into a complete XLSForm.
  - `parse-design-sheet.py` turns a design sheet into JSON, and `generate-xlsform.py` writes the workbook from JSON. Both are deterministic.
  - Its form-generator agent writes the XPath conditions itself. In the product, conditions must come from the approved logic through the compiler instead (design rule 1).
  - Its `validate-xlsform` hook is a Markdown prompt that the branch does not register as a Claude Code hook, so it does not run. cht-conf validation is the check that counts.
  - Its `/deploy` command opens a local page that takes CHT credentials in the browser, so they never enter the model's context. cht-conf still receives them on its command line.
  - It needs Python 3.10 or later with `uv`, and cht-conf, which needs Node.js 20 or later.
  - Design sheets must follow its documented layout, which has French column headings and conditions written in plain language.
- **How they fit the design rules**:
  - Use the skills freely while building: to learn CHT conventions, write the compiler's templates and test fixtures, and review branches.
  - In the product, the reference files (task and target schemas, XLSForm patterns) can ground drafting prompts. The scripts can run as deterministic steps, such as `read-xlsform.py` listing an existing form's fields before an edit proposal.
  - No skill writes configuration in the product's path. `create-cht-task` generates `tasks.js` code and can edit forms, so it belongs in development, not in the pipeline.

### test-data-generator

- **What it is**: [medic/test-data-generator](https://github.com/medic/test-data-generator), Medic's open-source (GPL-3.0) tool that generates CHT documents with Faker from a JavaScript design file and uploads them to a CHT test instance. Designs cover a hierarchy of places, contacts, users and reports. Its README warns against using it on production instances.
- **Run**: From a local clone, `npm ci`, then `npm run generate <design.js> <CHT_URL>`. Or install it with `npm i -g github:medic/test-data-generator` and run `tdg <design.js> <CHT_URL>`, run it once with `npx -y github:medic/test-data-generator <design.js> <CHT_URL>`, or use an image built from its Dockerfile, with `COUCH_URL` and `FILE` set. It needs Node.js 20.11 or later.
- **Sample designs**: `easy-mode.js` adds about 15,000 documents that exercise most workflows in the CHT's default configuration, including danger sign reports that raise follow-up tasks, and users with about 300 documents each. `default.js`, `users.js` and `add-to-existing-hierarchy.js` show other shapes.
- **Use at the event**: In the setup path, seed the reference configuration with `easy-mode.js`. In the build, seed the CHT test instance at step 9, so the new form and its tasks appear in the CHT app for synthetic households. Write a small design for the pathway's contact types and reports, such as reports that trigger the new follow-up task.
- **What it does not replace**: cht-conf-test-harness. The harness checks the logic against expected outcomes; the generator fills an instance for demos and for checking a deployment.

### cht-docs MCP server

- **What it is**: Medic's hosted MCP server, built on Kapa AI, over CHT documentation, GitHub issues, forum discussions and source code.
- **Endpoint**: `https://mcp-docs.dev.medicmobile.org/mcp`, remote HTTP. The documentation describes no authentication.
- **Tools**: `ask_question` (`question`, optional `threadId`), `search_docs` (`query`, optional `maxResults`) and `get_sources`.
- **Setup**: The `cht-docs-mcp` plugin from cht-ai-tools adds it to Claude Code, or run `claude mcp add --transport http cht-kapa-docs https://mcp-docs.dev.medicmobile.org/mcp`. The [setup page](https://docs.communityhealthtoolkit.org/ai/mcp-servers/cht-docs-mcp-server/) also covers Claude Desktop, ChatGPT, Gemini CLI and OpenCode. Other clients that support remote HTTP MCP servers can use the same URL.
- **Limits**: 10 requests a minute from each IP address, and 50 a minute across all users, as the setup page states. Medic will not raise them before the event. Assistants running on laptops on the venue network usually share one public address, so they share the 10; an assistant on a team's EC2 instance uses that instance's address. When the server starts refusing calls, wait a minute or switch to a fallback below; do not retry in a loop.
- **Use it sparingly**: Ask one specific question rather than several small ones. Keep the server out of parallel subagents and automated loops, which use up the limit in seconds.
- **When you hit the limit**:
  - **Ask AI on the documentation site**: The Ask AI button in the top bar of [docs.communityhealthtoolkit.org](https://docs.communityhealthtoolkit.org) (or Ctrl+K / Cmd+K) opens Medic's Kapa assistant in the browser. It answers from the CHT documentation, GitHub issues and READMEs, and the CHT forum, and asks for consent on first use. Medic and Kapa keep the questions, so ask with synthetic examples only.
  - **The documentation in your coding assistant**: Clone the documentation and let Claude Code or OpenCode search it locally, with no limit:

    ```shell
    git clone --depth 1 https://github.com/medic/cht-docs.git
    cd cht-docs && claude    # or: opencode
    ```

    The pages are Markdown under `content/en/` (about 500 of them), and the repository's `CLAUDE.md` describes its layout. Clone `medic/cht-core` alongside it for working examples in `config/default`.
- **How to use it**: In coding assistants, for CHT questions such as XLSForm conventions, the task schema and cht-conf commands. Keep it out of the product's runtime path: it runs outside the AWS account, and `ask_question` answers with Kapa AI's own model, while the agreed solution keeps model calls in Amazon Bedrock. For runtime grounding, load the public CHT documentation (the open-source medic/cht-docs repository) into a Bedrock Knowledge Base.

### cht-ui-builder (Reference path base)

- **Repository**: [medic/cht-ui-builder](https://github.com/medic/cht-ui-builder), AGPL-3.0, a pnpm monorepo.
  - `client`: React, Vite, Zustand and React Flow.
  - `server`: Fastify, bundling cht-conf.
  - `shared`: parsers and serializers built on ExcelJS.
- **Runs**: Locally, with the UI on port 5173 and the API on 5174. Or in hosted mode, as one Docker container with Node.js 22, pyxform 4.5.0, git and cht-conf, which runs on the team's EC2 instance like any other container.
- **Integration points**:
  - Its form model (the `XLSForm` object) and `serializeXlsForm` are documented as the target for outside generators.
  - The editor keeps the open form in an undo history and shows a diff before every save.
  - Read-only decision tables and a logic graph already exist for review.
  - Preflight checks run before deploy.
- **Known gaps**:
  - There is no approve action.
  - The sign-off view shows some task conditions inverted; fix that before building approval on it.
  - The logic graph shows which questions depend on which, not the branching.
  - There is no live form preview.
  - Task logic is raw JavaScript in the form model.
  - Opening a hand-written task condition and saving it is not yet safe.
- **AI today**: None in the code. Ticket T10 asks for drafting from guidelines into an ordinary editable form, with the builder still working when no AI is available.

### CHT toolchain and references

- [cht-conf](https://github.com/medic/cht-conf): builds, validates, converts and uploads CHT configuration. Its repository also builds the `medicmobile/cht-app-ide` image.
- [cht-conf-test-harness](https://github.com/medic/cht-conf-test-harness): runs synthetic patients through forms and tasks in headless Chromium. The [Application Tests](https://docs.communityhealthtoolkit.org/building/tutorials/application-tests/) tutorial shows how to add it to a project.
- [cht-core](https://github.com/medic/cht-core): published Docker images for a CHT test instance, and the [CHT Docker Helper](https://docs.communityhealthtoolkit.org/hosting/cht/app-developer/#cht-docker-helper) that starts one. Its `config/default` and `config/standard` folders are public reference configurations.
- [CHT documentation](https://docs.communityhealthtoolkit.org), with source in [medic/cht-docs](https://github.com/medic/cht-docs). Start with [Getting Started Building a CHT App](https://docs.communityhealthtoolkit.org/building/local-setup/) and the [reference apps](https://docs.communityhealthtoolkit.org/reference-apps/maternal-newborn/).
- Pre-reading shared by Medic: five two-minute explainer films, the hackathon scoping document, and the setup path above.

---

## Security and Data Handling

- **Scope of data**: The system handles CHT configuration and public guidelines, never patient records. Data at the event is synthetic or public.
- **Personal data**: None in prompts. Bedrock Guardrails screen drafting inputs.
- **Access**: Least-privilege IAM roles per component and no long-lived access keys. Secrets live in AWS Secrets Manager.
- **EC2 instances**: Shell access through Session Manager only, with no inbound SSH. IMDSv2 is required; containers that use the instance role need a metadata hop limit of 2. EBS volumes are encrypted.
- **Model access**: Through IAM roles only. Claude Code's documented policy grants `bedrock:InvokeModel`, `bedrock:InvokeModelWithResponseStream`, `bedrock:ListInferenceProfiles` and `bedrock:GetInferenceProfile` on inference profiles and foundation models. It also grants `aws-marketplace:ViewSubscriptions` and `aws-marketplace:Subscribe` when called through Bedrock. To narrow it, name the inference profiles and the foundation models they route to in each Region.
- **Roles per container**: With plain Docker, every container on an instance can use the instance role. Block the metadata endpoint for the build container, or use ECS task roles.
- **Containers**: No git write credentials, no SSH keys, no personal model credentials and no Docker socket. Build containers run as a non-root user, as cht-app-ide does, and add no Linux capability beyond the `SYS_ADMIN` that headless Chromium needs.
- **CHT test instance**: The Docker Helper starts it with the default `medic` / `password` login and installs a valid `local-ip.medicmobile.org` certificate, so tools connect without switching off TLS checks. Keep the instance reachable only through Session Manager, keep whatever login the pipeline uses in Secrets Manager, and never use real CHT credentials. Never set `NODE_TLS_REJECT_UNAUTHORIZED=0`. test-data-generator writes only to this instance.
- **Documentation assistants**: The cht-docs MCP server and the documentation site's Ask AI run outside the account, and Medic and Kapa keep the questions. Ask them with synthetic examples only, and keep both out of the product's runtime path.
- **Storage**: S3 buckets are private, versioned and encrypted; DynamoDB tables use encryption at rest.
- **Tracing**: CloudWatch, or Langfuse self-hosted in the account. No traces leave the account.
- **Audit**: Every prompt, logic snapshot, approval and test report is recorded and never overwritten.

---

## Testing and Verification

- **Hard gate**: cht-conf validation and conversion must pass. A form that does not convert does not ship.
- **Branch coverage**: Every branch of the pathway has at least one synthetic patient. Expected outcomes come from the approved logic.
- **Golden cases**: About a dozen cases test the logic itself against the guideline. The team writes them from the guideline's worked examples and decision tables, and Medic confirms them in the clinician's role.
- **Deterministic oracles only**: Assertions run on compiled forms and on test results; no model grades them. Prompt-based checks can help during development but never count as a gate.
- **Deployment check (stretch)**: After upload, a deterministic check confirms the team's CHT instance serves the built app settings. test-data-generator then seeds synthetic households, so the demo shows the new form and tasks in the CHT app.
- **Reference path regression**: Keep cht-ui-builder's existing tests passing and add tests for new code. Opening a form and saving it with zero edits must change nothing.
- **Model-written tests**: Any test a model writes must fail before the change and pass after it.

---

## Well-Architected Alignment

Each team's deliverable gives Medic evidence against all six pillars of the AWS Well-Architected Framework. The table maps this document's requirements to each pillar, and the Vision Document sets the matching targets. The README repeats the table, linking each row to its evidence.

| Pillar | What the build shows | Specified in |
|--------|----------------------|--------------|
| Operational excellence | All infrastructure in one Terraform configuration or CDK app; every image built from a Dockerfile with pinned versions; single deploy and teardown commands; container logs in CloudWatch; every model call traced; the README records tools, models and versions | Handover; Services in the Reference Architecture; Preferred Libraries (tracing) |
| Security | Least-privilege IAM roles and no long-lived keys; Session Manager instead of open ports; IMDSv2; secrets in Secrets Manager; private, versioned, encrypted storage; Guardrails on drafting inputs; model calls kept in the account; synthetic data only; two recorded human approvals per change | Security and Data Handling; Design Rules 2, 4 and 8 |
| Reliability | Pipeline state and pending approvals survive a restart; every model output is schema-checked before use; a deterministic compiler; cht-conf validation as a hard gate; a fresh build container per snapshot; versioned, append-only records, so any change can be reversed | Architecture Patterns; Testing and Verification; Design Rule 10 |
| Performance efficiency | Each step uses the lightest method that does the job: deterministic code for checks and compiling, models only for drafting and cross-checking. Teams choose how to read the guideline by measured accuracy and time, call models through cross-region inference profiles, queue slow test runs, and record the time each step takes | Reference Flow; Choosing Tools on the Open Path |
| Cost optimization | Spend kept within the sandbox's $500, with an AWS Budgets alert; models behind one interface, so Medic can move to a cheaper one; token use per run recorded and priced in the README; prompt caching for guideline text that calls repeat, where the model supports it; right-sized instances stopped outside build hours; every resource tagged; one teardown command | Cloud Provider (Budget); Handover to Medic's AWS Account |
| Sustainability | No model training or self-hosted models; compute only while building or testing; Medic's open-source tools reused instead of new services; health workers' phones run standard, offline configuration with nothing generative | Service Disallow List; Design Rule 9 |

For a deeper review, the Generative AI Lens in the AWS Well-Architected Tool applies the same pillars to generative AI workloads.

---

## Handover to Medic's AWS Account

- **Infrastructure as code**: All infrastructure lives in one Terraform configuration or one CDK app. Account, region, instance types and model IDs are variables, and nothing hard-codes an ARN or account ID. Medic runs Terraform; a CDK build is welcome, and Medic will port it to Terraform or adopt CDK.
- **Containers**: Every service ships as an image built from a Dockerfile in the repository and pushed to Amazon ECR. Instances are set up from a launch template or user data, never by hand.
- **README**: It documents a single deploy command into a fresh AWS account and a matching teardown command, and maps the build to each Well-Architected pillar (see Well-Architected Alignment).
- **Tagging**: Every resource carries the project tag, and the README records the Bedrock model IDs and versions used.
- **Model portability**: Models sit behind one interface, so Medic can move to a cheaper or better model later without code changes.
- **Contributions**: AWS developers may contribute. Changes to Medic's repositories arrive as branches under AGPL-3.0.
