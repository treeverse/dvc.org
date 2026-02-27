# Hugging Face Transformers

DVCLive allows you to add experiment tracking capabilities to your
[Hugging Face Transformers](https://huggingface.co/docs/transformers/index)
projects.

<admon type="tip">

If you are using Hugging Face Accelerate, check the
[DVCLive - Hugging Face Accelerate](/dvclive/ml-frameworks/accelerate) page.

</admon>

## Usage

<p align='center'>
  <a href="https://colab.research.google.com/github/treeverse/dvclive/blob/main/examples/DVCLive-HuggingFace.ipynb">
    <img src="https://colab.research.google.com/assets/colab-badge.svg" />
  </a>
</p>

If you have `dvclive` installed, the [`DVCLiveCallback`] will be used for
tracking experiments and logging metrics, parameters, and plots automatically
for `transformers>=4.36.0`.

To log the model, set `HF_DVCLIVE_LOG_MODEL=true` in your environment.

```python
os.environ["HF_DVCLIVE_LOG_MODEL"] = "true"

from transformers import TrainingArguments, Trainer

# optional, `report_to` defaults to "all"
args = TrainingArguments(..., report_to="dvclive")
trainer = Trainer(..., args=args)
```

To customize tracking, include the [`DVCLiveCallback`] in the callbacks list
passed to your
[`Trainer`](https://huggingface.co/docs/transformers/main_classes/trainer),
along with a [`Live`] instance including additonal arguments:

```python
from dvclive import Live
from transformers.integrations import DVCLiveCallback

...

trainer = Trainer(...)
trainer.add_callback(DVCLiveCallback(Live(dir="custom_dir")))
trainer.train()
```

For `transformers<4.36.0`, import the callback from `dvclive` instead of
`transformers`:

```python
from dvclive.huggingface import DVCLiveCallback

...

trainer = Trainer(...)
trainer.add_callback(DVCLiveCallback())
trainer.train()
```

<admon type="warn">

`dvclive.huggingface.DVCLiveCallback` will be deprecated in DVCLive 4.0 in favor
of `transformers.integrations.DVCLiveCallback`.

</admon>

## Examples

### Log model checkpoints

Use `HF_DVCLIVE_LOG_MODEL=true` or `log_model=True` to save the checkpoints (it
will use `Live.log_artifact()` internally to save those).

If true, DVCLive will save a copy of the last checkpoint to the
`dvclive/artifacts` directory and annotate it with name `last` or `best` (if
[args.load_best_model_at_end](https://huggingface.co/docs/transformers/main_classes/trainer#transformers.TrainingArguments.load_best_model_at_end)).

This is useful to be consumed in the <abbr>model registry</abbr> or automation
scenarios.

- Save the `last` checkpoint at the end of training:

```python
os.environ["HF_DVCLIVE_LOG_MODEL"] = "true"

from transformers import TrainingArguments, Trainer

args = TrainingArguments(..., report_to="dvclive")
trainer = Trainer(..., args=args)
```

- Save the `best` checkpoint at the end of training:

```python
os.environ["HF_DVCLIVE_LOG_MODEL"] = "true"

from transformers import TrainingArguments, Trainer

args = TrainingArguments(..., report_to="dvclive")
trainer = Trainer(..., args=args)
trainer.args.load_best_model_at_end = True
```

- Save updates to the checkpoints directory whenever a new checkpoint is saved:

```python
os.environ["HF_DVCLIVE_LOG_MODEL"] = "all"

from transformers import TrainingArguments, Trainer

args = TrainingArguments(..., report_to="dvclive")
trainer = Trainer(..., args=args)
```

### Passing additional DVCLive arguments

Use `live` to pass an existing [`Live`] instance.

```python
from dvclive import Live
from transformers.integrations import DVCLiveCallback

with Live("custom_dir") as live:
    trainer = Trainer(...)
    trainer.add_callback(DVCLiveCallback(live=live))

    # Log additional metrics after training
    live.log_metric("summary_metric", 1.0, plot=False)
```

## Output format

Each metric will be logged to:

```py
{Live.plots_dir}/metrics/{split}/{metric}.tsv
```

Where:

- `{Live.plots_dir}` is defined in [`Live`].
- `{split}` can be either `train` or `eval`.
- `{metric}` is the name provided by the framework.

[`DVCLiveCallback`]:
  https://huggingface.co/transformers/main_classes/callback.html#transformers.integrations.DVCLiveCallback
[`Live`]: /dvclive/live
