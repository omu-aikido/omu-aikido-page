#!/bin/bash

# プロジェクトルートに移動
cd ./

# 既存componentsディレクトリ削除
rm -rf src/components
rm -rf src/layouts

# GitHubからcomponentsディレクトリとlayoutsディレクトリを取得
curl -L "https://github.com/omu-aikido/omu-aikido-app/archive/refs/heads/master.tar.gz" \
    | tar -xz --strip=2 omu-aikido-app-master/src/components omu-aikido-app-master/src/layouts omu-aikido-app-master/src/styles

mv components src/components
mv layouts src/layouts
mv styles src/styles



rm -rf omu-aikido-app-master