#!/bin/bash
BRANCH_NAME="$(node -e "const refs = process.env.GITHUB_REF.split('/'); console.log(refs[refs.length - 1])")"
if [ "$BRANCH_NAME" == "master" ]
then
  # Install kaskadi-cli
  npm i kaskadi-cli
  # Init
  ./node_modules/.bin/kaskadi init lambda
  npm rm kaskadi-cli
  # Commit files
  if [ "$GITHUB_ACTOR" == "alexlemaire" ]
  then
    USERNAME="Alexis Lemaire"
    EMAIL="a.lemaire@klimapartner.de"
  elif [ "$GITHUB_ACTOR" == "Holger-Will" ]
  then
    USERNAME="Holger Will"
    EMAIL="h.will@klimapartner.de"
  fi
  git config --global user.name "$USERNAME"
  git config --global user.email "$EMAIL"
  git add *.js
  git rm .github/workflows/init.yml
  git rm .github/workflows/scripts/init.sh
  git commit -am "Initialized repository with correct naming"
  git push
else
  echo "Branch is not master, not proceeding to initialize repository."
fi
