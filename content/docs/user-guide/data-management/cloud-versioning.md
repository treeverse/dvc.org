# Cloud Versioning

## Importing versioned data

DVC supports importing cloud-versioned data from supported storage providers.
Refer to `dvc import-url` (`--version-aware`) and `dvc update --rev` for more
information.

## Supported storage providers

Cloud versioning features are only available for certain storage providers.
Currently, it is supported on the following storage types:

- [Amazon S3] (requires [S3 Versioning] enabled buckets)
- Microsoft [Azure Blob Storage] (requires [Blob versioning] enabled storage
  accounts and containers)
- [Google Cloud Storage] (requires [Object versioning] enabled buckets)

[amazon s3]: /user-guide/data-management/remote-storage/amazon-s3
[s3 versioning]:
  https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html
[azure blob storage]:
  /user-guide/data-management/remote-storage/azure-blob-storage
[blob versioning]:
  https://learn.microsoft.com/en-us/azure/storage/blobs/versioning-overview
[google cloud storage]:
  /user-guide/data-management/remote-storage/google-cloud-storage
[object versioning]:
  https://docs.cloud.google.com/storage/docs/object-versioning

Lifecycle management policies may delete object versions, in which case DVC will
be unable to recover those versions. For more information about lifecycle
management, see:

- [Amazon S3]
- Microsoft [Azure Blob Storage]
- [Google Cloud Storage]

[amazon s3]:
  https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html
[azure blob storage]:
  https://learn.microsoft.com/en-us/azure/storage/blobs/lifecycle-management-policy-configure
[google cloud storage]: https://cloud.google.com/storage/docs/lifecycle
