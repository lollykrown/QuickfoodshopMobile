# Claude Code cloud sessions ("Claude Code on the web") and local/web handoff mechanisms

Research date: 2026-09-19. Docs were fetched live from code.claude.com on this date. The changelog at the time of fetch topped out at v2.1.277. Anthropic has renamed things: the docs page is now titled "Use Claude Code in the cloud", the flag is `--cloud`, and `--remote` is a deprecated alias.

Abbreviations for sources:
- WEB = https://code.claude.com/docs/en/claude-code-on-the-web
- QS = https://code.claude.com/docs/en/web-quickstart
- ENV = https://code.claude.com/docs/en/cloud-environments
- RC = https://code.claude.com/docs/en/remote-control
- CLI = https://code.claude.com/docs/en/cli-reference
- CMD = https://code.claude.com/docs/en/commands
- DESK = https://code.claude.com/docs/en/desktop
- CL = https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md

## 1. What does each mechanism do, and in which direction does it move a session?

### Takeaway
- `claude --cloud "<task>"` (alias `--remote`) starts a NEW cloud session from the terminal (local to web) with a task prompt. It does not carry your existing conversation.
- `/teleport` (alias `/tp`) and `claude --teleport [id]` pull an existing cloud session into the terminal (web to local).
- The `&` prefix was a v2.0.45 feature. It is absent from all current official docs, and I could not confirm it still works.
- Remote Control is a separate mechanism that mirrors a local session.

### Cited Findings

