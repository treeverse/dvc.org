# Google Drive

<!--
## Google Drive
-->

<admon type="warn">

There is an ongoing issue and the default Google DVC app is affected. If you see
"This app is blocked" message, check this
[ticket](https://github.com/treeverse/dvc/issues/10516) for a workaround and
more details.

</admon>

To start using a Google Drive remote, you only need to add it with a
[valid URL format](#url-format). Then use any DVC command that needs to connect
to it (e.g. `dvc pull` or `dvc push` once there's tracked data to synchronize).
For example:

```cli
$ dvc add data
...
$ dvc remote add --default myremote \
                           gdrive://0AIac4JZqHhKmUk9PDA/dvcstore
$ dvc remote modify myremote gdrive_acknowledge_abuse true
$ dvc push
Your browser has been opened to visit:

    https://accounts.google.com/o/oauth2/auth...

Authentication successful.
```

See [Authorization](#authorization) for more details.

For the full list of configuration parameters, see
[Configuration Parameters](#configuration-parameters).

<details id="default-configuration" icon="bulb">

### DVC verifies Google Drive files by default

GDrive remotes are not "trusted" by default. This means that the
[`verify`](/command-reference/remote/modify#available-parameters-for-all-remotes)
parameter is enabled on this type of storage, so DVC recalculates the file
hashes upon download (e.g. `dvc pull`), to make sure that these haven't been
modified.

</details>

<admon type="tip">

DVC uses the Google Drive API to synchronize your DVC project data with this
type of remote storage, so it's subject to certain usage limits and quotas,
which by default are shared with other GDrive remote storage users. For heavy
use, it's highly recommended to
[connect using a custom Google Cloud project](#using-a-custom-google-cloud-project-recommended),
which puts you in control of these limits.

Having your own GC project, it's also possible to
[use a service account](#using-service-accounts) for automating tasks that need
to establish GDrive remote connections (e.g. CI/CD).

</admon>

> Note our [Privacy Policy for Google APIs](/user-guide/privacy).

## URL format

There's a few alternatives to construct a GDrive remote URL for different uses,
such as a folder or subfolder in root, shared folders not owned by your account,
etc. The URL is formed with a _base_, and an optional _path_ to an **existing**
folder i.e. `gdrive://<base>/path/to/folder`. The base can be one of:

1. _Folder ID_ (recommended) - unique identifier for every Google Drive folder,
   including [shared folders](https://support.google.com/drive/answer/7166529)
   and [shared drives](https://support.google.com/a/users/answer/9310351)\*
   (these two can only be referenced by ID).

   > ⚠️ The folder in question should be shared to specific users (or groups) so
   > they can use it with DVC. "Anyone with a link" is not guaranteed to work.

   ```cli
   $ dvc remote add myremote gdrive://0AIac4JZqHhKmUk9PDA
   ```

   or

   ```cli
   $ dvc remote add myremote \
                         gdrive://0AIac4JZqHhKmUk9PDA/Data/text
   ```

   `0AIac4JZqHhKmUk9PDA` above is the folder ID, and it can be found in the web
   browser address bar, for example
   `https://drive.google.com/drive/folders/0AIac4JZqHhKmUk9PDA`.

   > \* Note the
   > [Shared drive limits](https://support.google.com/a/users/answer/7338880) on
   > storage and uploads.

2. `root` - indicates your topmost Google Drive folder ("My Drive").

   ⚠️ Only suitable for personal use, as sharing a remote configured this way
   would cause DVC to try synchronizing data to/from different Google Drives for
   every user.

   ```cli
   $ dvc remote add myremote gdrive://root/dvcstore
   ```

   > We don't recommend using `gdrive://root` by itself, as it's likely used for
   > many other reasons, and pushing data with DVC here can make it messy.

3. `appDataFolder` -
   [special hidden folder](https://developers.google.com/workspace/drive/api/guides/appdata)
   (unique per user) meant to store application-specific data. This is a good
   choice to prevent accidentally deleting remote storage data from the Google
   Drive web UI.

   ⚠️ Only suitable for personal use.

   ```cli
   $ dvc remote add myremote gdrive://appDataFolder
   ```

## Using a custom Google Cloud project (recommended)

Optionally, follow these steps to create your own Google Cloud project and
generate OAuth credentials for your GDrive remotes to connect to Google Drive.
We highly recommend this for heavy use and advanced needs because:

- You control your Google API usage limits, being able to request Google for an
  increase if needed.
- It ensures optimal data transfer performance when you need it.
- [Using a service account](#using-service-accounts) for automation tasks (e.g.
  CI/CD) is only possible this way.

DVC uses the [Google Drive API](https://developers.google.com/workspace/drive)
to connect to your Google Drive. This requires a Google Cloud _project_ that
allows Drive API connections, and its
[OAuth](https://developers.google.com/identity/protocols/oauth2) credentials
(**client ID** and **client secret**).

1. Sign into the [Google API Console](https://console.cloud.google.com/apis).

   > Double check you're using the intended Google account (upper-right corner).

2. Select or
   [Create](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project)
   a project for DVC remote connections.

3. [Enable the Drive API](https://developers.google.com/workspace/drive/api/guides/about-sdk)
   from the **APIs & Services** **Dashboard** (left sidebar), click on **+
   ENABLE APIS AND SERVICES**. Find and select the "Google Drive API" in the API
   Library, and click on the **ENABLE** button.

   ![](/img/gdrive-enable-apis-and-services.png)

4. Go back to **APIs & Services** in the left sidebar, and select **OAuth
   consent screen**. Choose a **User Type** and click **CREATE**. On the next
   screen, enter an **Application name** e.g. "DVC remote storage", and click
   the **Save** (scroll to bottom).

5. From the left sidebar, select **Credentials**, and click the **Create
   credentials** dropdown to select **OAuth client ID**. Choose **Desktop app**
   and click **Create** to proceed with a default client name.

   ![](/img/gdrive-create-credentials.png)

6. The newly generated **client ID** and **client secret** should be shown to
   you now, and you can always come back to **Credentials** to fetch them.

✅ It should be safe to share **client ID** and **client secret** among your
team. These credentials are only used to generate the
[authorization](#authorization) URL you'll need to visit later in order to
connect to the Google Drive.

Finally, use the `dvc remote modify` command to set the credentials (for each
GDrive remote), for example:

```cli
$ dvc remote modify myremote gdrive_client_id 'client-id'
$ dvc remote modify myremote gdrive_client_secret 'client-secret'
```

> Note that Google Drive API usage limits/quotas apply per _project_ client and
> can be reviewed in the
> [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent).
> Do keep this in mind when sharing them, or you may
> [exceed the limits](https://developers.google.com/drive/api/v2/handle-errors?hl=ro#resolve_a_403_error_usage_limit_exceeded).

## Authorization

<admon type="info">

This covers simple authentication, which gives DVC access to GDrive on behalf of
a user account. This is ideal to use to run DVC locally, for example. If some
automation is needed (e.g. CI/CD) we recommend
[using a service account](#using-service-accounts) instead.

</admon>

On the first usage of a GDrive remote, for example when trying to `dvc push`
tracked data for the first time, DVC will prompt you to visit a special Google
authentication web page. There you'll need to sign into a Google account with
the needed access to the GDrive [URL](#url-format) in question. The [auth
process] will ask you to grant DVC the necessary permissions, and produce a
verification code needed for DVC to complete the connection. On success, the
necessary credentials will be cached globally, for example in
`~/Library/Caches/pydrive2fs/{gdrive_client_id}/default.json` for macOS ([see
`gdrive_user_credentials_file`]), and used automatically next time DVC needs
them.

[auth process]:
  https://developers.google.com/workspace/drive/api/guides/api-specific-auth
[see `gdrive_user_credentials_file`]: #configuration-parameters

<admin type="warn">

In order to prevent unauthorized access to your Google Drive, **do not share
these credentials with others**. Each team member should go through this process
individually.

</admin>

If multiple GDrive remotes use the same client ID, by default they will share
the same cached credentials. To isolate them, you can use custom profile names
for different remotes:

```cli
$ dvc remote modify --local myremote profile myprofile
```

You can also overwrite the cached credentials file location per remote, for
example to have it in your home directory:

```cli
$ dvc remote modify myremote --local \
      gdrive_user_credentials_file ~/.gdrive/myremote-credentials.json
```

<admon type="warn">

If the file is in a Git repo, consider it a secret and **do not commit it**. Add
it to `.gitignore` to be sure.

</admon>

To change the user you have authenticated with or for troubleshooting misc.
token errors, you can remove the user credentials file and authorize again.

Alternatively, a `GDRIVE_CREDENTIALS_DATA` can be set to pass user credentials
in CI/CD systems, production setup, read-only file systems, etc. The content of
this variable should be a string with JSON that has the same format as in the
credentials files described above, and usually you get it going through the same
authentication process. If `GDRIVE_CREDENTIALS_DATA` is set, the
`gdrive_user_credentials_file` value (if provided) is ignored.

<admon type="warn">

If you get an error message _This file has been identified as malware or spam
and cannot be downloaded_ running a `dvc push` or `dvc pull` command, check that
the `gdrive_acknowledge_abuse` option is set:

```cli
$ dvc remote modify myremote gdrive_acknowledge_abuse true
```

</admon>

> Note our [Privacy Policy for Google APIs](/user-guide/privacy).

## Using service accounts

A
[service account](https://docs.cloud.google.com/iam/docs/service-account-overview)
is a Google account associated with your GCP project, and not a specific user.
They are intended for scenarios where your code needs to access data on its own,
e.g. running inside a Compute Engine, automatic CI/CD, etc. No interactive user
OAuth authentication is needed.

<admon type="info">

Google service accounts have their own associated usage limits which may be
exceeded if used frequently in conjunction with `dvc push`, `dvc pull`, etc. For
heavy usage, it is recommended to rely on
[delegation](#delegation-with-google-service-accounts).

</admon>

> This requires having your own
> [GC project](#using-a-custom-google-cloud-project-recommended) as explained
> above.

1. To
   [create a service account](https://cloud.google.com/docs/authentication/getting-started#creating_a_service_account),
   navigate to **IAM & Admin** in the left sidebar, and select **Service
   Accounts**. Click **+ CREATE SERVICE ACCOUNT**, enter a **Service account
   name** e.g. "My DVC project", and optionally provide a custom **Service
   account ID** and description. Then click **CREATE AND CONTINUE**. You can
   skip the two optional sections. Click **DONE** and you will be returned to
   the overview page. Select your service account and go to the **Keys** tab.
   Under **Add key** select **Create new key**, choose **JSON**, and click
   **CREATE**. Download the generated `.json` key file to a safe location.

   ⚠️ Be careful about sharing the key file with others.

2. Configure the remote to use the service account and tell it where to find the
   key file:

   ```cli
   $ dvc remote modify myremote gdrive_use_service_account true
   $ dvc remote modify myremote --local \
                 gdrive_service_account_json_file_path path/to/file.json
   ```

   Alternatively, a `GDRIVE_CREDENTIALS_DATA` can be set to pass service account
   key in CI/CD systems, production setup, read-only file systems, etc. The
   content of this variable should be a string with JSON that has the same
   format as in the keys file described above. If both this variable and
   `gdrive_service_account_json_file_path` are provided,
   `GDRIVE_CREDENTIALS_DATA` takes priority and
   `gdrive_service_account_json_file_path` is ignored.

3. Share the Google Drive folders that you want to use with the service account.
   Navigate to your Google Drive folder's sharing options and add the service
   account as an editor (read/write) or viewer (read-only):

![](/img/gdrive-share-with-service-account.png)

### Delegation

[Delegation](https://developers.google.com/identity/protocols/oauth2/service-account#delegatingauthority)
can be used to overcome quota limits associated with Google service accounts.

The required **OAuth scope** is `https://www.googleapis.com/auth/drive`.

The remote must also be configured with the associated user **personal email**:

```cli
$ dvc remote modify myremote gdrive_service_account_user_email \
              example_adress@some_google_domain.com
```

## Configuration parameters

<admon type="warn">

If any values given to the parameters below contain sensitive user info, add
them with the `--local` option, so they're written to a Git-ignored config file.

</admon>

- `url` - remote location. See [valid URL format](#url-format).

  ```cli
  $ dvc remote modify myremote url \
                      gdrive://0AIac4JZqHhKmUk9PDA/dvcstore
  ```

- `gdrive_client_id` - Client ID for authentication with OAuth 2.0 when using a
  [custom Google Client project](#using-a-custom-google-cloud-project-recommended).
  Also requires using `gdrive_client_secret`.

  ```cli
  $ dvc remote modify myremote gdrive_client_id 'client-id'
  ```

- `gdrive_client_secret` - Client secret for authentication with OAuth 2.0 when
  using a custom Google Client project. Also requires using `gdrive_client_id`.

  ```cli
  $ dvc remote modify myremote gdrive_client_secret 'client-secret'
  ```

- `profile` - file basename used to cache OAuth credentials. Helpful to avoid
  using the wrong credentials when multiple GDrive remotes use the same
  `gdrive_client_id`. The default value is `default`.

  ```cli
  $ dvc remote modify --local myremote profile myprofile
  ```

- `gdrive_user_credentials_file` - specific file path to cache OAuth
  credentials. The default is
  `$CACHE_HOME/pydrive2fs/{gdrive_client_id}/default.json` (unless `profile` is
  specified), where the `CACHE_HOME` location per platform is:

  | macOS              | Linux (\*typical) | Windows                 |
  | ------------------ | ----------------- | ----------------------- |
  | `~/Library/Caches` | `~/.cache`        | `%CSIDL_LOCAL_APPDATA%` |

  ```cli
  $ dvc remote modify myremote \
        gdrive_user_credentials_file path/to/mycredentials.json
  ```

  See [Authorization](#authorization) for more details.

- `gdrive_trash_only` - configures `dvc gc` to move remote files to
  [trash](https://developers.google.com/workspace/drive/api/reference/rest/v2/files/trash)
  instead of
  [deleting](https://developers.google.com/workspace/drive/api/reference/rest/v2/files/delete)
  them permanently. `false` by default, meaning "delete". Useful for shared
  drives/folders, where delete permissions may not be given.

  ```cli
  $ dvc remote modify myremote gdrive_trash_only true
  ```

- `gdrive_acknowledge_abuse` - acknowledge the risk of downloading potentially
  [abusive](https://support.google.com/a/users/answer/7338880) files. Anything
  identified as such (malware, personal info., etc.) can only be downloaded by
  their owner (with this param enabled).

  ```cli
  $ dvc remote modify myremote gdrive_acknowledge_abuse true
  ```

### For service accounts

A service account is a Google account associated with your GCP project, and not
a specific user. Please refer to
[Using service accounts](https://docs.cloud.google.com/iam/docs/service-account-overview)
for more information.

- `gdrive_use_service_account` - authenticate using a service account. Make sure
  that the service account has read/write access (as needed) to the file
  structure in the remote `url`.

  ```cli
  $ dvc remote modify myremote gdrive_use_service_account true
  ```

- `gdrive_service_account_json_file_path` - path to the Google Project's service
  account `.json`
  [key file](https://cloud.google.com/docs/authentication/getting-started#creating_a_service_account)
  (credentials).

  ```cli
  $ dvc remote modify --local myremote \
                      gdrive_service_account_json_file_path \
                      path/to/file.json
  ```

- `gdrive_service_account_user_email` - the authority of a user account can be
  [delegated] to the service account if needed.

  ```cli
  $ dvc remote modify myremote \
                      gdrive_service_account_user_email 'myemail-addr'
  ```

  ⚠️ DVC requires the following OAuth Scopes:
  - `https://www.googleapis.com/auth/drive`
  - `https://www.googleapis.com/auth/drive.appdata`

[delegated]: https://developers.google.com/workspace/guides/create-credentials
