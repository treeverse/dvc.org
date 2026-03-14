# Defining Pipelines

Pipelines represent data workflows that you want to **reproduce** reliably -- so
the results are consistent. The typical pipelining process involves:

- Obtain and `dvc add` or `dvc import` the project's initial data requirements
  (see [Data Versioning]). This <abbr>caches</abbr> the data and generates
  `.dvc` files.

- Define the pipeline [stages](#stages) in `dvc.yaml` files (more on this
  later). Example structure:

  ```yaml
  stages:
    prepare: ... # stage 1 definition
    train: ... # stage 2 definition
    evaluate: ... # stage 3 definition
  ```

- Capture other useful metadata such as runtime
  [parameters](#parameter-dependencies), performance [metrics], and [plots] to
  visualize. DVC supports multiple file formats for these.

<admon type="info">

We call this file-based definition _codification_ (YAML format in our case). It
has the added benefit of allowing you to develop pipelines on standard Git
workflows (and [GitOps]).

[gitops]: /example-scenarios/versioning-data-and-models

</admon>

Stages usually take some data and run some code, producing an output (e.g. an ML
model). The pipeline is formed by making them interdependent, meaning that the
output of a stage becomes the input of another, and so on. Technically, this is
called a _dependency graph_ (DAG).

Note that while each pipeline is a graph, this doesn't mean a single `dvc.yaml`
file. DVC checks the entire <abbr>project</abbr> tree and validates all such
files to find stages, rebuilding all the pipelines that these may define.

[data versioning]: /start
[metrics]: /command-reference/metrics
[plots]: /user-guide/experiment-management/visualizing-plots

<details icon="bulb">

### Directed Acyclic Graph (DAG)

DVC represents a pipeline internally as a _graph_ where the nodes are stages and
the edges are _directed_ dependencies (e.g. A before B). And in order for DVC to
run a pipeline, its topology should be _acyclic_ -- because executing cycles
(e.g. A -> B -> C -> A ...) would continue indefinitely. [More about DAGs].

Use `dvc dag` to visualize (or export) them.

[more about dags]: /user-guide/pipelines/running-pipelines#dag

</details>

## Stages

<admon type="tip">

See the full [specification] of stage entries.

[specification]: /user-guide/project-structure/dvcyaml-files#stage-entries

</admon>

Each stage wraps around an executable shell [command] and specifies any
file-based [dependencies](#simple-dependencies) as well as [outputs](#outputs).
Let's look at a sample stage: it depends on a script file it runs as well as on
a raw data input (ideally [tracked by DVC](/start) already):

```yaml
stages:
  prepare:
    cmd: source src/cleanup.sh
    deps:
      - src/cleanup.sh
      - data/raw
    outs:
      - data/clean.csv
```

<admon type="info">

We use [GNU/Linux](https://www.gnu.org/software/software.html) in these
examples, but Windows or other shells can be used too.

</admon>

Besides writing `dvc.yaml` files manually (recommended), you can also create
stages with `dvc stage add` -- a limited command-line interface to setup
pipelines. Let's add another stage this way and look at the resulting
`dvc.yaml`:

```cli
$ dvc stage add --name train \
                --deps src/model.py \
                --deps data/clean.csv \
                --outs data/predict.dat \
                python src/model.py data/clean.csv
```

```yaml
stages:
  prepare:
    ...
    outs:
      - data/clean.csv
  train:
    cmd: python src/model.py data/model.csv
    deps:
      - src/model.py
      - data/clean.csv
    outs:
      - data/predict.dat
```

<admon type="tip">

One advantage of using `dvc stage add` is that it will verify the validity of
the arguments provided (otherwise stage definition won't be checked until
execution). A disadvantage is that some advanced features such as [templating]
are not available this way.

[command]: /user-guide/project-structure/dvcyaml-files#stage-commands
[templating]: /user-guide/project-structure/pipelines-files#templating

</admon>

Notice that the new `train` stage depends on the output from stage `prepare`
(`data/clean.csv`), forming the pipeline ([DAG](#directed-acyclic-graph-dag)).

<admon type="info">

Stage execution sequences will be determined entirely by the DAG, not by the
order in which stages are found in `dvc.yaml`.

</admon>

## Simple dependencies

There's more than one type of stage dependency. A simple dependency is a file or
directory used as input by the stage command. When it's contents have changed,
DVC "invalidates" the stage -- it knows that it needs to run again (see
`dvc status`). This in turn may cause a chain reaction in which subsequent
stages of the <abbr>pipeline</abbr> are also reproduced.

<admon type="info">

DVC [calculates a hash] of file/dir contents to compare vs. previous versions.
This is a distinctive mechanism over traditional build tools like `make`.

[calculates a hash]:
  /user-guide/project-structure/internal-files#structure-of-the-cache-directory

</admon>

File system-level dependencies are defined in the `deps` field of `dvc.yaml`
stages; Alternatively, using the `--deps` (`-d`) option of `dvc stage add` (see
the previous section's example).

## Parameter dependencies

A more granular type of dependency is the parameter (`params` field of
`dvc.yaml`), or _hyperparameters_ in machine learning. These are any values used
inside your code to tune data processing, or that affect stage execution in any
other way. For example, training a [Neural Network] usually requires _batch
size_ and _epoch_ values.

Instead of hard-coding param values, your code can read them from a structured
file (e.g. YAML format). DVC can track any key/value pair in a supported
[parameters file] (`params.yaml` by default). Params are granular dependencies
because DVC only invalidates stages when the corresponding part of the params
file has changed.

```yaml
stages:
  train:
    cmd: ...
    deps: ...
    params: # from params.yaml
      - learning_rate
      - nn.epochs
      - nn.batch_size
    outs: ...
```

<admon type="info">

See [more details] about this syntax.

</admon>

Use `dvc params diff` to compare parameters across project versions.

[parameters file]: /user-guide/project-structure/dvcyaml-files#parameters-files
[neural network]:
  https://machinelearningmastery.com/difference-between-a-batch-and-an-epoch/
[more details]: /user-guide/project-structure/dvcyaml-files#parameters

## Outputs

Stage outputs are files (or directories) written by <abbr>pipelines</abbr>, for
example machine learning models and intermediate artifacts. These files are
<abbr>cached</abbr> by DVC automatically, and tracked with the help of
`dvc.lock` files (or `.dvc` files, see `dvc add`).

Outputs can be dependencies of subsequent stages (as explained earlier). So when
they change, DVC may need to reproduce downstream stages as well (handled
automatically).

DVC can also track [metrics] and [plots] files, which can optionally be added as
stage outputs, or even added with `cache: false` in `dvc.yaml` since they are
often small enough to store in Git.

<admon type="info">

Outputs are produced by [stage commands][command]. DVC does not make any
assumption regarding this process; they should just match the path specified in
`dvc.yaml`.

</admon>
