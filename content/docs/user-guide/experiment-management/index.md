# DVC Experiments Overview

ML experiments can be saved with DVC automatically as they're run or manually
after they complete. Each experiment creates and tracks a variation of your data
science project based on the changes in your <abbr>workspace</abbr>.

Experiments preserve a connection to the latest commit in the current branch
(Git `HEAD`) as their parent or _baseline_, but do not form part of the regular
Git tree. This prevents bloating your repo with temporary commits and branches.

<details>

### ⚙️ How does DVC track experiments?

Experiments are custom [Git references] (found in `.git/refs/exps`) with one or
more commits based on `HEAD`. These commits are hidden and not checked out by
DVC. Note that these are not pushed to Git remotes by default either (see
`dvc exp push`).

Note that DVC Experiments require a unique name to identify them. DVC will
auto-generate one by default, such as `puffy-daks`. A custom name can be set
instead, using the `--name`/`-n` option of `dvc exp run`/`dvc exp save`. These
names can be used to reference experiments in other `dvc exp` subcommands.

</details>

[git references]: https://dvc.org/blog/experiment-refs/

## Save experiments

<admon type="">

See 👨‍💻 [Get Started: Experiments] for a hands-on introduction to DVC
experiments.

</admon>

To save an experiment, you can follow one of these roads:

- If you do not have a DVC pipeline, you can log live results from Python code
  using [DVCLive] initialized.
- If you have a DVC [pipeline], use `dvc exp run` to both [run] your code
  pipeline and save experiment results. `dvc exp run` also enables advanced
  features like queuing many experiments at once.

Experiments are saved locally by default but you can [share] them so that anyone
can reproduce your work.

## Metrics, plots, parameters

DVC can track and compare <abbr>parameters</abbr>, <abbr>metrics</abbr>, and
<abbr>plots</abbr> data saved in standard structured files like YAML, JSON, and
CSV, and they can be tracked as part of your repo. One way to generate these
parameters, metrics, and plots (and to automatically configure them) is with
[DVCLive]. You can also manually generate these files and use `dvc.yaml`
metafiles to specify which files are [parameters], [metrics], or [plots] (and to
specify how to [visualize plots]).

## Models and datasets

DVC can track models or datasets as part of your repo, and you can manage those
models in the <abbr>model registry</abbr>. One way to log models or other
<abbr>artifacts</abbr> is with [DVCLive]. You can also track them with `dvc add`
and declare metadata for the model registry in `dvc.yaml`.

## Work with DVC Experiments from a GUI

DVC Experiments can be used directly [from the VS Code IDE]

### VS Code Extension

https://www.youtube.com/watch?v=LHi3SWGD9nc

[get started: experiments]: /start/experiments
[dvclive]: /dvclive
[pipeline]: /user-guide/pipelines
[run]: /user-guide/experiment-management/running-experiments
[share]: /user-guide/experiment-management/sharing-experiments
[parameters]: /user-guide/project-structure/dvcyaml-files#params
[metrics]: /user-guide/project-structure/dvcyaml-files#metrics
[plots]: /user-guide/project-structure/dvcyaml-files#plots
[visualize plots]: /user-guide/experiment-management/visualizing-plots
[from the vs code ide]:
  https://marketplace.visualstudio.com/items?itemName=lakeFS.lakefs-dvc
