import ForgotPassword from '@/components/auth/ForgotPassword/ForgotPassword';
import PageHead from '@/components/common/PageHead/PageHead';
import React, { Fragment } from 'react';
// import WrapperAuth from "~/components/layouts/WrapperAuth";

export default function PageForgotPassword() {
    return (
        <Fragment>
            <PageHead title="Quên mật khẩu" />

            <ForgotPassword />
        </Fragment>
    );
}
