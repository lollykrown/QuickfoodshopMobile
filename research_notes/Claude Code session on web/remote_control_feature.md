# Claude Code Remote Control: continuing a running local session from claude.ai/code and the Claude mobile app

Research date: 2026-09-19. Primary source is the official page https://code.claude.com/docs/en/remote-control (fetched today; it references Claude Code versions up to v2.1.277 in the changelog). Third-party claims are labelled as such.

## 1. What are the exact command names, aliases and flags?

### Takeaway
Remote Control has four entry points: a CLI subcommand (`claude remote-control`, "server mode"), a CLI flag (`claude --remote-control` / `--rc`), an in-session slash command (`/remote-control`, alias `/rc`), and an auto-connect setting ("Enable Remote Control for all sessions" / `remoteControlAtStartup`). For an already-running session, the relevant one is `/remote-control` (or `/rc`).

### Cited Findings
**Slash command (mid-session)**
- Official syntax: "If you're already in a Claude Code session and want to continue it remotely, use the `/remote-control` (or `/rc`) command: `/remote-control`". Pass a name as an argument to set a custom session title: `/remote-control My Project`. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Commands reference: `/remote-control`, aliases: `/rc`. Description: "Continue this local session from another device." — [Commands reference](https://code.claude.com/docs/en/commands)
- With `/remote-control`, "The `--verbose`, `--sandbox`, and `--no-sandbox` flags are not available with this command." — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- VS Code extension: type `/remote-control` or `/rc` in the prompt box. Unlike the CLI, the VS Code command does not accept a name argument or display a QR code. To disconnect, run `/remote-control` again. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- `/mobile` (aliases `/ios`, `/android`) shows a QR code to download the Claude mobile app. — [Commands reference](https://code.claude.com/docs/en/commands); [Remote Control docs](https://code.claude.com/docs/en/remote-control)

**Startup flag (new interactive session)**
- Official syntax: `claude --remote-control` (or `--rc`); optionally `claude --remote-control "My Project"`. "This gives you a full interactive session in your terminal that you can also control from claude.ai or the Claude app. Unlike `claude remote-control` (server mode), you can type messages locally while the session is also available remotely." — [Remote Control docs](https://code.claude.com/docs/en/remote-control); [CLI reference](https://code.claude.com/docs/en/cli-reference)

**Server mode subcommand**
- `claude remote-control` (run in the project directory). Runs "in server mode (no local interactive session)". Displays a session URL; press spacebar to toggle a QR code. Until the user accepts a one-time confirmation it asks `Enable Remote Control? (y/n)`. — [Remote Control docs](https://code.claude.com/docs/en/remote-control); [CLI reference](https://code.claude.com/docs/en/cli-reference)
- Flags documented for server mode (all given after `remote-control`) — [Remote Control docs](https://code.claude.com/docs/en/remote-control):
  - `--name "My Project"`: custom session title in the claude.ai/code session list.
  - `--remote-control-session-name-prefix <prefix>`: prefix for auto-generated names; defaults to machine hostname (e.g. `myhost-graceful-unicorn`); env var `CLAUDE_REMOTE_CONTROL_SESSION_NAME_PREFIX` does the same.
  - `-c`, `--continue`: bring back the session the last server in this directory started with. Requires v2.1.200+. Cannot combine with `--session-id`, `--spawn`, `--capacity`, `--create-session-in-dir`.
  - `--session-id <id>`: bring back one session by ID (the part of the claude.ai/code URL between `/code/` and any `?`). Requires v2.1.200+.
  - `--spawn <mode>`: `same-dir` (default), `worktree` (each on-demand session gets its own git worktree; needs a git repo), `session` (single-session mode; set at startup only). Press `w` at runtime to toggle `same-dir`/`worktree`.
  - `--capacity <N>`: max concurrent sessions, default 32 (not usable with `--spawn=session`).
  - `--[no-]create-session-in-dir`: pre-create one session in the current directory; on by default.
  - `--permission-mode <mode>`: starting permission mode for the server's sessions (e.g. `acceptEdits`; `manual` is an alias for `default`).
  - `--debug-file <path>`, `--verbose`, `--sandbox` / `--no-sandbox` (sandboxing off by default).
- Global `claude` flags placed before `remote-control` are not carried into the spawned sessions; only flags known to be harmless (e.g. `--verbose`, `--model`) are allowed through, others (e.g. `--settings`) cause a refusal to start. Before v2.1.248, any option before `remote-control` caused an `unknown option` error. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- `claude remote-control --help` returns an error instead of the flag list when not signed in with an eligible account (eligibility is checked before help prints). — [Remote Control docs](https://code.claude.com/docs/en/remote-control)

**Auto-connect / settings**
- `/config` -> "Enable Remote Control for all sessions" with values `true` (connect automatically when an interactive session starts), `false`, `default` (follow the org admin default, otherwise Claude Code's default). Same toggle in Desktop (Settings > Claude Code > Enable remote control by default) and VS Code (needs v2.1.203+). — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Settings-file equivalent: `remoteControlAtStartup` = `true` in user `~/.claude/settings.json` or managed settings. In project/local settings a `false` is honored but a `true` is ignored, so a checked-in file cannot turn Remote Control on for everyone. Managed `true` outranks a user `false`, but a project/local `false` wins even over managed `true`. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- `disableRemoteControl` setting: "Turn off Remote Control everywhere it can start" (settings index entry; detailed type/default not visible in the fetched text). `dialogExpiry` sets how long Claude Code waits for Remote Control/SDK host to answer a forwarded dialog. — [Settings reference](https://code.claude.com/docs/en/settings-reference)
- With auto-connect on, "each interactive Claude Code process registers one remote session." Auto-connect uses your own claude.ai account, so sessions appear only in your account. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)

**Commands usable from the remote client**
- Work from mobile/web: `/compact`, `/clear`, `/context`, `/usage`, `/exit`, `/usage-credits`, `/recap`, `/reload-plugins` (interactive terminal sessions only); `/model`, `/effort`, `/fast`, `/color`, `/rename` (value as argument); `/mcp` (text summary on mobile; connectors directory on web; `reconnect|enable|disable` work); `/config` (`key=value` on mobile; opens settings on web); `/autocompact` (from v2.1.221), `/advisor` (from v2.1.260), `/output-style` (from v2.1.269). Commands that only run in the terminal UI, such as `/plugin` or `/resume`, work only from the local CLI. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)

### Inferences
- The docs list four entry points but only one (`/remote-control` / `/rc`) applies to a session that is already running. `claude remote-control` (server mode) starts a new server session, and `--remote-control` applies at launch.
- Note the naming: the `--remote-control`/`--rc` flag is not the deprecated `--remote` flag (a deprecated alias for `--cloud`, which is about cloud sessions), per [CLI reference](https://code.claude.com/docs/en/cli-reference).

### Gaps
- Type, default and exact accepted values of the `disableRemoteControl` and `remoteControlAtStartup` reference entries were not visible in the fetched settings-reference text (only the index rows). The Remote Control page's description of `remoteControlAtStartup` (`true` in user or managed settings) was used instead.

## 2. Can it be enabled mid-session on an already-running session, or only at startup? What happens to conversation history?

### Takeaway
Yes, it can be enabled mid-session. Running `/remote-control` (or `/rc`) inside the running session "starts a Remote Control session that carries over your current conversation history." The same local process keeps running; the web/mobile client becomes another window into it.

### Cited Findings
- "This starts a Remote Control session that carries over your current conversation history." (About `/remote-control` from an existing session.) — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Titles: the remote session title is chosen in this order: (1) name passed to `--name`, `--remote-control`, or `/remote-control`; (2) title set via `/rename`; (3) the last meaningful message in existing conversation history; (4) an auto-generated name like `myhost-graceful-unicorn`. Titles without an explicit name update to reflect your first prompt after connecting. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- First use: "Until you accept Remote Control's one-time confirmation, a dialog appears before `/remote-control` connects. Select **Enable Remote Control** to accept and connect." Selecting **Never mind** or Esc means it does not connect and asks again next time. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Status and disconnect: while connected, the terminal shows an `/rc active` indicator linking to the session on claude.ai (hidden when the terminal is too narrow). Running `/remote-control` again opens a status panel with session URL and QR code; "The panel also lets you disconnect Remote Control while your local session keeps running." — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Connecting from another device: open the session URL in a browser, scan the QR code (opens in the Claude app), or open claude.ai/code or the Claude app and find the session by name (mobile app: tap **Code**). Online Remote Control sessions show a computer icon with a green status dot. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- On connecting, the device shows any subagents and workflows already running in the background; stopping one from the device stops it on your machine. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Compaction and `/clear` propagate: connected devices show compaction progress; `/clear` resets the conversation on connected devices too. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- `/resume` and `/teleport` in the terminal: the connected device does not receive the switched-to conversation's title or earlier history, but new messages go to and from whichever conversation is open in the terminal. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Prompts sent from a device mid-turn are queued and kept in the device's transcript after the turn ends. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Connection failure: the indicator changes and a notification states the reason; run `/remote-control` to reconnect (unless the reason says another connection took over, or the session was ended/archived elsewhere, in which case run it only if you want it back). If compaction rewrote the conversation or you switched with `/resume` meanwhile, Claude Code archives the old server session on reconnect (findable by filtering archived sessions). — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Resuming later: to restore a session started with `claude --remote-control` or `/remote-control`, resume the conversation with `claude --continue` or `claude --resume`; reconnection depends on the conversation's "reconnection record". If resumed in a second terminal while the first still has Remote Control on, the second leaves it off and prints a notice; run `/remote-control` there to move it. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Changelog: "Fixed `/remote-control` being ignored while Remote Control is still connecting: running it again turns Remote Control off immediately" (listed under 2.1.269 in the raw CHANGELOG fetch). — [CHANGELOG.md](https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md)

### Inferences
- Practical recipe for a session already running locally, based on the docs: (1) make sure you are signed in with claude.ai (`/login`) and not using an API key/gateway; (2) type `/remote-control` (or `/rc`), optionally with a name; (3) accept the one-time confirmation; (4) open the URL / scan the QR from `/remote-control` or find the session in claude.ai/code or the app's **Code** tab; (5) keep the terminal process running.
- Nothing in the docs suggests that the earlier conversation is lost when enabling mid-session; the docs explicitly say history is carried over.
- After a disconnect or resume, history may not always be re-uploaded to a replacement session (see "reconnection record" cases: replacement sessions can leave earlier messages out), so the safest path is to keep the same process running.

### Gaps
- The docs do not state a size/age limit on how much prior history is uploaded when enabling mid-session. Not found.
- The exact wording of the confirmation dialog beyond the button labels was not verified.

## 3. Requirements: account/auth type, plan tiers, admin toggles, minimum version, network, machine must stay awake?

### Takeaway
Requires a claude.ai subscription login (Pro, Max, Team or Enterprise) on a direct `api.anthropic.com` connection. API keys, long-lived tokens, Bedrock/Vertex-type providers, custom base URLs/gateways and telemetry-disabling env vars all block it. Team/Enterprise need an Owner to enable it. The local `claude` process must remain running, but it survives sleep/network drops by reconnecting.

### Cited Findings
- Plans: "Remote Control is available on all plans. On Team and Enterprise, it is off by default until an Owner enables the Remote Control toggle in Claude Code admin settings" (https://claude.ai/admin-settings/claude-code). Requirements list says "Pro, Max, Team, and Enterprise plans. API keys are not supported." — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Authentication: use `claude` then `/login` with claude.ai. Without an eligible login, `claude remote-control` exits with an error, while `claude --remote-control` still starts an interactive session and shows a failure notification shortly after launch. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Not supported with: Amazon Bedrock, Google Cloud's Agent Platform (Vertex), Microsoft Foundry; `ANTHROPIC_BASE_URL` pointing to a host other than `api.anthropic.com` (LLM gateway/proxy; since v2.1.196, previously allowed); enterprise Claude apps gateway sign-in. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Credential conflicts: `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, or an `apiKeyHelper` setting in use produce "Remote Control requires claude.ai subscription auth." Long-lived tokens from `claude setup-token` or `CLAUDE_CODE_OAUTH_TOKEN` produce "Remote Control requires a full-scope login token" (they can only make model requests); fix is `claude auth login`. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Feature-flag evaluation: `DISABLE_TELEMETRY`, `DO_NOT_TRACK`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`, and `DISABLE_GROWTHBOOK` each disable the feature-flag evaluation Remote Control depends on; unset them (in shell or `env` block of settings.json). — [Remote Control docs](https://code.claude.com/docs/en/remote-control); also [Data usage](https://code.claude.com/docs/en/data-usage)
- Workspace trust: run `claude` in the project directory at least once to accept the trust dialog; trust is never saved for the home directory, so start from a project directory. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Admin/policy blockers: `disableRemoteControl` via managed settings; org toggle off (Team/Enterprise default); stale Team/Enterprise login on a Pro/Max plan (fix: `claude auth logout` then `claude auth login`); HIPAA configurations are incompatible (admin toggle greyed out, contact Anthropic support). "Organizations with compliance requirements such as Zero Data Retention can't enable Remote Control." — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Diagnostics: `claude doctor` shows which eligibility check failed (including an `Organization policy` line, added v2.1.261). If eligibility can't be checked (offline/proxy) you get "Couldn't verify Remote Control eligibility" (v2.1.178+). — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Minimum version: no single overall minimum is stated. The feature first shipped as a `claude remote-control` subcommand in v2.1.51 (see Q5). Specific sub-features have minimums: `--continue`/`--session-id` v2.1.200+; device model pick v2.1.238+; effort control v2.1.234+; VS Code auto-connect toggle v2.1.203+; cross-session messaging v2.1.224+; `dialogExpiry` v2.1.224+. — [Remote Control docs](https://code.claude.com/docs/en/remote-control); [claudefa.st changelog mirror](https://claudefa.st/blog/guide/changelog) and [GitHub issue #28038](https://github.com/anthropics/claude-code/issues/28038) for v2.1.51
- Network: outbound HTTPS to the Anthropic API on port 443 is required; no inbound ports opened. A firewall/proxy blocking it causes "Remote credentials fetch failed". — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Must the machine stay awake/online? "Local process must keep running": if you close the terminal, quit VS Code or otherwise stop the `claude` process the session goes offline (shown offline within seconds). To keep a session alive on a remote machine after SSH disconnect, use `tmux` or `screen`. But "if your laptop sleeps or your network drops, Claude Code reconnects automatically when your machine comes back online," queuing messages, permission prompts and status updates meanwhile. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Outage behaviour: server mode gives up after roughly 10 minutes of no network and the process exits; interactive session keeps retrying indefinitely and reconnects on its own. Interactive sessions disconnect after ~30 minutes of failing presence heartbeats (`could not reach the Remote Control server for about 30 minutes`; run `/remote-control` to reconnect); HTTP 403 refusals are retried for up to three minutes. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Trusted Devices (beta, Team/Enterprise, off by default until an Owner enables it): requires enrolled device and a sign-in no older than 18 hours (biometric/passkey step-up) to view or steer Remote Control sessions from claude.ai, mobile, or Desktop; the CLI machine gets its credential automatically at sign-in; sessions already running when the toggle is enabled are not retroactively protected. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Mobile push notifications: install the Claude app, sign in with same account/org, allow notifications, then `/config` -> enable "Push when Claude decides" and/or "Push when actions required". Skipped while you are typing in/focused on the terminal. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)

### Inferences
- Users on Pro/Max with a personal login are the simplest case; Team/Enterprise users must confirm the admin toggle is on first. Users who normally run Claude Code with an API key, Bedrock/Vertex/Foundry, or an LLM gateway cannot use it without switching to a claude.ai login and unsetting those variables.
- Because the requirement is a "full-scope" login, someone who authenticates headless with `claude setup-token` / `CLAUDE_CODE_OAUTH_TOKEN` will hit an error.
- Since the doc mentions no minimum overall version, `claude update` plus a `/remote-control` attempt (or `claude doctor`) is the practical check.

### Gaps
- No official overall minimum Claude Code version is stated beyond the first-shipped v2.1.51 (from the release note quoted in a GitHub issue and a changelog mirror, not from the official docs page).
- The exact Anthropic hostnames/allowlist entries beyond "Anthropic API on port 443" were not found.

## 4. How it works, what runs where, what is transmitted, security/authentication model, and how to disconnect/stop

### Takeaway
All code execution and filesystem access stay on the user's machine; the local process makes outbound-only TLS connections to the Anthropic API, which relays messages. While connected, the session transcript (messages, responses, tool activity) is stored on Anthropic servers to sync devices. Access uses short-lived, purpose-scoped credentials plus the user's claude.ai account; disconnect via the `/remote-control` status panel or by stopping the process.

### Cited Findings
- "When you start a Remote Control session on your machine, Claude keeps running locally the entire time, so your code execution and filesystem access stay on your machine." The local filesystem, MCP servers, tools and project config remain available; `@` autocompletes paths from the local project. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Unlike cloud sessions, "Remote Control sessions run directly on your machine and interact with your local filesystem. The web and mobile interfaces are a window into that local session." — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Transport: "Your local Claude Code session makes outbound HTTPS requests only and never opens inbound ports on your machine. When you start Remote Control, it registers with the Anthropic API and polls for work. When you connect from another device, the server routes messages between the web or mobile client and your local session over a streaming connection." "All traffic travels through the Anthropic API over TLS." — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Credentials: "multiple short-lived credentials, each scoped to a single purpose and expiring independently"; a `claude remote-control` server re-registers when its registration credential expires. The Security page says this limits "the blast radius of any single compromised credential." — [Remote Control docs](https://code.claude.com/docs/en/remote-control); [Security](https://code.claude.com/docs/en/security)
- Data stored: "While Remote Control is connected, the session transcript, including your messages, Claude's responses, and tool activity, is stored on Anthropic servers. The stored transcript keeps the conversation in sync across your devices and lets the session reconnect after a network drop. Execution and filesystem access stay on your machine, and stored transcripts are retained under the Data usage policy." — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Data usage page: Remote Control "follow[s] the local data flow since all execution happens on your machine; while connected, the session transcript is also stored on Anthropic servers to sync the conversation across devices." Retention: consumer plans (Free/Pro/Max) 5 years if training allowed, 30 days if not; commercial (Team/Enterprise/API) standard 30 days, ZDR only for qualified accounts. — [Data usage](https://code.claude.com/docs/en/data-usage)
- Security page: for Remote Control "All code execution and file access stays local... No cloud VMs or sandboxing are involved." Sandboxing is off by default and can be enabled with `--sandbox` in server mode. — [Security](https://code.claude.com/docs/en/security); [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Permissions: the normal permission system still applies (the docs describe permission prompts forwarded to the remote device, and "Approve tool calls from your phone" reminders after repeated prompts). Permission prompts and `AskUserQuestion` questions stay open until answered; other forwarded dialogs expire after 5 minutes by default (`dialogExpiry`). — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Account scoping: a Remote Control session started via auto-connect "signs in with your own claude.ai account, so a session it starts appears only in your own account's Claude apps and grants no one else access." — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Git diff pane: the device requests the diff over the connection and Claude Code computes it on your machine. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Attachments: images sent from the phone/browser are given to Claude directly; other files are downloaded by Claude Code to your machine and passed as `@` file references. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Cross-session messaging (v2.1.224+): the same connection can carry messages between your own sessions on different machines and cloud sessions, "through Anthropic servers like the rest of Remote Control traffic." — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Disable/stop:
  - Disconnect while keeping the local session: run `/remote-control` and use the status panel (or run `/remote-control` again in VS Code). Running it again while still connecting turns it off immediately (fix noted in changelog, 2.1.269/2.1.271; the two changelog fetches disagreed on the exact version number).
  - Server mode: Ctrl+C stops it; sessions stop responding but are not archived and can be resumed for about four hours with `claude remote-control`, `--continue`, or `--session-id` (in the same directory).
  - Kill the `claude` process/close the terminal: the session shows offline within seconds.
  - Turn off entirely: `disableRemoteControl` setting; or disable auto-connect via `/config` / `remoteControlAtStartup: false`. Admins: Owner toggle in claude.ai/admin-settings/claude-code.
  - Sessions can also be archived/ended from claude.ai or the app. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Third-party (not official; treat with caution): a VentureBeat summary at launch said local files and environment variables remain on your computer and "only chat messages flow through the encrypted connection." — [VentureBeat](https://venturebeat.com/orchestration/anthropic-just-released-a-mobile-version-of-claude-code-called-remote) (secondary source; the current official docs are more specific: the transcript including tool activity is stored on Anthropic servers).
- Third-party: Simon Willison (Feb 25, 2026, right after launch) noted that users "have to approve every new action it takes" because `--dangerously-skip-permissions` seemed unsupported, and described the feature as "a little bit janky right now." — [Simon Willison](https://simonwillison.net/2026/Feb/25/claude-code-remote-control/) (launch-week impression; may be outdated; the current docs do offer `--permission-mode` for server mode).

### Inferences
- The tool output and file contents Claude reads (part of "tool activity") pass through and are stored on Anthropic servers as transcript, so anything sensitive Claude reads in a Remote Control session ends up in the stored transcript. The docs state tool activity is stored; they do not enumerate whether full tool-result bodies are stored.
- Because there is no sandbox by default, a phone-approved prompt has the same power as one approved at the terminal; the security boundary is the claude.ai account (plus Trusted Devices if the org enables it).

### Gaps
- The exact authentication handshake (token types, lifetimes) is not documented publicly beyond "multiple short-lived, narrowly scoped credentials".
- Whether the stored transcript includes full tool output vs summaries is not specified. Not found.
- One third-party post (frr.dev "Anatomy of Claude Code's Remote Control") appeared in search results claiming to describe the hidden API; it was not fetched or verified and is not relied on.

## 5. Known limitations, caveats, and status (GA vs beta/research preview) as of September 2026

### Takeaway
Remote Control launched Feb 24-25, 2026 as a research preview (Max first) and is now documented as available on all plans; the current official page carries no "beta" or "research preview" label for the core feature (only the Trusted Devices sub-feature is called beta). The exact date of the preview-to-GA transition was not found.

### Cited Findings
- Launch: Remote Control shipped on Feb 24, 2026, as a research preview for Max users, with Pro planned to follow, and not available at launch for Team/Enterprise. — [VentureBeat](https://venturebeat.com/orchestration/anthropic-just-released-a-mobile-version-of-claude-code-called-remote) (secondary source); consistent with search-result snippets from [Help Net Security](https://www.helpnetsecurity.com/2026/02/25/anthropic-remote-control-claude-code-feature/) (not fetched) and [Simon Willison](https://simonwillison.net/2026/Feb/25/claude-code-remote-control/) (Feb 25 post saying it "dropped yesterday").
- Changelog: v2.1.51: "Added `claude remote-control` subcommand for external builds, enabling local environment serving for all users." (opened as a doc-gap issue on Feb 24, 2026); session names default to hostname prefix, override with `--remote-control-session-name-prefix`. v2.1.58: "Expanded Remote Control to more users". — [GitHub issue #28038](https://github.com/anthropics/claude-code/issues/28038); [claudefa.st changelog mirror](https://claudefa.st/blog/guide/changelog) (third-party mirror of the official changelog)
- Recent changelog entries (Sept 2026) show active development: v2.1.268 (`/remote-control` suggests `/login` when signed out), v2.1.269 (`/remote-control` ignored while connecting; rename sync; auto-connect toggle fix), v2.1.271 (fork a `claude --remote-control`/`/remote-control` session from the Claude app; runs as a background session on your computer), v2.1.274, v2.1.275 (turn-off failure shown as off), v2.1.277 (session bookkeeping fix). — [CHANGELOG.md](https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md) (fetched via summarizer; one of two summarizer passes attributed the "ignored while connecting" fix to 2.1.271 rather than 2.1.269, so the exact version is uncertain)
- Current status labelling: the docs note reads "Remote Control is available on all plans. On Team and Enterprise, it is off by default until an Owner enables the Remote Control toggle." Only Trusted Devices is flagged "currently in beta." — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Third-party claim (unverified): one search summary said the feature reached Pro, Max, Team and Enterprise "as of August 2026." — search-result summary only, no primary source found.
- Limitations listed officially — [Remote Control docs](https://code.claude.com/docs/en/remote-control):
  - One remote session per interactive process (use server mode for multiple concurrent sessions, default capacity 32).
  - Local process must keep running (see Q3); server mode exits after ~10 min of network outage.
  - Some slash commands are local-only (e.g. `/plugin`, `/resume`); others work with argument forms only.
  - Forwarded non-permission dialogs expire after 5 minutes by default (`dialogExpiry`, v2.1.224+).
  - The "Fable usage-credits consent prompt" is not forwarded to the remote device; if unanswered at the terminal the turn ends without sending the request.
  - `/usage-credits` from mobile/web does not send an admin request on Team/Enterprise.
  - `/resume` and `/teleport` in the terminal change which conversation the device sees without replaying the earlier history.
  - HTTP 403 refusals (VPN/proxy/network change) are retried for up to three minutes, then Remote Control disconnects.
  - Not usable with ZDR orgs, HIPAA configurations, Bedrock/Vertex/Foundry, custom `ANTHROPIC_BASE_URL`, gateway sign-ins, or API-key auth (see Q3).
  - Web `/mcp` and `/config` behave differently from the CLI (directory of claude.ai connectors; opens settings page).
- Comparisons: Remote Control vs cloud sessions (claude.ai/code cloud sessions run on Anthropic VMs; use them for repos not cloned locally or parallel tasks) vs Dispatch, Channels, Slack, self-hosted environments, scheduled tasks — the docs give a comparison table. — [Remote Control docs](https://code.claude.com/docs/en/remote-control)
- Launch-week third-party observations of instability (account permission errors, API 500 errors, unclear session termination) — [Simon Willison](https://simonwillison.net/2026/Feb/25/claude-code-remote-control/) (Feb 2026; likely outdated).

### Inferences
- Given the doc labelling and changelog cadence, the feature appears to be generally available across plans in practice, but no official "GA"/"exit research preview" announcement was found, so the safe statement is "no longer labelled research preview in the current official docs; transition date unconfirmed."
- Trusted Devices being separately labelled beta suggests Anthropic still uses beta flags for sub-features of Remote Control.

### Gaps
- Official announcement text (Anthropic blog / X post by Noah Zweben / help-center article) was not fetched directly; launch details come from secondary coverage (VentureBeat, Help Net Security, Simon Willison), and the v2.1.51 / v2.1.58 changelog entries come from a GitHub issue and a third-party changelog mirror, not the raw official CHANGELOG (the raw CHANGELOG fetch returned only recent versions 2.1.267-2.1.277).
- The date at which "research preview" labelling was dropped and the date Pro/Team/Enterprise access opened were not confirmed from an official source.
- A Claude help-center (support.claude.com) article on Remote Control was not checked; it may contain user-facing details not in the Claude Code docs.
