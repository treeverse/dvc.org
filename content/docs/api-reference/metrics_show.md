# dvc.api.metrics_show()

Get [metrics](/command-reference/metrics) tracked in a <abbr>DVC
repository</abbr>.

```py
def metrics_show(
    *targets: str,
    repo: Optional[str] = None,
    rev: Optional[str] = None,
    config: Optional[dict] = None,
) -> Dict:
```

## Usage:

```py
import dvc.api

metrics = dvc.api.metrics_show()
```

## Description

Gets [metrics](/command-reference/metrics) values from a <abbr>DVC
repository</abbr> and returns a dictionary, such as:

```json
{
  "avg_prec": { "train": 0.97, "val": 0.92 },
  "roc_auc": { "train": 0.98, "val": 0.94 }
}
```

Without arguments, this function will retrieve all metrics from all tracked
metrics files (used in any `dvc.yaml` file). This applies to the current project
version when using Git (including any changes in the working tree).

The function parameters (below) let you restrict what's retrieved.

## Metrics

- `*targets` - one or more separate path(s) to valid metrics file(s) to retrieve
  metrics from, for example
  `"eval/train_val_metrics.json", "eval/test_metrics.json"`. If no `targets` are
  provided, all metrics files tracked in any `dvc.yaml` will be targeted by
  default.

- `repo` - specifies the location of the DVC project. It can be a URL or a file
  system path. Both HTTP and SSH protocols are supported for online Git repos
  (e.g. `[user@]server:project.git`). _Default_: The current project (found by
  walking up from the current working directory tree).

- `rev` - Git commit (any [revision](https://git-scm.com/docs/revisions) such as
  a branch or tag name, a commit hash or an [experiment](/command-reference/exp)
  name). If `repo` is not a Git repo, this option is ignored. _Default_: `None`
  (current working tree will be used)

- `config` - [config](/command-reference/config) dictionary to pass to the DVC
  project. This is merged with the existing project config and can be used to,
  for example, provide credentials to the `remote`. See
  [dvc.api.open](/api-reference/open) for examples.

## Example: Filter by one or more targets

`targets` can be a single name (string):

```py
import dvc.api
metrics = dvc.api.metrics_show("eval/train_val_metrics.json")
```

```json
{
  "avg_prec": { "train": 0.97, "val": 0.92 },
  "roc_auc": { "train": 0.98, "val": 0.94 }
}
```

Or multiple names (strings):

```py
import dvc.api
metrics = dvc.api.metrics_show("eval/train_val_metrics.json", "eval/test_metrics.json")
```

```json
{
  "eval/train_val_metrics.json": {
    "avg_prec": { "train": 0.97, "val": 0.92 },
    "roc_auc": { "train": 0.98, "val": 0.94 }
  },
  "eval/test_metrics.json": {
    "avg_prec": { "test": 0.72 },
    "roc_auc": { "test": 0.77 }
  }
}
```

## Example: Filter by revision

You can pass any valid Git [revision](https://git-scm.com/docs/revisions) to
just get metrics from that revision:

```py
import dvc.api
metrics = dvc.api.metrics_show(rev="HEAD~1")
```

```json
{
  "avg_prec": { "train": 0.97, "val": 0.92 },
  "roc_auc": { "train": 0.98, "val": 0.94 }
}
```

## Example: Use a remote DVC repository

You can use the `repo` argument to retrieve metrics from any <abbr>DVC
repository</abbr> without having to clone it locally.

```py
import dvc.api
metrics = dvc.api.metrics_show(
    repo="https://github.com/treeverse/example-get-started")
```

```json
{
  "avg_prec": {
    "train": 0.9743681430252835,
    "test": 0.9249974999612706
  },
  "roc_auc": {
    "train": 0.9866678562450621,
    "test": 0.9460213440787918
  }
}
```
