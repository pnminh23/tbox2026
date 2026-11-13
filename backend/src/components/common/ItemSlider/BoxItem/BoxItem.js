import style from './BoxItem.module.scss';
import Image from 'next/image';
import noImage from '@public/static/img/avatar/no_image.jpg';

const BoxItem = ({ box }) => {
    console.log('box: ', box);
    return (
        <div className={style.item}>
            <div className={style.image}>
                <Image src={box.image || noImage} alt={'image'} fill objectFit="cover" sizes="100vw" />
            </div>
            <div className={style.content}>
                <h5>{`${box.type.name} - ${box.name}`}</h5>
            </div>
            <div className={style.icon}>
                <Image src="/favicon.ico" alt="Favicon" width={32} height={32} layout="responsive" />
            </div>
        </div>
    );
};
export default BoxItem;
