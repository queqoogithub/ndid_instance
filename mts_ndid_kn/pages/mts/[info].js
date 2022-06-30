// to implement 
import { useRouter } from 'next/router';
import CryptoJS from 'crypto-js'

const User = ({ user }) => {
    const router = useRouter();

    return (
        <div>
            <p>GG</p>
            <pre>{JSON.stringify(user, null, 4)}</pre>
        </div>
    );
}

export async function getServerSideProps(context) {
    const { info } = context.params;
    console.log('encrypt info from server = ', info)
    const password = 'secure secret key'; // TODO ... env
    const decrypt = (crypted, password) => JSON.parse(CryptoJS.AES.decrypt(crypted, password).toString(CryptoJS.enc.Utf8)).content
    const decryptedObject = decrypt(info, password)
    console.log('from server decrypt = ', decryptedObject)
    
    return {
        props: { user: info }
    };
}

export default User;