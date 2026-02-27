# Contributing to the Documentation

We welcome any contributions to our documentation repository,
[dvc.org](https://github.com/treeverse/dvc.org). Contributions can be updates to
the documentation content, or (rare) changes to the JS engine we use to run the
website.

In case of a minor change, you can use the **Edit on GitHub** button to open the
source code page. Use the Edit button (pencil icon) to edit the file in-place,
and then **Commit changes** from the bottom of the page.

## Structure of the project

To contribute documentation, these are the relevant locations:

- [Content](https://github.com/treeverse/dvc.org/tree/main/content/docs)
  (`content/docs/`):
  [Markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
  files. One file — one page of the documentation.
- [Images](https://github.com/treeverse/dvc.org/tree/main/static/img)
  (`static/img/`): Add new images (`.png`, `.svg`, etc.) here. Use them in
  Markdown files like this: `![](/img/<filename>.gif)`.
- [Navigation](https://github.com/treeverse/dvc.org/blob/main/content/docs/sidebar.json)
  (`content/docs/sidebar.json`): Edit it to add or change entries in the
  navigation sidebar.

Merging the appropriate changes to these files into the `main` branch is enough
to update the docs and redeploy the website.

## Submitting changes

- Find or open a new issue in the
  [issue tracker](https://github.com/treeverse/dvc.org/issues) to let us know
  that you are working on this.

- Format the source code by following the
  [style guidelines](#doc-style-guidelines-javascript-and-markdown) below. We
  highly recommend setting up a
  [development environment](#development-environment) as explained below. Among
  other things, it can help format the documentation and JS code automatically.

- Push the changes to your fork of
  [dvc.org](https://github.com/treeverse/dvc.org) and submit a PR to the
  upstream repo.

We will review your PR as soon as possible. Thank you for contributing!

## Development environment

We highly recommend running this web app locally to check documentation changes
before submitting them, and it's quite necessary when making changes to the
website engine itself. Source code and content files need to be properly
formatted and linted as well, which is also ensured by the full setup below.

Make sure you have a recent LTS version of [Node.js](https://nodejs.org/en/)
(`>=18.0.0`, `<=20.x`), and install [Yarn](https://yarnpkg.com/):

> In Windows, you may need to install [Visual Studio Build Tools], and the
> [Windows
>
> > SDK] first.

[windows sdk]:
  https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk/
[visual studio build tools]:
  https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2019

```cli
$ npm install -g yarn
```

Having cloned this project locally, navigate into the directory and install the
project dependencies with Yarn:

```cli
$ yarn
```

Launch the server locally with:

```cli
$ yarn develop
```

This will start the server on the default port, `8000`. Visit
`http://localhost:8000/` and navigate to the page in question. This will also
enable the pre-commit Git hook that will be formatting and linting your code and
documentation files automatically.

### All commands

These Node scripts are specified in the docs repo's `package.json` file.

To build the project and run it:

- `yarn develop` - run development server with hot reload.
- `yarn build` - build assets in the `public` directory.
- `yarn start` - run production static server over the `public` directory.

> All the tests, formatting, and linters below will be automatically enforced
> before every commit with [Husky](https://typicode.github.io/husky/) and
> [lint-staged](https://github.com/lint-staged/lint-staged) before each commit,
> as well as with [GitHub Actions](https://github.com/features/actions) upon
> [submitting PRs](#submitting-changes).

If you change source code files, run tests:

- `yarn test` - run tests.

We use [Prettier](https://prettier.io/) to format our source code. Below is a
set of wrapper commands for your convenience:

- `yarn format-all` - Run `prettier --write` on all files to find formatting
  issues and automatically fix as many as possible.
- `yarn format-check-all` - Run `prettier --check` on all files, exiting with an
  error if any issues are found. This is particularly useful for CI.
- `yarn format-staged` - alias for `lint-staged`, which will run all applicable
  linters on all files staged in your copy of the git repository.
- `yarn format <file>` - Run `prettier` on a specific file.

We use linters (e.g. [ESLint](https://eslint.org/)) to check source code style
and detect different errors:

- `yarn lint` - run `eslint` on all compatible source code files: `js`, `jsx`,
  `ts`, `tsx`, `json`.
- `yarn lint-fix` - use `eslint --fix` to automatically fix as many issues as
  possible.
- `yarn lint-ts` - uses `tsc` to attempt to compile the project, ensuring all
  TypeScript types are properly formatted.
- `yarn lint-css` - lint `.css` files with `stylelint`, which covers more than
  `prettier` does alone.

To use the `fix` variant of all of these tools in one command, use
`yarn fix-all`.

> Note that you can always use the formatter or linter directly (e.g.
> `yarn eslint <file>` or `yarn prettier --check <file>`).

### ENV variables

Some environment variables are required to deploy this project to production,
others can be used to debug the project. Please check the production system
settings to see all the variables that production and deployment system depend
on.

Some available variables:

- `GA_ID` – ID of the Google Analytics counter.
- `ANALYZE` - boolean property to run
  [webpack-analyzer](https://www.gatsbyjs.com/plugins/gatsby-plugin-webpack-bundle-analyser-v2/).
- `SENTRY_DSN` - [Sentry](https://sentry.io/welcome/) URL for errors tracking.

## Doc style guidelines (JavaScript and Markdown)

Some of the following rules are applied automatically by a pre-commit Git hook
that is installed when `yarn` runs (see [dev env](#development-environment)).

- No trailing white spaces are allowed.

- Text content must be properly formatted at 80 symbols width.

  > 💡 We recommend using Visual Studio Code with the
  > [Rewrap](https://marketplace.visualstudio.com/items?itemName=stkb.rewrap)
  > plugin for help with this.

- You can see the configuration of our formatter tool (Prettier)
  [here](https://github.com/treeverse/dvc.org/blob/main/.prettierrc). You may
  also run the formatting [commands](#all-commands) manually.
  ([Advanced usage](https://prettier.io/docs/cli.html) of Prettier is available
  through `yarn prettier ...`)

- Markdown: Using `dvc <command>`, the docs engine will create a link to that
  command automatically. (No need to use `[]()` explicitly to create them.)

- Markdown: Using `dvc.api.<api_method>()` or `dvc.api`, the docs engine will
  create a link to that API method automatically. (No need to use `[]()`
  explicitly to create them.)

- Markdown: Bullet lists shouldn't be too long (5-7 items max., ideally).

- Markdown: The text in each bullet item also shouldn't be too long (3 sentence
  paragraphs max.) Full sentence bullets should begin with a capital letter and
  end in period `.`. Otherwise, they can be all lower case and have no ending
  punctuation. Bullets can be separated by an empty line if they contain several
  paragraphs, but this is discouraged: try to keep items short.

- Markdown: Syntax highlighting in fenced code blocks should use the `usage`
  `dvc`, `dvctable`, `yaml`, or `diff` custom languages.
  - `usage` is employed to show the `dvc --help` output for each command
    reference.
  - `dvc` can be used to show examples of commands and their output in a
    terminal session.
  - `dvctable` is used for creating colored, bold, or italic table cells. (You
    can see an [example](/start/experiments) of `dvctable` in our "Get Started"
    section.)
  - `yaml` is used to show samples of <abbr>DVC files</abbr>, or other YAML
    contents.
  - `diff` is used mainly for examples of `git diff` output.

> Check out the `.md` source code of any command reference to get a better idea,
> for example in
> [this very file](https://raw.githubusercontent.com/treeverse/dvc.org/main/content/docs/contributing/docs.md).

## General language guidelines

We try to use a casual and fun tone in our docs. We also avoid authoritative
language such as "As you can see, clearly this is what happened, of course" etc.
which while good-intentioned, may scare readers off.

We prefer general, human-friendly language rather than exact jargon as long as
it's correct. Example: avoid Git jargon such as _revision_ or _reference_,
preferring the more basic terms _commit_ or _version_.

The [command reference](/command-reference) contains some of our most technical
documents where specialized language is used the most, but even there, we use
expandable sections for complex implementation details.

Start by writing the essence in simple terms, and complete it with
clarifications, edge cases, or other precisions in a separate iteration.

We use **bold** text for emphasis, and _italics_ for special terms.

We also use "emoji" symbols sparingly for visibility on certain notes. Mainly:

- 📖 For notes that link to other related documentation
- ⚠️ Important warnings or disclaimers related to advanced DVC usage
- 💡 Useful notes and tips, often related to external tools and integrations

> Some other emojis currently in use here and there: ⚡ ✅ 🙏 🐛 ⭐ ⚙️ ℹ️ (among
> others).
