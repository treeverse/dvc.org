# dvc.api.open()

Opens a tracked file.

```py
def open(path: str,
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

with dvc.api.open(
    'get-started/data.xml',
    repo='https://github.com/treeverse/dataset-registry'
) as f:
    # ... f is a file-like object that can be processed normally.
```

## Description

Open a data or model file tracked in a <abbr>DVC project</abbr> and generate a
corresponding [file object]. The file can be tracked by DVC (as an
<abbr>output</abbr>) or by Git.

[file object]: https://docs.python.org/3/glossary.html#term-file-object

<admon type="info">

The exact type of file object depends on the `mode` used. For more details,
please refer to Python's [`open()`] built-in, which is used under the hood.

This function makes a direct connection to [remote storage], so the file
contents can be streamed. Your code can process the data [buffer] as it's
streamed, which optimizes memory usage.

[`open()`]: https://docs.python.org/3/library/functions.html#open
[remote storage]: /user-guide/data-management/remote-storage
[buffer]: https://docs.python.org/3/c-api/buffer.html

</admon>

`dvc.api.open()` may only be used as a [context manager] (using the `with`
keyword, as shown in the examples).

[context manager]:
  https://www.python.org/dev/peps/pep-0343/#context-managers-in-the-standard-library

<admon type="info">

Use `dvc.api.read()` to load the complete file contents in a single function
call – no _context manager_ involved. Neither function utilizes disc space.

</admon>

## Parameters

- **`path`** (required) - location and file name of the target to open, relative
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

## Example: Use data or models from a DVC repository

Any file tracked in a <abbr>DVC project</abbr> (and [stored
remotely][remote storage]) can be processed directly in your Python code with
this API. For example, an XML file tracked in a public DVC repo on GitHub can be
processed like this:

```py
from xml.sax import parse
import dvc.api
from mymodule import mySAXHandler

with dvc.api.open(
    'get-started/data.xml',
    repo='https://github.com/treeverse/dataset-registry'
) as f:
    parse(f, mySAXHandler)
```

Notice that we use a [SAX](http://www.saxproject.org/) XML parser here because
`dvc.api.open()` is able to stream the data from remote storage. (The
`mySAXHandler` object should handle the event-driven parsing of the document in
this case.) This increases the performance of the code (minimizing memory
usage), and is typically faster than loading the whole data into memory.

> If you just needed to load the complete file contents into memory, you can use
> `dvc.api.read()` instead:
>
> ```py
> from xml.dom.minidom import parse
> import dvc.api
>
> url = 'https://github.com/treeverse/dataset-registry'
> xmldata = dvc.api.read('get-started/data.xml', repo=url)
> xmldom = parse(xmldata)
> ```

## Example: Accessing private repos

This is just a matter of using the right `repo` argument, for example an SSH URL
(requires that the
[credentials are configured](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
locally):

```py
import dvc.api

with dvc.api.open(
    'features.dat',
    repo='git@server.com:path/to/repo.git'
) as f:
    # ... Process 'features'
```

## Example: Use different versions of data

The `rev` argument lets you specify any Git commit to look for an artifact. This
way any previous version, or alternative experiment can be accessed
programmatically. For example, let's say your DVC repo has tagged releases of a
CSV dataset:

```py
import csv
import dvc.api

with dvc.api.open('clean.csv', rev='v1.1.0') as f:
    reader = csv.reader(f)
    # ... Process 'clean' data from version 1.1.0
```

Also, notice that we didn't supply a `repo` argument in this example. DVC will
attempt to find a <abbr>DVC project</abbr> to use in the current working
directory tree, and look for the file contents of `clean.csv` in its local
<abbr>cache</abbr>; no download will happen if found. See the
[Parameters](#parameters) section for more info.

## Example: Choose a specific remote as the data source

Sometimes we may want to choose a specific [remote storage] as source, for
example if the `repo` has no default remote set. This can be done by providing a
`remote` argument:

```py
import dvc.api

with dvc.api.open('activity.log', remote='my-s3-bucket') as f:
    for line in f:
        match = re.search(r'user=(\w+)', line)
        # ... Process users activity log
```

## Example: Specify credentials for remote

See [remote modify](/command-reference/remote/modify) for full list of
remote-specific config options.

```py
import dvc.api

remote_config = {
    'access_key_id': 'mykey',
    'secret_access_key': 'mysecretkey',
    'session_token': 'mytoken',
}

with dvc.api.open('data', remote_config=remote_config) as f:
    # ... Process data
```

## Example: Change default remote and specify credentials for it

See [remote modify](/command-reference/remote/modify) for full list of
remote-specific config options.

```py
import dvc.api

config = {
    'core': {'remote': 'myremote'},
    'remote': {
        'myremote': {
            'access_key_id': 'mykey',
            'secret_access_key': 'mysecretkey',
            'session_token': 'mytoken',
        },
    },
}

with dvc.api.open('data', config=config) as f:
    # ... Process data
```

## Example: Specify the text encoding

To chose which codec to open a text file with, send an `encoding` argument:

```py
import dvc.api

with dvc.api.open('data/nlp/words_ru.txt', encoding='koi8_r') as f:
    # ... Process Russian words
```
