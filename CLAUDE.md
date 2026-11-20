# FinCalc Pro project instructions

## Design reference

Before changing website UI or styling, read `public/assets/aistudio/SKILL_0c0ad932.md` and follow its applicable design guidance. Preserve the existing calculator logic, routes, accessibility, and responsive behavior unless the user explicitly requests a change.

## Git workflow

After completing each user-requested code change:

1. Review `git status` and the diff. Include only files related to the requested change.
2. Never stage secrets, `.env` files, build output, or unrelated user changes.
3. Commit the completed change with a concise descriptive message.
4. Push the current branch to the configured `origin` remote.
5. If authentication, network access, or a remote conflict prevents the push, report the specific issue and leave the commit available locally. Never use force push or overwrite remote history.

Do not push unfinished work. If a user explicitly asks not to commit or push for a task, follow that request.
