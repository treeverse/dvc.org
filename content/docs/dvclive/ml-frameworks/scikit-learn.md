# scikit-learn

DVCLive allows you to add experiment tracking capabilities to your
[Scikit-learn](https://scikit-learn.org/) projects.

## Usage

<p align='center'>
  <a href="https://colab.research.google.com/github/treeverse/dvclive/blob/main/examples/DVCLive-scikit-learn.ipynb">
    <img src="https://colab.research.google.com/assets/colab-badge.svg" />
  </a>
</p>

You need to create a [`Live`](/dvclive/live) instance and include calls to
[log data](/dvclive#log-data).

<admon type="tip">

DVCLive provides built-in functions to generate
[scikit learn plots](https://scikit-learn.org/stable/visualizations.html), see
`Live.log_sklearn_plot()`.

</admon>

The following snippet is used inside the Colab Notebook linked above:

```python
from dvclive import Live

...

with Live() as live:

    live.log_param("n_estimators", n_estimators)

    clf = RandomForestClassifier(n_estimators=n_estimators)
    clf.fit(X_train, y_train)

    y_train_pred = clf.predict(X_train)

    live.log_metric("train/f1", f1_score(y_train, y_train_pred, average="weighted"), plot=False)
    live.log_sklearn_plot(
        "confusion_matrix", y_train, y_train_pred, name="train/confusion_matrix",
        title="Train Confusion Matrix")

    y_test_pred = clf.predict(X_test)

    live.log_metric("test/f1", f1_score(y_test, y_test_pred, average="weighted"), plot=False)
    live.log_sklearn_plot(
        "confusion_matrix", y_test, y_test_pred, name="test/confusion_matrix",
        title="Test Confusion Matrix")
```
