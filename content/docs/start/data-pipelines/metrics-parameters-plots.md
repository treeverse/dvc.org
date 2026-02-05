---
title: 'Get Started: Metrics, Plots, and Parameters'
description: 'Get started with DVC metrics, plots, and parameters. Learn how to
capture, evaluate, and visualize ML projects without leaving Git.'
---

# Get Started: Metrics, Plots, and Parameters

DVC makes it easy to track [metrics](/command-reference/metrics), visualize
performance with [plots](/command-reference/plots), and update
<abbr>parameters</abbr>. These concepts are introduced below.

<admon type="tip">

All of the above can be combined into [experiments] to run and compare many
iterations of your ML project.

[experiments]: /start/experiments

</admon>

## Collecting metrics and plots

First, let's see the mechanism to capture values for these ML attributes. Add a
final evaluation stage to our [earlier pipeline]:

```cli
$ dvc stage add -n evaluate \
  -d src/evaluate.py -d model.pkl -d data/features \
  -o eval \
  python src/evaluate.py model.pkl data/features
```

[earlier pipeline]: /start/data-pipelines/data-pipelines

<details>

### 💡 Expand to get a peek under the hood

`dvc stage add` will generates this new stage in the `dvc.yaml` file:

```yaml
evaluate:
  cmd: python src/evaluate.py model.pkl data/features
  deps:
    - data/features
    - model.pkl
    - src/evaluate.py
  outs:
    - eval
```

We cache your metrics and plots files with DVC, by making `eval` directory as a
stage output the same way outputs were added in previous stages. This is the
easiest way to handle this, and if amount of files and size is growing it
doesn't affect your Git history. Alternatively it could be setup in more
granular way to track certain metrics files or plots in Git, while other files
could still be tracked by DVC.

</details>

[`evaluate.py`] uses [DVCLive] to write scalar metrics values (e.g. `AUC`) and
plots data (e.g. `ROC curve`) to files in the `eval` directory that DVC can
parse to compare and visualize across iterations. By default, DVCLive will
configure metrics and plots for you in `dvc.yaml`, but in this example we
customize them by editing `dvc.yaml` to combine train and test plots.

<details>

### 💡 Expand to see how to customize metrics and plots

To combine train and test data, and to set other custom attributes like titles,
first disable DVCLive's default configuration by opening `src/evaluate.py`,
finding `with Live(EVAL_PATH) as live:`, and modifying it to
`with Live(EVAL_PATH, dvcyaml=False) as live:`. Then add the following custom
configuration to `dvc.yaml`:

<!-- prettier-ignore-start -->
```yaml
metrics:
- eval/metrics.json
plots:
- ROC:
    template: simple
    x: fpr
    y:
      eval/plots/sklearn/roc/train.json: tpr
      eval/plots/sklearn/roc/test.json: tpr
- Confusion-Matrix:
    template: confusion
    x: actual
    y:
      eval/plots/sklearn/cm/train.json: predicted
      eval/plots/sklearn/cm/test.json: predicted
- Precision-Recall:
    template: simple
    x: recall
    y:
      eval/plots/sklearn/prc/train.json: precision
      eval/plots/sklearn/prc/test.json: precision
- eval/plots/images/importance.png
```
<!-- prettier-ignore-end -->

This flexibility to define your own metrics and plots configuration means that
you can even [generate your own] metrics and plots data without using DVCLive!

</details>

Let's run and save these changes:

```cli
$ dvc repro
$ git add .gitignore dvc.yaml dvc.lock eval
$ git commit -a -m "Create evaluation stage"
```

## Viewing metrics and plots

You can view metrics and plots from the command line, or you can load your
project in VS Code and use the [DVC Extension] to view metrics, plots, and more.

You can view tracked metrics with `dvc metrics show `:

```dvc
$ dvc metrics show
Path                    avg_prec.test    avg_prec.train    roc_auc.test    roc_auc.train
eval/metrics.json  0.94496          0.97723           0.96191         0.98737
```

You can view plots with `dvc plots show` (shown below), which generates an HTML
file you can open in a browser.

```cli
$ dvc plots show
file:///Users/dvc/example-get-started/dvc_plots/index.html
```

![](/img/plots_prc_get_started_show.svg)
![](/img/plots_roc_get_started_show.svg)
![](/img/plots_importance_get_started_show.png '=500 :wrap-left')
![](/img/plots_cm_get_started_show.svg)

