# Lightning Fabric

DVCLive allows you to add experiment tracking capabilities to your
[Lightning Fabric](https://lightning.ai/docs/fabric/stable/) projects.

## Usage

<p align='center'>
  <a href="https://colab.research.google.com/github/treeverse/dvclive/blob/main/examples/DVCLive-Fabric.ipynb">
    <img src="https://colab.research.google.com/assets/colab-badge.svg" />
  </a>
</p>

You need to create a `DVCLiveLogger` and then log the parameters, metrics, and
other info you want to log.

An example code snippet is shown below:

```python
from dvclive.fabric import DVCLiveLogger
from lightning.fabric import Fabric
from lightning.fabric.utilities.rank_zero import rank_zero_only

...

fabric = Fabric()

# Create the DVCLiveLogger
logger = DVCLiveLogger()

# Log dict of hyperparameters
logger.log_hyperparams({"batch_size": 64, "epochs": 5, "lr": 1.0, ...})

for epoch in range(epochs):

    ...

    # Log dict of metrics
    logger.log_metrics({"loss": loss})

fabric.save("mnist_cnn.pt", model.state_dict())
# Check that `rank_zero_only.rank == 0` to avoid logging in other processes.
if rank_zero_only.rank == 0:
    # `logger.experiment` provides access to DVCLive's `Live` instance.
    logger.experiment.log_artifact("mnist_cnn.pt")

# Call finalize to save final results as a DVC experiment
logger.finalize("success")
```

## Initialize

```python
from dvclive.fabric import DVCLiveLogger

logger = DVCLiveLogger()
```

To customize tracking, include keyword arguments to be passed to the [`Live`]
instance like:

```python
logger = DVCLiveLogger(dir="my_directory")
```

## Log parameters

To log hyperparameters, pass a dictionary to `log_hyperparams()`:

```python
logger.log_hyperparams({"batch_size": 64, "epochs": 5, "lr": 1.0, ...})
```

## Log metrics

To log metrics, pass a dictionary to `log_metrics()`:

```python
logger.log_metrics({"train_loss": loss})
...
logger.log_metrics({"test_loss": test_loss, "test_acc": test_acc})
```

Optionally pass the step (if not passed, it will be auto-incremented):

```python
logger.log_metrics({"train_loss": loss}, step=step)
```

## Additional logging

To log models, other artifacts, or images, retrieve the `Live` instance from the
logger:

```python
fabric.save("mnist_cnn.pt", model.state_dict())
if rank_zero_only.rank == 0:
    logger.experiment.log_artifact("mnist_cnn.pt")
```

`rank_zero_only.rank` ensures it is only called on the rank zero process. This
is handled automatically by the `DVCLiveLogger` in the other methods above, but
in this example we are directly calling [`Live`] instead.

`logger.experiment` calls the [`Live`] instance so that you can call any
[`Live`] methods.

## End

Finally, end the experiment to trigger `Live.end()`:

```python
logger.finalize("success")
```

`"success"` is passed as the `status` and is a required argument.

[`Live`]: /dvclive/live
