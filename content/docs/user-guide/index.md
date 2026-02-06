# What is DVC?

<!--
## What is DVC?
-->

**Data Version Control** is a [free], open-source tool for [data management],
[ML pipeline][ml pipelines] automation, and [experiment management]. This helps
data science and machine learning teams manage **large datasets**, make projects
**reproducible**, and **collaborate** better.

DVC takes advantage of the existing software engineering toolset your team
already knows (Git, your IDE, CI/CD, cloud storage, etc.). Its design follows
this set of principles:

1. **Codification**: Define any aspect of your ML project (data and model
   versions, ML pipelines and experiments) in human-readable [metafiles]. This
   enables using best practices and established engineering toolsets, reducing
   the gap with data science.
1. **Versioning**: Use Git (or any SCM) to version and share your entire ML
   project including its source code and configuration, parameters and metrics,
   as well as data assets and processes by committing DVC metafiles (as
   placeholders).
1. **Secure collaboration**: Control the access to all aspects of your project
   and share them with the people and teams you choose.

[data management]: /user-guide/data-management/remote-storage
[manage data]: /user-guide/data-management/remote-storage
[ml pipelines]: /user-guide/pipelines
[experiment management]: /user-guide/experiment-management
[metafiles]: /user-guide/project-structure

## Characteristics

- DVC comes as a [VS Code Extension], as a [command line] interface, and as a
  [Python API]. These options provide a familiar an intuitive **user
  experience** to a broad range of users.
- **Easy to use**: DVC is quick to [install](/install) and works out of the box.
  It doesn't require special infrastructure, nor does it depend on APIs or
  external services.

  <admon type="tip">

  Optional integrations with existing solutions and platforms such as Git
  hosting, SSH and cloud storage providers, among others are included.

  </admon>

- **Works on top of Git repositories** and has similar feel and flows. Stick to
  the regular Git workflow (commits, branching, pull requests, etc.) and don't
  reinvent the wheel!

  <admon type="info">

  DVC can also work stand-alone, but without
  [versioning](/use-cases/versioning-data-and-models) capabilities.

  </admon>

<!--
- DVC codifies data and ML experiments:

  ![](/img/reproducibility.png)
-->

- **Bring your own resources**: Provision or reuse existing resources
  on-premises or on the cloud, including storage, compute, CI workers, etc. and
  use DVC on top. You're not locked to any one provider!

- DVC is **platform agnostic**: It runs on all major operating systems (Linux,
  macOS, and Windows), and works independently of programming languages (Python,
  R, Julia, shell scripts, etc.) or ML libraries (Keras, Tensorflow, PyTorch,
  Scipy, etc.).

[free]: https://github.com/treeverse/dvc/blob/main/LICENSE
[vs code extension]:
  https://marketplace.visualstudio.com/items?itemName=Iterative.dvc
[python api]: /api-reference
[command line]: /command-reference

## Comparison with Related Technologies

DVC combines a number of existing ideas into a single tool, with the goal of
bringing best practices from software engineering into the data science field.

<details>

### Git

DVC builds upon Git by introducing the concept of _data versioning_ – large
files that should not be stored in a Git repository, but still need to be
tracked and versioned. It leverages Git's features to enable managing different
versions of data, data pipelines, and experiments.

<admon type="info">

DVC is not fundamentally bound to Git, and can work without it (except
[versioning-related](/use-cases/versioning-data-and-models) features).

</admon>

**DVC does not replace Git!** DVC [metafiles] such as `dvc.yaml` and `.dvc`
files serve as placeholders to version data and ML pipelines. These files change
along with your data, and you can use Git to place them under [version control]
as a proxy to the actual data, which is stored in a <abbr>cache</abbr> (outside
of Git).

DVC does, however, provide several commands similar to Git such as `dvc init`,
`dvc add`, `dvc checkout`, or `dvc push`, which interact with the underlying Git
repo (if one is being used, which is not required).

[version control]:
  https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control

</details>

<details>

### Git-LFS (Large File Storage)

- DVC does not require special servers like Git-LFS demands. Any cloud storage
  like S3, Google Cloud Storage, or even an SSH server can be used as a [remote
  storage]. No additional databases, servers, or infrastructure are required.

- DVC does not add any hooks to the Git repo by default (although they are
  [available]).

- Git-LFS was not made with data science in mind, so it doesn't provide related
  features (e.g. [ML pipelines], [metrics](/command-reference/metrics), etc.).

- GitHub (common Git hosting service) has a limit of 2 GB per repository.

[remote storage]: /user-guide/data-management/remote-storage
[available]: /command-reference/install
[pipelines]: /command-reference/dag
[metrics]: /command-reference/metrics

</details>

<details>

### Git-annex

- DVC can use reflinks\* or hardlinks (depending on the system) instead of
  symlinks to improve performance and the user experience.

