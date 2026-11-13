import ForgotPassword from '@/components/auth/ForgotPassword/ForgotPassword';
import Head from 'next/head';
import React, { Fragment } from 'react';
// import WrapperAuth from "~/components/layouts/WrapperAuth";

export default function PageForgotPassword() {
    return (
        <Fragment>
            <Head>
                <title>Quên mật khẩu</title>
                <meta name="description" content="Đăng nhập" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <ForgotPassword />
        </Fragment>
    );
}
