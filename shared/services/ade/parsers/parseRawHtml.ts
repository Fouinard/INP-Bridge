export default function parseRawHtml(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let result = '';
    const chunkSize = 8192;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        result += String.fromCharCode.apply(null, Array.from(chunk));
    }

    return result;
}