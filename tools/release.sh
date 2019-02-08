#!/bin/bash
# This script is for MacOS

if [[ -z "$1" ]] || [[ -z "$2" ]]; then
    echo "Number of parameters is too low"
    echo "Usage: ./release.sh <major/minor/maintenance> <release message>"
    exit 1
fi

if [[ "$1" != "major" ]] && [[ "$1" != "minor" ]] && [[ "$1" != "maintenance" ]]; then
    echo "Unrecognized release type"
    echo "Usage: ./release.sh <major/minor/maintenance> <release message>"
    exit 2
fi

currentBranch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$currentBranch" != "master" ]]; then
    echo "Current branch is not master, switching to master..."
    git checkout master > /dev/null 2>&1

    exitCode=$?
    if [[ ${exitCode} != 0 ]]; then
        exit ${exitCode}
    fi
fi

# Tag
lastTag=$(git describe --abbrev=0)
major=$(cut -d '.' -f1 <<< "$lastTag")
minor=$(cut -d '.' -f2 <<< "$lastTag")
maintenance=$(cut -d '.' -f3 <<< "$lastTag")

if [[ "$1" == "maintenance" ]]; then
    maintenance=$(($maintenance + 1))
fi

if [[ "$1" == "minor" ]]; then
    minor=$((minor + 1))
    maintenance=0
fi

if [[ "$1" == "major" ]]; then
    major=$((major + 1))
    minor=0
    maintenance=0
fi

newTag="$major.$minor.$maintenance"
echo "New tag version is $newTag"

echo "Changing version in manifest.json"
sed -i '' -e "s/$lastTag/$newTag/" ../manifest.json > /dev/null
git add ../manifest.json
git commit -m "Bumped version to $newTag" > /dev/null 2>&1

echo "Tagging the branch with $newTag"
git tag -a "$newTag" -m "$2" > /dev/null 2>&1
git push --follow-tags > /dev/null 2>&1

echo "Done"