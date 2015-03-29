class: center, middle

# RSpec の便利機能と SHIRASAGI に Database Cleaner を導入した話

Makes your specs more DRY and better.

---

## 自己紹介

* [中野 英雄](https://www.facebook.com/hideo.nakano)
* [株式会社ウェブチップス](http://www.web-tips.co.jp/)で[SHIRASAGI](http://ss-proj.org/)開発者
* facebook: [https://www.facebook.com/hideo.nakano](https://www.facebook.com/hideo.nakano)
* twitter: [https://twitter.com/sunny4381](https://twitter.com/sunny4381)
* github: [https://github.com/sunny4381](https://github.com/sunny4381)
* Ruby 歴3ヶ月程度

---

# 目次

テストで共通して出現するコードをまとめることで、
テストの見通しがよくなり、メンテナンス性も向上するいくつかの方法を解説します。

* 基礎編
  * shared example / shared context
  * custom matcher
  * [Configuration#include](http://www.rubydoc.info/github/rspec/rspec-core/RSpec/Core/Configuration#include-instance_method)
  * [Configuration#extend](http://www.rubydoc.info/github/rspec/rspec-core/RSpec/Core/Configuration#extend-instance_method)
* 応用編
  * SHIRASAGI に Database Cleaner を導入した話
  * さらなる Configuration#extend の応用

---

# shared example / shared context

すみませんが、便利な使い方が思いつかなかったので紹介するだけにとどめます。

[参考]
* http://d.hatena.ne.jp/yohfee/20110222/1298384637
* http://f96q.github.io/blog/2012/08/08/rspec/

誰か便利な使用方法を教えてください。

---

# custom matcher

独自の matcher を定義できます。
`spec_helper.rb` などに次のように書きます。

```ruby|spec_helper.rb
RSpec::Matchers.define :any_of do |*expected|
  match {|actual| expected.include?(actual) }
end
```

`*_spec.rb` で次のように使用します。

```ruby
describe "Test" do
  subject { "blue" }
  it { is_expected.to any_of("red", "green", "blue") }
  it { is_expected.not_to any_of("cyan", "magenta", "yellow") }
end
```

エラーメッセージなどをカスタマイズすることもできます。
詳しくは下の参考ページを参照。

[参考]
* http://qiita.com/kozy4324/items/9a6530736be7e92954bc

---

# Configuration#include

[Configuration#include](http://www.rubydoc.info/github/rspec/rspec-core/RSpec/Core/Configuration#include-instance_method) を使うと、ヘルパーメソッドを提供することができます。

`spec/support/helpers.rb` にヘルパーメソッドを提供する `module` を書きます。
下の例では、`login_user(user)` というヘルパーメソッドを作成しています。

```ruby
module Helpers
  def login_user(user)
    visit login_path
    within "form" do
      fill_in "item[userid]", with: user.id
      fill_in "item[password]", with: user.password
      click_button "login"
    end
  end
end
```

---

# Configuration#include

`spec_helper.rb` 内の configure ブロックで Helpers module を include します。

```ruby
RSpec.configure do |config|
  config.include(Helpers)
end
```

---

# Configuration#include

`spec/features/**/*_spec.rb` で次のように使用します。

```ruby
feature "shopping cart" do
  given(:user) { create(:user) }
  given(:item) { create(:item) }

  background { login_user(user) }

  scenario "add item to card" do
    visit item_path item
    within("form") do
      click_button "add"
    end

    expect(Card.count) to be >0
  end
end
```

---

# Configuration#extend

[Configuration#extend](http://www.rubydoc.info/github/rspec/rspec-core/RSpec/Core/Configuration#extend-instance_method) の例としてヘルパーメソッドを提供する例をよく見かけますが、
include と異なり example 内で使用できないので、
ヘルパーメソッドの提供にはあまり向いてません。

Configuration#extend の何が便利かというと、個々の spec すべてで `before(:context)` や `before(:example)` を実行できるようになります。

具体例を示したほうが早いので、以下のような Spy module を extend してみます。

```ruby
module Spy
  def self.extended(obj)
    obj.before(:example) do
      puts "start example: #{self.inspect}"
    end

    obj.after(:example) do
      puts "finish example: #{self.inspect}"
    end
  end
end
```

---

# Configuration#extend

`spec_helper.rb` 内の configure ブロックで Spy module を extend します。

```ruby
RSpec.configure do |config|
  config.extend(Spy)
end
```

RSpec を実行すると、example の開始と終了でコンソールにメッセージが出力されます。

```bash
$ rspec
start example: #<RSpec::ExampleGroups::CmsUsers::WithAuth::WithSnsUser "#edit" (./spec/features/cms/users_spec.rb:54)>
finish example: #<RSpec::ExampleGroups::CmsUsers::WithAuth::WithSnsUser "#edit" (./spec/features/cms/users_spec.rb:54)>
start example: #<RSpec::ExampleGroups::CmsUsers::WithAuth::WithSnsUser "#delete" (./spec/features/cms/users_spec.rb:65)>
finish example: #<RSpec::ExampleGroups::CmsUsers::WithAuth::WithSnsUser "#delete" (./spec/features/cms/users_spec.rb:65)>
```

---

# SHIRASAGI に Database Cleaner を導入した話

extend の実用的な例として SHIRASAGI に Database Cleaner を導入した話をします。

---

# SHIRASAGI に Database Cleaner を導入した話

module では [#metadata](http://www.rubydoc.info/github/rspec/rspec-core/RSpec/Core/ExampleGroup#metadata-class_method) を使うと、`RSpec.describe` に指定したパラメータを取得できます。

例えば、次のようなテストがあるとすると:

```ruby
describe "nice test", param: :value do
 ...
end
```

次のように metadata を使うことで、`:param` に指定したパラメータを取得することができます。

```ruby
module Syp
  def self.extended(obj)
    param = obj.metadata[:param]
    puts "#{param}"
  end
end
```

---

# SHIRASAGI に Database Cleaner を導入した話

SHIRASAGI では、次のような DatabaseCleanerSupport module を extend しています。
[#metadata](http://www.rubydoc.info/github/rspec/rspec-core/RSpec/Core/ExampleGroup#metadata-class_method) から `dbscope` パラメータを取得しています。

```ruby
module DatabaseCleanerSupport
  def self.extended(obj)
    dbscope = obj.metadata[:dbscope]
    dbscope ||= RSpec.configuration.default_dbscope

    obj.prepend_before(dbscope) do
      Rails.logger.debug "start database cleaner at #{inspect}"
      DatabaseCleaner.start
    end
    obj.after(dbscope) do
      Rails.logger.debug "clean database at #{inspect}"
      DatabaseCleaner.clean
    end
  end
end
```

---

# SHIRASAGI に Database Cleaner を導入した話

`spec_helper.rb` 内の configure ブロックで DatabaseCleanerSupport module を extend します。
ついでに既定のコンテキストを持つ `default_scope` も追加しています。

```ruby
RSpec.configure do |config|
  config.add_setting :default_dbscope, default: :context
  config.extend(DatabaseCleanerSupport)
end
```

---

# SHIRASAGI に Database Cleaner を導入した話

2 種類の使い方があります。

`RSpec.describe` に `dbscope: :context` を指定すると、
最後のテスト実行後に 1 度 Database Cleaner が動作します。

```ruby
describe "cms_users", dbscope: :context do
  ...
end
```

`RSpec.describe` に `dbscope: :example` を指定すると、
テストを実行するたびに Database Cleaner が動作します。

```ruby
describe "cms_users", dbscope: :example do
  ...
end
```

---

# さらなる extend の応用

extend と include の組み合わせを考えてみます。

次のようなテスト実行前に `vagrant up` を実行し、テスト実行後に `vagrant destory` する module を作成します。

```ruby
module VagrantSupport
  mattr_accessor(:vagrant_root)

  def self.extended(obj)
    vagrant_root = obj.metadata[:vagrant_root]
    obj.prepend_before(:context) do
      system("cd #{vagrant_root} && vagrant up")
    end
    obj.after(:context) do
      system("cd #{vagrant_root} && vagrant destroy -f")
    end
  end
end
```

---

# さらなる extend の応用

さっきの module にヘルパーメソッドを定義します。

```ruby
module VagrantSupport
  def ssh(command)
    system("cd #{vagrant_root} && vagrant ssh #{command}")
  end

  def apatch_ctl(command)
    case command
    when :start
      ssh("sudo service httpd start")
    when :stop
      ssh("sudo service httpd stop")
    end
  end
end
```

---

# さらなる extend の応用

`spec_helper.rb` 内の configure ブロックで VagrantSupport module を extend / include します。

```ruby
RSpec.configure do |config|
  config.extend(VagrantSupport)
  config.include(VagrantSupport)
end
```

---

# さらなる extend の応用

使用方法:

```ruby
describe "external web server", vagrant_root: Rails.root.join("vagrants", "httpd")
  ...
end
```

