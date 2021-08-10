# 基本的な使い方
初回は以下のコマンドでnode-redのコンテナとmtsaビルド用のコンテナが起動する。
２回目以降は`docker-compose up -d`のみでOK。

```
docker-compose build
docker-compose up -d
```

node-redはブラウザでhttp://localhost:1880/ にアクセスすることで利用可能。



## MTSAのビルド
MTSAをビルドする場合はまず初めに`mtsa-data`内で以下のコマンドを用いてMTSAをクローンする。

```
git clone https://bitbucket.org/lnahabedian/mtsa.git
```

次に以下のコマンドでmavenを実行することでビルドが開始される。

```
docker-compose exec mtsa /bin/bash -c "cd mtsa/maven-root/mtsa && mvn install -Dmaven.test.skip=true"
```

ビルドが完了するとmtsa-data/mtsa/maven-root/mtsa/target内にjarファイルが生成される。
