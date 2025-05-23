import { useState, useEffect, Fragment } from 'react';
import {Link, useParams} from "react-router-dom";
import styles from './styles.module.css';
import axios from 'axios';

const EmailVerify =()=>{
    const [validUrl , setValidUrl] = useState(false);
    const param = useParams();
    useEffect(()=>{
        const verifyEmailUrl = async ()=>{
            try{
                const url = `https://node-service-o256.onrender.com/api/users/${param.id}/verify/${param.token}`;
                const {data} = await axios.get(url)
                console.log(data);
                setValidUrl(true)

            }catch(error){
                console.log(error)
                setValidUrl(false)
            }
        };
        verifyEmailUrl()
    },[param])
    return (
        <Fragment>
            {
                validUrl?(
                    <div className={styles.container}>
                        {/* <img src = {success} alt = "success_img_email_verified" className={styles.success_img}/> */}
                        <h1>Email verified successfully</h1>
                        <Link to = "/login">
                            <button className={styles.green_btn}>Login</button>
                        </Link>
                    </div>
                ):(
                    <h1>404 Not Found</h1>
                )
            }

        </Fragment>
    )
}

export default EmailVerify