- Git-annex is a datafile-centric system whereas DVC focuses on providing a
  workflow for machine learning and reproducible experiments. When a DVC or
  Git-annex repository is cloned via `git clone`, data files won't be copied to
  the local machine, as file contents are stored in separate
  [remotes][remote storage]. With DVC however, `.dvc` files, which provide the
  reproducible workflow, are always included in the Git repository. Hence, they
  can be executed locally with minimal effort.

- DVC optimizes file hash calculation.

<admon type="info">

\* ([copy-on-write](https://en.wikipedia.org/wiki/Copy-on-write)) links or
**reflinks** are a type of file linking available in modern file systems. Unlike
hard links or symlinks, editing reflinks is always safe, as the original
<abbr>cached</abbr> data will remain unchanged.

</admon>

</details>

<details>

### Git workflows such as Gitflow

- DVC enables a new experimentation methodology that integrates easily with
  standard Git workflows. For example, a separate branch can be created for each
  experiment, with a subsequent merge of the branch if the experiment is
  successful.

- DVC innovates by giving users the ability to easily navigate through past
  experiments without recomputing them each time.

</details>

<details>

### Workflow management systems

Systems to manage data pipelines and [dependency graphs] such as _Airflow_,
_Luigi_, etc.

- DVC is focused on data science and modeling. As a result, DVC pipelines are
  lightweight and easy to create and modify. However, DVC lacks advanced
  pipeline execution features like execution monitoring, error handling, and
  recovering.

- `dvc` is purely a command line tool without a graphical user interface (GUI)
  and doesn't run any daemons or servers. Nevertheless, DVC can generate images
  with pipeline and experiment workflow visualizations.

- See also our sister project, [CML](https://cml.dev/), that helps fill some of
  these gaps.

[dependency graphs]: /user-guide/pipelines/defining-pipelines

</details>

<details>

### Experiment management software

> See also the [Experiment Management] guide.

- DVC uses Git as the underlying version control layer for data, pipelines, and
  experiments. Data versions exist as metadata in Git, as opposed to using
  external databases or APIs, so no additional services are required.

- DVC doesn't need to run any services. There's no built-in GUI as a result, but
  we also have our sister project: DVC Studio to fill that gap.

- DVC can generate images with experiment workflow visualizations.

- DVC has transparent design. <abbr>DVC files</abbr> have a human-readable
  format and can be easily reused by external tools.

</details>

<details>

### Build automation tools

[_Make_](https://www.gnu.org/software/make/) and others.

- File tracking:
  - DVC tracks files based on their hash values (MD5) instead of using
    timestamps. This helps avoid running into heavy processes like model
    retraining when you checkout a previous version of the project (Make would
    retrain the model).

  - DVC uses file timestamps and inodes\* for optimization. This allows DVC to
    avoid recomputing all dependency file hashes, which would be highly
    problematic when working with large files (multiple GB).

- DVC utilizes a [directed acyclic graph] (DAG):
  - The dependency graph is defined implicitly by the connections between
    [stages](/command-reference/stage/add), based on their
    <abbr>dependencies</abbr> and <abbr>outputs</abbr>.

  - Each stage defines one node in the DAG, and `dvc.yaml` files contain these
    stage definitions (think Makefiles). All stages (and corresponding
    processes) are implicitly combined through their inputs and outputs,
    simplifying conflict resolution during merges.

  - DVC stages can be written manually in an intuitive `dvc.yaml` file, or
    generated by the helper command `dvc stage add`, based on a terminal
    command, its inputs, and outputs.

> \* **Inodes** are metadata file records to locate and store permissions to the
> actual file contents. See **Linking files** in
> [this doc](https://devconnected.com/understanding-hard-and-soft-links-on-linux/)
> for technical details (Linux).

[directed acyclic graph]:
  /user-guide/pipelines/defining-pipelines#directed-acyclic-graph-dag

</details>

<infocard title="lakeFS" logo="/img/lakefs.svg" href="https://docs.lakefs.io/latest/" cta="Explore lakeFS">

Our sister tool, [lakeFS](https://docs.lakefs.io/), is an open-source data
version control system for data lakes and object stores (S3, GCS, Azure Blob).

- DVC is a CLI tool that requires no server infrastructure. lakeFS is a
  centralized server that enables coordinated access for multiple users and
  pipelines.

- DVC versions data by storing content hashes in Git-tracked metafiles and
  copies data to storage. lakeFS implements Git-like semantics (branches,
  commits, merges, rollbacks) as metadata operations without copying data,
  scaling to billions of objects at terabyte-to-petabyte scale.

- DVC provides [ML pipelines], [experiment tracking][experiment management], and
  [metrics]. lakeFS focuses on data versioning primitives.

</infocard>
