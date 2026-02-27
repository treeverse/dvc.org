# Installation on Linux

<admon type="tip">

To use DVC [as a Python library](/api-reference), you can install it
[with `pip`](#install-with-pip) or [with `conda`](#install-with-conda).

</admon>

## Install with pip

<admon type="tip">

We **strongly** recommend creating a
[virtual environment](https://docs.python.org/3/library/venv.html) or using
[pipx](https://packaging.python.org/en/latest/guides/installing-stand-alone-command-line-tools/)
to encapsulate your local environment.

</admon>

<admon type="info">

Note that Python 3.9+ is needed to get the latest version of DVC.

</admon>

```cli
$ pip install dvc
```

Depending on the type of the [remote storage] you plan to use, you might need to
install optional dependencies: `[s3]`, `[gdrive]`, `[gs]`, `[azure]`, `[ssh]`,
`[hdfs]`, `[webdav]`, `[oss]`. Use `[all]` to include them all.

[remote storage]: /user-guide/data-management/remote-storage

<details id="example-pip-with-support-for-amazon-s3-storage">

### Example: with support for Amazon S3 storage

```cli
$ pip install "dvc[s3]"
```

In this case it installs the `boto3` library along with DVC.

</details>

> Restart your terminal, or re-source the shell configuration file (`.bashrc`,
> `.zshrc`, etc.) if you get `Command 'dvc' not found` after installation. If
> restarting the terminal isn't desirable (e.g. containers), it's also possible
> to manually edit the `PATH` env variable.

## Install with conda

<admon type="info">

Requires [Miniconda](https://docs.conda.io/en/latest/miniconda.html) or
[Anaconda Distribution](https://www.anaconda.com/docs/getting-started/anaconda/main).

</admon>

```cli
$ conda install -c conda-forge mamba # installs much faster than conda
$ mamba install -c conda-forge dvc
```

Depending on the type of the [remote storage] you plan to use, you might need to
install optional dependencies: `dvc-s3`, `dvc-azure`, `dvc-gdrive`, `dvc-gs`,
`dvc-oss`, `dvc-ssh`.

<details id="example-conda-with-support-for-amazon-s3-storage">

### Example: with support for Amazon S3 storage

```cli
$ conda install -c conda-forge mamba
$ mamba install -c conda-forge dvc-s3
```

In this case it installs the `boto3` library along with DVC.

</details>

## Install with snap

<admon type="info">

Requires [snapd](https://snapcraft.io/docs/installing-snapd/).

</admon>

```cli
$ snap install --classic dvc
```

> 💡 When connected to the internet, `snap` will automatically look for updates
> every 6 hours.

## Install from repository

<details id="from-repo-on-debian-ubuntu">

### On Debian/Ubuntu

```cli
$ sudo apt install wget gpg
$ sudo mkdir -p /etc/apt/keyrings
$ wget -qO - https://dvc.org/deb/iterative.asc | sudo gpg --dearmor -o /etc/apt/keyrings/packages.iterative.gpg
$ echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/packages.iterative.gpg] https://dvc.org/deb/ stable main" | sudo tee /etc/apt/sources.list.d/dvc.list
$ sudo chmod 644 /etc/apt/keyrings/packages.iterative.gpg /etc/apt/sources.list.d/dvc.list
$ sudo apt update
$ sudo apt install dvc
```

</details>

<details id="from-repo-on-fedora-centos">

### On Fedora/CentOS

```cli
$ sudo wget \
       https://dvc.org/rpm/dvc.repo \
       -O /etc/yum.repos.d/dvc.repo
$ sudo rpm --import https://dvc.org/rpm/iterative.asc
$ sudo yum update
$ sudo yum install dvc
```

</details>

## Install from package

<details id="from-pkg-on-debian-ubuntu">

### On Debian/Ubuntu

<downloadlink kind="linux-deb" />Download the debian package
first.</downloadlink> Then install it with `apt`:

```cli
$ sudo apt install ./dvc_0.62.1_amd64.deb
```

</details>

<details id="from-pkg-on-fedora-centos">

### On Fedora/CentOS

<downloadlink kind="linux-rpm" />Download the RPM package first.</downloadlink>
Then install it with `yum`:

```cli
$ sudo yum install dvc-0.62.1-1.x86_64.rpm
```

</details>
