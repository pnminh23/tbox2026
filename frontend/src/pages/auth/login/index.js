import PageHead from "@/components/common/PageHead/PageHead";
import React, { Fragment } from "react";
// import WrapperAuth from "~/components/layouts/WrapperAuth";
import FormLogin from "@/components/auth/FormLogin/index";

export default function PageLogin() {
    return (
        <Fragment>
            <PageHead title="Đăng nhập" />

            <FormLogin />
        </Fragment>
    );
}
