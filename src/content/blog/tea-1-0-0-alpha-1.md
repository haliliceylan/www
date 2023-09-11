---
title: "tea 1.0.0-alpha.1 | tea.xyz"
description: 1.0.0-alpha.1 is a seminal release, we welcome feedback, especially from v0 early adopters.
date: 2023-08-23
categories: [open-source, web3]
tags: [web3 for open-source]
draft: false
featured_image: "/Images/blog/awesome-web3.jpg"
---
![Featured Image](/Images/blog/awesome-web3.jpg)

I have always practiced iterative development. I did it with brew and every other open source project I’ve ever created and every job I’ve ever had (where I was allowed—Apple refused to let me :nerd_face:). I believe the only way to “find the fun”† in development is to try out your ideas and preferably with as large a community as possible. Thank you for your help in “finding the fun” with tea. It’s been a very instructive process but now we’re ready for version one.

In this post we talk about what has changed and why. It is a complement to our full documentation and the repo README.

1.0.0-alpha.1 is a seminal release, we welcome feedback, especially from v0 early adopters.

<div class="indent ps-3">

 † the legendary developer Sid Meier described his iterative process when developing video games as “finding the fun”. Initially gameplay ideas might actually be tedious; if so; iterate until fun emerges.

</div>

## Magic
Most notably we have reconsidered “magic”.

Magic was an amazing feature but the truth is it didn’t suit terminals. tea’s magic would automatically fetch packages as you typed, even working with complex pipelines.

It had people say wow, but truthfully it was a little unnerving. Terminals are precise, magic was… unpredictable. As engineers we want to know precisely what is happening in our terminals and tea’s magic led to numerous situations where our users were “wow I love magic but wtf is going on with this command example?”

So now things are explicit—but we try to make running anything as frictionless as possible:

<div class="code-block p-4 mb-4">

```
$ node
^^ tea provides this, run it with `tea`

$ tea
tea +node && node

Welcome to Node.js v20.6.0.
Type ".help" for more information.
>
```
</div>

If you type something that your machine doesn’t have but tea has it we let you know and then you can just type tea.

You can also just type t.

Shell Integration
In the above example typing tea expands to tea +node && node via our shell integration.

tea +node adds node to the environment:

$ tea +node
(+node) $ node --version
v20.1.2

(+node) in your prompt indicates your terminal has been supplemented with, here, node

You can keep adding packages:

(+node) $ tea +cargo +c++
(+node+cargo+llvm.org) $ node --version; cargo --version; c++ --version
v20.1.2
cargo 1.72.1
clang version 14.0.3

Packages added this way are available for the session. They are gone when you exit.

There was no direct way to do this in v0 though it was an idea we kept playing with because of how useful it can be to construct temporary environments that you then either commit (tea install) or discard (exit).

docs.tea.xyz/shell-integration

Installing Packages

Yeah, yeah. You told us so… and you were right! :smirk:

We resisted adding an install command for nine long months because we wanted to reinvent package management. We believe we now succeeded and after playing with the successor for a while we realized… sometimes you just need to install shit.

$ tea +deno

(+deno) $ tea install
installed: ~/.local/bin/deno

$ cat ~/.local/bin/deno
#!/bin/sh
exec tea +deno.land -- deno "$@"

tea doesn’t really install anything—packages are only ever cached in ~/.tea—so it follows that installing things with tea is really just creating a stub script that runs the package via tea.

oh! btw: sudo tea install will install to /usr/local/bin

docs.tea.xyz/tea-install

pkg shortnames
While you could always have tea run commands just by specifying them directly, eg. tea node . For most other uses you would need to specify dependencies with the fully qualified names, eg. tea +nodejs.org@18 sh you can now in all cases just specify commands (eg. tea +node@18 sh).

In cases where multiple packages provide the same commands we require you to be more specific:

$ tea yarn
error: multiple packages provide `yarn`, pls be more specific:

    tea +classic.yarnpkg.com yarn
    tea +yarnpkg.com yarn

Previously we allowed YAML front matter in scripts, but with support for shortnames the shebang syntax became much more concise and we decided that the YAML front matter, in fact, obscured intent. Thus we have dropped the feature; if you had something like:

#!/usr/bin/env tea

#---
# args:
#    python
# dependencies:
#    git-scm.org: ^2
#    gnu.org/tar: '*'
#    python.org: ~3.11
#---

It can now be quite elegantly expressed instead as:

#!/usr/bin/env -S tea +git@2 +tar python@3.11

While the YAML front matter is easier to read it required you and others who read your script to understand how tea works and know about tea. Shebangs are as old as UNIX and by encoding all the information there anyone who knows scripting can understand what is going on.

We really love UNIX and the UNIX philosophy and—with everything we do—seek to supplement its amazing base.

tea’s +pkg syntax is now consistent across all usage. When using tea as a runner you can add extra packages to instantiations of tools (super handy for eg. tea +openssl cargo build ), as a shebang you can add all the packages you need during your script’s execution and with our shell-integration +pkg syntax adds packages directly to your terminal session.

docs.tea.xyz/using-tea/running-anything
docs.tea.xyz/scripts
docs.tea.xyz/shell-integration

Developer Environments
In v0 magic automatically loaded developer environments. This violated the principle of least surprise which (especially on the command line) made using tea unpredictable. It also meant you were forced to use magic if you wanted developer environments and not all users wanted all parts of our magic.

The feature also had a secret binary operation. The shell hook that activated the developer environment could not take too long since it could randomly occur anytime you changed directory. Thus the packages in the environment might not actually be installed, instead tea relied on the command not found handler (ie. the primary form of magic) to install the packages on first use. Which led to another problem with magic: it only works at the shell prompt and no deeper, ie. your Makefile will just inexplicably fail to find the commands in your devenv.

