---
title: 'Get Started: Data Pipelines'
description: 'Get started with DVC pipelines. Learn how to capture, organize,
version, and reproduce your data science and machine learning workflows.'
---

# Get Started: Data Pipelines

<details icon="video">

### Click to watch a video intro.

https://youtu.be/71IGzyH95UY

</details>

Versioning large data files and directories for data science is powerful, but
often not enough. Data needs to be filtered, cleaned, and transformed before
training ML models - for that purpose DVC introduces a build system to define,
execute and track _data pipelines_ — a series of data processing stages, that
produce a final result.

_💫 DVC is a "Makefile" system for machine learning projects!_

DVC pipelines are versioned using Git, and allow you to better organize projects
and reproduce complete workflows and results at will. You could capture a simple
ETL workflow, organize your project, or build a complex DAG (Directed Acyclic
Graph) pipeline.

Later, we will find DVC allows you to manage
[machine learning experiments](/start/experiments/experiment-pipelines) on top
of these pipelines - controlling their execution, injecting parameters, etc.

## Setup

Working inside an [initialized DVC project](/start#initializing-a-project),
let's get some sample code for the next steps:

```cli
$ wget https://code.dvc.org/get-started/code.zip
$ unzip code.zip && rm -f code.zip
```

<details icon="bulb">

### Expand to inspect project structure

Get the sample code like this:

```cli
$ tree
.
├── params.yaml
└── src
    ├── evaluate.py
    ├── featurization.py
    ├── prepare.py
    ├── requirements.txt
    └── train.py
```

</details>

The data needed to run this example can be downloaded using `dvc get` and
tracked with `dvc add` (if you are following from [Data Versioning](/start), you
may already have this data):

```cli
$ dvc get https://github.com/treeverse/dataset-registry \
          get-started/data.xml -o data/data.xml
$ dvc add data/data.xml
```

Now, let's go through some usual project setup steps (virtualenv, requirements,
Git).

First, create and use a
[virtual environment](https://docs.python.org/3/library/venv.html) (it's not a
must, but we **strongly** recommend it):

```cli
$ virtualenv venv && echo "venv" > .gitignore
$ source venv/bin/activate
```

Next, install the Python requirements:

```cli
$ pip install -r src/requirements.txt
```

Finally, this is a good time to commit our code to Git:

```cli
$ git add .github/ data/ params.yaml src .gitignore
$ git commit -m "Initial commit"
```

## Pipeline stages

Use `dvc stage add` to create _stages_. These represent processing steps
(usually scripts/code tracked with Git) and combine to form the _pipeline_.
Stages allow connecting code to its corresponding data _input_ and _output_.
Let's transform a Python script into a [stage](/command-reference/stage):

```cli
$ dvc stage add -n prepare \
                -p prepare.seed,prepare.split \
                -d src/prepare.py -d data/data.xml \
                -o data/prepared \
                python src/prepare.py data/data.xml
```

A `dvc.yaml` file is generated. It includes information about the command we
want to run (`python src/prepare.py data/data.xml`), its
<abbr>dependencies</abbr>, and <abbr>outputs</abbr>.

<admon type="tip">

DVC uses the pipeline definition to **automatically track** the data used and
produced by any stage, so there's no need to manually run `dvc add` for
`data/prepared`!

</admon>

<details id="stage-expand-to-see-what-happens-under-the-hood" icon="bulb">

### Expand to get a peek under the hood

Details on the command options used above:

- `-n prepare` specifies a name for the stage. If you open the `dvc.yaml` file
  you will see a section named `prepare`.

- `-p prepare.seed,prepare.split` defines special types of dependencies —
  [parameters](/command-reference/params). Any stage can depend on parameter
  values from a parameters file (`params.yaml` by default). We'll discuss those
  more in the
  [Metrics, Parameters, and Plots](/start/data-pipelines/metrics-parameters-plots)
  page.

