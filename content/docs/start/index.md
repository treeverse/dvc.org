---
title: 'Get Started with DVC'
description: 'Get a quick introduction to the major features of DVC for data
science and machine learning projects: version data, access it anywhere, capture
pipelines and metrics, and manage experiments.'
---

# Get Started with DVC

<!--
## Get Started with DVC
-->

<details icon="video">

### Click to watch a video intro.

https://youtu.be/kLKBcPonMYw

</details>

How cool would it be to track large datasets and machine learning models
alongside your code, sidestepping all the limitations of storing it in Git?
Imagine cloning a repository and immediately seeing your datasets, checkpoints
and models staged in your workspace. Imagine switching to a different version of
a 100Gb file in less than a second with a `git checkout`.

_💫 DVC is your *"Git for data"*!_

## Installing DVC

First things first, let's install DVC. The easiest way to install dvc is with
[`uv`](https://docs.astral.sh/uv/) or [`pipx`](https://pipx.pypa.io/stable/):

```cli
$ uv tool install dvc  # or,
$ pipx install dvc
```

Once it's installed, verify dvc is available by running:

```cli
$ dvc --help
```

If you see a help message listing dvc commands, you are good to continue!

<admon type="tip">

See the [Installation Guide](/install) for more installation options.

</admon>

## Initializing a project

Before we begin, settle on a directory for this guide. Everything we will do
will be self contained there.

<details icon="gear">

### Expand to prepare a project.

Imagine we want to build an ML project from scratch. Let's start by creating a
Git repository:

```cli
$ mkdir example-get-started
$ cd example-get-started
$ git init
```

<admon type="info">

This directory name is used in our
[example-get-started](https://github.com/treeverse/example-get-started) repo.

</admon>

</details>

Inside your chosen directory, we will use our current working directory as a
<abbr>DVC project</abbr>. Let's initialize it by running `dvc init` inside a Git
project:

```cli
$ dvc init
```

A few [internal files](/user-guide/project-structure/internal-files) are created
that should be added to Git:

```cli
$ git status
Changes to be committed:
        new file:   .dvc/.gitignore
        new file:   .dvc/config
        ...
$ git commit -m "Initialize DVC"
```

Now you're ready to DVC!

## Tracking data

Working inside an [initialized project](/start#initializing-a-project)
directory, let's pick a piece of data to work with. We'll use an example
`data.xml` file, though any text or binary file (or directory) will do. Start by
running:

```cli
$ dvc get https://github.com/treeverse/dataset-registry \
          get-started/data.xml -o data/data.xml
```

<admon type="info">

We used `dvc get` above to show how DVC can turn any Git repo into a "[data
registry]". `dvc get` can download any file or directory tracked in a <abbr>DVC
repository</abbr>.

[data registry]: /example-scenarios/data-registry

</admon>

Use `dvc add` to start tracking the dataset file:

```cli
$ dvc add data/data.xml
```

DVC stores information about the added file in a special `.dvc` file named
`data/data.xml.dvc`. This small, human-readable metadata file acts as a
placeholder for the original data for the purpose of Git tracking.

Next, run the following commands to track changes in Git:

```cli
$ git add data/data.xml.dvc data/.gitignore
$ git commit -m "Add raw data"
```

Now the _metadata about your data_ is versioned alongside your source code,
while the original data file was added to `.gitignore`.

<details id="add-click-to-get-a-peek-under-the-hood" icon="bulb">

### Expand to get a peek under the hood

`dvc add` moved the data to the project's <abbr>cache</abbr>, and
<abbr>linked</abbr> it back to the <abbr>workspace</abbr>. The `.dvc/cache` will
look like this:

```
.dvc/cache/files/md5
└── 22
    └── a1a2931c8370d3aeedd7183606fd7f
```

The hash value of the `data.xml` file we just added (`22a1a29...`) determines
the cache path shown above. And if you check `data/data.xml.dvc`, you will find
it there too:

```yaml
outs:
  - md5: 22a1a2931c8370d3aeedd7183606fd7f
    path: data.xml
```

</details>

## Storing and sharing

You can upload DVC-tracked data to a variety of storage systems (remote or
local) referred to as ["remotes"](/user-guide/data-management/remote-storage).
For simplicity, we will use a "local remote" for this guide, which is just a
directory in the local file system.

### Configuring a remote

Before pushing data to a remote we need to set it up using the `dvc remote add`
command:

<toggle>

<tab title="Mac/Linux">

```cli
$ mkdir /tmp/dvcstore
$ dvc remote add -d myremote /tmp/dvcstore
```

</tab>
<tab title="Windows (Cmd)">

```cli
$ mkdir %TEMP%/dvcstore
$ dvc remote add -d myremote %TEMP%\dvcstore
```

</tab>
</toggle>

<admon icon="info">

DVC supports many remote [storage types], including Amazon S3, NFS, SSH, Google
Drive, Azure Blob Storage, and HDFS.

An example for a common use case is configuring an [Amazon S3] remote:

```cli
$ dvc remote add -d storage s3://mybucket/dvcstore
```

For this to work, you'll need an AWS account and credentials set up to allow
access.

To learn more about storage remotes, see the [Remote Storage Guide].

[Amazon S3]: /user-guide/data-management/remote-storage/amazon-s3
[storage types]:
  /user-guide/data-management/remote-storage#supported-storage-types
[Remote Storage Guide]: /user-guide/data-management/remote-storage

</admon>

</details>

### Uploading data

Now that a storage remote was configured, run `dvc push` to upload data:

```cli
$ dvc push
```

<details id="push-click-to-get-a-peek-under-the-hood" icon="bulb">

#### Expand to get a peek under the hood

`dvc push` copied the data <abbr>cached</abbr> locally to the remote storage we
set up earlier. The remote storage directory should look like this:

```
.../dvcstore/files/md5
└── 22
    └── a1a2931c8370d3aeedd7183606fd7f
```

</details>

Usually, we would also want to Git track any code changes that led to the data
change ( `git add`, `git commit` and `git push` ).

### Retrieving data

Once DVC-tracked data and models are stored remotely, they can be downloaded
with `dvc pull` when needed (e.g. in other copies of this <abbr>project</abbr>).
Usually, we run it after `git pull` or `git clone`.

Let's try this now:

```cli
$ dvc pull
```

<details>

#### Expand to simulate a "fresh pull"

After running `dvc push` above, the `dvc pull` command afterwards was
short-circuited by DVC for efficiency. The project's `data/data.xml` file, our
<abbr>cache</abbr> and the remote storage were all already in sync. We need to
empty the <abbr>cache</abbr> and delete `data/data.xml` from our project if we
want to have DVC actually moving data around. Let's do that now:

<toggle>
<tab title="Mac/Linux">

```cli
$ rm -rf .dvc/cache
$ rm -f data/data.xml
```

</tab>
<tab title="Windows (Cmd)">

```cli
$ rmdir .dvc\cache
$ del data\data.xml
```

</tab>
</toggle>

Now we can run `dvc pull` to retrieve the data from the remote:

```cli
$ dvc pull
```

</details>

## Making local changes

Next, let's say we obtained more data from some external source. We will
simulate this by doubling the dataset contents:

<toggle>
<tab title="Mac/Linux">

```cli
$ cp data/data.xml /tmp/data.xml
$ cat /tmp/data.xml >> data/data.xml
```

</tab>
<tab title="Windows (Cmd)">

```cli
$ copy data\data.xml %TEMP%\data.xml
$ type %TEMP%\data.xml >> data\data.xml
```

</tab>
</toggle>

After modifying the data, run `dvc add` again to track the latest version:

```cli
$ dvc add data/data.xml
```

Now we can run `dvc push` to upload the changes to the remote storage, followed
by a `git commit` to track them:

```cli
$ dvc push
$ git commit data/data.xml.dvc -m "Dataset updates"
```

## Switching between versions

A commonly used workflow is to use `git checkout` to switch to a branch or
checkout a specific `.dvc` file revision, followed by a `dvc checkout` to sync
data into your <abbr>workspace</abbr>:

```cli
$ git checkout <...>
$ dvc checkout
```

## Return to a previous version of the dataset

Let's go back to the original version of the data:

```cli
$ git checkout HEAD~1 data/data.xml.dvc
$ dvc checkout
```

Let's commit it (no need to do `dvc push` this time since this original version
of the dataset was already saved):

```cli
$ git commit data/data.xml.dvc -m "Revert dataset updates"
```

<admon type="info">

As you can see, DVC is technically not a version control system by itself! It
manipulates `.dvc` files, whose contents define the data file versions. Git is
already used to version your code, and now it can also version your data
alongside it.

</admon>

## Following This Guide

To help you understand and use DVC better, consider the following three example
scenarios: **data pipelines**, **experiment tracking** and **model management**.
You may pick any to start learning about how DVC helps you "solve" that
scenario!

Choose a trail to jump into its first chapter:

- **[Data Pipelines]** - Use DVC as a build system for reproducible, data driven
  pipelines.

- **[Experiment Management]** - Easily track your experiments and their progress
  by only instrumenting your code, and collaborate on ML experiments like
  software engineers do for code.

- **Model Registry** - Use the DVC model registry to manage the lifecycle of
  your models in an auditable way. Easily access your models and integrate your
  model registry actions into CICD pipelines to follow GitOps best practices.

[Data Pipelines]: /start/data-pipelines/data-pipelines
[Experiment Management]: /start/experiments/experiment-tracking
