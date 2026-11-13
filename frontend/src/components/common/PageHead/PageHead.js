import Head from 'next/head';

const SITE = 'PNM - BOX';
const DEFAULT_DESCRIPTION = 'PNM - BOX: cafe phim phòng riêng, đặt phòng xem phim online nhanh chóng.';

// <head> dùng chung cho mọi trang
const PageHead = ({ title, description = DEFAULT_DESCRIPTION }) => (
    <Head>
        <title>{title ? `${title} | ${SITE}` : SITE}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
    </Head>
);

export default PageHead;
