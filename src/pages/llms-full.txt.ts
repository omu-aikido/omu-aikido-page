import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";

// 処理対象の拡張子を定義
const EXTENSIONS_TO_PROCESS = [".astro", ".md", ".mdx", ".txt"];

// Astroファイルからフロントマターとスクリプト、スタイルを除去してテキストのみを抽出し、HTMLをMarkdownに変換する関数
function extractTextFromAstro(content: string): string {
    const withoutFrontmatter = content.replace(/---[\s\S]*?---/, "");
    const withoutScripts = withoutFrontmatter.replace(
        /<script[\s\S]*?<\/script>/g,
        ""
    );
    const withoutStyles = withoutScripts.replace(
        /<style[\s\S]*?<\/style>/g,
        ""
    );

    // HTMLタグをMarkdownに変換
    let markdownText = withoutStyles
        .replace(/\n/g, "")
        .replace(/\s{2,}/g, " ")
        .replace(
            /<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a[^>]*>/g,
            (match, url, content) => {
                const BASE_URL: string = "https://omu-aikido.com";
                const textContent = content
                    .replace(/<[^>]*>/g, "")
                    .replace(/\s+/g, " ")
                    .trim();
                return `[${textContent}](${new URL(url, BASE_URL).toString()})`;
            }
        )
        .replace(/<h1[^>]*>(.*?)<\/h1>/g, "\n# $1")
        .replace(/<h2[^>]*>(.*?)<\/h2>/g, "\n## $1")
        .replace(/<h3[^>]*>(.*?)<\/h3>/g, "\n### $1")
        .replace(/<h4[^>]*>(.*?)<\/h4>/g, "\n#### $1")
        .replace(/<h5[^>]*>(.*?)<\/h5>/g, "\n##### $1")
        .replace(/<h6[^>]*>(.*?)<\/h6>/g, "\n###### $1")
        .replace(/<strong[^>]*>(.*?)<\/strong>/g, "**$1**")
        .replace(/<b[^>]*>(.*?)<\/b>/g, "**$1**")
        .replace(/<em[^>]*>(.*?)<\/em>/g, "*$1*")
        .replace(/<i[^>]*>(.*?)<\/i>/g, "*$1*")
        .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (_, content) => {
            return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, "\n- $1\n");
        })
        .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/g, (_, content) => {
            let index = 1;
            return content.replace(
                /<li[^>]*>([\s\S]*?)<\/li>/g,
                () => `${index++}. $1\n`
            );
        })
        .replace(/<code[^>]*>(.*?)<\/code>/g, "\n`$1`")
        .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, "\n```\n$1\n```")
        .replace(/<form[^>]*>[\s\S]*?<\/form>/g, "")
        .replace(/<button[^>]*>(.*?)<\/button>/g, "\n$1")
        .replace(
            /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/g,
            "\n![$2]($1)"
        )
        .replace(/<img[^>]*src="([^"]*)"[^>]*>/g, "\n![]($1)")
        .replace(/<table[^>]*>([\s\S]*?)<\/table>/g, (tableContent) => {
            const rows = tableContent.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
            let markdownTable = "\n";
            let headerProcessed = false;

            for (const row of rows) {
                const isHeaderRow = /<th[^>]*>/.test(row);
                const cells =
                    row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g) || [];
                const processedCells = cells
                    .map((cell: any) => {
                        return (
                            "| " +
                            cell
                                .replace(
                                    /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g,
                                    "$1"
                                )
                                .trim() +
                            " "
                        );
                    })
                    .join("");

                markdownTable += processedCells + "|\n";
                if (isHeaderRow && !headerProcessed) {
                    markdownTable += cells.map(() => "| --- ").join("") + "|\n";
                    headerProcessed = true;
                }
            }

            return markdownTable;
        })
        .replace(/^\s*\|\s*$/gm, "")
        .replace(/<[^>]*>/g, "\n\n");

    const trimmedText = markdownText
        .split("\n")
        .map((line) => line.trim())
        .join("\n")
        .trim();

    return trimmedText.replace(/\n{2,}/g, "\n\n");
}

// ディレクトリを再帰的に走査してファイルを収集する関数
async function collectFiles(
    dir: string,
    basePath: string,
    result: string[] = []
): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // node_modules, .git, publicディレクトリはスキップ
        if (
            entry.name === "node_modules" ||
            entry.name === ".git" ||
            entry.name === "public" ||
            entry.name === "components" ||
            entry.name === "styles" ||
            entry.name === "layouts" ||
            entry.name === "contact.astro" ||
            entry.name === "news.astro"
        ) {
            continue;
        }

        if (entry.isDirectory()) {
            await collectFiles(fullPath, basePath, result);
        } else {
            const ext = path.extname(entry.name).toLowerCase();
            if (EXTENSIONS_TO_PROCESS.includes(ext)) {
                result.push(fullPath);
            }
        }
    }

    return result;
}

export const GET: APIRoute = async () => {
    const projectRoot = process.cwd();
    const srcDir = path.join(projectRoot, "src");

    try {
        // ファイルパスのリストを取得
        const files = await collectFiles(srcDir, projectRoot);

        let markdownContent = "# Contents\n\n---";

        // 各ファイルの内容を処理
        for (const file of files) {
            const relativePath = path
                .relative(projectRoot, file)
                .replace("src/pages/", "").replace(".astro", "");
            const BASE_URL: string = "https://omu-aikido.com";
            const absoluteUrl: URL = new URL(relativePath, BASE_URL); // 型付きで検証
            const content = await fs.readFile(file, "utf-8");
            const ext = path.extname(file).toLowerCase();

            markdownContent += `# ${absoluteUrl.toString()}\n\n`;

            if (ext === ".astro") {
                const extractedText = extractTextFromAstro(content);
                markdownContent += extractedText + "\n\n";
            } else {
                // その他のファイルはそのまま追加
                markdownContent += content + "\n\n";
            }

            markdownContent += "---\n\n";
        }

        return new Response(markdownContent, {
            headers: {
                "Content-Type": "text/markdown; charset=utf-8",
            },
        });
    } catch (error) {
        console.error("Error generating content:", error);
        return new Response(`Error generating content: ${error}`, {
            status: 500,
            headers: {
                "Content-Type": "text/plain",
            },
        });
    }
};
