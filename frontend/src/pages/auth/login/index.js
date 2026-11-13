import Head from "next/head";
import React, { Fragment } from "react";
// import WrapperAuth from "~/components/layouts/WrapperAuth";
import FormLogin from "@/components/auth/FormLogin/index";

export default function PageLogin() {
    return (
        <Fragment>
            <Head>
                <title>Đăng nhập</title>
                <meta name="description" content="Đăng nhập" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <FormLogin />
        </Fragment>
    );
}
