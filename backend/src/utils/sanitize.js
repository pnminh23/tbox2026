import sanitizeHtml from 'sanitize-html';

// HTML từ trình soạn thảo: giữ định dạng, bỏ script/event handler
export const sanitizeRichText = (html = '') =>
    sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span', 'u', 's']),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            '*': ['style', 'class'],
            img: ['src', 'alt', 'width', 'height'],
        },
        allowedSchemes: ['http', 'https', 'data'],
    });
