# exp run

Run or resume a [DVC experiment] based on a [DVC pipeline].

[dvc experiment]: /user-guide/experiment-management
[dvc pipeline]: /user-guide/pipelines

<admon type="info">

When called with no arguments, this is equivalent to `dvc repro` followed by
`dvc exp save`.

</admon>

## Synopsis

```usage
usage: dvc exp run [-h] [-q | -v] [-f] [-i]
                   [-s] [-p] [-P] [-R]
                   [-n <name>] [-S [<filename>:]<override_pattern>]
                   [--queue] [--run-all] [-j <number>] [--temp]
                   [-r <experiment_rev>] [-C <path>]
                   [-m <message>]
                   [--downstream] [--force-downstream]
                   [--pull] [--dry] [--allow-missing]
                   [-k] [--ignore-errors]
                   [targets [targets ...]]

positional arguments:
  targets               Stages to reproduce. 'dvc.yaml' by default
```

## Description

Executes and tracks <abbr>experiments</abbr> in your <abbr>repository</abbr>
without polluting it with unnecessary Git commits, branches, directories, etc.

<admon type="info">

Only files tracked by either Git or DVC are saved to the experiment. See
`dvc exp save --include-untracked` for an alternative.

</admon>

`dvc exp run` has the same general behavior as `dvc repro` when it comes to
`targets` and stage execution (restores the dependency graph, etc.).

<admon type="info">

This includes committing any changed data <abbr>dependencies</abbr> to the
<abbr>DVC cache</abbr> when preparing the experiment, which can take some time.

</admon>

Use the `--set-param` (`-S`) option as a shortcut to change
<abbr>parameter</abbr> values [on-the-fly] before running the experiment.

It's possible to [queue experiments] for later execution with the `--queue`
flag. Queued experiments can be run with `dvc queue start` and managed with
other `dvc queue` commands.

<admon icon="book">

See the [Running Experiments] guide for more details on these features and more.

</admon>

[Review] your experiments with `dvc exp show`. Successful ones can be [made
persistent] by restoring them via `dvc exp branch` or `dvc exp apply` and
committing them to the Git repo. Unnecessary ones can be [cleared] with
`dvc exp remove`.

[on-the-fly]: #example-modify-parameters-on-the-fly
[queue experiments]:
  /user-guide/experiment-management/running-experiments#the-experiments-queue
[running experiments]: /user-guide/experiment-management/running-experiments
[review]: /user-guide/experiment-management/comparing-experiments
[made persistent]:
  /user-guide/experiment-management/sharing-experiments#persist-experiment
[cleared]:
  /user-guide/experiment-management/comparing-experiments#clean-up-experiments

## Options

