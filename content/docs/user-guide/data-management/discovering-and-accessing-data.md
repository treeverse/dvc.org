# Discovering and accessing data

Assuming you've learned the basics of how to [track and version data](/start)
with DVC, you might wonder: How can we access and use these
<abbr>artifacts</abbr> _outside_ of the DVC project? How do we download a model
to deploy it? How to download a specific version of a model? How to reuse
datasets across different projects?

<admon type="tip">

These questions tend to come up when you browse the files that DVC saves to
[remote storage] (e.g.
`s3://dvc-public/remote/get-started/fb/89904ef053f04d64eafcc3d70db673` 😱
instead of the original file name such as `model.pkl` or `data.xml`).

[remote storage]: /user-guide/data-management/remote-storage

</admon>

<details>

### 🎬 Click to watch a video about sharing data and models

https://youtu.be/EE7Gk84OZY8

</details>

Remember those `.dvc` files `dvc add` generates? Those files (and `dvc.lock`)
have their history in Git. DVC's remote storage config is also saved in Git, and
contains all the information needed to access and download any version of
datasets, files, and models. It means that a Git repository with <abbr>DVC
files</abbr> becomes an entry point, and can be used instead of accessing files
directly.

## Find a file or directory

You can use `dvc list` to explore a <abbr>DVC repository</abbr> hosted on any
Git server. For example, let's see what's in the `get-started/` directory of our
[dataset-registry](https://github.com/treeverse/dataset-registry) repo:

```cli
$ dvc list https://github.com/treeverse/dataset-registry get-started
.gitignore
data.xml
data.xml.dvc
```

The benefit of this command over browsing a Git hosting website is that the list
includes files and directories tracked by both Git and DVC (`data.xml` is not
visible if you
[check GitHub](https://github.com/treeverse/dataset-registry/tree/master/get-started)).

## Download

One way is to simply download the data with `dvc get`. This is useful when
working outside of a <abbr>DVC project</abbr> environment, for example in an
automated ML model deployment task:

```cli
$ dvc get https://github.com/treeverse/dataset-registry \
          use-cases/cats-dogs
```

When working inside another DVC project though, this is not the best strategy
because the connection between the projects is lost — others won't know where
the data came from or whether new versions are available.

## Import file or directory

`dvc import` also downloads any file or directory, while also creating a `.dvc`
file (which can be saved in the project):

```cli
$ dvc import https://github.com/treeverse/dataset-registry \
             get-started/data.xml -o data/data.xml
```

This is similar to `dvc get` + `dvc add`, but the resulting `.dvc` files
includes metadata to track changes in the source repository. This allows you to
bring in changes from the data source later using `dvc update`.

<details>

### 💡 Expand to get a peek under the hood

<admon type="info">

The [dataset registry] repository doesn't actually contain a
`get-started/data.xml` file. Like `dvc get`, `dvc import` downloads from [remote
storage].

[dataset registry]: https://github.com/treeverse/dataset-registry

</admon>

`.dvc` files created by `dvc import` have special fields, such as the data
source `repo` and `path` (under `deps`):

```git
+deps:
+- path: get-started/data.xml
+  repo:
+    url: https://github.com/treeverse/dataset-registry
+    rev_lock: 96fdd8f12c14fa58a1b7354f15c7adb50e4e8542
 outs:
 - md5: 22a1a2931c8370d3aeedd7183606fd7f
   path: data.xml
```

The `url` and `rev_lock` subfields under `repo` are used to save the origin and
[version](https://git-scm.com/docs/revisions) of the dependency, respectively.

</details>

## Python API

It's also possible to integrate your data or models directly in source code with
DVC's [Python API](/api-reference). This lets you access the data contents
directly from within an application at runtime. For example:

```py
import dvc.api

with dvc.api.open(
    'get-started/data.xml',
    repo='https://github.com/treeverse/dataset-registry'
) as f:
    # f is a file-like object which can be processed normally
```

## Artifacts

You can add aliases and metadata for files and directories under the
<abbr>artifacts</abbr> section of
[`dvc.yaml`](/user-guide/project-structure/dvcyaml-files#artifacts). This can
help you organize your artifacts, and you can use `dvc artifacts get` and
`dvc.api.artifacts_show()` to retrieve them by their alias rather than their
path.

## Model/Artifact Registry

<admon type="tip">

The DVC Studio model registry was built for models but since DVC tracks all
kinds of files, it can be used just as easily for other artifact types. See our
[tutorial] for how to manage artifacts using the registry.

</admon>

Artifacts become more useful as part of the <abbr>model registry</abbr>, where
semantic versions can be registered and lifecycle stages (think
`dev`/`test`/`prod`) can be assigned using Git tags managed by
[GTO](https://mlem.ai/doc/gto). These tags give you a full history of your model
lifecycle in Git and enable you to trigger CICD workflows based on changes in
the model registry. With [DVC Studio], you can see models and their metadata
across all projects, and you can download artifacts by name, version, and
lifecycle stage, without needing to configure access to the underlying Git
repository or remote storage.

[tutorial]: /use-cases/data-registry/tutorial#sharing-and-managing-artifacts
