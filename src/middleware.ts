import { defineMiddleware } from 'astro:middleware';
import { legacyToClean } from './data/url-map';

const movedAssetRedirects: Record<string, string> = {
  '/epb-l_english.pdf': '/downloads/Automotive3_2/EPB%203_2_6/EPB-L_English.pdf',
};

const removedPageRedirects: Record<string, string> = {
  '/support/training': '/support',
  '/support/download-literature': '/support',
};

function withTrailingSlash(path: string): string {
  if (path === '/' || path.endsWith('/')) return path;
  return `${path}/`;
}

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = new URL(context.request.url);

  const movedAssetRedirect = movedAssetRedirects[pathname.toLowerCase()];
  if (movedAssetRedirect) {
    return context.redirect(movedAssetRedirect, 301);
  }

  const normalizedPath = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  const removedPageRedirect = removedPageRedirects[normalizedPath.toLowerCase()];
  if (removedPageRedirect) {
    return context.redirect(withTrailingSlash(removedPageRedirect), 301);
  }

  if (pathname.toLowerCase().endsWith('.aspx')) {
    return context.redirect(withTrailingSlash(legacyToClean(pathname)), 301);
  }

  return next();
});
