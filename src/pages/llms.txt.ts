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
                const textContent = content
                    .replace(/<[^>]*>/g, "")
                    .replace(/\s+/g, " ")
                    .trim();
                return `[${textContent}](${url})`;
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

// 新規: テキストから最初の200文字を返すヘルパー関数
function getSummary(text: string): string {
    const summaryLength = 140;
    const summary = text.replace(/\n+/g, " ").trim();
    return summary.length > summaryLength
        ? summary.slice(0, summaryLength) + "..."
        : summary;
}

// 新規: <Layout title="...">からタイトルを抽出するヘルパー関数
function extractTitle(content: string): string {
    const match = content.match(/<Layout\s+title="([^"]+)"\s*>/);
    return match ? match[1] : "TITLE";
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
            entry.name === "contact.astro"
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

        // テンプレート形式のマークダウン出力
        let markdownContent =
            "# 大阪公立大学合氣道部\n\n> 大阪公立大学合氣道部は大阪公立大学で活動する合気会公認道場、天之武産合氣塾道場所属の体育会部活動です。\n\n2022年の春より、大阪市立大学合気道サークルと大阪府立大学合氣道部が統合し、大阪公立大学合氣道部として活動しています。\n\n## Pages\n\n";

        // 各ファイルの概要をリスト形式で追加
        for (const file of files) {
            const relativePath = path.relative(projectRoot, file);
            const content = await fs.readFile(file, "utf-8");
            const ext = path.extname(file).toLowerCase();

            let fileSummary = "";
            if (ext === ".astro") {
                const extractedText = extractTextFromAstro(content);
                fileSummary = getSummary(extractedText);
            } else {
                fileSummary = getSummary(content);
            }
            // TITLEを<Layout title="...">から取得
            const title = extractTitle(content);
            markdownContent += `- [${title}](${relativePath}): ${fileSummary}\n`;
        }

        // Optionalセクションを追加
        markdownContent +=
            "\n## Optional\n\n- [Site Map Index](https://omu-aikido.com/sitemap-index.xml)\n";

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
