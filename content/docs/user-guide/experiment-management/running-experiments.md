# Running Experiments

We explain how to execute DVC experiments, setting their parameters, queueing
them for future execution, running them in parallel, among other details.

<admon icon="book">

This page is not applicable if you are [saving experiments] without a pipeline.

If this is the first time you are introduced to DVC experimentation, you may
want to check the basics in [Get Started: Experiments] first.

[saving experiments]: /user-guide/experiment-management#save-experiments
[get started: experiments]: /start/experiments

</admon>

## Running experiment commands and pipelines

DVC relies on `dvc.yaml` files that contain the commands to run the
experiment(s). These files codify _pipelines_ that specify one or more
<abbr>stages</abbr> of the experiment workflow (code, <abbr>dependencies</abbr>,
<abbr>outputs</abbr>, etc.).

<admon icon="book">

See [Get Started: Experimenting Using Pipelines] for an intro to this topic.

[get started: experimenting using pipelines]:
  /start/experiments/experiment-pipelines

</admon>

### Running the pipeline(s)

You can run the experiment <abbr>pipelines</abbr> using `dvc exp run`. It uses
`./dvc.yaml` (in the current directory) by default.

<toggle>

<tab title="DVC CLI">

```cli
$ dvc exp run
...
Reproduced experiment(s): matte-vies
```

</tab>

<tab title="VSCode Extension">

Look for the `Run experiment` icon in any of the available menus and click to
run:

![VSCode Run experiment](/img/vscode-run-exp.png)

</tab>

</toggle>

DVC observes the [dependency graph] between stages, so it only runs the ones
with changed dependencies or outputs missing from the <abbr>cache</abbr>. You
can limit this to certain [reproduction targets] or even single stages
(`--single-item` flag).

<abbr>DVC projects</abbr> actually support more than one pipeline, in one or
more `dvc.yaml` files. The `--all-pipelines` option lets you run them all at
once.

<admon icon="book">

`dvc exp run` is an experiment-specific alternative to `dvc repro`. See [Running
Pipelines] for differences between them.

</admon>

[reproduction targets]: /command-reference/repro#options
[dependency graph]: /user-guide/pipelines/defining-pipelines
[running pipelines]: /user-guide/pipelines/running-pipelines

## Experiment results

The results of the last `dvc exp run` can be seen in the <abbr>workspace</abbr>.
They are stored and tracked internally by DVC.

To display and compare multiple experiments along with their
<abbr>parameters</abbr> and <abbr>metrics</abbr>, use `dvc exp show`.
`dvc plots diff` also accepts experiments as `revisions`. See [Reviewing and
Comparing Experiments][reviewing] for more details.

Use `dvc exp apply` to restore the results of any other experiment instead. See
[Bring experiment results to your workspace][apply] for more info.

<admon type="warn">

Only files tracked by either Git or DVC are saved to the experiment. Untracked
files cannot be restored.

</admon>

[reviewing]: /user-guide/experiment-management/comparing-experiments
[apply]:
  /user-guide/experiment-management/comparing-experiments#bring-experiment-results-to-your-workspace

## Tuning (hyper)parameters

Parameters are any values used inside your code to tune modeling attributes, or
that affect experiment results in any other way. For example, a [random forest
classifier] may require a _maximum depth_ value. Machine learning
experimentation often involves defining and searching hyperparameter spaces to
improve the resulting model metrics.

Your source code should read params from structured [parameters files]
(`params.yaml` by default). Define them with the `params` field of `dvc.yaml`
for DVC to track them. When a param value has changed, `dvc exp run` invalidates
any stages that depend on it, and reproduces them.

<admon icon="book">

See `dvc params` for more details.

</admon>

You could manually edit a params file and run an experiment using those as
inputs. Since this is a common sequence, the built-in option
`dvc exp run --set-param` (`-S`) is provided as a shortcut. It takes an existing
param name and value, and updates the file on-the-fly before execution.

<toggle>

<tab title="DVC CLI">

```cli
$ cat params.yaml
...
train:
  valid_pct: 0.1
  arch: shufflenet_v2_x2_0
  img_size: 256
  batch_size: 8
  fine_tune_args:
    epochs: 8
    base_lr: 0.01
...

$ dvc exp run --set-param train.fine_tune_args.base_lr=0.001
...

$ dvc exp run -S train.img_size=1024 -S train.batch_size=512  # set multiple params
...
```

</tab>

<tab title="VSCode Extension">

![VSCode Modify and run experiment](/img/vscode-modify-and-run.gif)

</tab>

</toggle>

[random forest classifier]:
  https://medium.com/all-things-ai/in-depth-parameter-tuning-for-random-forest-d67bb7e920d
[parameters files]: /user-guide/project-structure/dvcyaml-files#parameters-files

<admon icon="book">

