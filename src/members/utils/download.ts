/**
 * Browser download of a file with given content.
 * The content is created in the browser and then downloaded using a temporary link.
 * @param filename
 * @param content
 * @param mimeType
 */
export const download = (filename: string, content: string, mimeType = 'application/xml') => {
    var element = document.createElement('a');
    element.setAttribute('href', `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
};
