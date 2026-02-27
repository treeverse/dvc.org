# exp list

> Aliased to `dvc exp ls`.

List experiments in a <abbr>DVC repository</abbr> (remote or local).

## Synopsis

```usage
usage: dvc exp list [-h] [-q | -v] [-A] [--rev <commit>]
                    [-n <num>] [--name-only]
                    [git_remote]

positional arguments:
  git_remote    Optional Git remote name or Git URL
```

## Description

Prints a list of experiments found in the current repository, and the branch/tag
or commit they're based on. This is similar to `dvc exp show --no-pager`, but
limited to experiment names and with very simple formatting. See also
`dvc exp run`.

If a working `git_remote` name (e.g. `origin`) or Git URL is provided, lists
experiments in that <abbr>repository</abbr> instead (if any).

> Note that this utility doesn't require an existing <abbr>DVC project</abbr> to
> run from when a `git_remote` URL is given.

Only experiments derived from the `HEAD` commit are listed by default (see the
options below).

## Options

- `--rev <commit>` - list experiments derived from the specified `<commit>` as
  baseline (HEAD by default).

- `-n <num>`, `--num <num>` - list experiments from the last `num` commits
  (first parents) starting from the `--rev` baseline. Give a negative value to
  include all first-parent commits (similar to `git log -n`).

- `-A, --all-commits` - list all experiments in the repository (overrides
  `--rev` and `--num`).

- `--name-only` - print only the [names of the experiments] without their parent
  Git commit.

- `-h`, `--help` - shows the help message and exit.

- `-q`, `--quiet` - do not write anything to standard output. Exit with 0 if no
  problems arise, otherwise 1.

- `-v`, `--verbose` - displays detailed tracing information from executing the
  `dvc pull` command.

[names of the experiments]:
  /user-guide/experiment-management#how-does-dvc-track-experiments

## Examples

<admon type="info">

This example is based on [our Get Started], where you can find the actual source
code.

[our get started]: /start/experiments

</admon>

Let's say we have run 3 experiments in our project. You can quickly list the
available experiments with this command:

```cli
$ dvc exp list --all-commits
10-bigrams-experiment:
    60b225a [bally-gude]
    b485671 [gluey-leak]
    5f30433 [lurid-lair]
```

> Contrast this with the full table
> [displayed by `dvc exp show`](/command-reference/exp/show#examples).

You can also list experiments in any DVC repo with `dvc exp list`:

```cli
$ dvc exp list --all-commits git@github.com:treeverse/example-get-started.git
10-bigrams-experiment:
    bally-gude
    conic-ease
```

We can see that two experiments are available in
([the DVC repo](https://github.com/treeverse/example-get-started)).

If we're currently in a local clone of the repo, we can also use
[Git remote](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes)
name instead:

```cli
$ git remote -v
origin  git@github.com:treeverse/example-get-started.git
$ dvc exp list --all-commits origin
10-bigrams-experiment:
    bally-gude
    conic-ease
```

And in this context, `dvc exp pull` can download the experiments if needed, as
`dvc exp push` can upload any local ones we wish to share.
