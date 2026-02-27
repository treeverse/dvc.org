# dvc.api.params_show()

Get <abbr>parameters</abbr> (name and values) tracked in a <abbr>DVC
repository</abbr>.

```py
def params_show(
    *targets: str,  # Optional
    stages: Optional[Union[str, Iterable[str]]] = None,
    repo: Optional[str] = None,
    rev: Optional[str] = None,
    deps: bool = False,
    config: Optional[dict] = None,
) -> Dict:
```

## Usage:

```py
import dvc.api

params = dvc.api.params_show()
```

## Description

Gets <abbr>parameter</abbr> keys and values from a <abbr>DVC repository</abbr>
and returns a dictionary, such as:

```json
{
  "split": 0.2,
  "seed": 20170428
}
```

Without arguments, this function will retrieve all parameters from all tracked
param files (used in any `dvc.yaml` file). This applies to the current project
version when using Git (including any changes in the working tree).

The function parameters (below) let you restrict what's retrieved.

## Parameters

- `*targets` - one or more separate path(s) to valid parameter file(s) to
  retrieve params from, for example `"params.py", "feat/params.toml"`. If no
  `targets` are provided, all param files tracked in any `dvc.yaml` will be
  targeted by default. Note that explicit targets don't have to be in a
  `dvc.yaml` (unless `deps=True`).

- `repo` - specifies the location of the DVC project. It can be a URL or a file
  system path. Both HTTP and SSH protocols are supported for online Git repos
  (e.g. `[user@]server:project.git`). _Default_: The current project (found by
  walking up from the current working directory tree).

- `stages` - one or more names of the stage(s) to retrieve params from.
  _Default_: `None` (all parameters from all stages will be retrieved). If this
  method is called from a different location to the one where the `dvc.yaml` is
  found, the relative path to the `dvc.yaml` must be provided as a prefix with
  the syntax `{relpath}:{stage}`. For example: `subdir/dvc.yaml:stage-0` or
  `../dvc.yaml:stage-1`.

- `rev` - Git commit (any [revision](https://git-scm.com/docs/revisions) such as
  a branch or tag name, a commit hash or an [experiment](/command-reference/exp)
  name). If `repo` is not a Git repo, this option is ignored. _Default_: `None`
  (current working tree will be used)

- `deps` - whether to retrieve only params that are stage dependencies. Accepts
  `True` or `False` (_default_).

- `config` - [config](/command-reference/config) dictionary to pass to the DVC
  project. This is merged with the existing project config and can be used to,
  for example, provide credentials to the `remote`. See
  [dvc.api.open](/api-reference/open) for examples.

## Example: Filter by stage name(s)

`stages` can be a single name (string):

```py
import dvc.api
params = dvc.api.params_show(stages="train")
```

```py
{
  "n_est": 50,
  "min_split": 0.01
}
```

Or an iterable of strings:

```py
import dvc.api
params = dvc.api.params_show(stages=["featurize", "train"])
```

```py
{
  "max_features": 200,
  "ngrams": 2
  "n_est": 50,
  "min_split": 0.01
}
```

The returned dictionary can be used inside the stage:

```py
clf = RandomForestClassifier(
    n_estimators=params["n_est"],
    min_samples_split=params["min_split"]
)
```

## Example: Load specific parameter file(s)

You can pass any valid param file path as target to load all of the parameters
defined in it:

```py
import dvc.api
params = dvc.api.params_show( "configs/params_dev.yaml")
```

```json
{
  "run_mode": "prod",
  "configs": {
    "dev": "configs/params_dev.yaml",
    ...
```

Or multiple path targets:

```py
import dvc.api
params = dvc.api.params_show(
  "configs/params_dev.yaml", "configs/params_prod.yaml")
```

```json
{
  "configs/params_prod.yaml:run_mode": "prod",
  "configs/params_prod.yaml:config_file": "configs/params_prod.yaml",
  ...
  "configs/params_dev.yaml:run_mode": "dev",
  "configs/params_dev.yaml:config_file": "configs/params_dev.yaml",
  ...
```

## Example: Use a remote DVC repository

You can use the `repo` argument to retrieve parameters from any <abbr>DVC
repository</abbr> without having to clone it locally.

```py
import dvc.api
params = dvc.api.params_show(
    repo="https://github.com/treeverse/example-get-started")
```

```json
{
  "prepare": {
    "split": 0.2,
    "seed": 20170428
  },
  "featurize": {
    "max_features": 200,
    "ngrams": 2
  },
  "train": {
    "seed": 20170428,
    "n_est": 50,
    "min_split": 0.01
  }
}
```

## Example: Specify a project version

You can retrieve params from arbitrary Git commits, for example a branch name:

```py
import json
import dvc.api
params = dvc.api.params_show(rev="tune-hyperparams")
```

```json
{
  "prepare": {
    "split": 0.2,
    "seed": 20170428
  },
  "featurize": {
    "max_features": 200,
    "ngrams": 2
  },
  "train": {
    "seed": 20170428,
    "n_est": 100,
    "min_split": 8
  }
}
```
