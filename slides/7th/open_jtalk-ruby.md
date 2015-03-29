class: center, middle

# 作ってみました

[open_jtalk-ruby](https://github.com/sunny4381/open_jtalk-ruby)/[server](https://github.com/sunny4381/open_jtalk-server)

---

# 自己紹介

* [中野 英雄](https://www.facebook.com/hideo.nakano)
* [株式会社ウェブチップス](http://www.web-tips.co.jp/)
* facebook: [https://www.facebook.com/hideo.nakano](https://www.facebook.com/hideo.nakano)
* twitter: [https://twitter.com/sunny4381](https://twitter.com/sunny4381)
* github: [https://github.com/sunny4381](https://github.com/sunny4381)
* Ruby 歴半月程度

---

# open_jtalk-ruby

* github: [https://github.com/sunny4381/open_jtalk-ruby](https://github.com/sunny4381/open_jtalk-ruby)
* できること
  * 日本語文字列を音声合成します。
  * open_jtalk-ruby はライブラリ。
  * open_jtalk-server はサーバ。

---

# open_jtalk-ruby

使い方:

```ruby
require 'open_jtalk'
text = "こんにちは。".encode("UTF-8")

config = OpenJtalk::Config::Mei::NORMAL
OpenJtalk.load(config.to_hash) do |openjtalk|
  header, data = openjtalk.synthesis(openjtalk.normalize_text(text))

  OpenJtalk::WaveFileWriter.save("a.wav", header, data)
end
```

---

# open_jtalk-ruby

* 苦労したところ
  * `mkmf`
    * `mkmf` が submodule を（勝手に）共有ライブラリと仮定。
      * submodule は、スタティックライブラリ。
    * `mkmk` が C++ の最適化オプションを設定してくれない。
    * `mkmk` が Ruby のバージョンで動作が異なる。

---

# open_jtalk-server

* github: [https://github.com/sunny4381/open_jtalk-server](https://github.com/sunny4381/open_jtalk-server)
* rails アプリ。
* "Deploy to Heroku" ボタンをつけてみました。
