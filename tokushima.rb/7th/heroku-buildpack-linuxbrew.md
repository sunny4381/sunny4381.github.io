class: center, middle

# 作ってみました

[heroku-buildpack-linuxbrew](https://github.com/sunny4381/heroku-buildpack-linuxbrew)

---

# 自己紹介

* [中野 英雄](https://www.facebook.com/hideo.nakano)
* [株式会社ウェブチップス](http://www.web-tips.co.jp/)
* facebook: [https://www.facebook.com/hideo.nakano](https://www.facebook.com/hideo.nakano)
* twitter: [https://twitter.com/sunny4381](https://twitter.com/sunny4381)
* github: [https://github.com/sunny4381](https://github.com/sunny4381)
* Ruby 歴半月程度

---

# 何ができるの？

* Heroku 環境に linuxbrew を導入し、linuxbrew で好きなモジュールをインストールできます。

---

# 使い方

* `.cellar` ファイルと `.buildpacks` を書きます。
* `.cellar` ファイルには、linuxbrew でインストールしたいモジュールを書きます。

```text|.cellar
mecab
mecab-ipadic
```

* `.buildpacks` には、heroku-buildpack-linuxbrew を設定します。

```text|.cellar
https://github.com/sunny4381/heroku-buildpack-linuxbrew.git
```
