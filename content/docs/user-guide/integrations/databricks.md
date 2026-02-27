# Databricks

[Databricks Git folders] don't expose the underlying Git repo, so Git-related
DVC functionality within Databricks Repos is not supported (e.g. [experiments],
`--rev/--all-commits/--all-tags/etc`). Everything will operate as normal if you
`git clone` a project yourself or [use remote projects](#dvc-api) with DVC
directly.

## Setup

```bash
%pip install dvc
```

In order to be able to work in [Databricks Repos], you'll need to use this
workaround:

```bash
!dvc config core.no_scm true --local
```

## DVC API

You can use your existing DVC projects through the [Python API] as normal, for
example:

```python
import dvc.api

with dvc.api.open(
    'get-started/data.xml',
    repo='https://github.com/treeverse/dataset-registry',
) as fobj:
    ...
```

### Secrets

If you need to use secrets to access your data, first add them to [Databricks
secrets] and then use them with DVC, for example:

```python
import dvc.api

remote_config = {
    'access_key_id': dbutils.secrets.get(scope='test_scope', key='aws_access_key_id'),
    'secret_access_key': dbutils.secrets.get(scope='test_scope', key='aws_secret_access_key'),
}

with dvc.api.open(
    'recent-grads.csv',
    repo='https://github.com/efiop/mydataregistry',
    remote_config=remote_config
) as fobj:
    ...
```

## Running DVC commands

Databricks doesn't provide a classic terminal by default, so you'll need to use
[magic commands] to run DVC commands in your notebook. If your workspace does
have [web terminal] enabled, you can also run DVC commands in the terminal as
normal.

### Example: set up shared DVC cache on dbfs

```bash
!dvc config cache.dir /dbfs/dvc/cache
```

### Example: add data

```bash
!dvc add data
```

If working with [Databricks Repos], due to the limitations described in the
beginning and `noscm` workaround, DVC won't be able to automatically add new
entries to corresponding `.gitignore`s, so you'll need to do that manually.

### Example: import data

```bash
!dvc import-url https://archive.ics.uci.edu/static/public/186/wine+quality.zip
```

## Live experiment updates

If working with [Databricks Repos], you will need to set both the
`DVC_STUDIO_TOKEN` and `DVC_EXP_GIT_REMOTE` to see live experiment updates in
DVC Studio.

```python
import getpass
import os

os.environ["DVC_STUDIO_TOKEN"] = getpass.getpass()
os.environ["DVC_EXP_GIT_REMOTE"] = "https://github.com/<org>/<repo>"
```

[Databricks Git folders]: https://docs.databricks.com/aws/en/repos
[experiments]: /start/experiments
[Python API]: /api-reference
[Databricks secrets]: https://docs.databricks.com/aws/en/security/secrets
[magic commands]:
  https://ipython.readthedocs.io/en/stable/interactive/magics.html
[web terminal]: https://docs.databricks.com/aws/en/compute/web-terminal
