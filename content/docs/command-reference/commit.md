# commit

Record changes to files or directories tracked by DVC.

## Synopsis

```usage
usage: dvc commit [-h] [-q | -v] [-f] [-d] [-R]
                  [--no-relink] [targets [targets ...]]

positional arguments:
  targets        Limit command scope to these stages or .dvc files.
                 Using -R, directories to search for stages or .dvc
                 files can also be given.
```

## Description

Stores the current contents of files and directories tracked by DVC in the
<abbr>cache</abbr>, and updates `dvc.lock` or `.dvc` files if/as needed. This
forces DVC to accept any changed contents of tracked data currently in the
<abbr>workspace</abbr>.

💡 For convenience, a pre-commit Git hook is available to remind you to
`dvc commit` when needed. See `dvc install` for more info.

`dvc commit` provides a way to complete DVC commands that track data (`dvc add`,
`dvc repro`, `dvc import`, etc.), when they have been used with the
`--no-commit` or `--no-exec` options. Those options cause the command to skip
these step(s) during the process of tracking each file or directory:

- Save the hash value of the file/dir in the `dvc.lock` or `.dvc` file.
- Store the file contents in the cache.

> Skipping these steps is typically done to avoid caching unfinished data, for
> example when exploring different datasets.

Some scenarios for `dvc commit` include:

- As an alternative to `dvc add` for data that's already tracked: `dvc commit`
  adds all the changes to files or directories already tracked by DVC without
  having to name each target.

- Often we edit source code, configuration, or other files that are specified as
  <abbr>dependencies</abbr> in `dvc.yaml` (`deps` field) in a way that doesn't
  cause any changes to stage <abbr>outputs</abbr>. For example: reformatting
  input data, adding code comments, etc. However, DVC notices all changes to
  dependencies and expects you to reproduce the corresponding pipeline
  (`dvc repro`). You can use `dvc commit` instead to force accepting these new
  versions without having to execute stage commands.

- Sometimes after executing a <abbr>stage</abbr>, we realize that not all of its
  dependencies or outputs are defined in `dvc.yaml`. It is possible to [add the
  missing deps/outs] without having to re-execute stages, and `dvc commit` is
  needed to finalize the operation (see link).

- It's also possible to execute stage commands by hand (without `dvc repro`), or
  to manually modify their output files or directories. Use `dvc commit` to
  register the changes with DVC once you're done.

  > Note that `dvc unprotect` (or removing the outputs) is usually required
  > before rewriting files/dirs tracked by DVC.

Note that it's best to try avoiding these scenarios, where the
<abbr>cache</abbr>, `dvc.lock`, and `.dvc` files are force-updated. DVC can't
guarantee reproducibility in those cases.

[add the missing deps/outs]: /user-guide/how-to/add-deps-or-outs-to-a-stage

## Options

- `-d`, `--with-deps` - only meaningful when specifying `targets`. This
  determines files to commit by resolving all dependencies of the target stages
  or `.dvc` files: DVC searches backward from the targets in the corresponding
  pipelines. This will not commit files referenced in later stages than the
  `targets`.

- `-R`, `--recursive` - determines the files to commit by searching each target
  directory and its subdirectories for stages (in `dvc.yaml`) or `.dvc` files to
  inspect. If there are no directories among the `targets`, this option has no
  effect.

- `-f`, `--force` - commit data even if hash values for dependencies or outputs
  did not change.