See [Hydra composition](/user-guide/experiment-management/hydra-composition) for
more advanced configuration options via parameter overrides (change, append, or
remove, or use "choice" sets and ranges).

</admon>

## The experiments queue

The `--queue` option of `dvc exp run` tells DVC to append an experiment for
later execution. Nothing is actually run yet. Let's queue a couple experiments:

<toggle>

<tab title="DVC CLI">

```cli
$ dvc exp run --queue -S train.fine_tune_args.base_lr=0.001
Queueing with overrides '{'params.yaml': ['train.fine_tune_args.base_lr=0.001']}'.
Queued experiment 'blowy-pail' for future execution.
$ dvc exp run --queue -S train.fine_tune_args.base_lr=0.002
Queueing with overrides '{'params.yaml': ['train.fine_tune_args.base_lr=0.002']}'.
Queued experiment 'nubby-gram' for future execution.
```

</tab>

<tab title="VSCode Extension">

![VSCode Queue experiments](/img/vscode-queue.gif)

</tab>

</toggle>

Alternatively, we can setup a hyperparameter [grid search]:

<toggle>

<tab title="DVC CLI">

```cli
$ dvc exp run --queue \
    -S train.arch='resnet18,shufflenet_v2_x2_0' \
    -S 'train.fine_tune_args.base_lr=range(0.001, 0.01, 0.001)'
Queueing with overrides '{'params.yaml': ['train.arch=resnet18', 'train.fine_tune_args.base_lr=0.001']}'.
Queued experiment 'bijou-chis' for future execution.
Queueing with overrides '{'params.yaml': ['train.arch=resnet18', 'train.fine_tune_args.base_lr=0.002']}'.
Queued experiment 'color-meal' for future execution.
Queueing with overrides '{'params.yaml': ['train.arch=resnet18', 'train.fine_tune_args.base_lr=0.003']}'.
Queued experiment 'fusil-chin' for future execution.
...
Queueing with overrides '{'params.yaml': ['train.arch=shufflenet_v2_x2_0', 'train.fine_tune_args.base_lr=0.001']}'.
Queued experiment 'lumpy-jato' for future execution.
Queueing with overrides '{'params.yaml': ['train.arch=shufflenet_v2_x2_0', 'train.fine_tune_args.base_lr=0.002']}'.
Queued experiment 'gypsy-wino' for future execution.
Queueing with overrides '{'params.yaml': ['train.arch=shufflenet_v2_x2_0', 'train.fine_tune_args.base_lr=0.003']}'.
...
```

</tab>

<tab title="VSCode Extension">

![VSCode grid search](/img/vscode-grid-search.gif)

</tab>

</toggle>

[grid search]:
  https://en.wikipedia.org/wiki/Hyperparameter_optimization#Grid_search

<details icon="gear">

### How are experiments queued?

Queued experiments are managed using [dvc-task] and [Celery].

[dvc-task]: https://github.com/treeverse/dvc-task
[celery]: https://docs.celeryq.dev/en/stable/index.html

</details>

Run them all with `dvc queue start`:

```cli
$ dvc queue start
...
```

<admon type="info">

In most cases, experiment tasks will be executed in the order that they were
added to the queue (First In, First Out), but this is not guaranteed.

</admon>

Their execution happens outside your <abbr>workspace</abbr> in temporary
directories for isolation, so each experiment is derived from the workspace at
the time it was queued.

Queued experiments are processed serially by default, but can be run in parallel
by using more than one `--jobs` (to `dvc queue start` more than one worker).

<admon type="warn">

Make sure you're using number of jobs that your environment can handle (no more
than the CPU cores).

Note that since queued experiments are run isolated from each other, common
stages may be executed multiple times depending on the state of the
<abbr>run-cache</abbr> at that time.

</admon>

<details icon="gear">

### How are experiments isolated?

DVC creates a copy of the experiment's original workspace in `.dvc/tmp/exps/`
and runs it there. All workspaces share the single project <abbr>cache</abbr>,
however.

💡 To isolate any experiment (without queuing it), you can use the `--temp`
flag. This allows you to continue working while a long experiment runs, e.g.:

```cli
$ nohup dvc exp run --temp &
[1] 30473
nohup: ignoring input and appending output to 'nohup.out'
```

Note that Git-ignored files/dirs are excluded from queued/temp runs to avoid
committing unwanted files into Git (e.g. once successful experiments are
[persisted]). To include untracked files, stage them with `git add` first
(before `dvc exp run`) and `git reset` them afterwards.

[persisted]:
  /user-guide/experiment-management/sharing-experiments#persist-experiment

</details>

<admon type="tip">

To clear the experiments queue and start over, use `dvc queue remove --queued`.

</admon>

<admon icon="book">

For more advanced grid searches, DVC supports complex config via [Hydra
composition].

[hydra composition]: /user-guide/experiment-management/hydra-composition

</admon>
