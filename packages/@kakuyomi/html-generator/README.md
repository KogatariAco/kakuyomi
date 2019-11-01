# @kakuyomi/html-generator

`@kakuyomi/html-generator`は[カクヨム記法](https://kakuyomu.jp/help/entry/notation)で書かれた文章からHTMLを生成するGeneratorです。

## 利用方法

まず、`@kakuyomi/html-generator`をインストールします。

```bash
npm i -g @kakuyomi/html-generator
```

インストール完了後、`kakuyomi-html-generator`コマンドを呼び出すことでHTMLファイルと傍点画像ファイルを生成（コピー）します。

```bash
kakuyomi-html-generator ./path-to-file
```

### オプション

- -t, --title
  - タイトルを指定します
  - 必須
- -w, --writer
  - 著者名を指定します
  - 必須
- -o, --outdir
  - 出力ディレクトリを設定します
  - Default: `.`

## 制限事項

傍点用の画像を`/images/emphasis-point.png`から取得します。
このpathは現時点では変更できません。
