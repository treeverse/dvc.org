# `dvc.yaml`

You can configure machine learning projects in one or more `dvc.yaml` files. The
list of [`stages`](#stages) is typically the most important part of a `dvc.yaml`
file, though the file can also be used to configure [`artifacts`](#artifacts),
[`metrics`](#metrics), [`params`](#params), and [`plots`](#plots), either as
part of a stage definition or on their own.

`dvc.yaml` uses the [YAML 1.2](https://yaml.org/) format and a human-friendly
schema explained below. We encourage you to get familiar with it so you may
modify, write, or generate them by your own means.

`dvc.yaml` files are designed to be small enough so you can easily version them
with Git along with other <abbr>DVC files</abbr> and your project's code.

## Artifacts

This section allows you to declare structured metadata about your
<abbr>artifacts</abbr>.

```yaml
artifacts:
  cv-classification: # artifact ID (name)
    path: models/resnet.pt
    type: model
    desc: 'CV classification model, ResNet50'
    labels:
      - resnet50
      - classification
    meta:
      framework: pytorch
```

For every artifact ID you can specify the following elements (only `path` is
mandatory):

- `path` (_string_) - The path to the artifact, either relative to the root of
  the repository or a full path in an external storage such as S3.
- `type` (_string_) - You can specify artifacts of any `type`. By default, the
  DVC-based <abbr>model registry</abbr> will show any artifacts with type
  `model` (you can adjust the filters to also show artifacts of other types).
- `desc` (_string_) - A description of your artifact
- `labels` (_list_) - Any labels you want to add to the artifact
- `meta` - Any extra extra information, the content of this element will be
  ignored by DVC and will not show up in the <abbr>model registry</abbr>

Artifact IDs must consist of letters and numbers, and use '-' as separator (but
not at the start or end).

<admon icon="bulb">

To migrate from the old GTO-based Model Registry by moving artifact annotations
from `artifacts.yaml` to `dvc.yaml`, use
[this helper script](https://gist.github.com/aguschin/9ad9ee8adf02a42d08dda92ee6d4497f).

</admon>

## Metrics

The list of `metrics` contains one or more paths to <abbr>metrics</abbr> files.
Here's an example:

```yaml
metrics:
  - metrics.json
```

Metrics are key/value pairs saved in structured files that map a metric name to
a numeric value. See `dvc metrics` for more information and how to compare among
experiments, or [DVCLive] for a helper to log metrics.

## Params

The list of `params` contains one or more paths to <abbr>parameters</abbr>
files. Here's an example:

```yaml
params:
  - params.yaml
```

Parameters are key/value pairs saved in structured files. Unlike stage-level
[parameter dependencies](#parameters), which are granular, top-level parameters
are defined at the file level and include all parameters in the file. See
`dvc params` for more information and how to compare between experiments.

## Plots

The list of `plots` contains one or more user-defined `dvc plots`
configurations. Every plot must have a unique ID, which may be either a file or
directory path (relative to the location of `dvc.yaml`) or an arbitrary string.
If the ID is an arbitrary string, a file path must be provided in the `y` field
(`x` file path is always optional and cannot be the only path provided).

<admon icon="book">

Refer to [Visualizing Plots] and `dvc plots show` for more examples, and refer
to [DVCLive] for a helper to log plots.

[visualizing plots]: /user-guide/experiment-management/visualizing-plots

</admon>

### Available configuration fields

- `y` (_string, list, dict_) - source for the Y axis data:

  If plot ID is a path, one or more column/field names is expected, or the last
  column/field is used by default. For example:

  ```yaml
  plots:
    - regression_hist.csv:
        y: mean_squared_error
    - classifier_hist.csv:
        y: [acc, loss]
  ```

  If plot ID is an arbitrary string, a dictionary of file paths mapped to
  column/field names is expected. For example:

  ```yaml
  plots:
    - train_val_test:
        y:
          train.csv: [train_acc, val_acc]
          test.csv: test_acc
  ```

- `x` (_string, dict_) - source for the X axis data. An auto-generated _step_
  field is used by default.

  If plot ID is a path, one column/field name is expected. For example:

  ```yaml
  plots:
    - classifier_hist.csv:
        y: [acc, loss]
        x: epoch
  ```

  If plot ID is an arbitrary string, `x` may either be one column/field name, or
  a dictionary of file paths each mapped to one column/field name (the number of
  column/field names must match the number in `y`).

  ```yaml
  plots:
    - train_val_test: # single x
        y:
          train.csv: [train_acc, val_acc]
          test.csv: test_acc
        x: epoch
    - roc_vs_prc: # x dict
        y:
          precision_recall.json: precision
          roc.json: tpr
        x:
          precision_recall.json: recall
          roc.json: fpr
    - confusion: # different x and y paths
        y:
          dir/preds.csv: predicted
        x:
          dir/actual.csv: actual
        template: confusion
  ```

- `y_label` (_string_) - Y axis label. If all `y` data sources have the same
  field name, that will be the default. Otherwise, it's "y".

- `x_label` (_string_) - X axis label. If all `y` data sources have the same
  field name, that will be the default. Otherwise, it's "x".

- `title` (_string_) - header for the plot(s). Defaults to
  `path/to/dvc.yaml::plot_id`.

- `template` (_string_) - [plot template]. Defaults to `linear`.

[plot template]:
  /user-guide/experiment-management/visualizing-plots#plot-templates-data-series-only

## Stages

You can construct machine learning pipelines by defining individual
[stages](/command-reference/stage/add) in one or more `dvc.yaml` files. Stages
constitute a pipeline when they connect with each other (forming a [dependency
graph], see `dvc dag`).

[dependency graph]:
  /user-guide/pipelines/defining-pipelines#directed-acyclic-graph-dag

The list of `stages` contains one or more user-defined <abbr>stages</abbr>.
Here's a simple one named `transpose`:

```yaml
stages:
  transpose:
    cmd: ./trans.r rows.txt > columns.txt
    deps:
      - rows.txt
    outs:
      - columns.txt
```

<admon type="tip">

A helper command group, `dvc stage`, is available to create and list stages.

</admon>

The only required part of a stage it's the shell command(s) it executes (`cmd`
field). This is what DVC runs when the stage is reproduced (see `dvc repro`).

<admon type="info">

We use [GNU/Linux](https://www.gnu.org/software/software.html) in our examples,
but Windows or other shells can be used too.

</admon>

If a [stage command](#stage-commands) reads input files, these (or their
directory locations) can be defined as <abbr>dependencies</abbr> (`deps`). DVC
will check whether they have changed to decide whether the stage requires
re-execution (see `dvc status`).

If it writes files or directories, these can be defined as <abbr>outputs</abbr>
(`outs`). DVC will track them going forward (similar to using `dvc add` on
them).

<admon type="tip">

Output files may be viable data sources for [plots](#plots).

</admon>

<admon type="info">

See the full stage entry [specification](#stage-entries).

</admon>

### Stage commands

The command(s) defined in the `stages` (`cmd` field) can be anything your system
terminal would accept and run, for example a shell built-in, an expression, or a
binary found in `PATH`.

Surround the command with double quotes `"` if it includes special characters
like `|` or `<`, `>`. Use single quotes `'` instead if there are environment
variables in it that should be evaluated dynamically.

The same applies to the `command` argument for helper commands
(`dvc stage add`), otherwise they would apply to the DVC call itself:

```cli
$ dvc stage add -n a_stage "./a_script.sh > /dev/null 2>&1"
```

<admon type="tip">

See also [Templating](#templating) (and **Dictionary unpacking**) for useful
ways to parametrize `cmd` strings.

</admon>

<details icon="bulb">

### Avoiding unexpected behavior

We don't want to tell anyone how to write their code or what programs to use!
However, please be aware that in order to prevent unexpected results when DVC
reproduces pipeline stages, the underlying code should ideally follow these
rules:

- Read/write exclusively from/to the specified <abbr>dependencies</abbr> and
  <abbr>outputs</abbr> (including parameters files, metrics, and plots).
- Completely rewrite outputs. Do not append or edit.
- Stop reading and writing files when the `command` exits.

Also, if your pipeline reproducibility goals include consistent output data, its
code should be
[deterministic](https://en.wikipedia.org/wiki/Deterministic_algorithm) (produce
the same output for any given input): avoid code that increases
[entropy](https://en.wikipedia.org/wiki/Software_entropy) (e.g. random numbers,
time functions, hardware dependencies, etc.).

</details>

### Parameters

<abbr>Parameters</abbr> are simple key/value pairs consumed by the `command`
code from a structured [parameters file](#parameters-files). They are defined
per-stage in the `params` field of `dvc.yaml` and should contain one of these:

1. A param name that can be found in `params.yaml` (default params file);
2. A dictionary named by the file path to a custom params file, and with a list
   of param key/value pairs to find in it;
3. An empty set (give no value or use `null`) named by the file path to a params
   file: to track all the params in it dynamically.

<admon type="info">

Dot-separated param names become tree paths to locate values in the params file.

</admon>

```yaml
stages:
  preprocess:
    cmd: bin/cleanup raw.txt clean.txt
    deps:
      - raw.txt
    params:
      - threshold # track specific param (from params.yaml)
      - nn.batch_size
      - myparams.yaml: # track specific params from custom file
          - epochs
      - config.json: # track all parameters in this file
    outs:
      - clean.txt
```

<admon type="tip">

Params are a more granular type of stage dependency: multiple `stages` can use
the same params file, but only certain values will affect their state (see
`dvc status`).

</admon>

#### Parameters files

The supported params file formats are YAML 1.2, JSON, TOML 1.0, [and Python].
[Parameter](#parameters) key/value pairs should be organized in tree-like
hierarchies inside. Supported value types are: string, integer, float, boolean,
and arrays (groups of params).

These files are typically written manually (or generated) and they can be
versioned directly with Git along with other <abbr>workspace</abbr> files.

[and python]: /command-reference/params#examples-python-parameters-file

<admon type="tip">

See also `dvc params diff` to compare params across project version.

</admon>

### `foreach` stages

<admon type="info">

Checkout [`matrix` stages](#matrix-stages) for a more powerful way to define
multiple stages.

</admon>

You can define more than one stage in a single `dvc.yaml` entry with the
following syntax. A `foreach` element accepts a list or dictionary with values
to iterate on, while `do` contains the regular stage fields (`cmd`, `outs`,
etc.). Here's a simple example:

```yaml
stages:
  cleanups:
    foreach: # List of simple values
      - raw1
      - labels1
      - raw2
    do:
      cmd: clean.py "${item}"
      outs:
        - ${item}.cln
```

Upon `dvc repro`, each item in the list is expanded into its own stage by
substituting its value in expression `${item}`. The item's value is appended to
each stage name after a `@`. The final stages generated by the `foreach` syntax
are saved to `dvc.lock`:

```yaml
schema: '2.0'
stages:
  cleanups@labels1:
    cmd: clean.py "labels1"
    outs:
      - path: labels1.cln
  cleanups@raw1:
    cmd: clean.py "raw1"
    outs:
      - path: raw1.cln
  cleanups@raw2:
    cmd: clean.py "raw2"
    outs:
      - path: raw2.cln
```

For lists containing complex values (e.g. dictionaries), the substitution
expression can use the `${item.key}` form. Stage names will be appended with a
zero-based index. For example:

```yaml
stages:
  train:
    foreach:
      - epochs: 3
        thresh: 10
      - epochs: 10
        thresh: 15
    do:
      cmd: python train.py ${item.epochs} ${item.thresh}
```

```yaml
# dvc.lock
schema: '2.0'
stages:
  train@0:
    cmd: python train.py 3 10
  train@1:
    cmd: python train.py 10 15
```

DVC can also iterate on a dictionary given directly to `foreach`, resulting in
two substitution expressions being available: `${key}` and `${item}`. The former
is used for the stage names:

```yaml
stages:
  build:
    foreach:
      uk:
        epochs: 3
        thresh: 10
      us:
        epochs: 10
        thresh: 15
    do:
      cmd: python train.py '${key}' ${item.epochs} ${item.thresh}
      outs:
        - model-${key}.hdfs
```

```yaml
# dvc.lock
schema: '2.0'
stages:
  build@uk:
    cmd: python train.py 'uk' 3 10
    outs:
      - path: model-uk.hdfs
        md5: 17b3d1efc339b416c4b5615b1ce1b97e
  build@us: ...
```

<admon type="tip">

Both resulting stages (`train@1`, `build@uk`) and source groups (`train`,
`build`) may be used in commands that accept stage targets, such as `dvc repro`
and `dvc stage list`.

</admon>

Importantly, dictionaries from
[parameters files](/command-reference/params#examples) can be used in `foreach`
stages as well:

```yaml
stages:
  mystages:
    foreach: ${myobject} # From params.yaml
    do:
      cmd: ./script.py ${key} ${item.prop1}
      outs:
        - ${item.prop2}
```

<admon type="tip">

Both individual foreach stages (`train@1`) and groups of foreach stages
(`train`) may be used in commands that accept stage targets.

</admon>

### `matrix` stages

`matrix` allows you do to define multiple stages based on combinations of
variables. A `matrix` element accepts one or more variables, each iterating over
a list of values. For example:

```yaml
stages:
  train:
    matrix:
      model: [cnn, xgb]
      feature: [feature1, feature2, feature3]
    cmd: ./train.py --feature ${item.feature} ${item.model}
    outs:
      - ${key}.pkl # equivalent to: ${item.model}-${item.feature}.pkl
```

You can reference each variable in your stage definition using the `item`
dictionary key. In the above example, you can access `item.model` and
`item.feature`. Moreover, `matrix` exposes a `key` value, which combines the
current `item` values into one expression (see example below).

On `dvc repro`, dvc will expand the definition to multiple stages for each
possible combination of the variables. In the above example, dvc will create six
stages, one for each combination of `model` and `feature`. The name of the
stages will be generated by appending values of the variables to the stage name
after a `@` as with [foreach](#foreach). For example, dvc will create the
following stages:

```cli
$ dvc stage list
train@cnn-feature1  Outputs cnn-feature1.pkl
train@cnn-feature2  Outputs cnn-feature2.pkl
train@cnn-feature3  Outputs cnn-feature3.pkl
train@xgb-feature1  Outputs xgb-feature1.pkl
train@xgb-feature2  Outputs xgb-feature2.pkl
train@xgb-feature3  Outputs xgb-feature3.pkl
```

Both individual matrix stages (eg: `train@cnn-feature1`) and group of matrix
stages (`train`) may be used in commands that accept stage targets.

The values in variables can be simple values such as string, integer, etc and
composite values such as list, dictionary, etc. For example:

```yaml
matrix:
  config:
    - n_estimators: 150
      max_depth: 20
    - n_estimators: 120
      max_depth: 30
  labels:
    - [label1, label2, label3]
    - [labelX, labelY, labelZ]
```

When using a list or a dictionary, dvc will generate the name of stages based on
variable name and the index of the value. In the above example, generated stages
may look like `train@labels0-config0`.

[Templating](#templating) can also be used inside `matrix`, so you can reference
[variables](#variables) defined elsewhere. For example, you can define values in
`params.yaml` file and use them in `matrix`.

```yaml
# params.yaml
datasets: [dataset1/, dataset2/]
processors: [processor1, processor2]
```

```yaml{4-6}
# dvc.yaml
stages:
  preprocess:
    matrix:
      processor: ${processors}
      dataset: ${datasets}

    cmd: ./preprocess.py ${item.dataset} ${item.processor}
    deps:
    - ${item.dataset}
    outs:
    - ${item.dataset}-${item.processor}.json
```

### Stage entries

These are the fields that are accepted in each stage:

| Field            | Description                                                                                                                                                                                                                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cmd`            | (Required) One or more shell commands to execute (may contain either a single value or a list). `cmd` values may use [dictionary substitution](#dictionary-unpacking) from param files. Commands are executed sequentially until all are finished or until one of them fails (see `dvc repro`). |
| `wdir`           | Working directory for the `cmd` to run in (relative to the file's location). Any paths in other fields are also based on this. It defaults to `.` (the file's location).                                                                                                                        |
| `deps`           | List of <abbr>dependency</abbr> paths (relative to `wdir`).                                                                                                                                                                                                                                     |
| `outs`           | List of <abbr>output</abbr> paths (relative to `wdir`). These can contain certain optional [subfields](#output-subfields).                                                                                                                                                                      |
| `params`         | List of <abbr>parameter</abbr> dependency keys (field names) to track from `params.yaml` (in `wdir`). The list may also contain other parameters file names, with a sub-list of the param names to track in them.                                                                               |
| `frozen`         | Whether or not this stage is frozen (prevented from execution during reproduction)                                                                                                                                                                                                              |
| `always_changed` | Causes this stage to be always considered as [changed] by commands such as `dvc status` and `dvc repro`. `false` by default                                                                                                                                                                     |
| `meta`           | (Optional) arbitrary metadata can be added manually with this field. Any YAML content is supported. `meta` contents are ignored by DVC, but they can be meaningful for user processes that read or write `.dvc` files directly.                                                                 |
| `desc`           | (Optional) user description. This doesn't affect any DVC operations.                                                                                                                                                                                                                            |

[changed]: /command-reference/status#local-workspace-status

`dvc.yaml` files also support `# comments`.

<admon type="tip">

We maintain a `dvc.yaml` [schema] that can be used by editors like [VSCode] or
[PyCharm] to enable automatic syntax validation and auto-completion.

[schema]: https://github.com/treeverse/dvcyaml-schema
[vscode]: /install/plugins#visual-studio-code
[pycharm]: /install/plugins#pycharmintellij

</admon>

<admon type="info">

See also [How to Merge Conflicts](/user-guide/how-to/merge-conflicts#dvcyaml).

</admon>

### Output subfields

<admon type="info">

These include a subset of the fields in `.dvc` file
[output entries](/user-guide/project-structure/dvc-files#output-entries).

</admon>

| Field     | Description                                                                                                                                                                                                                               |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cache`   | Whether or not this file or directory is <abbr>cached</abbr> (`true` by default). See the `--no-commit` option of `dvc add`. If any output of a stage has `cache: false`, the [<abbr>run cache</abbr> will be deactivated for that stage. |
| `remote`  | (Optional) Name of the remote to use for pushing/fetching                                                                                                                                                                                 |
| `persist` | Whether the output file/dir should remain in place during `dvc repro` (`false` by default: outputs are deleted when `dvc repro` starts)                                                                                                   |
| `desc`    | (Optional) User description for this output. This doesn't affect any DVC operations.                                                                                                                                                      |
| `push`    | Whether or not this file or directory, when previously <abbr>cached</abbr>, is uploaded to remote storage by `dvc push` (`true` by default).                                                                                              |

## Templating

`dvc.yaml` supports a templating format to insert values from different sources
in the YAML structure itself. These sources can be
[parameters files](/command-reference/params), or `vars` defined in `dvc.yaml`
instead.

Let's say we have `params.yaml` (default params file) with the following
contents:

```yaml
models:
  us:
    threshold: 10
    filename: 'model-us.hdf5'
codedir: src
```

Those values can be used anywhere in `dvc.yaml` with the `${}` _substitution
expression_, for example to pass parameters as command-line arguments to a
[stage command](#stage-command):

<!-- prettier-ignore-start -->
```yaml
artifacts:
  model-us:
    path: ${models.us.filename}
    type: model

stages:
  build-us:
    cmd: >-
      python ${codedir}/train.py
      --thresh ${models.us.threshold}
      --out ${models.us.filename}
    outs:
      - ${models.us.filename}:
          cache: true
```
<!-- prettier-ignore-end -->

DVC will track simple param values (numbers, strings, etc.) used in `${}` (they
will be listed by `dvc params diff`).

<details>

### Dictionary unpacking

Only inside the `cmd` entries, you can also reference a dictionary inside `${}`
and DVC will _unpack_ it. This can be useful to avoid writing every argument
passed to the command, or having to modify `dvc.yaml` when arguments change.

<admon type="tip">

An alternative to load parameters from Python code is the
`dvc.api.params_show()` API function.

</admon>

For example, given the following `params.yaml`:

```yaml
mydict:
  foo: foo
  bar: 1
  bool: true
  nested:
    baz: bar
  list: [2, 3, 'qux']
```

You can reference `mydict` in a stage command like this:

```yaml
stages:
  train:
    cmd: R train.r ${mydict}
```

DVC will unpack the values inside `mydict`, creating the following `cmd` call:

```cli
$ R train.r --foo 'foo' --bar 1 --bool \
                  --nested.baz 'bar' --list 2 3 'qux'
```

<admon type="tip">

You can combine this with argument parsing libraries such as [R argparse] or
[Julia ArgParse] to do all the work for you.

[r argparse]:
  https://cran.r-project.org/web/packages/argparse/vignettes/argparse.html
[julia argparse]: https://argparsejl.readthedocs.io/en/latest/argparse.html

</admon>

<admon icon="book">

`dvc config parsing` can be used to customize the syntax used for ambiguous
types like booleans and lists.

</admon>

</details>

### Variables

Alternatively (to relying on parameter files), values for substitution can be
listed as top-level `vars` like this:

```yaml
vars:
  - models:
      us:
        threshold: 10
        filename: 'model-us.hdf5'
  - codedir: src

artifacts:
  model-us:
    path: ${models.us.filename}
    type: model

stages:
  build-us:
    cmd: >-
      python ${codedir}/train.py --thresh ${models.us.threshold} --out
      ${models.us.filename}
    outs:
      - ${models.us.filename}:
          cache: true
```

<admon type="warn">

Values from `vars` are not tracked like parameters.

</admon>

To load additional params files, list them in the top-level `vars`, in the
desired order, e.g.:

```yaml
vars:
  - params.json
  - myvar: 'value'
  - config/myapp.yaml
```

If you have multiple pipelines in your repository, or if your `params.yaml` file
is not in the same directory as the `dvc.yaml` file, you must specify the params
file path in `vars` in order to use the values for templating.

<admon type="info" title="Notes">

Param file paths will be evaluated relative to the directory the `dvc.yaml` file
is in. The default `params.yaml` is always loaded first, if present.

</admon>

It's also possible to specify what to include from additional params files, with
a `:` colon:

```yaml
vars:
  - params.json:clean,feats

stages:
  featurize:
    cmd: ${feats.exec}
    deps:
      - ${clean.filename}
    outs:
      - ${feats.dirname}
```

DVC merges values from param files or values specified in `vars`. For example,
`{"grp": {"a": 1}}` merges with `{"grp": {"b": 2}}`, but not with
`{"grp": {"a": 7}}`.

The substitution expression supports these forms:

```yaml
${param} # Simple
${param.key} # Nested values through . (period)
${param.list[0]} # List elements via index in [] (square brackets)
```

<admon type="info">

To use the expression literally in `dvc.yaml` (so DVC does not replace it for a
value), escape it with a backslash, e.g. `\${...`.

</admon>

## dvc.lock file

To record the state of your pipeline(s) and help track its <abbr>outputs</abbr>,
DVC will maintain a `dvc.lock` file for each `dvc.yaml`. Their purposes include:

- Allow DVC to detect when stage definitions, or their <abbr>dependencies</abbr>
  have changed. Such conditions invalidate stages, requiring their reproduction
  (see `dvc status`).
- Tracking of intermediate and final outputs of a pipeline — similar to `.dvc`
  files.
- Needed for several DVC commands to operate, such as `dvc checkout` or
  `dvc get`.

<admon type="warn">

Avoid editing these files. DVC will create and update them for you.

</admon>

Here's an example:

```yaml
schema: '2.0'
stages:
  features:
    cmd: jupyter nbconvert --execute featurize.ipynb
    deps:
      - path: data/clean
        md5: d8b874c5fa18c32b2d67f73606a1be60
    params:
      params.yaml:
        levels.no: 5
    outs:
      - path: features
        md5: 2119f7661d49546288b73b5730d76485
        size: 154683
      - path: performance.json
        md5: ea46c1139d771bfeba7942d1fbb5981e
        size: 975
      - path: logs.csv
        md5: f99aac37e383b422adc76f5f1fb45004
        size: 695947
```

Stages are listed again in `dvc.lock`, in order to know if their definitions
change in `dvc.yaml`.

Regular
[dependency entries](/user-guide/project-structure/dvc-files#dependency-entries)
and all forms of
[output entries](/user-guide/project-structure/dvc-files#output-entries)
(including [metrics](/command-reference/metrics) and
[plots](/command-reference/plots) files) are also listed (per stage) in
`dvc.lock`, including a content hash field (`md5`, `etag`, or `checksum`).

Full <abbr>parameter dependencies</abbr> (both key and value) are listed too
(under `params`), under each parameters file name.
[templated `dvc.yaml`](#templating) files, the actual values are written to
`dvc.lock` (no `${}` expression). As for [`foreach` stages](#foreach-stages) and
[`matrix` stages](#matrix-stages), individual stages are expanded (no `foreach`
or `matrix` structures are preserved).

[DVCLive]: /dvclive
