# dvc.api.read()

Returns the contents of a tracked file.

<admon type="info">

This is similar to the `dvc get` command in our CLI.

</admon>

```py
def read(path: str,
         repo: str = None,
         rev: str = None,
         remote: str = None,
         remote_config: dict = None,
         config: dict = None,
         mode: str = "r",
         encoding: str = None)
```

## Usage

```py
import dvc.api

modelpkl = dvc.api.read(
    'model.pkl',
    repo='https://github.com/treeverse/example-get-started',
    mode='rb'
)
```

## Description

This function wraps `dvc.api.open()`, for a simple way to return the complete
contents of a file tracked in a <abbr>DVC project</abbr>. The file can be
tracked by DVC (as an <abbr>output</abbr>) or by Git.

The returned contents can be a [string] or a [bytearray]. These are loaded to
memory directly (without using any disc space).

[string]: https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str
[bytearray]: https://docs.python.org/3/library/stdtypes.html#bytearray

<admon type="info">

The type returned depends on the `mode` used. For more details, please refer to
Python's [`open()`] built-in, which is used under the hood.

[`open()`]: https://docs.python.org/3/library/functions.html#open

</admon>

## Parameters

- **`path`** (required) - location and file name of the target to read, relative
  to the root of the project (`repo`).

- `repo` - specifies the location of the DVC project. It can be a URL or a file
  system path. Both HTTP and SSH protocols are supported for online Git repos
  (e.g. `[user@]server:project.git`). _Default_: The current project is used
  (the current working directory tree is walked up to find it).

- `rev` - Git commit (any [revision] such as a branch or tag name, commit hash,
  or [experiment name]). If `repo` is not a Git repo, this option is ignored.
  _Default_: `None` (current working tree will be used)

- `remote` - name of the [DVC remote] to look for the target data. _Default_:
  The [default remote] of `repo` is used if a `remote` argument is not given.
  For local projects, the <abbr>cache</abbr> is tried before the default remote.

- `remote_config` - dictionary of options to pass to the DVC remote. This can be
  used to, for example, provide credentials to the `remote`.

- `config` - [config] dictionary to pass to the DVC project. This is merged with
  the existing project config and can be used to, for example, add an entirely
  new `remote`.

- `mode` - specifies the mode in which the file is opened. Defaults to `"r"`
  (read). Mirrors the namesake parameter in builtin [`open()`].

- `encoding` - [codec] used to decode the file contents to a string. This should
  only be used in text mode. Defaults to `"utf-8"`. Mirrors the namesake
  parameter in builtin `open()`.

[revision]: https://git-scm.com/docs/revisions
[experiment name]: /command-reference/exp/run#-n
[dvc remote]: /user-guide/data-management/remote-storage
[default remote]: /command-reference/remote/default
[codec]: https://docs.python.org/3/library/codecs.html#standard-encodings
[config]: /command-reference/config

## Exceptions

- `dvc.exceptions.FileMissingError` - file in `path` is missing from `repo`.

- `dvc.exceptions.PathMissingError` - `path` cannot be found in `repo`.

- `dvc.exceptions.NoRemoteError` - no `remote` is found.

## Example: Load data from a DVC repository

Any file tracked in a <abbr>DVC project</abbr> (and [stored
remotely][dvc remote]) can be loaded directly in your Python code with this API.
For example, let's say that you want to load and unserialize a binary model from
a repo on GitHub:

```py
import pickle
import dvc.api

data = dvc.api.read(
    'model.pkl',
    repo='https://github.com/treeverse/example-get-started'
    mode='rb'
)
model = pickle.loads(data)
```

> We're using `'rb'` mode here for compatibility with `pickle.loads()`.
