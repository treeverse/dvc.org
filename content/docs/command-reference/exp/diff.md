# exp diff

Show changes in [metrics](/command-reference/metrics) and
[parameters](/command-reference/params) between experiments.

## Synopsis

```usage
usage: dvc exp diff [-h] [-q | -v] [--all] [--param-deps]
                    [--json] [--md]
                    [--no-path] [--precision <n>]
                    [a_rev] [b_rev]
positional arguments:
  a_rev            Old experiment to compare (defaults to HEAD)
  b_rev            New experiment to compare (defaults to the current
                   workspace)
```

# Description

Provides a quick way to compare `dvc params` and `dvc metrics` between two
experiments by printing a table of differences. By default, it includes the
params/metrics file "Path", "Param" or "Metric" name, the new "Value", and the
difference ("Change") for numeric values. Example:

```cli
$ dvc exp diff
Path         Metric   HEAD      workspace  Change
scores.json  roc_auc  0.915363  0.93345    0.018087
scores.json  grade    B         B-         —

Path         Param         HEAD  workspace  Change
params.yaml  max_features  1500  3000       1500
```

> This is similar to combining the reports from `dvc params diff` and
> `dvc metrics diff` together, for the experiments in question.

Without arguments, this command compares all the params and metrics referenced
in `dvc.yaml` files present in the <abbr>workspace</abbr> with the latest
committed versions (required). Only params/metrics that changed are listed, by
default (show everything with `--all`).

`a_rev` and `b_rev` are optional experiments to compare. They accept experiment
names or hashes (see `dvc exp run` for details). Providing a single one results
in comparing it to the workspace.

Another way to display experiments is the `dvc exp show` command, which lists
all the current experiments (without comparisons).

## Options

- `--all` - list all parameters and metrics, including those without changes.

- `--param-deps` - include only parameters that are stage dependencies.

- `--json` - prints the command's output in easily parsable JSON format, instead
  of a human-readable table.

- `--md` - prints the command's output in the Markdown table format
  ([GFM](https://github.github.com/gfm/#tables-extension-)).

- `--no-path` - hide the "Path" column that lists the param/metrics file
  location. Useful when only one metrics or params file exists, for example

- `--precision <n>` -
  [round](https://docs.python.org/3/library/functions.html#round) decimal values
  to `n` digits of precision (5 by default). Applies to metrics only.
- `-h`, `--help` - prints the usage/help message, and exit.

- `-q`, `--quiet` - do not write anything to standard output. Exit with 0 if no
  problems arise, otherwise 1.

- `-v`, `--verbose` - displays detailed tracing information.

## Examples

<admon type="info">

This example is based on [our Get Started], where you can find the actual source
code.

[our get started]: /start/experiments

</admon>

Let's say we have run 3 experiments in our project:

```cli
$ dvc exp show
```

```dvctable
 ────────────────────────────────────────────────────────────────────────────────────────────
  neutral:**Experiment**               neutral:**Created**           metric: **auc**   param:**featurize.max_features**   param:**featurize.ngrams**
 ────────────────────────────────────────────────────────────────────────────────────────────
  workspace                -              0.61314   1500                     2
  10-bigrams-experiment    Jun 20, 2020   0.61314   1500                     2
  ├── major-mela           Oct 21, 2020   0.61314   1500                     2
  ├── gluey-leak           Oct 09, 2020   0.57756   2000                     2
  └── ochre-dook           Oct 09, 2020   0.51676   500                      2
 ────────────────────────────────────────────────────────────────────────────────────────────
```

Since we haven't made any changes to the workspace, we can compare `gluey-leak`
to its baseline (`10-bigrams-experiment`, current `HEAD`) like this:

```cli
$ dvc exp diff gluey-leak
Path         Metric  HEAD     gluey-leak  Change
scores.json  auc     0.61314  0.577565    -0.035575

Path         Param                   HEAD  gluey-leak  Change
params.yaml  featurize.max_features  2000  1500        -500
```

To compare two specific experiments (values are shown for the second one by
default):

```cli
$ dvc exp diff gluey-leak ochre-dook
Path         Metric  gluey-leak  ochre-dook   Change
scores.json  auc     0.577559    0.51676     -0.060799

Path         Param                   gluey-leak  ochre-dook  Change
params.yaml  featurize.max_features  2000        500        -1500
```

To compare an experiment to the
[`7-ml-pipeline`](https://github.com/treeverse/example-get-started/releases/tag/7-ml-pipeline)
tag (or any other [revision](https://git-scm.com/docs/revisions)):

```cli
$ dvc exp diff gluey-leak 7-ml-pipeline
Path         Metric  gluey-leak  7-ml-pipeline  Change
scores.json  auc     0.577559    None           diff not supported

Path         Param                   gluey-leak  7-ml-pipeline  Change
params.yaml  featurize.max_features  2000        500            -1500
params.yaml  featurize.ngrams        2           1              -1
```
