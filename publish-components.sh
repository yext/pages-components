#!/bin/bash

set -e

MASTER_BRANCH='master'

if [ "$(git status --porcelain)" ]
then
  echo 'Error: uncommitted changes. Please commit or stash changes and try again.'
  exit 1
fi

if [ "$(git rev-parse --abbrev-ref HEAD)" != "$MASTER_BRANCH" ]
then
  echo "Error: not on master branch. Please check out '${MASTER_BRANCH}' and try again."
  exit 1
fi

git fetch origin ${MASTER_BRANCH}

if [ "$(git rev-list --count HEAD..origin/${MASTER_BRANCH})" != 0 ]
then
  echo "Error: missing commits from origin/${MASTER_BRANCH}. Please pull ${MASTER_BRANCH} and try again."
  exit 1
fi

if [ "$(git rev-list --count origin/${MASTER_BRANCH}..HEAD)" != 0 ]
then
  echo "Error: ${MASTER_BRANCH} is ahead of origin/${MASTER_BRANCH}. Please merge your changes and try again."
  exit 1
fi

yarn lerna publish from-package --yes