So in v1 you must opt in to developer environments. It’s just as good a feature as before; we figure out the precise packages you need based on the keyfiles in your project and you can refine those dependency constraints to any versions you want using YAML front matter; it’s just now you have to explicitly turn it on on a per directory basis using a separate tool (that tea can run) called dev.

$ cd myproj
myproj $ dev
found: deno.json, .git; tea +deno +git

(+deno+git) myproj $ tea status
+deno.land~1.33 +git-scm.org^2

(+deno+git) myproj $ deno --version
Deno 1.33.1

(+deno+git) myproj $ env | grep deno
PATH=~/.tea/deno.land/v1.33.1/bin:#…
# …

(+deno+git) myproj $ cd ..
tea -deno -git

$ deno --version
command not found: deno

# ^^ environments are only active inside their directories

dev environments persist. New terminal sessions will automatically load your dev environments when you step into them.

Making dev a separate tool brings clarity to the scope of tea. dev is entirely built on top of tea and the tea primitives. It leverages tea’s core features to create environments. You see this when you step into dev environments since we output the calls we make, eg. tea +deno +git.

This suite of features means the --env and -E flags have been dropped. These flags were confusing and tricky to use correctly, if you had a specific use that you don’t think is covered in v1 let us know and we’ll figure out what you or we should do about it.

docs.tea.xyz/dev

Endpoints
tea/gui added support for package “endpoints” in a recent release. Endpoints represent an idiomatic use of the package, for example, Stable Diffusion web UI’s endpoint launches the web UI on an available port and opens your browser to show it. tea/cli supports running these endpoints in a “Dockerlike” fashion:

$ tea run stable-diffusion-webui

With some of our other local-AI packages we make sure to download models for you which the tool may otherwise leave as an exercise for the reader, eg.

$ tea run llama.cpp
# ^^ grabs a compatible model and launches a chat TUI

docs.tea.xyz/run


Dropped Features

Symlinks to tea
In v0 symlinks to tea would act like the name of the symlink. While a neat feature it was too easy to create fork bombs with complex scripts or collections of tea symlinks that were impossible to truly fix.

Stubs (which tea install uses) are also more configurable allowing precise versioning of installed tools.

If you have a lot of symlinks to tea currently then we apologize for the inconvenience. We appreciate your early adoptence!

 Migration: tea install node

Magic
Magic was fun but ultimately had more problems than it was worth. The terminal is inherently a precise environment where you should be specific about your needs.

All the same if you want it back it’s one line of shell code:

command_not_found_handler() { tea -- "$@" }

Magical developer environments also meant we couldn’t actually install the tools you needed when you entered project directories since this would make a simple cd operation potentially pause for minutes. Thus we relied on magic to instantiate commands initially giving us a situation where things may or may not be installed which meant your projects may or may not actually work. Hardly great DX.

Supplemental Env Vars ($VERSION, $SRCROOT )
In the process of building tea we came to realize our true strength was making the entire open source ecosystem available to you. Open Source is a rich, treasure trove of tooling and there are better tools out there to get variables like these. tea’s scope has been tightened considerably and no longer provides these conveniences.

README.md as a Source of Dependency Data
If you used this we may bring it back, let us know. We still believe it is possible to have the README be both human readable and machine readable, but this feature was underused by the community and documenting it increased the perceived complexity of tea so we dropped it.

Running Scripts via URL
UNIX tools do one thing and do it well. curl is damn good at loading data from URLs, has over 20 years of battle testing and is super configurable.

curl foo.com/script.py | tea python@3.10

Other Minor Changes
punting through to the system with eg tea +node make
Unpredictable, would tea run a system package or tea’s package?
If you still want to run system packages specify their full paths: tea +node /usr/bin/make
this can be super useful, sometimes you need a system tool to have access to external packages
tea +python.org node used to be an error; we guessed that since you were specifying additional packages yourself that you didn’t want us to infer node’s +pkg. This now works.
--env /-E was a confusing flag that could lead to unexpected behaviors
auto-symlinking installed tools to ~/.tea/.local/bin has been removed
this caused unexpected behavior and would screw up developer environments
tea install is the new way to add tools to the system environment
--dry-run removed. We added this because tea/cli previously would look for tools in tea and if it didn’t find them we would use a system tool (if available) and --dry-run allowed you to figure out what was going on. Since you now must specify full paths if you want tea to use a system tool we have dropped this flag.
Our shell integration doesn’t have support for fish or other alternate shells YET.
Please PR!
shell integration is quite a bit more complex now unfortunately…
--json — debatably useful, open ticket if you want it back

FAQ
How do I search for packages?
Type the command you want. If tea has it, it’ll say so.

If you need search that is more “waffley” then use the right tool for that job: a full web interface: https://tea.xyz/+

How do I update packages?
Much like npx or pipx , tea doesn’t “install” packages, we just cache them. However rather than go to the Internet whenever you type a command we just use whatever is already cached if it satisifies the constraints you specify. Thus we also support @latest syntax:

$ tea node@latest --version

To be consistent we allow you to invoke tea this way, which can lead to some amusing commands:

$ tea@latest npx@latest cowsay@latest 'fancy a cuppa?'
 ________________
< fancy a cuppa? >
 ----------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||

Getting Started
brew install teaxyz/pkgs/tea-cli
docs.tea.xyz/installing-w/out-brew

A Thousand Tweaks
The 1.0.0-alpha release is a landmark for us here at tea.xyz. Thousands of tiny changes were implemented based on user feedback and 9 months of intensely using the tooling across many stacks and many platforms.

Let us know what you think. discussions-link-here
