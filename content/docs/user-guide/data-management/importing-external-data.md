# External Data

To version data that lives outside of your local <abbr>project</abbr>, you can
import it. You can choose whether to download that data and whether to push
copies to your [DVC remote]. This makes importing the data useful even if you
want to track the data in-place at its original source location.

<admon type="tip">

See
[external dependencies and outputs](/user-guide/pipelines/external-dependencies-and-outputs)
if you want to work with external data in a <abbr>pipeline</abbr>.

</admon>

## How importing external data works

Import external data using `import-url`:

```cli
$ dvc import-url https://data.dvc.org/get-started/data.xml
Importing 'https://data.dvc.org/get-started/data.xml' -> 'data.xml'
```

This downloads the file to `data.xml` (see
[Avoiding duplication](#avoiding-duplication) if you want to skip this step). It
also creates the `data.xml.dvc`file, which tracks the source data.

<details id="import-url-expand-to-see-resulting-dvc-file" icon="book">

### Expand to see resulting `.dvc` file

```yaml
# ...
deps:
  - etag: '"f432e270cd634c51296ecd2bc2f5e752-5"'
    path: https://data.dvc.org/get-started/data.xml
outs:
  - md5: a304afb96060aad90176268345e10355
    path: data.xml
    cache: true
    persist: false
```

DVC checks the headers returned by the server, looking for an
[HTTP ETag](https://en.wikipedia.org/wiki/HTTP_ETag) or a
[Content-MD5](https://datatracker.ietf.org/doc/html/rfc1864) header, and uses it
to determine whether the source has changed and we need to download the file
again.

</details>

To check the source location for updates, run `dvc update`:

```cli
$ dvc update data.xml.dvc
'data.xml.dvc' didn't change, skipping
```

During `dvc push`, DVC will upload the version of the data tracked by
`data.xml.dvc` to the [DVC remote] so that it is backed up in case you need to
recover it.

DVC will never overwrite the source location of the data. Instead, DVC can
checkout any version of that data locally. DVC is designed to protect the
original data from accidental overwrites or changes that might be unexpected to
other users, so you can recover old versions without losing what's currently
stored in the source location.

## Avoiding duplication

Making copies of the external data may be unnecessary and impractical in some
cases, like if your data is too big to download locally, or you stream it
directly from its source location, or you use cloud versioning to backup old
versions already.

Use `--no-download` to skip the download step when you import or update the
data. DVC will save the metadata in `data.xml.dvc` but won't download `data.xml`
locally:

```cli
$ dvc import-url --no-download https://data.dvc.org/get-started/data.xml
Importing 'https://data.dvc.org/get-started/data.xml' -> 'data.xml'

$ ls
data.xml.dvc
```

To recover this version of the data later, use `dvc pull`, and DVC will try to
download it from its original source location. However, if you have overwritten
the original source data, `dvc pull` may fail. To version the data so you can
recover any version, either push the data to the [DVC remote] or use [cloud
versioning].

### Example: Push to remote

`dvc import-url --to-remote` will not download the data locally but will push
the data to the [DVC remote]:

```cli
$ dvc import-url --to-remote https://data.dvc.org/get-started/data.xml

$ ls
data.xml.dvc

$ dvc push
Everything is up to date.
```

### Example: Cloud versioning

If you are importing from a supported [cloud versioning] provider,
`dvc import-url --no-download --version-aware` will not download the data
locally but will track the cloud provider's version IDs for the data. `dvc pull`
will try to download those version IDs as long as they are available. `dvc push`
will not upload anything because DVC assumes the versions are available at the
source location:

```cli
$ dvc import-url --no-download --version-aware s3://myversionedbucket/data.xml
Importing 's3://myversionedbucket/data.xml' -> 'data.xml'

$ ls
data.xml.dvc

$ dvc push
Everything is up to date.
```

[dvc remote]: /user-guide/data-management/remote-storage
[cloud versioning]: /user-guide/data-management/cloud-versioning
