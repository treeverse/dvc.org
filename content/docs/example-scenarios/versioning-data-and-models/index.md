# Versioning Data and Models

Data science teams face data management questions around versions of data and
machine learning models. How do we keep track of changes in data, source code,
and ML models together? What's the best way to organize and store variations of
these files and directories?

![](/img/data-ver-complex.png) _Exponential complexity of data science projects_

Another problem in the field has to do with bookkeeping: being able to identify
past data inputs and processes to understand their results, for knowledge
sharing, or for debugging.

**Data Version Control** (DVC) lets you capture the versions of your data and
models in
[Git commits](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository),
while storing them on-premises or in cloud storage. It also provides a mechanism
to switch between these different data contents. The result is a single history
for data, code, and ML models that you can traverse — a proper journal of your
work!

![](/img/project-versions.png) _DVC matches the right versions of data, code,
and models for you 💘._

DVC enables data _versioning through codification_. You produce simple
[metafiles](/user-guide/project-structure) once, describing what datasets, ML
artifacts, etc. to track. This metadata can be put in Git in lieu of large
files. Now you can use DVC to create [snapshots](/command-reference/add) of the
data, [restore](/command-reference/checkout) previous versions,
[reproduce](/command-reference/repro) experiments, record evolving
[metrics](/command-reference/metrics), and more!

👩‍💻 **Intrigued?** Try our
[versioning tutorial](/example-scenarios/versioning-data-and-models/tutorial) to
learn how DVC looks and feels firsthand.

As you use DVC, unique versions of your data files and directories are
[cached](/user-guide/project-structure/internal-files#structure-of-the-cache-directory)
in a systematic way (preventing file duplication). The working data store is
separated from your <abbr>workspace</abbr> to keep the project light, but stays
connected via file
[links](/user-guide/data-management/large-dataset-optimization#file-link-types-for-the-dvc-cache)
handled automatically by DVC.

Benefits of our approach include:

- **Lightweight**: DVC is a
  [free](https://github.com/treeverse/dvc/blob/main/LICENSE), open-source
  [command line](/command-reference) tool that doesn't require databases,
  servers, or any other special services.

- **Consistency**: Keep your projects readable with stable file names — they
  don't need to change because they represent variable data. No need for
  complicated paths like `data/20190922/labels_v7_final` or for constantly
  editing these in source code.

- **Efficient data management**: Use a familiar and cost-effective storage
  solution for your data and models (e.g. SFTP, S3, HDFS, [etc.]) — free from
  Git hosting [constraints]. DVC [optimizes] storing and transferring large
  files.

  [etc.]: /user-guide/data-management/remote-storage#supported-storage-types
  [constraints]:
    https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
  [optimizes]: /user-guide/data-management/large-dataset-optimization

- **Collaboration**: Easily distribute your project development and share its
  data [internally] and [remotely], or [reuse] it in other places.

  [remotely]: /user-guide/data-management/remote-storage
  [internally]: /user-guide/how-to/share-a-dvc-cache
  [reuse]: /user-guide/data-management/discovering-and-accessing-data

- **Data compliance**: Review data modification attempts as Git
  [pull requests](https://www.dummies.com/article/technology/programming-web-design/general-programming-web-design/what-are-github-pull-requests-264741/).
  Audit the project's immutable history to learn when datasets or models were
  approved, and why.

- [**GitOps**](https://www.gitops.tech/): Connect your data science projects
  with the Git ecosystem. Git workflows open the door to advanced
  [CI/CD](/example-scenarios/ci-cd-for-machine-learning) tools (like
  [CML](https://cml.dev)), specialized patterns such as
  [data registries](/example-scenarios/data-registry), and other best practices.

In summary, data science and ML are iterative processes where the lifecycles of
data, models, and code happen at different paces. DVC helps you manage, and
enforce them.

And this is just the beginning. DVC supports multiple advanced features
out-of-the-box: Build, run, and versioning [data pipelines], [manage
experiments] effectively, and more.

[data pipelines]: /command-reference/dag
[manage experiments]: /start/experiments
