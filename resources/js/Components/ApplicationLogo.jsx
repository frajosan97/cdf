import { Image } from "react-bootstrap";

export default function ApplicationLogo(props) {
    return (
        <Image
            {...props}
            src={"/storage/images/logo.png"}
        />
    );
}