**`claude --cloud "<task>"` and the older `--remote` alias (local to web)**
- `claude --cloud "Fix the authentication bug in src/auth/login.ts"` "creates a new cloud session on claude.ai." The task runs in the cloud while you keep working locally. It "works with a single repository at a time." — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#from-terminal-to-cloud)
- "The older `--remote` spelling still works as a deprecated alias for `--cloud`." The CLI reference gives `--remote` as a "Deprecated alias for `--cloud`, including the existing-session form". — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#from-terminal-to-cloud); [CLI](https://code.claude.com/docs/en/cli-reference)
- The CLI reference row for `--cloud` reads: "With a task description, create a new cloud session. With a session ID (`session_...` or `cse_...`) or a claude.ai/code URL, queue a message into that existing session instead, with `-p`." — [CLI](https://code.claude.com/docs/en/cli-reference)
- Follow-up form: `claude -p "your message" --cloud <session-id>` posts one message into an existing cloud session and exits. It "sends no local session state", so it is not a session-transfer mechanism. — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#send-follow-ups-from-the-cli)
- Multiple `--cloud` commands run as parallel independent sessions. The CLI shows a provisioning checklist and queues messages you type during provisioning. — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#from-terminal-to-cloud)
- Docs suggest "plan locally, execute in the cloud". Plan in `--permission-mode plan`, save the plan to the repo, commit and push, then run `claude --cloud "Execute the migration plan in docs/migration-plan.md"`. This is a workaround for carrying context: the plan travels as a committed file, not as conversation history. — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#tips-for-cloud-tasks)
- `--cloud` and `--teleport` "require sign-in with a claude.ai account". API-key auth fails with "Unable to get organization UUID". — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#unable-to-get-organization-uuid)

**`/teleport`, `/tp`, `claude --teleport [session-id]` (web to local)**
- `/teleport` in the command list is described as "Pull a cloud session into this terminal". — [CMD](https://code.claude.com/docs/en/commands)
- Ways to pull a cloud session into the terminal, from the docs:
  - `claude --teleport` opens an interactive session picker.
  - `claude --teleport <session-id>` resumes a specific session directly.
  - `/teleport` or `/tp` inside an existing CLI session opens the same picker without restarting.
  - `/tasks`, then press `t`.
  - claude.ai/code "Open in > Terminal", which copies a command to paste.
  - Typing `/teleport` inside the cloud session, which replies with the exact `claude --teleport <session-id>` command (needs v2.1.223 or later in the session's environment).
  - Source: [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#from-cloud-to-terminal)
- What transfers on teleport: "Claude verifies you're in the correct repository, fetches and checks out the branch from the cloud session, and loads the full conversation history into your terminal." — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#from-cloud-to-terminal)
- Teleport is a copy, not a live link: "The terminal gets its own copy of the session: new work there stays local and doesn't appear in the cloud session on claude.ai or the Claude mobile app." To keep steering from a phone afterwards, start `/remote-control` in the local session. — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#from-cloud-to-terminal)
- `--teleport` is distinct from `--resume`. `--resume` "reopens a conversation from this machine's local history and doesn't list cloud sessions". — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#from-cloud-to-terminal)
- Teleport requirements table:
  - Clean git state (you are prompted to stash).
  - Same repository checkout, not a fork.
  - The cloud session's branch must have been pushed to the remote.
  - Same claude.ai account.
  - Source: [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#teleport-requirements)
- Teleport needs claude.ai subscription auth, not an API key. It is unavailable with Bedrock, Vertex or other third-party providers, and "your organization may have disabled cloud sessions". — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#--teleport-is-unavailable)
- Changelog history:
  - `/teleport` and `/remote-env` were added in v2.1.0. — [CL](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
  - v2.1.223 added the `/teleport` hint inside cloud sessions. — [CL](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
  - v2.1.243: "`claude --teleport <session>` exiting on uncommitted changes instead of offering to stash them" was fixed. — [CL](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
  - v2.1.261: a bug was fixed where Remote Control uploaded a `/teleport`-pulled session into the connected session. — [CL](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

**The `&` prefix**
- The changelog entry for v2.0.45 states: "Send background tasks to Claude Code on the web by starting a message with `&`". This is the only official mention I found. — [CL](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- Changelog v2.1.154 states: "Removed the stale '& for background' hint from the shortcuts help panel". This is a signal that the hint was outdated, not a clear statement that the feature was removed. — [CL](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- The `&` prefix does NOT appear in the current CLI reference or the current cloud-sessions page. The CLI reference lists `--cloud`, `--remote`, `--remote-control` and `--resume`, and I checked for `&` there specifically. The commands page has no `&` entry either. The current docs point to `--cloud` and to `/background` (`/bg`). Sources: [CLI](https://code.claude.com/docs/en/cli-reference), [CMD](https://code.claude.com/docs/en/commands), [WEB](https://code.claude.com/docs/en/claude-code-on-the-web)
- A web search summary (aggregated from third-party tutorials; I did not open or verify them) says typing `& <prompt>` creates a "background web session" and that this is "one-way". Treat this as third-party and possibly outdated. — search results incl. [Medium/proflead](https://medium.com/@proflead/stop-copy-pasting-code-how-to-teleport-your-claude-sessions-058d50cf5024)

**Other related commands (all from CMD unless noted)**
- `/autofix-pr [prompt]` "Spawn[s] a cloud session that watches the current branch's PR and pushes fixes". It requires `gh` and access to cloud sessions. — [CMD](https://code.claude.com/docs/en/commands)
- `/web-setup` sends your local `gh` token to your Claude account so cloud sessions can reach GitHub. — [QS](https://code.claude.com/docs/en/web-quickstart#connect-from-your-terminal)
- `/remote-env` picks the default environment for CLI-created cloud sessions. — [ENV](https://code.claude.com/docs/en/cloud-environments)
- `/desktop` (alias `/app`) "Continue[s] the current session in the Claude Code Desktop app". This is local to Desktop, not to the web. Requires macOS or x64 Windows and a Claude subscription. — [CMD](https://code.claude.com/docs/en/commands)
- `/background [prompt]` (alias `/bg`) detaches the current session "to run as a background agent"; `/fork` copies the conversation into a new background session. Monitor with `claude agents`. The docs do not say these run in the cloud, and the agent-view page says the background session host runs as its own process on macOS with local file-access permissions, which points to local execution. Treat this as a local mechanism. — [CMD](https://code.claude.com/docs/en/commands); [agent-view](https://code.claude.com/docs/en/agent-view)
- The Desktop app "Continue in" menu is covered under question 5.

### Inferences
- Direction summary (my synthesis of the docs):

| Mechanism | Direction | Existing conversation carried? |
|---|---|---|
| `--cloud "<task>"` / `--remote` | local to web (new session) | No; task text only |
| `&` prefix | local to web (new session) | Unconfirmed / likely obsolete |
| `/teleport`, `/tp`, `--teleport` | web to local | Yes (full history + branch) |
| `-p ... --cloud <id>` | local CLI to an existing cloud session | Message only |
| Desktop "Continue in > Claude Code on the Web" | local to web | Partial; see question 5 |

- `--remote` is not a legacy name for Remote Control. Older tutorials that say "`--remote`" mean cloud sessions, and today's docs stress that `--remote-control` "is unrelated".

### Gaps
- I did not find an official statement on whether `&` still works in the current CLI. Testing in a live v2.1.277 session would settle it.
- I did not open the third-party tutorial pages themselves; the `&` claim rests on search-result summaries.

## 2. Does a cloud session require GitHub, a pushed branch, or an installed GitHub app? What about non-GitHub or uncommitted work?

### Takeaway
- GitHub is the default path, and the docs say to push first. The VM clones your remote at your current branch, not your local checkout.
- If the repo has no git remote, or the Claude GitHub App is not installed on it, the CLI uploads a bundle of your local repo instead. That bundle includes uncommitted changes to tracked files but excludes untracked files and credential-like files.

### Cited Findings
- Quickstart: "You'll need a GitHub repository to get started." Claude clones it into an isolated VM, makes changes, and pushes a branch. — [QS](https://code.claude.com/docs/en/web-quickstart)
- Comparison table row "Requires GitHub": cloud session "Yes, or bundle a local repo via `--cloud`"; local session "No"; Remote Control "No". — [QS](https://code.claude.com/docs/en/web-quickstart#compare-ways-to-run-claude-code)
- `claude --cloud`: "The cloud VM clones your current directory's GitHub remote at your current branch, not your local checkout, so push first if you have local commits." — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#from-terminal-to-cloud)
- Two GitHub auth methods:
  - The Claude GitHub App reaches public repos plus private repos where the app is installed. It is the option that enables Auto-fix.
  - `/web-setup` sends your local `gh` token, so sessions can reach any repo that token can access, whether or not the app is installed.
  - Source: [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#github-authentication-options)
- Team and Enterprise: the GitHub connector must be enabled by an Owner (Admin settings > Connectors). `/web-setup` is hidden unless an Owner turns on "Quick web setup". — [QS](https://code.claude.com/docs/en/web-quickstart)
- Bundle fallback: "When you run `claude --cloud` from a repository that has no git remote, or from a github.com repository that the Claude GitHub App isn't installed on, Claude Code bundles your local repository and uploads it directly to the cloud session. This applies even if you connected GitHub with `/web-setup`. The bundle includes your full repository history across all branches, plus uncommitted changes to tracked files." — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#send-local-repositories-without-github)
- Bundle exclusions and limits — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#send-local-repositories-without-github):
  - On macOS, Linux and WSL, uncommitted changes to credential-like files are left out and named: `.env`, Terraform `*.tfvars`, and key files such as `id_rsa` and `*.pem`. The session gets the committed version, or no file if none is committed. In linked worktree or submodule layouts these are uploaded with the rest and named.
  - `CCR_FORCE_BUNDLE=1` forces a bundle even when a clone would otherwise be used.
  - The directory must be a git repo with at least one commit.
  - The bundle must be under 100 MB. Larger repos fall back to the current branch only, then to a single squashed snapshot of the working tree, and fail if that is still too large.
  - "Untracked files are not included; run `git add`" first.
  - Bundled sessions can push back to a GitHub remote only if your GitHub connection has push access.
- Non-GitHub hosts (GitLab, Bitbucket): can be sent as a local bundle with `CCR_FORCE_BUNDLE=1`, "but the session can't push results back to that remote". PR creation requires GitHub. GitHub Enterprise Server is supported on Team and Enterprise. — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#limitations)
- Teleport back requires the session's branch to be pushed and a clean local git state. — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#teleport-requirements)
- Zero Data Retention organizations "can't use `/web-setup` or other cloud session features." — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#github-authentication-options)
- The `--cloud` follow-up form and the `--teleport` picker both require the org policy `allow_remote_sessions`. — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#send-follow-ups-from-the-cli)

### Inferences
- Because the doc says a plain clone uses "your current branch, not your local checkout", uncommitted working-tree changes are NOT in the cloud session in the clone case. Only the bundle path (no remote, or the app not installed) includes uncommitted tracked-file changes. This is a reading of two doc passages together; the docs do not spell out the clone-versus-bundle uncommitted-changes contrast in one place.
- The bundle path can look like "sending your working tree", but it is a snapshot for a NEW session. It still carries no conversation history (see question 5).
- A project not on GitHub (or with no remote) has a supported route (bundle). It just cannot push or open a PR back.

### Gaps
- The docs do not say exactly how Claude Code chooses between clone and bundle when the GitHub App is installed but you have unpushed local commits. It presumably clones, going by "push first".

## 3. Where does code run, and what are the implications (secrets, .env, local tooling, network)?

### Takeaway
- A cloud session runs in an Anthropic-managed VM by default (or your org's self-hosted environment). It starts from a fresh clone and sees only what is in the repo, not your machine's config, tools or `.env`.
- A local session, including one under Remote Control, runs on your machine with your filesystem and network.

### Cited Findings
- "A cloud session is a Claude Code session that runs on cloud infrastructure instead of on your machine. By default it runs on infrastructure Anthropic manages, or on your organization's self-hosted environment." Each session runs in "an isolated, Anthropic-managed VM". — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web); [WEB security](https://code.claude.com/docs/en/claude-code-on-the-web#security-and-isolation)
- "Cloud sessions start from a fresh clone of your repository. Anything you commit to the repo is available. Anything you've installed or configured only on your own machine isn't available." — [ENV](https://code.claude.com/docs/en/cloud-environments#what-carries-over-from-your-setup)
- Carries over (repo-based):
  - The repo's `CLAUDE.md`.
  - `.claude/settings.json` hooks and permissions, in a one-repo session.
  - `.mcp.json` MCP servers, in a one-repo session.
  - Plugins declared in `.claude/settings.json`.
  - Org server-managed settings.
  - Source: [ENV](https://code.claude.com/docs/en/cloud-environments#what-carries-over-from-your-setup)
- Does NOT carry over:
  - User-level `~/.claude/CLAUDE.md`, skills, agents and commands (skills you enable on claude.ai are loaded).
  - User-scope plugins.
  - MCP servers added with `claude mcp add` at local or user scope.
  - Source: [ENV](https://code.claude.com/docs/en/cloud-environments#what-carries-over-from-your-setup)
- Secrets: environment variables use `.env` format and are set in the environment dialog. "Anyone who uses the environment can read its environment variables and setup script"; the docs warn against putting secrets there. On Pro and Max only, "API credentials" can be stored so an agent proxy attaches them to matching requests without exposing the key to the session. Team and Enterprise do not have API credentials yet, and shared org environments' variables are readable by every member. — [ENV](https://code.claude.com/docs/en/cloud-environments#set-environment-variables); [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#security-and-isolation)
- Git credentials and signing keys stay outside the sandbox; a proxy authenticates on the session's behalf with scoped credentials. — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#security-and-isolation)
- Local `.env` files: the bundle upload deliberately omits uncommitted `.env`, `*.tfvars`, `id_rsa` and `*.pem`. Gitignored files are not in a clone. — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#send-local-repositories-without-github)
- Network access levels: None, Trusted (the default: package registries, GitHub, cloud SDKs), Full (any domain), Custom (your allowlist). At None, Claude Code can still reach the Anthropic API, which "may allow data to exit the VM". MCP connector traffic goes through Anthropic servers and bypasses the allowlist. — [ENV](https://code.claude.com/docs/en/cloud-environments#access-levels); [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#security-and-isolation)
- Setup scripts should finish in about 5 minutes to build the environment cache. Docker is available. — [ENV](https://code.claude.com/docs/en/cloud-environments#setup-scripts)
- Permission modes: cloud offers Auto, Accept edits and Plan only ("Cloud sessions don't offer Manual or Bypass permissions"). — [QS](https://code.claude.com/docs/en/web-quickstart)
- Some terminal-only commands (`/plugin`, `/resume`, `/clear`) are unavailable in cloud sessions. — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#manage-context)
- Sessions can expire after inactivity. Reopening provisions a fresh VM with history restored, but background subagents and shell commands are not restored. — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#environment-expired)
- The docs state: "For work that needs your local config, tools, or environment, running Claude Code locally or using Remote Control is a better fit." — [QS](https://code.claude.com/docs/en/web-quickstart)
- Quickstart comparison table ("Uses your local config"): cloud "No, repo only"; local "Yes"; Remote Control "Yes". "Keeps running if you disconnect": cloud "Yes"; local "No"; Remote Control "While the session stays open on your machine". — [QS](https://code.claude.com/docs/en/web-quickstart#compare-ways-to-run-claude-code)
- Product (Oct 2025 announcement): "Every Claude Code task runs in an isolated sandbox environment with network and filesystem restrictions." — [Anthropic blog](https://claude.com/blog/claude-code-on-the-web)

### Inferences
- For an Expo/React Native project, a cloud VM cannot run the iOS simulator, a physical-device workflow or local-only services (my inference; not documented). It could run Node tooling, `npm install`, lint and Jest from the repo, given Trusted network access to npm.
- A `.env` or Expo/EAS secrets file that is uncommitted will not be present in the cloud session. This follows from "fresh clone" and the bundle exclusions.

### Gaps
- The docs do not list hardware specs, session time limits or an exact idle timeout. I did not find them.

## 4. Plan/account requirements, usage limits, and availability status (as of Sept 2026)

### Takeaway
- Cloud sessions are still labeled "research preview" in the current docs (checked 2026-09-19). They are available on Pro, Max and Team, and on Enterprise with premium or Chat + Claude Code seats.
- Usage counts against your normal subscription limits. No separate VM charge.

### Cited Findings
- Docs banner: "Cloud sessions are in research preview for Pro, Max, and Team users, and for Enterprise users with premium seats or Chat + Claude Code seats." — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web); same banner in [QS](https://code.claude.com/docs/en/web-quickstart) and [ENV](https://code.claude.com/docs/en/cloud-environments)
- Launch history: announced 2025-10-20 as a research preview for Pro and Max; updated 2025-11-12 to add Team and Enterprise (premium seats). — [Anthropic blog](https://claude.com/blog/claude-code-on-the-web)
- Limits: "cloud sessions share rate limits with all other Claude and Claude Code usage within your account. Running multiple tasks in parallel consumes more rate limits proportionately. There is no separate compute charge for the cloud VM." — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#limitations)
- Authentication: needs a claude.ai account. It is not available under Bedrock, Vertex AI or Foundry, or with API-key auth. An org policy (`allow_remote_sessions`) must be enabled, and Zero Data Retention orgs are excluded. — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#send-follow-ups-from-the-cli)
- Org IP allowlisting breaks Anthropic-hosted cloud sessions (they call the API from Anthropic infrastructure); a fix requires contacting Anthropic support. — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#limitations)
- Session sharing: Pro/Max use Private or Public visibility; Team/Enterprise use Private or Team. — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#share-sessions)
- Desktop app: choose **Cloud** instead of **Local** when starting a session. Usage counts toward plan limits. — [DESK](https://code.claude.com/docs/en/desktop#run-long-running-tasks-in-the-cloud)
- Support-center article (published 2026-03-16 per the page): describes it as a standard feature and does not mark it as beta. It says nothing about plans, limits or teleport. It conflicts in tone with the docs, which still say research preview. — [support.claude.com](https://support.claude.com/en/articles/12618689-claude-code-on-the-web)

### Inferences
- The "research preview" label persists nearly 11 months after launch. Treat the feature as not GA per the docs, though it appears widely available.

### Gaps
- I found no published numeric usage quotas specific to cloud sessions.
- I did not verify the exact per-plan quotas or whether Enterprise "standard seats" have access. The docs say only "premium seats or Chat + Claude Code seats".

## 5. Can a session started locally be moved to the web, or only web to local?

### Takeaway
- From the Claude Code CLI, NO. The docs state handoff is one-way: you can pull cloud sessions into your terminal, but you cannot push an existing terminal session to the cloud.
- Partial exception: the Desktop app's "Continue in > Claude Code on the Web" menu can send a local Desktop session to a new cloud session. It needs a clean working tree and a pushed branch, so it carries no uncommitted changes, and it may pass a summary rather than the literal transcript.
- Nothing carries an existing conversation together with uncommitted working-tree changes to the web.

### Cited Findings
- Official statement: "From the CLI, session handoff is one-way: you can pull cloud sessions into your terminal with `--teleport`, but you can't push an existing terminal session to the cloud. The `--cloud` flag with a task description creates a new cloud session for your current repository; with `-p` and a session ID or claude.ai/code URL it instead queues a message into that existing session. The Desktop app provides a **Continue in** menu that can send a local session to the cloud." — [WEB](https://code.claude.com/docs/en/claude-code-on-the-web#move-tasks-between-terminal-and-cloud)
- Desktop "Continue in" menu (in the VS Code icon at the bottom right of the session toolbar): "**Claude Code on the Web**: sends your local session to continue running in the cloud. Desktop pushes your branch, generates a summary of the conversation, and creates a new cloud session with the full context. You can then choose to archive the local session or keep it. This requires a clean working tree, and is not available for SSH sessions." — [DESK](https://code.claude.com/docs/en/desktop#continue-in-another-surface). I verified this against the raw markdown page.
- Ambiguity: the same sentence says both "generates a summary of the conversation" and "the full context". A summary is not a full transcript. A summary-based handoff does not necessarily preserve the literal message history.
- `--cloud "<task>"`: creates a NEW cloud session for the current repo. The docs describe only the task text, the repo (clone or bundle) and the branch as inputs, and say nothing about the current conversation being carried. See question 1.
- The bundle path carries "uncommitted changes to tracked files" but no conversation. See question 2.
- Feature request for the missing capability: GitHub issue #14666 "Universal session teleporting (local to remote, SSH support)", opened 2025-12-19, says current functionality "only supports web to local". It was closed as a duplicate of #11455, with no Anthropic comment visible. I did not read #11455. — [GitHub #14666](https://github.com/anthropics/claude-code/issues/14666)
- Third-party confirmation of one-way: "you can pull a web session down to your terminal, but you cannot 'push' an existing local session up to the web." — search summary of [Medium/proflead](https://medium.com/@proflead/stop-copy-pasting-code-how-to-teleport-your-claude-sessions-058d50cf5024) and [DEV/proflead](https://dev.to/proflead/claude-code-tutorial-syncing-web-sessions-to-local-cli-34e0). This is consistent with the official docs; it is not independent evidence.
- Official docs on teleport also state that the pulled session is a local copy that will not appear in the cloud session. The reverse is not offered.

### Inferences
- If the goal is "my current conversation plus uncommitted changes, running on the web", no single documented mechanism does that. The nearest options:
  - Desktop "Continue in > Web": commit or stash to get a clean tree, push, and you get a summary-seeded cloud session.
  - CLI: commit and push, then `claude --cloud "<continue task>"` (new session, no history). Or use the plan-file workaround from question 1.
  - Remote Control (below): keeps the whole local session (history and working tree) alive and viewable from the web, but it still runs locally.
- "The docs don't mention conversation transfer for `--cloud`" is not the same as an explicit denial, but combined with the explicit one-way statement it is strong.

### Gaps
- I did not test whether `&` (if still supported) sends any conversation context. There is no official description of it beyond one changelog line.
- I could not confirm whether the Desktop summary handoff includes uncommitted changes; the docs say a clean working tree is required.

## 6. Remote Control versus cloud sessions (contrast for choosing)

### Takeaway
- Remote Control mirrors a still-running LOCAL session to claude.ai/code and the mobile app. Execution and filesystem access stay on your machine, and the conversation carries over when you start it from an existing session.
- Use it when you want an existing local conversation (with its working tree) reachable from the web or a phone. The trade-off is that the machine must stay on and connected.

### Cited Findings
- Definition: Remote Control "connects claude.ai/code or the Claude app ... to a Claude Code session running on your machine." "Claude keeps running locally the entire time, so your code execution and filesystem access stay on your machine." "The web and mobile interfaces are a window into that local session." — [RC](https://code.claude.com/docs/en/remote-control)
- Ways to start it:
  - `claude remote-control` (server mode, multiple concurrent sessions, default capacity 32).
  - `claude --remote-control` or `--rc` (a full interactive session you can also control remotely).
  - `/remote-control` or `/rc` inside a session ("This starts a Remote Control session that carries over your current conversation history"). It also works in the VS Code extension.
  - "Enable Remote Control for all sessions" in `/config`.
  - Source: [RC](https://code.claude.com/docs/en/remote-control#start-a-remote-control-session)
- Local resources stay available: filesystem, MCP servers, tools and project configuration. — [RC](https://code.claude.com/docs/en/remote-control)
- Connectivity: outbound HTTPS only, no inbound ports. Reconnects after sleep or network drops. In server mode the process exits after roughly 10 minutes of extended network outage. In an interactive session Claude Code keeps retrying. — [RC](https://code.claude.com/docs/en/remote-control)
- Data handling: while connected, "the session transcript ... is stored on Anthropic servers ... Execution and filesystem access stay on your machine". ZDR organizations cannot enable Remote Control. — [RC](https://code.claude.com/docs/en/remote-control#connection-and-security)
- Plans: page banner says "Remote Control is available on all plans. On Team and Enterprise, it is off by default until an Owner enables the Remote Control toggle". The Requirements list says "available on Pro, Max, Team, and Enterprise plans. API keys are not supported". These two statements are inconsistent as written; the safe reading is the paid claude.ai plans. It is unavailable under Bedrock, Vertex AI, Foundry or a custom base URL. — [RC](https://code.claude.com/docs/en/remote-control)
- The docs' own guidance: "Use Remote Control when you're in the middle of local work and want to keep going from another device. Use a cloud session when you want to start a task without any local setup, work on a repo you don't have cloned, or run multiple tasks in parallel." — [RC](https://code.claude.com/docs/en/remote-control#remote-control-vs-cloud-sessions)
- Some commands are local-only. `/plugin` and `/resume` work only from the local CLI; `/model`, `/effort`, `/fast`, `/color`, `/rename` and `/mcp` work from web and mobile in argument or summary form. Permission modes from claude.ai and the mobile app are Manual, Accept edits or Plan. — [RC](https://code.claude.com/docs/en/remote-control); [QS](https://code.claude.com/docs/en/web-quickstart)
- Combining with teleport: after `/teleport`, a device connected via Remote Control "doesn't receive the pulled conversation's earlier history". New messages go both ways. — [RC](https://code.claude.com/docs/en/remote-control)
- Launch history (secondary): shipped 2026-02-25 as a research preview, initially for Max users according to news coverage. — [VentureBeat](https://venturebeat.com/orchestration/anthropic-just-released-a-mobile-version-of-claude-code-called-remote), [GIGAZINE](https://gigazine.net/gsc_news/en/20260225-claude-code-remote-control/) (via search summary). The current docs no longer use a "research preview" label on the page I fetched; I did not confirm a formal GA announcement.
- A secondary blog summary claimed sessions are "end-to-end encrypted, Anthropic never sees the code". This conflicts with the official docs, which say the transcript is stored on Anthropic servers. Prefer the official docs. — search summary; contradicted by [RC](https://code.claude.com/docs/en/remote-control#connection-and-security)

**Side-by-side (my synthesis from the cited docs)**

| | Remote Control | Cloud session (`--cloud` / web) | Teleport | Desktop "Continue in > Web" |
|---|---|---|---|---|
| Runs on | your machine | Anthropic VM (or self-hosted runner) | your machine | Anthropic VM |
| Keeps existing conversation | yes (`/remote-control` carries history) | no (new session) | yes (cloud history pulled in) | summary and context, per docs |
| Uncommitted working-tree changes | stay in place (same checkout) | clone: not included; bundle: tracked files only | requires clean tree | requires clean tree |
| Needs GitHub | no | yes, or bundle | yes (branch must be pushed) | yes (pushes the branch) |
| Keeps running if laptop off | no | yes | no | yes |
| Local MCP, `.env`, tools | available | not available (repo only) | available | not available |

### Inferences
- For "continue my current local conversation from the web or phone", Remote Control is the only documented mechanism that keeps the same session, history and uncommitted files intact, at the cost of the machine staying on. For "fire off a task and close the laptop", use `--cloud` or the web UI, with the repo pushed.

### Gaps
- I did not find a formal GA announcement for Remote Control.
- I did not confirm whether the "all plans" or the explicit plan list is authoritative for Remote Control.

## Overall caveats for the report writer
- Terminology has shifted, and the docs are the authority. The flag is `--cloud` (`--remote` deprecated). The page title is "Use Claude Code in the cloud". Older third-party posts saying `--remote`, "Claude Code on the web (beta)" or `&` may be stale.
- Everything dated "current" reflects the docs as fetched on 2026-09-19 and the changelog through v2.1.277. Version-gated behaviors (for example teleport's stash prompt, the `/teleport` in-cloud hint at v2.1.223 or later) depend on the user's installed version.
- I used WebFetch, which summarizes pages through a small model. Key claims (the one-way note, the bundle rules, the Desktop "Continue in" text, RC start options) were cross-checked against raw doc text saved locally. The Desktop "Continue in" text was verified against the raw markdown. The GitHub issue and the help-center article were read only via summarized fetches.
