# CatBoost

Install DVCLive with `pip install "dvclive[catboost]"`. To track metrics during
CPU training, pass `DVCLiveCallback` to your [CatBoost] model's `fit()` method.
Use a [`Live` context](/dvclive/live) around training to finalize the experiment
when training ends.

[catboost]:
  https://catboost.ai/docs/en/concepts/python-reference_catboostclassifier_fit

```python
from catboost import CatBoostClassifier
from dvclive import Live
from dvclive.catboost import DVCLiveCallback

train_x = [[0], [1], [2], [3]]
train_y = [0, 0, 1, 1]
valid_x = [[0], [3]]
valid_y = [0, 1]

model = CatBoostClassifier(iterations=5, verbose=False)
with Live() as live:
    model.fit(
        train_x,
        train_y,
        eval_set=(valid_x, valid_y),
        callbacks=[DVCLiveCallback(live)],
    )
```

DVCLive writes a series for each dataset and metric, such as `learn/Logloss` and
`validation/Logloss`. Each step corresponds to one boosting iteration, starting
at zero. CatBoost's default `metric_period=1` records every iteration. With a
larger period, each series contains only the steps where CatBoost calculated
that metric.
