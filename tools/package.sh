#!/bin/bash
# This script is for MacOS

PROJECT_NAME="TodoistChromePlugin"
TMP_FOLDER="/tmp/"
TMP_PROJECT_FOLDER="$TMP_FOLDER$PROJECT_NAME"

currentBranch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$currentBranch" != "master" ]]; then
    echo "Current branch is not master, switching to master..."
    git checkout master > /dev/null 2>&1

    exitCode=$?
    if [[ ${exitCode} != 0 ]]; then
        exit ${exitCode}
    fi
fi

lastTag=$(git describe --abbrev=0)
repositoryRoot=$(git rev-parse --show-toplevel)

echo "Packaging $repositoryRoot with tag $lastTag"

echo "Copying project to $TMP_FOLDER..."
rm -rf ${TMP_PROJECT_FOLDER}
cp -r ${repositoryRoot} ${TMP_PROJECT_FOLDER}

echo "Removing unnecessary files and directories..."
rm -r ${TMP_PROJECT_FOLDER}/.gitignore
rm -rf ${TMP_PROJECT_FOLDER}/.git
rm -rf ${TMP_PROJECT_FOLDER}/.idea
rm -rf ${TMP_PROJECT_FOLDER}/documentation
rm -rf ${TMP_PROJECT_FOLDER}/tools
rm -rf ${TMP_PROJECT_FOLDER}/test
rm -rf ${TMP_PROJECT_FOLDER}/package.json
rm -rf ${TMP_PROJECT_FOLDER}/package-lock.json
rm -rf ${TMP_PROJECT_FOLDER}/node_modules
rm -rf ${TMP_PROJECT_FOLDER}/README.md

echo "Creating releasable archive..."
packagePath="${repositoryRoot}/${PROJECT_NAME}_$lastTag.zip"
cd ${TMP_FOLDER}
zip -r ${packagePath} ${PROJECT_NAME} > /dev/null 2>&1

echo "Cleaning temp folder..."
rm -rf ${TMP_PROJECT_FOLDER}

echo "Package $packagePath was created"

echo "Done"
