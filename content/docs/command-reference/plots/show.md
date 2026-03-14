# plots show

Generate [plots](/command-reference/plots) from any `plots` defined in
`dvc.yaml` (or any other target files).

## Synopsis

```usage
usage: dvc plots show [-h] [-q | -v] [-t <name_or_path>] [-x <field>]
                      [-y <field>] [--no-header] [--title <text>]
                      [--x-label <text>] [--y-label <text>] [-o <path>]
                      [--show-vega] [--open] [--html-template <path>]
                      [targets [targets ...]]

positional arguments:
  targets               Plots files or plot IDs from `dvc.yaml` to
                        visualize. Shows all plots by default.
```

## Description

This command provides a quick way to visualize [certain data] such as loss
functions, AUC curves, confusion matrices, etc.

All plots defined in `dvc.yaml` are used by default, but you can specify any
`targets`, which can be plots files or non-file [plot IDs] defined anywhere in
`dvc.yaml`, or any other files (they don't necessarily have to be defined in
`dvc.yaml`).

The plot style can be customized with [plot templates], using the `--template`
option. To learn more about plots file formats and templates, see `dvc plots`.

[certain data]:
  /user-guide/experiment-management/visualizing-plots#supported-plot-file-formats
[plot templates]:
  /user-guide/experiment-management/visualizing-plots#plot-templates-data-series-only
[plot ids]: /user-guide/project-structure/dvcyaml-files#plots
[stage plot]: /user-guide/experiment-management/visualizing-plots

## Options

