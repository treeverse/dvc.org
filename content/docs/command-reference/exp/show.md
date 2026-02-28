# exp show

Displays your experiments in a customizable table.

> Press `q` to exit.

## Synopsis

```usage
usage: dvc exp show [-h] [-q | -v] [-a] [-T] [-A] [--rev <commit>]
                    [-n <num>] [--no-pager] [--drop <regex>]
                    [--keep <regex>] [--param-deps]
                    [--sort-by <metric/param>]
                    [--sort-order {asc,desc}] [--sha]
                    [--hide-failed] [--hide-queued] [--hide-workspace]
                    [--json] [--csv] [--md] [--precision <n>]
                    [--only-changed] [-f]
```

## Description

Displays experiments in a detailed table which includes their parent and name
(or hash), as well as colored columns for (left to right): metrics (yellow),
parameters (blue) and <abbr>dependencies</abbr> (violet).

Only the experiments derived from the Git `HEAD` are shown by default but all
experiments can be included with the `--all-commits` option. Example:

```cli
$ dvc exp show
```

```dvctable
 ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  neutral:**Experiment**                   neutral:**Created**        metric:**avg_prec**   metric:**roc_auc**   param:**featurize.max_features**   dep:**model.pkl**   dep:**data/features**
 ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  workspace                    -               0.60405    0.9608   3000                     484fab5     52c1fdd
  random-forest-experiments    May 29, 2021    0.60405    0.9608   3000                     484fab5     52c1fdd
  ├── a2efdc9 [urban-sign]     10:21 PM        0.55669   0.93516   1000                     e2b5a9a     1b2d542
  ├── e7bd029 [unwet-jinn]     10:21 PM        0.58589     0.945   2000                     7aae464     2ac217b
  └── 56f3be3 [freed-roam]     10:21 PM        0.51799   0.92333   500                      cfbfed4     64ed644
 ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
```

