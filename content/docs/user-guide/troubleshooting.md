# Troubleshooting

Here we provide help for some of the problems that DVC user might stumble upon.

<!--
This file uses a special engine feature for the following headers, so that a
custom anchor link is used. Just add {#custom-anchor} after each title:
-->

## Failed to pull data from the cloud {#missing-files}

Users may encounter errors when running `dvc pull` and `dvc fetch`, like
`WARNING: Cache 'xxxx' not found.` or
`ERROR: failed to pull data from the cloud`. The most common cause is changes
pushed to Git without the corresponding data being uploaded to the [DVC remote].
Make sure to `dvc push` from the original <abbr>project</abbr>, and try again.

[dvc remote]: /user-guide/data-management/remote-storage

## Too many open files error {#many-files}

A known problem some users run into with the `dvc pull`, `dvc fetch` and
`dvc push` commands is `[Errno 24] Too many open files` (most common for S3
remotes on macOS). The more `--jobs` specified, the more file descriptors need
to be open on the host file system for each download thread, and the limit may
be reached, causing this error.

To solve this, it's often possible to increase the open file descriptors limit,
with `ulimit` on UNIX-like system (for example `ulimit -n 1024`), or
[increasing Handles limit](https://learn.microsoft.com/en-us/archive/blogs/markrussinovich/pushing-the-limits-of-windows-handles)
on Windows. Otherwise, try using a lower `JOBS` value.

## Unable to find credentials {#no-credentials}

Make sure that you have your AWS credentials setup either through
[usual AWS configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
or by setting `access_key_id` and `secret_access_key` with `dvc remote modify`.

## Unable to connect {#connection-error}

Make sure you are online and able to access your
[AWS S3 endpoint](https://docs.aws.amazon.com/general/latest/gr/s3.html), or
`endpointurl` if explicitly set with `dvc remote modify`.

## Bucket does not exist {#no-bucket}

Make sure your bucket
[exists](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html)
in the correct `region` and/or `endpointurl` (see `dvc remote modify`).

## Unable to detect cache type {#no-dvc-cache}

Unable to detect supported link types, as the
[cache directory](/user-guide/project-structure/configuration#cache) doesn't
exist. It is usually created automatically by DVC commands that need it, but you
can create it manually (e.g. `mkdir .dvc/cache`) to enable this check.

## Unable to acquire lock {#lock-issue}

You may encounter an error message saying `Unable to acquire lock` if you have
another DVC process running in the project. If that is not the case, it usually
means that DVC was terminated abruptly and manually removing the lock file in
`.dvc/tmp/lock` should resolve the issue.

If the issue still persists then it may be the case that you are running DVC on
some network filesystem like NFS, Lustre, etc. If so, the solution is to enable
`core.hardlink_lock` which can be done by running following command:

```cli
$ dvc config core.hardlink_lock true
```

You can pass the `--wait-for-lock` option to DVC commands to make them wait for
the lock to be released instead of failing immediately.

## Cannot add files in symlinked directory {#add-symlink}

DVC only supports [symlinked files](/command-reference/add#add-symlink) as valid
targets for `dvc add`. If the target path is a directory symlink, or if the
target path contains any intermediate directory symlinks, `dvc add` will fail.

## No possible cache types {#cache-types}

You may encounter this error if DVC cannot find a valid
[file link type](/user-guide/data-management/large-dataset-optimization#file-link-types-for-the-dvc-cache)
to use when linking data files from cache into your workspace. To resolve the
issue, you may need to
[reconfigure](/user-guide/data-management/large-dataset-optimization#configuring-dvc-cache-file-link-type)
DVC to use alternative link types which are supported on your machine.

After reconfiguring cache types, you can re-link data files in your workspace
using:

```cli
$ dvc checkout --relink
```

## DVC cannot authenticate to Git remote {#git-auth}

Some commands require authenticating to a Git remote (for example,
[experiment sharing](/user-guide/experiment-management/sharing-experiments)).
You may need _write_ (`dvc exp push`) or _read_ (`dvc exp list`, `dvc exp pull`)
permissions.

Using SSH to authenticate is recommended. If you use HTTP, you can configure a
[Git credential helper] (like [Git Credential Manager]) to authenticate to
private HTTP Git remotes.

Commands like `dvc import` will clone a different Git repo than the one in which
you are working. In order for these commands to read from a credential helper,
it must be configured using `git config --global` or `git config --system`.

<admon type="tip">

If your SSH configuration includes [`UseKeychain` on macOS][usekeychain], you
will need to decrypt the SSH key and add it to the SSH agent for DVC to be able
to use it:

```
ssh-add --apple-load-keychain ~/.ssh/ed255
```

</admon>

[git credential helper]:
  https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage
[git credential manager]:
  https://github.com/git-ecosystem/git-credential-manager
[usekeychain]: https://github.com/treeverse/dvc-ssh/issues/20

## Could not open pickled 'index/md5/links' cache {#pickle}

You may encounter this error when using DVC on different Python versions with
the same <abbr>DVC project</abbr> directory, for example having created the
project on Python 3.8. in one environment and later attempting to update it from
a Python 3.7 env. This is due to temporary [internal directories] that can be
incompatible with older Python versions once created.

In these rare situations, it is safe to remove the corresponding tmp directory
and retry the DVC command. Specifically, one of:

- `.dvc/tmp/index`
- `.dvc/tmp/md5s`
- `.dvc/tmp/links`

[internal directories]: /user-guide/project-structure/internal-files

## DVC Experiments may fail in Git shallow clones {#git-shallow}

In `dvc<=2.45.1`, dvc exp` commands use internal Git operations which may not
work properly in
[shallow clones](https://git-scm.com/docs/git-clone#Documentation/git-clone.txt---depthltdepthgt).
Upgrade to a newer version of DVC to resolve these errors.
