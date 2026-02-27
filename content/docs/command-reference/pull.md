# pull

Download tracked files or directories from [remote storage] based on the current
`dvc.yaml` and `.dvc` files, and make them visible in the
<abbr>workspace</abbr>.

[remote storage]: /user-guide/data-management/remote-storage

## Synopsis

```usage
usage: dvc pull [-h] [-q | -v] [-j <number>] [-r <name>] [-a] [-T]
                [-d] [-f] [-R] [--all-commits]
                [--run-cache | --no-run-cache] [--allow-missing]
                [targets [targets ...]]

positional arguments:
  targets       Limit command scope to these tracked files/directories,
                .dvc files, or stage names.
```

## Description

The `dvc push` and `dvc pull` commands are the means for uploading and
downloading data to and from [remote storage] (S3, SSH, GCS, etc.). These
commands are similar to `git push` and `git pull`, respectively. [Data sharing]
across environments and preserving data versions (input datasets, intermediate
results, models, `dvc metrics`, etc.) remotely are the most common use cases for
these commands.

`dvc pull` downloads tracked data from a `dvc remote` to the <abbr>cache</abbr>,
and links (or copies) the files or directories to the <abbr>workspace</abbr>
(refer to `dvc config cache.type`).

[data sharing]: /start#storing-and-sharing

<admon type="info">

Note that pulling data does not affect code, `dvc.yaml`, or `.dvc` files. Those
should be downloaded with `git pull`.

</admon>

It has the same effect as running `dvc fetch` and `dvc checkout`:

```
Tracked files                Commands
---------------- ---------------------------------

remote storage
     +
     |         +------------+
     | - - - - | dvc fetch  | ++
     v         +------------+   +   +----------+
project's cache                  ++ | dvc pull |
     +         +------------+   +   +----------+
     | - - - - |dvc checkout| ++
     |         +------------+
     v
 workspace
```

The `dvc remote` used is determined in order, based on

1. the `remote` fields in the `dvc.yaml` or `.dvc` files.
2. the value passed to the `--remote` (`-r`) option via CLI.
3. the value of the `core.remote` config option (see `dvc remote default`).

Without arguments, it downloads all files and directories referenced in the
current workspace (found in `dvc.yaml` and `.dvc` files) that are missing from
the workspace. Any `targets` given to this command limit what to pull. It
accepts paths to tracked files or directories (including paths inside tracked
directories), `.dvc` files, and stage names (found in `dvc.yaml`).

The `--all-branches`, `--all-tags`, and `--all-commits` options enable pulling
files/dirs referenced in multiple Git commits.

After the data is in the <abbr>cache</abbr>, `dvc pull` uses OS-specific
mechanisms like reflinks or hardlinks to put it in the workspace, trying to
avoid copying. See `dvc checkout` for more details.

Note that the command `dvc status -c` can list files referenced in current
stages (in `dvc.yaml`) or `.dvc` files, but missing from the cache. It can be
used to see what files `dvc pull` would download.

## Options

- `-a`, `--all-branches` - determines the files to download by examining
  `dvc.yaml` and `.dvc` metafiles in all Git branches, as well as in the
  workspace. It's useful if branches are used to track experiments. Note that
  this can be combined with `-T` below, for example using the `-aT` flags.

- `-T`, `--all-tags` - examines metafiles in all Git tags, as well as in the
  workspace. Useful if tags are used to mark certain versions of an experiment
  or project. Note that this can be combined with `-a` above, for example using
  the `-aT` flags.

- `-A`, `--all-commits` - examines metafiles in all Git commits, as well as in
  the workspace. This downloads tracked data for the entire commit history of
  the project.

- `-d`, `--with-deps` - only meaningful when specifying `targets`. This
  determines files to pull by resolving all dependencies of the targets: DVC
  searches backward from the targets in the corresponding pipelines. This will
  not pull files referenced in later stages than the `targets`.

- `-R`, `--recursive` - determines the files to pull by searching each target
  directory and its subdirectories for `dvc.yaml` and `.dvc` files to inspect.
  If there are no directories among the `targets`, this option has no effect.

