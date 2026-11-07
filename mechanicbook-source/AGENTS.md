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

## Rules

- Declare route loaders as standalone consts with explicitly typed `params`/`context` args, then pass `loader: loaderFn`. An inline loader with any parameter collapses `head()`'s `loaderData` and `Route.useLoaderData()` to `never`/`undefined` under tsgo's inference.
