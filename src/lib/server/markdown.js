import path from "path";
import MarkdownIt from "markdown-it";
import wikirefs_plugin from "markdown-it-wikirefs";
import * as wikirefs from "wikirefs";
import { hashtag, spanHashAndTag } from "@fedify/markdown-it-hashtag";

const md = new MarkdownIt()
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
