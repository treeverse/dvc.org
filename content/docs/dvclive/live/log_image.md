# Live.log_image()

Saves the given image `val` to the output file `name`.

```py
def log_image(name: str, val):
```

## Usage

```py
from dvclive import Live

with Live(cache_images=True) as live:
    # 1. Log an image from a numpy array:
    import numpy as np
    img_numpy = np.ones((500, 500), np.uint8) * 255
    live.log_image("numpy.png", img_numpy)

    # 2. Or log a matplotlib figure:
    from matplotlib import pyplot as plt
    fig, ax = plt.subplots()
    ax.plot([1, 2, 3, 4])
    live.log_image("matplotlib.png", fig)

    # 3. Or log a `PIL.image`:
    from PIL import Image
    img_pil = Image.new("RGB", (500, 500), (250, 250, 250))
    live.log_image("pil.png", img_pil)

    # 4. Or log an existing image:
    live.log_image("sample.png", "run/batch_0_sample.png")
```

## Description

Supported values for `val` are:

- A valid NumPy array (convertible to an image via
  [PIL.Image.fromarray](https://pillow.readthedocs.io/en/stable/reference/Image.html#PIL.Image.fromarray))
- A `matplotlib.figure.Figure` instance
- A `PIL.Image` instance
- A path to an image file (`str` or
  [`Path`](https://docs.python.org/3/library/pathlib.html#pathlib.Path)). It
  should be in a format that is readable by
  [`PIL.Image.open()`](https://pillow.readthedocs.io/en/stable/reference/Image.html#PIL.Image.open)

The images will be saved in `{Live.plots_dir}/images/{name}`. When using
[`Live(cache_images=True)`](/dvclive/live#parameters), the images directory will
also be <abbr>cached</abbr> as part of `Live.end()`. In that case, a `.dvc` file
will be saved to [track](/dvclive/how-it-works#track-large-artifacts-with-dvc)
it, and the directory will be added to a `.gitignore` file to prevent Git
tracking:

```
dvclive
└── plots
    ├── .gitignore
    ├── images
    │   ├── numpy.png
    │   ├── matplotlib.png
    │   ├── pil.png
    │   └── sample.png
    └── images.dvc
```

<admon type="tip">

The logged images can be visualized with `dvc plots`:

```cli
$ dvc plots diff dvclive/plots
```

</admon>

### Images per step

By default the images will be overwritten on each step. However, you can log
images using the following pattern
`live.log_image(f"folder/{live.step}.png", img)`:

```py
import numpy as np
from dvclive import Live

with Live() as live:
    base_img = np.ones((500, 500), np.uint8)
    for i in range(10):
      live.log_image(
        f"numpy/{live.step}.png", base_img * i * 10)
      live.next_step()
```

In DVC Studio and the
[DVC Extension for VSCode](https://marketplace.visualstudio.com/items?itemName=lakeFS.lakefs-dvc),
folders following this pattern will be rendered using an image slider:

<toggle>
<tab title="DVC Studio">

![DVCLive Studio Image Slider](/img/dvclive-studio-image-slider.gif)

</tab>
<tab title="VSCode Extension">

![DVCLive VSCode Image Slider](/img/dvclive-vscode-image-slider.gif)

</tab>

</toggle>

## Parameters

- `name` - name of the image file that this command will output.

- `val` - image to be saved. See the list of supported values in the
  [Description](#description).

## Exceptions

- `dvclive.error.InvalidDataTypeError` - thrown if the provided `val` does not
  have a supported type.
