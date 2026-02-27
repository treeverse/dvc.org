# import

Download a file or directory tracked by another DVC or Git repository into the
<abbr>workspace</abbr>, and track it (an import `.dvc` file is created).

> See also our `dvc.api.open()` Python API function.

## Synopsis

```usage
usage: dvc import [-h] [-q | -v]
                  [-o <path>] [-f] [--rev <commit>]
                  [--no-exec | --no-download]
                  [-j <number>]
                  [--config <path>] [--remote <name>]
                  [--remote-config [<name>=<value> ...]]
                  url path

positional arguments:
  url              Location of DVC or Git repository to download from
  path             Path to a file or directory within the repository
```

## Description

Provides an easy way to reuse files or directories tracked in any <abbr>DVC
repository</abbr> (e.g. datasets, intermediate results, ML models) or Git
repository (e.g. code, small image/other files). `dvc import` downloads the
target file or directory (found at `path` in `url`), and tracks it in the local
project. This makes it possible to update the import later, if the data source
has changed (see `dvc update`).

> See `dvc list` for a way to browse repository contents to find files or
> directories to import.

> Note that `dvc get` corresponds to the first step this command performs (just
> download the data).

The imported data is <abbr>cached</abbr>, and linked (or copied) to the current
working directory with its original file name e.g. `data.txt` (or to a location
provided with `--out`). An _import `.dvc` file_ is created in the same location
e.g. `data.txt.dvc` – similar to using `dvc add` after downloading the data.

<admon type="info">

DVC won't push data imported from other DVC repos to [remote storage].
`dvc pull` will download from the original source.

[remote storage]: /user-guide/data-management/remote-storage

</admon>

The `url` argument specifies the address of the DVC or Git repository containing
the data source. Both HTTP and SSH protocols are supported (e.g.
`[user@]server:project.git`). `url` can also be a local file system path
(including the current project e.g. `.`).

The `path` argument specifies a file or directory to download (paths inside
tracked directories are supported). It should be relative to the root of the
repo (absolute paths are supported when `url` is local). Note that DVC-tracked
targets must be found in a `dvc.yaml` or `.dvc` file of the repo.

> See `dvc import-url` to download and track data from other supported locations
> such as S3, SSH, HTTP, etc.

`.dvc` files support references to data in an external DVC repository (hosted on
a Git server). In such a `.dvc` file, the `deps` field specifies the `url` and
data `path`, and the `outs` field contains the corresponding local path in the
<abbr>workspace</abbr>. It records enough metadata about the imported data to
enable DVC to efficiently determine whether the local copy is out of date.

To actually [version the data], `git add` (and `git commit`) the import `.dvc`
file.

⚠️ Relevant notes and limitation:

- Source DVC repos should have a `dvc remote default` containing the target data
  for this command to work.
- The only exception to the above requirement is for local repos, where DVC will
  try to copy the data from its <abbr>cache</abbr> first.
- Limited support for [chained imports](#example-chained-imports) is available
  (importing data that was itself imported into the source repo from another
  one).
- Note that `dvc repro` doesn't check or update import `.dvc` files (see
  `dvc freeze`), use `dvc update` to bring the import up to date from the data
  source.

[version the data]: /start

## Options

- `-o <path>`, `--out <path>` - specify a `path` to the desired location in the
  workspace to place the downloaded file or directory (instead of using the
  current working directory).

- `-f`, `--force` - when using `--out` to specify a local target file or
  directory, the operation will fail if those paths already exist. this flag
  will force the operation causing local files/dirs to be overwritten by the
  command.

