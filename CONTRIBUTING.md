# How to contribute

## Reporting issues

If you think you've spotted a problem with this module, feel free to open up a
[new issue](https://github.com/bugsnag/webpack-bugsnag-plugins/issues/new). There are a couple
of things you should check before doing so:

- Do you have the latest version of webpack-bugsnag-plugins? If not, does updating to the latest
version fix your issue?
- Has somebody else [already reported](https://github.com/bugsnag/webpack-bugsnag-plugins/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen) your issue? Feel free to comment or check-in on an existing issue that matches your own.
- Is your problem definitely to do with this module? For anything else, email [support@bugsnag.com](mailto:support@bugsnag.com).

## Fixing issues

If you've identified a fix to a new or existing issue, we welcome contributions!

- [Fork](https://help.github.com/articles/fork-a-repo) the [repo on github](https://github.com/bugsnag/webpack-bugsnag-plugins)
- Make your changes locally
- Ensure the changes pass tests (`npm test`)
- Commit and push your changes
- [Make a pull request](https://help.github.com/articles/using-pull-requests)
- Ensure CI passes (and if it fails, attempt to address the cause)

## Adding features

In general, feature additions will come from Bugsnag employees. If you think you have
a useful addition that doesn’t take long to create a pull request for, feel free
to go ahead and make it and strike up a discussion. With any non-trivial amount
of work, the best thing to do is [create an issue](https://github.com/bugsnag/webpack-bugsnag-plugins/issues/new)
in which to discuss the feature, for the following reasons:

- Bugsnag has an internal roadmap of things to work on. We might have already planned to
work on your suggested feature.
- We might disagree about whether the addition is worthwhile or not.
- We might agree that the addition is worthwhile but disagree with the implementation.

That said, we have had some tremendous contributions from the community in the past,
so use your best judgement. What we want to avoid here is anybody feeling like they’ve
wasted their time!

## Releases

To start a release:

- decide on a version number
- create a new release branch from `master` with the version number in the branch name `git checkout -b release/vX.Y.Z`
- review commits made to `master` since the last release
- update `CHANGELOG.md` reflecting the above changes, release version, and release date and commit to your release branch
- make a PR from your release branch to `master` entitled `Release vX.Y.Z`
- get the release PR reviewed

Once the release PR has been approved, merge the PR into `master`. You are now ready to make the release. Ensure you are logged in to npm and that you have access to publish the package.

- Make sure you are on the latest `master`.

- Bump the package version and push the new commit and tag:

  ```
  npm version <major|minor|patch>
  git push origin master
  git push --tags
  ```

- Publish the new version to npm:

  ```
  npm publish
  ```

Finally:

- create a release on GitHub https://github.com/bugsnag/webpack-bugsnag-plugins/releases/new
- Use the existing tag created during the version step above
- copy the release notes from `CHANGELOG.md`
- publish the release