- `-S [<filename>:]<override_pattern>`,
  `--set-param [<filename>:]<override_pattern>` - set the value of `dvc params`
  for this experiment. This will update the parameters file (`params.yaml` by
  default) before running the experiment. Use the optional `[<filename>:]`
  prefix to use a custom params file.

  Valid `<override_pattern>` values can be defined in Hydra's [basic override]
  syntax (see [example](#example-modify-parameters-on-the-fly)). Hydra's
  [choice] and [range] sweep overrides are also supported, but these require the
  `--queue` flag to be provided as well (see
  [example](#example-run-a-grid-search)).

- `-n <name>`, `--name <name>` - specify a [unique name] for this experiment. A
  default one will be generated otherwise, such as `puffy-daks`.

  <admon type="tip">

  The name of the experiment is exposed in env var `DVC_EXP_NAME`.

  </admon>

- `--temp` - run this experiment outside your workspace (in `.dvc/tmp/exps`).
  Useful to continue working (e.g. in another terminal) while a long experiment
  runs.

- `--queue` - place this experiment at the end of a line for future execution,
  but don't run it yet. Use `dvc queue start` to process the queue.

- `--run-all` - run all queued experiments (see `--queue`) and outside your
  workspace (in `.dvc/tmp/exps`). Use `-j` to execute them
  [in parallel](#queueing-and-parallel-execution).

  <admon type="warn">

  `dvc exp run --run-all [--jobs]` is now a shortcut for
  `dvc queue start [--jobs]` followed by `dvc queue logs -f`. The `--run-all`
  and `--jobs` options will be deprecated in a future DVC release.

  </admon>

- `-j <number>`, `--jobs <number>` - run this `number` of queued experiments in
  parallel. Only has an effect along with `--run-all`. Defaults to 1 (the queue
  is processed serially).

- `-f`, `--force` - reproduce pipelines even if no changes were found (same as
  `dvc repro -f`).

- `-C <path>`, `--copy-paths <path>` - list of ignored or untracked paths to
  copy into the temp directory. Only used if `--temp` or `--queue` is specified.

- `-m <message>`, `--message <message>` - custom message to use when saving the
  experiment. If not provided, `dvc: commit experiment {hash}` will be used.

- `-i`, `--interactive` - ask for confirmation before reproducing each stage.
  The stage is only executed if the user types "y".

- `-s`, `--single-item` - reproduce only a single stage by turning off the
  recursive search for changed dependencies. Multiple stages are executed
  (non-recursively) if multiple stage names are given as `targets`.

- `-p`, `--pipeline` - reproduce the entire pipelines that the `targets` belong
  to. Use `dvc dag <target>` to show the parent pipeline of a target.

- `-P`, `--all-pipelines` - reproduce all pipelines for all `dvc.yaml` files
  present in the DVC project. Specifying `targets` has no effects with this
  option, as all possible targets are already included.

- `-R`, `--recursive` - looks for `dvc.yaml` files to reproduce in any
  directories given as `targets`, and in their subdirectories. If there are no
  directories among the targets, this option has no effect.

- `--downstream` - only execute the stages after the given `targets` in their
  corresponding pipelines, including the target stages themselves. This option
  has no effect if `targets` are not provided.

- `--force-downstream` - in cases like `... -> A (changed) -> B -> C` it will
  reproduce `A` first and then `B`, even if `B` was previously executed with the
  same inputs from `A` (cached). To be precise, it reproduces all descendants of
  a changed stage or the stages following the changed stage, even if their
  direct dependencies did not change.

  It can be useful when we have a common dependency among all stages, and want
  to specify it only once (for stage `A` here). For example, if we know that all
  stages (`A` and below) depend on `requirements.txt`, we can specify it in `A`,
  and omit it in `B` and `C`.

  This is a way to force-execute stages without changes. This can also be useful
  for pipelines containing stages that produce non-deterministic (semi-random)
  outputs, where outputs can vary on each execution, meaning the cache cannot be
  trusted for such stages.

- `--pull` - attempts to download missing data as needed. This includes (1)
  dependencies of stages to be run, (2) outputs of otherwise unchanged stages to
  be skipped, (3) [run cache] for stages to be checked out from cache (unless
  `--no-run-cache` is passed).

- `--allow-missing` - skip stages with no other changes than missing data.

  <admon type="warn">

  In DVC>=3.0, `--allow-missing` will not skip data saved with DVC<3.0 because
  the hash type changed in DVC 3.0, which DVC considers a change to the data. To
  migrate data to the new hash type, run `dvc cache migrate --dvc-files`. See
  more information about [upgrading from DVC 2.x to 3.0](/user-guide/upgrade).

  </admon>

- `-k`, `--keep-going` - Continue executing, skipping stages having dependencies
  on the failed stage. The other dependencies of the targets will still be
  executed.

- `--ignore-errors` - Ignore all errors when executing the stages. Unlike
  `--keep-going`, stages having dependencies on the failed stage will be
  executed.

- `-h`, `--help` - prints the usage/help message, and exits.

- `-q`, `--quiet` - do not write anything to standard output. Exit with 0 if all
  stages are up to date or if all stages are successfully executed, otherwise
  exit with 1. The command defined in the stage is free to write output
  regardless of this flag.

- `-v`, `--verbose` - displays detailed tracing information.

[basic override]: https://hydra.cc/docs/advanced/override_grammar/basic/
[choice]: https://hydra.cc/docs/advanced/override_grammar/extended/#choice-sweep
[range]: https://hydra.cc/docs/advanced/override_grammar/extended/#range-sweep
[unique name]: /user-guide/experiment-management#how-does-dvc-track-experiments

## Examples

<admon type="info">

This example is based on [our Get Started], where you can find the actual source
code.

[our get started]: /start/experiments

</admon>

<details>

### Expand to prepare the example ML project

Clone the DVC repo and download the data it <abbr>depends</abbr> on:

```cli
$ git clone git@github.com:iterative/example-get-started.git
$ cd example-get-started
$ dvc pull
```

Let's also install the Python requirements:

> We **strongly** recommend creating a
> [virtual environment](https://docs.python.org/3/library/venv.html) first.

```cli
$ pip install -r src/requirements.txt
```

</details>

Let's check the latest metrics of the project:

```cli
$ dvc metrics show
Path         avg_prec    roc_auc
scores.json  0.60405     0.9608
```

For this experiment, we want to see the results for a smaller dataset input, so
let's limit the data to 20 MB and reproduce the pipeline with `dvc exp run`:

```cli
$ truncate --size=20M data/data.xml
$ dvc exp run
...
Reproduced experiment(s): puffy-daks
Experiment results have been applied to your workspace.

$ dvc metrics diff
Path         Metric    HEAD     workspace  Change
scores.json  avg_prec  0.60405  0.56103    -0.04302
scores.json  roc_auc   0.9608   0.94003    -0.02077
```

The `dvc metrics diff` command shows the difference in performance for the
experiment we just ran (`puffy-daks`).

## Example: Modify parameters on-the-fly

`dvc exp run --set-param` (`-S`) saves you the need to manually edit a params
file (see `dvc params`) before running an experiment.

This option accepts Hydra's [basic override] syntax. For example, it can
override (`train.epochs=10`), append (`+train.weight_decay=0.01`), or remove
(`~model.dropout`) <abbr>parameters</abbr>:

```cli
dvc exp run -S 'prepare.split=0.1' -S 'featurize.max_features=100'
...
```

<admon type="tip">

Note that you can modify multiple parameters at once in the same command.

</admon>

By default, `-S` overwrites the values in `params.yaml`. To use another params
file, add a `<filename>:` prefix. For example, let's append a new parameter to
`train_config.json`:

```cli
$ dvc exp run -S 'train_config.json:+train.weight_decay=0.001'
...

$ dvc params diff --targets train_config.json
Path               Param                HEAD    workspace
train_config.json  train.weight_decay   -       0.001
```

<admon type="warn" title="Warnings">

`exp run --set-param` (`-S`) doesn't update your `dvc.yaml` to start or stop
tracking parameters. When appending or removing params, check if you need to
update the [`params` section] accordingly.

Similarly, when using custom param files, check that these are defined in
`dvc.yaml`.

[`params` section]: /user-guide/project-structure/dvcyaml-files#parameters

</admon>

## Example: Run a grid search

Combining `--set-param` and `--queue`, we can perform a [grid search] for tuning
hyperparameters.

DVC supports Hydra's syntax for [choice] and [range] sweeps to add multiple
experiments to the queue. These can be used for multiple parameters at the same
time, adding all combinations to the queue:

```cli

$ dvc exp run -S 'train.min_split=8,64' -S 'train.n_est=range(100,500,100)' --queue
Queueing with overrides '{'params.yaml': ['train.min_split=8', 'train.n_est=100']}'.
Queued experiment 'azure-ices' for future execution.
Queueing with overrides '{'params.yaml': ['train.min_split=8', 'train.n_est=200']}'.
Queued experiment 'zingy-peri' for future execution.
Queueing with overrides '{'params.yaml': ['train.min_split=8', 'train.n_est=300']}'.
Queued experiment 'jammy-feds' for future execution.
Queueing with overrides '{'params.yaml': ['train.min_split=8', 'train.n_est=400']}'.
Queued experiment 'lowse-shay' for future execution.
Queueing with overrides '{'params.yaml': ['train.min_split=64', 'train.n_est=100']}'.
Queued experiment 'brown-hugs' for future execution.
Queueing with overrides '{'params.yaml': ['train.min_split=64', 'train.n_est=200']}'.
Queued experiment 'local-scud' for future execution.
Queueing with overrides '{'params.yaml': ['train.min_split=64', 'train.n_est=300']}'.
Queued experiment 'alpha-neck' for future execution.
Queueing with overrides '{'params.yaml': ['train.min_split=64', 'train.n_est=400']}'.
Queued experiment 'algal-hood' for future execution.
$ dvc queue start
...
```

[grid search]:
  https://en.wikipedia.org/wiki/Hyperparameter_optimization#Grid_search

## Example: Only pull pipeline data as needed.

You can combine the `--pull` and `--allow-missing` flags to reproduce a pipeline
while only pulling the data that is actually needed to run the changed stages.

Given the pipeline used in
[example-get-started-experiments](https://github.com/treeverse/example-get-started-experiments):

```cli
$ dvc dag
      +--------------------+
      | data/pool_data.dvc |
      +--------------------+
                 *
                 *
                 *
          +------------+
          | data_split |
          +------------+
           **         **
         **             **
        *                 **
  +-------+                 *
  | train |*                *
  +-------+ ****            *
      *         ***         *
      *            ****     *
      *                **   *
+-----------+         +----------+
| sagemaker |         | evaluate |
+-----------+         +----------+
```

If we are in a machine where all the data is missing:

```cli
$ dvc status
data_split:
        changed deps:
                deleted:            data/pool_data
        changed outs:
                not in cache:       data/test_data
                not in cache:       data/train_data
train:
        changed deps:
                deleted:            data/train_data
        changed outs:
                not in cache:       models/model.pkl
                not in cache:       models/model.pth
                not in cache:       results/train
evaluate:
        changed deps:
                deleted:            data/test_data
                deleted:            models/model.pkl
        changed outs:
                not in cache:       results/evaluate
sagemaker:
        changed deps:
                deleted:            models/model.pth
        changed outs:
                not in cache:       model.tar.gz
data/pool_data.dvc:
        changed outs:
                not in cache:       data/pool_data
```

We can modify the `evaluate` stage and DVC will only pull the necessary data to
run that stage (`models/model.pkl` `data/test_data/`) while skipping the rest of
the stages:

```cli
$ dvc exp run --pull --allow-missing
Reproducing experiment 'hefty-tils'
'data/pool_data.dvc' didn't change, skipping
Stage 'data_split' didn't change, skipping
Stage 'train' didn't change, skipping
Running stage 'evaluate':
...
```

See [pull missing data] in the user guide for more details.

[pull missing data]: /user-guide/pipelines/running-pipelines#pull-missing-data

## Example: Include untracked or ignored paths

If your code relies on some paths that are intentionally untracked or ignored by
Git, you can use `-C/--copy-paths` to ensure those files are accessible when you
use the `--temp` or `--queue` flags:

```cli
$ dvc exp run --temp -C secrets.txt -C symlinked-directory
```

The paths will be copied to the temporary directory but will _not_ be tracked,
to prevent unintentional leaks.
