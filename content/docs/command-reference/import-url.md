# import-url

Track a file or directory found in an external location (`s3://`, `/local/path`,
etc.), and download it to the local project, or make a copy in [remote storage].

[remote storage]: /user-guide/data-management/remote-storage

<admon type="info">

See `dvc import` to download and track data/model files or directories from
other <abbr>DVC repositories</abbr> (e.g. hosted on GitHub).

</admon>

## Synopsis

```usage
usage: dvc import-url [-h] [-q | -v]
           [--to-remote] [-r <name>] [--no-exec | --no-download]
           [-j <number>] [-f] [--version-aware]
           [--fs-config <name>=<value>]
           url [out]

positional arguments:
  url                   (See supported URLs in the description.)
  out                   Destination path to put files in.
```

## Description

In some cases it's convenient to add a data file or directory from an external
location into the workspace (or to a `dvc remote`), such that it can be updated
later, if/when the external data source changes. Example scenarios:

- A remote system may produce occasional data files that are used in other
  projects.
- A batch process running regularly updates a data file to import.
- A shared dataset on cloud storage that is managed and updated outside DVC.

> Note that `dvc get-url` corresponds to the first step this command performs
> (just download the file or directory).

`dvc import-url` helps you create such an external data dependency, without
having to manually copy files from the supported locations (listed below), which
may require installing a different tool for each type.