```yaml
prepare:
  split: 0.20
  seed: 20170428
```

- `-d src/prepare.py` and `-d data/data.xml` mean that the stage depends on
  these files (dependencies) to work. Notice that the source code itself is
  marked as a dependency as well. If any of these files change, DVC will know
  that this stage needs to be [reproduced](#reproduce) when the pipeline is
  executed.

- `-o data/prepared` specifies an output directory for this script, which writes
  two files in it.

  This is how the <abbr>workspace</abbr> looks like after the run:

  ```git
   .
   ├── data
   │   ├── data.xml
   │   ├── data.xml.dvc
  +│   └── prepared
  +│       ├── test.tsv
  +│       └── train.tsv
  +├── dvc.yaml
  +├── dvc.lock
   ├── params.yaml
   └── src
       ├── ...
  ```

- The last line, `python src/prepare.py data/data.xml` is the command to run in
  this stage, and it's saved to `dvc.yaml`, as shown below.

The resulting `prepare` stage contains all of the information above:

```yaml
stages:
  prepare:
    cmd: python src/prepare.py data/data.xml
    deps:
      - src/prepare.py
      - data/data.xml
    params:
      - prepare.seed
      - prepare.split
    outs:
      - data/prepared
```

</details>

<details id="external-data-pipelines" icon="bulb">

### What if my dependencies and outputs aren't inside my project?

DVC can help simplify your workflow by keeping all your data inside your
project, but this isn't always practical if you already have a large dataset
stored elsewhere that you don't want to copy, or your stage writes data directly
to cloud storage. DVC can still detect when these external datasets change. Your
pipeline dependencies can point anywhere, not only local paths inside your
project. Same with outputs, except that you need to set `cache: false` to tell
DVC not to make a local copy of these external outputs. See the example below or
read more in
[External Dependencies and Outputs](/user-guide/pipelines/external-dependencies-and-outputs).

```yaml
stages:
  prepare:
    cmd:
      - wget
        https://sagemaker-sample-data-us-west-2.s3-us-west-2.amazonaws.com/autopilot/direct_marketing/bank-additional.zip
        -O bank-additional.zip
      - python sm_prepare.py --bucket mybucket --prefix project-data
    deps:
      - sm_prepare.py
      - https://sagemaker-sample-data-us-west-2.s3-us-west-2.amazonaws.com/autopilot/direct_marketing/bank-additional.zip
    outs:
      - s3://mybucket/project-data/input_data:
          cache: false
```

</details>

Once you've added a stage, you can run the pipeline with `dvc repro`.

## Dependency graphs

By using `dvc stage add` multiple times, defining <abbr>outputs</abbr> of a
stage as <abbr>dependencies</abbr> of another, we can describe a sequence of
dependent commands which gets to some desired result. This is what we call a
[dependency graph] which forms a full cohesive pipeline.

Let's create a 2nd stage chained to the outputs of `prepare`, to perform feature
extraction:

```cli
$ dvc stage add -n featurize \
                -p featurize.max_features,featurize.ngrams \
                -d src/featurization.py -d data/prepared \
                -o data/features \
                python src/featurization.py data/prepared data/features
```

The `dvc.yaml` file will now be updated to include the two stages.

And finally, let's add a 3rd `train` stage:

```cli
$ dvc stage add -n train \
                -p train.seed,train.n_est,train.min_split \
                -d src/train.py -d data/features \
                -o model.pkl \
                python src/train.py data/features model.pkl
```

Finally, our `dvc.yaml` should have all 3 stages.

<admon type="tip">

This would be a good time to commit the changes with Git. These include
`.gitignore`(s) and `dvc.yaml` — which describes our pipeline.

```cli
$ git add .gitignore data/.gitignore dvc.yaml
$ git commit -m "pipeline defined"
```

</admon>

Great! Now we're ready to run the pipeline.

## Reproducing

The pipeline definition in `dvc.yaml` allow us to easily reproduce the pipeline:

```cli
$ dvc repro
```

You'll notice a `dvc.lock` (a "state file") was created to capture the
reproduction's results.

<details id="repro-expand-to-see-what-happens-under-the-hood" icon="bulb">

### Expand to get a peek under the hood

`dvc repro` relies on the [dependency graph] of stages defined in `dvc.yaml`,
and uses `dvc.lock` to determine what exactly needs to be run.

The `dvc.lock` file is similar to a `.dvc` file — it captures hashes (in most
cases `md5`s) of the dependencies and values of the parameters that were used.
It can be considered a _state_ of the pipeline:

```yaml
schema: '2.0'
stages:
  prepare:
    cmd: python src/prepare.py data/data.xml
    deps:
      - path: data/data.xml
        md5: 22a1a2931c8370d3aeedd7183606fd7f
        size: 14445097
      - path: src/prepare.py
        md5: f09ea0c15980b43010257ccb9f0055e2
        size: 1576
    params:
      params.yaml:
        prepare.seed: 20170428
        prepare.split: 0.2
    outs:
      - path: data/prepared
        md5: 153aad06d376b6595932470e459ef42a.dir
        size: 8437363
        nfiles: 2
```

<admon type="info">

The `dvc status` command can be used to compare the workspace with an actual
state of the workspace.

</admon>

[dependency graph]: /user-guide/pipelines/defining-pipelines

</details>

It's good practice to immediately commit `dvc.lock` to Git after its creation or
modification, to record the current state & results:

```cli
$ git add dvc.lock && git commit -m "first pipeline repro"
```

<details icon="gear">

### Learn how to parametrize and use cached results

Let's try to have a little bit of fun with it. First, change one of the
parameters for the training stage:

1. Open `params.yaml` and change `n_est` to `100`, and
2. (re)run `dvc repro`.

You will see:

```cli
$ dvc repro
Stage 'prepare' didn't change, skipping
Stage 'featurize' didn't change, skipping
Running stage 'train' with command: ...
```

DVC detected that only `train` should be run, and skipped everything else! All
the intermediate results are being reused.

Now, let's change it back to `50` and run `dvc repro` again:

```cli
$ dvc repro
Stage 'prepare' didn't change, skipping
Stage 'featurize' didn't change, skipping
```

As before, there was no need to rerun `prepare`, `featurize`, etc. But this time
it also doesn't rerun `train`! The previous run with the same set of inputs
(parameters & data) was saved in DVC's <abbr>run cache</abbr>, and was reused.

</details>

## Visualizing

Having built our pipeline, we need a good way to understand its structure.
Visualizing it as a graph of connected stages helps with that. DVC lets you do
so without leaving the terminal!

```cli
$ dvc dag
         +---------+
         | prepare |
         +---------+
              *
              *
              *
        +-----------+
        | featurize |
        +-----------+
              *
              *
              *
          +-------+
          | train |
          +-------+
```

<admon icon="book">

Refer to `dvc dag` to explore other ways this command can visualize a pipeline.

</admon>

## Summary

DVC pipelines (`dvc.yaml` file, `dvc stage add`, and `dvc repro` commands) solve
a few important problems:

- _Automation_: run a sequence of steps in a "smart" way which makes iterating
  on your project faster. DVC automatically determines which parts of a project
  need to be run, and it caches "runs" and their results to avoid unnecessary
  reruns.
- _Reproducibility_: `dvc.yaml` and `dvc.lock` files describe what data to use
  and which commands will generate the pipeline results (such as an ML model).
  Storing these files in Git makes it easy to version and share.
- [_Continuous Delivery and Continuous Integration (CI/CD) for ML_](/example-scenarios/ci-cd-for-machine-learning):
  describing projects in a way that can be built and reproduced is the first
  necessary step before introducing CI/CD systems. See our sister project
  [CML](https://cml.dev) for some examples.
