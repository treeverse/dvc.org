---
title: 'Get Started: Experimenting Using Pipelines'
description:
  'Split your workflow into stages and build a pipeline by connecting
  dependencies and outputs.'
---

# Get Started: Experimenting Using Pipelines

If you've been following the guide in order, you might have gone through the
chapter about [data pipelines](/start/data-pipelines/data-pipelines) already.
Here, we will use the same functionality as a basis for an experimentation build
system.

Running an <Abbr>experiment</abbr> is achieved by executing <abbr>DVC
pipelines</abbr>, and the term refers to the set of trackable changes associated
with this execution. This includes code changes and resulting artifacts like
plots, charts and models. The various `dvc exp` subcommands allow you to
execute, share and manage experiments in various ways. Below, we'll build an
experiment pipeline, and use `dvc exp run` to execute it with a few very handy
capabilities like experiment queueing and parametrization.

## Stepping up and out of the notebook

After some time spent in your IPython notebook (e.g.
[Jupyter](https://jupyter-notebook.readthedocs.io/en/latest/)) doing data
exploration and basic modeling, managing your notebook cells may start to feel
fragile, and you may want to structure your project and code for reproducible
execution, testing and further automation. When you are ready to
[migrate from notebooks to scripts](https://towardsdatascience.com/from-jupyter-notebook-to-sc-582978d3c0c/),
DVC <abbr>Pipelines</abbr> help you standardize your workflow following software
engineering best practices:

- **Modularization**: Split the different logical steps in your notebook into
  separate scripts.

- **Parametrization**: Adapt your scripts to decouple the configuration from the
  source code.

## Creating the experiment pipeline

In our
[example repo](https://github.com/treeverse/example-get-started-experiments), we
first extract data preparation logic from the
[original notebook](https://github.com/treeverse/example-get-started-experiments/blob/main/notebooks/TrainSegModel.ipynb)
into
[`data_split.py`](https://github.com/treeverse/example-get-started-experiments/blob/main/src/data_split.py).
We parametrize this script by reading parameters from
[`params.yaml`](https://github.com/treeverse/example-get-started-experiments/blob/main/params.yaml):

```python
from ruamel.yaml import YAML

yaml = YAML(typ="safe")

def data_split():
    params = yaml.load(open("params.yaml", encoding="utf-8"))
...
```

We now use `dvc stage add` commands to transform our scripts into individual
<abbr>stages</abbr> starting with a `data_split` stage for
[`data_split.py`](https://github.com/treeverse/example-get-started-experiments/blob/main/src/data_split.py):

```cli
$ dvc stage add --name data_split \
  --params base,data_split \
  --deps data/pool_data --deps src/data_split.py \
  --outs data/train_data --outs data/test_data \
  python src/data_split.py
```

A `dvc.yaml` file is automatically generated with the stage details.

<details icon="book">

### Expand to see the created `dvc.yaml`

It includes information about the stage we added, like the executable command
(`python src/data_split.py`), its <abbr>dependencies</abbr>,
<abbr>parameters</abbr>, and <abbr>outputs</abbr>:

```yaml
stages:
  data_split:
    cmd: python src/data_split.py
    deps:
      - src/data_split.py
      - data/pool_data
    params:
      - base
      - data_split
    outs:
      - data/train_data
      - data/test_data
```

</details>

Now, we create the `train` and `evaluate` stages using
[`train.py`](https://github.com/treeverse/example-get-started-experiments/blob/main/src/train.py)
and
[`evaluate.py`](https://github.com/treeverse/example-get-started-experiments/blob/main/src/evaluate.py)
to train the model and evaluate its performance respectively:

```cli
$ dvc stage add -n train \
  -p base,train \
  -d src/train.py -d data/train_data \
  -o models/model.pkl \
  python src/train.py

$ dvc stage add -n evaluate \
  -p base,evaluate \
  -d src/evaluate.py -d models/model.pkl -d data/test_data \
  -o results python src/evaluate.py
```

The `dvc.yaml` file is updated automatically and should include all the stages
now.

<details icon="book">

### Expand to see the full `dvc.yaml`

```yaml
stages:
  data_split:
    cmd: python src/data_split.py
    deps:
      - data/pool_data
      - src/data_split.py
    params:
      - base
      - data_split
    outs:
      - data/test_data
      - data/train_data
  train:
    cmd: python src/train.py
    deps:
      - data/train_data
      - src/train.py
    params:
      - base
      - train
    outs:
      - models/model.pkl
  evaluate:
    cmd: python src/evaluate.py
    deps:
      - data/test_data
      - models/model.pkl
      - src/evaluate.py
    params:
      - base
      - evaluate
    outs:
      - results
```

</details>

<details>

## Visualizing the experiment DAG

As the number of stages grows, the `dvc dag` command becomes handy for
visualizing the pipeline without manually inspecting the `dvc.yaml` file:

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
         **        **
       **            **
      *                **
+-------+                *
| train |              **
+-------+            **
         **        **
           **    **
             *  *
         +----------+
         | evaluate |
         +----------+
```

Now that you have a <abbr>DVC Pipeline</abbr> set up, you can easily iterate on
it by running `dvc exp run` to create and track new experiment runs. This
enables some new features in DVC like Queueing experiments, and a canonical way
to work with parameters and hyper-parameters.

</details>

## Modifying parameters

You can modify <abbr>parameters</abbr> from the CLI using
[`--set-param`](/command-reference/exp/run#--set-param):

```cli
$ dvc exp run --set-param "train.img_size=128"
```

The flag can be used to modify multiple parameters on a single call, even from
different stages:

```cli
$ dvc exp run \
-S "data_split.test_pct=0.1" -S "train.img_size=384"
```

## Hyperparameter Tuning

You can provide multiple values for the same parameter:

```cli
$ dvc exp run \
--queue --set-param "train.batch_size=8,16,24"
Queueing with overrides '{'params.yaml': ['train.batch_size=8']}'.
Queueing with overrides '{'params.yaml': ['train.batch_size=16']}'.
Queueing with overrides '{'params.yaml': ['train.batch_size=24']}'.
...
```

You can build a grid search by modifying multiple parameters. To better identify
the experiments from the grid search, you can also provide a
[`--name`](/command-reference/exp/run#--name):

```cli
$ dvc exp run --name "arch-size" --queue \
-S 'train.arch=alexnet,resnet34,squeezenet1_1' \
-S 'train.img_size=128,256'
Queueing with overrides '{'params.yaml': ['train.arch=alexnet', 'train.img_size=128']}'.
Queued experiment 'arch-size-1' for future execution.
Queueing with overrides '{'params.yaml': ['train.arch=alexnet', 'train.img_size=256']}'.
Queued experiment 'arch-size-2' for future execution.
Queueing with overrides '{'params.yaml': ['train.arch=resnet34', 'train.img_size=128']}'.
Queued experiment 'arch-size-3' for future execution.
...
```

<admon type="info">

Learn more about
[Running Experiments](/user-guide/experiment-management/running-experiments)

</admon>

## Queuing experiments

You can enqueue experiments for later execution using
[`--queue`](/command-reference/exp/run#--queue):

```cli
$ dvc exp run --queue --set-param "train.img_size=512"
Queueing with overrides '{'params.yaml': ['train.img_size=512']}'.
```

Once you have put some experiments in the queue, you can run all with:

```cli
$ dvc exp run --run-all
```

<admon type="info">

Learn more about
[The experiments queue](/user-guide/experiment-management/running-experiments#the-experiments-queue)

</admon>
