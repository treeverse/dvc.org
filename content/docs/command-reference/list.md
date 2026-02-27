# list

> Aliased to `dvc ls`.

List project contents, including files, models, and directories tracked by DVC
and by Git.

> Useful to find data to `dvc get`, `dvc import`, or for `dvc.api` functions.

## Synopsis

```usage
usage: dvc list [-h] [-q | -v] [-R|-T] [-L depth] [--dvc-only]
                [--json] [--rev [<commit>]]
                [--config <path>] [--remote <name>]
                [--remote-config [<name>=<value> ...]]
                [--size] [--show-hash]
                url [path]

positional arguments:
  url            Location of DVC or Git repository to list from
  path           Path to a file or directory in the repository
```

## Description

Produces a view of a <abbr>DVC repository</abbr> (usually online), listing data
files and directories tracked by DVC alongside the remaining Git repo contents.
This is useful because when you browse a hosted repository (e.g. on GitHub or
with `git ls-remote`), you only see the `dvc.yaml` and `.dvc` files with your
code (files tracked by Git).

This command's output is equivalent to cloning the repo and
[pulling](/command-reference/pull) the data (except that nothing is downloaded),
like this:

```cli
$ git clone <url> example
$ cd example
$ dvc pull
$ ls <path>
```

The `url` argument specifies the address of the DVC or Git repository containing
the data source. Both HTTP and SSH protocols are supported (e.g.
`[user@]server:project.git`). `url` can also be a local file system path
(including the current project e.g. `.`). Any path inside a DVC project will be
resolved to the project's root.

The optional `path` argument specifies a file or directory to list (paths inside
tracked directories are supported). It should be relative to the root of the
repo (absolute paths are supported when `url` is local). This is similar to
providing a path to listing commands such as `ls` or `aws s3 ls`.

Only the root directory is listed by default, but the `-R` option can be used to
list files recursively.

Note that `dvc list` doesn't check whether the listed data (tracked by DVC)
actually exists in remote storage, so it's not guaranteed whether it can be
accessed with `dvc get`, `dvc import`, or `dvc.api`.

## Options

- `-R`, `--recursive` - recursively list files in all subdirectories.

- `-T`, `--tree` - recurse into directories as a tree.

- `-L`, `--level <depth>` - limit the depth of recursion.

- `--dvc-only` - show only DVC-tracked files and directories
  (<abbr>outputs</abbr>).

- `--rev <commit>` - commit hash, branch or tag name, etc. (any
  [Git revision](https://git-scm.com/docs/revisions)) of the repository to list
  content for. The latest commit (in the default branch) is used by default when
  this option is not specified.

- `--json` - prints the command's output in easily parsable JSON format, instead
  of a human-readable table.

- `--config <path>` - path to a [config file](/command-reference/config) that
  will be merged with the config in the target repository.

- `--remote <name>` - name of the `dvc remote` to set as a default in the target
  repository.

- `--remote-config [<name>=<value> ...]` - `dvc remote` config options to merge
  with a remote's config (default or one specified by `--remote`) in the target
  repository.

- `--size` - show sizes.

- `--show-hash` - show hash value of each item.

- `-h`, `--help` - prints the usage/help message, and exit.

- `-q`, `--quiet` - do not write anything to standard output. Exit with 0 if no
  problems arise, otherwise 1.

- `-v`, `--verbose` - displays detailed tracing information. when this option is
  not specified.

## Example: Find files to download from a repository

We can use this command for getting information about a repository before using
other commands like `dvc get` or `dvc import` to reuse any file or directory
found in it. This includes files (or directories) tracked by DVC or by Git:

```cli
$ dvc list https://github.com/iterative/example-get-started
.dvcignore
.gitignore
README.md
data
dvc.lock
dvc.yaml
model.pkl
params.yaml
prc.json
scores.json
src
```

If you open the
[example-get-started](https://github.com/iterative/example-get-started)
project's page, you will see a similar list but not the `model.pkl` file. It's
tracked by DVC and not visible to Git. It's exported in the `dvc.yaml` file as
an output of the `train` stage (in the `outs` field).

We can now, for example, download the model file with:

```cli
$ dvc get https://github.com/iterative/example-get-started model.pkl
```

## Example: List all files in a data registry

Let's imagine a DVC repo used as a
[data registry](/example-scenarios/data-registry#using-registries), structured
with different datasets in separate directories. We can do this recursively,
using `-R` option:

```cli
$ dvc list -R https://github.com/iterative/dataset-registry
.gitignore
README.md
get-started/.gitignore
get-started/data.xml
get-started/data.xml.dvc
images/.gitignore
images/dvc-logo-outlines.png
images/dvc-logo-outlines.png.dvc
images/owl_sticker.png
...
```

## Example: Create an archive of your DVC project

Just like you can use `git archive` to make a quick bundle (ZIP) file of the
current code, `dvc list` can be easily complemented with simple archive tools to
bundle the current data files in the project.

For example, here's a TAR archive of the entire <abbr>workspace</abbr>
(Linux/GNU):

```cli
$ dvc list . -R | tar -cvf project.tar
```

Or separate ZIP archives of code and DVC-tracked data (POSIX terminal with
`zip`):

```
$ git archive -o code.zip HEAD
$ dvc list . -R --dvc-only | zip -@ data.zip
```

ZIP alternative for [POSIX on Windows](/user-guide/how-to/run-dvc-on-windows)
(Python installed):

```cli
$ dvc list . -R --dvc-only | xargs python -m zipfile -c data.zip
```

## Example: Set AWS profile for default remote

```cli
$ dvc list https://github.com/iterative/example-get-started-s3 data/prepared --remote-config profile=myprofile
```

## Example: Set default remote

```cli
$ dvc list https://github.com/iterative/example-get-started-s3 data/prepared --remote myremote
```
