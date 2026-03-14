# Running pipelines

To run a pipeline, you can use either `dvc repro` or `dvc exp run`. Either will
run the pipeline, and `dvc exp run` will save the results as an
[experiment](/user-guide/experiment-management) (and has other
[experiment-related features](/user-guide/experiment-management/running-experiments)
like modifying parameters from the command line):

```cli
$ dvc exp run --set-param featurize.ngrams=3

Reproducing experiment 'funny-dado'
'data/data.xml.dvc' didn't change, skipping
Stage 'prepare' didn't change, skipping
Running stage 'featurize':
> python src/featurization.py data/prepared data/features
Updating lock file 'dvc.lock'

Running stage 'train':
> python src/train.py data/features model.pkl
Updating lock file 'dvc.lock'

Running stage 'evaluate':
> python src/evaluate.py model.pkl data/features
Updating lock file 'dvc.lock'

Ran experiment(s): funny-dado
Experiment results have been applied to your workspace.
```

<admon type="info">

Stage outputs are deleted from the <abbr>workspace</abbr> before executing the
stage commands that produce them (unless `persist: true` is used in `dvc.yaml`).

</admon>

## DAG

DVC runs the [DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph) stages
sequentially, in the order defined by the
[dependencies](/user-guide/pipelines/defining-pipelines#simple-dependencies) and
[outputs](/user-guide/pipelines/defining-pipelines#outputs). Consider this
example `dvc.yaml`:

```yaml
stages:
  prepare:
    cmd: python src/prepare.py data/data.xml
    deps:
      - data/data.xml
      - src/prepare.py
    params:
      - prepare.seed
      - prepare.split
    outs:
      - data/prepared
  featurize:
    cmd: python src/featurization.py data/prepared data/features
    deps:
      - data/prepared
      - src/featurization.py
    params:
      - featurize.max_features
      - featurize.ngrams
    outs:
      - data/features
```

The `prepare` stage will always precede the `featurize` stage because
`data/prepared` is an **output** of `prepare` and a **dependency** of
`featurize`.

## Caching Stages

DVC will try to avoid recomputing stages that have been run before. If you run a
stage without changing its commands,
[dependencies](/user-guide/pipelines/defining-pipelines#simple-dependencies), or
[parameters](/user-guide/pipelines/defining-pipelines#parameter-dependencies),
DVC will skip that stage:

```cli
Stage 'prepare' didn't change, skipping
```

DVC will also recover the outputs from previous runs using the [run cache].

```
Stage 'prepare' is cached - skipping run, checking out outputs
```

If you want a stage to run every time, you can use
[always changed](/user-guide/project-structure/dvcyaml-files#stage-entries) in
`dvc.yaml`:

```yaml
stages:
  pull_latest:
    cmd: python pull_latest.py
    deps:
      - pull_latest.py
    outs:
      - latest_results.csv
    always_changed: true
```

## Pull Missing Data

By default, DVC expects that all data to run the pipeline is available locally.
Any missing data will be considered deleted and may cause the pipeline to fail.
To avoid this, use the following flags:

- `--pull` will download missing data as needed, so you don't need to pull all
  data beforehand.
- `--allow-missing` will skip stages with no other changes than missing data, so
  you don't need to download unnecessary data.

You can combine the `--pull` and `--allow-missing` flags to run a pipeline while
only pulling the data that is actually needed to run the changed stages.

<admon type="warn">

In DVC>=3.0, `--allow-missing` will not skip data saved with DVC<3.0 because the
hash type changed in DVC 3.0, which DVC considers a change to the data. To
migrate data to the new hash type, run `dvc cache migrate --dvc-files`. See more
information about [upgrading from DVC 2.x to 3.0](/user-guide/upgrade).

</admon>

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
$ dvc exp run --pull --allow-missing --set-param evaluate.n_samples_to_save=20
Reproducing experiment 'hefty-tils'
'data/pool_data.dvc' didn't change, skipping
Stage 'data_split' didn't change, skipping
Stage 'train' didn't change, skipping
Running stage 'evaluate':
...
```

After the pipeline completes, the `evaluate` stage is updated but all other
stages still have missing data:

```cli
$ dvc status
data_split:
        changed deps:
                deleted:            data/pool_data
        changed outs:
                not in cache:       data/train_data
train:
        changed deps:
                deleted:            data/train_data
        changed outs:
                not in cache:       models/model.pth
                not in cache:       results/train
sagemaker:
        changed deps:
                deleted:            models/model.pth
        changed outs:
                not in cache:       model.tar.gz
data/pool_data.dvc:
        changed outs:
                not in cache:       data/pool_data
```

We can run again with `--pull` but not `--allow-missing` to download data for
unchanged stages in the pipeline:

```cli
$ dvc exp run --pull
```

After the pipeline completes, all stages are up to date:

```cli
$ dvc status
Data and pipelines are up to date.
```

## Verify Pipeline Status

In scenarios like CI jobs, you may want to check that the pipeline is up to date
without pulling or running anything. `dvc repro --dry` will check which pipeline
stages to run without actually running them. However, if data is missing,
`--dry` will fail because DVC does not know whether that data simply needs to be
pulled or is missing for some other reason. To check which stages to run and
ignore any missing data, use `dvc repro --dry --allow-missing`.

This command will succeed if nothing has changed:

<details icon="bulb">

### Clean example

In the example below, data is missing because nothing has been pulled, but
otherwise the pipeline is up to date.

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
evaluate:
        changed deps:
                deleted:            data/test_data
                deleted:            models/model.pkl
data/pool_data.dvc:
        changed outs:
                not in cache:       data/pool_data
```

</details>

```cli
$ dvc repro --allow-missing --dry
'data/pool_data.dvc' didn't change, skipping
Stage 'data_split' didn't change, skipping
Stage 'train' didn't change, skipping
Stage 'evaluate' didn't change, skipping
```

If anything is not up to date, the command will fail:

<details>

### Dirty example

In the example below, the `data_split` parameter in `params.yaml` was modified,
so the pipeline is not up to date.

```cli
$ dvc status
data_split:
        changed deps:
                deleted:            data/pool_data
                params.yaml:
                        modified:           data_split
        changed outs:
                not in cache:       data/test_data
                not in cache:       data/train_data
train:
        changed deps:
                deleted:            data/train_data
        changed outs:
                not in cache:       models/model.pkl
evaluate:
        changed deps:
                deleted:            data/test_data
                deleted:            models/model.pkl
data/pool_data.dvc:
        changed outs:
                not in cache:       data/pool_data
```

</details>

```cli
$ dvc repro --allow-missing --dry
'data/pool_data.dvc' didn't change, skipping
ERROR: failed to reproduce 'data_split': [Errno 2] No such file or directory: '.../example-get-started-experiments/data/pool_data'
```

To ensure any missing data exists, you can also check that all data exists on
the remote. The command below will succeed (set the exit code to `0`) if all
data is found in the remote. Otherwise, it will fail (set the exit code to `1`).

```cli
$ dvc data status --not-in-remote --json | grep -v not_in_remote
true
```

## Debugging Stages

If you are using advanced features to interpolate values for your pipeline, like
[templating] or [Hydra composition], you can get the interpolated values by
running `dvc repro -vv` or `dvc exp run -vv`, which will include information
like:

```cli
2023-05-18 07:38:43,955 TRACE: Hydra composition enabled.
Contents dumped to params.yaml: {'model': {'batch_size':
512, 'latent_dim': 8, 'lr': 0.01, 'duration': '00:00:30:00',
'max_epochs': 2}, 'data_path': 'fra.txt', 'num_samples':
100000, 'seed': 423}
2023-05-18 07:38:44,027 TRACE: Context during resolution of
stage download: {'model': {'batch_size': 512, 'latent_dim':
8, 'lr': 0.01, 'duration': '00:00:30:00', 'max_epochs': 2},
'data_path': 'fra.txt', 'num_samples': 100000, 'seed': 423}
2023-05-18 07:38:44,073 TRACE: Context during resolution of
stage train: {'model': {'batch_size': 512, 'latent_dim': 8,
'lr': 0.01, 'duration': '00:00:30:00', 'max_epochs': 2},
'data_path': 'fra.txt', 'num_samples': 100000, 'seed': 423}
```

[templating]: /user-guide/project-structure/pipelines-files#templating
[hydra composition]: /user-guide/experiment-management/hydra-composition
[run cache]: /user-guide/pipelines/run-cache