- `--rev <commit>` - commit hash, branch or tag name, etc. (any
  [Git revision](https://git-scm.com/docs/revisions)) of the repository to
  download the file or directory from. The latest commit (in the default branch)
  is used by default when this option is not specified.

  > Note that this adds a `rev` field in the import `.dvc` file that fixes it to
  > the revision. This can impact the behavior of `dvc update` (see the
  > [Importing and updating fixed revisions](#example-importing-and-updating-fixed-revisions)
  > example below).

- `--no-exec` - create the import `.dvc` file without accessing `url` (assumes
  that the data source is valid). This is useful if you need to define the
  project imports quickly, and import the data later (use `dvc update` to finish
  the operation(s)).

- `--no-download` - create the import `.dvc` file including the source data
  information (repository URL and [version](https://git-scm.com/docs/revisions))
  but without downloading the associated data. This is useful if you need track
  changes in remote data without using local storage space (yet). The data can
  be downloaded later using `dvc pull`. File version can be updated using
  `dvc update --no-download`.

- `-j <number>`, `--jobs <number>` - parallelism level for DVC to download data
  from the remote. The default value is `4 * cpu_count()`. Using more jobs may
  speed up the operation. Note that the default value can be set in the source
  repo using the `jobs` config option of `dvc remote modify`.

- `--config <path>` - path to a [config file](/command-reference/config) that
  will be merged with the config in the target repository.

- `--remote <name>` - name of the `dvc remote` to set as a default in the target
  repository.

- `--remote-config [<name>=<value> ...]` - `dvc remote` config options to merge
  with a remote's config (default or one specified by `--remote`) in the target
  repository.

- `-h`, `--help` - prints the usage/help message, and exit.

- `-q`, `--quiet` - do not write anything to standard output. Exit with 0 if no
  problems arise, otherwise 1.

- `-v`, `--verbose` - displays detailed tracing information.

## Examples

A simple case for this command is to import a dataset from an external <abbr>DVC
repository</abbr>, such as our
[get started example repo](https://github.com/treeverse/example-get-started).

```cli
$ dvc import git@github.com:treeverse/example-get-started \
             data/data.xml
Importing 'data/data.xml (git@github.com:treeverse/example-get-started)'
-> 'data.xml'
```

In contrast with `dvc get`, this command doesn't just download the data file,
but it also creates an import `.dvc` file with a link to the data source (as
explained in the description above). (This `.dvc` file can later be used to
[update](/command-reference/update) the import.) Check `data.xml.dvc`:

```yaml
md5: 7de90e7de7b432ad972095bc1f2ec0f8
frozen: true
wdir: .
deps:
  - path: data/data.xml
    repo:
      url: git@github.com:treeverse/example-get-started
      rev_lock: 6c73875a5f5b522f90b5afa9ab12585f64327ca7
outs:
  - md5: a304afb96060aad90176268345e10355
    path: data.xml
    cache: true
```

Several of the values above are pulled from the original `.dvc` file
[in the external DVC repository](https://github.com/treeverse/example-get-started/blob/main/data/data.xml.dvc).
The `url` and `rev_lock` subfields under `repo` are used to save the origin and
version of the dependency, respectively.

## Example: Importing and updating fixed revisions

To import a specific version of a file/directory, we may use the `--rev` option:

```cli
$ dvc import --rev cats-dogs-v1 \
             git@github.com:treeverse/dataset-registry.git \
             use-cases/cats-dogs
Importing
'use-cases/cats-dogs (git@github.com:treeverse/dataset-registry.git)'
-> 'cats-dogs'
```

When using this option, the import `.dvc` file will also have a `rev` subfield
under `repo`:

```yaml
deps:
  - path: use-cases/cats-dogs
    repo:
      url: git@github.com:treeverse/dataset-registry.git
      rev: cats-dogs-v1
      rev_lock: 0547f5883fb18e523e35578e2f0d19648c8f2d5c
```

If `rev` is a Git branch or tag (where the underlying commit changes), the data
source may have updates at a later time. To bring it up to date if so (and
update `rev_lock` in the `.dvc` file), simply use `dvc update <stage>.dvc`. If
`rev` is a specific commit hash (does not change), `dvc update` without options
will not have an effect on the import `.dvc` file. You may force-update it to a
different commit with `dvc update --rev`:

```cli
$ dvc update --rev cats-dogs-v2 cats-dogs.dvc
```

> In the above example, the value for `rev` in the new `.dvc` file will be
> `master` (a branch) so it will be able update normally going forward.

## Example: Data registry

If you take a look at our
[dataset registry](https://github.com/treeverse/dataset-registry)
<abbr>project</abbr>, you'll see that it's organized into different directories
such as `tutorials/versioning` and `use-cases/`, and these contain `.dvc` files
that track different datasets. Given this simple structure, its data files can
be easily shared among several other projects using `dvc get` and `dvc import`.
For example:

```cli
$ dvc get https://github.com/treeverse/dataset-registry \
          tutorials/versioning/data.zip
```

> Used in our
> [versioning tutorial](/example-scenarios/versioning-data-and-models/tutorial)

Or

```cli
$ dvc import git@github.com:treeverse/dataset-registry.git \
             use-cases/cats-dogs
```

`dvc import` provides a better way to incorporate data files tracked in external
<abbr>DVC repositories</abbr> because it saves the connection between the
current project and the source repo. This means that enough information is
recorded in an import `.dvc` file in order to
[reproduce](/command-reference/repro) downloading of this same data version in
the future, where and when needed. This is achieved with the `repo` field, for
example (matching the import command above):

```yaml
frozen: true
deps:
  - path: use-cases/cats-dogs
    repo:
      url: git@github.com:treeverse/dataset-registry.git
      rev_lock: 0547f5883fb18e523e35578e2f0d19648c8f2d5c
outs:
  - md5: b6923e1e4ad16ea1a7e2b328842d56a2.dir
    path: cats-dogs
    cache: true
```

See a full explanation in our [Data Registry](/example-scenarios/data-registry)
use case.

## Example: Importing from any Git repository

You can even import files from plain Git repos that are not <abbr>DVC
repositories</abbr>. For example, let's import a dataset from
[GSA's data repo](https://github.com/GSA/data):

```cli
$ dvc import git@github.com:GSA/data \
           enterprise-architecture/it-standards.csv
Importing ...
```

> Note that Git-tracked files can be imported from DVC repos as well.

The file is imported, and along with it, an import `.dvc` file is created. Check
`it-standards.csv.dvc`:

```yaml
deps:
  - path: enterprise-architecture/it-standards.csv
    repo:
      url: git@github.com:GSA/data
      rev_lock: af6a1feb542dc05b4d3e9c80deb50e6596876e5f
outs:
  - md5: 7e6de779a1ab286745c808f291d2d671
    path: it-standards.csv
```

The `url` and `rev_lock` subfields under `repo` are used to save the origin and
[version](https://git-scm.com/docs/revisions) of the dependency, respectively.

## Example: Chained imports

DVC supports importing data that was itself imported into the source repo, as
long as all the repos in the import chain (and their `dvc remote default`) are
accessible from the final destination repo.

Consider an example with 3 DVC repos (A, B, and C). DVC repo `/repo/a` contains
a `data.csv` file tracked with `dvc add`:

```
/repo/a
├── data.csv
└── data.csv.dvc
```

In repo B, we import `data.csv` from A and into a subdirectory:

```cli
$ dvc import /repo/a data.csv --out training/data.csv
```

Project B may of course contain other files unique to itself, for example:

```
/repo/b
└── training
    ├── data.csv
    ├── data.csv.dvc
    ├── labels
    │   ├── test.txt
    │   └── truth.txt
    └── labels.dvc
```

> Notice that the `training/labels` directory (not an import) is also tracked in
> B separately.

If we examine `training/data.csv.dvc`, we can see that that the import source is
repo A (`/repo/a`):

```yaml
deps:
  - path: data.csv
    repo:
      url: /repo/a
      rev_lock: 32ab3ddc8a0b5cbf7ed8cb252f93915a34b130eb
outs:
  - md5: acbd18db4cc2f85cedef654fccc4a4d8
    size: 3234523
    path: data.csv
```

Now lets imagine that we run the following command in our third repo, C:

```cli
$ dvc import /repo/b training
```

This will result in the following directory structure, which contains a chained
import and a regular one:

```
/repo/c
├── training
│   ├── data.csv
│   └── labels
│       ├── test.txt
│       └── truth.txt
└── training.dvc
```

- `training/data.csv` is imported from A into B into C
- `training/labels/` is imported from B into C directly

However, `training.dvc` only references repo B (`/repo/b`):

```yaml
deps:
  - path: training
    repo:
      url: /repo/b
      rev_lock: 15136ed84b59468b68fd66b8141b41c5be682ced
outs:
  - md5: e784c380dd9aa9cb13fbe22e62d7b2de.dir
    size: 27
    nfiles: 3
    path: training
```

Each time that we `dvc import` or `dvc update`\* `training/` into C (or even
`dvc pull` it) DVC will first look up the contents of `training` in B and notice
that `training/data.csv` is itself an import. It will then resolve the chain as
needed (finding `data.csv` in A).

> \*Note that when running `dvc update training` from repo C, DVC will only
> check whether or not `training/` changed in repo B. So if `data.csv` has only
> changed in A, `training/data.csv` won't be updated in C until
> `dvc update training/data.csv` has been run in B.

This means both repos A and B must be reachable when `dvc import` runs in repo
C, otherwise the import chain resolution would fail.

The `dvc remote default` for all repos in the import chain must also be
accessible (repo C needs to have all the appropriate credentials).

## Example: Set default remote

```cli
$ dvc import https://github.com/treeverse/example-get-started-s3 data/prepared --remote myremote
...
$ cat prepared.dvc
deps:
  - path: data/prepared
    repo:
      url: https://github.com/treeverse/example-get-started-s3
      rev_lock: 8141b41c5be682ced15136ed84b59468b68fd66b
      remote: myremote
outs:
  - md5: e784c380dd9aa9cb13fbe22e62d7b2de.dir
    size: 27
    nfiles: 3
    path: prepared
```

## Example: Set AWS profile for default remote

```cli
$ dvc import https://github.com/treeverse/example-get-started-s3 data/prepared --remote-config profile=myprofile
...
$ cat prepared.dvc
deps:
  - path: data/prepared
    repo:
      url: https://github.com/treeverse/example-get-started-s3
      rev_lock: 8141b41c5be682ced15136ed84b59468b68fd66b
      remote:
        profile: myprofile
outs:
  - md5: e784c380dd9aa9cb13fbe22e62d7b2de.dir
    size: 27
    nfiles: 3
    path: prepared
```

## Example: Create new AWS S3 remote and set it as default

If remote with that name already exists, its config will be merged with options
provided by `--remote-config`.

```cli
$ dvc import https://github.com/treeverse/example-get-started-s3 data/prepared \
    --remote myremote \
    --remote-config url=s3://mybucket/mypath profile=myprofile
...
$ cat prepared.dvc
deps:
  - path: data/prepared
    repo:
      url: https://github.com/treeverse/example-get-started-s3
      rev_lock: 8141b41c5be682ced15136ed84b59468b68fd66b
      config:
        core:
          remote: myremote
        remote:
          myremote:
            url: s3://mybucket/mypath
            profile: myprofile
outs:
  - md5: e784c380dd9aa9cb13fbe22e62d7b2de.dir
    size: 27
    nfiles: 3
    path: prepared
```

## Example: Set AWS secret keys for particular remote

In this example, instead of using `--remote myremote` with `--remote-config` and
exposing your secrets in dvcfile, you could use `--config` to use a gitignored
config file. The format of the config file is the same as produced by
`dvc config`.

```cli
$ cat myconfig
[core]
  remote = myremote

[remote "myremote"]
  access_key_id = myaccesskeyid
  secret_access_key = mysecretaccesskey
$ cat .gitignore # make sure you are not commiting this file to git
...
/myconfig
...
$ dvc import https://github.com/treeverse/example-get-started-s3 data/prepared --config myconfig
...
$ cat prepared.dvc
deps:
  - path: data/prepared
    repo:
      url: https://github.com/treeverse/example-get-started-s3
      rev_lock: 8141b41c5be682ced15136ed84b59468b68fd66b
      config: myconfig
outs:
  - md5: e784c380dd9aa9cb13fbe22e62d7b2de.dir
    size: 27
    nfiles: 3
    path: prepared
```
