# DVCFileSystem

DVCFileSystem provides a pythonic file interface (
[fsspec-compatible](https://filesystem-spec.readthedocs.io/en/latest/)) for a
DVC repo. It is a read-only filesystem, hence it does not support any write
operations, like `put_file`, `cp`, `rm`, `mv`, `mkdir` etc.

```py
class DVCFileSystem(AbstractFileSystem):
    def __init__(
        self,
        repo: Optional[str] = None,
        rev: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
        **kwargs,
    ):
```

DVCFileSystem provides a unified view of all the files/directories in your
repository, be it Git-tracked or DVC-tracked, or untracked (in case of a local
repository). It can reuse the files in DVC <abbr>cache</abbr> and can otherwise
stream from [supported remote storage].

[supported remote storage]:
  /user-guide/data-management/remote-storage#supported-storage-types

```py
>>> from dvc.api import DVCFileSystem
# opening a local repository
>>> fs = DVCFileSystem("/path/to/local/repository")
# opening a remote repository
>>> repo = "https://github.com/treeverse/example-get-started.git"
>>> fs = DVCFileSystem(repo, rev="main")
```

## Parameters

- `repo` - optional URL or local path to the DVC project. If unspecified, the
  DVC project in current working directory is used. (Equivalent to the `repo`
  argument in `dvc.api.open()` and `dvc.api.read()`)

  <admon type="info">

  The parameter was renamed from `url` to `repo` in `dvc>=3.60`. If you are
  using an older version and passing arguments by keyword, replace use of `url`
  with `repo`.

  </admon>

- `rev` - optional Git commit (any
  [revision](https://git-scm.com/docs/revisions) such as a branch or a tag name,
  a commit hash, or an [experiment name]).

- `config` optional [config] dictionary to pass through to the DVC project.

[experiment name]: /command-reference/exp/run#-n
[config]: /command-reference/config

## Opening a file

```py
>>> with fs.open("model.pkl") as f:
        model = pickle.load(f)
```

This is similar to `dvc.api.open()` which returns a file-like object. Note that,
unlike `dvc.api.open()`, the `mode` defaults to binary mode, i.e. `"rb"`. You
can also specify `encoding` argument in case of text mode (`"r"`).

## Reading a file

```py
>>> text = fs.read_text("get-started/data.xml", encoding="utf-8")
```

This is similar to `dvc.api.read()`, which returns the contents of the file as a
string.

To get the binary contents of the file, you can use `read_bytes()` or
`cat_file()`.

```py
>>> contents = fs.read_bytes("get-started/data.xml")
```

## Listing all DVC-tracked files recursively

```py
>>> fs.find("/", detail=False, dvc_only=True)
[
    '/data/data.xml',
    '/data/features/test.pkl',
    '/data/features/train.pkl',
    '/data/prepared/test.tsv',
    '/data/prepared/train.tsv',
    '/evaluation/importance.png',
    '/model.pkl'
]
```

This is similar to `dvc ls --recursive --dvc-only` CLI command. Note that the
`"/"` is considered as the root of the Git repo. You can specify sub-paths to
only return entries in that directory. Similarly, there is `fs.ls()` that is
non-recursive.

## Listing all files (including Git-tracked)

```py
>>> fs.find("/", detail=False)
[
    ...
    '/.gitignore',
    '/README.md',
    '/data/.gitignore',
    '/data/data.xml',
    '/data/features/test.pkl',
    '/data/features/train.pkl',
    '/data/prepared/test.tsv',
    '/data/prepared/train.tsv',
    ...
    '/evaluation/.gitignore',
    '/evaluation/importance.png',
    '/evaluation/plots/confusion_matrix.json',
    '/evaluation/plots/precision_recall.json',
    '/evaluation/plots/roc.json',
    '/model.pkl',
    ...
]
```

This is similar to `dvc ls --recursive` CLI command. It returns all of the files
tracked by DVC and Git and if filesystem is opened locally, it also includes the
local untracked files.

## Downloading a file or a directory

```py
>>> fs.get_file("data/data.xml", "data.xml")
```

This downloads "data/data.xml" file to the current working directory as
"data.xml" file. The DVC-tracked files may be downloaded from the cache if it
exists or may get streamed from the remote.

```py
>>> fs.get("data", "data", recursive=True)
```

This downloads all the files in "data" directory - be it Git-tracked or
DVC-tracked into a local directory "data". Similarly, DVC might fetch files from
remote if they don't exist in the cache.

## Using subrepos

If you have
[initialized DVC in a subdirectory](/command-reference/init#initializing-dvc-in-subdirectories)
of the Git repository, use `DVCFileSystem(repo, subrepos=True)` to access the
subdirectory.

```py
>>> from dvc.api import DVCFileSystem
>>> repo = "https://github.com/iterative/monorepo-example.git"
# by default, DVC initialized in a subdirectory will be ignored
>>> fs = DVCFileSystem(repo, rev="develop")
>>> fs.find("nlp", detail=False, dvc_only=True)
[]
# use subrepos=True to list those files
>>> fs = DVCFileSystem(repo, subrepos=True, rev="develop")
>>> fs.find("nlp", detail=False, dvc_only=True)
['nlp/data/data.xml', 'nlp/data/features/test.pkl', 'nlp/data/features/train.pkl', 'nlp/data/prepared/test.tsv', 'nlp/data/prepared/train.tsv', 'nlp/eval/importance.png', 'nlp/model.pkl']
```

## fsspec API Reference

As DVCFileSystem is based on
[fsspec](https://filesystem-spec.readthedocs.io/en/latest/), it is compatible
with most of the APIs that it offers. When DVC is installed in the same Python
environment as any other fsspec-compatible library (such as [Hugging Face
Datasets][hf-datasets]), DVCFileSystem will be used automatically when a
`dvc://` filesystem URL is provided to fsspec function calls. For more details
check out the fsspec's [API Reference][fsspec-api].

[fsspec]: https://filesystem-spec.readthedocs.io/en/latest/
[fsspec-api]:
  https://filesystem-spec.readthedocs.io/en/latest/api.html#fsspec.spec.AbstractFileSystem
[hf-datasets]: /user-guide/integrations/huggingface#hugging-face-datasets

<admon type="tip">

Note that `dvc://` URLs contain the path to the file you wish to load, relative
to the root of the DVC project. `dvc://` URLs should not contain a Git
repository URL. The Git repository URL is provided separately via the `repo`
argument for DVCFileSystem.

When using `dvc://` URLs, additional constructor arguments for DVCFileSystem
(such as `repo` or `rev`) should be passed via the `storage_options` dictionary
or as keyword arguments, depending on the specific fsspec method behing called.
Please refer to the fsspec documentation for specific details.

</admon>

### fsspec API examples:

For methods which take filesystem arguments as additional keyword arguments:

```python
>>> import fsspec
>>> fsspec.open(
...   "dvc://workshop/satellite-data/jan_train.csv",
...   repo="https://github.com/treeverse/dataset-registry.git",
... )
<OpenFile 'workshop/satellite-data/jan_train.csv'>
```

For methods which take filesystem arguments via the `storage_options`
dictionary:

```python
>>> import fsspec
>>> fsspec.get_fs_token_paths(
...   "dvc://workshop/satellite-data/jan_train.csv",
...   storage_options={"repo": "https://github.com/treeverse/dataset-registry.git"},
... )
(<dvc.fs.dvc._DVCFileSystem object at 0x113f7a290>, '06e54af48d3513bf33a8988c47e6fb47', ['workshop/satellite-data/jan_train.csv'])
```
