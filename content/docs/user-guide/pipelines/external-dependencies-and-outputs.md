# External Dependencies and Outputs

Sometimes you need to stream your data dependencies directly from their source
locations outside your local <abbr>project</abbr>, or stream your data outputs
directly to some external location, like cloud storage or HDFS.

<admon type="tip">

To version external data without a pipeline, see
[importing external data](/user-guide/data-management/importing-external-data).

</admon>

## How external dependencies work

External <abbr>dependencies</abbr> will be tracked by DVC, detecting when they
change (triggering stage executions on `dvc repro`, for example).

To define files or directories in an external location as <abbr>stage</abbr>
dependencies, specify their remote URLs or external paths in `dvc.yaml` (`deps`
field). Use the same format as the `url` of of the following supported
`dvc remote` types/protocols:

- Amazon S3
- Microsoft Azure Blob Storage
- Google Cloud Storage
- SSH
- HDFS
- HTTP
- Local files and directories outside the <abbr>workspace</abbr>

### Examples

Let's take a look at defining and running a `download_file` stage that simply
downloads a file from an external location, on all the supported location types.

> See the [Remote alias example](#using-dvc-remote-aliases) for info. on using
> remote locations that require manual authentication setup.

<details>

#### Amazon S3

```cli
$ dvc stage add -n download_file \
          -d s3://mybucket/data.txt \
          -o data.txt \
          aws s3 cp s3://mybucket/data.txt data.txt
```

</details>

<details>

#### Microsoft Azure Blob Storage

```cli
$ dvc stage add -n download_file \
          -d azure://mycontainer/data.txt \
          -o data.txt \
          az storage copy \
                     -d data.json \
                     --source-account-name my-account \
                     --source-container mycontainer \
                     --source-blob data.txt
```

</details>

<details>

#### Google Cloud Storage

```cli
$ dvc stage add -n download_file \
          -d gs://mybucket/data.txt \
          -o data.txt \
          gsutil cp gs://mybucket/data.txt data.txt
```

</details>

<details>

#### SSH

```cli
$ dvc stage add -n download_file \
          -d ssh://user@example.com/path/to/data.txt \
          -o data.txt \
          scp user@example.com:/path/to/data.txt data.txt
```

<admon type="warn">

DVC requires both SSH and SFTP access to work with SSH remote storage. Check
that you can connect both ways with tools like `ssh` and `sftp` (GNU/Linux).  
Note that your server's SFTP root might differ from its physical root (`/`).

</admon>

</details>

<details>

#### HDFS

```cli
$ dvc stage add -n download_file \
          -d hdfs://user@example.com/data.txt \
          -o data.txt \
          hdfs fs -copyToLocal \
                  hdfs://user@example.com/data.txt data.txt
```

</details>

<details>

#### HTTP

> Including HTTPs

```cli
$ dvc stage add -n download_file \
          -d https://example.com/data.txt \
          -o data.txt \
          wget https://example.com/data.txt -O data.txt
```

</details>

<details>

#### local file system paths

```cli
$ dvc stage add -n download_file \
          -d /home/shared/data.txt \
          -o data.txt \
          cp /home/shared/data.txt data.txt
```

</details>

<details>

#### Using DVC remote aliases

You may want to encapsulate external locations as configurable entities that can
be managed independently. This is useful if the connection requires
authentication, if multiple dependencies (or stages) reuse the same location, or
if the URL is likely to change in the future.

[DVC remotes](/user-guide/data-management/remote-storage) can do just this. You
may use `dvc remote add` to define them, and then use a special URL with format
`remote://{remote_name}/{path}` (remote alias) to define the external
dependency.

Let's see an example using SSH. First, register and configure the remote:

```cli
$ dvc remote add myssh ssh://user@example.com
$ dvc remote modify --local myssh password 'mypassword'
```

> Refer to `dvc remote modify` for more details like setting up access
> credentials for the different remote types.

Now, use an alias to this remote when defining the stage:

```cli
$ dvc stage add -n download_file \
          -d remote://myssh/path/to/data.txt \
          -o data.txt \
          wget https://example.com/data.txt -O data.txt
```

</details>

## How external outputs work

External <abbr>outputs</abbr> will be tracked by DVC, detecting when they
change, but not saved in the <abbr>cache</abbr> for
[versioning](/example-scenarios/versioning-data-and-models).

<admon type="warn">

Saving external outputs to an external cache has been deprecated in DVC 3.0.

</admon>

To define files or directories in an external location as <stage> outputs, give
their remote URLs or external paths to `dvc stage add -O`, or put them in
`dvc.yaml` (`outs` field). For supported external output types and expected URL
formats, see the examples above for
[external dependencies](#how-external-dependencies-work).

### Example

Let's take a look at defining and running an `upload_file` stage that simply
uploads a file to an external location.

```cli
$ dvc stage add -n upload_file \
          -d data.txt \
          -O s3://mybucket/data.txt \
          aws s3 cp data.txt s3://mybucket/data.txt
```
