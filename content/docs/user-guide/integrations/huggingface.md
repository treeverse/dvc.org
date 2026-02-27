# Hugging Face

DVC includes native support for importing and downloading data hosted on the
[Hugging Face Hub](https://huggingface.co/docs/hub/index). Data from a <abbr>DVC
project</abbr> can also be loaded with the Hugging Face
[Datasets](https://huggingface.co/docs/datasets/index) library via the DVC
[Python API](/api-reference).

<admon type="info">

Logging from
[Hugging Face Transformers](https://huggingface.co/docs/transformers/index) is
supported within [DVCLive](/dvclive/ml-frameworks/huggingface).

</admon>

## Hugging Face Hub

DVC supports importing or downloading data from any Git repository, even
repositories which use [Git-LFS](https://git-lfs.com/) like repositories hosted
on the [Hugging Face Hub](https://huggingface.co/docs/hub/index). Both HTTPS
(`https://huggingface.co/<MODEL>` and SSH (`git@hf.co:<MODEL>`) repository URLs
are supported.

<admon type="tip">

DVC already includes native read-only Git-LFS support, so using DVC to import
and download data from Hugging Face Hub does not require installing Git LFS or
the Hugging Face CLI.

</admon>

<admon type="info">

When using Git over SSH with Hugging Face Hub (i.e. `git@hf.co:<MODEL>` URLs)
you must have a Hugging Face account with a registered SSH key, regardless of
whether the repository is public or private. Using Git over HTTPS to access
public repositories does not require a Hugging Face account. Please refer to the
Hugging Face [documentation](https://huggingface.co/docs/hub/security-git-ssh)
for more information.

This limitation applies to both `dvc get` and `dvc import`.

</admon>

### Setup

```cli
$ pip install dvc
```

### Download data

`dvc get` provides a way to download data from Hugging Face Hub, without needing
to clone the Hugging Face Hub repository, and without requiring any additional
dependencies (such as Git-LFS). Downloading both individual files and
directories is supported.

Download the `sd_xl_base_1.0` model from
[Stable Diffusion XL 1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0):

```cli
$ dvc get https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0 sd_xl_base_1.0.safetensors
```

### Import data

`dvc import` provides a way to use data from Hugging Face Hub in a <abbr>DVC
project</abbr>. Importing both individual files and directories is supported.

Import the `sd_xl_base_1.0` model from
[Stable Diffusion XL 1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
into a <abbr>DVC project</abbr>:

```cli
$ dvc import https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0 sd_xl_base_1.0.safetensors
```

## Hugging Face Datasets

[Hugging Face Datasets](https://huggingface.co/docs/datasets/index) is a Python
library for accessing and sharing datasets. The DVC Python API provides
[DVCFileSystem](/api-reference/dvcfilesystem), an fsspec-compatible filesystem
which can be used with Hugging Face Datasets to load data from a <abbr>DVC
project</abbr>. Please refer to the Hugging Face
[documentation](https://huggingface.co/docs/datasets/main/en/filesystems) for
more detailed information on using fsspec filesystems with Hugging Face
Datasets.

### Setup

```cli
$ pip install datasets dvc
```

### Load DVC data

When DVC is installed in the same Python environment as Hugging Face Datasets,
DVCFileSystem will be used automatically when a `dvc://` filesystem URL is
provided.

<admon type="tip">

Note that `dvc://` URLs contain the path to the file you wish to load, relative
to the root of the DVC project. `dvc://` URLs should not contain a Git
repository URL.

The Git repository URL and any additional DVCFileSystem parameters are provided
separately, through the `storage_options` dictionary.

</admon>

Load the dataset (`workshop/satellite-data/jan_train.csv`) from the example
[dataset-registry](https://github.com/treeverse/dataset-registry) repository
using Hugging Face Datasets:

```python
>>> from datasets import load_dataset
>>> load_dataset(
...     "csv",
...     data_files="dvc://workshop/satellite-data/jan_train.csv",
...     storage_options={"repo": "https://github.com/treeverse/dataset-registry.git"}
... )
Downloading data: 100%|███████████████████████████████| 132M/132M [00:30<00:00, 4.32MB/s]
Downloading data files: 100%|██████████████████████████████| 1/1 [00:32<00:00, 32.17s/it]
Extracting data files: 100%|██████████████████████████████| 1/1 [00:00<00:00, 443.84it/s]
Generating train split: 503227 examples [00:00, 514266.75 examples/s]
DatasetDict({
    train: Dataset({
        features: ['id', 'epoch', 'sat_id', 'x', 'y', 'z', 'Vx', 'Vy', 'Vz', 'x_sim', 'y_sim', 'z_sim', 'Vx_sim', 'Vy_sim', 'Vz_sim'],
        num_rows: 503227
    })
})
```
