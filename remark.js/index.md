# Markdown

Markdown is a plain text formatting syntax that easily lets you write next to plain text with special formatting to signalize textual elements like headings, bullet lists, links and so on.

Have a look at the [Markdown website](http://daringfireball.net/projects/markdown/) if you're not familiar with Markdown formatting.

## Slide Separators

A line containing three dashes, represents a slide separator (not a horizontal rule, `<hr />`, like in regular Markdown). Thus, a simple Markdown text like the one below represents a slideshow with two slides:

```
# Slide 1
This is slide 1
---
# Slide 2
This is slide 2
```

### Incremental Slides

To avoid having to duplicate content if a slide is going to add to the previous one, using only two dashes to separate slides will make a slide inherit the content of the previous one:

```
# Slide

- bullet 1
--

- bullet 2
```

The above text expands into the following:

```
# Slide

- bullet 1
---

# Slide

- bullet 1
- bullet 2
```

Empty lines before and after the two dashes are of significance as the preceding newline character is omitted to enable adding to the last line of the previous slide. Thus, as the extra bullet point in the above example needs to go on a separate line, an extra line is added after the two dashes to force a newline. Without the extra line, the resulting text would have been `- bullet 1- bullet 2`.

## Slide Properties

Initial lines of a slide on a key-value format will be extracted as slide properties.

### name

The `name` property accepts a name used to identify the current slide:

```markdown
name: agenda

# Agenda
```

A slide name may be used to:

 - Link to a slide using URL fragment, i.e. `slideshow.html#agenda`

 - Navigate to a slide using the [[API|Configuration#api]], i.e. `slideshow.gotoSlide('agenda')`

 - Identify slide DOM element, either for scripting or styling purposes:

    ```html
    <div class="remark-slide-container">
      <div class="remark-slide-scaler">
        <div class="remark-slide">
          <div id="slide-agenda" class="remark-slide-content">
            <h1>Agenda</h1>
    ```

 - Reference slide when using the [[template|Markdown#template]] slide property.

### class

The `class` property accepts a comma-separated list of class names, which are applied to the current slide:

```markdown
class: center, middle

# Slide with content centered in both dimensions
```

Resulting HTML extract:

```html
<div class="remark-slideshow">
  <div class="remark-slide">
    <div class="remark-slide-content center middle">
      <h1>Slide with content centered in both dimensions</h1>
```

Built-in slide classes include `left`, `center`, `right`, `top`, `middle` and `bottom`, which may be used to [[align entire slides|Formatting#whole-slide-text-alignment]].

### background-image

The `background-image` property maps directly to the [background-image](http://www.w3schools.com/cssref/pr_background-image.asp) CSS property, which are applied to the current slide:

```markdown
background-image: url(image.jpg)

# Slide with background image
```

Other slide background CSS properties defined in the default [remark styles](https://github.com/gnab/remark/blob/master/src/remark.less):

```css
background-position: center;
background-repeat: no-repeat;
background-size: contain;      /* applied using JavaScript only if background-image is larger than slide */
```

### template

The `template` property names another slide to be used as a template for the current slide:

```markdown
name: other-slide

Some content.

---
template: other-slide

Content appended to other-slide's content.
```

The final content of the current slide will then be this:

```markdown
Some content.

Content appended to other-slide's content.
```

Both template slide content and properties are prepended to the current slide, with the following exceptions:

- `name` and `layout` properties are not inherited
- `class` properties are merged, preserving class order

The `template` property may be used to (apparently) add content to a slide incrementally, like bullet lists appearing a bullet at a time.

Using only two dashes (--) to separate slides implicitly uses the preceding slide as a template:

```markdown
# Agenda

--
1. Introduction

--
2. Markdown formatting
```

Template slides may also contain a special `{{content}}` expression to explicitly position the content of derived slides, instead of having it implicitly appended.

### layout

The `layout` property either makes the current slide a layout slide, which is omitted from the slideshow and serves as the default template used for all subsequent slides:

```markdown
layout: true

# Section

---

## Sub section 1

---

## Sub section 2
```

Or, when set to false, reverts to using no default template.

Multiple layout slides may be defined throughout the slideshow to define a common template for a series of slides.

## Content Classes

Any occurences of one or more dotted CSS class names followed by square brackets are replaced with the contents of the brackets with the specified classes applied:

    .footnote[.red.bold[*] Important footnote]

Resulting HTML extract:

    <span class="footnote">
      <span class="red bold">*</span> Important footnote
    </span>

Content classes available include `left`, `center` and `right`, which may be used to [[align text blocks|Formatting#text-block-alignment]].

## Syntax Highlighting

Github Flavored Markdown ([GFM](http://github.github.com/github-flavored-markdown/)) fenced code blocks are the preferred way of creating code blocks, easily letting you specify the highlighting language:

<pre>
Code:

```ruby
def add(a,b)
  a + b
end
```</pre>

A default highlighting language may be configured using the [[highlightLanguage|Configuration-Options#wiki-highlighting]] configuration option. Specifying a language on a code block will override the default.

### Line Highlighting

Lines prefixed with `*` will automatically get highlighted with a yellow background, which can be handy for
bringing attention to specific parts of code snippets, i.e.:

<pre>
Implicit return statment:

```ruby
def add(a,b)
*  a + b
end

Notice how there is no return statement.
```</pre>
