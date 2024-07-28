import MarkdownIt from "markdown-it";
import wikirefs_plugin from "markdown-it-wikirefs";
import { hashtag, spanHashAndTag } from "@fedify/markdown-it-hashtag";
import hljs from "highlight.js";

const md = new MarkdownIt({
    html: true,
    linkify: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value;
            } catch (__) {}
        }

        return "";
    }
})
md.use(
    wikirefs_plugin,
    {
        resolveHtmlHref: (_env, fname) => {
            return '/' + fname.trim();
        },
        resolveHtmlText: (_env, fname) => fname.replace(/-/g, ' '),
        resolveEmbedContent: (_env, fname) => fname + ' content',
    }
);
md.use(
    hashtag,
    {
        link: (tag) => `/tags/${tag.substring(1)}`,
        linkAttributes: () => ({ class: "hashtag" }),
        label: spanHashAndTag,
    }
);

export default md;
