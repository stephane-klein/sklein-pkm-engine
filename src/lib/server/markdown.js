import MarkdownIt from "markdown-it";
import { hashtag, spanHashAndTag } from "@fedify/markdown-it-hashtag";
import hljs from "highlight.js";
import lazy_loading from "markdown-it-image-lazy-loading";
import WikiLinkPlugin from "./wikilink.js";
import MarkdownItCallout from "markdown-it-callouts";
import markdownItAttrs from "markdown-it-attrs";

const md = new MarkdownIt({
    html: true,
    linkify: true,
    highlight: function(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value;
            } catch (e) {
                console.log(e);
            }
        }

        return "";
    }
});
md.use(WikiLinkPlugin());
md.use(
    markdownItAttrs,
    {
        leftDelimiter: '{',
        rightDelimiter: '}',
        allowedAttributes: []
    }
);
md.use(
    MarkdownItCallout,
    {
        defaultElementType: "blockquote"
    }
);

md.renderer.rules.callout_open = function() {
    return `<blockquote class="callout-quote">\n<div>\n`;
};

md.renderer.rules.callout_close = function() {
    return `</div>\n</blockquote>\n`;
};

md.use(
    hashtag,
    {
        link: (tag) => `/search/?tags=${tag.substring(1)}`,
        linkAttributes: () => ({ class: "hashtag" }),
        label: spanHashAndTag,
    }
);
md.use(lazy_loading);

export default md;
