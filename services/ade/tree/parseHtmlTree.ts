import { parse } from 'node-html-parser';
import { NodeType, ParentNode, ParsedTreeNode } from "./types";

export function parseHtmlTree(html: string): ParsedTreeNode[] {
    const root = parse(html);
    const nodes: ParsedTreeNode[] = [];

    const treeLines = root.querySelectorAll('div.treeline, div.treelineselected');
    const parentStack: ParentNode[] = [];

    for (const line of treeLines) {
        const rawHtml = line.innerHTML;

        const nbspMatches = rawHtml.match(/&nbsp;/g);
        const level = nbspMatches ? Math.floor(nbspMatches.length / 3) : 0;

        const isExpanded = rawHtml.includes('moins.gif');
        const isSelect = rawHtml.includes('blankTree.gif');
        const isSelected = line.classList.contains('treelineselected')

        const links = line.querySelectorAll('a');
        let actionLink = null;
        let href = '';

        for (const a of links) {
            const h = a.getAttribute('href') || '';
            if (h.includes('javascript:')) {
                const text = a.textContent.trim();
                if (text.length > 0) {
                    actionLink = a;
                    href = h;
                    break;
                }
            }
        }

        if (!actionLink) {
            for (const a of links) {
                const h = a.getAttribute('href') || '';
                if (h.includes('openCategory') || h.includes('openBranch') || h.includes('check')) {
                    href = h;
                    break;
                }
            }
        }

        if (!href) continue;

        const funcMatch = href.match(/javascript:([a-zA-Z]+)\(([^)]+)\)/);
        if (!funcMatch) continue;

        const [, funcName, rawArgs] = funcMatch;

        const nodeId = rawArgs.split(',')[0].replace(/['";]/g, '').trim();

        const label = actionLink ? actionLink.textContent.trim() : line.textContent.replace(/&nbsp;/g, '').trim();

        const isSelectable = isSelect || funcName === 'check';

        let type: NodeType = 'branch';
        if (funcName.includes('Category')) {
            type = 'category';
        } else if (isSelectable) {
            type = 'select';
        }

        parentStack.length = level;
        const parents: ParentNode[] = [...parentStack];

        if (type === 'category' || type === 'branch') {
            parentStack[level] = {
                id: nodeId,
                type: type as Extract<NodeType, 'category' | 'branch'>
            };
        }

        nodes.push({
            id: nodeId,
            label,
            type,
            level,
            isExpanded,
            isSelectable,
            isSelected,
            parents
        });
    }

    return nodes;
}