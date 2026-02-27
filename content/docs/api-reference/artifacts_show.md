# dvc.api.artifacts_show()

Get the path and Git revision for an <abbr>artifact</abbr> tracked in the
<abbr>model registry</abbr>.

```py
def artifacts_show(
    name: str,
    version: Optional[str] = None,
    stage: Optional[str] = None,
    repo: Optional[str] = None,
) -> Dict[str, str]:
```

<admon type="tip">

If you have a DVC Studio project configured with your remote storage
credentials, you may also use the DVC Studio REST API to programmatically access
artifacts. It does not require the client to have any credentials other than the
DVC Studio [client access token] and does not require DVC to be installed.

</admon>

## Usage:

```py
import dvc.api

artifact = dvc.api.artifacts_show(
    'text-classification',
    repo='https://github.com/treeverse/example-get-started.git',
)
```

## Description

Returns a path and Git revision for a named artifact which can then be used in
other Python API calls.

The returned dictionary will be of the form:

```py
{
    'path': 'model.pkl',
    'rev': 'c7c6ae0',
}
```

where `path` contains the relative path to the artifact in the DVC repository,
and `rev` contains the Git revision for the specified artifact version or stage.

When neither `version` nor `stage` are provided, the Git revision for the latest
version of the model will be returned.

## Parameters

- `name` (required) - name of the artifact. By default DVC will search for
  artifacts declared in a `dvc.yaml` file located at the root of the DVC
  repository. Artifacts declared in other `dvc.yaml` files should be addressed
  in the form `path/to/dvc.yaml:artifact_name` or `path/to:artifact_name` (where
  `dvc.yaml` is omitted).

- `version` - version of the artifact (mutually exclusive with `stage`).

- `stage` - stage of the artifact (mutually exclusive with `version`).

- `repo` - the location of the DVC project. It can be a URL or a file system
  path. Both HTTP and SSH protocols are supported for online Git repos (e.g.
  `[user@]server:project.git`). _Default_: The current project (found by walking
  up from the current working directory tree).

## Example: Read the contents of an artifact

```py
import pickle
import dvc.api

artifact = dvc.api.artifacts_show(
    'text-classification',
    version='v1.0.0',
    repo='https://github.com/treeverse/example-get-started.git',
)
data = dvc.api.read(
    artifact['path'],
    rev=artifact['rev'],
    repo='https://github.com/treeverse/example-get-started.git',
    mode='rb',
)
model = pickle.loads(data)
```

This example uses the returned path and Git revision in conjunction with
`dvc.api.read()` to read the file content for the artifact.

## Example: Download an artifact

```py
import os
import dvc.api

artifact = dvc.api.artifacts_show(
    'text-classification',
    stage='prod',
    repo='https://github.com/treeverse/example-get-started.git',
)
fs = dvc.api.DVCFileSystem(
    'https://github.com/treeverse/example-get-started.git',
    rev=artifact['rev'],
)
fs.get_file(artifact['path'], os.path.basename(artifact['path']))
```

This example uses the returned path and Git revision in conjunction with
`dvc.api.DVCFileSystem` to download the artifact to the current working
directory.

[client access token]: https://docs.datachain.ai/studio/api#authorization
