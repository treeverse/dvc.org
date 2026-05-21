# Amazon S3 and Compatible Servers

<!--
## Amazon S3
-->

Start with `dvc remote add` to define the remote. Set a name and valid [S3] URL:

```cli
$ dvc remote add -d myremote s3://<bucket>/<key>
```

- `<bucket>` - name of an [existing S3 bucket]
- `<key>` - optional path to a [folder key] in your bucket

Upon `dvc push` (or when needed), DVC will try to authenticate using your [AWS
CLI config]. This reads the default AWS credentials file (if available) or
[env vars](#environment-variables).

[aws cli config]:
  https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html

<admon type="info">

The AWS user needs the following permissions: `s3:ListBucket`, `s3:GetObject`,
`s3:PutObject`, `s3:DeleteObject`.

</admon>

[s3]: https://aws.amazon.com/s3/
[existing s3 bucket]:
  https://docs.aws.amazon.com/AmazonS3/latest/userguide/GetStartedWithS3.html
[folder key]:
  https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html

To use [custom auth](#custom-authentication) or further configure your DVC
remote, set any supported config param with `dvc remote modify`.

## Custom authentication

Use these configuration options if you don't have the AWS CLI setup in your
environment, if you want to override those values, or to change the auth method.

<admon type="warn">

The `dvc remote modify --local` flag is needed to write sensitive user info to a
Git-ignored config file (`.dvc/config.local`) so that no secrets are leaked
through Git. See `dvc config`.

</admon>

To use custom [AWS CLI config or credential files][aws-cli-config-files], or to
specify a profile name, use `configpath`, `credentialpath`, or `profile`:

```cli
$ dvc remote modify --local myremote \
                    configpath 'path/to/config'
# or
$ dvc remote modify --local myremote \
                    credentialpath 'path/to/credentials'
# and (optional)
$ dvc remote modify myremote profile 'myprofile'
```

[aws-cli-config-files]:
  https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html

Another option is to use an AWS access key ID (`access_key_id`) and secret
access key (`secret_access_key`) pair, and if required, an [MFA] session token
(`session_token`):

```cli
$ dvc remote modify --local myremote \
                    access_key_id 'mysecret'
$ dvc remote modify --local myremote \
                    secret_access_key 'mysecret'
$ dvc remote modify --local myremote \
                    session_token 'mysecret'
```

[mfa]: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa.html

## S3-compatible servers (non-Amazon)

Set the `endpointurl` parameter with the URL to connect to the S3-compatible
service (e.g. [Backblaze B2], [IBM Cloud Object Storage], [MinIO], [Nebius],
etc.). For example, let's set up a [DigitalOcean Space] (equivalent to a bucket
in S3) called `mystore` found in the `nyc3` region:

```cli
$ dvc remote add -d myremote s3://mystore/path
$ dvc remote modify myremote endpointurl \
                    https://nyc3.digitaloceanspaces.com
```

<admon type="info">

Any other S3 parameter can also be set for S3-compatible storage. Whether
they're effective depends on each storage platform.

</admon>

[backblaze b2]: https://www.backblaze.com/docs/cloud-storage-s3-compatible-api
[digitalocean space]: https://www.digitalocean.com/products/spaces
[ibm cloud object storage]: https://www.ibm.com/products/cloud-object-storage
[minio]: https://www.min.io/
[nebius]: https://docs.nebius.com/object-storage

## More configuration parameters

<admon type="info">

See `dvc remote modify` for more command usage details.

</admon>

- `url` - modify the remote location ([scroll up](#amazon-s3) for details)

- `region` - specific AWS region

  ```cli
  $ dvc remote modify myremote region 'us-east-2'
  ```

- `read_timeout` - time in seconds until a timeout exception is thrown when
  attempting to read from a connection (60 by default)

- `connect_timeout` - time in seconds until a timeout exception is thrown when
  attempting to make a connection (60 by default)

- `listobjects` (`true` or `false`) - whether to use the `list_objects()` S3 API
  method instead of the default `list_objects_v2()`. Useful for Ceph and other
  S3 emulators

- `use_ssl` (`true` or `false`) - whether to use SSL. Used by default.

- `ssl_verify` - whether to verify SSL certificates (`true` or `false`), or a
  path to a custom CA certificates bundle to do so (implies `true`). Any certs
  found in the [AWS CLI config file][aws-cli-config-files] (`ca_bundle`) are
  used by default.

  ```cli
  $ dvc remote modify myremote ssl_verify false
  # or
  $ dvc remote modify myremote \
                      ssl_verify 'path/to/ca_bundle.pem'
  ```

- `sse` (`AES256` or `aws:kms`) - [server-side encryption] algorithm to use.
  None by default

  ```cli
  $ dvc remote modify myremote sse 'AES256'
  ```

- `sse_kms_key_id` - encryption key ID (or alias) when using [SSE-KMS] (see
  `sse`)

- `sse_customer_key` - key to encrypt data uploaded when using customer-provided
  keys ([SSE-C]) instead of `sse`. The value should be a base64-encoded 256 bit
  key.

- `sse_customer_algorithm` - algorithm to use with `sse_customer_key`. `AES256`
  by default

- `acl` - object-level access control list ([ACL]) such as `private`,
  `public-read`, etc. None by default. Cannot be used with the `grant_` params
  below.

  ```cli
  $ dvc remote modify myremote \
                      acl 'bucket-owner-full-control'
  ```

- `grant_read` - grant `READ` [permissions] at object-level ACL to specific
  [grantees]. Cannot be used with `acl`.

  ```cli
  $ dvc remote modify myremote grant_read \
        'id=myuser,id=anotheruser'
  ```

- `grant_read_acp` - grant `READ_ACP` permissions at object-level ACL to
  specific grantees. Cannot be used with `acl`.

- `grant_write_acp` - grant `WRITE_ACP` permissions at object-level ACL to
  specific grantees. Cannot be used with `acl`.

- `grant_full_control` - grant `FULL_CONTROL` permissions at object-level ACL to
  specific grantees. Cannot be used with `acl`.

- `allow_anonymous_login` (`true` or `false`) - whether to allow anonymous
  access. `false` by default.

[server-side encryption]:
  https://docs.aws.amazon.com/AmazonS3/latest/userguide/serv-side-encryption.html
[sse-kms]:
  https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html
[sse-c]:
  https://docs.aws.amazon.com/AmazonS3/latest/userguide/ServerSideEncryptionCustomerKeys.html
[acl]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/acl-overview.html
[grantees]:
  https://docs.aws.amazon.com/AmazonS3/latest/userguide/acl-overview.html#specifying-grantee
[permissions]:
  https://docs.aws.amazon.com/AmazonS3/latest/userguide/acl-overview.html#permissions

## Environment variables

Authentication and other config can also be set via [`boto3` env vars]. These
are tried if no config params are set. Example:

```cli
$ dvc remote add -d myremote s3://mybucket
$ export AWS_ACCESS_KEY_ID='myid'
$ export AWS_SECRET_ACCESS_KEY='mysecret'
$ dvc push
```

[`boto3` env vars]:
  https://boto3.amazonaws.com/v1/documentation/api/latest/guide/configuration.html#using-environment-variables