[`evaluate.py`]:
  https://github.com/treeverse/example-get-started/blob/main/src/evaluate.py
[generate your own]: /user-guide/experiment-management/visualizing-plots

Later we will see how to
[compare and visualize different pipeline iterations](#comparing-iterations).
For now, let's see how to capture another important piece of information which
will be useful for comparison: parameters.

[dvclive]: /dvclive
[`roc_curve`]:
  https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_curve.html
[`confusion_matrix`]:
  https://scikit-learn.org/stable/modules/generated/sklearn.metrics.confusion_matrix.html
[plots files]: /user-guide/project-structure/dvcyaml-files#plots
[dvc extension]:
  https://marketplace.visualstudio.com/items?itemName=Iterative.dvc

## Defining stage parameters

It's pretty common for data science pipelines to include configuration files
that define adjustable parameters to train a model, do pre-processing, etc. DVC
provides a mechanism for stages to depend on the values of specific sections of
such a config file (YAML, JSON, TOML, and Python formats are supported).

Luckily, we should already have a stage with
[parameters](/command-reference/params) in `dvc.yaml`:

```yaml
featurize:
  cmd: python src/featurization.py data/prepared data/features
  deps:
    - data/prepared
    - src/featurization.py
  params:
    - featurize.max_features
    - featurize.ngrams
  outs:
    - data/features
```

<details>

### ⚙️ Expand to recall how it was generated.

The `featurize` stage was created with this `dvc stage add` command. Notice the
argument sent to the `-p` option (short for `--params`):

```cli
$ dvc stage add -n featurize \
          -p featurize.max_features,featurize.ngrams \
          -d src/featurization.py -d data/prepared \
          -o data/features \
          python src/featurization.py data/prepared data/features
```

</details>

The `params` section defines the parameter dependencies of the `featurize`
stage. By default, DVC reads those values (`featurize.max_features` and
`featurize.ngrams`) from a `params.yaml` file. But as with metrics and plots,
parameter file names and structure can also be user- and case-defined.

Here's the contents of our `params.yaml` file:

```yaml
prepare:
  split: 0.20
  seed: 20170428

featurize:
  max_features: 100
  ngrams: 1

train:
  seed: 20170428
  n_est: 50
  min_split: 2
```

## Updating params and iterating

We are definitely not happy with the AUC value we got so far! Let's edit the
`params.yaml` file to use bigrams and increase the number of features:

```git
 featurize:
-  max_features: 100
-  ngrams: 1
+  max_features: 200
+  ngrams: 2
```

The beauty of `dvc.yaml` is that all you need to do now is run:

```cli
$ dvc repro
```

It'll analyze the changes, use existing results from the <abbr>run cache</abbr>,
and execute only the commands needed to produce new results (model, metrics,
plots).

The same logic applies to other possible adjustments — edit source code, update
datasets — you do the changes, use `dvc repro`, and DVC runs what needs to be
run.

## Comparing iterations

Finally, let's see how the updates improved performance. DVC has a few commands
to see changes in and visualize metrics, parameters, and plots. These commands
can work for one or across multiple pipeline iteration(s). Let's compare the
current "bigrams" run with the last committed "baseline" iteration:

```cli
$ dvc params diff
Path         Param                   HEAD  workspace
params.yaml  featurize.max_features  100   200
params.yaml  featurize.ngrams        1     2
```

`dvc params diff` can show how params in the workspace differ vs. the last
commit.

`dvc metrics diff` does the same for metrics:

```cli
$ dvc metrics diff
Path               Metric          HEAD     workspace    Change
eval/metrics.json  avg_prec.test   0.9014   0.925        0.0236
eval/metrics.json  avg_prec.train  0.95704  0.97437      0.01733
eval/metrics.json  roc_auc.test    0.93196  0.94602      0.01406
eval/metrics.json  roc_auc.train   0.97743  0.98667      0.00924
```

And finally, we can compare all plots with a single command (we show only some
of them for simplicity):

```cli
$ dvc plots diff
file:///Users/dvc/example-get-started/plots.html
```

![](/img/plots_prc_get_started_diff.svg)
![](/img/plots_importance_get_started_diff.png)

> See `dvc plots diff` for more info on its options.

> All these commands also accept
> [Git revisions](https://git-scm.com/docs/gitrevisions) (commits, tags, branch
> names) to compare.