- `--no-relink` - Don't recreate
  [file link types](/user-guide/data-management/large-dataset-optimization#file-link-types-for-the-dvc-cache))
  from the cache to the workspace. This saves time when working with a large
  number of files, but the files may be reflinked or copied from the cache even
  if another link type is configured.

- `-h`, `--help` - prints the usage/help message, and exit.

- `-q`, `--quiet` - do not write anything to standard output. Exit with 0 if no
  problems arise, otherwise 1.

- `-v`, `--verbose` - displays detailed tracing information from executing the
  `dvc add` command.

## Examples

Let's employ a simple <abbr>workspace</abbr> with some data, code, ML models,
pipeline stages, such as the <abbr>DVC project</abbr> created for the
[Get Started](/start). Then we can see what happens with `git commit` and
`dvc commit` in different situations.

<details>

### Click and expand to set up the project

Start by cloning our example repo if you don't already have it:

```cli
$ git clone https://github.com/treeverse/example-get-started
$ cd example-get-started
```

Now let's install the requirements. But before we do that, we **strongly**
recommend creating a
[virtual environment](https://docs.python.org/3/library/venv.html):

```cli
$ python3 -m venv .env
$ source .env/bin/activate
$ pip install -r src/requirements.txt
```

Download the precomputed data using:

```cli
$ dvc pull -aT
```

</details>

## Example: Rapid iterations

Sometimes we want to iterate through multiple changes to configuration, code, or
data, trying different ways to improve the output of a stage. To avoid filling
the <abbr>cache</abbr> with undesired intermediate results, you can use the
`--no-commit` option of `dvc repro`. Once your progress is good enough,
`dvc commit` can be used to store data files in the cache.

In the `featurize` stage, `src/featurization.py` is executed. A useful change to
make is adjusting the parameters for that script. The parameters are defined in
the `params.yaml` file. Updating the value of the `max_features` param to 6000
changes the resulting model:

```yaml
featurize:
  max_features: 6000
  ngrams: 2
```

This edit introduces a change that would cause the `featurize`, `train` and
`evaluate` stages to execute if we ran `dvc repro`. But if we want to try
several values for `max_features` and save only the best result to the cache, we
can run it like this:

```cli
$ dvc repro --no-commit
```

We can run this command as many times as we like, editing `params.yaml` any way
we like, and so long as we use `--no-commit`, the data does not get saved to the
cache. Let's verify that's the case:

First verification (via `dvc status`):

```cli
$ dvc status
featurize:
	changed outs:
		not in cache:       data/features
train:
	changed outs:
		not in cache:       model.pkl
```

Now we can look in the cache directory to see if the new version of `model.pkl`
is _not in cache_ indeed. Let's look at the latest state of `train` in
`dvc.lock` first:

```yaml
train:
  cmd: python src/train.py data/features model.pkl
  deps:
    - path: data/features
      md5: de03a7e34e003e54dde0d40582c6acf4.dir
    - path: src/train.py
      md5: ad8e71b2cca4334a7d3bb6495645068c
  params:
    params.yaml:
      train.n_estimators: 100
      train.seed: 20170428
  outs:
    - path: model.pkl
      md5: 9aba000ba83b341a423a81eed8ff9238
```

To verify this instance of `model.pkl` is not in the cache, we must know the
path to the cached file. In the cache directory, the first two characters of the
hash value are used as a subdirectory name, and the remaining characters are the
file name. Therefore, had the file been committed to the cache, it would appear
in the directory `.dvc/cache/files/md5/9a`. Let's check:

```cli
$ ls .dvc/cache/files/md5/9a
ls: .dvc/cache/files/md5/9a: No such file or directory
```

If we've determined the changes to `params.yaml` were successful, we can execute
this set of commands:

```cli
$ dvc commit
$ dvc status
Data and pipelines are up to date.
$ ls .dvc/cache/files/md5/9a
ba000ba83b341a423a81eed8ff9238
```

We've verified that `dvc commit` has saved the changes into the cache, and that
the new instance of `model.pkl` is there.

## Example: Executing stage commands without DVC

Sometimes you may want to execute stage commands manually (instead of using
`dvc repro`). You won't have DVC helping you, but you'll have the freedom to run
any command, even ones not defined in `dvc.yaml`. For example:

```cli
$ python src/featurization.py data/prepared data/features
$ python src/train.py data/features model.pkl
$ python src/evaluate.py model.pkl data/features auc.metric
```

As before, `dvc status` will show which tracked files/dirs have changed, and
when your work is finalized, `dvc commit` will save the outputs the
<abbr>cache</abbr>.

## Example: Updating dependencies

Sometimes we want to clean up a code or configuration file in a way that doesn't
cause a change in its results. We might write in-line documentation with
comments, change indentation, remove some debugging printouts, or any other
change that doesn't produce different output of pipeline stages.

```cli
$ git status -s
M src/train.py

$ dvc status
train:
	changed deps:
		modified:           src/train.py
```

Let's edit one of the source code files. It doesn't matter which one. You'll see
that both Git and DVC recognize a change was made.

If we ran `dvc repro` at this point, this pipeline would be reproduced. But
since the change was inconsequential, that would be a waste of time and CPU.
That's especially critical if the corresponding stages take lots of resources to
execute.

```cli
$ git add src/train.py

$ git commit -m "CHANGED"
[master 72327bd] CHANGED
1 file changed, 2 insertions(+)

$ dvc commit
dependencies ['src/train.py'] of 'train.dvc' changed.
Are you sure you commit it? [y/n] y

$ dvc status
Data and pipelines are up to date.
```

Instead of reproducing the pipeline for changes that do not produce different
results, just use `commit` on both Git and DVC.