- `-o <path>, --out <path>` - specify a directory to write the HTML file
  containing the plots. The default is `dvc_plots` or the value set with the
  [`plots.out_dir`](/user-guide/project-structure/configuration#plots) config
  option.

- `-t <name_or_path>, --template <name_or_path>` -
  [plot template](/user-guide/experiment-management/visualizing-plots#plot-templates-data-series-only)
  to be injected with data. The default template is `.dvc/plots/default.json`.
  See more details in `dvc plots`.

- `-x <field>` - field name from which the X axis data comes from. An
  auto-generated `index` field is used by default. See
  [Custom templates](/command-reference/plots/templates) for more information on
  this `index` field. Column names or numbers are expected for tabular plots
  files.

- `-y <field>` - field name from which the Y axis data comes from. The last
  field found in the `targets` is used by default. Column names or numbers are
  expected for tabular plots files.

- `--x-label <text>` - X axis label. The X field name is the default.

- `--y-label <text>` - Y axis label. The Y field name is the default.

- `--title <text>` - plot title.

- `--show-vega` - produce a [Vega-Lite](https://vega.github.io/vega-lite/) spec
  file instead of HTML. See `dvc plots` for more info.

- `--open` - open the HTML generated in a browser automatically. You can enable
  `dvc config plots.auto_open` to make this the default behavior.

- `--no-header` - lets DVC know that CSV or TSV `targets` do not have a header.
  A 0-based numeric index can be used to identify each column instead of names.

- `--html-template <path>` - path to a [custom HTML template](#html-templates).

- `-h`, `--help` - prints the usage/help message, and exit.

- `-q`, `--quiet` - do not write anything to standard output. Exit with 0 if no
  problems arise, otherwise 1.

- `-v`, `--verbose` - displays detailed tracing information.

## Example: Hierarchical data

We'll use hierarchical metrics file `train.json` for this example:

```json
{
  "train": [
    { "accuracy": 0.96658, "loss": 0.10757 },
    { "accuracy": 0.97641, "loss": 0.07324 },
    { "accuracy": 0.87707, "loss": 0.08136 },
    { "accuracy": 0.87402, "loss": 0.09026 },
    { "accuracy": 0.8795, "loss": 0.0764 },
    { "accuracy": 0.88038, "loss": 0.07608 },
    { "accuracy": 0.89872, "loss": 0.08455 }
  ]
}
```

<details icon="book">

### Expand for YAML format

Here's a corresponding `train.yaml` metrics file:

```yaml
train:
  - accuracy: 0.96658
    loss: 0.10757
  - accuracy: 0.97641
    loss: 0.07324
  - accuracy: 0.87707
    loss: 0.08136
  - accuracy: 0.87402
    loss: 0.09026
```

</details>

DVC identifies and plots JSON objects from the first JSON array found in the
file (`train`):

```cli
$ dvc plots show train.json
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show_json.svg)

> Note that only the last field name (`loss`) is used for the plot by default.

Use the `-y` option to change the field to plot:

```cli
$ dvc plots show -y accuracy train.json
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show_json_field.svg)

## Example: Tabular data

We'll use tabular metrics file `logs.csv` for these examples:

```
epoch,loss,accuracy
1,0.19,0.81
2,0.11,0.89
3,0.07,0.93
4,0.04,0.96
```

<details>

### Expand for TSV format

Here's a corresponding `train.tsv` metrics file:

```
epoch	loss	accuracy
1	0.19	0.81
2	0.11	0.89
3	0.07	0.93
4	0.04	0.96
```

</details>

By default, this command plots the last column of the table (see `-y` option):

```cli
$ dvc plots show logs.csv
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show.svg)

Use the `-y` option to change the column to plot:

```cli
$ dvc plots show logs.csv -y loss
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show_field.svg)

### Headerless tables

A tabular data file without headers can be plotted with `--no-header` option. A
column can be specified with `-y` by its numeric position (starting with `0`):

```cli
$ dvc plots show --no-header logs.csv -y 2
file:///Users/usr/src/dvc_plots/index.html
```

## Example: `dvc.yaml` plots

### Simple plot definition

Let's work with the following `logs.csv` data:

```
epoch,loss,accuracy
1,0.19,0.81
2,0.11,0.89
3,0.07,0.93
4,0.04,0.96
```

The minimal plot configuration we can put in `dvc.yaml` is the data source path:

```yaml
stages:
  train:
    cmd: ...

plots:
  - logs.csv
```

```cli
$ dvc plots show
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show_spec_default.svg)

We can also customize it:

```yaml
plots:
  - logs.csv:
      x: epoch
      y: accuracy
      title: Displaying accuracy
      x_label: This is epoch
      y_label: This is accuracy
```

```cli
$ dvc plots show
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show_spec_simple_custom.svg)

### Multiple data series plot

Data in `training_data.csv`:

```csv
epoch,train_loss,test_loss
1,0.33,0.4
2,0.3,0.28
3,0.2,0.25
4,0.1,0.23
```

Plot definition in `dvc.yaml`:

```yaml
plots:
  - test_vs_train_loss:
      x: epoch
      y:
        training_data.csv: [test_loss, train_loss]
      title: Compare loss training versus test
```

```cli
$ dvc plots show
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show_spec_multiple_columns.svg)

### Sourcing data from different files

Lets prepare a comparison for confusion matrix data between the
`train_classes.csv` and a `test_classes.csv` datasets (below):

```csv
actual_class,predicted_class
dog,dog
dog,dog
dog,dog
dog,bird
cat,cat
cat,cat
cat,cat
cat,dog
bird,bird
bird,bird
bird,bird
bird,dog
```

```csv
actual_class,predicted_class
dog,dog
dog,dog
dog,cat
bird,bird
bird,bird
bird,cat
cat,cat
cat,cat
cat,bird
```

In `dvc.yaml`:

```yaml
plots:
  - test_vs_train_confusion:
      x: actual_class
      y:
        train_classes.csv: predicted_class
        test_classes.csv: predicted_class
      title: Compare test vs train confusion matrix
      template: confusion
      x_label: Actual class
      y_label: Predicted class
```

```cli
$ dvc plots show
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show_spec_conf_train_test.svg)

### Sourcing `x` and `y` from different files

The actual and predicted classes may come from different data sources:

```csv
actual_class
dog
dog
dog
bird
bird
bird
cat
cat
cat
```

```csv
predicted_class
dog
dog
cat
bird
bird
cat
cat
cat
bird
```

In `dvc.yaml`:

```yaml
plots:
  - confusion:
      x:
        actual.csv: actual_class
      y:
        preds.csv: predicted_class
      template: confusion
```

