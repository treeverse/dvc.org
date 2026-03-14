# Hydra Composition

[Hydra](https://hydra.cc/) is a framework to configure complex applications. DVC
supports Hydra's [config composition] as a way to configure [experiment runs].

<admon type="info">

You must explicitly enable this feature with:

```cli
$ dvc config hydra.enabled True
```

</admon>

[config composition]:
  https://hydra.cc/docs/tutorials/basic/your_first_app/composition/
[experiment runs]: /user-guide/experiment-management/running-experiments

## How it works

Upon `dvc exp run`, Hydra will be used to compose a single `params.yaml` before
executing the experiment. Its <abbr>parameters</abbr> will configure the
[underlying DVC pipeline](#running-experiments) that contains your experiment.

<admon type="tip">

[DVC pipelines] can run multiple stages with different shell commands instead of
a single script, and offer advanced features like [templating] and [`foreach`
stages].

[dvc pipelines]: /user-guide/pipelines/defining-pipelines
[templating]: /user-guide/project-structure/dvcyaml-files#templating
[`foreach` stages]: /user-guide/project-structure/dvcyaml-files#foreach-stages

</admon>

## Setting up Hydra

First you need a `conf/` directory for Hydra [config groups]. For example:

```cli
conf
├── config.yaml
├── dataset
│   ├── imagenette.yaml
│   └── imagewoof.yaml
└── train
    ├── baseline.yaml
    ├── model
    │   ├── alexnet.yaml
    │   ├── efficientnet.yaml
    │   └── resnet.yaml
    └── optimizer
        ├── adam.yaml
        └── sgd.yaml
```

You also need a `conf/config.yaml` file defining the Hydra [defaults list]:

```yaml
defaults:
  - dataset: imagenette
  - train/model: resnet
  - train/optimizer: sgd
```

[config groups]:
  https://hydra.cc/docs/tutorials/basic/your_first_app/config_groups/
[defaults list]: https://hydra.cc/docs/tutorials/basic/your_first_app/defaults/

<admon type="tip">

Use `dvc config hydra` options to change the default locations for the config
groups directory and defaults list file.

</admon>

Now let's look at what the resulting `params.yaml` could be based on the setup
above:

```yaml
dataset:
  url: https://s3.amazonaws.com/fast-ai-imageclas/imagenette2-160.tgz
  output_folder: imagenette
train:
  model:
    name: ResNet
    size: 50
    weights: ResNet50_Weights.IMAGENET1K_V2
  optimizer:
    name: SGD
    lr: 0.001
    momentum: 0.9
```

## Running experiments

<details icon="gear">

### Expand to set up a DVC pipeline.

Let's build an [experimental pipeline] with 2 stages. The first one downloads a
dataset and uses the parameters defined in the `dataset` section of
`params.yaml`. The second stage trains an ML model and uses the rest of the
parameters (entire `train` group).

```yaml
stages:
  setup-dataset:
    cmd:
      - wget ${dataset.url} -O tmp.tgz
      - mkdir -p ${dataset.output_folder}
      - tar zxvf tmp.tgz -C ${dataset.output_folder}
      - rm tmp.tgz
    outs:
      - ${dataset.output_folder}
  train:
    cmd: python train.py
    deps:
      - ${dataset.output_folder}
    params:
      - train
```

[experimental pipeline]:
  /user-guide/experiment-management/running-experiments#running-the-pipelines

<admon type="info">

We parametrize the shell commands above (`mkdir`, `tar`, `wget`) as well as
<abbr>output</abbr> and <abbr>dependency</abbr> paths (`outs`, `deps`) using
[templating] (`${}` _expression_).

[templating]: /user-guide/project-structure/dvcyaml-files#templating

</admon>

<admon type="tip">

You can load the params with any YAML parsing library. In Python, you can use
the built-in `dvc.api.params_show()` or `OmegaConf.load("params.yaml")` (which
comes with Hydra).

[dictionary unpacking]:
  /user-guide/project-structure/dvcyaml-files#dictionary-unpacking

</admon>

</details>

We can now use `dvc exp run --set-param` to modify the config composition
on-the-fly, for example loading the model config from
`train/model/efficientnet.yaml` (instead of `resnet.yaml` from the
[defaults list](#setting-up-hydra)):

```cli
$ dvc exp run --set-param 'train/model=efficientnet'
Stage 'setup-dataset' didn't change  skipping
Running stage 'train':
> python train.py
--model.name 'EfficientNet' --model.size 'b0' --model.weights 'ResNet50_Weights.IMAGENET1K_V2'
--optimizer.name 'SGD' --optimizer.lr 0.001 --optimizer.momentum 0.9
...
```

Add `-vv` (`dvc exp run -vv --set-param 'train/model=efficientnet'`) if you need
to [debug] the composed values.

We can also modify specific values from any config section:

```cli
$ dvc exp run --set-param 'train.optimizer.lr=0.1'
Stage 'setup-dataset' didn't change, skipping
Running stage 'train':
> python train.py
--model.name 'EfficientNet' --model.size 'b0' --model.weights 'ResNet50_Weights.IMAGENET1K_V2'
--optimizer.name 'SGD' --optimizer.lr 0.01 --optimizer.momentum 0.9
...
```

We can also load multiple [config groups](#setting-up-hydra) in an [experiments
queue], for example to run a [grid search] of ML hyperparameters:

```cli
$ dvc exp run --queue \
              -S 'train/optimizer=adam,sgd' \
              -S 'train/model=resnet,efficientnet'

Queueing with overrides '{'params.yaml': ['optimizer=adam', 'model=resnet']}'.
Queued experiment 'ed3b4ef' for future execution.
Queueing with overrides '{'params.yaml': ['optimizer=adam', 'model=efficientnet']}'.
Queued experiment '7a10d54' for future execution.
Queueing with overrides '{'params.yaml': ['optimizer=sgd', 'model=resnet']}'.
Queued experiment '0b443d8' for future execution.
Queueing with overrides '{'params.yaml': ['optimizer=sgd', 'model=efficientnet']}'.
Queued experiment '0a5f20e' for future execution.

$ dvc queue start
...
```

[experiments queue]:
  /user-guide/experiment-management/running-experiments#the-experiments-queue
[grid search]:
  https://en.wikipedia.org/wiki/Hyperparameter_optimization#Grid_search

<admon type="info">

Note that DVC keeps a cache of all runs, so many permutations will be completed
without actually having to run the experiment. In the above example, the
experiment with `['optimizer=sgd', 'model=resnet']` will not waste computing
time because the results are already in the <abbr>run cache</abbr>. You can
confirm this with `dvc queue logs`:

```
$ dvc queue logs 0b443d8
Stage 'setup-dataset' didn't change, skipping
Stage 'train' didn't change, skipping
```

</admon>

`dvc exp run` will compose a new `params.yaml` each time you run it, so it is
not a reliable way to reproduce past experiments. Instead, use `dvc repro` when
you want to reproduce a previously run experiment.

[debug]: /user-guide/pipelines/running-pipelines#debugging-stages

## Migrating Hydra Projects

If you already have Hydra configured and want to start using DVC alongside it,
you may need to refactor your code slightly. DVC will not pass the Hydra config
to `@hydra.main()`, so it should be dropped from the code. Instead, DVC composes
the Hydra config before your code runs and dumps the results to `params.yaml`.

Using the example above, here's how the Python code in `train.py` might look
using Hydra without DVC:

```python
import hydra
from omegaconf import DictConfig

@hydra.main(version_base=None, config_path="conf", config_name="config")
def main(cfg: DictConfig) -> None:
    # train model using cfg parameters

if __name__ == "__main__":
    main()
```

To convert the same code to use DVC with Hydra composition enabled:

```python
from omegaconf import OmegaConf

def main() -> None:
    cfg = OmegaConf.load("params.yaml")
    # train model using cfg parameters

if __name__ == "__main__":
    main()
```

You no longer need to import Hydra into your code. A `main()` method is included
in this example because it is good practice, but it's not necessary. This
separation between config and code can help debug because the entire config
generated by Hydra gets written to `params.yaml` before the experiment starts.
You can run the same code with or without Hydra (or DVC). You can also reuse
`params.yaml` across multiple scripts in different stages of a DVC pipeline.

## Advanced Hydra config

You can configure how DVC works with Hydra.

By default, DVC will look for Hydra [config groups] in a `conf` directory, but
you can set a different directory using `dvc config hydra.config_dir other_dir`.
This is equivalent to the `config_path` argument in `@hydra.main()`.

Within that directory, DVC will look for [defaults list] in `config.yaml`, but
you can set a different path using `dvc config hydra.config_name other.yaml`.
This is equivalent to the `config_name` argument in `@hydra.main()`.

Hydra will automatically discover [plugins] in the `hydra_plugins` directory. By
default, DVC will look for `hydra_plugins` in the root directory of the DVC
repository, but you can set a different path with
`dvc config hydra.plugins_path other_path`.

### Custom resolvers

You can register [OmegaConf custom resolvers] as plugins by writing them to a
file inside `hydra_plugins`. DVC will use these custom resolvers when composing
the Hydra config. For example, add a custom resolver to
`hydra_plugins/my_resolver.py`:

```python
import os
from omegaconf import OmegaConf

OmegaConf.register_new_resolver('join', lambda x, y : os.path.join(x, y))
```

You can use that custom resolver inside the Hydra config:

```yaml
dir: raw/data
relpath: dataset.csv
fullpath: ${join:${dir},${relpath}}
```

The final `params.yaml` will look like:

```yaml
dir: raw/data
relpath: dataset.csv
fullpath: raw/data/dataset.csv
```

[plugins]:
  https://hydra.cc/docs/advanced/plugins/develop/#automatic-plugin-discovery-process
[OmegaConf custom resolvers]:
  https://omegaconf.readthedocs.io/en/latest/custom_resolvers.html
