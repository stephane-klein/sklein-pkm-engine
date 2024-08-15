export default function debounce(node, { duration = 300 } = {}) {
    let timeout;

    const handler = (event) => {
        clearTimeout(timeout);
        timeout = setTimeout(
            () => {
                node.dispatchEvent(
                    new CustomEvent('debounced', { detail: event }))
            },
            duration
        );
    };

    node.addEventListener('input', handler);

    return {
        destroy() {
            clearTimeout(timeout);
            node.removeEventListener('input', handler);
        },
    };
}
