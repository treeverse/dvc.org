---
title: 'How to Stop Tracking Data'
description: 'You can "un-track" files or directories added in error.'
---

# How to Stop Tracking Data

There are situations where you may want to "un-track" files or directories added
in error to DVC.

<details icon="book">

### Expand to add a sample data `data.csv` file

`dvc add` creates a `.dvc` file to track the file, and lists it in `.gitignore`:

```cli
$ dvc add data.csv

$ ls
data.csv    data.csv.dvc
$ cat .gitignore
/data.csv
```

</details>

Let's undo `dvc add` with `dvc remove`. This deletes the `.dvc` file (and
corresponding `.gitignore` entry). The data file is now no longer being tracked
after this:

```cli
$ dvc remove data.csv.dvc

$ git status
    Untracked files:
        data.csv
```

You can run `dvc gc` with the `-w` option to remove the data (and all of it's
previous versions, if any) from the <abbr>cache</abbr>:

```cli
$ dvc gc -w
```

> Note that a very similar procedure works for `dvc.yaml` stages and their
> outputs.
