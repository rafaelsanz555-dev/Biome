import { Node, mergeAttributes } from '@tiptap/core'

/**
 * PullQuote — un "big quote" dramático estilo editorial.
 * A diferencia de blockquote (cita estándar), PullQuote es un bloque
 * de énfasis grande con comillas ornamentales.
 *
 * Markup en JSON:
 *   { type: 'pullQuote', content: [{ type: 'text', text: '...' }] }
 */
export const PullQuote = Node.create({
    name: 'pullQuote',
    group: 'block',
    content: 'inline*',
    defining: true,

    parseHTML() {
        return [{ tag: 'blockquote[data-type="pull-quote"]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'blockquote',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'pull-quote',
                class: 'bio-pullquote',
            }),
            0,
        ]
    },

    addCommands() {
        return {
            togglePullQuote:
                () =>
                ({ commands }: any) => {
                    return commands.toggleWrap(this.name)
                },
        } as any
    },
})
