// creden - mts - k'num experiment 
import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { useRouter } from 'next/router'
import CryptoJS from 'crypto-js'

const User = ({ user_card_id, user_idp_list, user_name }) => {
    const router = useRouter()
    const [toVerify, setToVerify] = useState('')
    const [testToken, setTestToken] = useState('')
    const [cardId, setCardId] = useState(0)
    const [desiredIpd, setDsiredIdp] = useState('')
    const [updateStatus, setUpdateStatus] = useState('')
    const [pendingTime, setPendingTime] = useState(0)

    // test :::: Get & Query Cookie
    try {
    const pendingUserCardIdasStr = Cookies.get('pendingUser') // typeof Cookies.get('pendingUser') = string
    const pendingUserCardId = JSON.parse(pendingUserCardIdasStr) // convert text into a JavaScript object
    console.log('Cookie Pending Ref ID: ', pendingUserCardId['ref_id']) 
    } catch (e) { console.log('error when test to query cookies: ', e) }


    // TODO ... Pending Verification
    useEffect(() => {
      console.log('in useEffect !!!')
      if (Cookies.get('pendingUser')) { console.log('the cookies had already set as ', Cookies.get('pendingUser')) }
      if (!Cookies.get('pendingUser')) { console.log('the cookies had NOT already set !!!') }

      const fetchStatusData = async () => {
        try {
          const pendingUserCardIdasStr = Cookies.get('pendingUser') // typeof Cookies.get('pendingUser') = string
          const pendingUserCardId = JSON.parse(pendingUserCardIdasStr)

          let currentDate = new Date()
          console.log('Current time: ', currentDate.getTime() / 1000) 
          console.log('Init time: ', pendingUserCardId['ts'])
          console.log('Counting time: ', (currentDate.getTime() / 1000) - pendingUserCardId['ts'])

          await checkVerificationStatus(pendingUserCardId['ref_id'])
        } catch (e) { console.log('error @fetchStatusData: ', e) }
      }

      if (Cookies.get('pendingUser')) { 
        const interval = setInterval(fetchStatusData, 5000) 
      }
      
    }, [toVerify])

    const verify = async () => { // user selected one idp
        const response = await fetch("/api/nc_id", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization-Test-Creden": Cookies.get('credenToken'), // ตอน dev ให้เอา token คุณหนุ่มไปไว้ฝั่ง server (api) อย่าเอาไว้ฝั่ง client !!!
            "Pending-Verification-Time": pendingTime,
          },
          body: JSON.stringify({
            card_id: user_card_id,
            name: user_name,
            content: desiredIpd,
        })
        })
      
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
    
        const pendingUser = await response.json()
        console.log('pending User ===> ', pendingUser)
        Cookies.set('pendingUser', JSON.stringify(pendingUser))

        return setToVerify(pendingUser)
    }

    const checkVerificationStatus = async (id) => {

        const response = await fetch(`/api/nc_id/${id}`);
    
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        try {
          const people = await response.json()
          console.log('Check & Update Status => ', people)
          setUpdateStatus(people)
          console.log('immediated status = ', people['status'])
          if (people['status'] == 'ok') { // ok = verified
            // TODO ... Link / Redirect to somepage on Creden
            console.log('VERIFIED !!! & DELETE COOKIE')
            Cookies.remove('pendingUser')
            router.push(`/creden`);

          }
        } catch (e) {
          console.log('Check Status Error: ', e)
        }
    }

    return (
        <div style={{ margin: "0 auto", maxWidth: "400px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}><p></p>
                <p>😃 User ID <b> {user_card_id} </b> | {user_name} | IdP List :</p>
                <pre>{JSON.stringify(user_idp_list, null, 4)}</pre>
                <label htmlFor="name">Check Verification Status (Ref ID)</label>
                <input
                    type="number"
                    id="card_id"
                    value = {cardId}
                    onChange={(e) => {
                        setCardId(e.target.value)
                        checkVerificationStatus(e.target.value)
                    }}
                /><p></p>
                {updateStatus ? <pre>{JSON.stringify(updateStatus, null, 4)}</pre> : null}
                <label htmlFor="name">Token to Cookie</label>
                <input
                type="text"
                id="test_token"
                value={testToken}
                onChange={(e) => {
                    setTestToken(e.target.value)
                    Cookies.set('credenToken', e.target.value) 
                    }
                }
                />
                <label htmlFor="name">Pending Verification <b>Test Time</b> (ms.)</label>
                <input
                type="number"
                id="test_pending_time"
                value={pendingTime}
                onChange={(e) => {
                    setPendingTime(e.target.value)
                    }
                }
                /><p></p>
                <label htmlFor="content">Desired IdP</label>
                <input
                type="text"
                id="content"
                value={desiredIpd}
                onChange={(e) => 
                    setDsiredIdp(e.target.value)
                }
                />
            </div>
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
                <button onClick={verify}>VERIFY</button>
            </div>
            {toVerify ? <><p>To verify: </p><pre>{JSON.stringify(toVerify, null, 4)}</pre></> : null}
        </div>
    )
}

export async function getServerSideProps(context) {
    const { info } = await context.params
    console.log('encrypt info from server = ', info)
    const password = 'secure secret key' // TODO ... env
    const decrypt = (crypted, password) => JSON.parse(CryptoJS.AES.decrypt(crypted, password).toString(CryptoJS.enc.Utf8)).content
    const decryptedObject = decrypt(info, password)
    console.log('from server decrypt = ', decryptedObject)
    console.log('card_id from server decrypt = ', decryptedObject.info['card_id'])
    const card_id = decryptedObject.info['card_id']
    var user_idp_list = []
    var user_card_id = 0
    var user_name = ""

    // TODO ... GET idp list -> POST verify (Knum service)
    const response = await fetch(`http://localhost:8081/users/${card_id}`)
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }
      
    try {
      const userNdidData = await response.json()
      // TODO ... check id_card, name according to Knum 
      if (userNdidData == null) {
        console.log('Do not have user in NDID database')
      } else {
        console.log('User NDID Data = ', userNdidData)
        user_name = userNdidData.data['name']
        user_card_id = userNdidData.data['card_id']
        user_idp_list = userNdidData.data['content']
      }
    } catch (e) {
      console.log('Check Status Error: ', e)
    }

    return {
        props: { user_card_id: user_card_id, user_idp_list: user_idp_list, user_name: user_name, }
    }
}

export default User