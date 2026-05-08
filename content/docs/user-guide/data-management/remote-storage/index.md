# Remote Storage

_DVC remotes_ provide access to external storage locations to track and share
your data and ML models. Usually, those will be shared between devices or team
members who are working on a project. For example, you can download data
artifacts created by colleagues without spending time and resources to
regenerate them locally. See also `dvc push` and `dvc pull`.

<admon type="info">

DVC remotes are similar to [Git remotes] (e.g. GitHub or GitLab hosting), but
for <abbr>cached</abbr> data instead of code.

[git remotes]: https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes

</admon>

DVC does not provide or recommend a specific storage service (unlike code
repos). You can bring your own platform from a wide variety of
[supported storage types](#supported-storage-types).

Main uses of remote storage:

- Synchronize large files and directories tracked by DVC.
- Centralize or distribute data storage for sharing and collaboration.
- Back up different versions of datasets and models (saving space locally).

<admon type="info">

DVC remotes are designed to share data referenced by a DVC project. If your data
platform is centered on petabyte-scale object storage, data lakes, or
lakehouses, consider [lakeFS](https://docs.lakefs.io/) for Git-like versioning
directly on that storage.

</admon>

## Configuration

You can set up one or more storage locations with `dvc remote` commands. These
read and write to the [`remote`] section of the project's config file
(`.dvc/config`), which you could edit manually as well.

For example, let's define a remote storage location on an S3 bucket:

[`remote`]: /user-guide/project-structure/configuration#remote

```cli
$ dvc remote add myremote s3://mybucket
```

<admon type="tip">

DVC reads existing configuration you may have locally for major cloud providers
(AWS, Azure, GCP) so that many times all you need to do is `dvc remote add`!

</admon>

You may also need to customize authentication or other config with
`dvc remote modify`:

```cli
$ dvc remote modify --local \
                    myremote credentialpath ~/.aws/alt
$ dvc remote modify myremote connect_timeout 300
```

<admon type="warn">

The `--local` flag is needed to write sensitive user info to a Git-ignored
config file (`.dvc/config.local`) so that no secrets are leaked (see
`dvc config`). This means that each copy of the <abbr>DVC repository</abbr> has
to re-configure these values.

</admon>

<details icon="book">

### Click to see the resulting config files.

```ini
# .dvc/config
['remote "myremote"']
    url = s3://my-bucket
    connect_timeout = 300
```

```ini
# .dvc/config.local
['remote "myremote"']
    credentialpath = ~/.aws/alt
```

```ini
# .gitignore
.dvc/config.local
```

</details>

Finally, you can `git commit` the changes to share the remote location with your
team.

## Supported storage types

### Cloud providers

- [Amazon S3] (AWS) and [S3-compatible] e.g. MinIO
- Microsoft [Azure Blob Storage]
- [Google Cloud Storage] (GCP)
- [Google Drive]
- [Aliyun OSS]

[amazon s3]: /user-guide/data-management/remote-storage/amazon-s3
[s3-compatible]:
  /user-guide/data-management/remote-storage/amazon-s3#s3-compatible-servers-non-amazon
[azure blob storage]:
  /user-guide/data-management/remote-storage/azure-blob-storage
[google cloud storage]:
  /user-guide/data-management/remote-storage/google-cloud-storage
[google drive]: /user-guide/data-management/remote-storage/google-drive
[aliyun oss]: /user-guide/data-management/remote-storage/aliyun-oss

### Self-hosted / On-premises

- [SSH] & SFTP (like `scp`)
- [HDFS] & [WebHDFS]
- [HTTP]
- [WebDAV]

[ssh]: /user-guide/data-management/remote-storage/ssh
[hdfs]: /user-guide/data-management/remote-storage/hdfs
[webhdfs]: /user-guide/data-management/remote-storage/hdfs#webhdfs
[http]: /user-guide/data-management/remote-storage/http
[webdav]: /user-guide/data-management/remote-storage/webdav

## File systems (local remotes)

<admon type="info">

Not related to the `--local` option of `dvc remote` and `dvc config`!

</admon>

You can also use system directories, mounted drives, network resources e.g.
network-attached storage (NAS), and other external devices as storage. We call
all these "local remotes".

<admon type="info">

Here, the word "local" refers to where the storage is found: typically another
directory in the same file system. And "remote" is how we call storage for
<abbr>DVC projects</abbr>.

</admon>

Using an absolute path (recommended because it's saved as-is in DVC config):

```cli
$ dvc remote add -d myremote /tmp/dvcstore
```

```ini
# .dvc/config
['remote "myremote"']
    url = /tmp/dvcstore
```

When using a relative path, it will be saved **relative to the config file
location**, but resolved against the current working directory.

```cli
$ dvc remote add -d myremote ../dvcstore
```

```ini
# .dvc/config
['remote "myremote"']
    url = ../../dvcstore
```
