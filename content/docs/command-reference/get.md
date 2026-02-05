# get

Download a file or directory tracked by DVC or by Git into the current working
directory.

> See also our `dvc.api.open()` Python API function.

## Synopsis

```usage
usage: dvc get [-h] [-q | -v] [-o <path>] [--rev <commit>]
               [--show-url] [-j <number>] [-f]
               [--config <path>] [--remote <name>]
               [--remote-config [<name>=<value> ...]]
               url path

positional arguments:
  url              Location of DVC or Git repository to download from
  path             Path to a file or directory within the repository
```

## Description

Provides an easy way to download files or directories tracked in any <abbr>DVC
repository</abbr> (e.g. datasets, intermediate results, ML models), or Git
repository (e.g. source code, small image/other files). `dvc get` copies the
target file or directory (found at `path` in `url`) to the current working
directory. (Analogous to `wget`, but for repos.)

> See `dvc list` for a way to browse repository contents to find files or
> directories to download.

> Note that unlike `dvc import`, this command does not track the downloaded
> files (does not create a `.dvc` file). For that reason, it doesn't require an
> existing DVC project to run in.

The `url` argument specifies the address of the DVC or Git repository containing
the data source. Both HTTP and SSH protocols are supported (e.g.
`[user@]server:project.git`). `url` can also be a local file system path
(including the current project e.g. `.`).

The `path` argument specifies a file or directory to download (paths inside
tracked directories are supported). It should be relative to the root of the
repo (absolute paths are supported when `url` is local). Note that DVC-tracked
targets must be found in a `dvc.yaml` or `.dvc` file of the repo.

<admon type="warn">

DVC repos should have a `dvc remote default` containing the target for this to
work. The only exception is for local repos, where DVC will try to copy the data
from its <abbr>cache</abbr> first.

</admon>

> See `dvc get-url` to download data from other supported locations such as S3,
> SSH, HTTP, etc.

After running this command successfully, the data found in the `url`, `path`
combination is created in the current working directory, with its original file
name.

## Options

- `-o <path>`, `--out <path>` - specify a `path` to the desired location in the
  workspace to place the downloaded file or directory (instead of using the
  current working directory). Directories specified in the path will be created
  by this command.

- `--rev <commit>` - commit hash, branch or tag name, etc. (any
  [Git revision](https://git-scm.com/docs/revisions)) of the repository to
  download the file or directory from. The latest commit (in the default branch)
  is used by default when this option is not specified.

- `-j <number>`, `--jobs <number>` - parallelism level for DVC to download data
  from the remote. The default value is `4 * cpu_count()`. Using more jobs may
  speed up the operation. Note that the default value can be set in the source
  repo using the `jobs` config option of `dvc remote modify`.

- `-f`, `--force` - when using `--out` to specify a local target file or
  directory, the operation will fail if those paths already exist. this flag
  will force the operation causing local files/dirs to be overwritten by the
  command.

- `--show-url` - instead of downloading the file or directory, just print the
  storage location (URL) of the target data. If `path` is a Git-tracked file,
  this option is ignored.

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

## Example: Get a DVC-tracked model

> Note that `dvc get` can be used from anywhere in the file system, as long as
> DVC is [installed](/install).

We can use `dvc get` to download the resulting model file from our
[get started example repo](https://github.com/iterative/example-get-started), a
<abbr>DVC project</abbr> hosted on GitHub:

```cli
$ dvc get https://github.com/iterative/example-get-started model.pkl
$ ls
model.pkl
```

Note that the `model.pkl` file doesn't actually exist in the [root directory] of
the source Git repo. Instead, it's exported in the `dvc.yaml` file as an
<abbr>output</abbr> of the `train` stage (in the `outs` field). DVC will then
`dvc pull` the file from the `dvc remote default` of the source DVC project
(found in [its config file]).

[root directory]: https://github.com/treeverse/example-get-started/tree/main
[its config file]:
  https://github.com/treeverse/example-get-started/blob/main/.dvc/config

<admon type="info">

A recommended use for downloading binary files from DVC repositories, as done in
this example, is to place an ML model inside a wrapper application that serves
as an [ETL] pipeline or as an HTTP/RESTful API (web service) that provides
predictions upon request. This can be automated by leveraging DVC with [CI/CD]
tools.

[etl]: https://en.wikipedia.org/wiki/Extract,_transform,_load
[ci/cd]: /use-cases/ci-cd-for-machine-learning

</admon>

The same example applies to raw data or intermediate artifacts as well.

## Examples: Get a misc. Git-tracked file

We can also use `dvc get` to retrieve any file or directory that exists in a Git
repository.

```cli
$ dvc get https://github.com/schacon/cowsay install.sh
$ ls
install.sh
```

## Example: Getting the storage URL of a DVC-tracked file

We can use `dvc get --show-url` to get the actual location where the final model
file from our
[get started example repo](https://github.com/iterative/example-get-started) is
stored:

```cli
$ dvc get --show-url \
          https://github.com/iterative/example-get-started model.pkl
https://remote.dvc.org/get-started/c8/d307aa005d6974a8525550956d5fb3
```

`remote.dvc.org/get-started` is an HTTP `dvc remote`, whereas `c8d307...` is the
file hash.

## Example: Compare different versions of data or model

`dvc get` provides the `--rev` option to specify which
[Git commit](https://git-scm.com/docs/revisions) of the repository to download
the file or directory from. It also has the `--out` option to specify the
location to place the target data within the workspace. Combining these two
options allows us to do something we can't achieve with the regular
`git checkout` + `dvc checkout` process – see for example the [Switching between
versions] chapter of our _Get Started_.

Let's use the [get started example repo] again, like in the previous example.
But this time, clone it first to see `dvc get` in action inside a <abbr>DVC
project</abbr>.

```cli
$ git clone https://github.com/iterative/example-get-started
$ cd example-get-started
```

If you are familiar with the project in our [Get Started](/start) (used in these
examples), you may remember that the chapter where we train a first version of
the model corresponds to the `baseline-experiment` tag in the repo. Similarly
`bigrams-experiment` points to an improved model (trained using bigrams). What
if we wanted to have both versions of the model "checked out" at the same time?
`dvc get` provides an easy way to do this:

```cli
$ dvc get . model.pkl --rev baseline-experiment \
                      --out model.monograms.pkl
```

> Notice that the `url` provided to `dvc get` above is `.`. `dvc get` accepts
> file system paths as the "URL" to the source repo, for edge cases.

The `model.monograms.pkl` file now contains the older version of the model. To
get the most recent one, we use a similar command, but with
`-o model.bigrams.pkl` and `--rev bigrams-experiment` (or even without `--rev`
since that tag has the latest model version anyway). In fact, in this case using
`dvc pull` with the corresponding stage as target should suffice, downloading
the file as just `model.pkl`. We can then rename it to make its variant
explicit:

```cli
$ dvc pull train
$ mv model.pkl model.bigrams.pkl
```

And that's it! Now we have both model files in the <abbr>workspace</abbr>, with
different names, and not currently tracked by Git:

```cli
$ git status
...
Untracked files:
  (use "git add <file> ..." to include in what will be committed)

	model.bigrams.pkl
	model.monograms.pkl
```

[get started example repo]: https://github.com/iterative/example-get-started
[switching between versions]: /start#switching-between-versions

## Example: Set AWS profile for default remote

```cli
$ dvc get https://github.com/iterative/example-get-started-s3 data/prepared --remote-config profile=myprofile
```

## Example: Set default remote

```cli
$ dvc get https://github.com/iterative/example-get-started-s3 data/prepared --remote myremote
```
