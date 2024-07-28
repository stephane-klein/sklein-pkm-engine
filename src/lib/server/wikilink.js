import Plugin from "markdown-it-regexp";
import path from "path";

export default () => {
    return Plugin(
        /!?\[\[([^|\]\n]+)(\|([^\]\n]+))?\]\]/,

        function(match) {
            let label;
            let pagePath;
            
            if (match[3]) {
                label = match[3];
                pagePath = match[1];
            } else {
                label = match[1];
                pagePath = match[1];
            }

            if (match[0].substr(0, 1) === "!") {
                if (
                    [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp", ".svg", ".ico"].includes(
                        path.extname(pagePath).toLowerCase()
                    )
                ) {
                    return `<img src="/${pagePath}" />`;
                }
            }

            return `<a href="/${pagePath}/">${label}</a>`
        }
    )
}