Your terminal will enter a [paginated screen](#paginating-the-output) by
default, which you can typically exit by typing `q`. Use `--no-pager` to print
the table to standard output.

By default, the printed experiments table will include columns for all metrics,
parameters and dependencies from the entire project. The `--only-changed`,
`--drop`, `--keep`, and other [options](#options) can determine which columns
should be displayed.

Experiments in the table are first grouped (by parent commit). They are then
sorted inside each group, chronologically by default. The `--sort-by` and
`--sort-order` options can change this ordering, based on any single, visible
metric or param. While these options sort experiments only, you can sort both
experiment and commit rows with the
[DVC Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=lakeFS.lakefs-dvc).

https://youtu.be/Flpu_-D_zDI?si=8G1NgC4n1RqfrIXg

### Paginating the output

This command's output is automatically piped to
[less](<https://en.wikipedia.org/wiki/Less_(Unix)>) if available in the terminal
(the exact command used is `less --chop-long-lines --clear-screen`). If `less`
is not available (e.g. on Windows), the output is simply printed out.

> It's also possible to
> [enable `less` on Windows](/user-guide/how-to/run-dvc-on-windows#enabling-paging-with-less).

### Providing a custom pager

It's possible to override the default pager via the `DVC_PAGER` environment
variable. Set it to a program found in `PATH` or give a full path to it. For
example on Linux shell:

```cli
$ DVC_PAGER=more dvc exp show  # Use more as pager once.
...

$ export DVC_PAGER=more  # Set more as pager for all commands.
$ dvc exp show ...
```

> For a persistent change, set `DVC_PAGER` in the shell configuration, for
> example in `~/.bashrc` for Bash.

## Options

- `-a`, `--all-branches` - include experiments derived from all Git branches, as
  well as from the last commit (`HEAD`). Note that this can be combined with
  `-T` below, for example using the `-aT` flags.

- `-T`, `--all-tags` - include experiments derived from all Git tags, as well as
  from the last commit. Note that this can be combined with `-a` above, for
  example using the `-aT` flags.

- `-A`, `--all-commits` - include experiments derived from all Git commits, as
  well as from the last one. This prints all experiments in the project.

- `--rev <commit>` - show experiments derived from the specified `<commit>` as
  baseline. Defaults to `HEAD` if none of `--rev`, `-a`, `-T`, `-A` is used.

- `-n <num>`, `--num <num>` - show experiments from the last `num` commits
  (first parents) starting from the `--rev` baseline. Give a negative value to
  include all first-parent commits (similar to `git log -n`).

- `--no-pager` - do not enter the pager screen. Writes the entire table to
  standard output. Useful to redirect the output to a file, or use your own
  paginator.

- `--param-deps` - include only parameters that are stage dependencies.

- `--only-changed` - show only metrics, parameters and dependencies with values
  that vary across experiments.

- `--drop <regex>` - remove the matching columns. This option has higher
  priority than `--only-changed`. If both options are combined, `--drop` will
  remove matching columns even if their values vary across experiments.

- `--keep <regex>` - prevent the matching columns to be removed by any of the
  other options, including `--only-changed` and `--drop`.

- `--sort-by <name>` - sort experiments by the specified metric or param
  (`name`). Only one visible column (either metric or param) can be used for
  sorting. This only affects the ordering of experiments derived from the same
  parent commit. Parent commits are always sorted chronologically.

- `--sort-order {asc,desc}` - sort order to use with `--sort-by`. Defaults to
  ascending (`asc`).

- `--sha` - display Git commit (SHA) hashes instead of branch, tag, or
  experiment names.

- `--hide-failed` - hide failed experiments in the table.

- `--hide-queued` - hide queued experiments in the table.

- `--hide-workspace` - hide workspace row in the table.

- `--json` - prints the command's output in easily parsable JSON format, instead
  of a human-readable table.

- `--csv` - prints the command's output in CSV format instead of a
  human-readable table.

- `--md` - prints the command's output in Markdown table format.

- `--precision <n>` -
  [round](https://docs.python.org/3/library/functions.html#round) decimal values
  to `n` digits of precision (5 by default). Applies to metrics only.

- `-h`, `--help` - prints the usage/help message, and exit.

- `-q`, `--quiet` - do not write anything to standard output. Exit with 0 if no
  problems arise, otherwise 1.

- `-v`, `--verbose` - displays detailed tracing information.

- `-f`, `--force` - force re-collection of experiments instead of loading from
  internal experiments cache. DVC caches `exp show` table data for completed
  experiments to improve performance of subsequent `exp show` calls. When
  `--force` is specified, DVC will reload all experiment data and ignore any
  previously cached results.

## Examples

<admon type="info">

This example is based on [our Get Started], where you can find the actual source
code.

[our get started]: /start/experiments

</admon>

Let's say we have run 3 experiments in our project. The basic usage shows the
workspace (Git working tree) and experiments derived from `HEAD` (`master`
branch in this case), and all of their metrics, parameters and dependencies
(scroll right to see all):

```cli
$ dvc exp show
```

```dvctable
 ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  neutral:**Experiment**                   neutral:**Created**        metric:**avg_prec**   metric:**roc_auc**   param:**prepare.split**   param:**prepare.seed**   param:**featurize.max_features**   param:**featurize.ngrams**   param:**train.seed**   param:**train.n_est**   param:**train.min_split**   dep:**data/prepared**   dep:**src/train.py**   dep:**src/evaluate.py**   dep:**src/prepare.py**   dep:**data/features**   dep:**data/data.xml**   dep:**model.pkl**   dep:**src/featurization.py**
 ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  workspace                    -               0.60405    0.9608   0.2             20170428       3000                     2                  20170428     100           64                20b786b         9ab9549        fb7b520           51549a1          52c1fdd         a304afb         484fab5     61c5927
  random-forest-experiments    May 29, 2021    0.60405    0.9608   0.2             20170428       3000                     2                  20170428     100           64                20b786b         9ab9549        fb7b520           51549a1          52c1fdd         a304afb         484fab5     61c5927
  ├── e7bd029 [unwet-jinn]     10:21 PM        0.58589     0.945   0.2             20170428       2000                     2                  20170428     100           64                20b786b         9ab9549        fb7b520           51549a1          2ac217b         a304afb         7aae464     61c5927
  ├── a2efdc9 [urban-sign]     10:21 PM        0.55669   0.93516   0.2             20170428       1000                     2                  20170428     100           64                20b786b         9ab9549        fb7b520           51549a1          1b2d542         a304afb         e2b5a9a     61c5927
  └── 56f3be3 [freed-roam]     10:21 PM        0.51799   0.92333   0.2             20170428       500                      2                  20170428     100           64                20b786b         9ab9549        fb7b520           51549a1          64ed644         a304afb         cfbfed4     61c5927
 ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
```

> You can exit this screen with `Q`, typically.

As a quick way of reducing noise, `--only-changed` will drop any column with
values that do not change across experiments:

```cli
$ dvc exp show --only-changed
```

```dvctable
 ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  neutral:**Experiment**                   neutral:**Created**        metric:**avg_prec**   metric:**roc_auc**   param:**featurize.max_features**   dep:**model.pkl**   dep:**data/features**
 ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  workspace                    -               0.60405    0.9608   3000                     484fab5     52c1fdd
  random-forest-experiments    May 29, 2021    0.60405    0.9608   3000                     484fab5     52c1fdd
  ├── a2efdc9 [urban-sign]     10:21 PM        0.55669   0.93516   1000                     e2b5a9a     1b2d542
  ├── e7bd029 [unwet-jinn]     10:21 PM        0.58589     0.945   2000                     7aae464     2ac217b
  └── 56f3be3 [freed-roam]     10:21 PM        0.51799   0.92333   500                      cfbfed4     64ed644
 ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
```

You can also use `--drop` to filter specific columns:

```cli
$ dvc exp show --drop prepare
```

```dvctable
 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  neutral:**Experiment**                   neutral:**Created**        metric:**avg_prec**   metric:**roc_auc**   param:**featurize.max_features**   param:**featurize.ngrams**   param:**train.seed**   param:**train.n_est**   param:**train.min_split**   dep:**data/prepared**   dep:**model.pkl**   dep:**data/data.xml**   dep:**src/prepare.py**   dep:**data/features**   dep:**src/evaluate.py**   dep:**src/featurization.py**   dep:**src/train.py**
 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  workspace                    -               0.60405    0.9608   3000                     2                  20170428     100           64                20b786b         484fab5     a304afb         51549a1          52c1fdd         fb7b520           61c5927                9ab9549
  random-forest-experiments    May 29, 2021    0.60405    0.9608   3000                     2                  20170428     100           64                20b786b         484fab5     a304afb         51549a1          52c1fdd         fb7b520           61c5927                9ab9549
  ├── e7bd029 [unwet-jinn]     10:21 PM        0.58589     0.945   2000                     2                  20170428     100           64                20b786b         7aae464     a304afb         51549a1          2ac217b         fb7b520           61c5927                9ab9549
  ├── a2efdc9 [urban-sign]     10:21 PM        0.55669   0.93516   1000                     2                  20170428     100           64                20b786b         e2b5a9a     a304afb         51549a1          1b2d542         fb7b520           61c5927                9ab9549
  └── 56f3be3 [freed-roam]     10:21 PM        0.51799   0.92333   500                      2                  20170428     100           64                20b786b         cfbfed4     a304afb         51549a1          64ed644         fb7b520           61c5927                9ab9549
 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
```

You can use [regex][regex] to match columns. For example, to remove multiple
columns:

```cli
$ dvc exp show --drop 'avg_prec|train.min_split'
```

```dvctable
 ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  neutral:**Experiment**                      neutral:**Created**        metric:**roc_auc**   param:**prepare.split**   param:**prepare.seed**   param:**featurize.max_features**   param:**featurize.ngrams**   param:**train.seed**   param:**train.n_est**   dep:**src/prepare.py**   dep:**data/prepared**   dep:**data/features**   dep:**data/data.xml**   dep:**src/evaluate.py**   dep:**src/featurization.py**   dep:**src/train.py**   dep:**model.pkl**
 ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  workspace                       -               0.9608   0.2             20170428       3000                     2                  20170428     100           51549a1          20b786b         52c1fdd         a304afb         fb7b520           61c5927                9ab9549        484fab5
  11-random-forest-experiments    May 29, 2021    0.9608   0.2             20170428       3000                     2                  20170428     100           51549a1          20b786b         52c1fdd         a304afb         fb7b520           61c5927                9ab9549        484fab5
  ├── a2efdc9 [urban-sign]        10:21 PM       0.93516   0.2             20170428       1000                     2                  20170428     100           51549a1          20b786b         1b2d542         a304afb         fb7b520           61c5927                9ab9549        e2b5a9a
  ├── e7bd029 [unwet-jinn]        10:21 PM         0.945   0.2             20170428       2000                     2                  20170428     100           51549a1          20b786b         2ac217b         a304afb         fb7b520           61c5927                9ab9549        7aae464
  └── 56f3be3 [freed-roam]        10:21 PM       0.92333   0.2             20170428       500                      2                  20170428     100           51549a1          20b786b         64ed644         a304afb         fb7b520           61c5927                9ab9549        cfbfed4
 ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
```

If combined `--only-changed` has the least priority, `--drop` comes next, and
`--keep` has the last word:

```cli
$ dvc exp show --only-changed --drop Created --keep 'train.(?!seed)'
```

```dvctable
 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  neutral:**Experiment**                   metric:**avg_prec**   metric:**roc_auc**   param:**featurize.max_features**   param:**train.n_est**   param:**train.min_split**   dep:**model.pkl**   dep:**data/features**
 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  workspace                     0.60405    0.9608   3000                     100           64                484fab5     52c1fdd
  random-forest-experiments     0.60405    0.9608   3000                     100           64                484fab5     52c1fdd
  ├── e7bd029 [unwet-jinn]      0.58589     0.945   2000                     100           64                7aae464     2ac217b
  ├── a2efdc9 [urban-sign]      0.55669   0.93516   1000                     100           64                e2b5a9a     1b2d542
  └── 56f3be3 [freed-roam]      0.51799   0.92333   500                      100           64                cfbfed4     64ed644
 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
```

Sort experiments by the `roc_auc` metric, in descending order:

```cli
$ dvc exp show --only-changed --sort-by=roc_auc --sort-order desc
```

```dvctable
 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  neutral:**Experiment**                      neutral:**Created**        metric:**avg_prec**   metric:**roc_auc**   param:**featurize.max_features**   dep:**model.pkl**   dep:**data/features**
 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  workspace                       -               0.60405    0.9608   3000                     484fab5     52c1fdd
  11-random-forest-experiments    May 29, 2021    0.60405    0.9608   3000                     484fab5     52c1fdd
  ├── e7bd029 [unwet-jinn]        10:21 PM        0.58589     0.945   2000                     7aae464     2ac217b
  ├── a2efdc9 [urban-sign]        10:21 PM        0.55669   0.93516   1000                     e2b5a9a     1b2d542
  └── 56f3be3 [freed-roam]        10:21 PM        0.51799   0.92333   500                      cfbfed4     64ed644
 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
```

To see all experiments throughout the Git history:

```cli
$ dvc exp show --all-commits --only-changed --sort-by=roc_auc
```

```dvctable
 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  neutral:**Experiment**                      neutral:**Created**        metric:**avg_prec**   metric:**roc_auc**   param:**prepare.split**   param:**prepare.seed**   param:**featurize.max_features**   param:**featurize.ngrams**   param:**train.seed**   param:**train.n_est**   param:**train.min_split**   dep:**src/train.py**   dep:**model.pkl**   dep:**data/data.xml**   dep:**src/evaluate.py**   dep:**data/features**   dep:**src/prepare.py**   dep:**data/prepared**   dep:**src/featurization.py**
 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  workspace                       -               0.60405    0.9608   0.2             20170428       3000                     2                  20170428     100           64                9ab9549        484fab5     a304afb         fb7b520           52c1fdd         51549a1          20b786b         61c5927
  bee447d                        Jun 01, 2021    0.67038   0.96693   0.2             20170428       3000                     2                  20170428     100           64                9ab9549        fe89bd4     c1fa36d         fb7b520           7c68668         51549a1          030d866         61c5927
  11-random-forest-experiments    May 29, 2021    0.60405    0.9608   0.2             20170428       3000                     2                  20170428     100           64                9ab9549        484fab5     a304afb         fb7b520           52c1fdd         51549a1          20b786b         61c5927
  ├── 56f3be3 [freed-roam]        10:21 PM        0.51799   0.92333   0.2             20170428       500                      2                  20170428     100           64                9ab9549        cfbfed4     a304afb         fb7b520           64ed644         51549a1          20b786b         61c5927
  ├── a2efdc9 [urban-sign]        10:21 PM        0.55669   0.93516   0.2             20170428       1000                     2                  20170428     100           64                9ab9549        e2b5a9a     a304afb         fb7b520           1b2d542         51549a1          20b786b         61c5927
  └── e7bd029 [unwet-jinn]        10:21 PM        0.58589     0.945   0.2             20170428       2000                     2                  20170428     100           64                9ab9549        7aae464     a304afb         fb7b520           2ac217b         51549a1          20b786b         61c5927
  bigrams-experiment             May 28, 2021    0.55259   0.91536   0.2             20170428       1500                     2                  20170428     50            2                 9ab9549        17b3d1e     a304afb         fb7b520           f237c73         51549a1          20b786b         61c5927
  9-bigrams-model                May 27, 2021    0.52048    0.9032   0.2             20170428       1500                     2                  20170428     50            2                 9ab9549        c4c0670     a304afb         fb7b520           2b5e0fd         51549a1          20b786b         61c5927
  8-evaluation                   May 25, 2021    0.52048    0.9032   0.2             20170428       500                      1                  20170428     50            2                 9ab9549        c4c0670     a304afb         fb7b520           2b5e0fd         51549a1          20b786b         61c5927
  7-ml-pipeline                  May 24, 2021          -         -   0.2             20170428       500                      1                  20170428     50            2                 9ab9549        -           a304afb         -                 2b5e0fd         51549a1          20b786b         61c5927
  6-prepare-stage                May 23, 2021          -         -   0.2             20170428       500                      1                  20170428     50            2                 -              -           a304afb         -                 -               51549a1          -               -
  5-source-code                  May 22, 2021          -         -   0.2             20170428       500                      1                  20170428     50            2                 -              -           -               -                 -               -                -               -
  4-import-data                  May 21, 2021          -         -   -               -              -                        -                  -            -             -                 -              -           -               -                 -               -                -               -
  3-config-remote                May 20, 2021          -         -   -               -              -                        -                  -            -             -                 -              -           -               -                 -               -                -               -
  2-track-data                   May 18, 2021          -         -   -               -              -                        -                  -            -             -                 -              -           -               -                 -               -                -               -
  1-dvc-init                     May 17, 2021          -         -   -               -              -                        -                  -            -             -                 -              -           -               -                 -               -                -               -
  0-git-init                     May 16, 2021          -         -   -               -              -                        -                  -            -             -                 -              -           -               -                 -               -                -               -
 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
```

Note that in this example, Git commits remain in chronological order. The
sorting only applies to experiment groups (sharing a parent commit).

[regex]: https://regexone.com/
