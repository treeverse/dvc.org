# plots templates

List built-in plots templates, or show JSON specification for one so that you
can save and customize it.

## Synopsis

```usage
usage: dvc plots templates [-h] [-q | -v] [template]

positional arguments:
 template    Template for which to show JSON specification.
             List all template names by default.
```

## Description

By default, lists the names of all available built-in templates.

Sometimes you may need to customize the way `dvc plots` are rendered beyond what
the built-in [plot templates] allow. You can get the JSON specification for a
specific built-in template by providing it's name as argument, for example
`dvc plots templates confusion`. To modify them, use any valid elements of the
[Vega-Lite specification].

<admon type="note">

Note that templates can only be used with [data-series plots].

</admon>

### Custom templates

Plot templates are [Vega-Lite](https://vega.github.io/vega-lite/) JSON
specifications. Save custom templates as JSON files under `.dvc/plots`, like
`.dvc/plots/custom.json`. Then you can refer to that custom template like
`dvc plots show --template custom`. In `dvc.yaml`, you can set the template like
`template: custom`.

Templates use predefined DVC anchors as placeholders for DVC to inject the plot
values.

#### **Required**

- `<DVC_METRIC_DATA>` - the plot data from any type of metrics files is
  converted to a single JSON array, and injected instead of this anchor. Two
  additional fields will be added: `step` and `rev` (explained below).

#### Optional

- `<DVC_METRIC_TITLE>` - a title for the plot, that can be defined with the
  `title` [field] in `dvc.yaml` or the `--title` option of the `dvc plots`
  subcommands.

- `<DVC_METRIC_X>` - field name of the data for the X axis. It can be defined
  with the `x` [field] in `dvc.yaml` or the `-x` option of the `dvc plots`
  subcommands. The auto-generated `step` field (explained below) is the default.

- `<DVC_METRIC_Y>` - field name of the data for the Y axis. It can be defined
  with the `y` [field] in `dvc.yaml` or the `-y` option of the `dvc plots`
  subcommands. It defaults to the last header of the metrics file: the last
  column for CSV/TSV, or the last field for JSON/YAML.

- `<DVC_METRIC_X_LABEL>` - field name to display as the X axis label. It can be
  defined with the `x_label` [field] in `dvc.yaml` or the `--x-label` option of
  the `dvc plots` subcommands.

- `<DVC_METRIC_Y_LABEL>` - field name to display as the Y axis label. It can be
  defined with the `y_label` [field] in `dvc.yaml` or the `--y-label` option of
  the `dvc plots` subcommands.

- `<DVC_METRIC_COLOR>` - used to group experiment/commit information across
  separate plots by applying a static color to rev mapping. The mapping is
  auto-generated in the case of the `dvc plots` subcommands but can be selected
  through the UI in the [DVC extension for VS Code] and DVC Studio.

- `<DVC_METRIC_PLOT_HEIGHT>`- used by the VS Code extension/Studio to
  dynamically resize the height of plots.

- `<DVC_METRIC_PLOT_WIDTH>` - used by the VS Code extension/Studio to
  dynamically resize the width of plots.

Please see the default templates for examples of how to use these anchors.

<details>

### Expand to learn how DVC modifies plot data for rendering.

File targets given to `dvc plots show` and `dvc plots diff` are treated as
separate data series, each to be injected into a template file. There are two
important fields that DVC adds to the plot data:

- `step` - zero-based counter for the data rows/values. In many cases it
  corresponds to a machine learning training epoch number.

- `rev` - This field helps distinguish between data sourced from different
  revisions, files or columns.

</details>

[plot templates]:
  /user-guide/experiment-management/visualizing-plots#plot-templates-data-series-only
[vega-lite specification]: https://vega.github.io/vega-lite/
[data-series plots]: /user-guide/experiment-management/visualizing-plots

## Example: Modifying the `simple` template

The built-in `simple` template can be an ideal base for custom templates because
it has a minimal structure you can make quick modifications to. For example,
let's show vertical bars instead of a connected line.

We'll work with the following `data.csv` file:

```csv
y
0.1
0.4
0.9
1.6
```

The simple template renders it like this:

```cli
$ dvc plots show data.csv --template simple
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_templates_show_unmodified.svg)

Let's dump the `simple` template to `bars_template.json`:

```cli
$ mkdir .dvc/plots
$ dvc plots templates simple > .dvc/plots/bars_template.json
```

Now, let's modify the `bars_template.json` file to display the bars (instead of
a line):

```git
 {
   "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
   ...
   "mark": {
-    "type": "line"
+    "type": "bar"
   },
   "encoding": { ...
   ...
 }
```

And this is how the data looks like using our custom template:

```cli
$ dvc plots show data.csv --template bars_template
file:///Users/usr/src/dvc_plots/index.html
```

![](/img/plots_templates_show_modified.svg)

[field]:
  /user-guide/project-structure/dvcyaml-files#available-configuration-fields
[DVC extension for VS Code]:
  https://marketplace.visualstudio.com/items?itemName=lakeFS.lakefs-dvc
