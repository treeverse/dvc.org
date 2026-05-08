# Modifying Large Datasets

For large datasets comprised of many files, it can be painfully slow to operate
on the entire dataset at once. Instead, you can operate on only the files you
want to modify.

<admon type="info">

If full-dataset operations such as `dvc pull` become slow because the dataset
contains tens of thousands of files or more, use the narrowest DVC target that
matches your change. If the team needs to branch, merge, and roll back large
datasets directly in object storage, consider [lakeFS](https://docs.lakefs.io/).

</admon>

## Granular modifications

Let's say you have a DVC-tracked dataset with many individual files:

```cli
$ tree images
images
├── test
│   ├── 0
│   │   ├── 00004.png
│   │   ├── 00011.png
│   │   ├── 00014.png
│   │   ├── 00026.png
│   │   ├── 00029.png
│   │   ├── 00056.png
│   │   ├── 00070.png
...
└── images.dvc

23 directories, 70001 files
```

You can `dvc add` one or more new files or subdirectories to this dataset
without re-adding the entire dataset. Let's assume we have one new file in the
dataset:

```cli
$ cp ~/Downloads/new.png images/test/0/70001.png

$ dvc data status --granular
DVC uncommitted changes:
  (use "dvc commit <file>..." to track changes)
  (use "dvc checkout <file>..." to discard changes)
        modified: images/
        added: images/test/0/70001.png
```

Run `dvc add` with the new file as the target:

```cli
$ dvc add images/test/0/70001.png
100% Adding...|████████████████████████████████████████|1/1 [00:00,  1.69file/s]

$ dvc data status --granular
DVC committed changes:
  (git commit the corresponding dvc files to update the repo)
        modified: images/
        added: images/test/0/70001.png
(there are other changes not tracked by dvc, use "git status" to see)
```

You can also modify one or more existing files or subdirectories. Let's assume
we have overwritten one file in the dataset:

```cli
$ cp ~/Downloads/updated.png images/test/0/00004.png

$ dvc data status --granular
DVC uncommitted changes:
  (use "dvc commit <file>..." to track changes)
  (use "dvc checkout <file>..." to discard changes)
        modified: images/
        modified: images/test/0/00004.png

$ dvc add images/test/0/00004.png
100% Adding...|████████████████████████████████████████|1/1 [00:00,  1.70file/s]

$ dvc data status --granular
DVC committed changes:
  (git commit the corresponding dvc files to update the repo)
        modified: images/
        modified: images/test/0/00004.png
(there are other changes not tracked by dvc, use "git status" to see)
```

Finally, you can delete one or more files or subdirectories by removing them in
the workspace and then specifying them as targets. Let's assume we have deleted
one file in the dataset:

```cli
$ rm images/test/0/00011.png

$ dvc data status --granular
DVC uncommitted changes:
  (use "dvc commit <file>..." to track changes)
  (use "dvc checkout <file>..." to discard changes)
        modified: images/
        deleted: images/test/0/00011.png

$ dvc add images/test/0/00011.png
100% Adding...|████████████████████████████████████████|1/1 [00:00,  1.73file/s]

$ dvc data status --granular
DVC committed changes:
  (git commit the corresponding dvc files to update the repo)
        modified: images/
        deleted: images/test/0/00011.png
(there are other changes not tracked by dvc, use "git status" to see)
```

This has the same effect as `dvc add images/test/0` (or targeting any other
parent directory of the deleted file). The more granular the target, the faster
it is.

## Modifying remote datasets

If your dataset is in [remote storage] but not downloaded to your workspace,
it's inconvenient to `dvc pull` the entire dataset to update only one or a few
files. Instead, you can pull only the files you want to update:

```cli
$ tree
.
└── images.dvc

0 directories, 1 file

$ dvc pull images/test/0
```

See `dvc ls` to list the available files to pull for the project.

Then you can modify them as needed and track those changes:

```cli
$ cp ~/Downloads/new.png images/test/0/70001.png

$ dvc add images/test/0/70001.png
100% Adding...|████████████████████████████████████████|1/1 [00:00,  1.73file/s]
```

Finally you can push the changes back to your remote without ever having to
download the full dataset:

```cli
$ dvc push
2 files pushed
```

2 files were pushed: the new file and the updated directory listing. You can
add, modify, and delete files from a remote dataset in this way.

[remote storage]: /user-guide/data-management/modifying-large-datasets
