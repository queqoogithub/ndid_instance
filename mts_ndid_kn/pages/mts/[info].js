// creden - mts - k'num experiment 
import Link from "next/link";
import { useReducer, useState } from "react";
import Cookies from 'js-cookie';
import { useRouter } from 'next/router'
import CryptoJS from 'crypto-js'

function reducer(state, action) {
    switch (action.type) {
      case "UPDATE_ID_CARD":
        return {
          ...state,
          card_id: action.payload.card_id
        };
      case "UPDATE_NAME":
        return {
          ...state,
          name: action.payload.name
        };
      case "UPDATE_CONTENT":
        return {
          ...state,
          content: action.payload.content
        };
      case "CLEAR":
        return initialState;
      default:
        return state
    }
  }
    
const initialState = {
    card_id: 9999999999999,
    name: "",
    content: "",
}

const User = ({ user_card_id, user_idp_list, user_name }) => {
    const router = useRouter()
    const [state, dispatch] = useReducer(reducer, initialState)
    const [toVerify, setToVerify] = useState('')
    const [testToken, setTestToken] = useState('')
    const [cardId, setCardId] = useState(0)
    const [desiredIpd, setDsiredIdp] = useState('')
    const [updateStatus, setUpdateStatus] = useState('')
    const [pendingTime, setPendingTime] = useState(0);

    const verify = async () => { // user selected one idp
        const response = await fetch("/api/nc_id", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization-Test-Creden": Cookies.get('credenToken'),
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
    
        dispatch({ type: "CLEAR" })
        const pendingUser = await response.json();
        return setToVerify(pendingUser);
    }

    const checkVerificationStatus = async (card_id) => {
        const response = await fetch(`/api/nc_id/${card_id}`);
    
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        try {
          const people = await response.json();
          console.log('Set Update Status => ', people)
          return setUpdateStatus(people);
        } catch (e) {
          console.log('Check Status Error: ', e)
        }
    }

    return (
        <div style={{ margin: "0 auto", maxWidth: "400px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}><p></p>
                <p>😃 User ID <b> {user_card_id} </b> | {user_name} | IdP List :</p>
                <pre>{JSON.stringify(user_idp_list, null, 4)}</pre>
                <label htmlFor="name">Check Verification Status (with ID Card)</label>
                <input
                    type="number"
                    id="card_id"
                    value = {cardId}
                    onChange={(e) => {
                        setCardId(e.target.value)
                        checkVerificationStatus(e.target.value)
                    }}
                />
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
                {/* <label htmlFor="name">ID Card</label>
                <input
                type="number"
                id="card_id"
                value={state.card_id}
                onChange={(e) =>
                    dispatch({
                    type: "UPDATE_ID_CARD",
                    payload: { card_id: e.target.value }
                    })
                }
                />
                <label htmlFor="name">Name</label>
                <input
                type="text"
                id="name"
                value={state.name}
                onChange={(e) =>
                    dispatch({
                    type: "UPDATE_NAME",
                    payload: { name: e.target.value }
                    })
                }
                /> */}
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
    //const response = await fetch(`http://localhost:3000/api/nc_id/${card_id}`)
    const response = await fetch(`http://localhost:8081/users/${card_id}`)
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }
      
    try {
      const userNdidData = await response.json()
      console.log('User NDID Data = ', userNdidData)
      // TODO ... check id_card, name according to Knum 
      if (userNdidData == null) {
        console.log('Do not have user in NDID database')
      } else {
        user_name = userNdidData.data['name']
        user_card_id = userNdidData.data['card_id']
        user_idp_list = userNdidData.data['content']
        console.log('IdP list = ', user_idp_list)
      }
    } catch (e) {
      console.log('Check Status Error: ', e)
    }

    return {
        props: { user_card_id: user_card_id, user_idp_list: user_idp_list, user_name: user_name, }
    }
}

export default User