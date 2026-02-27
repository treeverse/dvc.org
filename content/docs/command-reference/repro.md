# repro

Reproduce complete or partial <abbr>pipelines</abbr> by running their
<abbr>stages</abbr> as needed in the correct order.

## Synopsis

```usage
usage: dvc repro [-h] [-q | -v] [-f] [-i]
                 [-s] [-p] [-P] [-R]
                 [--downstream] [--force-downstream]
                 [--pull] [--allow-missing] [--dry]
                 [--glob] [--no-commit] [--no-run-cache]
                 [-k] [--ignore-errors]
                 [targets [<target> ...]]

positional arguments:
  targets       Stages to reproduce. 'dvc.yaml' by default.
```

> See [`targets`](#options) for more details.

## Description

Provides a way to regenerate data pipeline results by restoring the [dependency
graph] defined among the stages listed in `dvc.yaml`. Stages are then checked to
decide which ones need to run (see `dvc status`). Finally, [their commands] are
executed.

This is similar to [`make`](https://www.gnu.org/software/make/manual/) in
software build automation, but DVC captures "build requirements" (stage
<abbr>dependencies</abbr>) and <abbr>caches</abbr> the pipeline's
<abbr>outputs</abbr> along the way.

<admon type="info" title="Notes">

Stage outputs are deleted from the <abbr>workspace</abbr> before executing the
stage commands that produce them (unless `persist: true` is used in `dvc.yaml`).

For stages with multiple commands (having a list in the `cmd` field), commands
are run one after the other in the order they are defined. The failure of any
command will halt the remaining stage execution and raise an error.

Stages without dependencies nor outputs are considered [always changed], so
`dvc repro` always runs them.

</admon>

This is usually done after one or more <abbr>stages</abbr> are defined (see
`dvc.yaml` and `dvc stage add`) or when code or other dependencies change or are
missing. Note that `dvc repro` does not attempt to `dvc checkout` or `dvc pull`
data unless the `--pull` option is used.

<admon type="tip">

For convenience, a Git hook is available to remind you to `dvc repro` when
needed after a `git commit`. See `dvc install` for more details.

</admon>

Keep in mind that one `dvc.yaml` file does not necessarily equal one
<abbr>pipeline</abbr> (although that is typical). So DVC reads all the
`dvc.yaml` files in the <abbr>workspace</abbr> to rebuild pipeline(s).

However, there are a few ways to restrict what gets regenerated: by specifying
reproduction [`targets`](#options), or by using certain command
[options](#options) such as `--single-item` or `--all-pipelines`.

All the data files, intermediate or final results are <abbr>cached</abbr>
(unless the `--no-commit` option is used), and the hash values of changed
dependencies and outputs are updated in `dvc.lock` and `.dvc` files, as needed.

[dependency graph]: /user-guide/pipelines/defining-pipelines
[their commands]: /user-guide/pipelines/defining-pipelines#stage-commands
[always changed]: /command-reference/status#local-workspace-status

### Parallel stage execution

If you need to parallelize stage execution, you can launch `dvc repro` multiple
times concurrently (e.g. in separate terminals). For example, let's say a
[pipelines](/command-reference/dag) graph looks something like this:

```cli
$ dvc dag
+--------+          +--------+
|   A1   |          |   B1   |
+--------+          +--------+
     *                   *
     *                   *
     *                   *
+--------+          +--------+
|   A2   |          |   B2   |
+--------+          +--------+
          *         *
           **     **
             *   *
        +------------+
        |    train   |
        +------------+
```

This pipeline consists of two parallel branches (`A` and `B`), and the final
`train` stage, where the branches merge. If you run `dvc repro` at this point,
it would reproduce each branch sequentially before `train`. To reproduce both
branches simultaneously, you could run `dvc repro A2` and `dvc repro B2` at the
same time. After both finish successfully, you can then run `dvc repro train`:
DVC will know that both branches are already up-to-date and only execute the
final stage.

## Options

- `targets` (optional command argument) - what to reproduce (all pipeline(s) in
  `./dvc.yaml` by default). Different things can be provided as targets
  depending on the flags used (more details in each option). Examples:
  - `dvc repro linear/dvc.yaml`: A `dvc.yaml` file
  - `dvc repro -R pipelines/`: Directory to explore recursively for pipelines
  - `dvc repro train-model`: Specific stage(s) from `./dvc.yaml`
  - `dvc repro modeling/dvc.yaml:prepare`: Stage(s) from a specific `dvc.yaml`
    file
  - `dvc repro train-model@1`: [Foreach] stage(s) from `./dvc.yaml`
  - `dvc repro --glob train-*`: Pattern to match groups of stages

- `-R`, `--recursive` - looks for `dvc.yaml` files to reproduce in any
  directories given as `targets`, and in their subdirectories. If there are no
  directories among the targets, this option has no effect.

- `--glob` - causes the `targets` to be interpreted as wildcard
  [patterns](https://docs.python.org/3/library/glob.html) to match for stage
  names. For example: `train-*` (certain stage names) or
  `models/dvc.yaml:train-*` (stages in specific `dvc.yaml` file). Note that it
  does not match patterns with the path, only to the stages present in the
  specified file.

- `-s`, `--single-item` - reproduce only a single stage by turning off the
  recursive search for changed dependencies. Multiple stages are executed
  (non-recursively) if multiple stage names are given as `targets`.

- `-f`, `--force` - reproduce pipelines, regenerating its results, even if no
  changes were found. This executes all of the stages by default, but it can be
  limited with the `targets` argument, or the `-s`, `-p` options.

- `--no-commit` - do not store the outputs of this execution in the cache
  (`dvc.yaml` and `dvc.lock` are still created or updated); useful to avoid
  caching unnecessary data when exploring different data or stages. Use
  `dvc commit` to finish the operation.

- `--dry` - only print the commands that would be executed without actually
  executing the commands.

- `-i`, `--interactive` - ask for confirmation before reproducing each stage.
  The stage is only executed if the user types "y".

- `-p`, `--pipeline` - reproduce the entire pipelines that the `targets` belong
  to. Use `dvc dag <target>` to show the parent pipeline of a target.

- `-P`, `--all-pipelines` - reproduce all pipelines for all `dvc.yaml` files
  present in the DVC project. Specifying `targets` has no effects with this
  option, as all possible targets are already included.

- `--no-run-cache` - execute stage command(s) even if they have already been run
  with the same dependencies and outputs (see the [run cache]). Useful for
  example if the stage command/s is/are non-deterministic ([not recommended]).

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

- `--downstream` - only execute the stages after the given `targets` in their
  corresponding pipelines, including the target stages themselves. This option
  has no effect if `targets` are not provided.

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

- `-h`, `--help` - prints the usage/help message, and exit.

- `-q`, `--quiet` - do not write anything to standard output. Exit with 0 if all
  stages are up to date or if all stages are successfully executed, otherwise
  exit with 1. The command defined in the stage is free to write output
  regardless of this flag.

- `-v`, `--verbose` - displays detailed tracing information.

[foreach]: /user-guide/project-structure/dvcyaml-files#foreach-stages
[run cache]: /user-guide/project-structure/internal-files#run-cache
[not recommended]:
  /user-guide/project-structure/dvcyaml-files#avoiding-unexpected-behavior

## Examples

> To get hands-on experience with data science and machine learning pipelines,
> see [Get Started: Data Pipelines](/start/data-pipelines/data-pipelines).

Let's build and reproduce a simple pipeline. It takes this `text.txt` file:

```
dvc
1231
is
3
the
best
```

And runs a few simple transformations to filter and count numbers:

```cli
$ dvc stage add -n filter -d text.txt -o numbers.txt \
           "cat text.txt | egrep '[0-9]+' > numbers.txt"

$ dvc stage add -n count -d numbers.txt -d process.py -M count.txt \
           "python process.py numbers.txt > count.txt"
```

Where `process.py` is a script that, for simplicity, just prints the number of
lines:

```python
import sys
num_lines = 0
with open(sys.argv[1], 'r') as f:
    for line in f:
        num_lines += 1
print(num_lines)
```

The result of executing `dvc repro` should look like this (`cat` shows the
contents of a file and `tree` shows the contents of the working directory):

```cli
$ dvc repro
Running stage 'filter':
> cat text.txt | egrep '[0-9]+' > numbers.txt
Generating lock file 'dvc.lock'
Updating lock file 'dvc.lock'

Running stage 'count':
> python process.py numbers.txt > count.txt
Updating lock file 'dvc.lock'
Use `dvc push` to send your updates to remote storage.

$ cat count.txt
2

$ tree
.
├── count.txt      <---- result: "2"
├── dvc.lock       <---- file to record pipeline state
├── dvc.yaml       <---- file containing list of stages.
├── numbers.txt    <---- intermediate result of the first stage
├── process.py     <---- code that implements data transformation
└── text.txt       <---- text file to process
```

You may want to check the contents of `dvc.lock` and `count.txt` for later
reference.

Now, let's imagine we want to print a description and we add this line to the
`process.py`:

```python
...
print('Number of lines:')
print(num_lines)
```

If we now run `dvc repro`, we should see this:

```cli
$ dvc repro
Stage 'filter' didn't change, skipping
Running stage 'count' with command:
        python process.py numbers.txt > count.txt
Updating lock file 'dvc.lock'
```

You can now check that `dvc.lock` and `count.txt` have been updated with the new
information: updated dependency/output file hash values, and a new result,
respectively.

## Example: Downstream from a target stage

> This example continues the previous one.

The `--downstream` option, when used with a `target` stage, allows us to only
reproduce results from commands after that specific stage in a pipeline. To
demonstrate how it works, let's make a change in `text.txt` (the input of our
first stage, created in the previous example):

```
...
The answer to universe is 42
- The Hitchhiker's Guide to the  Galaxy
```

Let's say we also want to print the file name in the description, and so we
update the `process.py` as:

```python
print(f'Number of lines in {sys.argv[1]}:')
print(num_lines)
```

Now, using the `--downstream` option with `dvc repro` results in the execution
of only the target (`count`) and following stages (none in this case):

```cli
$ dvc repro --downstream count
Running stage 'count' with command:
        python process.py numbers.txt > count.txt
Updating lock file 'dvc.lock'
```

The change in `text.txt` is ignored because that file is a dependency in the
`filter` stage, which wasn't executed by the `dvc repro` above. This is because
`filter` happens before the target (`count`) in the pipeline (see `dvc dag`), as
shown below:

```cli
$ dvc dag

  +--------+
  | filter |
  +--------+
      *
      *
      *
  +-------+
  | count |
  +-------+
```

> Note that using `dvc repro` without `--downstream` in the above example
> results in the execution of the target (`count`), and the preceding stages
> (only 'filter' in this case).

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
$ dvc repro --pull --allow-missing
'data/pool_data.dvc' didn't change, skipping
Stage 'data_split' didn't change, skipping
Stage 'train' didn't change, skipping
Running stage 'evaluate':
...
```

See [pull missing data] in the user guide for more details.

[pull missing data]: /user-guide/pipelines/running-pipelines#pull-missing-data
