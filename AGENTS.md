<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep assessment questions, answer keys, and progression rules in a browser-safe module shared by the quiz and tests so retry decisions remain consistent.
- Keep prototype navigation and attempt state in React; returning from tutoring starts a fresh final assessment without retaining old selections.
- Use separate TanStack routes for teacher sections and student session URLs, with portal navigation and shared in-memory class state in the root shell; this keeps deep links functional without a backend.