When you don't want to store the target data in your local system, you can still
create an import `.dvc` file while transferring a file or directory directly to
remote storage, by using the `--to-remote` option. See the
[Transfer to remote storage](#example-transfer-to-remote-storage) example for
more details.

The `url` argument specifies the external location of the data to be imported.
The imported data is <abbr>cached</abbr>, and linked (or copied) to the current
working directory with its original file name e.g. `data.txt` (or to a location
provided with `out`).

<admon type="tip">

See `dvc list-url` for a way to browse the external location for files and
directories to download.

</admon>

An _import `.dvc` file_ is created in the same location e.g. `data.txt.dvc` –
similar to using `dvc add` after downloading the data. This makes it possible to
update the import later, if the data source has changed (see `dvc update`).

<admon type="info">

You can `dvc push` and `dvc pull` data imported from external locations to/from
remote storage normally (unlike for `dvc import`).

</admon>

`.dvc` files support references to data in an external location, see
[External Dependencies](/user-guide/data-management/importing-external-data). In
such an import `.dvc` file, the `deps` field stores the external URL, and the
`outs` field contains the corresponding local path in the
<abbr>workspace</abbr>. It records enough metadata about the imported data to
enable DVC efficiently determining whether the local copy is out of date.

Note that `dvc repro` doesn't check or update import `.dvc` files, use
`dvc update` to bring the import up to date from the data source.

DVC supports several types of external locations (protocols):

| Type      | Description                  | `url` format example                          |
| --------- | ---------------------------- | --------------------------------------------- |
| `s3`      | Amazon S3                    | `s3://bucket/data`                            |
| `azure`   | Microsoft Azure Blob Storage | `azure://container/data`                      |
| `gs`      | Google Cloud Storage         | `gs://bucket/data`                            |
| `ssh`     | SSH server                   | `ssh://user@example.com/path/to/data`         |
| `hdfs`    | HDFS to file\*               | `hdfs://user@example.com/path/to/data.csv`    |
| `http`    | HTTP to file with _ETag_\*   | `https://example.com/path/to/data.csv`        |
| `webdav`  | WebDav to file\*             | `webdavs://example.com/endpoint/path`         |
| `webhdfs` | HDFS REST API\*              | `webhdfs://user@example.com/path/to/data.csv` |
| `local`   | Local path                   | `/path/to/local/data`                         |

<admon type="info">

If you installed DVC via `pip` and plan to use cloud services as [remote
storage], you might need to install these optional dependencies: `[s3]`,
`[azure]`, `[gs]`, `[oss]`, `[ssh]`. Alternatively, use `[all]` to include them
all. The command should look like this: `pip install "dvc[s3]"`. (This example
installs `boto3` library along with DVC to support S3 storage.)

</admon>

\* Notes on remote locations:

- HDFS, HTTP, WebDav, and WebHDFS **do not** support downloading entire
  directories, only single files.

- In case of HTTP,
  [ETag](https://en.wikipedia.org/wiki/HTTP_ETag#Strong_and_weak_validation) is
  necessary to track if the specified URL changed.

DVC also supports capturing [cloud versioning] information from certain cloud
storage providers. When the `--version-aware` option is provided or when the
`url` argument includes a supported cloud versioning ID, DVC will import the
specified version.

[cloud versioning]: /user-guide/data-management/cloud-versioning

<admon type="info">

When using versioned storage, DVC will always [pull] the versioned data from
source. This will not [push] an additional version to remote storage.

[pull]: /command-reference/pull
[push]: /command-reference/push

</admon>

| Type    | Description                  | Versioned `url` format example                         |
| ------- | ---------------------------- | ------------------------------------------------------ |
| `s3`    | Amazon S3                    | `s3://bucket/data?versionId=L4kqtJlcpXroDTDmpUMLUo`    |
| `azure` | Microsoft Azure Blob Storage | `azure://container/data?versionid=YYYY-MM-DDThh:mm:ss` |
| `gs`    | Google Cloud Storage         | `gs://bucket/data#1360887697105000`                    |

Another way to understand the `dvc import-url` command is as a shortcut for
generating a pipeline [stage](/command-reference/stage/add) with an external
dependency.

> This is discussed in the
> [External Dependencies](/user-guide/data-management/importing-external-data)
> documentation, where an alternative is demonstrated for each of these schemes.

Instead of:

```cli
$ dvc import-url https://data.dvc.org/get-started/data.xml data.xml
```

It is possible to use `dvc stage add`, for example (HTTP URL):

```cli
$ dvc stage add -n download_data \
                -d https://data.dvc.org/get-started/data.xml \
                -o data.xml \
                wget https://data.dvc.org/get-started/data.xml -O data.xml

$ dvc repro
```

`dvc import-url` generates an _import `.dvc` file_ while `dvc stage add`
produces a regular stage in `dvc.yaml`.

## Options

- `--no-exec` - create the import `.dvc` file without accessing `url` (assumes
  that the data source is valid). This is useful if you need to define the
  project imports quickly, and import the data later (use `dvc update` to finish
  the operation(s)).

- `--no-download` - create the import `.dvc` file including
  [hash values](/user-guide/project-structure/dvc-files#dependency-entries) for
  the external dependency but without downloading the associated data. This is
  useful if you need track changes in remote data without using local storage
  space (yet). The data can be downloaded later using `dvc pull`, but this will
  fail if the `url` no longer matches the hash values. File hashes can be
  updated using `dvc update --no-download`.

- `--to-remote` - import a target, but neither move it into the workspace, nor
  cache it. [Transfer it](#example-transfer-to-remote-storage) directly to
  remote storage (the default one unless otherwise specified with `-r`) instead.
  Use `dvc pull` to get the data locally.

- `-r <name>`, `--remote <name>` - name of the `dvc remote` (can only be used
  with `--to-remote`).

- `-j <number>`, `--jobs <number>` - parallelism level for DVC to download data
  from the source. The default value is `4 * cpu_count()`. Using more jobs may
  speed up the operation.

- `-f`, `--force` - when using `--out` to specify a local target file or
  directory, the operation will fail if those paths already exist. this flag
  will force the operation causing local files/dirs to be overwritten by the
  command.

- `--fs-config <name>=<value>` - `dvc remote` config options for the target url.

- `--version-aware` - capture [cloud versioning] information of the current
  version when importing the file. DVC will always
  [pull](/command-reference/pull) the versioned data from the source and will
  not [push](/command-reference/push) an additional copy to remote storage.

- `-h`, `--help` - prints the usage/help message, and exit.

- `-q`, `--quiet` - do not write anything to standard output. Exit with 0 if no
  problems arise, otherwise 1.

- `-v`, `--verbose` - displays detailed tracing information.

## Examples

To illustrate these examples we will be using the <abbr>project</abbr> explained
in the [Get Started](/start).

<details>

### Click and expand to set up example

Start by cloning our example repo if you don't already have it. Then move into
the repo and checkout the
[3-config-remote](https://github.com/treeverse/example-get-started/releases/tag/3-config-remote)
tag, section of the _Get Started_:

```cli
$ git clone https://github.com/treeverse/example-get-started
$ cd example-get-started
$ git checkout 3-config-remote
```

</details>

## Example: Tracking a file from the web

An advanced alternate to the intro of the [Versioning Basics] part of the _Get
Started_ is to use `dvc import-url`:

```cli
$ dvc import-url https://data.dvc.org/get-started/data.xml \
                 data/data.xml
Importing 'https://data.dvc.org/get-started/data.xml' -> 'data/data.xml'
...
To track the changes with git, run:

	git add data.xml.dvc data/.gitignore
```

Let's take a look at the changes to the `data.xml.dvc`:

```git
+md5: c4d6740ee09950bb532d418b8ae0b52e
+frozen: true
+deps:
+- etag: '"f432e270cd634c51296ecd2bc2f5e752-5"'
+  path: https://data.dvc.org/get-started/data.xml
 outs:
 - md5: a304afb96060aad90176268345e10355
   path: data.xml
   cache: true
```

The `etag` field in the `.dvc` file contains the
[ETag](https://en.wikipedia.org/wiki/HTTP_ETag) recorded from the HTTP request.
If the imported file changes online, its ETag will be different. This metadata
allows DVC to determine whether it's necessary to download it again.

> See `.dvc` files for more details on the format above.

You may want to get out of and remove the `example-get-started/` directory after
trying this example (especially if trying out the following one).

[versioning basics]: /start

## Example: Detecting external file changes

What if an imported file is updated regularly at it's source? The project goals
might include regenerating some results based on the updated data source.
[Pipeline](/command-reference/dag) reproduction can be triggered based on a
changed external dependency.

Let's use the [Get Started](/start) project again, simulating an updated
external data source. (Remember to prepare the <abbr>workspace</abbr>, as
explained in [Examples](#examples))

To illustrate this scenario, let's use a local file system directory external to
the workspace (in real life, the data file could be on a remote server instead).
Run these commands:

```cli
$ mkdir /tmp/dvc-import-url-example
$ cd /tmp/dvc-import-url-example/
$ wget https://data.dvc.org/get-started/data.xml
$ cd - # go back to the project
```

In a production system, you might have a process to update data files. That's
not what we have here, so in this case we'll set up a "data store" where we can
edit the data file.

```cli
$ dvc import-url /tmp/dvc-import-url-example/data.xml data/data.xml
Importing '../../../tmp/dvc-import-url-example/data.xml' -> 'data/data.xml'
```

Check `data.xml.dvc`:

```yaml
md5: fceb2bc076fabe99b483729c3ea2a897
frozen: true
deps:
  - md5: a304afb96060aad90176268345e10355
    path: /tmp/dvc-import-url-example/data.xml
outs:
  - md5: a304afb96060aad90176268345e10355
    path: data.xml
```

The `.dvc` file is nearly the same as in the previous example. The difference is
that the dependency (`deps`) now references the local file in the data store
directory we created previously. (Its `path` has the URL for the data store.)
And instead of an `etag` we have an `md5` hash value. We did this so its easy to
edit the data file.

Let's now manually reproduce the [data processing section] of the _Get Started_.
Download the example source code archive and unzip it:

```cli
$ wget https://code.dvc.org/get-started/code.zip
$ unzip code.zip
$ rm -f code.zip
```

[data processing section]: /start/data-pipelines/data-pipelines

<details>

### Click and expand to set up the environment

Let's install the requirements. But before we do that, we **strongly** recommend
creating a [virtual environment](https://docs.python.org/3/library/venv.html):

```cli
$ python3 -m venv .env
$ source .env/bin/activate
$ pip install -r src/requirements.txt
```

</details>

```cli
$ dvc stage add -n prepare \
                -d src/prepare.py -d data/data.xml \
                -o data/prepared \
                python src/prepare.py data/data.xml

$ dvc repro
Running command:
	python src/prepare.py data/data.xml
...
```

```cli
$ tree
.
├── README.md
├── data
│   ├── data.xml
│   ├── data.xml.dvc
│   └── prepared
│       ├── test.tsv
│       └── train.tsv
├── dvc.lock
├── dvc.yaml
├── params.yaml
└── src
    ├── evaluate.py
    ├── featurization.py
    ├── prepare.py
    ├── requirements.txt
    └── train.py
```

At this point, DVC considers everything being up to date:

```cli
$ dvc status
Data and pipelines are up to date.
```

In the data store directory, edit `data.xml`. It doesn't matter what you change,
as long as it remains a valid XML file, because any change will result in a
different dependency file hash (`md5`) in the import `.dvc` file. Once we do so,
we can run `dvc update` to make sure the import is up to date:

```cli
$ dvc update data.xml.dvc
Importing '.../tmp/dvc-import-url-example/data.xml' -> 'data/data.xml'
```

DVC notices the external data source has changed, and updates the `.dvc` file
(reproduces it). In this case it's also necessary to run `dvc repro` so that the
remaining pipeline results are also regenerated:

```cli
$ dvc repro
Running stage 'prepare' with command:
	python src/prepare.py data/data.xml
```

## Example: Transfer to remote storage

Sometimes there's not enough space in the local environment to import a large
dataset, but you still want to track it in the <abbr>project</abbr> so it can be
[pulled](/command-reference/plots) later.

As long as you have setup a `dvc remote` that can handle the data, this can be
achieved with the `--to-remote` flag. It creates an import `.dvc` file without
downloading anything, transferring a target directly to remote storage instead.

Let's import a `data.xml` file via HTTP straight "to remote":

```cli
$ dvc import-url https://data.dvc.org/get-started/data.xml data.xml \
                 --to-remote
...
$ ls
data.xml.dvc
```

Since a `.dvc` file is created in the <abbr>workspace</abbr>, whenever anyone
wants to actually download the data they can use `dvc pull`:

```cli
$ dvc pull data.xml.dvc
A       data.xml
1 file added
```

Use `dvc update --to-remote` to bring the import up to date in remote storage,
without downloading anything.

## Example: Tracking cloud version IDs

If your cloud storage path already has versioning enabled, DVC can use the cloud
version IDs to manage the data. Let's import versioned data from S3:

```dvc
$ dvc import-url --version-aware s3://mybucket/data
Importing 's3://mybucket/data' -> 'data'
```

Check `data.dvc` and note that it captures the `version_id` for each file:

```yaml
md5: 0c00504e8539cba57c523413d6f98df3
frozen: true
deps:
- path: s3://mybucket/data
  files:
  - size: 14445097
    version_id: LiVFgBb24qRRbn1o2DcAZhh4_M8Zy7FK
    etag: 22a1a2931c8370d3aeedd7183606fd7f
    relpath: data.xml
  ...
  - size: 6728772
    version_id: fLkcP.Dq0zl7CtKexohzyJCazSMk_R9C
    etag: 9ca281786366acca17632c27c5c5cc75
    relpath: prepared/train.tsv
outs:
- md5: 3ce9c43d5bead55bee0d3752fc1d68c5.dir
  size: 25115048
  nfiles: 5
  path: data
  push: false
```

DVC knows that your cloud storage is already versioning these files, so it won't
push them to the DVC remote.

```dvc
$ dvc push
Everything is up to date.
```

During `dvc pull`, these files will be pulled from their original source
location rather than the DVC remote.
