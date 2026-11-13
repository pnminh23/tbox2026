import style from "./Footer.module.scss";
import logo from "../../../../public/static/img/logoBOX.svg";
import {
    AiOutlineFacebook,
    AiOutlineInstagram,
    AiOutlineYoutube,
} from "react-icons/ai";
import Image from "next/image";
import Link from "next/link";
import { useAllBranches } from "@/services/branch";
function Footer() {
    const { branches } = useAllBranches();
    return (
        <div className={style.container}>
            <div className="container">
                <div className={style.footer}>
                    <div className={style.logo}>
                        <Image src={logo} alt="logo" />
                    </div>
                    <div className={style.listBranch}>
                        <h3>Hệ thống cơ sở chi nhánh của TBOX </h3>
                        <div className={style.listBranchctn}>
                            <ul>
                                {branches?.map((branch) => (
                                    <li key={branch._id}>{branch.name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className={style.contact}>
                        <h3>Liên hệ</h3>
                        <div className={style.listContact}>
                            <div className={style.ico}>
                                <Link href="#">
                                    <AiOutlineFacebook />
                                </Link>
                            </div>
                            <div className={style.ico}>
                                <Link href="#">
                                    <AiOutlineInstagram />
                                </Link>
                            </div>
                            <div className={style.ico}>
                                <Link href="#">
                                    <AiOutlineYoutube />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Footer;
