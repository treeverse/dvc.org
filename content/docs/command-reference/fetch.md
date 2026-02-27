# fetch

Download files or directories from [remote storage] to the <abbr>cache</abbr>.

[remote storage]: /user-guide/data-management/remote-storage

## Synopsis

```usage
usage: dvc fetch [-h] [-q | -v] [-j <number>] [-r <name>] [-a] [-T]
                 [--all-commits] [-d] [-R] [--run-cache | --no-run-cache]
                 [--max-size <bytes>] [--type {metrics,plots}]
                 [targets [targets ...]]

positional arguments:
  targets       Limit command scope to these tracked files/directories,
                .dvc files, or stage names.
```

## Description

Downloads tracked files and directories from a `dvc remote` into the
<abbr>cache</abbr> (without placing them in the <abbr>workspace</abbr> like
`dvc pull`). This makes the tracked data available for linking (or copying) into
the workspace (see `dvc checkout`).

<admon type="tip">

Note that `dvc pull` includes fetching.

</admon>

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

Here are some scenarios in which `dvc fetch` is useful, instead of pulling:

- After checking out a fresh copy of a <abbr>DVC repository</abbr>, to get
  DVC-tracked data from multiple project branches or tags into your machine.
- To use comparison commands across different Git commits, for example
  `dvc metrics show` with its `--all-branches` option, or `dvc plots diff`.
- If you want to avoid
  [linking](/user-guide/data-management/large-dataset-optimization) files from
  the cache, or keep the <abbr>workspace</abbr> clean for any other reason.

Without arguments, it downloads all files and directories referenced in the
current workspace (found in `dvc.yaml` and `.dvc` files) that are missing from
the workspace. Any `targets` given to this command limit what to fetch. It
accepts paths to tracked files or directories (including paths inside tracked
directories), `.dvc` files, and <abbr>stage</abbr> names (found in `dvc.yaml`).

The `--all-branches`, `--all-tags`, and `--all-commits` options enable fetching
files/dirs referenced in multiple Git commits.

The `dvc remote` used is determined in order, based on

1. the `remote` fields in the `dvc.yaml` or `.dvc` files.
2. the value passed to the `--remote` option via CLI.
3. the value of the `core.remote` config option (see `dvc remote default`).

## Options

- `-r <name>`, `--remote <name>` - name of the `dvc remote` to fetch from (see
  `dvc remote list`).

- `-d`, `--with-deps` - only meaningful when specifying `targets`. This
  determines files to download by resolving all dependencies of the targets: DVC
  searches backward from the targets in the corresponding pipelines. This will
  not fetch files referenced in later stages than the `targets`.

- `-R`, `--recursive` - determines the files to fetch by searching each target
  directory and its subdirectories for `dvc.yaml` and `.dvc` files to inspect.
  If there are no directories among the `targets`, this option has no effect.

- `--run-cache`, `--no-run-cache` - whether to download all available history of
  [stage runs] from the remote repository. See the same option in `dvc push`.
  Default is ``--no-run-cache`.

- `-j <number>`, `--jobs <number>` - parallelism level for DVC to download data
  from remote storage. The default value is `4 * cpu_count()`. Note that the
  default value can be set using the `jobs` config option with
  `dvc remote modify`. Using more jobs may speed up the operation.

- `-a`, `--all-branches` - fetch cache for all Git branches, as well as for the
  workspace. This means DVC may download files needed to reproduce different
  versions of a `.dvc` file, not just the ones currently in the workspace. Note
  that this can be combined with `-T` below, for example using the `-aT` flags.

- `-T`, `--all-tags` - fetch cache for all Git tags, as well as for the
  workspace. Note that this can be combined with `-a` above, for example using
  the `-aT` flags.

- `-A`, `--all-commits` - fetch cache for all Git commits, as well as for the
  workspace. This downloads tracked data for the entire commit history of the
  project.

- `--max-size <bytes>` - fetch data files/directories that are each below
  specified size (bytes). **Note** that the size is determined by a
  corresponding `size` field in the `.dvc`/`dvc.lock` file. Which means that
  even if some files or subdirectories are smaller inside a DVC-tracked
  directory, the whole directory is still skipped.

- `--type <type>` - fetch data files/directories that are of a particular type.
  Currently only `metrics` and `plots` are supported.

- `-h`, `--help` - prints the usage/help message, and exit.

- `-q`, `--quiet` - do not write anything to standard output. Exit with 0 if no
  problems arise, otherwise 1.

- `-v`, `--verbose` - displays detailed tracing information.

[stage runs]: /user-guide/project-structure/internal-files#run-cache

## Examples

Let's employ a simple <abbr>workspace</abbr> with some data, code, ML models,
pipeline stages, such as the <abbr>DVC project</abbr> created for the
[Get Started](/start). Then we can see what `dvc fetch` does in different
scenarios.

<details>

### Click and expand to set up the project

Start by cloning our example repo if you don't already have it:

```cli
$ git clone https://github.com/treeverse/example-get-started
$ cd example-get-started
```

</details>

The workspace looks like this:

```cli
.
├── data
│   └── data.xml.dvc
├── dvc.lock
├── dvc.yaml
├── params.yaml
├── prc.json
├── scores.json
└── src
    └── <code files here>
