import Link from 'next/link';
import style from './Title.module.scss';

const Title = ({ children, href }) => {
    return (
        <div className={style.title}>
            {href ? (
                <Link href={href} className={style.link}>
                    <h1>{children}</h1>
                </Link>
            ) : (
                <h1>{children}</h1>
            )}
        </div>
    );
};

export default Title;
