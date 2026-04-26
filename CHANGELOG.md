# Changelog

## 2026-04-26

- Docker: removed baked-in `DATABASE_URL` / `NODE_ENV` from the production image; Compose dev vs prod split; root image runs `prisma migrate deploy` before `pnpm start`; pnpm with frozen lockfiles in image builds.
- Tooling: root `package-lock.json` removed in favor of pnpm; added `.env.example`, Dependabot grouping for weekly minor/patch npm and Actions updates, and Playwright E2E from `e2e/`.
- Docs: course `lab4` artifacts moved under `docs/lab-notes/`.

### Dependabot / dependency upgrades (triage)

Do **not** auto-merge these major bumps without manual testing:

- **Express 4→5:** route handler signatures, error middleware (4-arg), and `res.json` behavior.
- **Prisma 6→7:** generated client API changes, especially relation queries.
- **Vite 5→8:** `vite.config` and deprecated plugin options.
- **React 18→19:** legacy APIs (string refs, legacy context).

Do safely merge routine **minor** and **patch** updates (for example `cors`, `nodemon`, ESLint patch releases).
