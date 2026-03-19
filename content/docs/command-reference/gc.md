# gc

Remove unused files and directories from <abbr>cache</abbr> or [remote storage].

[remote storage]: /user-guide/data-management/remote-storage

## Synopsis

```usage
usage: dvc gc [-h] [-q | -v]
              [-w] [--rev <commit>] [-n <num>] [-a] [-T] [-A]
              [--date <YYYY-MM-DD>] [--all-experiments]
              [-p [<path> [<path> ...]]]
              [--not-in-remote]
              [-c] [-r <name>] [-j <number>] [-f] [--dry]
```

## Description

This command can delete (garbage collect) data files or directories that exist
in the <abbr>cache</abbr> but are no longer needed. With `--cloud`, it also
[removes data in remote storage](#removing-data-in-remote-storage).

To avoid accidentally deleting data, `dvc gc` doesn't do anything unless one or
a combination of scope options are provided (`--workspace`, `--all-branches`,
`--all-tags`, `--all-commits`, `--all-experiments`). Use these to indicate which
cached files are still needed. See the [Options](#options) section for more
details.

The data kept is determined by reading the <abbr>DVC files</abbr> in the set of
commits of the given scope.

> Note that `dvc gc` tries to fetch missing [`.dir` files] from remote storage
> to local cache in order to determine which files should exist inside cached
> directories. These files may be missing if the cache was previously garbage
> collected, in a newly cloned copy of the repo, etc.

Unless the `--cloud` option is used, any files collected from the cache can be
restored using `dvc fetch`, as long as they have been previously uploaded with
`dvc push`.

[`.dir` files]:
  /user-guide/project-structure/internal-files#structure-of-the-cache-directory

### Removing data in remote storage

If the `--cloud` (`-c`) flag is used, this command deletes unused data from the
`dvc remote default` **in addition** to deleting it from the local DVC cache. To
specify a DVC remote to delete from, use the `--remote` (`-r`) option.

<admon type="warn">

Cloud deletion is irreversible unless there is another DVC remote or a manual
backup with the same data.

</admon>

### Cleaning shared cache (or remote)

If a [cache is shared] among different projects that track some of the same
files, using `dvc gc` in one project will break those overlapping data links in
the other projects.

To prevent this, use the `--projects` (`-p`) option. It takes one or more paths
to the DVC project(s) whose data should be preserved. Make sure that all the
commits and branches that reference files you want to keep have been pulled in
those other projects first.

This works together with `--all-branches --num <num>` as well. In that case,
`dvc gc` preserves the union of objects referenced by the last `<num>` commits
from each branch tip across the current project and any projects passed with
`--projects`.

For example, if we have several projects with some overlapping files and we'd
like to collect all the data that's only used in one of them (e.g. if we no
longer need that project), we would first clone all the other projects, fetch
all their branches, and pass their paths to the `dvc gc -p` command from the
project we want to clear.

[cache is shared]: /user-guide/how-to/share-a-dvc-cache

## Options

- `-w`, `--workspace` - keep _only_ files and directories referenced in the
  workspace. This option is enabled automatically with the other scope options
  (below).

- `--rev <commit>` - keep cached data referenced in the specified `<commit>`, as
  well as in the workspace (implying `-w`).

- `-n <num>`, `--num <num>` - keep cached data referenced in the last `--num`
  commits starting from each selected revision root, as well as in the workspace
  (implying `-w`). Can be used with `--rev <commit>` and `--all-branches`. It
  cannot be used with `--all-tags` alone.

- `-a`, `--all-branches` - keep cached data referenced in all Git branches, as
  well as in the workspace (implying `-w`). Useful if branches are used to track
  different experiments. When combined with `-n`, this keeps cached data
  referenced in the last `--num` commits from each branch tip. Note that this
  can be combined with `-T` below, for example using the `-aT` flags.

- `-T`, `--all-tags` - keep cached data referenced in all Git tags, as well as
  in the workspace (implying `-w`). Useful if tags are used to mark certain
  versions of an experiment or project. Note that this can be combined with `-a`
  above, for example using the `-aT` flags. If used together with `-a --num`,
  `--num` only affects branches, not tags.

- `-A`, `--all-commits` - keep cached data referenced in all\* Git commits, as
  well as in the workspace (implying `-w`). This preserves the cache for all
  data used in the entire commit history of the project.

  A use case for this option is to safely delete all temporary data
  `dvc exp run` and/or `dvc repro` cache when used without committing changes
  (see the `-O` or `-M`, and `--no-commit` options in those commands). In that
  scenario, data that is never referenced from the workspace or from any Git
  commit can still be stored in the project's cache).

  > \* Not including [DVC experiments]

- `--date <YYYY-MM-DD>` - Keep experiments from any commits on of after a
  certain date. Argument `<YYYY-MM-DD>` expects a date in the [ISO 8601] format.

- `--all-experiments` keep cached objects referenced in all [DVC experiments],
  as well as in the workspace (implying `-w`). This preserves the project's
  [experimental] data.

- `-p <paths>`, `--projects <paths>` - if a single remote or a single [cache is
  shared] among different projects, this option can be used to specify a list of
  them (each project is a path) to keep data that is currently referenced from
  them.

- `--not-in-remote` - keep cached objects that are _not_ in the remote. This
  will remove the objects from the local cache that have been pushed and are
  present in the remote.

  For objects using the
  [`remote` field](/user-guide/project-structure/dvc-files#output-entries), the
  check will be against that remote.

  For objects not using the
  [`remote` field](/user-guide/project-structure/dvc-files#output-entries), the
  check will be against the default remote unless a specific one is given with
  `-r`.

- `-c`, `--cloud` - remove files in remote storage in addition to local cache.

  <admon type="warn">

  This option is dangerous. Read the description carefully.

  </admon>

  For objects **using** the
  [`remote` field](/user-guide/project-structure/dvc-files#output-entries), the
  check will be against that remote. Any other files **not using** the `remote`
  field may be deleted from that remote.

  For objects **not using** the
  [`remote` field](/user-guide/project-structure/dvc-files#output-entries), the
  check will be against the default remote unless a specific one is given with
  `-r`. Any other files **using** the `remote` field may be deleted from that
  remote.

- `-r <name>`, `--remote <name>` - name of the `dvc remote` to collect unused
  objects from if `-c` option is specified (see `dvc remote list`).

- `-j <number>`, `--jobs <number>` - parallelism level for DVC to access data
  from remote storage. This only applies when the `--cloud` option is used, or a
  `--remote` is given. The default value is `4 * cpu_count()`. Note that the
  default value can be set using the `jobs` config option with
  `dvc remote modify`. Using more jobs may speed up the operation.

  > For now only some phases of garbage collection are parallel.

- `-f`, `--force` - force garbage collection. Skip confirmation prompt.

- `--dry` - Only print what would get removed without actually removing.

- `-h`, `--help` - prints the usage/help message, and exit.

- `-q`, `--quiet` - do not write anything to standard output. Exit with 0 if no
  problems arise, otherwise 1.

- `-v`, `--verbose` - displays detailed tracing information.

[dvc experiments]: /user-guide/experiment-management#experiments
[iso 8601]: https://www.iso.org/iso-8601-date-and-time-format.html
[experimental]: /user-guide/experiment-management

## Examples

Basic example of cleaning up the <abbr>cache</abbr>:

```cli
$ du -sh .dvc/cache/
7.4G    .dvc/cache/
```

When you run `dvc gc --workspace`, DVC removes all objects from cache that are
not referenced in the <abbr>workspace</abbr> (by collecting hash values from the
<abbr>DVC files</abbr>):

```cli
$ dvc gc --workspace

'.dvc/cache/files/md5/27e30965256ed4d3e71c2bf0c4caad2e' was removed
'.dvc/cache/files/md5/2e006be822767e8ba5d73ebad49ef082' was removed
'.dvc/cache/files/md5/2f412200dc53fb97dcac0353b609d199' was removed
'.dvc/cache/files/md5/541025db4da02fcab715ca2c2c8f4c19' was removed
'.dvc/cache/files/md5/62f8c2ba93cfe5a6501136078f0336f9' was removed
'.dvc/cache/files/md5/7c4521365288d69a03fa22ad3d399f32' was removed
'.dvc/cache/files/md5/9ff7365a8256766be8c363fac47fc0d4' was removed
'.dvc/cache/files/md5/a86ca87250ed8e54a9e2e8d6d34c252e' was removed
'.dvc/cache/files/md5/f64d65d4ccef9ff9d37ea4cf70b18700' was removed
```

Let's check the size now:

```cli
$ du -sh .dvc/cache/
3.1G    .dvc/cache/
```

To keep the last 2 commits from every branch tip while cleaning a shared cache
used by multiple repos:

```cli
$ dvc gc --all-branches --num 2 --projects ../repo-a ../repo-b --force
```

This preserves the union of cache objects needed by the current repo and the
listed projects for the last 2 commits reachable from each branch tip.