```

This project comes with a predefined HTTP [remote storage]. We can now just run
`dvc fetch` to download the most recent `model.pkl`, `data.xml`, and other
DVC-tracked files into our local <abbr>cache</abbr>.

```cli
$ dvc status --cloud
...
	deleted:            data/features/train.pkl
	deleted:            model.pkl

$ dvc fetch

$ tree .dvc/cache/files/md5
.dvc/cache/files/md5
├── 20
│   └── b786b6e6f80e2b3fcf17827ad18597.dir
├── c8
│    ├── d307aa005d6974a8525550956d5fb3
│    └── ...
...
```

> `dvc status --cloud` compares the cache contents against the default remote.
> Refer to `dvc status`.

Note that the
[`.dvc/cache`](/user-guide/project-structure/internal-files#structure-of-the-cache-directory)
directory was created and populated.

All the data needed in this version of the project is now in your cache: File
names `20b786b...` and `c8d307a...` correspond to the `data/features/` directory
and `model.pkl` file, respectively.

To link these files to the workspace:

```cli
$ dvc checkout
```

## Example: Specific files or directories

> If you tried the previous example, delete the `.dvc/cache` directory first
> (e.g. `rm -Rf .dvc/cache`) to follow this one.

`dvc fetch` only downloads the tracked data corresponding to any given
`targets`:

```cli
$ dvc fetch prepare

$ tree .dvc/cache/files/md5
.dvc/cache/files/md5
├── 20
│   └── b786b6e6f80e2b3fcf17827ad18597.dir
├── 32
│   └── b715ef0d71ff4c9e61f55b09c15e75
└── 6f
    └── 597d341ceb7d8fbbe88859a892ef81
```

Cache entries for the `data/prepared` directory (<abbr>output</abbr> of the
`prepare` target), as well as the actual `test.tsv` and `train.tsv` files, were
downloaded. Their hash values are shown above.

Note that you can fetch data within directories tracked. For example, the
`featurize` stage has the entire `data/features` directory as output, but we can
just get this:

```cli
$ dvc fetch data/features/test.pkl
```

If you check again `.dvc/cache`, you'll see a couple more files were downloaded:
the cache entries for the `data/features` directory, and
`data/features/test.pkl` itself.

## Example: With dependencies

After following the previous example (**Specific stages**), only the files
associated with the `prepare` stage have been fetched. Several
dependencies/outputs of other pipeline stages are still missing from the cache:

```cli
$ dvc status -c
...
    deleted:            data/features/test.pkl
    deleted:            data/features/train.pkl
    deleted:            model.pkl
```

One could do a simple `dvc fetch` to get all the data, but what if you only want
to retrieve the data up to our third stage, `train`? We can use the
`--with-deps` (or `-d`) option:

```cli
$ dvc fetch --with-deps train

$ tree .dvc/cache/files/md5
.dvc/cache/files/md5
├── 20
│   └── b786b6e6f80e2b3fcf17827ad18597.dir
├── c8
│   ├── 43577f9da31eab5ddd3a2cf1465f9b
│   └── d307aa005d6974a8525550956d5fb3
├── 32
│   └── b715ef0d71ff4c9e61f55b09c15e75
├── 54
│   └── c0f3ef1f379563e0b9ba4accae6807
├── 6f
│   └── 597d341ceb7d8fbbe88859a892ef81
├── a1
│   └── 414b22382ffbb76a153ab1f0d69241.dir
└── a3
    └── 04afb96060aad90176268345e10355
```

Fetching using `--with-deps` starts with the target stage (`train`) and searches
backwards through its pipeline for data to download into the project's cache.
All the data for the second and third stages (`featurize` and `train`) has now
been downloaded to the cache. We could now use `dvc checkout` to get the data
files needed to reproduce this pipeline up to the third stage into the workspace
(with `dvc repro train`).

> Note that in this example project, the last stage `evaluate` doesn't add any
> more data files than those form previous stages, so at this point all of the
> data for this pipeline is cached and `dvc status -c` would output
> `Cache and remote 'storage' are in sync.`
