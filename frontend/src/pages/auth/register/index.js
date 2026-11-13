import PageHead from "@/components/common/PageHead/PageHead";
import React, { Fragment } from "react";
// import WrapperAuth from "~/components/layouts/WrapperAuth";
import FormRegister from "@/components/auth/FormRegister/index";

export default function PageLogin() {
    return (
        <Fragment>
            <PageHead title="Đăng ký" />

            <FormRegister />
        </Fragment>
    );
}
