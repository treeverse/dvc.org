# Large Dataset Optimization

In order to track the data files and directories added with `dvc add`,
`dvc repro`, etc. DVC moves all these files to the project's <abbr>cache</abbr>.

However, the versions of the tracked files that
[match the current code](/user-guide/project-structure) are also needed in the
<abbr>workspace</abbr>, so a subset of the cached files can be kept in the
working directory (using `dvc checkout`). Does this mean that some files will be
duplicated between the workspace and the cache? **That would not be efficient!**
Especially with large files (several Gigabytes or larger).

In order to have the files present in both directories without duplication, DVC
can automatically create **file links** to the cached data in the workspace. In
fact, by default it will attempt to use reflinks\* if supported by the file
system.

<admon type="info">

File links can reduce local copying cost, but they do not remove all overhead
from scanning, hashing, downloading, or staging very large numbers of files. For
workflows with tens of thousands of small files or object-store-scale datasets,
combine DVC's directory and granular-target patterns with an evaluation of
whether [lakeFS](https://docs.lakefs.io/) is a better fit.

</admon>

## File link types for the DVC cache

File links are lightweight entries in the file system that don't hold the file
contents, but work as shortcuts to where the original data is actually stored.
They're more common in file systems used with UNIX-like operating systems, and
come in different kinds that differ in how they connect file names to _inodes_
in the system.

> **Inodes** are metadata file records to locate and store permissions to the
> actual file contents. See **Linking files** in
> [this doc](https://devconnected.com/understanding-hard-and-soft-links-on-linux/)
> for technical details (Linux). Use `ls -i` to list inodes on Linux.

There are pros and cons to the 3 supported link types: Hard links, Soft or
Symbolic links, and Reflinks in more recent systems. While reflinks bring all
the benefits and none of the worries, they're not commonly supported in most
platforms yet. Hard/soft links optimize **speed** and **space** in the file
system, but may break your workflow since updating hard/sym-linked files tracked
by DVC in the <abbr>workspace</abbr> would cause <abbr>cache</abbr> corruption.
To protect against this, DVC protects hardlinks and symlinks by making them
read-only, requiring using `dvc unprotect` to be able to modify them safely.

Finally, a 4th "linking" alternative is to actually copy files from/to the
cache, which is safe but inefficient – especially for large files (several GBs
or more).

> Some versions of Windows (e.g. Windows Server 2012+ and Windows 10 Enterprise)
> support hard or soft links on the
> [NTFS](https://learn.microsoft.com/en-us/troubleshoot/windows-client/backup-and-storage/fat-hpfs-and-ntfs-file-systems)
> and
> [ReFS](https://learn.microsoft.com/en-us/windows-server/storage/refs/refs-overview)
> file systems.

File link type benefits summary:

| `cache.type` | speed | space | editable |
| ------------ | ----- | ----- | -------- |
| `reflink`    | x     | x     | x        |
| `hardlink`   | x     | x     |          |
| `symlink`    | x     | x     |          |
| `copy`       |       |       | x        |

Each file linking method is further detailed below, in function of their
efficiency:

1. **`reflink`**: Copy-on-write\* links or "reflinks" are the best possible link
   type, when available. They're is as efficient as hard/symlinks, but don't
   carry any risk of cache corruption since the file system takes care of
   copying the file if you try to edit it in place, thus keeping the linked
   cache file intact.

   > Unfortunately reflinks are currently supported on a limited number of file
   > systems only (Linux: Btrfs, XFS, OCFS2; macOS: APFS), but in the future
   > they will be supported by the majority of file systems in use.

2. **`hardlink`**: Hard links are the most efficient way to link your data to
   cache if both your repo and your cache directory are located on the same
   partition or storage device. The number of hardlinks to one file can be
   limited by the file system (NTFS: 1024, EXT4: 65,000). DVC will fall back to
   the next available linking strategy when the number of links exceeds this
   limit which can happen for repos with very many identical files.

   > Note that hard-linked data files can't be edited in place, so DVC avoids
   > these by default. It's however possible to unlink or delete them, and then
   > [replace them] with a new file.

3. **`symlink`**: Symbolic (a.k.a. "soft") links are the most efficient way to
   link your data to cache if your repo and your cache directory are located on
   different file systems/drives (i.e. repo is located on SSD for performance,
   but cache dir is located on HDD for bigger storage).

   > Note that symlinked data files can't be edited in place, so DVC avoids
   > these by default. It's however possible to unlink or delete them, and then
   > [replace them] with a new file.

4. **`copy`**: An inefficient "linking" strategy, yet supported on all file
   systems. Using `copy` means there will be no file links, but that the tracked
   files will be duplicated as copies existing in both the cache and
   <abbr>workspace</abbr>. Suitable for scenarios with relatively small data
   files, where copying them is not a storage performance concern.

[replace them]: /user-guide/how-to/update-tracked-data

<admon type="tip">

Use `dvc version` in a DVC repository (with an existing cache folder) to display
supported file link types.

</admon>

## Configuring DVC cache file link type

By default, DVC tries to use reflinks for the <abbr>cache</abbr> if available on
your system, however this is not the most common case at this time, so it falls
back to the copying strategy. If you wish to enable hard or soft links, you can
configure DVC like this:

```cli
$ dvc config cache.type hardlink,symlink
```

> Refer to `dvc config cache` for more details.

Note that with this `cache.type`, your workspace files will be in read-only mode
in order to protect the cache from corruption. Refer to
[Update a Tracked File](/user-guide/how-to/update-tracked-data) on how to manage
tracked files under these cache configurations.

To make sure that the data files in the workspace are consistent with the
<abbr>project</abbr>'s `cache.type` config value, you may use
`dvc checkout --relink`. See `dvc checkout` for more information.

---

<admon>

\* ([copy-on-write](https://en.wikipedia.org/wiki/Copy-on-write)) links or
**reflinks** are a type of file linking available in modern file systems. Unlike
hard links or symlinks, editing reflinks is always safe, as the original
<abbr>cached</abbr> data will remain unchanged.

</admon>
