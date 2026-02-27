# Continuous Integration and Deployment for Machine Learning

Applying DevOps methodologies to machine learning (MLOps) and data management
(DataOps) is increasingly common. This means resource orchestration
(provisioning servers for model training), model testing (validating model
inference), and model deployment to production, as well as monitoring &
feedback. [DVC](/) can manage data/models and reproducible pipelines, while
[CML] can assist with orchestration, testing and monitoring.

[cml]: https://cml.dev

![](/img/cicd4ml-0.png '=408') _Basic ML pipeline_

The main benefits of CI/CD (continuous integration and continuous delivery) for
ML are detailed below.

Firstly, we can automate and enforce testing. This includes enforcing integrity
with application-specific tests:

- **Data validation**: for example, validation against a schema or verifying
  pipeline consistency -- correct shapes, data types, etc.
- **Model validation**: for example, input/output and performance validation --
  all dependencies present for inference to run, and model scores within
  thresholds.

Typically, this requires **infrastructure orchestration**: making CI systems
provision and launch a GPU instance, train a model, cleanly terminate, and pull
results back. In particular:

- **Provisioning**: When data or code is added/changed in a pull request (PR),
  automatically running validation tests in the cloud.
- **Metrics**: Automatically generating metrics reports.

Finally, this can be taken a step further with entire **experiments**/research
being run online:

- Fine-tune on a schedule: set up jobs to pull in new data from regularly
  updated external sources to retrain/refine deployed models.
- Run a hyperparameter search: keep heavyweight resources and big data on CI
  servers running overnight, and put your laptop to sleep.

Normally, CI/CD is hard to set up, configure, and maintain -- especially for
data and ML pipelines.

![](/img/cicd4ml.png '=460') _Traditional ML meets CI/CD_

[DVC](/) and [CML] remove most of this
[management headache](https://papers.nips.cc/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf)
in ML. You can automate all of the above without needing any additional
configuration. Here are a few feature highlights:

**Models, Data, and Metrics as Code**: DVC removes the need to create versioning
databases, use special file/folder structures, or write bespoke interfacing
code. Instead, DVC stores meta-information in Git ("codifying" data and ML
models) while pushing the actual data content to [cloud storage]. DVC also
provides metrics-driven navigation in Git repositories -- [tabulating and
plotting] model metrics changes across commits.

[cloud storage]: /user-guide/data-management/remote-storage
[tabulating and plotting]: /start/data-pipelines/metrics-parameters-plots

**Low friction**: Our sister project CML provides
[lightweight machine resource orchestration](https://cml.dev/doc/self-hosted-runners)
that lets you use pre-existing infrastructure. DVC and CML both provide
abstraction/codification and require no external services.

**Data Validation**: It is common practice for tests to be triggered each time a
code change is pushed to a repository branch. DVC can be used in a similar
manner to checkout
[different data versions](/example-scenarios/versioning-data-and-models) for the
purposes of testing and running sanity checks. Mistakes can be caught
automatically without requiring contributors to set up complicated tests
locally. Instead, embrace agile development so you can confidently package,
deploy and deliver new versions several times a day -- and even before the
weekend -- without fear of bugs/regressions.

**Metrics (Model Validation)**: Whenever a change is committed, DVC can check
that the [pipeline](/start/data-pipelines/data-pipelines) (including data,
parameters, code, and metrics) is up to date, thereby ensuring that Git commits
and model artifacts are in sync. DVC can also run benchmarks against previously
deployed models before a new one is
[released into production](/example-scenarios/data-registry). CML provides
useful tools to make this process easy -- including reporting metric changes
with interactive graphs and tables in pull request comments.

**Refine in the Cloud**: Rather than frequently updating models locally (e.g.
based on new data from regular feeds), DVC and CML let you retrain/refine in the
cloud. For example, CI providers allow scheduling of regular jobs. Every day, a
job could use CML to provision a GPU server on which DVC will pull in data from
a regularly updated source, checkout a pre-existing model, and then deploy an
updated model refined on the additional data.

**Experiment in the Cloud**: Alternatively, DVC and CML can be used to do
research and run [experiments](/start/experiments) in the cloud -- such as an
entire hyperparameter search!

<p style="display: inline-flex; align-items: center; gap: 8px; font-size: 32px">
  <img src="/logos/dvc.svg" alt="DVC" />+
  <img src="/logos/cml.svg" alt="CML" />= ❤️
</p>