```cli
$ dvc plots show
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show_spec_conf_diff_actual_pred.svg)

## Example: Vega-Lite specification file

In many automation scenarios (like
[CI/CD for ML](/example-scenarios/ci-cd-for-machine-learning)), it is convenient
to output the [Vega-Lite](https://vega.github.io/vega-lite/) spec file instead
of rendering an HTML plot. For example, to generating another image format like
PNG or JPEG, or to include it differently into a web/mobile app. The
`--show-vega` option prevents wrapping this plot spec in HTML, printing the
resulting JSON to standard output instead:

```cli
$ dvc plots show --show-vega logs.csv -y accuracy
```

```json
{
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "data": {
        "values": [
    {
        "accuracy": "0.9418667",
    ...
```

## Custom HTML templates

It's possible to supply an HTML file to `dvc plots show` and `dvc plots diff` by
using the `--html-template` option. This allows you to customize the container
where DVC will inject plots it generates.

> ⚠️ This is a separate feature from
> [custom Vega-Lite templates](/command-reference/plots/templates).

The only requirement for this HTML file is to specify the place to inject plots
with a `{plot_divs}` marker. See an [example](#example-offline-html-template)
that uses this feature to render DVC plots without an Internet connection,
below.

## Example: Offline HTML Template

The plots generated by `dvc plots` uses Vega-Lite JavaScript libraries, and by
default these load [online resources](https://vega.github.io/vega/usage/#embed).
There may be times when you need to produce plots without Internet access, or
want to customize the plots output to put some extra content, like banners or
extra text. DVC allows to replace the HTML file that contains the final plots.

Download the Vega-Lite libraries into the directory where you'll produce the
`dvc plots`:

```cli
$ wget https://cdn.jsdelivr.net/npm/vega@5.20.2 -O my_vega.js
$ wget https://cdn.jsdelivr.net/npm/vega-lite@5.1.0 -O my_vega_lite.js
$ wget https://cdn.jsdelivr.net/npm/vega-embed@6.18.2 -O my_vega_embed.js
```

Create the following HTML file and save it in `.dvc/plots/mypage.html`:

```html
<html>
  <head>
    <script src="../path/to/my_vega.js" type="text/javascript"></script>
    <script src="../path/to/my_vega_lite.js" type="text/javascript"></script>
    <script src="../path/to/my_vega_embed.js" type="text/javascript"></script>
  </head>
  <body>
    {plot_divs}
  </body>
</html>
```

Note that this is a standard HTML file with only `{plot_divs}` as a placeholder
for DVC to inject plots. `<script>` tags in this file point to the local
JavaScript libraries we downloaded above. We can use it like this:

```cli
$ dvc plots show --html-template .dvc/plots/mypage.html
```

You can also make it the default HTML template by setting it with DVC config
option [`plots.html_template`].

```cli
$ dvc config plots.html_template plots/mypage.html
```

Note that the path supplied to `dvc config plots.html_template` is relative to
`.dvc/` directory.

[`plots.html_template`]: /user-guide/project-structure/configuration#plots

## Example: Smooth plot

In some cases we would like to smooth our plot. In this example we will use a
noisy plot with 100 data points:

```cli
$ dvc plots show data.csv
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show_no_smooth.svg)

We can use the `-t` (`--template`) option and `smooth` template to make it less
noisy:

```cli
$ dvc plots show -t smooth data.csv
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show_smooth.svg)

## Example: Confusion matrix

We'll use `classes.csv` for this example:

```
actual,predicted
cat,cat
cat,cat
cat,cat
cat,dog
cat,dinosaur
cat,dinosaur
cat,bird
turtle,dog
turtle,cat
...
```

Let's visualize it:

```cli
$ dvc plots show classes.csv --template confusion \
                             -x actual -y predicted
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show_confusion.svg)

> A confusion matrix
> [template](/user-guide/experiment-management/visualizing-plots#plot-templates-data-series-only)
> is predefined in DVC.

We can use `confusion_normalized` template to normalize the results:

```cli
$ dvc plots show classes.csv -t confusion_normalized \
                             -x actual -y predicted
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show_confusion_normalized.svg)

## Example: Horizontal bar plot

This is a simple bar plot useful for example in visualizing model feature
importances.

We'll use `importances.csv` for this example:

```
feature_name,feature_importance
petal_width,0.4
petal_length,0.33
sepal_width,0.24
sepal_length,0.03
```

Let's visualize it:

```cli
$ dvc plots show importances.csv --template bar_horizontal \
                             -x feature_importance -y feature_name
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show_bar_horizontal.svg)

When using the `bar_horizontal` template the plot is sorted by the vertical axis
(in our example this means alphabetically, by feature name).

If you want it to be sorted by the horizontal axis (by feature importance in the
example) you can use the `bar_horizontal_sorted` template instead:

```cli
$ dvc plots show importances.csv -t bar_horizontal_sorted \
                             -x feature_importance -y feature_name
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show_bar_horizontal_sorted.svg)

## Example: Scatter plot

Let's make a scatter plot of actual numeric classes compared to predicted
probabilities for those classes, using `probs.json` that looks like this:

```
[
  {"actual": 7, "prob": 0.2525983154773712},
  {"actual": 1, "prob": 0.6300574541091919},
  ...
]
```

```cli
$ dvc plots show probs.json -t scatter \
                             -x actual -y prob
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_show_scatter.svg)
