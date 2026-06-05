# AGENT.md

## 1. Project overview

This repository is a Vietnamese Docusaurus curriculum for the **distilabel** library by Argilla (Hugging Face). It is designed for AI engineers, data scientists, and machine learning practitioners who want to understand the exact architectural foundations, codebase implementation, and practical patterns for building high-quality synthetic datasets using distilabel.

The goal is not simply to copy tutorials. The goal is to provide a rigorous, academic-grade guide explaining the theoretical roots (DAG scheduling, BatchManager flow control, Step lifecycle, LLM-as-judge scoring algorithms) and connecting them to corresponding codebase implementations in `distilabel`, backed by clear pseudocode and system-level analysis.

This file is the operating manual for future agents. Treat it as the stable source of truth for writing quality, repository safety, verification, privacy, and completion criteria.

---

## 2. Repository map

- `docs/`: public Vietnamese curriculum chapters.
  - `docs/case_studies/`: practical case studies (UltraFeedback, Magpie, DEITA, APIGen, Math-Shepherd).
  - `docs/theory_deep_dive/`: theoretical, mathematical, and algorithmic deep dives.
  - `docs/experiments/`: hands-on experiment walkthroughs.
- `src/`: Docusaurus landing page and styling.
- `static/`: public static assets and `robots.txt`.
- `.github/workflows/`: CI and GitHub Pages deployment workflow.
- `README.md`: must remain empty.

---

## 3. Curriculum-wide content standard

Public content must be highly educational, mathematically rigorous, and written for advanced learners. Do not expose private task instructions, local absolute paths, credentials, internal notes, hidden constraints, or agent coordination details in public docs.

A curriculum chapter should teach by introducing a concrete tension first (e.g. why human annotation is too slow and expensive for LLM fine-tuning, why naive batch processing causes pipeline stalls) before offering the solution.

Use `Phần` for course sections. Do not use em dash characters. Use commas, colons, semicolons, or parentheses instead.

---

## 4. Pedagogical writing style

Future agents must write with the persona of an **AI Engineer and Data Engineering Specialist**, and a dedicated professor. The goal is to help students grasp the absolute roots, algorithmic foundations, and system mechanics of synthetic data generation, so they can confidently apply and implement these patterns in real-world production systems.

The prose must be highly professional, precise, serious, patient, and technically deep. It must read like an original academic lecture series in Vietnamese, not a translated or marketing-oriented document.

Use Vietnamese as the main language. Use English technical terms when they are standard in the industry: *pipeline, step, task, generator, batch, dataset, reward model, judge, prompt, generation, structured output, routing, caching, serialization, actor, replica, checkpoint*. Explain a term before relying on it heavily.

Avoid casual language, slang, and jokes. The tone should be authoritative, academic, and accessible.

For every important concept, follow this pedagogical flow:
1. Start from a concrete tension or engineering problem (e.g., data bottleneck, non-reproducibility, GPU underutilization).
2. Build the intuition, formulate the solution design, and explain key trade-offs.
3. Show the corresponding clean pseudocode or algorithms referencing actual source files.
4. Reference the actual file and function in `distilabel` where this is implemented.
5. Provide actionable implementation guides and common pitfall checklists.

---

## 5. Math, diagrams, and examples

Math must be taught, not just displayed.
- Explain every variable in equations.
- Use LaTeX formatting ($formula$ or $$formula$$).
- Follow equations with intuitive prose.

Use Mermaid diagrams to illustrate pipeline DAG structure, step lifecycle, batch data flow, and caching state transitions.

---

## 6. Public privacy and safety constraints

`README.md` must remain empty (0 bytes). Do not add any characters or placeholders to it.

Public docs must not mention:
- private user instructions or hidden agent constraints.
- the fact that `README.md` is empty.
- local absolute paths.
- credentials, tokens, secrets, API keys, or private URLs.

Privacy controls:
- `static/robots.txt` must disallow all crawling.
- Docusaurus must include `noindex,nofollow,noarchive,nosnippet` metadata.
- Sitemap generation must remain disabled.

---

## 7. Commands and verification

Safe read-only or verification commands:
- `npm run typecheck`: run TypeScript verification.
- `npm run build`: build the Docusaurus site.
- `git status --short --branch`: inspect repository state.

Commands requiring explicit approval:
- Configuring or enabling GitHub Pages for the first time.
- Manual publishing or deploying.
- Pushing to GitHub if not already requested.
- Changing repository visibility.

---

## 8. Completion checklist

Before reporting completion, verify the relevant items:
- `README.md` is still 0 bytes.
- `npm run typecheck` and `npm run build` pass without errors.
- No em dash characters appear in public or source text.
- Public docs read like original Vietnamese teaching material.
- Search engine exclusions are active (robots.txt disallowing `/` and `noindex` meta tag).

---

## 9. Repo specialization: distilabel Internals

### Learning promise
A reader should finish this curriculum able to explain:
- Why synthetic data generation is necessary and how AI Feedback loops work.
- How distilabel's Pipeline and DAG orchestrate Step execution using networkx.
- The exact lifecycle of a Step: load resources, process batches from input queue, push to output queue, unload.
- How _BatchManager accumulates data from predecessor steps and creates batches for consumption.
- The 3-layer caching strategy based on pipeline name, DAG signature, and aggregated step signatures.
- How Tasks implement the format_input/format_output protocol to interact with LLMs.
- How RayPipeline scales Steps as Ray Actors across distributed GPU clusters.

### Misconceptions to actively prevent
- A `Task` is not just a Step that calls an LLM; it enforces a strict input/output format contract via abstract methods.
- The `>>` operator does not execute steps; it registers directed edges in the DAG only during pipeline construction.
- A `GlobalStep` does not simply receive more data; it receives ALL data at once via file system, which has major memory implications.
- Caching in distilabel is not at the dataset level but at the individual step output level, keyed by step signature hash.
- Ray actors in distilabel maintain state (loaded LLMs, connections) across batch calls; they are not stateless functions.
