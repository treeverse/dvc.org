# exp apply

Put the results from an [experiment](/command-reference/exp) in the
<abbr>workspace</abbr>.

## Synopsis

```usage
usage: dvc exp apply [-h] [-q | -v] experiment

positional arguments:
  experiment     Experiment to be applied
```

## Description

Restores an `experiment` into the workspace. The experiment can be referenced by
name or hash (see `dvc exp run` for details).

Specifically, `dvc exp apply` restores any files or directories which exist in
the experiment, to their exact states from the experiment. This includes files
tracked both with DVC and Git: code, raw data, <abbr>parameters</abbr>,
<abbr>metrics</abbr>, resulting artifacts, etc.

The resulting Git + DVC workspace after `dvc exp apply` will contain the
contents of `experiment`, plus any files from the workspace prior to
`dvc exp apply` that did not exist in `experiment`.

This is typically used after choosing a target `experiment` with `dvc exp show`
or `dvc exp diff`, and before committing it to Git (making it [persistent]).

<admon type="warn">

Conflicting changes in the workspace are overwritten, but the result of
`dvc exp apply` can be reverted using Git.

</admon>

<details icon="bulb">

### Expand for details on reverting `dvc exp apply`

`dvc exp apply` can be reverted with the following Git workflow:

```cli
$ git stash
$ git stash apply refs/exps/apply/stash
```

<admon type="info">

Note that `git stash apply` my fail if you run Git commands which affect `HEAD`
(such as `git commit` or `git checkout`) after `dvc exp apply`.

</admon>

</details>

[persistent]:
  /user-guide/experiment-management/sharing-experiments#persist-experiment

## Options

- `-h`, `--help` - shows the help message and exit.

- `-q`, `--quiet` - do not write anything to standard output. Exit with 0 if no
  problems arise, otherwise 1.

- `-v`, `--verbose` - displays detailed tracing information from executing the
  `dvc pull` command.

## Example: Make an experiment persistent

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
  neutral:**Experiment**               neutral:**Created**            metric:**auc**   param:**featurize.max_features**   param:**featurize.ngrams**
 ────────────────────────────────────────────────────────────────────────────────────────────
  workspace                -              0.61314   1500                     2
  10-bigrams-experiment    Jun 20, 2020   0.61314   1500                     2
  ├── gluey-leak           Oct 21, 2020   0.69830   2000                     2
  ├── frank-farm           Oct 09, 2020   0.57756   1200                     2
  └── union-mart           Oct 09, 2020   0.51676   500                      2
 ────────────────────────────────────────────────────────────────────────────────────────────
```

Since `gluey-leak` has the best `auc`, we may want to commit it into our project
(this is what we call to "make it persistent"):

```cli
$ dvc exp apply gluey-leak
Changes for experiment 'gluey-leak' have been applied...
```

We can inspect what changed in the workspace with Git,

```cli
$ git status
On branch master
Changes not staged for commit:
        modified:   dvc.lock
        modified:   params.yaml
        modified:   scores.json
$ git diff params.yaml
```

```git
@@ -3,7 +3,7 @@ prepare:
 featurize:
-  max_features: 1500
+  max_features: 2000
   ngrams: 2
```

and with DVC:

```cli
$ dvc status
Data and pipelines are up to date.
$ dvc diff
Modified:
    data/features/
    data/features/test.pkl
    data/features/train.pkl
    model.pkl
files summary: 0 added, 0 deleted, 3 modified, 0 not in cache
```

To finish making this experiment persistent, we commit the changes to the repo:

```cli
$ git add .
$ git commit -m "persist gluey-leak"
```

We can now see that the experiment is the new tip of our master branch:

```cli
$ dvc exp show
```

```dvctable
 ─────────────────────────────────────────────────────────────────────────────
  neutral:**Experiment**   neutral:**Created**        metric:**auc**   param:**featurize.max_features**   param:**featurize.ngrams**
 ─────────────────────────────────────────────────────────────────────────────
  workspace    -          0.69830   2000                     2
  master       04:31 PM   0.69830   2000                     2
 ─────────────────────────────────────────────────────────────────────────────
```

Note that all the other experiments are based on a previous commit, so
`dvc exp show` won't display them by default (but they're still saved).
