export const useStyleClass = (props, style) => {
    let styleProps = [];

    for (let i in props) {
        styleProps.push(i);
    }

    const convert = styleProps.map((item) => {
        if (style[item] !== undefined) {
            return { [style[item]]: !!props[item] };
        }
    });

    return convert;
};