- `-f`, `--force` - does not prompt when removing workspace files, which occurs
  when these files no longer match the current stages or `.dvc` files. This
  option surfaces behavior from the `dvc fetch` and `dvc checkout` commands
  because `dvc pull` in effect performs those 2 functions in a single command.

- `-r <name>`, `--remote <name>` - name of the `dvc remote` to pull from (see
  `dvc remote list`).

- `--run-cache`, `--no-run-cache` - whether to download all available history of
  [stage runs] from the `dvc remote` (to the cache only, like
  `dvc fetch --run-cache`). Note that `dvc repro <stage_name>` is necessary to
  checkout these files (into the workspace) and update `dvc.lock`. Default is
  `--no-run-cache`.

- `--allow-missing` - allows the command to succeed even if some files or
  directories are missing.

- `-j <number>`, `--jobs <number>` - parallelism level for DVC to download data
  from remote storage. The default value is `4 * cpu_count()`. Note that the
  default value can be set using the `jobs` config option with
  `dvc remote modify`. Using more jobs may speed up the operation.

- `-h`, `--help` - prints the usage/help message, and exit.

- `-q`, `--quiet` - do not write anything to standard output. Exit with 0 if no
  problems arise, otherwise 1.

- `-v`, `--verbose` - displays detailed tracing information.

[stage runs]: /user-guide/project-structure/internal-files#run-cache

## Examples

Let's employ a simple <abbr>workspace</abbr> with some data, code, ML models,
pipeline stages, such as the <abbr>DVC project</abbr> created for the
[Get Started](/start). Then we can see what happens with `dvc pull`.

<details>

### Click and expand to set up the project

Start by cloning our example repo if you don't already have it:

```cli
$ git clone https://github.com/treeverse/example-get-started
$ cd example-get-started
```

</details>

```cli
.
├── data
│   └── data.xml.dvc
├── dvc.lock
├── dvc.yaml
...
└── src
    └── <code files here>
```

We can now just run `dvc pull` to download the most recent `data/data.xml`,
`model.pkl`, and other DVC-tracked files into the <abbr>workspace</abbr>:

```cli
$ dvc pull

$ tree
.
├── data
│   ├── data.xml
│   ├── data.xml.dvc
...
└── model.pkl
```

We can also download only the <abbr>outputs</abbr> of a specific stage:

```cli
$ dvc pull train
```

## Example: With dependencies

> Delete the `.dvc/cache` directory first (with `rm -Rf .dvc/cache`) to follow
> this example if you tried the previous ones.

Our [pipeline](/command-reference/dag) has been set up with these
[stages](/command-reference/stage/add): `prepare`, `featurize`, `train`,
`evaluate`.

Imagine the `dvc remote` has been modified such that the data in some of these
stages should be updated in the <abbr>workspace</abbr>.

```cli
$ dvc status -c
...
	deleted:            data/features/test.pkl
	deleted:            data/features/train.pkl
	deleted:            model.pkl
	...
```

One could do a simple `dvc pull` to get all the data, but what if you only want
to retrieve part of the data?

```cli
$ dvc pull --with-deps featurize

# Use the partial update...
# Then pull the remaining data:

$ dvc pull
Everything is up to date.
```

With the first `dvc pull` we specified a stage in the middle of this pipeline
(`featurize`) while using `--with-deps`. DVC started with that stage and
searched backwards through the pipeline for data files to download. Later we ran
`dvc pull` to download all the remaining data files.

## Example: Download from specific remote storage

For using the `dvc pull` command, a `dvc remote` storage must be defined. For an
existing <abbr>project</abbr>, remotes are usually already set up and you can
use `dvc remote list` to check them. To remember how it's done, and set a
context for the example, let's define a default SSH remote:

```cli
$ dvc remote add -d r1 \
                 ssh://user@example.com/project/data/cache
$ dvc remote list
r1    ssh://user@example.com/project/data/cache   (default)
r2    ssh://user@example.com/other/storage
```

Note that the default remote (if set) is also indicated when you run
`dvc remote list`.

<admon type="info">

DVC supports [several storage types].

[several storage types]:
  /user-guide/data-management/remote-storage#supported-storage-types

</admon>

To download DVC-tracked data from a specific remote, use the `--remote` (`-r`)
option of `dvc pull`:

```cli
$ dvc pull --remote r1
```
