#!/bin/bash

# プロジェクトルートに移動
cd ./

# 既存componentsディレクトリ削除
rm -rf src/components
rm -rf src/layouts
rm -rf src/styles

# GitHubからcomponentsディレクトリとlayoutsディレクトリを取得
curl -L "https://github.com/omu-aikido/omu-aikido-app/archive/refs/tags/v0.1.0.tar.gz" \
    | tar -xz --strip=2 omu-aikido-app-0.1.0/src/components omu-aikido-app-0.1.0/src/layouts omu-aikido-app-0.1.0/src/styles

mv components src/components
mv layouts src/layouts
mv styles src/styles



rm -rf omu-aikido-app-0.1.0