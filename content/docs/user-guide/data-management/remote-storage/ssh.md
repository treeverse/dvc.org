# SSH and SFTP

<!--
## SSH
-->

<details icon="bulb">

### Click to learn about SSH and SFTP.

[SSH] (Secure Shell) is a protocol that uses encryption to secure a connection
with a remote computer, which lets you safely transfer files to and from it
(like [`scp`]), among other features. Other operations can be used on top of
SSH, like FTP (simple file transfer protocol) which becomes secure or [SFTP].

[ssh]: https://www.ssh.com/academy/ssh
[sftp]: https://www.ssh.com/academy/ssh/sftp-ssh-file-transfer-protocol
[`scp`]: https://www.ssh.com/academy/ssh/scp

</details>

DVC will act as an SSH/SFTP client, which means that the remote storage should
be located in an [SSH server]. Use `dvc remote add` to define the remote by
setting a name and valid [SSH URL] (which may include some auth info. like user
name or port):

```cli
$ dvc remote add -d myremote ssh://user@example.com:2222/path
```

[ssh server]: https://www.ssh.com/academy/ssh/server
[ssh url]: https://tools.ietf.org/id/draft-salowey-secsh-uri-00.html#sshsyntax

<admon type="warn">

DVC requires both SSH and SFTP access to work with SSH remote storage. Check
that you can connect both ways with tools like [`ssh`] and `sftp` (GNU/Linux).  
Note that your server's SFTP root might differ from its physical root (`/`).

[`ssh`]: https://www.ssh.com/academy/ssh/command

</admon>

By default, authentication credentials (user name, password or private key,
etc.) not found in the URL are loaded from [SSH configuration]. You can also set
them directly with DVC.

[ssh configuration]: https://www.ssh.com/academy/ssh/config

## Custom authentication

2 parameters that are commonly included in an SSH URL are user name and
sometimes port. These can be set (or overridden) as follows:

```cli
$ dvc remote modify myremote user myuser
$ dvc remote modify myremote port 2222
```

Order in which DVC picks these values when defined in multiple places:

1. Value set in these `user`/`port` params (DVC-specific config)
2. User/port embedded in the `url`, if any (e.g. `ssh://user@example.com:2222`)
3. `User`/`Port` defined for the host in SSH config
4. Default values: Current system user; Standard SSH port 22

<admon type="warn">

The `dvc remote modify --local` flag is needed to write sensitive user info to a
Git-ignored config file (`.dvc/config.local`) so that no secrets are leaked
through Git. See
[Configuration](/user-guide/project-structure/configuration#config-file-locations).

</admon>

Using a private key is usually the recommended way to authenticate an SSH
connection, and it should be saved in a key file. You can set its path as shown
below. Often these require a passphrase to use as well: You can set up DVC to
ask for it each time, or set it directly.

```cli
$ dvc remote modify --local myremote keyfile /path/to/keyfile
# and (if needed)
$ dvc remote modify myremote ask_passphrase true
# or
$ dvc remote modify --local myremote passphrase mypassphrase
```

Another popular way to authenticate an SSH connection is with a simple password.
It can be set directly or you can set up DVC to ask for it when needed:

```cli
$ dvc remote modify --local myremote password mypassword
# or
$ dvc remote modify myremote ask_password true
```

## More configuration parameters

- `url` - modify the remote location ([scroll up](#amazon-s3) for details)

- `allow_agent` - whether to use [SSH agents] (`true` by default). Setting this
  to `false` is useful when `ssh-agent` is causing problems, e.g. "No existing
  session" errors.

- `gss_auth` - use Generic Security Service auth if available on host (for
  example, [with Kerberos]). `false` by default

  <admon type="warn">

  Using GSS requires `paramiko[gssapi]`, which is only supported currently by
  the DVC pip package (installed with `pip install 'dvc[ssh_gssapi]'`).

  </admon>

- `max_sessions` - change the maximum number of SSH and SFTP sessions used when
  connecting to the SSH server. Minimum of `3`, `10` by default. Should not
  exceed the server-side maximum number of sessions.

  <admon type="info">

  DVC will attempt to use as many SFTP sessions as possible (up to
  `max_sessions`) from the SSH server in order to parallelize remote transfer
  operations. The widely used OpenSSH server (sshd) defaults to a value of `10`
  for [MaxSessions]. This means that by default, DVC will attempt to use all
  available sessions from the server. In some cases, it may be useful to specify
  a lower `max_sessions` value in order to ensure that some number of sessions
  are kept available for other (non-DVC) SSH or SFTP connections.

  </admon>

  <admon type="warn">

  When encountering "Can't create any SFTP connection" errors, it means that DVC
  could not open any sessions from the SSH server. In this situation, we
  recommend setting `max_sessions` to some value less than the server-side
  maximum number of sessions.

  </admon>

[ssh agents]: https://www.ssh.com/academy/ssh/agent
[with kerberos]:
  https://en.wikipedia.org/wiki/Generic_Security_Services_Application_Program_Interface#Relationship_to_Kerberos
[maxsessions]: https://man.openbsd.org/sshd_config#MaxSessions
