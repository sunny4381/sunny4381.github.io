class: center, middle

# 作ってみました

* [heroku-buildpack-linuxbrew](https://github.com/sunny4381/heroku-buildpack-linuxbrew)
* [open_jtalk-ruby](https://github.com/sunny4381/open_jtalk-ruby)
* [open_jtalk-server](https://github.com/sunny4381/open_jtalk-server)
* 読み上げ

---

# 自己紹介

* [中野 英雄](https://www.facebook.com/hideo.nakano)
* [株式会社ウェブチップス](http://www.web-tips.co.jp/)
* github: [https://github.com/sunny4381](https://github.com/sunny4381)
* facebook: [https://www.facebook.com/hideo.nakano](https://www.facebook.com/hideo.nakano)
* Ruby 9ヶ月程度

---

# heroku-buildpack-linuxbrew

## GitHub

[heroku-buildpack-linuxbrew](https://github.com/sunny4381/heroku-buildpack-linuxbrew)

---

# heroku-buildpack-linuxbrew

## 何ができるの？

* [Heroku](https://www.heroku.com/) にデプロイする際 [linuxbrew](https://github.com/Homebrew/linuxbrew) で好きなモジュールをインストールできます。

---

# heroku-buildpack-linuxbrew

## 使い方

* `.buildpacks` ファイルに、[heroku-buildpack-linuxbrew](https://github.com/sunny4381/heroku-buildpack-linuxbrew) を追加します。
* `.cellar` ファイルにインストールしたいモジュールを書きます。

---

# heroku-buildpack-linuxbrew

## .buildpacks ファイルの例

```text
$ cat .buildpacks
https://github.com/sunny4381/heroku-buildpack-linuxbrew.git
```

---

# heroku-buildpack-linuxbrew

## .cellar ファイルの例

`.cellar` ファイルに linuxbrew でインストールしたいモジュールを書きます。

```text
$ cat .cellar
mecab
mecab-ipadic
```

linuxbrew でインストールできるモジュールならなんでもインストールできます。

後ほど、[open_jtalk-server](https://github.com/sunny4381/open_jtalk-server) で具体例を示します。

---

# open_jtalk-ruby

## GitHub

[open_jtalk-ruby](https://github.com/sunny4381/open_jtalk-ruby)

---

# open_jtalk-ruby

## 何ができるの？

[open_jtalk](http://open-jtalk.sp.nitech.ac.jp) の Ruby 拡張で、日本語を音声合成することができます。

---

# open_jtalk-ruby

## 使い方

"こんにちは。" を音声合成し、`a.wav` ファイルに保存します。

```ruby
require 'open_jtalk'
text = "こんにちは。".encode("UTF-8")

config = OpenJtalk::Config::Mei::NORMAL
OpenJtalk.load(config.to_hash) do |openjtalk|
  header, data = openjtalk.synthesis(openjtalk.normalize_text(text))

  OpenJtalk::WaveFileWriter.save("a.wav", header, data)
end
```

音声モデルは、次の 2 種類が使えます。

* Mei: 女性の声
* Nitech: 男性の声

---

# open_jtalk-server

## GitHub

* [open_jtalk-server](https://github.com/sunny4381/open_jtalk-server)

---

# open_jtalk-server

## 何ができるの？

[open_jtalk-ruby](https://github.com/sunny4381/open_jtalk-ruby)のサーバー版です。
Rails アプリで、"Deploy to Heroku" ボタンがあるので、簡単に試すことができます。

---

# 読み上げ

## 何ができるの？

Web ページを読み上げることができます。

デモ。
